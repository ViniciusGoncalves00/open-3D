import { Component } from "./component";
import { Vector3 } from "../../core/api/vector3";
import { ObservableField } from "../../common/patterns/observer/observable-field";

export class Rotate extends Component {
  public fromJSON(json: any): void {
    throw new Error("Method not implemented.");
  }

  private readonly _axis: Vector3;
  public get axis(): Vector3 { return this._axis; }

  private readonly _speed: ObservableField<number>;
  public get speed(): ObservableField<number> { return this._speed; }

  constructor(axis: Vector3 = new Vector3(0, 0, 0), speed: ObservableField<number> = new ObservableField<number>(1)) {
    super();
    this._axis = axis;
    this._speed = speed;
  }

  public clone(): Rotate {
    const clonedAxis = new Vector3(this._axis.x.value, this._axis.y.value, this._axis.z.value);
    const clone = new Rotate(clonedAxis, this._speed);
    clone.enabled = this.enabled;
    return clone;
  }

  public copyFrom(rotate: Rotate): void {
      this._axis.set(rotate.axis.x.value, rotate.axis.y.value, rotate.axis.z.value);
      this._speed.value = rotate.speed.value;
  }

  public toJSON() {
    throw new Error("Method not implemented.");
  }

  public destroy(): void {}
}