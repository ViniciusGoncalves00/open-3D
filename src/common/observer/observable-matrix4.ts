import { mat4 as matrix4 } from "gl-matrix";

export class ObservableMatrix4 {
  private _value: matrix4 = matrix4.create();
  private _listeners: Set<(value: matrix4) => void> = new Set();

  public get value(): matrix4 {
    return this._value;
  }

  public set value(newValue: matrix4) {
    if (this._value === newValue) return;
    this._value = newValue;
    this.notify();
  }

  public update(fn: (m: matrix4) => void): void {
    fn(this._value);
    this.notify();
  }

  public subscribe(listener: (val: matrix4) => void): void {
    this._listeners.add(listener);
  }

  public unsubscribe(listener: (val: matrix4) => void): void {
    this._listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this._listeners) {
      listener(this._value);
    }
  }
}