import { ConsoleLogger } from "../../ui/editor/sections/console/console-logger";
import { Accessor } from "./accessor";
import { Attributes } from "./attributes";
import { BufferView } from "./buffer-view";

export class Primitive {
    public attributes: Map<Attributes, Accessor>;
    public indices?: Accessor;
    public material: string;

    public constructor(attributes: Map<Attributes, Accessor>, material: string, indices?: Accessor) {
        this.attributes = attributes;
        this.material = material;
        this.indices = indices;
    }

    public toJSON() {
        return {
            attributes: Object.fromEntries(
                Array.from(this.attributes.entries()).map(([name, accessor], i) => [name, accessor.toJSON(i)])
            ),
            indices: this.indices ? this.indices.toJSON() : undefined,
            material: this.material
        };
    }

    public static fromJSON(json: any, bufferViewLookup?: (index: number) => BufferView): Primitive {
        const attributes: Map<Attributes, Accessor> = new Map();
        for (const key of Object.keys(json.attributes)) {
            if (Object.values(Attributes).includes(key as Attributes)) {
                const accessor = Accessor.fromJSON(json.attributes[key], bufferViewLookup);
                attributes.set(key as Attributes, accessor);
            } else {
                ConsoleLogger.warning(`Unable to convert the attribute ${key} to an accessor.`);
            }
        }
        const indices = json.indices ? Accessor.fromJSON(json.indices, bufferViewLookup) : undefined;
        return new Primitive(attributes, json.material, indices);
    }

    public tryGetAttribute(attribute: Attributes): Accessor | null {
        const accessor = this.attributes.get(attribute);
        if (!accessor) {
            ConsoleLogger.warning(`Attribute was not found: ${attribute}`);
            return null;
        }
        return accessor;
    }

    public setAttribute(attribute: Attributes, accessor: Accessor): void {
        this.attributes.set(attribute, accessor);
    }
}