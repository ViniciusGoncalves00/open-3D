import { Transform } from "../../../assets/components/transform";
import { MathUtils } from 'ts-math-utils';
import { EditorPreferences } from "../../../database/editorPreferences";
import { Input } from "./input";
import { int } from "three/tsl";
import { ConsoleLogger } from "../sections/console/console-logger";

export class EditorCamera {
    // #region [const]
    private readonly max_pitch = 89.99;
    // #endregion

    public lastPosition: [number, number] | null = null;
    public target: [number, number, number] = [0, 0, 0];

    public preferences: EditorPreferences;
    private transform: Transform;

    public constructor(preferences: EditorPreferences, transform: Transform) {
        this.preferences = preferences;
        this.transform = transform;

        Input.mouseMoveCallbacks.add(() => this.pan());
        Input.mouseMoveCallbacks.add(() => this.rotate());
        Input.mouseMoveCallbacks.add(() => this.orbit());
        Input.mouseWheelCallbacks.add(() => this.wheel());
    }

    private pan(): void {
        if(!Input.panning.value) return;

        this.transform.translateLocalRight(Input.deltaPan[0] * this.preferences.xPanSensivity.value * this.preferences.xPanDirection.value);
        this.transform.translateLocalUp(Input.deltaPan[1] * this.preferences.yPanSensivity.value * this.preferences.yPanDirection.value)

        this.updateTarget();
    }

    private rotate(): void {
        if(!Input.rotating.value) return;

        this.transform.rotateLocalRight(Input.deltaRotate[1] * this.preferences.pitchRotateSensivity.value * this.preferences.pitchRotateDirection.value);
        this.transform.rotateLocalUp(Input.deltaRotate[0] * this.preferences.yawRotateSensivity.value * this.preferences.yawRotateDirection.value);

        this.updateTarget();
    }

    private orbit(): void {
        if(!Input.orbiting.value) return;

        const position = this.transform.position;

        const dx = position.x.value - this.target[0];
        const dy = position.y.value - this.target[1];
        const dz = position.z.value - this.target[2];

        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let yaw = Math.atan2(dx, dz);
        let pitch = Math.asin(dy / distance);

        const smooth = MathUtils.smooth(distance, this.preferences.orbitSmoothness.value)
        const deltaYaw = Input.deltaOrbit[0] * this.preferences.yawOrbitSensivity.value * this.preferences.yawOrbitDirection.value * smooth;
        const deltaPitch = Input.deltaOrbit[1] * this.preferences.pitchOrbitSensivity.value * this.preferences.pitchOrbitDirection.value * smooth;

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

    private wheel(): void {
        if(!Input.wheeling.value) return;

        this.transform.translateLocalForward(Input.deltaWheel * this.preferences.zoomSensivity.value * this.preferences.zoomDirection.value);

        this.updateTarget();
    }

    private updateTarget(): void {
        const position =  this.transform.position;
        const forward = this.transform.forward();

        const distance = 5;

        this.target[0] = position.x.value + forward[0] * distance;
        this.target[1] = position.y.value + forward[1] * distance;
        this.target[2] = position.z.value + forward[2] * distance;
    }
}