import './styles.css';
import { Storage } from './core/persistence/storage';
import { Engine } from './core/engine/engine';
import { Console } from './ui/elements/console/console';

window.addEventListener('DOMContentLoaded', () => {
    new Program();
});

export class Program {
    public readonly devMode: boolean;

    private _storage!: Storage;
    private get storage(): Storage { return this._storage; }

    public constructor(devMode: boolean = false) {
        this.devMode = devMode;
        document.body.setAttribute("data-theme", "light")

        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.initiliazeStorage();

        const projectsList = this.getElementOrFail<HTMLDivElement>('projectsList');
        this._storage.projectsMetadata.forEach(metadata => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "w-full h-12 border-b border-(--color-gray-02) flex-none flex items-center justify-between hover:bg-(--color-gray-09)";
                    
            const href = this.redirectToProject(metadata.id);
            const link = document.createElement("a");
            link.href = href;
            link.className = "w-full h-full flex items-center justify-between cursor-pointer";
            link.innerHTML = `
                <span class="bi bi-box w-12 h-full flex-none flex items-center justify-center cursor-pointer"></span>
                <span class="w-[calc(25%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.name}</p></span>
                <span class="w-[calc(20%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.createdAt}</p></span>
                <span class="w-[calc(20%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.updatedAt}</p></span>
                <span class="w-[calc(10%-48px)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.version}</p></span>
                <span class="w-[calc(25%)] h-full flex items-center"><p class="w-full text-center truncate">${metadata.id}</p></span>
            `;
            rowDiv.appendChild(link);
                    
            const downloadButton = document.createElement("button");
            downloadButton.className = "bi bi-download w-12 h-full flex items-center justify-center cursor-pointer hover:text-(--color-gray-09) hover:bg-(--color-teal-green-lightest)";
            rowDiv.appendChild(downloadButton);

            const deleteButton = document.createElement("button");
            deleteButton.className = "bi bi-trash w-12 h-full flex items-center justify-center cursor-pointer hover:text-(--color-gray-09) hover:bg-(--color-teal-green-lightest)";
            deleteButton.addEventListener("click", () => this.storage.deleteProjectById(metadata.id));
            rowDiv.appendChild(deleteButton);
                    
            projectsList.appendChild(rowDiv);
        });

        const newProjectButton = this.getElementOrFail<HTMLButtonElement>('newProject');
        newProjectButton.addEventListener("click", async () => {
            const project = await this._storage.createProject();
            if (project) {
                window.location.href = this.redirectToProject(project.id);
            }
        });
    }

    private redirectToProject(id: string): string {
      return `editor.html?projectId=${id}`;
    }

    private async initiliazeStorage(): Promise<void> {
        const engine = new Engine();
        const console = new Console(document.createElement("div"));
        this._storage = new Storage(engine, console);
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