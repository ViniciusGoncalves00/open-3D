import { Component } from "./abstract/component";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { ObservableField } from "../../common/observer/observable-field";

export class Rotate extends Component {
  public readonly axis: ObservableVector3;
  public readonly speed: ObservableField<number>;

  public constructor(enabled: boolean = true, axis: ObservableVector3 = new ObservableVector3(0, 0, 0), speed: ObservableField<number> = new ObservableField<number>(1)) {
    super(enabled);

    this.axis = axis;
    this.speed = speed;
  }

  public clone(): Rotate {
    const clonedAxis = new ObservableVector3(this.axis.x.value, this.axis.y.value, this.axis.z.value);
    return new Rotate(this.enabled.value, clonedAxis, this.speed);
  }

  public override copyFrom(rotate: Rotate): void {
    super.copyFrom(rotate);

    this.axis.set(rotate.axis.x.value, rotate.axis.y.value, rotate.axis.z.value);
    this.speed.value = rotate.speed.value;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      speed: this.speed.value,
      axis: {
        x: this.axis.x.value,
        y: this.axis.y.value,
        z: this.axis.z.value,
      },
    }
  }

  public override fromJSON(json: any): void {
    super.fromJSON(json),

    this.speed.value = json.speed;
    this.axis.set(json.axis.x, json.axis.y, json.axis.z)
  }

  public destroy(): void {}
}