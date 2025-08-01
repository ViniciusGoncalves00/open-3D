import './styles.css';
import { Storage } from './core/persistence/storage';
import { Engine } from './core/engine/engine';
import { Console } from './ui/sections/console/console';
import { Theme } from './ui/enums/theme';
import { Project } from './core/engine/project';

window.addEventListener('DOMContentLoaded', () => {
    new Program();
});

export class Program {
    public readonly devMode: boolean;

    private _storage!: Storage;
    private get storage(): Storage { return this._storage; }

    public constructor(devMode: boolean = false) {
        this.devMode = devMode;

        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.initiliazeStorage();

        this.initializeTheme();

        const projectsList = this.getElementOrFail<HTMLDivElement>('projectsList');
        
        this._storage.metadata.forEach(metadata => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "w-full h-12 border-b border-(--color-gray-02) flex-none flex items-center justify-between hover:bg-(--color-gray-09)";

            rowDiv.addEventListener("click", async () => {
                const project = await this._storage.loadProjectById(metadata.id)
                window.location.href = this.redirectToProject(project!.id, project!.activeScene.value.id);
            });
            const link = document.createElement("a");
            link.className = "w-full h-full flex items-center justify-between cursor-pointer";
            link.innerHTML = `
                <span class="bi bi-box w-12 h-full flex-none flex items-center justify-center cursor-pointer"></span>
                <span class="w-[calc(25%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.name}</p></span>
                <span class="w-[calc(20%)] h-full flex items-center"><p class="w-full text-center truncate">${new Date(metadata.createdAt).toLocaleString()}</p></span>
                <span class="w-[calc(20%)] h-full flex items-center"><p class="w-full text-center truncate">${new Date(metadata.updatedAt).toLocaleString()}</p></span>
                <span class="w-[calc(10%-48px)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.version}</p></span>
                <span class="w-[calc(25%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.id}</p></span>
            `;
            rowDiv.appendChild(link);
                    
            const downloadButton = document.createElement("button");
            downloadButton.className = "bi bi-download w-12 h-full flex items-center justify-center cursor-pointer hover:text-(--color-text-fixed) hover:bg-(--color-teal-green-lightest)";
            rowDiv.appendChild(downloadButton);

            const deleteButton = document.createElement("button");
            deleteButton.className = "bi bi-trash w-12 h-full flex items-center justify-center cursor-pointer hover:text-(--color-text-fixed) hover:bg-(--color-teal-green-lightest)";
            deleteButton.addEventListener("click", () => this.storage.deleteProjectById(metadata.id));
            rowDiv.appendChild(deleteButton);
                    
            projectsList.appendChild(rowDiv);
        });

        const newProjectButton = this.getElementOrFail<HTMLButtonElement>('newProject');
        newProjectButton.addEventListener("click", async () => {
            const project = await this._storage.createProject();
            if (project) {
                window.location.href = this.redirectToProject(project.id, project.activeScene.value.id);
            }
        });
    }

    private redirectToProject(projectId: string, sceneId: string): string {
      return `editor.html?projectId=${projectId}&sceneId=${sceneId}`;
    }

    private initializeTheme(): void {
    const onIcon = this.getElementOrFail<HTMLButtonElement>('on');
    const offIcon = this.getElementOrFail<HTMLButtonElement>('off');
    const darkModeToggle = this.getElementOrFail<HTMLButtonElement>('darkMode');
 
    const currentTheme = this.storage.preferences.theme;

    document.body.setAttribute("data-theme", currentTheme);
    const isDarkMode = this.storage.preferences.theme === Theme.Dark;
    isDarkMode ? offIcon.classList.add("hidden") : onIcon.classList.add("hidden")

    darkModeToggle.addEventListener("click", () => {
        const isDarkMode = this.storage.preferences.theme === Theme.Dark;
        const newTheme = isDarkMode ? Theme.Light : Theme.Dark;

        this.storage.preferences.theme = newTheme;
        this.storage.savePreferences();
        document.body.setAttribute("data-theme", newTheme);

        onIcon.classList.toggle("hidden");
        offIcon.classList.toggle("hidden");
    });
}

    private async initiliazeStorage(): Promise<void> {
        this._storage = new Storage();
        await this._storage.init();
    }

    private getElementOrFail<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`UI element '${id}' not found`);
        }
        return element as T;
    }
}