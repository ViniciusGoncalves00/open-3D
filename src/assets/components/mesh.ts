import { ObservableField } from "../../common/observer/observable-field";
import { ObservableList } from "../../common/observer/observable-list";
import { BufferView } from "../../core/gltf/buffer-view";
import { Primitive } from "../../core/gltf/primitive";
import { Component } from "./abstract/component";

export class Mesh extends Component {
    public name: ObservableField<string>;
    public primitives: ObservableList<Primitive> = new ObservableList();

    constructor(name: string = "DefaultMeshName", primitives: Primitive[] = []) {
        super();
        this.name = new ObservableField(name);
        this.primitives = new ObservableList(primitives);
    }

    public override toJSON() {
        return {
            ...super.toJSON(),
            name: this.name.value,
            primitives: this.primitives.items.map((primitive) => primitive.toJSON())
        };
    }

    public override fromJSON(json: any, bufferViewLookup?: (index: number) => BufferView): void {
        super.fromJSON(json);
        this.name.value = json.name;

        this.primitives.clear();
        json.primitives.forEach((primitive: any) => {
            this.primitives.add(Primitive.fromJSON(primitive, bufferViewLookup));
        });
    }

    public clone(): Component {
        return new Mesh(
            this.name.value,
            this.primitives.items.map((p) => Primitive.fromJSON(p.toJSON()))
        );
    }

    public copyFrom(component: Mesh): void {
        super.copyFrom(component);
        this.name.value = component.name.value;
        component.primitives.items.forEach(primitive => {
            this.primitives.add(primitive);
        });
    }

    public destroy(): void {
        throw new Error("Method not implemented.");
    }
}
