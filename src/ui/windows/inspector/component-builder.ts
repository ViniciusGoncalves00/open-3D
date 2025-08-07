import { Color } from "../../../assets/components/abstract/color";
import { ObservableField } from "../../../common/observer/observable-field";
import { ObservableList } from "../../../common/observer/observable-list";
import { ObservableVector3 } from "../../../common/observer/observable-vector3";
import { FieldBuilder } from "../components/field-builder";

export class PropertyBuilder {
    public static buildNumberProperty(property: ObservableField<number>, field: HTMLElement): void {
        const input = FieldBuilder.buildNumberField(property)
        field.appendChild(input);
    }

    public static buildStringProperty(property: ObservableField<string>, field: HTMLElement): void {
        const input = FieldBuilder.buildStringField(property)
        field.appendChild(input);
    }

    public static buildColorProperty(property: Color, field: HTMLElement): void {
        field.classList.add("space-x-1")
        const rgb = FieldBuilder.buildRGBField(property);
        rgb.classList.replace("w-full", "w-4/5");
        const opacity = FieldBuilder.buildNumberField(property.a);
        opacity.classList.replace("w-full", "w-1/5");
        opacity.classList.add("text-center");
        opacity.min = "0";
        opacity.step = "0.1";
        opacity.max = "1";
        field.appendChild(rgb);
        field.appendChild(opacity);
    }

    public static buildBooleanProperty(property: ObservableField<boolean>, field: HTMLElement): void {
        const input = FieldBuilder.buildBooleanField(property)
        field.appendChild(input);
    }

    public static buildVector3Property(property: ObservableVector3, field: HTMLElement): void {
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
            input.min = "-1";
            input.step = "0.1";
            input.max = "1";
            field.appendChild(input);
            inputs.push(input)
        }
    }

    public static buildNormalizedVector3Property(property: ObservableVector3, field: HTMLElement): void {
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
            input.min = "-1";
            input.step = "0.1";
            input.max = "1";
            field.appendChild(input);
            inputs.push(input)
        }
    }

    public static async buildMeshProperty(field: HTMLElement): Promise<void> {
        const input = await FieldBuilder.buildMeshField();
        field.appendChild(input);
    }

    public static buildArrayVector3Property(list: ObservableList<ObservableVector3>, field: HTMLElement): void {
    const render = () => {
        field.innerHTML = "";

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
            
                const input = FieldBuilder.buildNumberField(vector[axis]);
                input.min = "-1";
                input.step = "0.1";
                input.max = "1";
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