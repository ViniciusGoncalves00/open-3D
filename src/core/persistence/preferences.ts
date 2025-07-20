export class Preferences {
    public autoSaveEnabled: boolean;
    public autoSaveInterval: number;

    public constructor(data?: any) {
        this.autoSaveEnabled = data.autoSaveEnabled ?? true;
        this.autoSaveInterval = data.autoSaveInterval ?? 60;
    }

    public static fromJSON(data: any): Preferences {
        return new Preferences(data);
    }

    public toJSON(): Object {
        return {
            autoSaveEnabled : this.autoSaveEnabled,
            autoSaveInterval : this.autoSaveInterval,
        }
    }
}