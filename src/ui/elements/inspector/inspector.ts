import { Orbit } from "../../../assets/components/orbit";
import { Rotate } from "../../../assets/components/rotate";
import { Transform } from "../../../assets/components/transform";
import { Entity } from "../../../core/api/entity";
import { Dropdown } from "../../components/dropdown";
import { ComponentUI } from "../../components/inspector/component-ui";
import { EntityHandler } from "../../handlers/entity-handler";
import { Mesh } from "../../../assets/components/mesh";
import { Component } from "../../../assets/components/component";
import { Engine } from "../../../core/engine/engine";

export class Inspector {
  private _container: HTMLElement;
  private _engine: Engine;
  private _entityHandler: EntityHandler;

  public constructor(container: HTMLElement, engine: Engine, entityHandler: EntityHandler) {
    this._container = container;
    this._engine = engine;
    this._entityHandler = entityHandler;

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
    this._container.replaceChildren();
    if (!this._entityHandler.selectedEntity.value) return;

    const entityWrapper = this.buildEntity(this._entityHandler.selectedEntity.value)
    this._container.appendChild(entityWrapper)

    this._entityHandler.selectedEntity.value.getComponents().forEach((component: Component) => {
      const componentUI = new ComponentUI(this._engine, this._entityHandler, component).container;
      this._container.appendChild(componentUI);
    });

    const row = document.createElement('div');
    row.className = 'w-full flex items-center justify-center';
    this._container.appendChild(row);

    const items = [
        { label: "Transform", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Transform(this._entityHandler.selectedEntity.value))},
        { label: "Rotate", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Rotate())},
        { label: "Orbit", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Orbit())},
        { label: "Mesh", action: () => this._entityHandler.selectedEntity.value?.addComponent(new Mesh())},
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
    inputColumn.className = 'w-3/4 flex';
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

    return entityWrapper;
  }
}