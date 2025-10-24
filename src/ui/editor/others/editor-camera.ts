import { Transform } from "../../../assets/components/transform";
import { MathUtils } from 'ts-math-utils';
import { EditorPreferences } from "../../../database/editorPreferences";
import { Input } from "./input";

export class EditorCamera {
    // #region [const]
    private readonly max_pitch = 89.99;
    // #endregion

    public lastPosition: [number, number] | null = null;
    public target: [number, number, number] = [0, 0, 0];

    public preferences: EditorPreferences;

    public constructor(preferences: EditorPreferences, editorContainer: HTMLCanvasElement, transform: Transform) {
        this.preferences = preferences;
        // editorContainer.addEventListener("mousedown", (event) => {
        //     const pressedButton = event.button;
        //     this.preferences.panButtons.value.has(pressedButton) ? pan = true : '';
        //     if(this.preferences.orbitButtons.value.has(pressedButton)) {
        //       orbit = true;
        //       this.findCameraTarget();
        //     }
        //     this.preferences.rotateButtons.value.has(pressedButton) ? rotate = true : '';
        // })
        // editorContainer.addEventListener("mouseup", (event) => {
        //     const pressedButton = event.button;
        //     this.preferences.panButtons.value.has(pressedButton) ? pan = false : '';
        //     this.preferences.orbitButtons.value.has(pressedButton) ? orbit = false : '';
        //     this.preferences.rotateButtons.value.has(pressedButton) ? rotate = false : '';
        // })
        // editorContainer.addEventListener("mousemove", (event) => {
        //     pan ? this.pan(event, transform) : "";
        //     rotate ? this.rotate(event, transform) : "";
        //     orbit ? this.orbit(event, transform) : "";
        // })
        // editorContainer.addEventListener("wheel", (event) => this.mouseWheel(event, transform));

        if(Input..subscribe(() => this.pan())
    }

    public click(click: MouseEvent): void {}

    public mouseDown(): void {}

    public mouseUp(): void {}

    public pan(event: MouseEvent, transform: Transform): void {
        const dx = event.movementX * this.preferences.xPanSensivity.value * this.preferences.xPanDirection.value;
        const dy = event.movementY * this.preferences.yPanSensivity.value * this.preferences.yPanDirection.value;
        transform.translateLocal(dx, dy, 0);
    }

    public orbit(event: MouseEvent, transform: Transform): void {
        const position = transform.position;

        const dx = position.x.value - this.target[0];
        const dy = position.y.value - this.target[1];
        const dz = position.z.value - this.target[2];

        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let yaw = Math.atan2(dx, dz);
        let pitch = Math.asin(dy / distance);

        const smooth = MathUtils.smooth(distance, this.preferences.orbitSmoothness.value)
        const deltaYaw = event.movementX * this.preferences.yawOrbitSensivity.value * this.preferences.yawOrbitDirection.value * smooth;
        const deltaPitch = event.movementY * this.preferences.pitchOrbitSensivity.value * this.preferences.pitchOrbitDirection.value * smooth;

        pitch = MathUtils.clamp(pitch + deltaPitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
        yaw += deltaYaw;

        const newX = this.target[0] + distance * Math.cos(pitch) * Math.sin(yaw);
        const newY = this.target[1] + distance * Math.sin(pitch);
        const newZ = this.target[2] + distance * Math.cos(pitch) * Math.cos(yaw);

        transform.position.set(newX, newY, newZ);

        const dir: [number, number, number] = [this.target[0] - newX, this.target[1] - newY, this.target[2] - newZ];

        const newYaw = MathUtils.rad2deg(Math.atan2(dir[0], dir[2]));
        const newPitch = MathUtils.rad2deg(Math.atan2(dir[1], Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2]))) * -1;

        transform.rotation.set(newPitch, newYaw, 0);
    }

    public rotate(event: MouseEvent, transform: Transform): void {
        transform.rotation.x.value += event.movementY * this.preferences.pitchRotateSensivity.value * this.preferences.pitchRotateDirection.value;
        transform.rotation.y.value += event.movementX * this.preferences.yawRotateSensivity.value * this.preferences.yawRotateDirection.value;
        
        transform.rotation.x.value = MathUtils.clamp(transform.rotation.x.value, -this.max_pitch, this.max_pitch);
    }

    public mouseWheel(event: WheelEvent, transform: Transform): void {
        const dz = event.deltaY * this.preferences.zoomSensivity.value * this.preferences.zoomDirection.value;
        transform.translateLocal(0, 0, dz);
    }

    public findCameraTarget(): void {
        this.target = [0, 0, 0];

        // const normalX: [number, number, number] = [1, 0, 0];
        // const normalY: [number, number, number] = [0, 1, 0];
        // const normalZ: [number, number, number] = [0, 0, 1];

        // let closestT = Infinity;
        // let hitPoint: [number, number, number] | null = null;

        // const up: [number, number, number] = [transform.up()[0], transform.up()[1], transform.up()[2]];
        // const forward: [number, number, number] = [transform.forward()[0], transform.forward()[1], transform.forward()[2]];

        // for (const planeNormal of [normalX, normalY, normalZ]) {
        //     const t = VectorUtils.intersectRayPlane(transform.position.getValues(), up, planeNormal, [0, 0, 0]);
        //     if (t !== null && t < closestT) {
        //         closestT = t;
        //         hitPoint = VectorUtils.scaleAndAdd(transform.position.getValues(), forward, t);
        //     }
        // }

        // if(hitPoint != null) this.target = hitPoint;
    }
}