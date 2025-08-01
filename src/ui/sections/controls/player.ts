import { TimeController } from "../../../core/engine/time-controller";
import { Utils } from "../../utils";

export class Player {
    public constructor(timeController: TimeController) {
        const play = Utils.getElementOrFail<HTMLButtonElement>('play');
        const stop = Utils.getElementOrFail<HTMLButtonElement>('stop');
        const pause = Utils.getElementOrFail<HTMLButtonElement>('pause');

        play.addEventListener('click', () => timeController.start());
        stop.addEventListener('click', () => timeController.stop());
        pause.addEventListener('click', () =>  timeController.isPaused.value ? timeController.unpause() : timeController.pause());

        timeController.isRunning.subscribe(value => {
          play.classList.toggle('border', value);
          play.classList.toggle('border-white', value);
        });

        timeController.isPaused.subscribe(value => {
          pause.classList.toggle("border", value)
          pause.classList.toggle("border-white", value)
        })
    }
}