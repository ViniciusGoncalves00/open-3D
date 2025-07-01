import { Storage } from "../../../core/persistence/Storage";

export class Settings {
    public constructor(settingsWindow: HTMLDivElement, openSettingsButton: HTMLButtonElement, closeSettingsButton: HTMLButtonElement, storage: Storage, autoSaveEnabledButton: HTMLButtonElement, autoSaveIntervalInput: HTMLInputElement) {
        openSettingsButton.addEventListener("click", () => {
            settingsWindow.classList.toggle("hidden");
            settingsWindow.classList.toggle("flex");
        });

        closeSettingsButton.addEventListener("click", () => {
            settingsWindow.classList.toggle("hidden");
            settingsWindow.classList.toggle("flex");
        });
        
        autoSaveEnabledButton.addEventListener('click', () => storage.toggleAutoSave())
        autoSaveIntervalInput.addEventListener('change', () => storage.autoSaveIntervalInSeconds = parseInt(autoSaveIntervalInput.value));
        
        autoSaveIntervalInput.value = storage.autoSaveIntervalInSeconds.toString();
    }
}