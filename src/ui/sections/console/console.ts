import { LogType } from "../../../core/api/enum/log-type";
import { Log } from "../../../core/api/log";
import { Utils } from "../../others/utils";
import { Section } from "../base";
import { Builder, Icons } from "../builder";

export class Console extends Section{
    private readonly filterButtons: { button: HTMLButtonElement, type: LogType | null }[] = [];
    private readonly logs: Log[] = [];

    private selectedFilter : LogType | null = null;

    public constructor() {
        super("Console", Icons.FileText);
        
        this.section.classList.remove("w-84");
        this.section.classList.add("w-full");

        const createFilterButton = (label: string, type: LogType | null): HTMLButtonElement => {
            const button = document.createElement("button");
            button.textContent = label;
            button.className = "bg-gray-07 hover:bg-gray-09 text-text-primary text-sm font-base hover:font-medium cursor-pointer h-6 px-4 py-[2px] flex items-center justify-center";
            button.addEventListener("click", () => this.filter(type));
            this.subHeader.appendChild(button);
            this.filterButtons.push({ button, type });
            return button;
        };

        const button = createFilterButton("All",     null);
        createFilterButton("Log",     LogType.Log);
        createFilterButton("Success", LogType.Success);
        createFilterButton("Warning", LogType.Warning);
        createFilterButton("Error",   LogType.Error);
        createFilterButton("Debug",   LogType.Debug);

        button.classList.remove("bg-gray-07");
        button.classList.add("bg-gray-04");
        button.classList.add("border");
        button.classList.add("border-gray-01");
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
    
        this.sectionBody.appendChild(logLine);
        this.sectionBody.scrollTop = this.sectionBody.scrollHeight;
    }
    
    public clear(): void {
        this.sectionBody.innerHTML = "";
    }

    public filter(logType: LogType | null): void {
        this.selectedFilter = logType;

        this.filterButtons.forEach(({ button, type }) => {
            if (type === logType) {
                button.classList.remove("bg-gray-07");
                button.classList.add("bg-gray-04");
                button.classList.add("border");
                button.classList.add("border-gray-01");
            } else {
                button.classList.remove("bg-gray-04");
                button.classList.remove("border");
                button.classList.remove("border-gray-01");
                button.classList.add("bg-gray-07");
            }
        });

        const typeText = logType !== null ? `[${LogType[logType]}]` : null;

        this.sectionBody.childNodes.forEach(child => {
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