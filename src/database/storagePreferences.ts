import { ObservableField } from "../common/observer/observable-field";

export class StoragePreferences {
    public autoSaveEnabled: ObservableField<boolean> = new ObservableField(true);
    public autoSaveInterval: ObservableField<number> = new ObservableField(600);

    public static fromJSON(data: any): StoragePreferences {
        const preferences = new StoragePreferences();
        preferences.autoSaveEnabled.value = data.autoSaveEnabled || true;
        preferences.autoSaveInterval.value = data.autoSaveInterval || 600;
        return preferences;
    }

    public toJSON(): Object {
        return {
            autoSaveEnabled : this.autoSaveEnabled.value,
            autoSaveInterval : this.autoSaveInterval.value,
        }
    }
}