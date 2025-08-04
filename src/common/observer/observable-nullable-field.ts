export class ObservableNullableField<T> {
  private _value: T | null;
  private _listeners: Set<(value: T | null) => void> = new Set();

  public constructor(initialValue: T | null = null) {
    this._value = initialValue;
  }

  public get value(): T | null {
    return this._value;
  }

  public set value(newValue: T | null) {
    if (this._value === newValue) return;

    this._value = newValue;
    this._listeners.forEach(listener => listener(newValue));
  }

  public subscribe(listener: (value: T | null) => void): void {
    this._listeners.add(listener);
  }

  public unsubscribe(listener: (value: T | null) => void): void {
    this._listeners.delete(listener);
  }
}