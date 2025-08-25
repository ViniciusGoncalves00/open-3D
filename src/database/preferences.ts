import { EditorPreferences } from "./editorPreferences";
import { GeneralPreferences } from "./generalPreferences";
import { StoragePreferences } from "./storagePreferences";

export class Preferences {
    public editor: EditorPreferences;
    public general: GeneralPreferences;
    public storage: StoragePreferences;

    public constructor() {
        this.editor = new EditorPreferences();
        this.general = new GeneralPreferences();
        this.storage = new StoragePreferences();
    }

    public static fromJSON(data: any): Preferences {
        const preferences = new Preferences();

        preferences.editor = EditorPreferences.fromJSON(data?.editor ?? {});
        preferences.general = GeneralPreferences.fromJSON(data?.editor ?? {});
        preferences.storage = StoragePreferences.fromJSON(data?.storage ?? {});

        return preferences;
    }

    public toJSON(): Object {
        return {
            editor: this.editor.toJSON(),
            general: this.general.toJSON(),
            storage: this.storage.toJSON(),
        };
    }
}
