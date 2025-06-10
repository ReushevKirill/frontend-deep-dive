enum PromiseState {
	PENDING = 'pending',
	FULFILLED = 'fulfilled',
	REJECTED = 'rejected',
}

// Тип для executor-функции, чтобы было понятно, что она принимает
type Executor<T> = (
	resolve: (value: T | PromiseLike<T>) => void,
	reject: (reason?: any) => void
) => void

// PromiseLike - это любой объект с методом then. Полезно для совместимости.
interface PromiseLike<T> {
	then<TResult1 = T, TResult2 = never>(
		onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
	): PromiseLike<TResult1 | TResult2>
}

export class MyPromise<T> implements PromiseLike<T> {
	private state: PromiseState = PromiseState.PENDING
	private value?: T
	private reason?: any

	private onFulfilledCallbacks: Array<() => void> = []
	private onRejectedCallbacks: Array<() => void> = []

	constructor(executor: Executor<T>) {
		try {
			executor(this.resolve.bind(this), this.reject.bind(this))
		} catch (error) {
			this.reject(error)
		}
	}

	private resolve(value: T | PromiseLike<T>): void {
		// Разворачиваем "thenable" объекты и другие промисы
		if (
			value instanceof MyPromise ||
			(typeof value === 'object' && value !== null && 'then' in value)
		) {
			try {
				const then = (value as PromiseLike<T>).then
				then.call(value, this.resolve.bind(this), this.reject.bind(this))
			} catch (e) {
				this.reject(e)
			}
			return
		}

		if (this.state === PromiseState.PENDING) {
			this.state = PromiseState.FULFILLED
			this.value = value
			// Выполняем все колбэки, которые были добавлены через .then
			this.onFulfilledCallbacks.forEach(callback => callback())
		}
	}

	private reject(reason?: any): void {
		if (this.state === PromiseState.PENDING) {
			this.state = PromiseState.REJECTED
			this.reason = reason
			this.onRejectedCallbacks.forEach(callback => callback())
		}
	}

	public then<TResult1 = T, TResult2 = never>(
		onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
		onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
	): MyPromise<TResult1 | TResult2> {
		const onFulfilledHandler =
			typeof onFulfilled === 'function'
				? onFulfilled
				: (value: T) => value as unknown as TResult1

		const onRejectedHandler =
			typeof onRejected === 'function'
				? onRejected
				: (reason: any): TResult2 => {
						throw reason
				  }

		// then всегда возвращает новый промис
		const promise2 = new MyPromise<TResult1 | TResult2>((resolve, reject) => {
			const scheduleFulfilled = () => {
				queueMicrotask(() => {
					try {
						const x = onFulfilledHandler(this.value!)
						resolve(x)
					} catch (e) {
						reject(e)
					}
				})
			}

			const scheduleRejected = () => {
				queueMicrotask(() => {
					try {
						const x = onRejectedHandler(this.reason)
						resolve(x)
					} catch (e) {
						reject(e)
					}
				})
			}

			if (this.state === PromiseState.FULFILLED) {
				scheduleFulfilled()
			} else if (this.state === PromiseState.REJECTED) {
				scheduleRejected()
			} else if (this.state === PromiseState.PENDING) {
				this.onFulfilledCallbacks.push(scheduleFulfilled)
				this.onRejectedCallbacks.push(scheduleRejected)
			}
		})

		return promise2
	}

	public catch<TResult = never>(
		onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
	): MyPromise<T | TResult> {
		return this.then(null, onRejected)
	}

	public finally(onFinally?: (() => void) | null): MyPromise<T> {
		return this.then(
			value =>
				MyPromise.resolve(onFinally ? onFinally() : undefined).then(
					() => value
				),
			reason =>
				MyPromise.resolve(onFinally ? onFinally() : undefined).then(() => {
					throw reason
				})
		)
	}

	public static resolve<U>(value: U | PromiseLike<U>): MyPromise<U> {
		if (value instanceof MyPromise) {
			return value
		}
		return new MyPromise<U>(resolve => resolve(value))
	}

	public static reject<U = never>(reason?: any): MyPromise<U> {
		return new MyPromise<U>((_, reject) => reject(reason))
	}

	public static all<T extends readonly unknown[] | []>(
		promises: T
	): MyPromise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
		return new MyPromise((resolve, reject) => {
			if (!Array.isArray(promises)) {
				return reject(new TypeError('Argument is not iterable'))
			}

			if (promises.length === 0) {
				return resolve([] as any)
			}

			const results = new Array(promises.length)
			let resolvedCounter = 0

			promises.forEach((item, idx) => {
				MyPromise.resolve(item).then(
					value => {
						results[idx] = value
						resolvedCounter++
						if (resolvedCounter === promises.length) {
							resolve(results as any)
						}
					},
					reason => reject(reason)
				)
			})
		})
	}
}
