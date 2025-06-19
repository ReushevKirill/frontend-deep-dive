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

function isPrimitive(value: unknown) {
  return typeof value !== 'object' && typeof value !== "function"
}

function isObject(value: unknown): value is Object {
  return typeof value === 'object' && typeof value !== 'function'
}

function isComplexObject(value: any) {
  return typeof value === 'function' || 'constructor' in value || (value as any) instanceof Element
}

function cloneDeepInner<T = unknown>(value: T, visited: Set<T>) {
  if (visited.has(value)) {
    return
  }

	if (isPrimitive(value) || isComplexObject(value)) {
		return value
	}

	if (Array.isArray(value)) {
    const copy: unknown[] = []

    value.forEach(v => {
      let copiedValue = cloneDeep(v)
      copy.push(copiedValue)
    })

    return copy
  }

  if (isObject(value)) {
    const copy = {} as Record<string, any>

    Object.entries(value).forEach(([k, v]) => {
      if (v === value) {
        visited.add(v)
        return
      }

      let copiedValue = cloneDeep(v)
      copy[k] = copiedValue
    })

    return copy
  }
}

function cloneDeep<T = unknown>(value: T) {
  return cloneDeepInner(value, new Set())
}
