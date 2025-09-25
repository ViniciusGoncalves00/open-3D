import { BufferView } from "./buffer-view";

export class Accessor {
    /**
     * @param bufferView BufferView
     * @param componentType glTF enum: 5126 = FLOAT, 5123 = UNSIGNED_SHORT, 5125 = UNSIGNED_INT, etc.
     * @param count count of elements of this accessor
     * @param type "SCALAR", "VEC2", "VEC3", "VEC4", "MAT4"
     * @param byteOffset offset from start of buffer
     * @param byteStride amount of bytes between a component in buffer
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

  public toJSON(bufferViewIndex: number = 0) {
      return {
          bufferViewIndex,
          componentType: this.componentType,
          count: this.count,
          type: this.type,
          byteOffset: this.byteOffset,
      };
  }

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

  public toBase64(): string {
      if (!this.bufferView) return "";
      const start = this.bufferView.byteOffset + this.byteOffset;
      const end = start + this.count * this.getComponentSize() * this.getNumComponents();
      const slice = this.bufferView.buffer.data.slice(start, end);
      const uint8 = new Uint8Array(slice);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
      }
      return btoa(binary);
  }

  public getStride(): number {
      return this.byteStride ?? (this.getComponentSize() * this.getNumComponents());
  }

  public getComponentSize(): number {
      switch (this.componentType) {
          case 5126: return 4; // FLOAT
          case 5123: return 2; // UNSIGNED_SHORT
          case 5125: return 4; // UNSIGNED_INT
          default: throw new Error(`Component type ${this.componentType} not supported`);
      }
  }

  public getNumComponents(): number {
      switch (this.type) {
          case "SCALAR": return 1;
          case "VEC2": return 2;
          case "VEC3": return 3;
          case "VEC4": return 4;
          case "MAT2": return 4;
          case "MAT3": return 9;
          case "MAT4": return 16;
          default: throw new Error(`Type ${this.type} not supported`);
      }
  }
}