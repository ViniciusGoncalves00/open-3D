import { Color } from "../../../../assets/components/abstract/color";
import { Component } from "../../../../assets/components/abstract/component";
import { ObservableField } from "../../../../common/observer/observable-field";
import { ObservableList } from "../../../../common/observer/observable-list";
import { ObservableVector3 } from "../../../../common/observer/observable-vector3";
import { getInspectableProperties } from "../../../../common/reflection/reflection";
import { Entity } from "../../../../core/api/entity";
import { Icons } from "../builder";
import { Dropdown, DropdownItem } from "../components/dropdown";
import { InputOptions } from "./options";

export class Builder {
    public static buildComponent(scene: Entity, currentEntity: Entity, component: Component): HTMLDivElement {
        const container = document.createElement("div");
        container.className = "flex flex-col min-h-0";

        const bodyElement = this.buildComponentBody(scene, currentEntity, component);
        const headElement = this.buildComponentHead(currentEntity, bodyElement, component);

        component.enabled.value ? '' : bodyElement.classList.add("opacity-50");
        component.enabled.subscribe(enabled => enabled ? bodyElement.classList.remove("opacity-50") : bodyElement.classList.add("opacity-50") );
        
        container.appendChild(headElement);
        container.appendChild(bodyElement);

        return container;
    }

    public static buildComponentHead(entity: Entity, body: HTMLElement, component: Component): HTMLDivElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div role="wrapper" class="bg-gray-06 w-full h-6 flex items-center justify-between text-xs outline outline-gray-01 hover:font-medium hover:bg-gray-09">
                <button role="opened" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer ${Icons.ArrowDown}"></button>
                <button role="closed" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer hidden ${Icons.ArrowRight}"></button>
                <div class="h-full flex items-center justify-center py-2 pr-2">
                    <input role="enabled" type="checkbox" ${component.enabled.value ? "checked" : ""} class="w-full aspect-square">
                </div>
                <button role="main" class="w-full truncate flex items-center justify-start text-sm cursor-pointer">${component.constructor.name}</button>
                <button role="remove" class="h-full aspect-square flex items-center justify-center hover:text-sm cursor-pointer ${Icons.Trash}"></button>
            </div>
        `
        const opened = template.content.querySelector(`[role="opened"]`) as HTMLButtonElement;
        const closed = template.content.querySelector(`[role="closed"]`) as HTMLButtonElement;
        const remove = template.content.querySelector(`[role="remove"]`) as HTMLButtonElement;
        const enabled = template.content.querySelector(`[role="enabled"]`) as HTMLInputElement;

        opened.addEventListener("click", () => {body.classList.toggle("hidden"), opened.classList.toggle("hidden"), closed.classList.toggle("hidden")});
        closed.addEventListener("click", () => {body.classList.toggle("hidden"), opened.classList.toggle("hidden"), closed.classList.toggle("hidden")});
        remove.addEventListener("click", () => entity.removeComponent(component.constructor as any));
        enabled.addEventListener('input', () => component.enabled.value = enabled.checked);
        component.enabled.subscribe(value => enabled.checked = value);

        return template.content.firstElementChild as HTMLDivElement;
    }

    public static buildComponentBody(scene: Entity, entity: Entity, component: Component): HTMLElement {
         const propertyNames = getInspectableProperties(component);

        const container = document.createElement("div");
        container.className = "w-full flex-none flex flex-col p-2 space-y-1";

        for (const propertyName of propertyNames) {
            const property = (component as any)[propertyName];
            const propertyElement = this.buildProperty(propertyName, property, scene, entity);
            container.appendChild(propertyElement);
        }

        return container;
    }

    public static buildProperty(propertyName: string, property: any, scene: Entity, entity: Entity): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div role="row" class="w-full min-h-6 flex items-start justify-center max-h-64 space-x-1 overflow-auto">
                <div role="label" class="w-1/4 h-full text-sm truncate">
                    ${propertyName.charAt(0).toUpperCase() + propertyName.slice(1)}
                </div>
                <div role="value" class="w-3/4 flex"></div>
            </div>
        `;

        const value = template.content.querySelector(`[role="value"]`) as HTMLElement;
        this.buildByType(property, value, scene, entity);

