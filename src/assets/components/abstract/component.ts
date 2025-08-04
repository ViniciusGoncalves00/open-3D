export abstract class Component {
    public enabled: boolean = true;
    public abstract clone(): Component;
    public abstract copyFrom(component: Component): void;
    public abstract toJSON(): any;
    public abstract fromJSON(json: any): void;
    public abstract destroy(): void;
}