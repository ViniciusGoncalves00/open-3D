import { Theme } from "../ui/editor/others/enums";

export class GeneralPreferences {
    public theme: Theme = Theme.Light;

    public static fromJSON(data: any): GeneralPreferences {
        const preferences = new GeneralPreferences();
        preferences.theme = data.theme || Theme.Light;
        return preferences;
    }

    public toJSON(): Object {
        return {
            theme : this.theme,
        }
    }
}