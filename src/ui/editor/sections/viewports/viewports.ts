import { InputManager } from "../../others/input-manager";
import { InputHandler } from "../../others/input-handler";

export class Viewports {
  private _editorContainer: HTMLCanvasElement;
  private _previewContainer: HTMLCanvasElement;

  public constructor(editorContainer: HTMLCanvasElement, previewContainer: HTMLCanvasElement, mouseHandler: InputHandler) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    let pan = false;
    let orbit = false;
    let rotate = false;

    editorContainer.addEventListener("mousedown", (event) => {
        const pressedButton = event.button;
        InputManager.moveButtons.has(pressedButton) ? pan = true : '';
        if(InputManager.orbitButtons.has(pressedButton)) {
          orbit = true;
          mouseHandler.findCameraTarget();
        }
        InputManager.rotateButtons.has(pressedButton) ? rotate = true : '';
    })
    editorContainer.addEventListener("mouseup", (event) => {
        const pressedButton = event.button;
        InputManager.moveButtons.has(pressedButton) ? pan = false : '';
        InputManager.orbitButtons.has(pressedButton) ? orbit = false : '';
        InputManager.rotateButtons.has(pressedButton) ? rotate = false : '';
    })
    editorContainer.addEventListener("mousemove", (event) => {
        pan ? mouseHandler.pan(event) : "";
        rotate ? mouseHandler.rotate(event) : "";
        orbit ? mouseHandler.orbit(event) : "";
    })
    editorContainer.addEventListener("wheel", (event) => mouseHandler.mouseWheel(event));
  }

  public toggleHighlight(): void {
    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    this._previewContainer.classList.toggle("border")
    this._previewContainer.classList.toggle("border-white")
  }
}