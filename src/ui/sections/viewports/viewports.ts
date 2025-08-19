import { InputManager } from "../../others/input-manager";
import { MouseHandler } from "../../others/mouse-handler";

export class Viewports {
  private _editorContainer: HTMLCanvasElement;
  private _previewContainer: HTMLCanvasElement;

  public constructor(editorContainer: HTMLCanvasElement, previewContainer: HTMLCanvasElement, mouseHandler: MouseHandler) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    let pan = false;
    let orbit = false;
    let rotate = false;

    editorContainer.addEventListener("mousedown", (event) => {
        InputManager.moveButtons.has(event.button) ? pan = true : '';
        InputManager.orbitButtons.has(event.button) ? orbit = true : '';
        InputManager.rotateButtons.has(event.button) ? rotate = true : '';
    })
    editorContainer.addEventListener("mouseup", (event) => {
        InputManager.moveButtons.has(event.button) ? pan = false : '';
        InputManager.orbitButtons.has(event.button) ? orbit = false : '';
        InputManager.rotateButtons.has(event.button) ? rotate = false : '';
    })
    editorContainer.addEventListener("mousemove", (event) => {
        pan ? mouseHandler.translate(event) : "";
        orbit ? mouseHandler.orbit(event) : "";
        rotate ? mouseHandler.rotate(event) : "";
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