import { ObservableField } from "../../common/observer/observable-field";
import { HideInInspector } from "../../common/reflection/reflection";
import { Component } from "./abstract/component";

export class Camera extends Component {
    public readonly isPerspective: ObservableField<boolean> = new ObservableField(true);

    public readonly nearClip: ObservableField<number> = new ObservableField(0.01);
    public readonly farClip: ObservableField<number> = new ObservableField(1000);

    public readonly fov: ObservableField<number> = new ObservableField(45);
    public readonly aspectRatio: ObservableField<number> = new ObservableField(1.7777777);
    public readonly width: ObservableField<number> = new ObservableField(1920);
    public readonly height: ObservableField<number> = new ObservableField(1080);

    @HideInInspector
    private dot: number = 0;

    public constructor(
        enabled: boolean = true,
        isPerspective: ObservableField<boolean> = new ObservableField(true),
        nearClip: ObservableField<number> = new ObservableField(0.01),
        farClip: ObservableField<number> = new ObservableField(1000),
        fov: ObservableField<number> = new ObservableField(45),
        aspectRatio: ObservableField<number> = new ObservableField(1.7777777),
        width: ObservableField<number> = new ObservableField(1920),
        height: ObservableField<number> = new ObservableField(1080),
    ) {
        super(enabled);

        this.isPerspective = isPerspective;
        this.nearClip = nearClip;
        this.farClip = farClip;
        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.width = width;
        this.height = height;

        this.dot = Math.cos(this.fov.value);
    }

    public override copyFrom(camera: Camera): void {
        super.copyFrom(camera);

        this.isPerspective.value = camera.isPerspective.value;
        this.nearClip.value = camera.nearClip.value;
        this.farClip.value = camera.farClip.value;
        this.fov.value = camera.fov.value;
        this.aspectRatio.value = camera.aspectRatio.value;
        this.width.value = camera.width.value;
        this.height.value = camera.height.value;
    }

    public override toJSON() {
        return {
            ...super.toJSON(),
            isPerspective: this.isPerspective.value,
            nearClip: this.nearClip.value,
            farClip: this.farClip.value,
            fov: this.fov.value,
            aspectRatio: this.aspectRatio.value,
            width: this.width.value,
            height: this.height.value
        }
    }

    public override fromJSON(json: any): void {
        super.fromJSON(json),

        this.isPerspective.value = json.isPerspective,
        this.nearClip.value = json.nearClip,
        this.farClip.value = json.farClip,
        this.fov.value = json.fov,
        this.aspectRatio.value = json.aspectRatio,
        this.width.value = json.width,
        this.height.value = json.height
    }

    public override clone(): Camera {
        const clone = new Camera(
            this.enabled.value,
            new ObservableField(this.isPerspective.value),
            new ObservableField(this.nearClip.value),
            new ObservableField(this.farClip.value),
            new ObservableField(this.fov.value),
            new ObservableField(this.aspectRatio.value),
            new ObservableField(this.width.value),
            new ObservableField(this.height.value),
        );
        return clone;
    }

    public destroy(): void {}
}