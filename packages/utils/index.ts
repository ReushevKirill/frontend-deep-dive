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

// Хелпер для проверки, является ли значение "клонируемым" объектом или массивом
function isCloneable(value: unknown): value is Record<string, any> | any[] {
	// Должен быть объектом, не null и не функцией
	return typeof value === 'object' && value !== null
}

function cloneDeepInner<T>(value: T, visited: Map<object, T>): T {
	// 1. Если значение не является объектом (примитив, функция), просто возвращаем его.
	if (!isCloneable(value)) {
		return value
	}

	// 2. Проверяем, не сталкивались ли мы уже с этим объектом/массивом
	if (visited.has(value)) {
		// Если да, возвращаем уже созданную для него копию, чтобы замкнуть цикл.
		return visited.get(value)!
	}

	// 3. Обрабатываем массивы
	if (Array.isArray(value)) {
		// Создаем пустую копию и сразу же сохраняем ее в Map.
		// Это важно сделать ДО рекурсивных вызовов.
		const copy: any[] = []
		visited.set(value, copy as T)

		// Рекурсивно копируем каждый элемент
		for (const item of value) {
			copy.push(cloneDeepInner(item, visited))
		}

		return copy as T
	}

	// 4. Обрабатываем объекты (здесь value уже точно объект)
	const copy: Record<string, any> = {}
	// Сохраняем ссылку на пустую копию ДО рекурсии
	visited.set(value, copy as T)

	// Рекурсивно копируем каждое свойство
	for (const key of Object.keys(value)) {
		copy[key] = cloneDeepInner((value as any)[key], visited)
	}

	return copy as T
}

/**
 * Создает глубокую копию значения.
 * @param value Значение для копирования.
 * @returns Глубокая копия значения.
 */
export function cloneDeep<T>(value: T): T {
	// Для управления циклическими ссылками используем Map
	return cloneDeepInner(value, new Map())
}

/**
 * Безопасно извлекает вложенное значение из объекта по строковому или массивному пути.
 * @param obj Исходный объект.
 * @param path Путь к значению (например, 'a.b[0].c' или ['a', 'b', '0', 'c']).
 * @param defaultValue Значение, которое вернется, если путь не найден.
 * @returns Найденное значение или defaultValue.
 */
export function get<T extends object, V>(
	obj: T,
	path: string | string[],
	defaultValue: V
): V | any {
	// Парсинг пути
	const keys = Array.isArray(path)
		? path
		: path
				.replace(/\[(\d+)\]/g, '.$1')
				.split('.')
				.filter(Boolean)
	// Regex, чтобы 'a[0]' превращалось в 'a.0'

	let current: any = obj

	for (const key of keys) {
		// Если `current` не объект (например, null или undefined), путь обрывается.
		if (current === null || typeof current !== 'object') {
			return defaultValue
		}

		// Делаем следующий шаг вглубь
		current = current[key]
	}

	return current === undefined ? defaultValue : current
}

export function myMap<T, U>(
	array: T[],
	callback: (value: T, index: number, array: T[]) => U
): U[] {
	const result: U[] = []
	for (let i = 0; i < array.length; i++) {
		result.push(callback(array[i], i, array))
	}
	return result
}

export function myFilter<T>(
	array: T[],
	callback: (value: T, index: number, array: T[]) => boolean
): T[] {
	const filtered: T[] = []
	for (let i = 0; i < array.length; i++) {
		if (callback(array[i], i, array)) {
			filtered.push(array[i])
		}
	}
	return filtered
}

export function myReduce<T>(
	array: T[],
	callback: (
		accumulator: T,
		currentValue: T,
		currentIndex: number,
		array: T[]
	) => T
): T

export function myReduce<T, U>(
	array: T[],
	callback: (
		accumulator: U,
		currentValue: T,
		currentIndex: number,
		array: T[]
	) => U,
	initialValue: U
): U

export function myReduce<T, U>(
	array: T[],
	callback: (
		accumulator: U | T,
		currentValue: T,
		currentIndex: number,
		array: T[]
	) => U | T,
	initialValue?: U | T
) {
	const hasInitialValue = initialValue !== undefined

	if (!hasInitialValue && array.length === 0) {
		throw new TypeError('Reduce of empty array with no initial value')
	}

	let accumulator: U | T = hasInitialValue ? initialValue : array[0]
	let startIndex = hasInitialValue ? 0 : 1

	for (let i = startIndex; i < array.length; i++) {
		accumulator = callback(accumulator, array[i], i, array)
	}

	return accumulator
}

function mapObject<T extends object, U>(
	obj: T,
	callback: (value: T[keyof T], key: keyof T, obj: T) => U
): U[] {
	const result: U[] = []
	for (const key of Object.keys(obj) as Array<keyof T>) {
		result.push(callback(obj[key], key, obj))
	}
	return result
}

function filterObject<T extends object>(
	obj: T,
	predicate: (value: T[keyof T], key: keyof T, obj: T) => boolean
): Partial<T> {
	const result: Partial<T> = {}

	for (const key of Object.keys(obj) as Array<keyof T>) {
		if (predicate(obj[key], key, obj)) {
			result[key] = obj[key]
		}
	}

	return result
}

// Перегрузка №1: без initialValue. Результат будет типа значения объекта.
function reduceObject<T extends object>(
	obj: T,
	callback: (
		accumulator: T[keyof T],
		value: T[keyof T],
		key: keyof T,
		obj: T
	) => T[keyof T]
): T[keyof T]

// Перегрузка №2: с initialValue. Результат будет типа initialValue.
function reduceObject<T extends object, U>(
	obj: T,
	callback: (accumulator: U, value: T[keyof T], key: keyof T, obj: T) => U,
	initialValue: U
): U

function reduceObject<T extends object, U>(
	obj: T,
	callback: (
		accumulator: U | T[keyof T],
		value: T[keyof T],
		key: keyof T,
		obj: T
	) => U | T[keyof T],
	initialValue?: U
) {
	const keys = Object.keys(obj) as Array<keyof T>
	const hasInitialValue = initialValue !== undefined

	if (!hasInitialValue && keys.length === 0) {
		return undefined
	}

	let accumulator: U | T[keyof T]
	let startIndex = 0

	if (hasInitialValue) {
		accumulator = initialValue!
	} else {
		accumulator = obj[keys[0]]
		startIndex = 1
	}

	for (let i = startIndex; i < keys.length; i++) {
		const key = keys[i]
		accumulator = callback(accumulator, obj[key], key, obj)
	}

	return accumulator
}
