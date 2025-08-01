import { LogType } from "../../../core/api/enum/log-type";
import { Log } from "../../../core/api/log";
import { Utils } from "../../utils";
import { Builder, Icons } from "../builder";

export class Console{
    public readonly element: HTMLElement;

    private readonly display: HTMLDivElement;
    private readonly filterButtons: { button: HTMLButtonElement, type: LogType | null }[] = [];
    private readonly logs: Log[] = [];

    private selectedFilter : LogType | null = null;

    public constructor() {
        this.element = Builder.section("Console", Icons.FileText);

        const subHeader = this.element.querySelector('[data-role="subHeader"]') as HTMLDivElement;
        this.display = this.element.querySelector('[data-role="body"]') as HTMLDivElement;

        const createFilterButton = (label: string, type: LogType | null): void => {
            const button = document.createElement("button");
            button.textContent = label;
            button.className = "px-4 py-[2px] hover:bg-zinc-500 hover:outline hover:outline-white/50 hover:z-50 cursor-pointer";
            button.addEventListener("click", () => this.filter(type));
            subHeader.appendChild(button);
            this.filterButtons.push({ button, type });
        };

        createFilterButton("All",     null);
        createFilterButton("Log",     LogType.Log);
        createFilterButton("Success", LogType.Success);
        createFilterButton("Warning", LogType.Warning);
        createFilterButton("Error",   LogType.Error);
        createFilterButton("Debug",   LogType.Debug);

        Utils.getElementOrFail<HTMLDivElement>("Console").replaceWith(this.element);
    }

    public log(message: string, logType: LogType = LogType.Log) {
        const log = new Log(Date.now(), logType, message);
        this.logs.push(log);

        const logLine = document.createElement("p");
        logLine.textContent = this.format(log);
    
        switch (logType) {
            case LogType.Success: logLine.classList.add("log-success"); break;
            case LogType.Warning: logLine.classList.add("log-warning"); break;
            case LogType.Error:   logLine.classList.add("log-error");   break;
            case LogType.Debug:   logLine.classList.add("log-debug");   break;
            default:              logLine.classList.add("log-log");     break;
        }
        
        if (this.selectedFilter !== null && logType !== this.selectedFilter) {
            logLine.classList.add("hidden");
        }
    
        this.display.appendChild(logLine);
        this.display.scrollTop = this.display.scrollHeight;
    }
    
    public clear(): void {
        this.display.innerHTML = "";
    }

    public filter(logType: LogType | null): void {
        this.selectedFilter = logType;

        this.filterButtons.forEach(({ button, type }) => {
            if (type === logType) {
                button.classList.add("bg-zinc-700");
                button.classList.add("inset-shadow-[0_0_2px_rgba(0,0,0,1)]");
            } else {
                button.classList.remove("bg-zinc-700");
                button.classList.remove("inset-shadow-[0_0_2px_rgba(0,0,0,1)]");
            }
        });

        const typeText = logType !== null ? `[${LogType[logType]}]` : null;

        this.display.childNodes.forEach(child => {
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