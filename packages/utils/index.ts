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
  return typeof value === 'object' && value !== null;
}

function cloneDeepInner<T>(value: T, visited: Map<object, T>): T {
  // 1. Если значение не является объектом (примитив, функция), просто возвращаем его.
  if (!isCloneable(value)) {
    return value;
  }
  
  // 2. Проверяем, не сталкивались ли мы уже с этим объектом/массивом
  if (visited.has(value)) {
    // Если да, возвращаем уже созданную для него копию, чтобы замкнуть цикл.
    return visited.get(value)!;
  }

  // 3. Обрабатываем массивы
  if (Array.isArray(value)) {
    // Создаем пустую копию и сразу же сохраняем ее в Map.
    // Это важно сделать ДО рекурсивных вызовов.
    const copy: any[] = [];
    visited.set(value, copy as T);
    
    // Рекурсивно копируем каждый элемент
    for (const item of value) {
      copy.push(cloneDeepInner(item, visited));
    }
    
    return copy as T;
  }

  // 4. Обрабатываем объекты (здесь value уже точно объект)
  const copy: Record<string, any> = {};
  // Сохраняем ссылку на пустую копию ДО рекурсии
  visited.set(value, copy as T);

  // Рекурсивно копируем каждое свойство
  for (const key of Object.keys(value)) {
    copy[key] = cloneDeepInner((value as any)[key], visited);
  }

  return copy as T;
}

/**
 * Создает глубокую копию значения.
 * @param value Значение для копирования.
 * @returns Глубокая копия значения.
 */
export function cloneDeep<T>(value: T): T {
  // Для управления циклическими ссылками используем Map
  return cloneDeepInner(value, new Map());
}
