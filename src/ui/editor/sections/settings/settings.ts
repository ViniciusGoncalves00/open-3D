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
                <div data-role="header" class="text-bold bg-gray-06 text-sm w-full h-6 flex items-center outline outline-gray-01 z-20 select-none sticky">
                    <i class="h-full aspect-square flex items-center justify-center ${icon}"></i>
                    <p class="w-full truncate">${title}</p>
                    <button data-role="close" class="h-full aspect-square cursor-pointer text-base hover:bg-gray-08 ${Icons.Close}"></button>
                </div>
                <div data-role="subHeader" class="bg-gray-06 flex-wrap flex-none flex items-center justify-start overflow-hidden z-10 outline outline-gray-01 sticky">
                </div>
                <div data-role="body" class="bg-gray-08 h-full p-2 space-y-1 overflow-y-auto">
                    <div data-role="database" class="w-full font-bold">Database</div>
                    <div data-role="camera" class="w-full font-bold">Camera</div>
                </div>
            </div>
        </div>
        `;

        const section = template.content.firstElementChild as HTMLDivElement;
        const closeButton = section.querySelector('[data-role="close"]') as HTMLButtonElement;
        closeButton.addEventListener("click", () => this.toggle());

        const body = section.querySelector('[data-role="body"]') as HTMLDivElement;
        const databaseDiv = body.querySelector('[data-role="database"]') as HTMLDivElement;
        databaseDiv.appendChild(Builder.buildBooleanProperty("Autosave enabled", storage.preferences.autoSaveEnabled));
        databaseDiv.appendChild(Builder.buildNumberProperty("Autosave interval (seconds)", storage.preferences.autoSaveInterval));

        const cameraDiv = body.querySelector('[data-role="camera"]') as HTMLDivElement;

        cameraDiv.appendChild(Builder.buildKeyBindingMouseProperty("Pan buttons", inputHandler.panButtons));
        cameraDiv.appendChild(Builder.buildKeyBindingMouseProperty("Orbit buttons", inputHandler.orbitButtons));
        cameraDiv.appendChild(Builder.buildKeyBindingMouseProperty("Rotate buttons", inputHandler.rotateButtons));

        cameraDiv.appendChild(Builder.buildNumberProperty("Pan Direction X", inputHandler.xPanDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pan Direction Y", inputHandler.yPanDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pan Sensitivity X", inputHandler.xPanSensivity));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pan Sensitivity Y", inputHandler.yPanSensivity));

        cameraDiv.appendChild(Builder.buildNumberProperty("Yaw Rotate Direction", inputHandler.yawRotateDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pitch Rotate Direction", inputHandler.pitchRotateDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Yaw Rotate Sensitivity", inputHandler.pitchRotateSensivity));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pitch Rotate Sensitivity", inputHandler.yawRotateSensivity));

        cameraDiv.appendChild(Builder.buildNumberProperty("Yaw Orbit Direction", inputHandler.yawOrbitDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pitch Orbit Direction", inputHandler.pitchOrbitDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Yaw Orbit Sensitivity", inputHandler.yawOrbitSensivity));
        cameraDiv.appendChild(Builder.buildNumberProperty("Pitch Orbit Sensitivity", inputHandler.pitchOrbitSensivity));

        cameraDiv.appendChild(Builder.buildNumberProperty("Zoom Direction", inputHandler.zoomDirection));
        cameraDiv.appendChild(Builder.buildNumberProperty("Zoom Sensitivity", inputHandler.zoomSensivity));

        const element = template.content.firstElementChild as HTMLDivElement;
        this.element = element;
        document.body.appendChild(element);
    }

    public toggle() {
        this.element.classList.toggle("hidden");
    }
}