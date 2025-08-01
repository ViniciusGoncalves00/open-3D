import { TimeController } from "../../../core/engine/time-controller";

export class Player {
    public constructor(timeController: TimeController, playButton: HTMLButtonElement, stopButton: HTMLButtonElement, pauseButton: HTMLButtonElement) {
        playButton.addEventListener('click', () => timeController.start());
        stopButton.addEventListener('click', () => timeController.stop());
        pauseButton.addEventListener('click', () =>  timeController.isPaused.value ? timeController.unpause() : timeController.pause());

        timeController.isRunning.subscribe(value => {
          playButton.classList.toggle('border', value);
          playButton.classList.toggle('border-white', value);
        });

        timeController.isPaused.subscribe(value => {
          pauseButton.classList.toggle("border", value)
          pauseButton.classList.toggle("border-white", value)
        })
    }
}