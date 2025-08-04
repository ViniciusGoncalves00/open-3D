import { Component } from "./component";
import { ObservableVector3 } from "../../core/api/ObservableVector3";
import { ObservableField } from "../../common/patterns/observer/observable-field";

export class Rotate extends Component {
  private readonly _axis: ObservableVector3;
  public get axis(): ObservableVector3 { return this._axis; }

  private readonly _speed: ObservableField<number>;
  public get speed(): ObservableField<number> { return this._speed; }

  constructor(axis: ObservableVector3 = new ObservableVector3(0, 0, 0), speed: ObservableField<number> = new ObservableField<number>(1)) {
    super();
    this._axis = axis;
    this._speed = speed;
  }

  public clone(): Rotate {
    const clonedAxis = new ObservableVector3(this._axis.x.value, this._axis.y.value, this._axis.z.value);
    const clone = new Rotate(clonedAxis, this._speed);
    clone.enabled = this.enabled;
    return clone;
  }

  public copyFrom(rotate: Rotate): void {
      this._axis.set(rotate.axis.x.value, rotate.axis.y.value, rotate.axis.z.value);
      this._speed.value = rotate.speed.value;
  }

  public toJSON() {
    return {
      enabled: this.enabled,

      speed: this._speed.value,
      axis: {
        x: this._axis.x.value,
        y: this._axis.y.value,
        z: this._axis.z.value,
      },
    }
  }

  public fromJSON(json: any): void {
    this.enabled = json.enabled ?? true;

    this._speed.value = json.speed;
    this._axis.set(json.axis.x, json.axis.y, json.axis.z)
  }

  public destroy(): void {}
}