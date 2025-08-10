import { Section } from "../base";
import { Orbit } from "../../../assets/components/orbit";
import { Rotate } from "../../../assets/components/rotate";
import { Transform } from "../../../assets/components/transform";
import { Entity } from "../../../core/api/entity";
import { Dropdown, DropdownItem } from "../components/dropdown";
import { ComponentUI } from "./component-ui";
import { EntityHandler } from "../../others/entity-handler";
import { Mesh } from "../../../assets/components/mesh";
import { Component } from "../../../assets/components/abstract/component";
import { Engine } from "../../../core/engine/engine";
import { Hierarchy } from "../hierarchy/hierarchy";
import { Icons } from "../builder";
import { DirectionalLight } from "../../../assets/components/directional-light";

export class Inspector extends Section {
  private _engine: Engine;
  private _entityHandler: EntityHandler;
  private _hierarchy: Hierarchy;

  public constructor(engine: Engine, entityHandler: EntityHandler, hierarchy: Hierarchy) {
    super("Inspector", Icons.Info);

    this.sectionBody.classList.add("space-y-2");

    this._engine = engine;
    this._entityHandler = entityHandler;
    this._hierarchy = hierarchy;

    this._entityHandler.selectedEntity?.subscribe(() => {
      const entity = this._entityHandler.selectedEntity.value;
      entity?.components.subscribe({
          onAdd: (component) => this.update(),
          onRemove: (component) => this.update(),
        });
      this.update();
    });
  }

  public update() {
    this.sectionBody.replaceChildren();
    if (!this._entityHandler.selectedEntity.value) return;

    const entityWrapper = this.buildEntity(this._entityHandler.selectedEntity.value)
    this.sectionBody.appendChild(entityWrapper)

    this._entityHandler.selectedEntity.value.getComponents().forEach((component: Component) => {
      const componentUI = new ComponentUI(this._engine, this._entityHandler, component).container;
      this.sectionBody.appendChild(componentUI);
    });

    const row = document.createElement('div');
    row.className = 'w-full flex items-center justify-center px-2';
    this.sectionBody.appendChild(row);

    const items = [
        { label: "Transform", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Transform(this._entityHandler.selectedEntity.value))},
        { label: "Rotate", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Rotate())},
        { label: "Orbit", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Orbit())},
        { label: "Mesh", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Mesh())},
        { label: "DirectionalLight", action: () => this._entityHandler.selectedEntity.value?.addComponent(new DirectionalLight())},
    ]

    const dropdown = new Dropdown(items, null, "Add Component");
    
    row.appendChild(dropdown.getElement());
  }

  private buildEntity(entity: Entity): HTMLElement {
    const entityWrapper = document.createElement('div');
    entityWrapper.className = 'w-full flex flex-col';

    const titleRow = document.createElement('div');
    entityWrapper.appendChild(titleRow);
    titleRow.className = "w-full h-6 flex items-center border-y border-zinc-600"

    const collapseToggle = document.createElement('button');
    titleRow.appendChild(collapseToggle);
    collapseToggle.className = "w-6 flex-none text-center";

    const visibilityToggleIcon = document.createElement('i');
    visibilityToggleIcon.className = "fa fa-chevron-up transition-transform duration-200";
    collapseToggle.appendChild(visibilityToggleIcon);

    collapseToggle.addEventListener('click', () => {
      const isHidden = body.classList.toggle('hidden');
    
      visibilityToggleIcon.classList.toggle('fa-chevron-up', !isHidden);
      visibilityToggleIcon.classList.toggle('fa-chevron-down', isHidden);
    });

    const title = document.createElement('p');
    titleRow.appendChild(title)
    title.textContent = entity.name.value;
    title.className = 'w-full font-bold';

    const options = document.createElement('i');
    titleRow.appendChild(options)
    options.className = "w-6 flex-none text-center fa fa-ellipsis-vertical"

    const body = document.createElement('div');
    entityWrapper.appendChild(body);
    body.className = 'w-full flex flex-col p-2 space-y-1';

    const row_id = document.createElement('div');
    row_id.className = 'w-full flex items-center';
    body.appendChild(row_id)

    const labelColumn = document.createElement('div');
    labelColumn.className = 'w-1/4 font-medium text-sm';
    labelColumn.textContent = "id";
    row_id.appendChild(labelColumn);
    
    const inputColumn = document.createElement('div');
    inputColumn.className = 'w-3/4 flex truncate';
    inputColumn.textContent = entity.id;
    row_id.appendChild(inputColumn);

    const readonlyFields = ["isEnabled", "isAwaked", "isStarted", "isRuntime"]

    readonlyFields.forEach(field => {
      const row = document.createElement('div');
      row.className = 'w-full flex items-center';
      body.appendChild(row)

      const labelColumn = document.createElement('div');
      labelColumn.className = 'w-1/4 font-medium text-sm';
      labelColumn.textContent = field;
      row.appendChild(labelColumn);
      
      const inputColumn = document.createElement('input');
      inputColumn.className = 'w-3/4 flex';
      inputColumn.type = "checkbox"
      inputColumn.disabled = true;
      inputColumn.checked = (this._entityHandler.selectedEntity as any)[field];
      row.appendChild(inputColumn);
    });

    const row_name = document.createElement('div');
    row_name.className = 'w-full flex items-center';
    body.appendChild(row_name)

    const labelColumn_name = document.createElement('div');
    labelColumn_name.className = 'w-1/4 font-medium text-sm';
    labelColumn_name.textContent = "name";
    row_name.appendChild(labelColumn_name);
    
    const inputColumn_name = document.createElement('input');
    inputColumn_name.className = 'w-3/4 flex';
    inputColumn_name.placeholder = entity.name.value;
    inputColumn_name.addEventListener('input', () => {
      entity.name.value = inputColumn_name.value;
    });
    row_name.appendChild(inputColumn_name);

    const entitiesRepresentation: DropdownItem[] = [];

    entitiesRepresentation.push({
      label: "None",
      action: () => entity.parent = null,
    });

    const scene = this._engine.currentProject.value.activeScene.value;
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
          this._hierarchy.constructHierarchy();
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

    const dropdown = new Dropdown(entitiesRepresentation, initialValue);

    const row_dropdown = document.createElement('div');
    row_dropdown.className = 'w-full flex items-center';
    body.appendChild(row_dropdown)

    const labelColumn_dropdown = document.createElement('div');
    labelColumn_dropdown.className = 'w-1/4 font-medium text-sm';
    labelColumn_dropdown.textContent = "parent";
    row_dropdown.appendChild(labelColumn_dropdown);
    
    const inputColumn_dropdown = document.createElement('div');
    inputColumn_dropdown.className = 'w-3/4 flex';
    inputColumn_dropdown.appendChild(dropdown.getElement());
    row_dropdown.appendChild(inputColumn_dropdown);

    return entityWrapper;
  }
}