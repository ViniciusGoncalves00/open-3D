import { ObservableField } from "../../common/observer/observable-field";
import { Builder, Icons } from "./builder";

export abstract class Section {
    private sectionContainer: HTMLElement | null = null;
    private buttonContainer: HTMLElement | null = null;

    private button: HTMLButtonElement;
    protected section: HTMLDivElement;
    protected subHeader: HTMLDivElement;
    protected sectionBody: HTMLDivElement;

    private visible: ObservableField<boolean> = new ObservableField(true);
    private pinned: ObservableField<boolean> = new ObservableField(false);

    public constructor(name: string, icon: Icons) {
        this.button = Builder.sectionButton(icon, () => this.toggle(), this.visible);
        this.section = Builder.section(name, icon, () => this.toggle(), () => this.pin());

        this.subHeader = this.section.querySelector('[data-role="subHeader"]') as HTMLDivElement;
        this.sectionBody = this.section.querySelector('[data-role="body"]') as HTMLDivElement;
    }

    public toggle(): void {
        if(this.pinned.value) return;

        this.visible.value = !this.visible.value;
        this.visible.value ? this.sectionContainer?.appendChild(this.section) : this.sectionContainer?.removeChild(this.section);
    }

    public pin(): void {
        this.pinned.value = !this.pinned.value;
    }

    public assign(sectionContainer: HTMLElement, buttonContainer: HTMLElement): void {
        if(this.pinned.value) return;

        this.buttonContainer?.removeChild(this.button);
        this.sectionContainer?.removeChild(this.section);

        this.sectionContainer = sectionContainer;
        this.buttonContainer = buttonContainer;

        this.buttonContainer.appendChild(this.button);
        if(this.visible.value) this.sectionContainer?.appendChild(this.section);
    }
}