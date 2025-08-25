import { ObservableField } from "../../../../common/observer/observable-field";
import { Storage } from "../../../../database/storage";
import { InputHandler } from "../../others/input-handler";
import { Icons } from "../builder";
import { Builder } from "./builder";

export class Settings {
    private readonly element: HTMLDivElement;

    public constructor(storage: Storage, inputHandler: InputHandler) {
        const title = "settings";
        const icon = Icons.Gear;

        const template = document.createElement("template");
        template.innerHTML = `
        <div id="settings" class="h-full w-full z-[9999] inset-0 fixed flex items-center justify-center hidden">
            <div class="absolute inset-0 bg-gray-01/50 backdrop-blur-xs"></div>
            <div class="relative w-1/4 h-3/4 flex flex-col text-sm outline outline-gray-01 bg-gray-08">
                <div role="header" class="text-bold bg-gray-06 text-sm w-full h-6 flex items-center outline outline-gray-01 z-20 select-none sticky">
                    <i class="h-full aspect-square flex items-center justify-center ${icon}"></i>
                    <p class="w-full truncate">${title}</p>
                    <button role="close" class="h-full aspect-square cursor-pointer text-base hover:bg-gray-08 ${Icons.Close}"></button>
                </div>
                <div role="body" class="bg-gray-08 h-full p-2 space-y-1 overflow-y-auto">
                    <div role="database" class="w-full font-medium">
                        <div class="text-lg">DATABASE</div>
                        <div class="w-full flex flex-col space-y-2">
                            <div role="autosave" class="">Autosave</div>
                        </div>
                    </div>
                    <div role="camera" class="w-full font-medium">
                        <div class="text-lg">CAMERA</div>
                        <div class="w-full flex flex-col space-y-2">
                            <div role="keybinding" class="">Key binding</div>
                            <div role="pan" class="">Pan</div>
                            <div role="rotate" class="">Rotate</div>
                            <div role="orbit" class="">Orbit</div>
                            <div role="zoom" class="">Zoom</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        const section = template.content.firstElementChild as HTMLDivElement;
        const closeButton = section.querySelector('[role="close"]') as HTMLButtonElement;
        closeButton.addEventListener("click", () => this.toggle());

        const autosaveDiv = section.querySelector('[role="autosave"]') as HTMLDivElement;
        autosaveDiv.appendChild(Builder.buildBooleanProperty("Autosave enabled", storage.preferences.storage.autoSaveEnabled));
        autosaveDiv.appendChild(Builder.buildNumberProperty("Autosave interval (seconds)", storage.preferences.storage.autoSaveInterval));

        const keybindingDiv = section.querySelector('[role="keybinding"]') as HTMLDivElement;
        const panDiv = section.querySelector('[role="pan"]') as HTMLDivElement;
        const rotateDiv = section.querySelector('[role="rotate"]') as HTMLDivElement;
        const orbitDiv = section.querySelector('[role="orbit"]') as HTMLDivElement;
        const zoomDiv = section.querySelector('[role="zoom"]') as HTMLDivElement;

        keybindingDiv.appendChild(Builder.buildKeyBindingMouseProperty("Pan buttons", inputHandler.preferences.panButtons));
        keybindingDiv.appendChild(Builder.buildKeyBindingMouseProperty("Orbit buttons", inputHandler.preferences.orbitButtons));
        keybindingDiv.appendChild(Builder.buildKeyBindingMouseProperty("Rotate buttons", inputHandler.preferences.rotateButtons));

        panDiv.appendChild(Builder.buildNumberProperty("Direction X", inputHandler.preferences.xPanDirection));
        panDiv.appendChild(Builder.buildNumberProperty("Direction Y", inputHandler.preferences.yPanDirection));
        panDiv.appendChild(Builder.buildNumberProperty("Sensitivity X", inputHandler.preferences.xPanSensivity));
        panDiv.appendChild(Builder.buildNumberProperty("Sensitivity Y", inputHandler.preferences.yPanSensivity));

        rotateDiv.appendChild(Builder.buildNumberProperty("Direction Yaw", inputHandler.preferences.yawRotateDirection));
        rotateDiv.appendChild(Builder.buildNumberProperty("Direction Pitch", inputHandler.preferences.pitchRotateDirection));
        rotateDiv.appendChild(Builder.buildNumberProperty("Sensitivity Yaw", inputHandler.preferences.pitchRotateSensivity));
        rotateDiv.appendChild(Builder.buildNumberProperty("Sensitivity Pitch", inputHandler.preferences.yawRotateSensivity));

        orbitDiv.appendChild(Builder.buildNumberProperty("Direction Yaw", inputHandler.preferences.yawOrbitDirection));
        orbitDiv.appendChild(Builder.buildNumberProperty("Direction Pitch", inputHandler.preferences.pitchOrbitDirection));
        orbitDiv.appendChild(Builder.buildNumberProperty("Sensitivity Yaw", inputHandler.preferences.yawOrbitSensivity));
        orbitDiv.appendChild(Builder.buildNumberProperty("Sensitivity Pitch", inputHandler.preferences.pitchOrbitSensivity));

        zoomDiv.appendChild(Builder.buildNumberProperty("Direction Zoom", inputHandler.preferences.zoomDirection));
        zoomDiv.appendChild(Builder.buildNumberProperty("Sensitivity Zoom", inputHandler.preferences.zoomSensivity));

        const element = template.content.firstElementChild as HTMLDivElement;
        this.element = element;
        document.body.appendChild(element);
    }

    public toggle() {
        this.element.classList.toggle("hidden");
    }
}