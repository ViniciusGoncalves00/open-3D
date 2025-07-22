import { Console } from "../../ui/elements/console/console";
import { LogType } from "../api/enum/log-type";
import { Engine } from "../engine/engine";
import { Project } from "../engine/project";
import { Scene } from "../engine/scene";
import { Preferences } from "./preferences";

interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export class Storage {
  public readonly dbName = 'open3d-storage';
  public readonly dbVersion = 1;
  public db!: IDBDatabase | null;
  public autoSaveIntervalId: number = 0;
  public projectsMetadata!: ProjectMetadata[];

  private preferences!: Preferences;

  private readonly hour: number = 3600000;
  private readonly second: number = 1000;
  private readonly engine!: Engine;
  private readonly console!: Console;
    
  public constructor(engine: Engine, console: Console) {
    this.engine = engine;
    this.console = console;
  }

  public async init(): Promise<void> {
    await this.openDB();
    await this.loadPreferences();
    await this.loadProjectsMetadata();
  }

  private async openDB(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('open3d-storage', this.dbVersion);
      let needsInitPreferences = false;

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences');
          needsInitPreferences = true;
        }

        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects');
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        this.db = db;

        if (needsInitPreferences) {
          this.preferences = new Preferences();
          await this.savePreferences();
        }

        resolve(db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

    // ------------------ AUTOSAVE ------------------ 

    public setAutoSaveInterval(interval: number, magnitude: TimeFormat = TimeFormat.Milisecond): void {
      if(magnitude == TimeFormat.Second) interval *= 1000;
      else if(magnitude == TimeFormat.Minute) interval *= 60000;
      else if(magnitude == TimeFormat.Hour) interval *= 3600000;

      if(interval < this.second || interval > this.hour) return;
      this.preferences.autoSaveInterval = interval;

      this.restartAutoSave();
    }

    public getAutoSaveInterval(): number {
      return this.preferences.autoSaveInterval;
    }

    public toggleAutoSave(): void {
      this.preferences.autoSaveEnabled = !this.preferences.autoSaveEnabled;
      this.preferences.autoSaveEnabled ? this.startAutoSave(this.preferences.autoSaveInterval) : this.stopAutoSave();
    }

    private restartAutoSave(): void {
      this.stopAutoSave();
      this.startAutoSave(this.preferences.autoSaveInterval);
    }

    private startAutoSave(interval: number): void {
      const project = this.engine.currentProject.value;
      if(!project) return;
      this.autoSaveIntervalId = window.setInterval(() => this.saveAll(project), interval);
    }

    private stopAutoSave(): void {
      clearInterval(this.autoSaveIntervalId);
    }

    // ------------------ DATABASE ------------------ 

    public async saveAll(project: Project): Promise<void> {
      this.savePreferences();
      this.saveProject(project);
    }

    public async createProject(name?: string): Promise<Project> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
    
      const scene = new Scene(crypto.randomUUID(), "scene");
      const project = new Project(id, name ?? "project", [scene]);
    
      const metadata = {
        id,
        name: project.name,
        createdAt: now,
        updatedAt: now,
        version: this.dbVersion,
        data: project.toJSON()
      };
    
      await this.runTransaction('projects', 'readwrite', (store) => store.put(metadata, id));
    
      return project;
    }

    public async saveProject(project: Project): Promise<void> {
        await this.runTransaction('projects', 'readwrite', (store) => store.put(project.toJSON(), ''));
    }

    private async loadProjectsMetadata(): Promise<void> {
      const projectsRaw = await this.runTransaction('projects', 'readonly', (store) => store.getAll(), '');

      this.projectsMetadata = projectsRaw.map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        version: entry.version
      }));
    }

    public async loadProjectById(id: string): Promise<Project | null> {
      const entry = await this.runTransaction('projects', 'readonly', (store) => store.get(id), '');
        
      if (!entry || !entry.data) {
        return null;
      }
    
      return Project.fromJSON(entry.data);
    }

    public async deleteProjectById(id: string): Promise<void> {
      await this.runTransaction('projects', 'readwrite', (store) => {return store.delete(id)});
    } 

    public async savePreferences(): Promise<void> {
      await this.runTransaction('preferences', 'readwrite', (store) => store.put(this.preferences.toJSON(), 'preferences'));
    }

    private async loadPreferences(): Promise<void> {
      const preferencesData = await this.runTransaction('preferences', 'readonly', (store) => store.get('preferences'), "");
      this.preferences = Preferences.fromJSON(preferencesData);
    }

    private runTransaction<T>(
        storeName: string,
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => IDBRequest<T>,
        transactionDescription?: string
    ): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const transaction = this.db?.transaction(storeName, mode);
        if(!transaction) return;

        const store = transaction.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => {
          resolve(request.result);
        };
    
        request.onerror = () => {
          reject(request.error);
          };
      });
    }
}