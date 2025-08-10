export type DropdownItem = {
    label: string;
    action: () => void,
}

/**
* Represents a reusable Dropdown component.
* 
* Displays a list of options that can be selected, triggering an external action.
* 
* @param items - List of items for the dropdown.
* @param fixedLabel - Default text displayed on the button. Use this when you want a fixed text on the button. If none exists, the text displayed will be the first in the list of items, and will be replaced when an item is selected.
* @param onSelect - Function called when selecting an item.
*/
export class Dropdown {
    private items: DropdownItem[];

    private container: HTMLElement;
    private button: HTMLButtonElement;
    private menu: HTMLUListElement;
    private isOpen = false;
    private fixedLabel: string | null = null;

    public constructor(items: DropdownItem[], initialSelection: string | null = null, fixedLabel: string | null = null) {
        if(!initialSelection && !fixedLabel)
            throw new Error("Dropdown must contain or an initial selection or a fixed label");

        this.items = items;
        this.fixedLabel = fixedLabel;

        this.sortItems();

        this.container = document.createElement("div");
        this.container.classList = "w-full inline-block relative"

        this.button = document.createElement("button");
        this.button.textContent = this.fixedLabel ? this.fixedLabel : initialSelection;
        this.button.classList = "w-full bg-zinc-700 text-white px-2 py-1 rounded truncate hover:bg-zinc-600 cursor-pointer";
        this.button.onclick = () => this.toggle();

        this.menu = document.createElement("ul");
        this.menu.classList = "absolute left-0 top-full mt-1 bg-zinc-700 text-white text-sm rounded z-50";
        this.menu.style.display = "none";

        this.renderItems();

        this.container.appendChild(this.button);
        // this.container.appendChild(this.menu);
        document.body.appendChild(this.menu);
    }

    public getElement(): HTMLElement {
        return this.container;
    }

    public setItems(items: DropdownItem[]) {
        this.items = items.slice();
        this.sortItems();
        this.renderItems();
    }

    public addItem(item: DropdownItem): void {
        this.items.push(item);
        this.sortItems();
        this.renderItems();
    }

    private sortItems() {
        this.items.sort((a, b) => a.label.localeCompare(b.label));
    }

    private renderItems() {
        this.menu.innerHTML = "";
        this.items.forEach(item => {
            const li = document.createElement("li");
            li.classList = "px-4 py-2 text-center hover:bg-zinc-600 cursor-pointer truncate overflow-hidden whitespace-nowrap";
            li.textContent = item.label;
            li.onclick = () => this.selectItem(item);
            this.menu.appendChild(li);
        });
    }

    private selectItem(item: DropdownItem) {
        this.button.textContent = this.fixedLabel ? this.fixedLabel : item.label;
        this.toggle(false);
        item.action();
    }

    private toggle(state?: boolean) {
        this.isOpen = typeof state === "boolean" ? state : !this.isOpen;
        if (this.isOpen) {
            const rect = this.button.getBoundingClientRect();
            this.menu.style.position = "absolute";
            this.menu.style.left = `${rect.left}px`;
            this.menu.style.top = `${rect.bottom + window.scrollY}px`;
            this.menu.style.width = `${rect.width}px`;
            this.menu.style.zIndex = "9999";
            this.menu.style.display = "block";
        } else {
            this.menu.style.display = "none";
        }
    }
}