import { ObservableField } from "../../common/patterns/observer/observable-field";
import { Vector3 } from "../../core/api/vector3";
import { Component } from "./component";

export class Orbit extends Component {
  public fromJSON(json: any): void {
    throw new Error("Method not implemented.");
  }
  private readonly _center: Vector3;
  public get center(): Vector3 { return this._center; }

  private readonly _distance: ObservableField<number>;
  public get distance(): ObservableField<number> { return this._distance; }

  private readonly _speed: ObservableField<number>;
  public get speed(): ObservableField<number> { return this._speed; }

  private readonly _axis: Vector3;
  public get axis(): Vector3 { return this._axis; }

  public readonly _angle: ObservableField<number> = new ObservableField<number>(0);
  public get angle(): ObservableField<number> { return this._angle; }

  constructor(
    center: Vector3 = new Vector3(0, 0, 0),
    distance: ObservableField<number> = new ObservableField<number>(1),
    speed: ObservableField<number> = new ObservableField<number>(1),
    axis: Vector3 = new Vector3(0, 1, 0)
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
    throw new Error("Method not implemented.");
  }
  
  public destroy(): void {}
}