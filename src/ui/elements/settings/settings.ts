import { Storage } from "../../../core/persistence/storage";

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
        
        autoSaveEnabledButton.addEventListener('click', async () => {
            storage.toggleAutoSave();
            await storage.saveAllSettings();
        });
        
        autoSaveIntervalInput.addEventListener('change', async () => {
            storage.autoSaveIntervalInSeconds = parseInt(autoSaveIntervalInput.value);
            await storage.saveAllSettings();
        });
        
        autoSaveIntervalInput.value = storage.autoSaveIntervalInSeconds.toString();
    }
}