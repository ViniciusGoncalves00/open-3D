import { Time } from "../../../../core/engine/time";
import { Utils } from "../../others/utils";

export class Timescale {
  private readonly speedDown: number = 0.5; 
  private readonly speedNormal: number = 1; 
  private readonly speedUp: number = 2; 

  public constructor() {
    const speedUpButton = Utils.getElementOrFail<HTMLButtonElement>('speedUp');
    const speedNormalButton = Utils.getElementOrFail<HTMLButtonElement>('speedNormal');
    const speedDownButton = Utils.getElementOrFail<HTMLButtonElement>('speedDown');

    speedUpButton.addEventListener('click', () => Time.globalTimeScale.value = this.speedUp);
    speedNormalButton.addEventListener('click', () => Time.globalTimeScale.value = this.speedNormal);
    speedDownButton.addEventListener('click', () => Time.globalTimeScale.value = this.speedDown);

    speedNormalButton.classList.toggle('border');
    speedNormalButton.classList.toggle('border-white');

    Time.globalTimeScale.subscribe(value => {
      speedDownButton.classList.toggle('border', value < this.speedNormal);
      speedDownButton.classList.toggle('border-white', value < this.speedNormal);

      speedNormalButton.classList.toggle('border', value === this.speedNormal);
      speedNormalButton.classList.toggle('border-white', value === this.speedNormal);

      speedUpButton.classList.toggle('border', value > this.speedNormal);
      speedUpButton.classList.toggle('border-white', value > this.speedNormal);
    })
  }
}