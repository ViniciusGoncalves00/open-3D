import { Entity } from "../../../core/api/entity";
import { Project } from "../../../core/engine/project";
import { Utils } from "../../others/utils";
import { Builder, Icons } from "../builder";

export class SceneManager {
  public readonly element: HTMLElement;

  private project: Project;

  public constructor(project: Project) {
    this.element = Builder.section("SceneManager", Icons.Box);

    this.project = project;
    
    const newSceneButton = Builder.button("New Scene", () => {
        const scene = this.project.CreateScene();
        this.project.SetActiveScene(scene);
        window.location.href = `editor.html?projectId=${this.project.id}&sceneId=${scene.id}`;
    }) as HTMLButtonElement;
    
    const subheader = this.element.querySelector('[data-role="subHeader"]') as HTMLDivElement;
    subheader.appendChild(newSceneButton);

    const body = this.element.querySelector('[data-role="body"]') as HTMLDivElement;
    this.project.scenes.subscribe({
        onAdd: () => this.build(body),
        onRemove: () => this.build(body)
    });

    this.build(body);

    Utils.getElementOrFail<HTMLDivElement>("SceneManager").replaceWith(this.element);
  }

  private build(container: HTMLElement): void {
    container.innerHTML = ''
    this.project.scenes.items.forEach(child => this.buildItem(child, container));
  }

  private buildItem(scene: Entity, container: HTMLElement): void {
    const row = document.createElement("div");
    row.classList.add("w-full", "h-6", "flex", "items-center", "justify-between", "pr-2", "cursor-pointer", "opacity-70", "hover:opacity-100");
    
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("h-full", "w-full", "flex", "items-center", "space-x-2");
    if(this.project.activeScene.value.id !== scene.id) leftContainer.addEventListener("click", () => window.location.href = `editor.html?projectId=${this.project.id}&sceneId=${scene.id}`);
  
    const boxIcon = document.createElement("i");
    boxIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-box");
  
    const nameParagraph = document.createElement("p");
    nameParagraph.classList.add("w-full", "whitespace-nowrap", "overflow-ellipsis");
    nameParagraph.textContent = scene.name.value;
    scene.name.subscribe((name) => nameParagraph.textContent = name);
  
    leftContainer.appendChild(boxIcon);
    leftContainer.appendChild(nameParagraph);
    row.appendChild(leftContainer);
       
    if(this.project.activeScene.value.id !== scene.id) {
        const trashIcon = document.createElement("i");
        trashIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-trash", "cursor-pointer");
        trashIcon.addEventListener("click", () => this.project.DestroySceneById(scene.id));
        row.appendChild(trashIcon);
    }

    container.appendChild(row);
  }
}