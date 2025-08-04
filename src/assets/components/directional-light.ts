import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { Color } from "./abstract/color";
import { Light } from "./abstract/light";

export class DirectionalLight extends Light {
    private readonly _direction: ObservableVector3;
    public get direction(): ObservableVector3 { return this._direction; }

    public constructor(color: Color = Color.from01(1, 1, 1, 1), intensity: number = 1.0, direction: ObservableVector3 = new ObservableVector3(0, -1, 0)) {
        super(color, intensity);

        this._direction = direction;
    }

     public clone(): DirectionalLight {
        const cloned = new DirectionalLight(
            Color.from01(this.color.r.value, this.color.g.value, this.color.b.value, this.color.a.value),
            this.intensity.value,
            this._direction.clone()
        );
        cloned.enabled = this.enabled;
        return cloned;
    }

    public copyFrom(component: DirectionalLight): void {
        this.color.r.value = component.color.r.value;
        this.color.g.value = component.color.g.value;
        this.color.b.value = component.color.b.value;
        this.color.a.value = component.color.a.value;

        this.intensity.value = component.intensity.value;
        this._direction.set(
            component.direction.x.value,
            component.direction.y.value,
            component.direction.z.value
        );
        this.enabled = component.enabled;
    }

    public toJSON() {
        return {
            type: "DirectionalLight",
            enabled: this.enabled,
            color: {
                r: this.color.r.value,
                g: this.color.g.value,
                b: this.color.b.value,
                a: this.color.a.value
            },
            intensity: this.intensity.value,
            direction: {
                x: this.direction.x.value,
                y: this.direction.y.value,
                z: this.direction.z.value
            }
        };
    }

    public fromJSON(json: any): void {
        this.enabled = json.enabled ?? true;

        this.color.r.value = json.color.r;
        this.color.g.value = json.color.g;
        this.color.b.value = json.color.b;
        this.color.a.value = json.color.a;

        this.intensity.value = json.intensity;

        this.direction.set(json.direction.x, json.direction.y, json.direction.z);
    }

    public destroy(): void {}
}