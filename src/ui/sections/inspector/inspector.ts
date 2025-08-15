import { Section } from "../base";
import { Orbit } from "../../../assets/components/orbit";
import { Rotate } from "../../../assets/components/rotate";
import { Transform } from "../../../assets/components/transform";
import { Entity } from "../../../core/api/entity";
import { Dropdown, DropdownItem } from "../components/dropdown";
import { EntityHandler } from "../../others/entity-handler";
import { Mesh } from "../../../assets/components/mesh";
import { Component } from "../../../assets/components/abstract/component";
import { Engine } from "../../../core/engine/engine";
import { Hierarchy } from "../hierarchy/hierarchy";
import { Icons } from "../builder";
import { DirectionalLight } from "../../../assets/components/directional-light";
import { Builder } from "./builder";

export class Inspector extends Section {
  private engine: Engine;
  private entityHandler: EntityHandler;
  private hierarchy: Hierarchy;

  public constructor(engine: Engine, entityHandler: EntityHandler, hierarchy: Hierarchy) {
    super("Inspector", Icons.Info);

    this.engine = engine;
    this.entityHandler = entityHandler;
    this.hierarchy = hierarchy;

    this.entityHandler.selectedEntity?.subscribe(() => {
      const entity = this.entityHandler.selectedEntity.value;
      entity?.components.subscribe({
          onAdd: (component) => this.update(),
          onRemove: (component) => this.update(),
        });
      this.update();
    });
  }

  public update() {
    this.sectionBody.innerHTML = "";
    if (!this.entityHandler.selectedEntity.value) return;

    const main = this.main(this.entityHandler.selectedEntity.value)
    this.sectionBody.appendChild(main);

    this.entityHandler.selectedEntity.value.getComponents().forEach((component: Component) => {
      const componentUI = Builder.buildComponent(this.engine.currentProject.value.activeScene.value, this.entityHandler.selectedEntity.value as Entity, component);
      this.sectionBody.appendChild(componentUI);
    });
  }

    private main(entity: Entity): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div id=${entity.id} class="bg-gray-06 w-full flex flex-col space-y-2 py-2 text-sm text-text-primary">
                <div class="w-full h-8 flex items-center p-2 space-x-2">
                    <div class="h-full aspect-square flex items-center justify-center">
                        <input role="enabled" type="checkbox" ${entity.enabled.value ? "checked" : ""} class="w-full h-full">
                    </div>
                    <div class="w-full h-full flex items-center justify-center">
                        <input role="name" placeholder="${entity.name.value}" value="${entity.name.value}" class="bg-gray-08 w-full h-full font-medium outline outline-gray-01">
                    </div>
                </div>
                <div class="w-full h-6 flex items-center px-2">
                    <label class="w-1/4 h-full">id</label>
                    <p class="w-3/4 h-full truncate">${entity.id}</p>
                </div>
                <div class="w-full h-6 flex items-center px-2">
                    <label class="w-1/4 h-full">layer</label>
                    <p class="w-3/4 h-full truncate">not available yet</p>
                </div>
                <div class="w-full h-6 flex items-center px-2">
                    <label class="w-1/4 h-full">tags</label>
                    <p class="w-3/4 h-full truncate">not available yet</p>
                </div>
                <div class="w-full flex items-center px-2">
                    <label class="w-1/4 h-full">parent</label>
                    <div role="parent" class="w-3/4 h-full"></div>
                </div>
                <div class="w-full h-6 flex items-center px-2">
                    <div role="components" class="w-full h-full"></div>
                </div>
            </div>
        `

        const enabled = template.content.querySelector(`[role="enabled"]`) as HTMLInputElement;
        enabled.addEventListener('input', () => entity.enabled.value = enabled.checked);
        entity.enabled.subscribe(value => enabled.checked = value);
        
        const name = template.content.querySelector(`[role="name"]`) as HTMLInputElement;
        name.addEventListener('input', () => entity.name.value = name.value);
        entity.name.subscribe(value => name.value = value);

        const entitiesRepresentation: DropdownItem[] = [];

        entitiesRepresentation.push({
          label: this.engine.currentProject.value.activeScene.value.name.value,
          action: () => entity.parent = this.engine.currentProject.value.activeScene.value,
        });

        const scene = this.engine.currentProject.value.activeScene.value;
        const selectedId = entity.id;

        const appendEntitiesRecursively = (current: Entity, depth: number = 0) => {
          if (current.id === selectedId) return;
        
          const transform = current.getComponent(Transform);
          if (!transform) return;
        
          const indent = "  ".repeat(depth);
          entitiesRepresentation.push({
            label: `${indent}${current.name.value}`,
            action: () => {
              entity.parent = current;
              this.hierarchy.constructHierarchy();
            },
          });
      
          for (const child of current.children.items) {
            appendEntitiesRecursively(child, depth + 1);
          }
        };

        for (const rootEntity of scene.children.items) {
          appendEntitiesRecursively(rootEntity);
        }

        const initialValue = entity.parent.value
          ? entity.parent.value.name.value
          : "None";

        const parentDropdown = new Dropdown(entitiesRepresentation, initialValue);
        const parentElement = template.content.querySelector(`[role="parent"]`) as HTMLButtonElement;
        parentElement.appendChild(parentDropdown.getElement());

        const items = [
            { label: "Transform", action: () => this.entityHandler.selectedEntity.value?.addComponent(new Transform(true, this.entityHandler.selectedEntity.value))},
            { label: "Rotate", action: () => this.entityHandler.selectedEntity.value?.addComponent(new Rotate())},
            { label: "Orbit", action: () => this.entityHandler.selectedEntity.value?.addComponent(new Orbit())},
            { label: "Mesh", action: () => this.entityHandler.selectedEntity.value?.addComponent(new Mesh())},
            { label: "DirectionalLight", action: () => this.entityHandler.selectedEntity.value?.addComponent(new DirectionalLight())},
        ]

        const componentsDropdown = new Dropdown(items, null, "✛ ADD COMPONENT");
        const componentsElement = template.content.querySelector(`[role="components"]`) as HTMLButtonElement;
        componentsElement.appendChild(componentsDropdown.getElement());

        return template.content.firstElementChild as HTMLElement;
    }

    private components(): void {   

    }   
    private other(): void { 

    }
}