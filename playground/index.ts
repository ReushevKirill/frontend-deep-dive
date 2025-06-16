// playground/index.ts
import { debounce, throttle } from '@my-lab/utils';

// --- Находим все элементы ---
const defaultContainer = document.getElementById('default-container')!;
const defaultCounter = document.getElementById('default-counter')!;

const debounceContainer = document.getElementById('debounce-container')!;
const debounceCounter = document.getElementById('debounce-counter')!;

const throttleContainer = document.getElementById('throttle-container')!;
const throttleCounter = document.getElementById('throttle-counter')!;

// --- Функции для обновления счетчиков ---
let defaultCount = 0;
const updateDefault = () => {
  defaultCount++;
  defaultCounter.textContent = String(defaultCount);
};

let debounceCount = 0;
const updateDebounce = () => {
  debounceCount++;
  debounceCounter.textContent = String(debounceCount);
};

let throttleCount = 0;
const updateThrottle = () => {
  throttleCount++;
  throttleCounter.textContent = String(throttleCount);
};

// --- Применяем магию ---

// 1. Обычное событие
defaultContainer.addEventListener('mousemove', updateDefault);

// 2. Debounce
// Создаем "задебаунсенную" версию нашей функции
const debouncedUpdate = debounce(updateDebounce, 500);
debounceContainer.addEventListener('mousemove', debouncedUpdate);

// 3. Throttle
// Создаем "затроттленную" версию нашей функции
const throttledUpdate = throttle(updateThrottle, 500);
throttleContainer.addEventListener('mousemove', throttledUpdate);
