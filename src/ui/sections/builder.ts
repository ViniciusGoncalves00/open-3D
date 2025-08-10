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
    public static section(title: string, icon: Icons): HTMLDivElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <div id="${title}" class="bg-zinc-800 text-white max-w-full min-h-64 max-h-full flex flex-col text-sm">
                <div data-role="header" class="title-bar tab-title cursor-grab">
                    <i class="${icon}"></i>
                    <p>${title}</p>
                </div>
                <div data-role="subHeader" class="flex-wrap flex items-center justify-start overflow-hidden bg-zinc-600">
                </div>
                <div data-role="body" class="flex-1 overflow-auto"></div>
            </div>
        `.trim();
        const section = template.content.firstElementChild as HTMLDivElement;
        this.setupDragAndDrop(section);
        return section;
    }

    public static sectionButton(icon: Icons, callback: () => void): HTMLButtonElement {
        const template = document.createElement('template');
        template.innerHTML = `
            <button class="bg-gray-07 hover:bg-gray-09 text-text-primary w-full aspect-square cursor-pointer ${icon}"></button>
        `.trim();
        const button = template.content.firstElementChild as HTMLButtonElement;
        button.addEventListener("click", callback);
        return button;
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

    public static setupDragAndDrop(element: HTMLElement, overlaySelector: string = "#drag-n-drop-overlay", dropzoneSelector: string = ".dropzone") {
        const overlay = document.querySelector(overlaySelector) as HTMLElement;
        const dropzones = document.querySelectorAll(dropzoneSelector);

        let ghost: HTMLElement | null = null;
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;
        let draggedElement: HTMLElement | null = null;

          const makeDraggable = (element: HTMLElement) => {
            const titleBar = element.querySelector(".title-bar") as HTMLElement;
            if (!titleBar) return;
        
            titleBar.addEventListener("mousedown", (e: MouseEvent) => {
              isDragging = true;
              draggedElement = element;
              offsetX = e.offsetX;
              offsetY = e.offsetY;
            
              document.body.classList.add("no-scroll");
              document.documentElement.classList.add("no-scroll");
            
              ghost = element.cloneNode(true) as HTMLElement;
              ghost.id = "ghost";
              ghost.style.position = "absolute";
              ghost.style.width = "128px";
              ghost.style.height = "128px";
              ghost.style.pointerEvents = "none";
              ghost.style.opacity = "0.7";
              ghost.style.zIndex = "1000";
              ghost.innerText = "Dragging...";
              document.body.appendChild(ghost);
            
              ghost.style.left = `${e.clientX - ghost.offsetWidth / 2}px`;
              ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;
            
              e.stopPropagation();
            });
          };
      
          document.addEventListener("mousemove", (e: MouseEvent) => {
            if (!isDragging || !ghost) return;
        
            ghost.style.left = `${e.clientX - ghost.offsetWidth / 2}px`;
            ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;
        
            overlay?.classList.add("active");
        
            dropzones.forEach(zone => {
              zone.classList.add("active");
            
              const rect = zone.getBoundingClientRect();
              const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            
              zone.classList.toggle("hovered", inside);
            });
          });
      
          document.addEventListener("mouseup", (e: MouseEvent) => {
            if (!isDragging) return;
            isDragging = false;
        
            document.body.classList.remove("no-scroll");
            document.documentElement.classList.remove("no-scroll");
        
            let dropped = false;
        
            dropzones.forEach(zone => {
              const rect = zone.getBoundingClientRect();
              const inside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
            
              if (inside && draggedElement) {
                draggedElement.style.position = "relative";
                draggedElement.style.left = "0px";
                draggedElement.style.top = "0px";
                draggedElement.style.zIndex = "auto";
                draggedElement.style.transform = "none";
            
                zone.parentElement?.appendChild(draggedElement);
                dropped = true;
              }
            });
        
            if (!dropped && draggedElement) {
              draggedElement.style.position = "relative";
              draggedElement.style.left = "0px";
              draggedElement.style.top = "0px";
              draggedElement.style.zIndex = "auto";
              const center = document.getElementById("center");
              center?.appendChild(draggedElement);
            }
        
            overlay?.classList.remove("active");
            dropzones.forEach(zone => zone.classList.remove("active", "hovered"));
            ghost?.remove();
            ghost = null;
          });

          makeDraggable(element);
        }
}