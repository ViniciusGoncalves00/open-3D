import { ObservableField } from "../../../../common/observer/observable-field";
import { LogType } from "../../../../core/api/enum/log-type";
import { Log } from "../../../../core/api/log";
import { Utils } from "../../others/utils";
import { Section } from "../base";
import { Builder, Icons } from "../builder";

export class ConsoleLogger{
    private static readonly filterButtons: { button: HTMLButtonElement, type: LogType | null }[] = [];
    private static readonly logs: Log[] = [];

    private static selectedFilter : LogType | null = null;

    private static sectionContainer: HTMLElement | null = null;
    private static buttonContainer: HTMLElement | null = null;

    private static button: HTMLButtonElement;
    protected static section: HTMLDivElement;
    protected static subHeader: HTMLDivElement;
    protected static sectionBody: HTMLDivElement;

    private static visible: ObservableField<boolean> = new ObservableField(true);
    private static pinned: ObservableField<boolean> = new ObservableField(false);

    private static readonly linesToReturnToGetTheCaller = 4;

    public constructor() {
        // super("Console", Icons.FileText);

        ConsoleLogger.button = Builder.sectionButton(Icons.FileText, () => ConsoleLogger.toggle(), ConsoleLogger.visible);
        ConsoleLogger.section = Builder.section("Console", Icons.FileText, () => ConsoleLogger.toggle(), () => ConsoleLogger.pin());

        ConsoleLogger.subHeader = ConsoleLogger.section.querySelector('[data-role="subHeader"]') as HTMLDivElement;
        ConsoleLogger.sectionBody = ConsoleLogger.section.querySelector('[data-role="body"]') as HTMLDivElement;

        ConsoleLogger.section.classList.remove("w-84");
        ConsoleLogger.section.classList.add("w-full");

        const createFilterButton = (label: string, type: LogType | null): HTMLButtonElement => {
            const button = document.createElement("button");
            button.textContent = label;
            button.className = "bg-gray-07 hover:bg-gray-09 text-text-primary text-sm font-base hover:font-medium cursor-pointer h-6 px-4 py-[2px] flex items-center justify-center";
            button.addEventListener("click", () => ConsoleLogger.filter(type));
            ConsoleLogger.subHeader.appendChild(button);
            ConsoleLogger.filterButtons.push({ button, type });
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

    public static log(message: string) {
        this.append(message, LogType.Log);
    }

    public static warning(message: string): void {
        this.append(message, LogType.Warning);
    }

    public static debug(message: string): void {
        this.append(message, LogType.Debug);
    }

    public static error(message: string): void {
        this.append(message, LogType.Error);
    }

    public static success(message: string): void {
        this.append(message, LogType.Success);
    }
    
    public static clear(): void {
        this.sectionBody.innerHTML = "";
    }

    public static filter(logType: LogType | null): void {
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

    public static toggle(): void {
        if(this.pinned.value) return;

        this.visible.value = !this.visible.value;
        this.visible.value ? ConsoleLogger.sectionContainer?.appendChild(ConsoleLogger.section) : ConsoleLogger.sectionContainer?.removeChild(ConsoleLogger.section);
    }

    public static pin(): void {
        this.pinned.value = !this.pinned.value;
    }

    public static assign(sectionContainer: HTMLElement, buttonContainer: HTMLElement): void {
        if(ConsoleLogger.pinned.value) return;

        ConsoleLogger.buttonContainer?.removeChild(ConsoleLogger.button);
        ConsoleLogger.sectionContainer?.removeChild(ConsoleLogger.section);

        ConsoleLogger.sectionContainer = sectionContainer;
        ConsoleLogger.buttonContainer = buttonContainer;

        ConsoleLogger.buttonContainer.appendChild(ConsoleLogger.button);
        if(ConsoleLogger.visible.value) ConsoleLogger.sectionContainer?.appendChild(ConsoleLogger.section);
    }

    private static append(message: string, logType: LogType = LogType.Log) {
        let caller: string | undefined;
        if(logType === LogType.Warning || LogType.Error) {
            caller = this.caller();
        }

        const log = new Log(Date.now(), logType, message, caller);
        this.logs.push(log);

        const logLine = document.createElement("p");
        logLine.className = "px-1";
        logLine.textContent = this.format(log);
    
        switch (logType) {
            case LogType.Success: logLine.classList.add("log-success"); break;
            case LogType.Warning: logLine.classList.add("log-warning"); break;
            case LogType.Error:   logLine.classList.add("log-error");   break;
            case LogType.Debug:   logLine.classList.add("log-debug");   break;
            case LogType.Log:     logLine.classList.add("log-log");     break;
            default:              logLine.classList.add("log-log");     break;
        }
        
        if (this.selectedFilter !== null && logType !== this.selectedFilter) {
            logLine.classList.add("hidden");
        }
    
        this.sectionBody.appendChild(logLine);
        this.sectionBody.scrollTop = this.sectionBody.scrollHeight;
    }

    private static format(log: Log): string {
        const time = new Date(log.time).toLocaleTimeString();
        const type = LogType[log.logType];
        const caller = log.caller ? ` (${log.caller})` : "";
        return `[${time}] [${type}] ${log.message}${caller}`;
    }

    private static caller(): string {
        let caller: string | undefined;
        const stack = new Error().stack;

        if(!stack) return "";
        
        const lines = stack.split("\n");
        caller = lines[this.linesToReturnToGetTheCaller]?.trim();

        if(!caller) return "";

        const parts = caller.split("/");
        const last = parts[parts.length - 1];
        const [file] = last.split("?");
        return file;
    }
}