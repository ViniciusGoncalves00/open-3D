import { ObservableField } from "../../common/observer/observable-field";

export class Time {
    public static readonly deltaTime: ObservableField<number> = new ObservableField(0);
    public static readonly lastTime: ObservableField<number> = new ObservableField(0);

    public static readonly globalTimeScale: ObservableField<number> = new ObservableField(1);
    public static readonly framesPerSecond: ObservableField<number> = new ObservableField(0);
    public static readonly averageFramesPerSecond: ObservableField<number> = new ObservableField(0);

    public static readonly milisecondToSecond: ObservableField<number> = new ObservableField(1000);
    public static readonly fpsHistory: number[] = [];
    public static readonly fpsSmoothing = 100;

    public static update(): void {
        const now = performance.now();
        const deltaTime = (now - this.lastTime.value) / this.milisecondToSecond.value;
        this.deltaTime.value = deltaTime * this.globalTimeScale.value;
        this.lastTime.value = now;
        this.framesPerSecond.value = Math.round(1 / deltaTime);

        this.fpsHistory.push(1 / deltaTime);
        if (this.fpsHistory.length > this.fpsSmoothing)
            this.fpsHistory.shift();

        const averageFps = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
        this.averageFramesPerSecond.value = Math.round(averageFps);
    }
}