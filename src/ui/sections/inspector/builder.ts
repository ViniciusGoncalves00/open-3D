import { Color } from "../../../assets/components/abstract/color";
import { Component } from "../../../assets/components/abstract/component";
import { Transform } from "../../../assets/components/transform";
import { ObservableField } from "../../../common/observer/observable-field";
import { ObservableList } from "../../../common/observer/observable-list";
import { ObservableVector3 } from "../../../common/observer/observable-vector3";
import { getInspectableProperties } from "../../../common/reflection/reflection";
import { Entity } from "../../../core/api/entity";
import { Engine } from "../../../core/engine/engine";
import { Icons } from "../builder";
import { Dropdown, DropdownItem } from "../components/dropdown";
import { InputOptions } from "./options";

export class Builder {
    public static buildComponentHead(entity: Entity, body: HTMLElement, component: Component): HTMLDivElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="text-text-primary w-84 min-h-64 max-h-full flex flex-col text-sm outline outline-gray-01">
                <div data-role="header" class="text-bold bg-gray-06 text-sm w-full h-6 flex items-center outline outline-gray-01 z-20 select-none">
                    <i class="h-full aspect-square flex items-center justify-center ${Icons.ArrowDown}"></i>
                    <i class="h-full aspect-square flex items-center justify-center ${Icons.ArrowRight}"></i>
                    <p class="w-full truncate">${component.constructor.name}</p>
                </div>
                <div data-role="subHeader" class="bg-gray-06 flex-wrap flex items-center justify-start overflow-hidden z-10 outline outline-gray-01">
                </div>
                <div data-role="body" class="bg-gray-08 flex-1 overflow-auto"></div>
            </div>
        `.trim();



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

        toggle.click();

        const title = document.createElement('p');
        head.appendChild(title);
        title.textContent = component.constructor.name;
        title.className = 'w-full font-bold';

        const remove = document.createElement('i');
        head.appendChild(remove);
        remove.className = "w-6 flex-none text-center cursor-pointer bi bi-trash";
        remove.addEventListener('click', () => entity.removeComponent(component.constructor as any))

        const options = document.createElement('i');
        head.appendChild(options);
        options.className = "w-6 flex-none text-center cursor-pointer bi bi-three-dots-vertical";

        return head;
    }

    public static buildBodyElement(scene: Entity, entity: Entity, component: Component): HTMLElement {
        const propertyNames = getInspectableProperties(component);
        const template = document.createElement('template');

        let fieldsHTML = '';
        for (const propertyName of propertyNames) {
            fieldsHTML += `
                <div class="w-full flex items-start justify-center max-h-64 overflow-auto">
                    <div class="w-1/4 h-full font-medium text-sm truncate">${propertyName}</div>
                    <div class="w-3/4 flex" data-property="${propertyName}"></div>
                </div>
            `;
        }

        template.innerHTML = `
            <div class="w-full flex-none flex flex-col p-2 space-y-1">
                ${fieldsHTML}
            </div>
        `.trim();

        for (const propertyName of propertyNames) {
            const property = (component as any)[propertyName];
            const fieldContentColumn = template.content.querySelector(`[data-property="${propertyName}"]`) as HTMLElement | null;
            if (!fieldContentColumn) continue;

            if (propertyName === "parent") {
                const entitiesRepresentation: DropdownItem[] = [];

                entitiesRepresentation.push({
                    label: "None",
                    action: () => (component as any)[propertyName] = null,
                });

                const selectedId = entity.id;

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
                continue;
            }

            const value = property?.value;
            if (property instanceof ObservableVector3) {
                Builder.buildVector3Property(property, fieldContentColumn);
            } else if (property instanceof ObservableField) {
                if (typeof value === 'number') {
                    Builder.buildNumberProperty(property, fieldContentColumn);
                } else if (typeof value === 'string') {
                    Builder.buildStringProperty(property, fieldContentColumn);
                }   else if (typeof value === 'boolean') {
                    Builder.buildBooleanProperty(property, fieldContentColumn);
                }
            } else if (property instanceof Color) {
                Builder.buildColorProperty(property, fieldContentColumn);
            } else if (property instanceof ObservableList) {
                fieldContentColumn.classList.add("space-y-1", "flex-col");
                if (property.items[0] instanceof ObservableVector3) {
                    // PropertyBuilder.buildArrayVector3Property(property, fieldContentColumn);
                } else if (typeof property.items[0]?.value === 'number') {
                    // PropertyBuilder.buildArrayNumberProperty(property, fieldContentColumn);
                }
            }
        }

        return template.content.firstElementChild as HTMLElement;
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
            axisWrapper.className = "w-1/3 px-1.5 py-0.5 space-x-1 text-xs flex items-center outline outline-zinc-500";

            const input = this.buildNumberField(property[axis])
            input.type = "number";
            input.step = "1";
            input.className = "w-full focus:outline no-spinner";

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

    private static buildNumberField(observablefield: ObservableField<number>): HTMLInputElement {
        const field = document.createElement("input");
        field.type = "number";
        field.step = "1";
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded focus:outline-none no-spinner";

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
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded truncate";

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