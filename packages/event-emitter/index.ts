export type Listener = (...args: any[]) => void;
export type Events = {
  [eventName: string]: Listener[];
};

export class EventEmitter {
  protected events: Events = {};

  /**
   * Подписаться на событие.
   * @param eventName Имя события.
   * @param callback Колбэк.
   * @returns Функция для отписки.
   */
  public on(eventName: string, callback: Listener): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);

    return () => this.off(eventName, callback);
  }

  /**
   * Отписаться от события.
   * @param eventName Имя события.
   * @param callback Колбэк, который нужно удалить.
   */
  public off(eventName: string, callback: Listener): void {
    const listeners = this.events[eventName];
    if (!listeners) {
      return;
    }

    this.events[eventName] = listeners.filter(
      (listener) => listener !== callback
    );
  }

  /**
   * Сгенерировать событие.
   * @param eventName Имя события.
   * @param args Аргументы для передачи в колбэки.
   */
  public emit(eventName: string, ...args: any[]): void {
    const listeners = this.events[eventName];
    if (!listeners) {
      return;
    }

    // Работаем с копией, чтобы отписка внутри колбэка не ломала цикл
    [...listeners].forEach((callback) => {
      callback(...args);
    });
  }

  /**
   * Подписаться на событие только один раз.
   * @param eventName Имя события.
   * @param callback Колбэк.
   */
  public once(eventName: string, callback: Listener): void {
    const onceWrapper = (...args: any[]) => {
      this.off(eventName, onceWrapper);
      callback(...args);
    };

    this.on(eventName, onceWrapper);
  }
}
