import { Theme } from "../../ui/enums/theme";

export class Preferences {
    public autoSaveEnabled: boolean = true;
    public autoSaveInterval: number = 6000;
    public theme: Theme = Theme.Light;

    public static fromJSON(data: any): Preferences {
        const preferences = new Preferences();
        preferences.autoSaveEnabled = data.autoSaveEnabled || true;
        preferences.autoSaveInterval = data.autoSaveEnabled || 60;
        preferences.theme = data.theme || Theme.Light;
        return preferences;
    }

    public toJSON(): Object {
        return {
            autoSaveEnabled : this.autoSaveEnabled,
            autoSaveInterval : this.autoSaveInterval,
            theme : this.theme,
        }
    }
}