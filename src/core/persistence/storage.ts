import { Console } from "../../ui/elements/console/console";
import { LogType } from "../api/enum/log-type";
import { Engine } from "../engine/engine";
import { Project } from "../engine/project";
import { Scene } from "../engine/scene";
import { Preferences } from "./preferences";

export class Storage {
  public readonly dbName = 'open3d-storage';
  public readonly dbVersion = 1;
  public db!: IDBDatabase | null;
  public autoSaveIntervalId: number = 0;

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
    await this.loadProjects();
  }

  private async openDB(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = async () => {
        const db = request.result;
        let createdPreferences = false;
        let createdProjects = false;

        if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences');
              
            const preferences = new Preferences();
            await this.runTransaction('preferences', 'readwrite', (store) => {return store.put(preferences.toJSON())}, "");
          }
        if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects');

          const scene = new Scene(crypto.randomUUID(), "scene1");
          const project = new Project(crypto.randomUUID(), "project1", [scene]);
          await this.runTransaction('projects', 'readwrite', (store) => {return store.put(project)}, "");
        }
      }

      request.onsuccess = () => {
        resolve(request.result);
      }

      request.onerror = () => {
        reject(request.error);
      }
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

    public async saveProject(project: Project): Promise<void> {
        await this.runTransaction('projects', 'readwrite', (store) => store.put(project.toJSON(), ''));
    }

    private async loadProjects(): Promise<void> {
      const dbProjects = await this.runTransaction('projects', 'readonly', (store) => {return store.getAll()}, ``) as Project[];
      if(dbProjects.length < 1) return;

      this.engine.currentProject.value = new Project(dbProjects[0].id, dbProjects[0].name, dbProjects[0].scenes);
      this.engine.currentProject.value.SetActiveSceneByIndex(0);

      if(this.preferences.autoSaveEnabled) this.startAutoSave(this.preferences.autoSaveInterval);
    }

    public async savePreferences(): Promise<void> {
      await this.runTransaction('preferences', 'readwrite', (store) => store.put(this.preferences.toJSON(), 'preferences'));
    }

    private async loadPreferences(): Promise<void> {
      const dbPreferencesData = await this.runTransaction('preferences', 'readonly', (store) => store.get('preferences'), "");
      this.preferences = Preferences.fromJSON(dbPreferencesData);
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