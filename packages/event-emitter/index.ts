type Listener = (...args: any[]) => void
type Events = {
  [key: string]: Listener[]
}

class EventEmitter {
  private events: Events = {}

  private unsubscribeHandler = (eventName: string, callback: () => any) => {
    this.events[eventName] = this.events[eventName].filter(c => c !== callback)
  }

  on<T = unknown>(eventName: string, callback: () => T) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
      this.events[eventName].push(callback)
    }

    return () => {
      this.unsubscribeHandler(eventName, callback)
    }
  }

  off(eventName: string, callback: () => any) {
    if (!this.events[eventName]) return
    this.unsubscribeHandler(eventName, callback)
  }

  emit<T = (unknown | unknown[])>(eventName: string, ...args: T[]) {
    if (!this.events[eventName]) return
    const copyEvents = [...this.events[eventName]]
    copyEvents.forEach(callback => callback(...args))
  }

  once(eventName: string, callback: () => any) {
    const onceWrapper = () => {
      this.off(eventName, onceWrapper)
      callback()
    }

    this.on(eventName, onceWrapper)
  }
}
