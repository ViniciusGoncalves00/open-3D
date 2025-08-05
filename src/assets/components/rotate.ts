import { Component } from "./abstract/component";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { ObservableField } from "../../common/observer/observable-field";

export class Rotate extends Component {
  public readonly axis: ObservableVector3;
  public readonly speed: ObservableField<number>;

  constructor(axis: ObservableVector3 = new ObservableVector3(0, 0, 0), speed: ObservableField<number> = new ObservableField<number>(1)) {
    super();
    this.axis = axis;
    this.speed = speed;
  }

  public clone(): Rotate {
    const clonedAxis = new ObservableVector3(this.axis.x.value, this.axis.y.value, this.axis.z.value);
    const clone = new Rotate(clonedAxis, this.speed);
    clone.enabled.value = this.enabled.value;
    return clone;
  }

  public copyFrom(rotate: Rotate): void {
      this.axis.set(rotate.axis.x.value, rotate.axis.y.value, rotate.axis.z.value);
      this.speed.value = rotate.speed.value;
  }

  public toJSON() {
    return {
      enabled: this.enabled.value,

      speed: this.speed.value,
      axis: {
        x: this.axis.x.value,
        y: this.axis.y.value,
        z: this.axis.z.value,
      },
    }
  }

  public fromJSON(json: any): void {
    this.enabled.value = json.enabled ?? true;

    this.speed.value = json.speed;
    this.axis.set(json.axis.x, json.axis.y, json.axis.z)
  }

  public destroy(): void {}
}