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
            await storage.savePreferences();
        });
        
        autoSaveIntervalInput.addEventListener('change', async () => {
            const interval = parseInt(autoSaveIntervalInput.value);
            storage.setAutoSaveInterval(interval);
            await storage.savePreferences();
        });
        
        autoSaveIntervalInput.value = storage.getAutoSaveInterval().toString();
    }
}