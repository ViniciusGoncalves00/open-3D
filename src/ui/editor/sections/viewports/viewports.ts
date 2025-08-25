import { Transform } from "../../../../assets/components/transform";
import { InputHandler } from "../../others/input-handler";

export class Viewports {
  private _editorContainer: HTMLCanvasElement;
  private _previewContainer: HTMLCanvasElement;

  public constructor(editorContainer: HTMLCanvasElement, previewContainer: HTMLCanvasElement, inputHandler: InputHandler, transform: Transform) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    let pan = false;
    let orbit = false;
    let rotate = false;

    editorContainer.addEventListener("mousedown", (event) => {
        const pressedButton = event.button;
        inputHandler.preferences.panButtons.value.has(pressedButton) ? pan = true : '';
        if(inputHandler.preferences.orbitButtons.value.has(pressedButton)) {
          orbit = true;
          inputHandler.findCameraTarget();
        }
        inputHandler.preferences.rotateButtons.value.has(pressedButton) ? rotate = true : '';
    })
    editorContainer.addEventListener("mouseup", (event) => {
        const pressedButton = event.button;
        inputHandler.preferences.panButtons.value.has(pressedButton) ? pan = false : '';
        inputHandler.preferences.orbitButtons.value.has(pressedButton) ? orbit = false : '';
        inputHandler.preferences.rotateButtons.value.has(pressedButton) ? rotate = false : '';
    })
    editorContainer.addEventListener("mousemove", (event) => {
        pan ? inputHandler.pan(event, transform) : "";
        rotate ? inputHandler.rotate(event, transform) : "";
        orbit ? inputHandler.orbit(event, transform) : "";
    })
    editorContainer.addEventListener("wheel", (event) => inputHandler.mouseWheel(event, transform));
  }

  public toggleHighlight(): void {
    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    this._previewContainer.classList.toggle("border")
    this._previewContainer.classList.toggle("border-white")
  }
}