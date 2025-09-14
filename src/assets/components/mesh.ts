import { ObservableField } from "../../common/observer/observable-field";
import { Component } from "./abstract/component";

// --- Estruturas auxiliares baseadas no glTF ---

export class Buffer {
  constructor(
    public readonly data: ArrayBuffer
  ) {}
}

export class BufferView {
  constructor(
    public buffer: Buffer,
    public byteOffset: number,
    public byteLength: number,
    public byteStride?: number
  ) {}
}

export class Accessor {
	/**
	 * @param bufferView BufferView
	 * @param componentType glTF enum: 5126 = FLOAT, 5123 = UNSIGNED_SHORT, 5125 = UNSIGNED_INT, etc.
	 * @param count count of elements of this accessor
	 * @param type "SCALAR", "VEC2", "VEC3", "VEC4", "MAT4"
	 * @param byteOffset offset from start of buffer
	 * @param byteStride amount of bytes between an component in buffer
	 * 
	 * @example
	 * count: if this accessor access a quad buffer, this count will be 4;
	 * byteStride: if this accessor access positions of a quad buffer, with no other data, and components are X, Y, Z float32, so byteStride wiil be 12 (3 components * 4 bytes of float32);
 	 */
    public constructor(
    	public bufferView: BufferView,
    	public componentType: number, // glTF enum: 5126 = FLOAT, 5123 = UNSIGNED_SHORT, 5125 = UNSIGNED_INT, etc.
    	public count: number,
    	public type: string,          // "SCALAR", "VEC2", "VEC3", "VEC4", "MAT4"
    	public byteOffset: number = 0,
    	public byteStride?: number
    ) {}

  // Converte para um objeto JSON
  public toJSON() {
    return {
      bufferViewIndex: this.bufferView ? this.bufferView.byteOffset : null,
      componentType: this.componentType,
      count: this.count,
      type: this.type,
      byteOffset: this.byteOffset,
      // opcional: podemos serializar os dados em base64
      // data: this.toBase64()
    };
  }

  // Reconstrói a partir de JSON
  public static fromJSON(json: any, bufferViewLookup?: (index: number) => BufferView): Accessor {
    const bufferView = bufferViewLookup ? bufferViewLookup(json.bufferViewIndex) : undefined;
    return new Accessor(
      bufferView!,
      json.componentType,
      json.count,
      json.type,
      json.byteOffset
    );
  }

  // Opcional: converte os dados em base64 para persistência
  public toBase64(): string {
    if (!this.bufferView) return "";
    const start = this.bufferView.byteOffset + this.byteOffset;
    const end = start + this.count * this.getComponentSize() * this.getNumComponents();
    const slice = this.bufferView.buffer.data.slice(start, end);
    const uint8 = new Uint8Array(slice);
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return btoa(binary);
  }

  public getStride(): number {
    return this.byteStride ?? (this.getComponentSize() * this.getNumComponents());
  }

  // Número de bytes por componente
  public getComponentSize(): number {
    switch (this.componentType) {
      case 5126: return 4; // FLOAT32
      case 5123: return 2; // UNSIGNED_SHORT
      case 5125: return 4; // UNSIGNED_INT
      default: throw new Error(`Componente tipo ${this.componentType} não suportado`);
    }
  }

  // Número de elementos por tipo (SCALAR, VEC2, VEC3, VEC4, MAT4)
  public getNumComponents(): number {
    switch (this.type) {
      case "SCALAR": return 1;
      case "VEC2": return 2;
      case "VEC3": return 3;
      case "VEC4": return 4;
      case "MAT2": return 4;
      case "MAT3": return 9;
      case "MAT4": return 16;
      default: throw new Error(`Tipo ${this.type} não suportado`);
    }
  }
}


// --- Primitive (parte da Mesh) ---
export class Primitive {
  public attributes: Record<string, Accessor>; // POSITION, NORMAL, TEXCOORD_0, COLOR_0...
  public indices?: Accessor;
  public material?: number;

  constructor(attributes: Record<string, Accessor>, indices?: Accessor, material?: number) {
    this.attributes = attributes;
    this.indices = indices;
    this.material = material;
  }

  toJSON() {
    return {
      attributes: Object.fromEntries(
        Object.entries(this.attributes).map(([name, accessor]) => [name, accessor.toJSON?.() ?? null])
      ),
      indices: this.indices ? this.indices.toJSON?.() : undefined,
      material: this.material
    };
  }

  static fromJSON(json: any): Primitive {
    const attrs: Record<string, Accessor> = {};
    for (const key of Object.keys(json.attributes)) {
      attrs[key] = Accessor.fromJSON(json.attributes[key]);
    }
    const indices = json.indices ? Accessor.fromJSON(json.indices) : undefined;
    return new Primitive(attrs, indices, json.material);
  }
}

// --- Mesh (herda de Component) ---
export class Mesh extends Component {
  public name: ObservableField<string>;
  public primitives: Primitive[];

  constructor(name: string = "DefaultMeshName", primitives: Primitive[] = []) {
    super();
    this.name = new ObservableField(name);
    this.primitives = primitives;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      name: this.name,
      primitives: this.primitives.map(p => p.toJSON())
    };
  }

  public override fromJSON(json: any): void {
    super.fromJSON(json);
    this.name = json.name;
    this.primitives = json.primitives.map((p: any) => Primitive.fromJSON(p));
  }

  public clone(): Component {
    return new Mesh(this.name.value, this.primitives);
  }

  public copyFrom(component: Mesh): void {
    super.copyFrom(component);
    
    this.name.value = component.name.value;
    this.primitives = component.primitives;
  }

  public destroy(): void {
    throw new Error("Method not implemented.");
  }
}
