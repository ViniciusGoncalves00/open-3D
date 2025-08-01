export enum Icons {
    ArrowDown = "bi-caret-down-fill",
    ArrowRight = "bi-caret-right-fill",
    Box = "bi bi-box",
    Braces = "bi bi-braces",
    Dice3 = "bi bi-dice-3",
    Download = "bi bi-download",
    FileText = "bi bi-file-text",
    Floppy = "bi bi-floppy",
    FullScreen = "bi bi-fullscreen",
    Gear = "bi bi-gear",
    Github = "bi bi-github",
    Grid = "bi bi-grid-3x3",
    Info = "bi bi-info-circle",
    Justify = "bi bi-justify",
    LinkedIn = "bi bi-linkedin",
    Nested = "bi bi-list-nested",
    Options = "bi bi-three-dots-vertical",
    Pause = "bi bi-pause",
    People = "bi bi-people",
    Play = "bi bi-play",
    Square = "bi bi-square",
    SquareCheck = "bi bi-check-square",
    SquarePlus = "bi bi-plus-square",
    Stop = "bi bi-stop",
    Trash = "bi bi-trash",
    Upload = "bi bi-upload",
}

export class Builder {
    public static section(title: string, icon: Icons): HTMLElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div id="${title}" class="tab-body max-h-1/2 flex flex-col">
                <div data-role="header" class="title-bar tab-title cursor-grab">
                    <i class="${icon}"></i>
                    <p>${title}</p>
                </div>
                <div data-role="subHeader" class="flex items-center justify-start bg-zinc-600">
                </div>
                <div data-role="body" class="flex-1 p-2 overflow-auto"></div>
            </div>
        `.trim();
        return template.content.firstElementChild as HTMLElement;
    }

    public static button(name: string, callback: () => void): HTMLButtonElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <button class="bg-zinc-700 hover:bg-zinc-600 text-white w-full h-6 flex items-center justify-center px-2 cursor-pointer truncate">${name}</button>
        `.trim();
        const button = template.content.firstElementChild as HTMLButtonElement;
        button.addEventListener("click", callback);
        return button;
    }
}