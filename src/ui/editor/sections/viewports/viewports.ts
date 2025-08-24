import { InputHandler } from "../../others/input-handler";

export class Viewports {
  private _editorContainer: HTMLCanvasElement;
  private _previewContainer: HTMLCanvasElement;

  public constructor(editorContainer: HTMLCanvasElement, previewContainer: HTMLCanvasElement, inputHandler: InputHandler) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    let pan = false;
    let orbit = false;
    let rotate = false;

    editorContainer.addEventListener("mousedown", (event) => {
        const pressedButton = event.button;
        inputHandler.panButtons.value.has(pressedButton) ? pan = true : '';
        if(inputHandler.orbitButtons.value.has(pressedButton)) {
          orbit = true;
          inputHandler.findCameraTarget();
        }
        inputHandler.rotateButtons.value.has(pressedButton) ? rotate = true : '';
    })
    editorContainer.addEventListener("mouseup", (event) => {
        const pressedButton = event.button;
        inputHandler.panButtons.value.has(pressedButton) ? pan = false : '';
        inputHandler.orbitButtons.value.has(pressedButton) ? orbit = false : '';
        inputHandler.rotateButtons.value.has(pressedButton) ? rotate = false : '';
    })
    editorContainer.addEventListener("mousemove", (event) => {
        pan ? inputHandler.pan(event) : "";
        rotate ? inputHandler.rotate(event) : "";
        orbit ? inputHandler.orbit(event) : "";
    })
    editorContainer.addEventListener("wheel", (event) => inputHandler.mouseWheel(event));
  }

  public toggleHighlight(): void {
    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    this._previewContainer.classList.toggle("border")
    this._previewContainer.classList.toggle("border-white")
  }
}