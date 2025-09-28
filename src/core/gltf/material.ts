export class PBRMetallicRoughness {
    public baseColorFactor: [number, number, number, number];
    public baseColorTextureIndex: number | null;
    public metallicFactor: number;
    public roughnessFactor: number;

    public constructor(
        baseColorFactor: [number, number, number, number],
        baseColorTextureIndex: number | null,
        metallicFactor: number,
        roughnessFactor: number,
    ) {
        this.baseColorFactor = baseColorFactor,
        this.baseColorTextureIndex = baseColorTextureIndex,
        this.metallicFactor = metallicFactor,
        this.roughnessFactor = roughnessFactor
    }

    public static fromJSON(data: any): PBRMetallicRoughness {
        return new PBRMetallicRoughness(
            data.pbrMetallicRoughness ?? [1, 1, 1, 1],
            data.baseColorTextureIndex ?? null,
            data.metallicFactor ?? 0.0,
            data.roughnessFactor ?? 1.0,
        )
    }

    public toJSON() {
        return {
            baseColorFactor: this.baseColorFactor,
            baseColorTextureIndex: this.baseColorTextureIndex,
            metallicFactor: this.metallicFactor,
            roughnessFactor: this.roughnessFactor,
        }
    }
}

export class Material {
    public uuid: string;
    public name: string;
    public pbrMetallicRoughness: PBRMetallicRoughness;

    public constructor(
        uuid?: string,
        name: string = "DefaultName",
        pbrMetallicRoughness: PBRMetallicRoughness = new PBRMetallicRoughness([1, 1, 1, 1], null, 0.0, 1.0),
    ) {
        this.uuid = uuid ?? crypto.randomUUID();
        this.name = name;
        this.pbrMetallicRoughness = pbrMetallicRoughness;
    }

    public setBaseColorFactor(color: [number, number, number, number]) {
        this.pbrMetallicRoughness.baseColorFactor = color;
    }

    public setBaseColorTextureIndex(textureIndex: number) {
        this.pbrMetallicRoughness.baseColorTextureIndex = textureIndex;
    }

    public setBaseColorByTexture(): [number, number, number, number] {
        throw new Error("Method not implemented.");
    }

    public dispose(): void {
        throw new Error("Method not implemented.");
    }

    public static fromJSON(data: any): Material {
        const pbrMetallicRoughness = PBRMetallicRoughness.fromJSON(data);

        return new Material(
            data.uuid,
            data.name ?? "DefaultName",
            pbrMetallicRoughness
        )
    }

    public toJSON() {
        return {
            name: this.name,
            pbrMetallicRoughness: this.pbrMetallicRoughness.toJSON()
        };
    }
}