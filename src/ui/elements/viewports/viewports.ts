export class Viewports {
  private _editorContainer: HTMLElement;
  private _previewContainer: HTMLElement;

  public constructor(editorContainer: HTMLElement, previewContainer: HTMLElement) {
    this._editorContainer = editorContainer;
    this._previewContainer = previewContainer;

    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")
  }

  public toggleHighlight(): void {
    this._editorContainer.classList.toggle("border")
    this._editorContainer.classList.toggle("border-white")

    this._previewContainer.classList.toggle("border")
    this._previewContainer.classList.toggle("border-white")
  }
}