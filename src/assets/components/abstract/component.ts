import { ObservableField } from "../../../common/observer/observable-field";

export abstract class Component {
    public readonly enabled: ObservableField<boolean> = new ObservableField(true);
    public abstract clone(): Component;
    public abstract copyFrom(component: Component): void;
    public abstract toJSON(): any;
    public abstract fromJSON(json: any): void;
    public abstract destroy(): void;
}