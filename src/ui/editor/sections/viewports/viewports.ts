import { Transform } from "../../../../assets/components/transform";
import { EditorCamera } from "../../others/editor-camera";

export class Viewports {
  private _editorContainer: HTMLCanvasElement;
  private _previewContainer: HTMLCanvasElement;

  public constructor(editorContainer: HTMLCanvasElement, previewContainer: HTMLCanvasElement, editorCamera: EditorCamera, transform: Transform) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    let pan = false;
    let orbit = false;
    let rotate = false;

    editorContainer.addEventListener("mousedown", (event) => {
        const pressedButton = event.button;
        editorCamera.preferences.panButtons.value.has(pressedButton) ? pan = true : '';
        if(editorCamera.preferences.orbitButtons.value.has(pressedButton)) {
          orbit = true;
          editorCamera.findCameraTarget();
        }
        editorCamera.preferences.rotateButtons.value.has(pressedButton) ? rotate = true : '';
    })
    editorContainer.addEventListener("mouseup", (event) => {
        const pressedButton = event.button;
        editorCamera.preferences.panButtons.value.has(pressedButton) ? pan = false : '';
        editorCamera.preferences.orbitButtons.value.has(pressedButton) ? orbit = false : '';
        editorCamera.preferences.rotateButtons.value.has(pressedButton) ? rotate = false : '';
    })
    editorContainer.addEventListener("mousemove", (event) => {
        pan ? editorCamera.pan(event, transform) : "";
        rotate ? editorCamera.rotate(event, transform) : "";
        orbit ? editorCamera.orbit(event, transform) : "";
    })
    editorContainer.addEventListener("wheel", (event) => editorCamera.mouseWheel(event, transform));
  }

  public toggleHighlight(): void {
    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    this._previewContainer.classList.toggle("border")
    this._previewContainer.classList.toggle("border-white")
  }
}