import { EventEmitter, Listener } from '@my-lab/event-emitter'

type EventHandler = (event: Event) => void
type HandlersMap = {
	[eventName: string]: Map<Function, EventHandler>
}

const DOM_EVENTS = new Set([
	'click',
	'dblclick',
	'mousedown',
	'mouseup',
	'mouseover',
	'mouseout',
	'mousemove',
	'keydown',
	'keyup',
	'keypress',
	'submit',
	'focus',
	'blur',
	'change',
])

class QWrapper {
	private elements: NodeListOf<Element>
	private selector: string
	private domHandlers: HandlersMap = {}

	private customEmitter: EventEmitter = new EventEmitter()

	constructor(selector: string) {
		this.elements = document.querySelectorAll(selector)
		this.selector = selector
	}

	private forEach(callback: (element: Element) => void): void {
		this.elements.forEach(callback)
	}

	addClass(className: string): this {
		this.forEach(el => {
			if (!el.classList.contains(className)) {
				el.classList.add(className)
			}
		})
		return this
	}

	removeClass(className: string): this {
		this.forEach(el => {
			el.classList.remove(className)
		})
		return this
	}

	public on(eventName: string, handler: Listener): this {
		if (DOM_EVENTS.has(eventName)) {
			if (!this.domHandlers[eventName]) {
				this.domHandlers[eventName] = new Map()
			}
			const boundHandler = (event: Event) => {
				const target = event.target as HTMLElement
				const closestElement = target.closest(this.selector)
				if (closestElement) {
					handler.call(closestElement, event)
				}
			}
			this.domHandlers[eventName].set(handler, boundHandler)
			document.addEventListener(eventName, boundHandler)
		} else {
			this.customEmitter.on(eventName, handler)
		}
		return this
	}

	public off(eventName: string, handler: Listener): this {
		if (DOM_EVENTS.has(eventName)) {
			const handlers = this.domHandlers[eventName]
			if (handlers && handlers.has(handler)) {
				document.removeEventListener(eventName, handlers.get(handler)!)
				handlers.delete(handler)
			}
		} else {
			this.customEmitter.off(eventName, handler)
		}
		return this
	}

	public emit(eventName: string, ...args: any[]): this {
		this.customEmitter.emit(eventName, ...args)
		return this
	}

	css(prop: string, value: string): this {
		this.forEach(el => {
			if (el instanceof HTMLElement) {
				;(el.style as any)[prop] = value
			}
		})

		return this
	}
}

export function Q(selector: string): QWrapper {
	return new QWrapper(selector)
}