        return template.content.firstElementChild as HTMLElement;
    }


    private static buildByType(property: any, container: HTMLElement, scene: Entity, entity: Entity): void {
         const value = property?.value;

        if (property instanceof ObservableVector3) Builder.buildVector3Property(property, container);
        else if (property instanceof Entity) Builder.buildParentDropdown(property, container, scene, entity);
        else if (property instanceof Color) Builder.buildColorProperty(property, container);
        else if (property instanceof ObservableField) {
            if (typeof value === 'number') Builder.buildNumberProperty(property, container);
            else if (typeof value === 'string') Builder.buildStringProperty(property, container);
            else if (typeof value === 'boolean') Builder.buildBooleanProperty(property, container);
        }
        else if (property instanceof ObservableList) {
            container.classList.add("space-y-1", "flex-col");
            if (property.items[0] instanceof ObservableVector3) Builder.buildArrayVector3Property(property, container);
            else if (typeof property.items[0]?.value === 'number') Builder.buildArrayNumberProperty(property, container);
        }
    }

    private static buildParentDropdown(property: any, container: HTMLElement, scene: Entity, entity: Entity) {
        const entitiesRepresentation: DropdownItem[] = [
            { label: "None", action: () => property = null }
        ];

        const entities = scene.descendants();
        const set = new Set(entity.descendants());
        const result = entities.filter(e => !set.has(e) || e === entity);
        
        result.forEach(entity =>
            entitiesRepresentation.push(
                {label: entity.name.value, action: () => property = entity}
        ));

        const initialValue = property ? property.name.value : "None";
        const dropdown = new Dropdown(entitiesRepresentation, initialValue);
        container.appendChild(dropdown.getElement());
    }

    public static buildNumberProperty(property: ObservableField<number>, container: HTMLElement): void {
        container.appendChild(this.buildNumberField(property));
    }

    public static buildStringProperty(property: ObservableField<string>, container: HTMLElement): void {
        container.appendChild(this.buildStringField(property));
    }

    public static buildBooleanProperty(property: ObservableField<boolean>, container: HTMLElement): void {
        container.appendChild(this.buildBooleanField(property));
    }

    public static buildColorProperty(property: Color, container: HTMLElement): void {
        const rgb = this.buildRGBField(property);
        rgb.classList.replace("w-full", "w-4/5");

        const opacity = this.buildNumberField(property.a);
        opacity.classList.replace("w-full", "w-1/5");
        opacity.classList.add("text-center");
        opacity.min = "0";
        opacity.step = "0.1";
        opacity.max = "1";

        container.classList.add("space-x-1");
        container.appendChild(rgb);
        container.appendChild(opacity);
    }

    public static buildVector3Property(property: ObservableVector3, container: HTMLElement, options?: InputOptions): void {
        const inputs: HTMLInputElement[] = []
        container.classList.add('gap-1');

        for (const axis of ['x', 'y', 'z'] as const) {
            const axisWrapper = document.createElement('div');
            axisWrapper.className = "w-1/3 px-2 py-0.5 space-x-1 text-xs flex items-center border border-gray-01";

            const input = this.buildNumberField(property[axis])
            input.classList.remove("border");
            input.classList.remove("px-1");
            input.classList.remove("py-0.5");

            input.min = options?.min || (-Infinity).toString();
            input.step = options?.step || "any";
            input.max = options?.max || (Infinity).toString();
            axisWrapper.appendChild(input);
            
            const axisName = document.createElement('div');
            axisName.textContent = axis.toUpperCase();
            axisName.className = 'flex-none flex items-center';
            axisWrapper.appendChild(axisName);

            container.appendChild(axisWrapper);
            inputs.push(input)
        }
    }

    public static buildNormalizedVector3Property(property: ObservableVector3, container: HTMLElement): void {
        const inputs: HTMLInputElement[] = []
        container.classList.add('gap-1');

        for (const axis of ['x', 'y', 'z'] as const) {
            const axisWrapper = document.createElement('div');
            axisWrapper.className = "w-1/3 flex";

            const axisName = document.createElement('div');
            axisWrapper.appendChild(axisName);
            axisName.textContent = axis;
            axisName.className = 'w-6 flex-none text-center';

            const input = this.buildNumberField(property[axis])
            input.min = "-1";
            input.step = "0.1";
            input.max = "1";
            container.appendChild(input);
            inputs.push(input)
        }
    }

    public static buildArrayVector3Property(list: ObservableList<ObservableVector3>, container: HTMLElement): void {
    const render = () => {
        container.innerHTML = "";

        list.items.forEach((vector: ObservableVector3, index: number) => {
            const vectorWrapper = document.createElement('div');
            vectorWrapper.className = 'w-full flex gap-1';
        
            const title = document.createElement('div');
            title.textContent = `${index}`;
            title.className = 'w-1/10 text-sm text-center';
            vectorWrapper.appendChild(title);
        
            const vectorRow = document.createElement('div');
            vectorRow.className = 'w-full flex gap-1';
        
            for (const axis of ['x', 'y', 'z'] as const) {
                const axisWrapper = document.createElement('div');
                axisWrapper.className = "w-9/10 flex items-center gap-1";
            
                const axisName = document.createElement('div');
                axisName.textContent = axis;
                axisName.className = 'w-6 text-xs text-center';
                axisWrapper.appendChild(axisName);
            
                const input = this.buildNumberField(vector[axis]);
                input.min = "-1";
                input.step = "0.1";
                input.max = "1";
                axisWrapper.appendChild(input);
            
                vectorRow.appendChild(axisWrapper);
            }
        
            vectorWrapper.appendChild(vectorRow);
            container.appendChild(vectorWrapper);
        });
    };

    render();

    list.subscribe({
        onAdd: (value) => render(),
        onRemove: (value) => render()
    });
}

    public static buildArrayNumberProperty(list: ObservableList<ObservableField<number>>, container: HTMLElement): void {
        const render = () => {
            container.innerHTML = "";
            
            list.items.forEach((obsField, index) => {
                const wrapper = document.createElement("div");
                wrapper.className = "w-full flex items-center gap-1";

                const label = document.createElement("div");
                label.textContent = index.toString();
                label.className = "w-6 text-sm text-center";
                wrapper.appendChild(label);

                const input = this.buildNumberField(obsField);
                wrapper.appendChild(input);

                container.appendChild(wrapper);
            });
        };

        render();
        list.subscribe({
            onAdd: (value) => render(),
            onRemove: (value) => render()
        });
    }

    public static buildNumberField(observablefield: ObservableField<number>): HTMLInputElement {
        const field = document.createElement("input");
        field.type = "number";
        field.step = "1";
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-01 rounded focus:outline-none no-spinner";

        observablefield.subscribe(value => field.value = value.toString());

        field.oninput = () => {
          const value = parseFloat(field.value);
          if (!isNaN(value)) {
            observablefield.value = value;
          }
        };

        field.value = observablefield.value.toString();
        return field;
    }

    private static buildStringField(observablefield: ObservableField<string>): HTMLElement {
        const field = document.createElement("input");
        field.type = "text";
        field.step = "0.1";
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-01 rounded truncate";

        observablefield.subscribe((value: any) => field.value = value.toString());

        // field.oninput = () => {
        //   const value = parseFloat(field.value);
        //   if (!isNaN(value)) {
        //     observablefield.value = value;
        //   }
        // };

        field.value = observablefield.value.toString();
        return field;
    }

    private static buildRGBField(color: Color): HTMLInputElement {
        const field = document.createElement("input");
        field.type = "color";
        field.className = "w-full";
        field.value = Color.toHex(color);

        color.r.subscribe(() => field.value = Color.toHex(color));
        color.g.subscribe(() => field.value = Color.toHex(color));
        color.b.subscribe(() => field.value = Color.toHex(color));

        field.oninput = () => {
            color.fromHex(field.value);
        };

        return field;
    }

    private static buildBooleanField(observablefield: ObservableField<boolean>): HTMLInputElement {
        const field = document.createElement("input");
        field.type = "checkbox";
        field.checked = observablefield.value;
        field.className = "";

        observablefield.subscribe(checked => field.checked = checked);

        field.oninput = () => {
            observablefield.value = field.checked;
        }

        return field;
    }
}