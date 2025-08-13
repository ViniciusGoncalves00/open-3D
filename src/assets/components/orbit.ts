import { ObservableField } from "../../common/observer/observable-field";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { Component } from "./abstract/component";

export class Orbit extends Component {
    public readonly center: ObservableVector3;
    public readonly distance: ObservableField<number>;
    public readonly speed: ObservableField<number>;
    public readonly axis: ObservableVector3;
    public readonly angle: ObservableField<number> = new ObservableField<number>(0);

    public constructor(enabled: boolean = true, center: ObservableVector3 = new ObservableVector3(0, 0, 0), distance: ObservableField<number> = new ObservableField<number>(1), speed: ObservableField<number> = new ObservableField<number>(1), axis: ObservableVector3 = new ObservableVector3(0, 1, 0)) {
        super(enabled);
        this.center = center;
        this.distance = distance;
        this.speed = speed;
        this.axis = axis;
    }

    public clone(): Orbit {
        const clone = new Orbit(
            this.enabled.value,
            this.center.clone(),
            this.distance,
            this.speed,
            this.axis.clone()
        );
        clone.angle.value = this.angle.value;
        return clone;
    }

    public override copyFrom(orbit: Orbit): void {
        super.copyFrom(orbit);

        this.center.set(orbit.center.x.value, orbit.center.y.value, orbit.center.z.value);
        this.axis.set(orbit.axis.x.value, orbit.axis.y.value, orbit.axis.z.value);
        this.distance.value = orbit.distance.value;
        this.speed.value = orbit.speed.value;
    }

    public override toJSON() {
        return {
            ...super.toJSON(),
            distance: this.distance.value,
            speed: this.speed.value,
            angle: this.angle.value,
            center: {
              x: this.center.x.value,
              y: this.center.y.value,
              z: this.center.z.value,
            },
            axis: {
              x: this.axis.x.value,
              y: this.axis.y.value,
              z: this.axis.z.value,
            },
        }
    }

    public override fromJSON(json: any): void {
        super.fromJSON(json),

        this.distance.value = json.distance;
        this.speed.value = json.speed;
        this.angle.value = json.angle;
        this.center.set(json.center.x, json.center.y, json.center.z)
        this.axis.set(json.axis.x, json.axis.y, json.axis.z)
    }
  
    public destroy(): void {}
}