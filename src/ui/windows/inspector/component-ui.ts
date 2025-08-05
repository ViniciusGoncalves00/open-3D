import { Component } from "../../../assets/components/abstract/component";
import { Mesh } from "../../../assets/components/mesh";
import { ObservableVector3 } from "../../../common/observer/observable-vector3";
import { ObservableField } from "../../../common/observer/observable-field";
import { EntityHandler } from "../../others/entity-handler";
import { PropertyBuilder } from "./component-builder";
import { ObservableList } from "../../../common/observer/observable-list";
import { Transform } from "../../../assets/components/transform";
import { Dropdown, DropdownItem } from "../components/dropdown";
import { Engine } from "../../../core/engine/engine";
import { Entity } from "../../../core/api/entity";
import { getInspectableProperties } from "../../../common/reflection/reflection";

export class ComponentUI {
    private _engine: Engine;
    private _entityHandler: EntityHandler;

    private _container: HTMLElement;
    public get container(): HTMLElement { return this._container; };

    private _open: boolean;
    public get open(): boolean { return this._open; }

    public constructor(engine: Engine, entityHandler: EntityHandler, component: Component, open: boolean = true) {
        this._engine = engine;
        this._entityHandler = entityHandler;
        this._open = open;

        this._container = document.createElement("div");

        const bodyElement = this.buildBodyElement(component);
        const headElement = this.buildHeadElement(bodyElement, component);
        
        this._container.appendChild(headElement);
        this._container.appendChild(bodyElement);
    }

    private buildHeadElement(body: HTMLElement, component: Component): HTMLElement {
        const head = document.createElement("div");
        head.classList = "w-full h-6 flex items-center border-y border-zinc-600";

        const toggle = document.createElement('button');
        head.appendChild(toggle);
        toggle.className = "w-6 flex-none text-center cursor-pointer ";

        const toggleIcon = document.createElement('i');
        toggleIcon.className = "bi bi-caret-right-fill transition-transform duration-200";
        toggle.appendChild(toggleIcon);

        body.classList.toggle("hidden");
        toggle.addEventListener('click', () => {
            const isHidden = body.classList.toggle('hidden');
            toggleIcon.classList.toggle('bi-caret-down-fill', !isHidden);
            toggleIcon.classList.toggle('bi-caret-right-fill', isHidden);
        });

        const title = document.createElement('p');
        head.appendChild(title);
        title.textContent = component.constructor.name;
        title.className = 'w-full font-bold';

        const exclude = document.createElement('i');
        head.appendChild(exclude);
        exclude.className = "w-6 flex-none text-center cursor-pointer bi bi-trash";
        exclude.addEventListener('click', () => this._entityHandler.selectedEntity.value?.removeComponent(component.constructor as any))

        const options = document.createElement('i');
        head.appendChild(options);
        options.className = "w-6 flex-none text-center cursor-pointer bi bi-three-dots-vertical";

        return head;
    }

    private buildBodyElement(component: Component): HTMLElement {
        const componentBody = document.createElement('div');
        componentBody.className = 'w-full flex-none flex flex-col p-2 space-y-1';

        if(component instanceof Mesh) {
            const row = document.createElement('div');
            row.className = 'w-full flex items-start justify-center';
            componentBody.appendChild(row);

            PropertyBuilder.buildMeshProperty(row);
        }

        const propertyNames = getInspectableProperties(component);


for (const propertyName of propertyNames) {
    const row = document.createElement('div');
    row.className = 'w-full flex items-start justify-center max-h-64 overflow-auto';
    componentBody.appendChild(row);

    const fieldNameColumn = document.createElement('div');
    fieldNameColumn.className = 'w-1/4 h-full font-medium text-sm';
    fieldNameColumn.textContent = propertyName;
    row.appendChild(fieldNameColumn);

    const fieldContentColumn = document.createElement('div');
    fieldContentColumn.className = 'w-3/4 flex';
    row.appendChild(fieldContentColumn);

    let property = (component as any)[propertyName];

    if (property instanceof ObservableList) {
        fieldContentColumn.classList.add("space-y-1", "flex-col");

        if (property.items[0] instanceof ObservableVector3)
            PropertyBuilder.buildArrayVector3Property(property, fieldContentColumn);
        else if (typeof property.items[0].value === 'number')
            PropertyBuilder.buildArrayNumberProperty(property, fieldContentColumn);
    }
    else {
        if (property instanceof ObservableVector3)
            PropertyBuilder.buildVector3Property(property, fieldContentColumn);
        else if (property instanceof ObservableField) {
            const value = property.value;

            if (typeof value === 'number')
                PropertyBuilder.buildNumberProperty(property, fieldContentColumn);
            else if (typeof value === 'string')
                PropertyBuilder.buildStringProperty(property, fieldContentColumn);
        }
        else if (propertyName === "parent") {
            const entitiesRepresentation: DropdownItem[] = [];

            entitiesRepresentation.push({
                label: "None",
                action: () => (component as any)[propertyName] = null,
            });

            const scene = this._engine.currentProject.value?.activeScene.value;
            if (!scene) continue;

            const selectedId = this._entityHandler.selectedEntity.value?.id;

            const appendEntitiesRecursively = (entity: Entity, depth: number = 0): void => {
                if (entity.id === selectedId) return;

                const transform = entity.getComponent(Transform);
                if (!transform) return;

                const indent = "  ".repeat(depth);
                entitiesRepresentation.push({
                    label: `${indent}${entity.name.value}`,
                    action: () => (component as any)[propertyName] = entity,
                });

                for (const child of entity.children.items) {
                    appendEntitiesRecursively(child, depth + 1);
                }
            };

            for (const rootEntity of scene.children.items) {
                appendEntitiesRecursively(rootEntity);
            }

            const initialValue = property ? property.name.value : "None";

            const dropdown = new Dropdown(entitiesRepresentation, initialValue);
            fieldContentColumn.appendChild(dropdown.getElement());
        }
    }
}


        return componentBody;
    }
}