import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { Color } from "./abstract/color";
import { Light } from "./abstract/light";

export class DirectionalLight extends Light {
    public readonly direction: ObservableVector3;

    public constructor(color: Color = Color.from01(1, 1, 1, 1), intensity: number = 1.0, direction: ObservableVector3 = new ObservableVector3(0, -1, 0)) {
        super(color, intensity);

        this.direction = direction;
    }

     public clone(): DirectionalLight {
        const cloned = new DirectionalLight(
            Color.from01(this.color.r.value, this.color.g.value, this.color.b.value, this.color.a.value),
            this.intensity.value,
            this.direction.clone()
        );
        cloned.enabled.value = this.enabled.value;
        return cloned;
    }

    public override copyFrom(directionalLight: DirectionalLight): void {
        super.copyFrom(directionalLight);

        this.color.r.value = directionalLight.color.r.value;
        this.color.g.value = directionalLight.color.g.value;
        this.color.b.value = directionalLight.color.b.value;
        this.color.a.value = directionalLight.color.a.value;

        this.intensity.value = directionalLight.intensity.value;
        this.direction.set(
            directionalLight.direction.x.value,
            directionalLight.direction.y.value,
            directionalLight.direction.z.value
        );
    }

    public override toJSON() {
        return {
            ...super.toJSON(),
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

    public override fromJSON(json: any): void {
        super.fromJSON(json),

        this.color.r.value = json.color.r;
        this.color.g.value = json.color.g;
        this.color.b.value = json.color.b;
        this.color.a.value = json.color.a;

        this.intensity.value = json.intensity;

        this.direction.set(json.direction.x, json.direction.y, json.direction.z);
    }

    public destroy(): void {}
}