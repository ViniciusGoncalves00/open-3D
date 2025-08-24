import { ObservableField } from "../common/observer/observable-field";
import { Theme } from "../ui/editor/others/enums";

export class Preferences {
    public autoSaveEnabled: ObservableField<boolean> = new ObservableField(true);
    public autoSaveInterval: ObservableField<number> = new ObservableField(600);
    public theme: Theme = Theme.Light;

    public static fromJSON(data: any): Preferences {
        const preferences = new Preferences();
        preferences.autoSaveEnabled.value = data.autoSaveEnabled || true;
        preferences.autoSaveInterval.value = data.autoSaveInterval || 600;
        preferences.theme = data.theme || Theme.Light;
        return preferences;
    }

    public toJSON(): Object {
        return {
            autoSaveEnabled : this.autoSaveEnabled.value,
            autoSaveInterval : this.autoSaveInterval.value,
            theme : this.theme,
        }
    }
}