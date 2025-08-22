import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";
import { MathUtils } from "../../common/utils/math-utils";
import { ObservableField } from "../../common/observer/observable-field";

export class InputHandler {
    // #region [direction]
    public readonly xPanDirection: ObservableField<number> = new ObservableField(1);
    public readonly yPanDirection: ObservableField<number> = new ObservableField(1);

    public readonly yawRotateDirection: ObservableField<number> = new ObservableField(-1);
    public readonly pitchRotateDirection: ObservableField<number> = new ObservableField(1);

    public readonly yawOrbitDirection: ObservableField<number> = new ObservableField(-1);
    public readonly pitchOrbitDirection: ObservableField<number> = new ObservableField(1);

    public readonly zoomDirection: ObservableField<number> = new ObservableField(-1);
    // #endregion

    // #region [sensivity]
    public readonly xPanSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yPanSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly pitchRotateSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yawRotateSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly pitchOrbitSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yawOrbitSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly zoomSensivity: ObservableField<number> = new ObservableField(0.01);
    // #endregion

    // #region [const]
    private readonly MAX_PITCH = 89.99;
    // #endregion

    public transform: Transform;
    public camera: Camera;
    public lastPosition: [number, number] | null = null;

    public constructor(transform: Transform, camera: Camera) {
        this.transform = transform;
        this.camera = camera;
    }

    public click(click: MouseEvent): void {}

    public mouseDown(): void {}

    public mouseUp(): void {}

    public pan(event: MouseEvent): void {
        const dx = event.movementX * this.xPanSensivity.value * this.xPanDirection.value;
        const dy = event.movementY * this.yPanSensivity.value * this.yPanDirection.value;
        this.transform.translateLocal(dx, dy, 0);
    }

    public orbit(event: MouseEvent): void {
        const position = this.transform.position;
        const target = this.findTarget();

        const dx = position.x.value - target[0];
        const dy = position.y.value - target[1];
        const dz = position.z.value - target[2];

        const radius = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let yaw = Math.atan2(dx, dz);
        let pitch = Math.asin(dy / radius);

        const deltaYaw = event.movementX * this.yawOrbitSensivity.value * this.yawOrbitDirection.value;
        const deltaPitch = event.movementY * this.pitchOrbitSensivity.value * this.pitchOrbitDirection.value;

        pitch = MathUtils.clamp(pitch + deltaPitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
        yaw += deltaYaw;

        const newX = target[0] + radius * Math.cos(pitch) * Math.sin(yaw);
        const newY = target[1] + radius * Math.sin(pitch);
        const newZ = target[2] + radius * Math.cos(pitch) * Math.cos(yaw);

        this.transform.position.set(newX, newY, newZ);

        const dir: [number, number, number] = [target[0] - newX, target[1] - newY, target[2] - newZ];

        const newYaw = MathUtils.rad2deg(Math.atan2(dir[0], dir[2]));
        const newPitch = MathUtils.rad2deg(Math.atan2(dir[1], Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2]))) * -1;

        this.transform.rotation.set(newPitch, newYaw, 0);
    }

    public rotate(event: MouseEvent): void {
        this.transform.rotation.x.value += event.movementY * this.pitchRotateSensivity.value * this.pitchRotateDirection.value;
        this.transform.rotation.y.value += event.movementX * this.yawRotateSensivity.value * this.yawRotateDirection.value;
        
        this.transform.rotation.x.value = MathUtils.clamp(this.transform.rotation.x.value, -this.MAX_PITCH, this.MAX_PITCH);
    }

    public mouseWheel(event: WheelEvent): void {
        const dz = event.deltaY * this.zoomSensivity.value * this.zoomDirection.value;
        this.transform.translateLocal(0, 0, dz);
    }

    private findTarget(): [number, number, number] {
        return [0, 0, 0];
    }
}