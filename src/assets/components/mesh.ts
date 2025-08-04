import { ObservableField } from "../../common/patterns/observer/observable-field";
import { ObservableList } from "../../common/patterns/observer/observable-list";
import { ObservableVector3 } from "../../core/api/ObservableVector3";
import { Component } from "./component";

export class Mesh extends Component {
  private readonly _name: ObservableField<string>;
  public get name(): ObservableField<string> { return this._name; }

  private readonly _vertices: ObservableList<ObservableVector3>;
  public get vertices(): ObservableList<ObservableVector3> { return this._vertices; }
    
  private readonly _indices: ObservableList<ObservableField<number>>;
  public get indices(): ObservableList<ObservableField<number>> { return this._indices; }

  public constructor(
    name = "name",
    vertices: ObservableVector3[] = [new ObservableVector3(0, 0, 0), new ObservableVector3(0, 0, 1), new ObservableVector3(1, 0, 0)],
    indices: ObservableField<number>[] = [new ObservableField(0), new ObservableField(1), new ObservableField(2)]
  ) {
    super();
    this._name = new ObservableField(name);
    this._vertices = new ObservableList(vertices);
    this._indices = new ObservableList(indices);
  }

  public clone(): Mesh {
    const clone = new Mesh(
      this._name.value,
      this._vertices.items,
      this._indices.items,
    );
    
    clone.enabled = this.enabled;
    return clone;
  }

  public copyFrom(mesh: Mesh): void {
    this._name.value = mesh._name.value;
    this._vertices.clear();
    mesh._vertices.items.forEach(item => this._vertices.add(item));
    this._indices.clear();
    mesh._indices.items.forEach(item => this._indices.add(item));
    this.enabled = mesh.enabled;
  }

  public toJSON() {
    return {
      enabled: this.enabled,
      name: this._name.value,
      vertices: this._vertices.items.map(v => ({
        x: v.x.value,
        y: v.y.value,
        z: v.z.value,
      })),
      indices: this._indices.items.map(i => i.value),
    };
  }

  public fromJSON(json: any): void {
    this.enabled = json.enabled;
    this._name.value = json.name;

    this._vertices.clear();
    for (const v of json.vertices) {
      this._vertices.add(new ObservableVector3(v.x, v.y, v.z));
    }

    this._indices.clear();
    for (const i of json.indices) {
      this._indices.add(new ObservableField<number>(i));
    }
  }

  public destroy(): void {}
}