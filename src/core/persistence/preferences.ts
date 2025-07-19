export class Preferences {
    public autoSave: boolean;
    public autoSaveInterval: number;

    public constructor(data?: any) {
        this.autoSave = data.autoSaveEnabled ?? true;
        this.autoSaveInterval = data.autoSaveIntervalInSeconds ?? 60;
    }

    public static fromJson(data: any): Preferences {
        return new Preferences(data);
    }

    public toJson(): any {
        return {
            autoSave : this.autoSave,
            autoSaveInterval : this.autoSaveInterval,
        }
    }
}