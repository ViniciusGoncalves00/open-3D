import { ObservableField } from "../../common/observer/observable-field";

export class TimeController {
    public readonly isRunning: ObservableField<boolean> = new ObservableField(false);
    public readonly isPaused: ObservableField<boolean> = new ObservableField(false);

    public start(): void {
        this.isRunning.value = true;
    }

    public stop(): void {
        this.isRunning.value = false;
    }

    public pause(): void {
        this.isPaused.value = true;
    }

    public unpause(): void {
        this.isPaused.value = false;
    }
}