import { Console } from "../../ui/elements/console/console";
import { LogType } from "../api/enum/log-type";
import { Engine } from "../engine/engine";
import { Project } from "../engine/project";
import { Scene } from "../engine/scene";
import { Preferences } from "./preferences";

export class Storage {
    public static readonly dbName = 'open3d-storage';
    public static readonly dbVersion = 1;
    public static db: IDBDatabase | null;
    public static engine: Engine;
    public static autoSaveIntervalId: number = 0;
    
    private static preferences: Preferences;
    private static readonly hour: number = 3600000;
    private static readonly second: number = 1000;
    
    private constructor(){}

    public static async init(): Promise<void> {
        this.openDB();
        this.loadPreferences();
        this.loadProjects();
    }

    private static async openDB(): Promise<void> {
        this.db = await new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, this.dbVersion);

          request.onupgradeneeded = async () => {
            const db = request.result;

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

    public static setAutoSaveInterval(interval: number, magnitude: TimeFormat = TimeFormat.Milisecond): void {
      if(magnitude == TimeFormat.Second) interval *= 1000;
      else if(magnitude == TimeFormat.Minute) interval *= 60000;
      else if(magnitude == TimeFormat.Hour) interval *= 3600000;

      if(interval < this.second || interval > this.hour) return;
      this.preferences.autoSaveInterval = interval;

      this.restartAutoSave();
    }

    public static toggleAutoSave(): void {
      this.preferences.autoSaveEnabled = !this.preferences.autoSaveEnabled;
      this.preferences.autoSaveEnabled ? this.startAutoSave(this.preferences.autoSaveInterval) : this.stopAutoSave();
    }

    private static restartAutoSave(): void {
      this.stopAutoSave();
      this.startAutoSave(this.preferences.autoSaveInterval);
    }

    private static startAutoSave(interval: number): void {
      const project = this.engine.currentProject.value;
      if(!project) return;
      this.autoSaveIntervalId = window.setInterval(() => {this.saveAll(this.preferences, project)}, interval);
    }

    private static stopAutoSave(): void {
      clearInterval(this.autoSaveIntervalId);
    }

    // ------------------ DATABASE ------------------ 

    public static async saveAll(preferences: Preferences, project: Project): Promise<void> {
      this.savePreferences(preferences);
      this.saveProject(project);
    }

    public static async saveProject(project: Project): Promise<void> {
        await this.runTransaction('project', 'readwrite', (store) => store.put(project.toJSON(), ''));
    }

    private static async loadProjects(): Promise<void> {
      const dbProjects = await Storage.runTransaction('projects', 'readonly', (store) => {return store.getAll()}, ``) as Project[];
      if(dbProjects.length < 1) return;

      this.engine.currentProject.value = new Project(dbProjects[0].id, dbProjects[0].name, dbProjects[0].scenes);
      this.engine.currentProject.value.SetActiveSceneByIndex(0);

      if(this.preferences.autoSaveEnabled) Storage.startAutoSave(Storage.preferences.autoSaveInterval);
    }

    public static async savePreferences(preferences: Preferences): Promise<void> {
      await this.runTransaction('preferences', 'readwrite', (store) => store.put(preferences.toJSON(), ''));
    }

    private static async loadPreferences(): Promise<void> {
      const dbPreferencesData = await Storage.runTransaction('preferences', 'readonly', (store) => {return store.getAll()}, "");
      Storage.preferences = Preferences.fromJSON(dbPreferencesData);
    }

    private static runTransaction<T>(
        storeName: string,
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => IDBRequest<T>,
        transactionDescription?: string
    ): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const transaction = Storage.db?.transaction(storeName, mode);
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