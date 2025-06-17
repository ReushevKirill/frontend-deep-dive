export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number = 1000
): (...args: Parameters<T>) => void {
	let timerId: ReturnType<typeof setTimeout>

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		const context = this

		clearTimeout(timerId)

		timerId = setTimeout(() => {
			func.apply(context, args)
		}, delay)
	}
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	delay: number = 1000
): (...args: Parameters<T>) => void {
	let isInCooldown = false
	let savedArgs: Parameters<T> | null = null
	let savedThis: ThisParameterType<T> | null = null

	return function wrapper(this: ThisParameterType<T>, ...args: Parameters<T>) {
		if (isInCooldown) {
			savedArgs = args
			savedThis = this
			return
		}

		func.apply(this, args)
		isInCooldown = true

		setTimeout(() => {
			isInCooldown = false
			if (savedArgs) {
				wrapper.apply(savedThis!, savedArgs)
				savedArgs = savedThis = null
			}
		}, delay)
	}
}

export function cloneDeep(value: unknown) {
	// TODO: cloneDeep
}
