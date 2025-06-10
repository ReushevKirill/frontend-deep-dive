// playground/index.ts

// Убедись, что импорт правильный (если мы на ESM)
import { MyPromise } from '@my-lab/promise'

console.log('🚀 Playground started! Testing MyPromise.all...')

// --- Тестовые промисы-помощники ---

// Промис, который успешно зарезолвится через время
const createSuccessPromise = <T>(value: T, delay: number) =>
	new MyPromise<T>(resolve => setTimeout(() => resolve(value), delay))

// Промис, который упадет через время
const createFailurePromise = <T>(reason: T, delay: number) =>
	new MyPromise<never>((_, reject) => setTimeout(() => reject(reason), delay))

// Добавляем в playground/index.ts

// --- Кейс 5: Тестируем `race` (успешный побеждает) ---
console.log('\n--- Case 5: Race succeeds ---')

const case5Promises = [
	createSuccessPromise('❌ Slower', 1000),
	createSuccessPromise('✅ Faster', 300), // Этот должен победить
	createFailurePromise('❌ Slow fail', 1200),
]

MyPromise.race(case5Promises)
	.then(winner => {
		console.log('Case 5 Winner:', winner)
		// Ожидаем: '✅ Faster'
	})
	.catch(err => {
		console.error('Case 5 Failed (unexpected):', err)
	})

// --- Кейс 6: Тестируем `race` (ошибка побеждает) ---
console.log('\n--- Case 6: Race fails ---')

const case6Promises = [
	createSuccessPromise('❌ Slow success', 800),
	createFailurePromise('✅ Fast fail!', 200), // Этот должен победить
]

MyPromise.race(case6Promises)
	.then(winner => {
		console.log('Case 6 Winner (unexpected):', winner)
	})
	.catch(err => {
		console.error('Case 6 Failed:', err)
		// Ожидаем: '✅ Fast fail!'
	})

// Добавляем в playground/index.ts

// --- Кейс 7: Тестируем `allSettled` ---
console.log('\n--- Case 7: All Settled ---')

const case7Promises = [
	createSuccessPromise('✅ Success', 500),
	createFailurePromise('❌ Failure', 300),
	42, // Простое значение
]

MyPromise.allSettled(case7Promises)
	.then(results => {
		console.log('Case 7 Results:', JSON.stringify(results, null, 2))
		/* Ожидаем примерно такой вывод:
    [
      { "status": "fulfilled", "value": "✅ Success" },
      { "status": "rejected", "reason": "❌ Failure" },
      { "status": "fulfilled", "value": 42 }
    ]
    */
	})
	.catch(err => {
		// Этот блок никогда не должен выполниться
		console.error('Case 7 Failed (unexpected):', err)
	})
