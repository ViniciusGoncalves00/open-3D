import { Entity } from "../../../core/api/entity";
import { EntityHandler } from "../../handlers/entity-handler";

export class Hierarchy {
  private _scene: Entity;
  private _entitiesContainer: HTMLElement;
  private _entityHandler: EntityHandler;

  public constructor(scene: Entity, entitiesContainer: HTMLElement, entityHandler: EntityHandler) {
    this._scene = scene;
    this._entitiesContainer = entitiesContainer;
    this._entityHandler = entityHandler;
  }

  public constructHierarchy(): void {
    this._entitiesContainer.innerHTML = '';
    this._scene.children.items.forEach(child => this.constructEntity(child, this._entitiesContainer));
  }

  private constructEntity(entity: Entity, container: HTMLElement): void {
    const wrapper = document.createElement("div");
    wrapper.id = entity.id;
    wrapper.classList.add("w-full", "flex", "flex-col");

    const head = document.createElement("div");
    head.classList.add("w-full", "h-6", "flex", "items-center", "justify-between", "pr-2", "opacity-70", "hover:opacity-100");
    head.addEventListener("click", () => this._entityHandler.selectedEntity.value = entity);

    const body = document.createElement("div");
    body.classList.add("w-full", "flex", "flex-col");
    body.style.paddingLeft = `24px`;
  
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("h-full", "w-full", "flex", "items-center", "space-x-2");
  
    const caretDown = document.createElement("div");
    caretDown.classList.add("h-full", "bi", "bi-caret-down-fill");
    caretDown.addEventListener("click", () => {
      Array.from(body.children).forEach(element => element.classList.toggle("hidden"));
      caretDown.classList.toggle("hidden");
      caretRight.classList.toggle("hidden");
    })

    const caretRight = document.createElement("div");
    caretRight.classList.add("h-full", "bi", "bi-caret-right-fill", "hidden");
    caretRight.addEventListener("click", () => {
      Array.from(body.children).forEach(element => element.classList.toggle("hidden"));
      caretRight.classList.toggle("hidden");
      caretDown.classList.toggle("hidden");
    })
  
    const boxIcon = document.createElement("i");
    boxIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-box");
  
    const nameParagraph = document.createElement("p");
    nameParagraph.classList.add("w-full", "whitespace-nowrap", "overflow-ellipsis");
    nameParagraph.textContent = entity.name.value;
    entity.name.subscribe((name) => nameParagraph.textContent = name);
  
    leftContainer.appendChild(caretDown);
    leftContainer.appendChild(caretRight);
    leftContainer.appendChild(boxIcon);
    leftContainer.appendChild(nameParagraph);
        
    const trashIcon = document.createElement("i");
    trashIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-trash", "cursor-pointer");
    trashIcon.addEventListener("click", () => {
      this._entityHandler.removeEntity(entity.id);
      this.constructHierarchy();
    });
  
    head.appendChild(leftContainer);
    head.appendChild(trashIcon);

    wrapper.appendChild(head);
    wrapper.appendChild(body);

    container.appendChild(wrapper);

    entity.children.items.forEach(entity => this.constructEntity(entity, body));
  }
}