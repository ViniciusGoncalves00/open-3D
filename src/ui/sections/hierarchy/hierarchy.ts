import { Entity } from "../../../core/api/entity";
import { EntityHandler } from "../../others/entity-handler";
import { Section } from "../base";
import { Builder, Icons } from "../builder";

export class Hierarchy extends Section {
    private _scene: Entity;
    private _entityHandler: EntityHandler;

    public constructor(scene: Entity, entityHandler: EntityHandler) {
        super(Hierarchy.name, Icons.Nested);

        this._scene = scene;
        this._entityHandler = entityHandler;
    
        scene.children.subscribe({
          onAdd: (entity) => this.constructHierarchy(),
          onRemove: (entity) => this.constructHierarchy()
        });
    
        const newSceneButton = Builder.button("New Entity", () => entityHandler.addEntity());
        this.subHeader.appendChild(newSceneButton);
    
        this.constructHierarchy();
    }

    public constructHierarchy(): void {
        this.sectionBody.innerHTML = '';

        const length = this._scene.children.items.length;
        for (let i = 0; i < length; i++) {
            const child = this._scene.children.items[i];
            const isLast = i === length - 1;
            this.constructEntity(child, 0, isLast);
        }
    }

    private constructEntity(entity: Entity, depth: number, isLast: boolean): void {
        const template = document.createElement('template');
        template.innerHTML = `
            <div role="wrapper" id="${entity.id}" class="w-full h-6 flex items-center justify-between text-xs ${entity.enabled.value ? "" : "opacity-50"} hover:font-medium hover:bg-gray-09">
                <span role="offset"></span>
                <button role="opened" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer ${Icons.SquareMinus}"></button>
                <button role="closed" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer hidden ${Icons.SquarePlus}"></button>
                <button role="main" class="w-full truncate flex items-center justify-start text-sm cursor-pointer">${entity.name.value}</button>
                <button role="remove" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer ${Icons.Trash}"></button>
            </div>
        `

        const wrapper = template.content.querySelector(`[role="wrapper"]`) as HTMLDivElement;
        const offset = template.content.querySelector(`[role="offset"]`) as HTMLSpanElement;
        const opened = template.content.querySelector(`[role="opened"]`) as HTMLButtonElement;
        const closed = template.content.querySelector(`[role="closed"]`) as HTMLButtonElement;
        const main = template.content.querySelector(`[role="main"]`) as HTMLButtonElement;
        const remove = template.content.querySelector(`[role="remove"]`) as HTMLButtonElement;

        entity.enabled.subscribe(() => wrapper.classList.toggle("opacity-50"));

        offset.style.width = `${depth * 24}px`;

        let isVisible = true;

        const toggleChildrenVisibility = () => {
            isVisible = !isVisible;
            this.setChildrenVisibility(entity, isVisible);
        
            opened.classList.toggle("hidden", !isVisible);
            closed.classList.toggle("hidden", isVisible);
        };

        opened.addEventListener("click", toggleChildrenVisibility.bind(this));
        closed.addEventListener("click", toggleChildrenVisibility.bind(this));

        main.addEventListener("click", () => {
            if(this._entityHandler.selectedEntity.value == entity) {
                this._entityHandler.selectedEntity.value = null;
            }
            else {
                this._entityHandler.selectedEntity.value = entity;
            }
        })
        entity.name.subscribe((name) => main.textContent = name);

        remove.addEventListener("click", () => {
          this._entityHandler.removeEntity(entity.id);
          this.constructHierarchy();
        });

        const element = template.content.firstElementChild as HTMLElement;
        this.sectionBody.appendChild(element);

        depth += 1;
        const length = entity.children.items.length;

        for (let i = 0; i < length; i++) {
            const child = entity.children.items[i];
            const isLast = i === length - 1;
            this.constructEntity(child, depth, isLast);
        }
    }

    private setChildrenVisibility(entity: Entity, visible: boolean) {
        const entityChildIds = new Set(this.collectAllChildIds(entity));

        Array.from(this.sectionBody.children).forEach(element => {
            if (entityChildIds.has(element.id)) {
                if (visible) {
                    element.classList.remove("hidden");
                } else {
                    element.classList.add("hidden");
                }
            }
        })
    }

    private collectAllChildIds(entity: Entity): Set<string> {
        const ids = new Set<string>();

        function walk(e: Entity) {
            e.children.items.forEach(child => {
                ids.add(child.id);
                walk(child);
            });
        }

        walk(entity);
        return ids;
    }
}