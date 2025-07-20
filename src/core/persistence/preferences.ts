export class Preferences {
    public autoSaveEnabled: boolean;
    public autoSaveInterval: number;

    public constructor(data?: any) {
        this.autoSaveEnabled = data.autoSaveEnabled ?? true;
        this.autoSaveInterval = data.autoSaveInterval ?? 60;
    }

    public static fromJson(data: any): Preferences {
        return new Preferences(data);
    }

    public toJson(): any {
        return {
            autoSaveEnabled : this.autoSaveEnabled,
            autoSaveInterval : this.autoSaveInterval,
        }
    }
}