export class Metadata {
    public readonly id: `${string}-${string}-${string}-${string}-${string}`;
    public name: string;
    public readonly createdAt: number;
    public updatedAt: number;
    public readonly version: number;

    public constructor(id: `${string}-${string}-${string}-${string}-${string}`, name: string, createdAt: number, updatedAt: number, version: number) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.version = version;
    }

    public static fromJSON(data: any): Metadata {
        return new Metadata(data.id, data.name, data.createdAt, data.updatedAt, data.version);
    }

    public toJSON(): {id: `${string}-${string}-${string}-${string}-${string}`; name: string; createdAt: number; updatedAt: number; version: number} {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            version: this.version,
        }
    }
}