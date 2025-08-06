import { Color } from "../../../assets/components/abstract/color";
import { Mesh } from "../../../assets/components/mesh";
import { ObservableField } from "../../../common/observer/observable-field";
import { Dropdown } from "./dropdown";

export class FieldBuilder {
    public static buildNumberField(observablefield: ObservableField<number>): HTMLInputElement {
        const field = document.createElement("input");
        field.type = "number";
        field.step = "1";
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded";

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

    public static buildStringField(observablefield: ObservableField<string>): HTMLElement {
        const field = document.createElement("input");
        field.type = "text";
        field.step = "0.1";
        field.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded";

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

    public static buildRGBField(color: Color): HTMLElement {
        const field = document.createElement("input");
        field.type = "color";
        field.className = "w-full rounded";
        field.value = Color.toHex(color);

        color.r.subscribe(() => field.value = Color.toHex(color));
        color.g.subscribe(() => field.value = Color.toHex(color));
        color.b.subscribe(() => field.value = Color.toHex(color));

        field.oninput = () => {
            color.fromHex(field.value);
        };

        return field;
    }

    public static buildBooleanField(observablefield: ObservableField<boolean>): HTMLElement {
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

    // public static buildVectorField(observablefield: ObservableField<Vector3>): HTMLElement {
    //     const field = document.createElement("input");
    //     field.type = "number";
    //     field.step = "0.1";
    //     field.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded";

    //     observablefield.subscribe(value => field.value = value.toString());

    //     field.oninput = () => {
    //       const value = parseFloat(field.value);
    //       if (!isNaN(value)) {
    //         observablefield.value = value;
    //       }
    //     };

    //     field.value = observablefield.value.toString();
    //     return field;
    // }

    public static async buildMeshField(): Promise<HTMLElement> {
        const container = document.createElement("div");

        // const select = document.createElement("select");
        // select.className = "w-full text-xs px-1 py-0.5 border border-gray-300 rounded";
        // container.appendChild(select);

        // const placeholderOption = document.createElement("option");
        // placeholderOption.textContent = "-- mesh (none) --";
        // placeholderOption.value = "";
        // select.appendChild(placeholderOption);

        // const meshFiles = await FieldBuilder.listMeshFiles("/assets/objects");

        // const meshMap = new Map<string, Mesh>();

        // for (const file of meshFiles) {
        //     const mesh = await FieldBuilder.loadMesh(file);
        //     meshMap.set(file, mesh);

        //     const option = document.createElement("option");
        //     option.textContent = "TEST NAME";
        //     // option.textContent = mesh.name; 
        //     option.value = file;
        //     select.appendChild(option);

        //     // if (observablefield.value?.name === mesh.name) {
        //     //     select.value = file;
        //     // }
        // }

        const row = document.createElement('div');
        row.className = 'w-full flex items-center justify-center';
        container.appendChild(row);

        // const dropdown = new Dropdown({
        //     items: [
        //         { label: "Cube", value: {
        //           vertices: [
        //             -1.0, -1.0, 1.0,
        //              1.0, -1.0, 1.0,
        //              1.0,  1.0, 1.0,
        //              1.0,  1.0, 1.0,
        //             -1.0,  1.0, 1.0,
        //             -1.0, -1.0, 1.0
        //           ],
        //           indices: [
        //             0, 1, 2,
        //             2, 3, 0,
                                
        //             4, 5, 6,
        //             6, 7, 4,
                                
        //             8, 9, 10,
        //             10, 11, 8,
                                
        //             12, 13, 14,
        //             14, 15, 12,
                                
        //             16, 17, 18,
        //             18, 19, 16,
                                
        //             20, 21, 22,
        //             22, 23, 20
        //           ]
        //         } },
        //         { label: "Quad", value: {
        //           vertices: [
        //             -0.5, 0.0, -0.5,
        //              0.5, 0.0, -0.5,
        //             -0.5, 0.0,  0.5,
        //              0.5, 0.0,  0.5
        //           ],
        //           indices: [
        //             0, 1, 2,
        //             3, 2, 1
        //           ]
        //         }
        //          },
        //       ],
        //     defaultLabel: "Select Mesh",
        //     onSelect: (item) => {
        //         const mesh = EntityHandler.selectedEntity.value?.getComponent(Mesh);
        //         if (!mesh) return;

        //         mesh.name.value = item.label;

        //         mesh.vertices.clear();
        //         for (let i = 0; i < item.value.vertices.length; i += 3) {
        //             mesh.vertices.add(new Vector3(
        //                 item.value.vertices[i],
        //                 item.value.vertices[i + 1],
        //                 item.value.vertices[i + 2]
        //             ));
        //         }
            
        //         mesh.indices.clear();
        //         for (let i = 0; i < item.value.indices.length; i++) {
        //             mesh.indices.add(new ObservableField(item.value.indices[i]));
        //         }
        //     }
        // });

        // container.appendChild(dropdown.getElement());

        // select.onchange = () => {
        //     const selectedPath = select.value;
        //     if (selectedPath === "") {
        //         observablefield.value = null!;
        //     } else {
        //         const selectedMesh = meshMap.get(selectedPath);
        //         if (selectedMesh) {
        //             observablefield.value = selectedMesh;
        //         }
        //     }
        // };

        // observablefield.subscribe((mesh: Mesh) => {
        //     if (!mesh) {
        //         select.value = "";
        //     } else {
        //         // const selectedEntry = Array.from(meshMap.entries()).find(([, m]) => m.name === mesh.name);
        //         // select.value = selectedEntry?.[0] ?? "";
        //     }
        // });

        return container;
    }

    private static async listMeshFiles(path: string): Promise<string[]> {
        const res = await fetch(`${path}/index.json`);
        const files: string[] = await res.json();
        return files.map(f => `${path}/${f}`);
    }

    private static async loadMesh(path: string): Promise<Mesh> {
        const res = await fetch(path);
        return await res.json() as Mesh;
    }
}