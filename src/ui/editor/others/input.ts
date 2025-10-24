import { EditorPreferences } from "../../../database/editorPreferences";
import { KeyBinding } from "./key-binding";
import { ObservableField } from "../../../common/observer/observable-field";

export class Input {
    public static interactionEnabled: ObservableField<boolean> = new ObservableField(true);
    public static keyboardInteractionEnabled: ObservableField<boolean> = new ObservableField(false);

    public static spacebarPressed: ObservableField<boolean> = new ObservableField(false);
    public static shiftPressed: ObservableField<boolean> = new ObservableField(false);
    public static ctrlPressed: ObservableField<boolean> = new ObservableField(false);

    public static forward: ObservableField<boolean> = new ObservableField(false);
    public static backward: ObservableField<boolean> = new ObservableField(false);
    public static right: ObservableField<boolean> = new ObservableField(false);
    public static left: ObservableField<boolean> = new ObservableField(false);
    public static up: ObservableField<boolean> = new ObservableField(false);
    public static down: ObservableField<boolean> = new ObservableField(false);

    public static panning: ObservableField<boolean> = new ObservableField(false);
    public static rotating: ObservableField<boolean> = new ObservableField(false);
    public static orbiting: ObservableField<boolean> = new ObservableField(false);

    public static wheeling: ObservableField<boolean> = new ObservableField(false);
    public static wheelIn: ObservableField<boolean> = new ObservableField(false);
    public static wheelOut: ObservableField<boolean> = new ObservableField(false);

    public static localForwardSpeed: number;
    public static localRightSpeed: number;
    public static localUpSpeed: number;

    public static worldUpSpeed: number;
    public static wheelingSpeed: number;

    private static deltaPan: [number, number] = [0, 0];
    private static deltaRotate: [number, number] = [0, 0];
    private static deltaOrbit: [number, number] = [0, 0];

    private static readonly DEFAULT_LOCAL_FORWARD_SPEED: number = 10.0;
    private static readonly DEFAULT_LOCAL_RIGHT_SPEED: number = 10.0;
    private static readonly DEFAULT_LOCAL_UP_SPEED: number = 10.0;

    private static readonly DEFAULT_WORLD_UP_SPEED: number = 10.0;
    private static readonly DEFAULT_WHEELING_SPEED: number = 10.0;

    private static readonly SLOW_LOCAL_FORWARD_SPEED: number = 2.0;
    private static readonly SLOW_LOCAL_RIGHT_SPEED: number = 2.0;
    private static readonly SLOW_LOCAL_UP_SPEED: number = 2.0;

    private static readonly SLOW_WORLD_UP_SPEED: number = 2.0;
    private static readonly SLOW_WHEELING_SPEED: number = 2.0;

    private static readonly ACCELERATED_LOCAL_FORWARD_SPEED: number = 20.0;
    private static readonly ACCELERATED_LOCAL_RIGHT_SPEED: number = 20.0;
    private static readonly ACCELERATED_LOCAL_UP_SPEED: number = 20.0;

    private static readonly ACCELERATED_WORLD_UP_SPEED: number = 20.0;
    private static readonly ACCELERATED_WHEELING_SPEED: number = 20.0;

    private static activeCanvas: HTMLCanvasElement;
    private static preferences: EditorPreferences;

    public constructor(initialActiveCanvas: HTMLCanvasElement, preferences: EditorPreferences) {
        Input.activeCanvas = initialActiveCanvas;
        Input.preferences = preferences;

        Input.localForwardSpeed = Input.DEFAULT_LOCAL_FORWARD_SPEED;
        Input.localRightSpeed = Input.DEFAULT_LOCAL_RIGHT_SPEED;
        Input.worldUpSpeed = Input.DEFAULT_WORLD_UP_SPEED;
        Input.wheelingSpeed = Input.DEFAULT_WHEELING_SPEED;

        document.addEventListener("DOMContentLoaded", () => {
            this.mouseListeners();
            this.keyboardListeners();
        });
    }

    public setActiveCanvas(canvas: HTMLCanvasElement): void {
        Input.activeCanvas = canvas;
    }

    private mouseListeners(): void {
        Input.activeCanvas.addEventListener("mousedown", (event) => {
            if (Input.preferences.panButtons.value.has(event.button)) Input.panning.value = true;
            if (Input.preferences.rotateButtons.value.has(event.button)) Input.rotating.value = true;
            if (Input.preferences.orbitButtons.value.has(event.button)) Input.orbiting.value = true;
        });

        Input.activeCanvas.addEventListener("mouseup", (event) => {
            if (Input.preferences.panButtons.value.has(event.button)) Input.panning.value = false;
            if (Input.preferences.rotateButtons.value.has(event.button)) Input.rotating.value = false;
            if (Input.preferences.orbitButtons.value.has(event.button)) Input.orbiting.value = false;
        });

        Input.activeCanvas.addEventListener("mousemove", (event) => {
            Input.panning ? Input.deltaPan = [event.movementX, event.movementY] : [0, 0];
            Input.rotating ? Input.deltaRotate = [event.movementX, event.movementY] : [0, 0];
            Input.orbiting ? Input.deltaOrbit = [event.movementX, event.movementY] : [0, 0];
        });

        Input.activeCanvas.addEventListener("wheel", (event) => {
            Input.wheeling.value = true;

            if (event.deltaY < 0) {
                Input.wheelIn.value = true;
                Input.wheelOut.value = false;
            } else if (event.deltaY > 0) {
                Input.wheelOut.value = true;
                Input.wheelIn.value = false;
            }

            setTimeout(() => {
                Input.wheeling.value = false;
                Input.wheelIn.value = false;
                Input.wheelOut.value = false;
            }, 50);
        });
    }

