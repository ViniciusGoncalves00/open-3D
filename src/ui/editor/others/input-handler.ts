import { Camera } from "../../../assets/components/camera";
import { Transform } from "../../../assets/components/transform";
import { MathUtils } from 'ts-math-utils';
import { ObservableField } from "../../../common/observer/observable-field";

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

    public readonly pitchRotateSensivity: ObservableField<number> = new ObservableField(0.1);
    public readonly yawRotateSensivity: ObservableField<number> = new ObservableField(0.1);

    public readonly pitchOrbitSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yawOrbitSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly zoomSensivity: ObservableField<number> = new ObservableField(0.01);
    // #endregion

    // #region [smoothness]
    public readonly orbitSmoothness: ObservableField<number> = new ObservableField(1);
    // #endregion

    // #region [const]
    private readonly max_pitch = 89.99;
    // #endregion

    public transform: Transform;
    public camera: Camera;
    public lastPosition: [number, number] | null = null;
    public target: [number, number, number] = [0, 0, 0];

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

        const dx = position.x.value - this.target[0];
        const dy = position.y.value - this.target[1];
        const dz = position.z.value - this.target[2];

        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let yaw = Math.atan2(dx, dz);
        let pitch = Math.asin(dy / distance);

        const smooth = MathUtils.smooth(distance, this.orbitSmoothness.value)
        const deltaYaw = event.movementX * this.yawOrbitSensivity.value * this.yawOrbitDirection.value * smooth;
        const deltaPitch = event.movementY * this.pitchOrbitSensivity.value * this.pitchOrbitDirection.value * smooth;

        pitch = MathUtils.clamp(pitch + deltaPitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
        yaw += deltaYaw;

        const newX = this.target[0] + distance * Math.cos(pitch) * Math.sin(yaw);
        const newY = this.target[1] + distance * Math.sin(pitch);
        const newZ = this.target[2] + distance * Math.cos(pitch) * Math.cos(yaw);

        this.transform.position.set(newX, newY, newZ);

        const dir: [number, number, number] = [this.target[0] - newX, this.target[1] - newY, this.target[2] - newZ];

        const newYaw = MathUtils.rad2deg(Math.atan2(dir[0], dir[2]));
        const newPitch = MathUtils.rad2deg(Math.atan2(dir[1], Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2]))) * -1;

        this.transform.rotation.set(newPitch, newYaw, 0);
    }

    public rotate(event: MouseEvent): void {
        this.transform.rotation.x.value += event.movementY * this.pitchRotateSensivity.value * this.pitchRotateDirection.value;
        this.transform.rotation.y.value += event.movementX * this.yawRotateSensivity.value * this.yawRotateDirection.value;
        
        this.transform.rotation.x.value = MathUtils.clamp(this.transform.rotation.x.value, -this.max_pitch, this.max_pitch);
    }

    public mouseWheel(event: WheelEvent): void {
        const dz = event.deltaY * this.zoomSensivity.value * this.zoomDirection.value;
        this.transform.translateLocal(0, 0, dz);
    }

    public findCameraTarget(): void {
        this.target = [0, 0, 0];

        // const normalX: [number, number, number] = [1, 0, 0];
        // const normalY: [number, number, number] = [0, 1, 0];
        // const normalZ: [number, number, number] = [0, 0, 1];

        // let closestT = Infinity;
        // let hitPoint: [number, number, number] | null = null;

        // const up: [number, number, number] = [this.transform.up()[0], this.transform.up()[1], this.transform.up()[2]];
        // const forward: [number, number, number] = [this.transform.forward()[0], this.transform.forward()[1], this.transform.forward()[2]];

        // for (const planeNormal of [normalX, normalY, normalZ]) {
        //     const t = VectorUtils.intersectRayPlane(this.transform.position.getValues(), up, planeNormal, [0, 0, 0]);
        //     if (t !== null && t < closestT) {
        //         closestT = t;
        //         hitPoint = VectorUtils.scaleAndAdd(this.transform.position.getValues(), forward, t);
        //     }
        // }

        // if(hitPoint != null) this.target = hitPoint;
    }
}