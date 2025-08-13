import { ObservableField } from "../../../common/observer/observable-field";

export abstract class Component {
    public readonly enabled: ObservableField<boolean>;
    public abstract clone(): Component;

    public constructor(enabled: boolean = true) {
        this.enabled = new ObservableField(enabled);
    }

    public copyFrom(component: Component): void {
        this.enabled.value = component.enabled.value;
    }

    public toJSON(): any {
        return {
            enabled: this.enabled.value
        };
    }

    public fromJSON(json: any): void {
        if (typeof json.enabled === "boolean") {
            this.enabled.value = json.enabled;
        }
    }
    public abstract destroy(): void;
}