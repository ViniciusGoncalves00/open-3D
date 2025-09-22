import { LogType } from "./enum/log-type";

export class Log {
    public readonly time: number;
    public readonly logType: LogType;
    public readonly message: string;
    public readonly caller: string | null;

    public constructor(time: number, logType: LogType, message: string, caller: string | null = null) {
        this.time = time;
        this.logType = logType;
        this.message = message;
        this.caller = caller;
    }
}