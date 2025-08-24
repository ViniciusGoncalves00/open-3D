import { TimeController } from "../../../../core/engine/time-controller";
import { Utils } from "../../others/utils";

export class Screen {
    private isFullscreenEnabled: boolean = false;

    public constructor(
        timeController: TimeController,
        window: HTMLElement,
    ) {
        const fullScreen = Utils.getElementOrFail<HTMLButtonElement>('fullScreen');
        
        const originalParent = window.parentElement!;
        const originalNextSibling = window.nextSibling;

        const fullscreenContainer = document.createElement("div");
        fullscreenContainer.classList.add(
            "fixed", "top-8", "left-0", "right-0", "bottom-0",
            "z-50", "overflow-hidden"
        );
        fullscreenContainer.style.display = "none";
        document.body.appendChild(fullscreenContainer);

        fullScreen.addEventListener('click', () => {
            this.isFullscreenEnabled = !this.isFullscreenEnabled;

            fullScreen.classList.toggle("border", this.isFullscreenEnabled);
            fullScreen.classList.toggle("border-white", this.isFullscreenEnabled);

            if (timeController.isRunning.value) {
                if (this.isFullscreenEnabled) {
                    fullscreenContainer.appendChild(window);
                    fullscreenContainer.style.display = "block";
                } else {
                    if (originalNextSibling) {
                        originalParent.insertBefore(window, originalNextSibling);
                    } else {
                        originalParent.appendChild(window);
                    }
                    fullscreenContainer.style.display = "none";
                }
            }
        });

        timeController.isRunning.subscribe(isRunning => {
            if (!this.isFullscreenEnabled) return;

            if (isRunning) {
                fullscreenContainer.appendChild(window);
                fullscreenContainer.style.display = "block";
            } else {
                if (originalNextSibling) {
                    originalParent.insertBefore(window, originalNextSibling);
                } else {
                    originalParent.appendChild(window);
                }
                fullscreenContainer.style.display = "none";
            }
        });
    }
}
