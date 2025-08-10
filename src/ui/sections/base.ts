import { Builder, Icons } from "./builder";

export class Section {
    private sectionContainer: HTMLElement | null = null;
    private buttonContainer: HTMLElement | null = null;

    private button: HTMLButtonElement;
    private section: HTMLDivElement;
    protected subHeader: HTMLDivElement;
    protected sectionBody: HTMLDivElement;

    private visible: boolean = true;

    public constructor(name: string, icon: Icons) {
        this.button = Builder.sectionButton(icon, () => this.toggle());
        this.section = Builder.section(name, icon);

        this.subHeader = this.section.querySelector('[data-role="subHeader"]') as HTMLDivElement;
        this.sectionBody = this.section.querySelector('[data-role="body"]') as HTMLDivElement;
    }

    public toggle(): void {
        this.visible = !this.visible;
        this.visible ? this.sectionContainer?.appendChild(this.section) : this.sectionContainer?.removeChild(this.section);
    }

    public assign(sectionContainer: HTMLElement, buttonContainer: HTMLElement): void {
        this.buttonContainer?.removeChild(this.button);
        this.sectionContainer?.removeChild(this.section);

        this.sectionContainer = sectionContainer;
        this.buttonContainer = buttonContainer;

        this.buttonContainer.appendChild(this.button);
        if(this.visible) this.sectionContainer?.appendChild(this.section);
    }
}