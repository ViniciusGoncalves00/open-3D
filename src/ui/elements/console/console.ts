import { ObservableList } from "../../../common/patterns/observer/observable-list";
import { LogType } from "../../../core/api/enum/log-type";
import { Log } from "../../../core/api/log";

export class Console{
    public readonly logs: ObservableList<Log> = new ObservableList();

    private readonly _container: HTMLElement;
    private selectedLogsFilter : LogType | null = null;

    public constructor(container: HTMLElement) {
        this._container = container;
    }

    public log(message: string, logType: LogType = LogType.Log) {
        const log = new Log(Date.now(), logType, message);
        this.logs.add(log)

        const logLine = document.createElement("p");
        logLine.textContent = this.format(log);
    
        switch (logType) {
            case LogType.Success:
                logLine.classList.add("log-success");
                break;
            case LogType.Warning:
                logLine.classList.add("log-warning");
                break;
            case LogType.Error:
                logLine.classList.add("log-error");
                break;
            case LogType.Debug:
                logLine.classList.add("log-debug");
                break;
            default:
                logLine.classList.add("log-log");
                break;
        }
        
        if (this.selectedLogsFilter !== null && logType !== this.selectedLogsFilter) {
            logLine.classList.add("hidden");
        }
    
        this._container.appendChild(logLine);
        this._container.scrollTop = this._container.scrollHeight;
    }
    
    public clear(): void {
        this._container.innerHTML = "";
    }

    public filter(logType: LogType | null): void {
        this.selectedLogsFilter = logType;
        const typeText = logType !== null ? `[${LogType[logType]}]` : null;

        this._container.childNodes.forEach(child => {
            if (!(child instanceof HTMLElement)) return;

            if (!typeText) {
                child.classList.remove("hidden");
            } else {
                if (child.textContent?.includes(typeText)) {
                    child.classList.remove("hidden");
                } else {
                    child.classList.add("hidden");
                }
            }
        });
    }   

    private format(log: Log): string {
        const time = new Date(log.time).toLocaleTimeString();
        const type = LogType[log.logType];
        return `[${time}] [${type}] ${log.message}`;
    }
}