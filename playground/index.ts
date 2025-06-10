// playground/index.ts

// Убедись, что импорт правильный (если мы на ESM)
import { MyPromise } from '@my-lab/promise';

console.log('🚀 Playground started! Testing MyPromise.all...');

// --- Тестовые промисы-помощники ---

// Промис, который успешно зарезолвится через время
const createSuccessPromise = <T>(value: T, delay: number) =>
  new MyPromise<T>(resolve => setTimeout(() => resolve(value), delay));

// Промис, который упадет через время
const createFailurePromise = <T>(reason: T, delay: number) =>
  new MyPromise<never>((_, reject) => setTimeout(() => reject(reason), delay));


// --- Кейс 1: Все промисы успешны ---
console.log('\n--- Case 1: All promises succeed ---');

const case1Promises = [
  createSuccessPromise('✅ First', 1000),
  createSuccessPromise('✅ Second', 500), // Этот выполнится раньше
  42, // Простое значение
  Promise.resolve('✅ Native Promise'), // Нативный промис для проверки совместимости
];

MyPromise.all(case1Promises)
  .then(results => {
    console.log('Case 1 Success:', results);
    // Ожидаем: ['✅ First', '✅ Second', 42, '✅ Native Promise']
    // Порядок должен сохраниться!
  })
  .catch(err => {
    console.error('Case 1 Failed (unexpected):', err);
  });


// --- Кейс 2: Один из промисов падает ---
console.log('\n--- Case 2: One promise fails ---');

const case2Promises = [
  createSuccessPromise('✅ Success 1', 800),
  createFailurePromise('❌ ERROR!', 400), // Этот упадет раньше, чем первый выполнится
  createSuccessPromise('✅ Success 2', 1200), // Этот даже не успеет зарезолвиться
];

MyPromise.all(case2Promises)
  .then(results => {
    console.log('Case 2 Success (unexpected):', results);
  })
  .catch(err => {
    console.error('Case 2 Failed:', err);
    // Ожидаем: '❌ ERROR!'
  });


// --- Кейс 3: Пустой массив ---
console.log('\n--- Case 3: Empty array ---');

MyPromise.all([])
  .then(results => {
    console.log('Case 3 Success:', results);
    // Ожидаем: []
  })
  .catch(err => {
    console.error('Case 3 Failed (unexpected):', err);
  });


// --- Кейс 4: Массив только со значениями (не промисами) ---
console.log('\n--- Case 4: Array of values only ---');

MyPromise.all([1, 'hello', true])
  .then(results => {
    console.log('Case 4 Success:', results);
    // Ожидаем: [1, 'hello', true]
  })
  .catch(err => {
    console.error('Case 4 Failed (unexpected):', err);
  });
