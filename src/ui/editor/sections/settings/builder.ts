import { ObservableField } from "../../../../common/observer/observable-field";

export class Builder {
    public static buildNumberProperty(propertyName: string, property: ObservableField<number>): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div role="row" class="w-full min-h-6 flex items-start justify-center font-normal max-h-64 overflow-auto">
                <div role="label" class="w-2/4 h-full text-sm truncate">${propertyName}</div>
                <div role="field" class="w-2/4"></div>
            </div>
        `;

        const row = template.content.firstElementChild as HTMLElement;
        const fieldContainer = row.querySelector('[role="field"]') as HTMLElement;
        fieldContainer.appendChild(this.buildNumberField(property));

        return row;
    }

    public static buildBooleanProperty(propertyName: string, property: ObservableField<boolean>): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div role="row" class="w-full min-h-6 flex items-start justify-center font-normal max-h-64 overflow-auto">
                <div role="label" class="w-2/4 h-full text-sm truncate">${propertyName}</div>
                <div role="field" class="w-2/4"></div>
            </div>
        `;

        const row = template.content.firstElementChild as HTMLElement;
        const fieldContainer = row.querySelector('[role="field"]') as HTMLElement;

        fieldContainer.appendChild(this.buildBooleanField(property));

        return row;
    }

    public static buildKeyBindingMouseProperty(
      propertyName: string,
      property: ObservableField<Set<number>>
    ): HTMLElement {
      const container = document.createElement("div");
      container.className = "w-full min-h-6 flex items-start justify-center font-normal max-h-64 overflow-auto";

      const label = document.createElement("div");
      label.className = "w-2/4 h-full text-sm truncate";
      label.textContent = propertyName;

      const field = document.createElement("button");
      field.className = "w-2/4 text-xs px-1 py-0.5 border border-gray-01 rounded focus:outline-none no-spinner";
      field.textContent = Array.from(property.value).map(b => `Mouse ${b}`).join(", ");

      property.subscribe(newSet => {
        field.textContent = Array.from(newSet).map(b => `Mouse ${b}`).join(", ");
      });

      field.onclick = () => {
        field.textContent = "Press a mouse button...";

        const listener = (event: MouseEvent) => {
          property.value = new Set([event.button]);
          window.removeEventListener("mousedown", listener, true);
          event.stopPropagation();
          event.preventDefault();
        };

        window.addEventListener("mousedown", listener, true);
      };

      container.appendChild(label);
      container.appendChild(field);

      return container;
    }

    private static buildNumberField(observablefield: ObservableField<number>): HTMLInputElement {
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