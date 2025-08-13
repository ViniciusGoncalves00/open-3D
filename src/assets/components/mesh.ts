import { ObservableField } from "../../common/observer/observable-field";
import { ObservableList } from "../../common/observer/observable-list";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { Component } from "./abstract/component";

export class Mesh extends Component {
  public readonly name: ObservableField<string>;
  public readonly vertices: ObservableList<ObservableVector3>;
  public readonly indices: ObservableList<ObservableField<number>>;

  public constructor(
    name = "name",
    vertices: ObservableVector3[] = [new ObservableVector3(0, 0, 0), new ObservableVector3(0, 0, 1), new ObservableVector3(1, 0, 0)],
    indices: ObservableField<number>[] = [new ObservableField(0), new ObservableField(1), new ObservableField(2)]
  ) {
    super();
    this.name = new ObservableField(name);
    this.vertices = new ObservableList(vertices);
    this.indices = new ObservableList(indices);
  }

  public clone(): Mesh {
    const clone = new Mesh(
      this.name.value,
      this.vertices.items,
      this.indices.items,
    );
    
    clone.enabled.value = this.enabled.value;
    return clone;
  }

  public override copyFrom(mesh: Mesh): void {
    super.copyFrom(mesh);

    this.name.value = mesh.name.value;
    this.vertices.clear();
    mesh.vertices.items.forEach(item => this.vertices.add(item));
    this.indices.clear();
    mesh.indices.items.forEach(item => this.indices.add(item));
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      name: this.name.value,
      vertices: this.vertices.items.map(v => ({
        x: v.x.value,
        y: v.y.value,
        z: v.z.value,
      })),
      indices: this.indices.items.map(i => i.value),
    };
  }

  public override fromJSON(json: any): void {
    super.fromJSON(json),

    this.enabled.value = json.enabled;
    this.name.value = json.name;

    this.vertices.clear();
    for (const v of json.vertices) {
      this.vertices.add(new ObservableVector3(v.x, v.y, v.z));
    }

    this.indices.clear();
    for (const i of json.indices) {
      this.indices.add(new ObservableField<number>(i));
    }
  }

  public destroy(): void {}
}