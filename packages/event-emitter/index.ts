type Listener = (...args: any[]) => void
type Events = {
	[key: string]: Listener[]
}

class EventEmitter {
	private events: Events = {}

	on(eventName: string, callback: Listener) {
		if (!this.events[eventName]) {
			this.events[eventName] = []
		}

		this.events[eventName].push(callback)

		return () => this.off(eventName, callback)
	}

	off(eventName: string, callback: Listener) {
		if (!this.events[eventName]) return
		this.events[eventName] = this.events[eventName].filter(c => c !== callback)
	}

	emit(eventName: string, ...args: any[]) {
		if (!this.events[eventName]) return
		const copyEvents = [...this.events[eventName]]
		copyEvents.forEach(callback => callback(...args))
	}

	once(eventName: string, callback: Listener) {
		const onceWrapper = (...args: any[]) => {
			this.off(eventName, onceWrapper)
			callback(...args)
		}

		this.on(eventName, onceWrapper)
	}
}
