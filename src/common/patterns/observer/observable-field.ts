export class ObservableField<T> {
  private _value: T;
  private _listeners: Set<(value: T) => void> = new Set();

  public constructor(initialValue: T) {
    this._value = initialValue;
  }

  public get value(): T {
    return this._value;
  }

  public set value(newValue: T) {
    if (this._value === newValue) return;

    this._value = newValue;
    this._listeners.forEach(listener => listener(newValue));
  }

  public subscribe(listener: (val: T) => void): void {
    this._listeners.add(listener);
  }

  public unsubscribe(listener: (val: T) => void): void {
    this._listeners.delete(listener);
  }
}