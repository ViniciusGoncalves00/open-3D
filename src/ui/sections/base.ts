import { Builder, Icons } from "./builder";

export abstract class Section {
    private sectionContainer: HTMLElement | null = null;
    private buttonContainer: HTMLElement | null = null;

    private button: HTMLButtonElement;
    private section: HTMLDivElement;
    protected subHeader: HTMLDivElement;
    protected sectionBody: HTMLDivElement;

    private visible: boolean = true;
    private pinned: boolean = false;

    public constructor(name: string, icon: Icons) {
        this.button = Builder.sectionButton(icon, () => this.toggle());
        this.section = Builder.section(name, icon, () => this.toggle(), () => this.pin());

        this.subHeader = this.section.querySelector('[data-role="subHeader"]') as HTMLDivElement;
        this.sectionBody = this.section.querySelector('[data-role="body"]') as HTMLDivElement;
    }

    public toggle(): void {
        if(this.pinned) return;
        
        this.visible = !this.visible;
        this.visible ? this.sectionContainer?.appendChild(this.section) : this.sectionContainer?.removeChild(this.section);
    }

    public pin(): void {
        this.pinned = !this.pinned;
    }

    public assign(sectionContainer: HTMLElement, buttonContainer: HTMLElement): void {
        if(this.pinned) return;

        this.buttonContainer?.removeChild(this.button);
        this.sectionContainer?.removeChild(this.section);

        this.sectionContainer = sectionContainer;
        this.buttonContainer = buttonContainer;

        this.buttonContainer.appendChild(this.button);
        if(this.visible) this.sectionContainer?.appendChild(this.section);
    }
}