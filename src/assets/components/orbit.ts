import { ObservableField } from "../../common/observer/observable-field";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { Component } from "./abstract/component";

export class Orbit extends Component {
  private readonly _center: ObservableVector3;
  public get center(): ObservableVector3 { return this._center; }

  private readonly _distance: ObservableField<number>;
  public get distance(): ObservableField<number> { return this._distance; }

  private readonly _speed: ObservableField<number>;
  public get speed(): ObservableField<number> { return this._speed; }

  private readonly _axis: ObservableVector3;
  public get axis(): ObservableVector3 { return this._axis; }

  public readonly _angle: ObservableField<number> = new ObservableField<number>(0);
  public get angle(): ObservableField<number> { return this._angle; }

  constructor(
    center: ObservableVector3 = new ObservableVector3(0, 0, 0),
    distance: ObservableField<number> = new ObservableField<number>(1),
    speed: ObservableField<number> = new ObservableField<number>(1),
    axis: ObservableVector3 = new ObservableVector3(0, 1, 0)
  ) {
    super();
    this._center = center;
    this._distance = distance;
    this._speed = speed;
    this._axis = axis;
  }

  public clone(): Orbit {
    const clone = new Orbit(
      this._center.clone(),
      this._distance,
      this._speed,
      this._axis.clone()
    );
    clone.angle.value = this.angle.value;
    clone.enabled = this.enabled;
    return clone;
  }

  public copyFrom(orbit: Orbit): void {
      this._center.set(orbit.center.x.value, orbit.center.y.value, orbit.center.z.value);
      this._axis.set(orbit.axis.x.value, orbit.axis.y.value, orbit.axis.z.value);
      this._distance.value = orbit.distance.value;
      this._speed.value = orbit.speed.value;
  }

  public toJSON() {
    return {
      enabled: this.enabled,
      distance: this._distance.value,
      speed: this._speed.value,
      angle: this._angle.value,
      center: {
        x: this._center.x.value,
        y: this._center.y.value,
        z: this._center.z.value,
      },
      axis: {
        x: this._axis.x.value,
        y: this._axis.y.value,
        z: this._axis.z.value,
      },
    }
  }

  public fromJSON(json: any): void {
    this.enabled = json.enabled ?? true;

    this._distance.value = json.distance;
    this._speed.value = json.speed;
    this._angle.value = json.angle;
    this._center.set(json.center.x, json.center.y, json.center.z)
    this._axis.set(json.axis.x, json.axis.y, json.axis.z)
  }
  
  public destroy(): void {}
}