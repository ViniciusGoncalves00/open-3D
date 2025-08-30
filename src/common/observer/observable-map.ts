export class ObservableMap<K, V> {
  private _map = new Map<K, V>();
  private _listeners: Set<{onAdd: (value: V) => void, onRemove: (value: V) => void}> = new Set();

  public constructor(map: Map<K, V> = new Map()) {
    this._map = map;
  }

  public set(key: K, value: V) {
    this._map.set(key, value);
    
    this._listeners.forEach(listener => listener.onAdd(value));
  }

  public get(key: K): V | undefined {
    return this._map.get(key);
  }

  public has(key: K): boolean {
    return this._map.has(key);
  }

  public delete(key: K): boolean {
    const value = this._map.get(key);
    const deleted = this._map.delete(key);
    if (value && deleted) this._listeners.forEach(listener => listener.onRemove(value));
    return deleted;
  }

  public clear() {
    this._map.forEach((value, key, map) => this.delete(key))
  }

  public entries(): IterableIterator<[K, V]> {
    return this._map.entries();
  }

  public values(): IterableIterator<V> {
    return this._map.values();
  }

  public keys(): IterableIterator<K> {
    return this._map.keys();
  }

  public forEach(callback: (value: V, key: K, map: Map<K, V>) => void): void {
    this._map.forEach(callback);
  }

  public subscribe(listener: {onAdd: (value: V) => void, onRemove: (value: V) => void}): void {
    this._listeners.add(listener);
  }

  public unsubscribe(listener: {onAdd: (value: V) => void, onRemove: (value: V) => void}): void {
    this._listeners.delete(listener);
  }
}