import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";

export class MouseHandler {
    private readonly RAD2DEG = 57.29578;

    private xSensivity = 0.01;
    private ySensivity = 0.01;
    private zSensivity = 0.01;
    private rotateSensivity = 0.1;

    private xDirection = 1;
    private yDirection = 1;
    private zDirection = -1;
    private yawDirection = -1;
    private pitchDirection = 1;

    private xOrbitDirection = -1;
    private xOrbitSensivity = 0.01;
    private yOrbitDirection = -1;
    private yOrbitSensivity = 0.01;

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

    public translate(event: MouseEvent): void {
        const dx = event.movementX * this.xSensivity * this.xDirection;
        const dy = event.movementY * this.ySensivity * this.yDirection;
        this.transform.translateLocal(dx, dy, 0);
    }

    public orbit(event: MouseEvent): void {
        const position = this.transform.position;
        const target = vec3.fromValues(0, 0, 0);

        const dx = position.x.value - target[0];
        const dy = position.y.value - target[1];
        const dz = position.z.value - target[2];

        const radius = Math.sqrt(dx*dx + dy*dy + dz*dz);

        let yaw = Math.atan2(dx, dz);
        let pitch = Math.asin(dy / radius);

        const deltaYaw = event.movementX * this.yOrbitSensivity * this.yOrbitDirection;
        const deltaPitch = event.movementY * this.xOrbitSensivity * this.xOrbitDirection;

        pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch + deltaPitch));
        yaw += deltaYaw;

        const newX = target[0] + radius * Math.cos(pitch) * Math.sin(yaw);
        const newY = target[1] + radius * Math.sin(pitch);
        const newZ = target[2] + radius * Math.cos(pitch) * Math.cos(yaw);

        this.transform.position.set(newX, newY, newZ);

        const dir = vec3.fromValues(target[0] - newX, target[1] - newY, target[2] - newZ);

        const newYaw = Math.atan2(dir[0], dir[2]) * this.RAD2DEG;
        const newPitch = Math.atan2(dir[1], Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2])) * this.RAD2DEG * -1;

        this.transform.rotation.set(newPitch, newYaw, 0);
    }

    public rotate(event: MouseEvent): void {
        this.transform.rotation.x.value += event.movementY * this.rotateSensivity * this.pitchDirection;
        this.transform.rotation.y.value += event.movementX * this.rotateSensivity * this.yawDirection;

        this.transform.rotation.x.value = Math.max(-90, Math.min(90, this.transform.rotation.x.value));
    }


    public mouseWheel(event: WheelEvent): void {
        const dz = event.deltaY * this.zSensivity * this.zDirection;
        this.transform.translateLocal(0, 0, dz);
    }
}