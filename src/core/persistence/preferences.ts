export class Preferences {
    public autoSaveEnabled: boolean = true;
    public autoSaveInterval: number = 60;

    public static fromJSON(data: any): Preferences {
        const preferences = new Preferences();
        preferences.autoSaveEnabled = data.autoSaveEnabled;
        preferences.autoSaveInterval = data.autoSaveEnabled;
        return preferences;
    }

    public toJSON(): Object {
        return {
            autoSaveEnabled : this.autoSaveEnabled,
            autoSaveInterval : this.autoSaveInterval,
        }
    }
}