    private keyboardListeners(): void {
        document.addEventListener("focusin", (event) => {
            const target = event.target as HTMLElement;
            if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
                Input.keyboardInteractionEnabled.value = false;
            }
        });

        document.addEventListener("focusout", (event) => {
            requestAnimationFrame(() => {
                const active = document.activeElement as HTMLElement | null;
                if (!active || !["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) {
                    Input.keyboardInteractionEnabled.value = true;
                }
            });
        });

        document.addEventListener("keydown", (event) => {
            if (!Input.keyboardInteractionEnabled) return;

            if (event.key == KeyBinding.SHIFT) {
                Input.shiftPressed.value = true;
                Input.localForwardSpeed = Input.ACCELERATED_LOCAL_FORWARD_SPEED;
                Input.localRightSpeed = Input.ACCELERATED_LOCAL_RIGHT_SPEED;
                Input.worldUpSpeed = Input.ACCELERATED_WORLD_UP_SPEED;
                Input.wheelingSpeed = Input.ACCELERATED_WHEELING_SPEED;
            }
            if (event.key == KeyBinding.SPACEBAR) {
                Input.spacebarPressed.value = true;
                Input.localForwardSpeed = Input.SLOW_LOCAL_FORWARD_SPEED;
                Input.localRightSpeed = Input.SLOW_LOCAL_RIGHT_SPEED;
                Input.worldUpSpeed = Input.SLOW_WORLD_UP_SPEED;
                Input.wheelingSpeed = Input.SLOW_WHEELING_SPEED;
            }

            const key = event.key.toLowerCase();
            if (key === KeyBinding.FORWARD) Input.forward.value = true;
            if (key === KeyBinding.BACKWARD) Input.backward.value = true;
            if (key === KeyBinding.RIGHT) Input.right.value = true;
            if (key === KeyBinding.LEFT) Input.left.value = true;
            if (key === KeyBinding.UP) Input.up.value = true;
            if (key === KeyBinding.DOWN) Input.down.value = true;
        });

        document.addEventListener("keyup", (event) => {
            if (!Input.keyboardInteractionEnabled) return;

            if (event.key == KeyBinding.SHIFT) {
                Input.shiftPressed.value = false;
                Input.localForwardSpeed = Input.DEFAULT_LOCAL_FORWARD_SPEED;
                Input.localRightSpeed = Input.DEFAULT_LOCAL_RIGHT_SPEED;
                Input.worldUpSpeed = Input.DEFAULT_WORLD_UP_SPEED;
                Input.wheelingSpeed = Input.DEFAULT_WHEELING_SPEED;
            }
            if (event.key == KeyBinding.SPACEBAR) {
                Input.spacebarPressed.value = false;
                Input.localForwardSpeed = Input.DEFAULT_LOCAL_FORWARD_SPEED;
                Input.localRightSpeed = Input.DEFAULT_LOCAL_RIGHT_SPEED;
                Input.worldUpSpeed = Input.DEFAULT_WORLD_UP_SPEED;
                Input.wheelingSpeed = Input.DEFAULT_WHEELING_SPEED;
            }

            const key = event.key.toLowerCase();
            if (key === KeyBinding.FORWARD) Input.forward.value = false;
            if (key === KeyBinding.BACKWARD) Input.backward.value = false;
            if (key === KeyBinding.RIGHT) Input.right.value = false;
            if (key === KeyBinding.LEFT) Input.left.value = false;
            if (key === KeyBinding.UP) Input.up.value = false;
            if (key === KeyBinding.DOWN) Input.down.value = false;
        });
    }

    private reset(): void {
        Input.shiftPressed.value = false;
        Input.spacebarPressed.value = false;
        Input.forward.value = false;
        Input.backward.value = false;
        Input.right.value = false;
        Input.left.value = false;
        Input.up.value = false;
        Input.down.value = false;

        Input.panning.value = false;
        Input.rotating.value = false;
        Input.orbiting.value = false;

        Input.localForwardSpeed = Input.DEFAULT_LOCAL_FORWARD_SPEED;
        Input.localRightSpeed = Input.DEFAULT_LOCAL_RIGHT_SPEED;
        Input.worldUpSpeed = Input.DEFAULT_WORLD_UP_SPEED;
        Input.wheelingSpeed = Input.DEFAULT_WHEELING_SPEED;
    }
}
