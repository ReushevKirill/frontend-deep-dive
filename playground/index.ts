// playground/index.ts
import { EventEmitter } from '@my-lab/event-emitter';

// Находим наши HTML-элементы
const onBtn = document.getElementById('onBtn')!;
const offBtn = document.getElementById('offBtn')!;
const emitBtn = document.getElementById('emitBtn')!;
const onceBtn = document.getElementById('onceBtn')!;
const logDiv = document.getElementById('log')!;

// Создаем экземпляр нашего эмиттера
const emitter = EventEmitter.getInstance();

const log = (message: string) => {
  logDiv.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`;
};

// --- Логика для кнопок ---
const onTestEvent = (data: any) => {
  log(`Сработало событие 'test-event'! Получены данные: ${data}`);
};

let unsubscribe: (() => void) | null = null;

onBtn.addEventListener('click', () => {
  log("Подписываемся на 'test-event'...");
  // Используем фичу возврата функции отписки
  unsubscribe = emitter.on('test-event', onTestEvent);
  onBtn.disabled = true;
  offBtn.disabled = false;
});

offBtn.addEventListener('click', () => {
  if (unsubscribe) {
    log("Отписываемся от 'test-event'...");
    unsubscribe(); // Вызываем функцию отписки
    unsubscribe = null;
    onBtn.disabled = false;
    offBtn.disabled = true;
  }
});

emitBtn.addEventListener('click', () => {
  const randomNumber = Math.round(Math.random() * 100);
  log(`Эмитируем 'test-event' с числом ${randomNumber}...`);
  emitter.emit('test-event', randomNumber);
});

onceBtn.addEventListener('click', () => {
  log("Подписываемся на ОДИН 'test-event'...");
  emitter.once('test-event', (data) => {
    log(`🔥 Сработало ONCE событие! Данные: ${data}. Больше не сработает.`);
  });
});
