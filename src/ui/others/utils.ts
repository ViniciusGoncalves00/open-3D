export class Utils {
    public static getElementOrFail<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            console.log(`failed to load container: '${id}' -> ${element}`);
            throw new Error(`UI element '${id}' not found`);
        }
        return element as T;
    }
}