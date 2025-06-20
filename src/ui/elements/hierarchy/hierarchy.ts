import { Entity } from "../../../core/api/entity";
import { EntityHandler } from "../../handlers/entity-handler";

export class Hierarchy {
  private _entitiesContainer: HTMLElement;
  private _entityHandler: EntityHandler;

  private _onSelectEntity: (entity: Entity) => void;

  public constructor(entitiesContainer: HTMLElement, onSelectEntity: (entity: Entity) => void, entityHandler: EntityHandler) {
      this._entitiesContainer = entitiesContainer;
      this._onSelectEntity = onSelectEntity;
      this._entityHandler = entityHandler;
  }

  public removeEntity(entity: Entity): void {
    this._entitiesContainer.querySelector(`#${CSS.escape(entity.id)}`)?.remove();
  }

  public addEntity(entity: Entity): void {        
    const entityLine = document.createElement("div");
    entityLine.id = entity.id;
    entityLine.classList.add("entity", "w-full", "h-6", "flex", "items-center", "justify-between", "px-2");
  
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("h-full", "w-full", "flex", "items-center", "space-x-2");
  
    const caretIcon = document.createElement("i");
    caretIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-caret-down-fill");
  
    const boxIcon = document.createElement("i");
    boxIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-box");
  
    const nameParagraph = document.createElement("p");
    nameParagraph.classList.add("w-full", "whitespace-nowrap", "overflow-ellipsis");
    nameParagraph.textContent = entity.name.value;
    entity.name.subscribe((name) => nameParagraph.textContent = name);
  
    leftContainer.appendChild(caretIcon);
    leftContainer.appendChild(boxIcon);
    leftContainer.appendChild(nameParagraph);
        
    const trashIcon = document.createElement("i");
    trashIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-trash");
    trashIcon.addEventListener("click", () => {
      this._entityHandler.removeEntity(entity.id);
      this._entityHandler.selectedEntity.value = null;
    })
  
    entityLine.appendChild(leftContainer);
    entityLine.appendChild(trashIcon);

    leftContainer.addEventListener("click", () => this.selectEntity(entity));              
        
    this._entitiesContainer.appendChild(entityLine);
  }

    public renderHierarchy(entities: Map<string, Entity>): void {
        this._entitiesContainer.innerHTML = "";
            
        entities.forEach(entity => {
            const entityLine = document.createElement("div");
            entityLine.classList.add("entity", "w-full", "h-6", "flex", "items-center", "justify-between", "px-2");
          
            const leftContainer = document.createElement("div");
            leftContainer.classList.add("h-full", "w-full", "flex", "items-center", "space-x-2");
          
            const caretIcon = document.createElement("i");
            caretIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-caret-down-fill");
          
            const boxIcon = document.createElement("i");
            boxIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-box");
          
            const nameParagraph = document.createElement("p");
            nameParagraph.classList.add("w-full", "whitespace-nowrap", "overflow-ellipsis");
            nameParagraph.textContent = entity.name.value;
            entity.name.subscribe((name) => nameParagraph.textContent = name);
          
            leftContainer.appendChild(caretIcon);
            leftContainer.appendChild(boxIcon);
            leftContainer.appendChild(nameParagraph);
          
            const trashIcon = document.createElement("i");
            trashIcon.classList.add("h-full", "flex", "items-center", "justify-center", "bi", "bi-trash");
            trashIcon.addEventListener("click", () => {
              this._entityHandler.removeEntity(entity.id);
              this._entityHandler.selectedEntity.value = null;
            })
          
            entityLine.appendChild(leftContainer);
            entityLine.appendChild(trashIcon);

            leftContainer.addEventListener("click", () => this.selectEntity(entity));              
          
            this._entitiesContainer.appendChild(entityLine);
          });
      }

    private selectEntity(entity: Entity) {
      this._onSelectEntity(entity);
      this.highlightEntityLine(entity.id);
    }

    private highlightEntityLine(selectedId: string) {
      const allLines = this._entitiesContainer.querySelectorAll(".entity");
      allLines.forEach(line => line.classList.remove("bg-zinc-800"));
    
      const selectedLine = Array.from(allLines).find(line =>
        line.textContent?.includes(selectedId)
      );
    
      if (selectedLine) {
        selectedLine.classList.add("bg-zinc-800");
      }
    }
}