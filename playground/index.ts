import { Q } from '@my-lab/query-selector';

console.log('🚀 Q Playground Loaded!');

// --- Находим элементы ---
const container = Q('.container');
const actionBtn = Q('#actionBtn');
const logDiv = document.querySelector('#log-div'); // Найдем нативный элемент для логов

function log(message: string) {
  if (logDiv) {
    logDiv.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
  }
  console.log(message);
}

// === ТЕСТ 1: DOM-манипуляции и чейнинг ===
log('--- Test 1: DOM Manipulation ---');
container
  .addClass('main-container')
  .css('border', '2px solid steelblue')
  .css('border-radius', '8px');


// === ТЕСТ 2: Делегирование DOM-событий ===
log('\n--- Test 2: DOM Event Delegation ---');
log("Подписываемся на клики по элементам с классом '.box'");

function handleBoxClick(this: HTMLElement, event: Event) {
  // `this` здесь должен быть элементом, на который кликнули!
  log(`Клик! event.target: ${ (event.target as HTMLElement).tagName }, this: ${this.tagName} (id: ${this.id})`);
  this.classList.toggle('clicked');
}

// Подписываемся на клики внутри .container, но только на элементы .box
const boxes = Q('.box');
boxes.on('click', handleBoxClick);


// === ТЕСТ 3: Отписка от DOM-событий ===
log('\n--- Test 3: Unsubscribing from DOM Events ---');

actionBtn.on('click', () => {
  log("Отписываемся от кликов по '.box'...");
  boxes.off('click', handleBoxClick);
  log("Теперь клики по боксам не должны работать. Проверь!");
  
  // Чтобы кнопка сработала один раз
  actionBtn.off('click', arguments.callee); // Старый, но рабочий трюк
  (actionBtn.elements[0] as HTMLElement).style.opacity = '0.5';
  (actionBtn.elements[0] as HTMLElement).textContent = 'Отписались!';
});


// === ТЕСТ 4: Кастомные события ===
log('\n--- Test 4: Custom Events with EventEmitter ---');

const dataStore = Q('#data-store'); // Возьмем любой элемент как шину

// Подписываемся на кастомное событие
dataStore.on('data-loaded', (payload) => {
  log(`🔥 Кастомное событие 'data-loaded' поймано!`);
  log(`   Данные: ${JSON.stringify(payload)}`);
});

// Эмулируем асинхронную загрузку данных
log("Эмуляция загрузки данных... (2 секунды)");
setTimeout(() => {
  log("Данные 'загружены'! Эмитируем событие 'data-loaded'...");
  const fakeData = { userId: 42, products: ['apples', 'bananas'] };
  dataStore.emit('data-loaded', fakeData);
}, 2000);
