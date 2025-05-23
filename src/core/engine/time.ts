import { ObservableField } from "../../common/patterns/observer/observable-field";

export class Time {
    public globalTimeScale = 1;

    public get deltaTime(): number { return this._deltaTime; }
    public get lastTime(): number { return this._lastTime; }
    public get framesPerSecond(): ObservableField<number> { return this._framesPerSecond; }
    public get averageFramesPerSecond(): ObservableField<number> { return this._averageFramesPerSecond; }

    private _deltaTime: number = 0;
    private _lastTime: number = 0;
    private _framesPerSecond: ObservableField<number> = new ObservableField(0);
    private _averageFramesPerSecond: ObservableField<number> = new ObservableField(0);

    private readonly _milisecondToSecond = 1000;
    private readonly _fpsHistory: number[] = [];
    private readonly _fpsSmoothing = 10;

    public update(): void {
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / this._milisecondToSecond;
        this._deltaTime = deltaTime * this.globalTimeScale;
        this._lastTime = now;
        this._framesPerSecond.value = Math.round(1 / deltaTime);

        this._fpsHistory.push(1 / deltaTime);
        if (this._fpsHistory.length > this._fpsSmoothing)
            this._fpsHistory.shift();

        const averageFps = this._fpsHistory.reduce((a, b) => a + b) / this._fpsHistory.length;
        this._averageFramesPerSecond.value = Math.round(averageFps);
    }
}