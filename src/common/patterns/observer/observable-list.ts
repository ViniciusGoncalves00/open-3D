export class ObservableList<T> {
    private _items: T[] = [];
    private _listeners: Set<{onAdd: (value: T) => void, onRemove: (value: T) => void}> = new Set();

    constructor(items: T[] = []) {
        this._items = items;
    }

    public get items(): T[] {
        return this._items;
    }

    public add(item: T): void {
        this._items.push(item);
        this._listeners.forEach(listener => listener.onAdd(item));
    }

    public removeAt(index: number): void {
        const removed = this._items.splice(index, 1)[0];
        this._listeners.forEach(listener => listener.onRemove(removed));
    }

    public remove(item: T): void {
        const index = this._items.indexOf(item);
        if (index !== -1) {
            this.removeAt(index);
        }
    }

    public clear(): void {
        this._items = [];
    }

    public subscribe(listener: {onAdd: (value: T) => void, onRemove: (value: T) => void}): void {
        this._listeners.add(listener);
    }

    public unsubscribe(listener: {onAdd: (value: T) => void, onRemove: (value: T) => void}): void {
        this._listeners.delete(listener);
    }
}
