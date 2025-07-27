import { Mesh } from "../../../assets/components/mesh";
import { ObservableField } from "../../../common/patterns/observer/observable-field";
import { ObservableList } from "../../../common/patterns/observer/observable-list";
import { Vector3 } from "../../../core/api/vector3";
import { FieldBuilder } from "../field-builder";

export class PropertyBuilder {
    public static buildNumberProperty(property: ObservableField<number>, field: HTMLElement): void {
        const input = FieldBuilder.buildNumberField(property)
        field.appendChild(input);
    }

    public static buildStringProperty(property: ObservableField<string>, field: HTMLElement): void {
        const input = FieldBuilder.buildStringField(property)
        field.appendChild(input);
    }

    public static buildVector3Property(property: Vector3, field: HTMLElement): void {
        const inputs: HTMLInputElement[] = []
        field.classList.add('gap-1');

        for (const axis of ['x', 'y', 'z'] as const) {
            const axisWrapper = document.createElement('div');
            axisWrapper.className = "w-1/3 flex";

            const axisName = document.createElement('div');
            axisWrapper.appendChild(axisName);
            axisName.textContent = axis;
            axisName.className = 'w-6 flex-none text-center';

            const input = FieldBuilder.buildNumberField(property[axis])
            field.appendChild(input);
            inputs.push(input)
        }
    }

    public static async buildMeshProperty(field: HTMLElement): Promise<void> {
        const input = await FieldBuilder.buildMeshField();
        field.appendChild(input);
    }

    public static buildArrayVector3Property(list: ObservableList<Vector3>, field: HTMLElement): void {
    const render = () => {
        field.innerHTML = "";

        list.items.forEach((vector: Vector3, index: number) => {
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
            
                const input = FieldBuilder.buildNumberField(vector[axis]);
                axisWrapper.appendChild(input);
            
                vectorRow.appendChild(axisWrapper);
            }
        
            vectorWrapper.appendChild(vectorRow);
            field.appendChild(vectorWrapper);
        });
    };

    render();

    list.subscribe({
        onAdd: (value) => render(),
        onRemove: (value) => render()
    });
}

    public static buildArrayNumberProperty(list: ObservableList<ObservableField<number>>, field: HTMLElement): void {
        const render = () => {
            field.innerHTML = "";
            
            list.items.forEach((obsField, index) => {
                const wrapper = document.createElement("div");
                wrapper.className = "w-full flex items-center gap-1";

                const label = document.createElement("div");
                label.textContent = index.toString();
                label.className = "w-6 text-sm text-center";
                wrapper.appendChild(label);

                const input = FieldBuilder.buildNumberField(obsField);
                wrapper.appendChild(input);

                field.appendChild(wrapper);
            });
        };

        render();
        list.subscribe({
            onAdd: (value) => render(),
            onRemove: (value) => render()
        });
    }
}