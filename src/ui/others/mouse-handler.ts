import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";

export class MouseHandler {
    private xSensivity = 0.01;
    private ySensivity = 0.01;
    private zSensivity = 0.01;
    private rotateSensivity = 0.1;

    private xDirection = 1;
    private yDirection = 1;
    private zDirection = -1;
    private yawDirection = -1;
    private pitchDirection = 1;

    private transform: Transform;
    private camera: Camera;
    private lastPosition: [number, number] | null = null;

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
        // const sensitivity = 0.005;

        // const target = vec3.fromValues(0, 0, 0);

        // const direction = vec3.create();
        // vec3.subtract(direction, this.transform.position.getValues(), target);
        // const radius = vec3.length(direction);

        // let theta = Math.atan2(direction[0], direction[2]);
        // let phi = Math.acos(direction[1] / radius);

        // theta -= event.movementX * sensitivity;
        // phi -= event.movementY * sensitivity;

        // const epsilon = 0.01;
        // phi = Math.max(epsilon, Math.min(Math.PI - epsilon, phi));

        // const newPos = vec3.fromValues(
        //     radius * Math.sin(phi) * Math.sin(theta),
        //     radius * Math.cos(phi),
        //     radius * Math.sin(phi) * Math.cos(theta)
        // );

        // this.transform.position.set(newPos[0], newPos[1], newPos[2]);

        // const lookAtMatrix = mat4.create();
        // mat4.lookAt(lookAtMatrix, newPos, target, [0, 1, 0]);

        // const rotationMatrix = mat4.create();
        // mat4.copy(rotationMatrix, lookAtMatrix);
        // mat4.invert(rotationMatrix, rotationMatrix);

        // const euler = vec3.create();
        // euler[0] = Math.atan2(rotationMatrix[6], rotationMatrix[10]);
        // euler[1] = Math.atan2(-rotationMatrix[2], Math.sqrt(rotationMatrix[0]**2 + rotationMatrix[1]**2));
        // euler[2] = Math.atan2(rotationMatrix[1], rotationMatrix[0]);
        // this.transform.rotation.set(euler[0], euler[1], euler[2]);
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