import { Entity } from "../../../core/api/entity";
import { Project } from "../../../core/engine/project";

export class SceneManager {
  private _container: HTMLElement;
  private _project: Project;

  public constructor(container: HTMLElement, project: Project) {
    this._container = container;
    this._project = project;

    this._project.scenes.subscribe({
        onAdd: () => this.build(),
        onRemove: () => this.build()
    });

    this.build();
  }

  private build(): void {
    this._container.innerHTML = ''
    this._project.scenes.items.forEach(child => this.buildItem(child, this._container));
  }

  private buildItem(scene: Entity, container: HTMLElement): void {
    const row = document.createElement("div");
    row.classList.add("w-full", "h-6", "flex", "items-center", "justify-between", "pr-2", "cursor-pointer", "opacity-70", "hover:opacity-100");
    
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("h-full", "w-full", "flex", "items-center", "space-x-2");
    if(this._project.activeScene.value.id !== scene.id) leftContainer.addEventListener("click", () => window.location.href = `editor.html?projectId=${this._project.id}&sceneId=${scene.id}`);
  
    const boxIcon = document.createElement("i");
    boxIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-box");
  
    const nameParagraph = document.createElement("p");
    nameParagraph.classList.add("w-full", "whitespace-nowrap", "overflow-ellipsis");
    nameParagraph.textContent = scene.name.value;
    scene.name.subscribe((name) => nameParagraph.textContent = name);
  
    leftContainer.appendChild(boxIcon);
    leftContainer.appendChild(nameParagraph);
    row.appendChild(leftContainer);
       
    if(this._project.activeScene.value.id !== scene.id) {
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-trash", "cursor-pointer");
        trashIcon.addEventListener("click", () => this._project.DestroySceneById(scene.id));
        row.appendChild(trashIcon);
    }

    container.appendChild(row);
  }
}