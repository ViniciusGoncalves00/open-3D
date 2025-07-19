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
    public static preferences: Preferences | undefined;
    public static engine: Engine;

    public static autoSaveIntervalId: number = 0;

    public async init(): Promise<void> {
        Storage.db = await Storage.openDB();

        const dbPreferencesData = await Storage.runTransaction('preferences', 'readonly', (store) => {return store.getAll()}, "");
        Storage.preferences = Preferences.fromJson(dbPreferencesData);

        const dbProjects = await Storage.runTransaction('projects', 'readonly', (store) => {return store.getAll()}, ``) as Project[];
        if(dbProjects.length < 1) return;

        Storage.engine.currentProject.value = new Project(dbProjects[0].id, dbProjects[0].name, dbProjects[0].scenes);
        Storage.engine.currentProject.value.SetActiveSceneByIndex(0);

        Storage.preferences.autoSave ? this.startAutoSave(this._autoSaveIntervalInSeconds) : undefined;
    }

    public static async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.dbName, this.dbVersion);

          request.onupgradeneeded = async () => {
            const db = request.result;

            if (!db.objectStoreNames.contains('preferences')) {
                db.createObjectStore('preferences');
                
                const preferences = new Preferences();
                await Storage.runTransaction('preferences', 'readwrite', (store) => {return store.put(preferences.toJson())}, "");
            }
            if (!db.objectStoreNames.contains('projects')) {
              db.createObjectStore('projects');

              const scene = new Scene(crypto.randomUUID(), "scene1");
              const project = new Project(crypto.randomUUID(), "project1", [scene]);
              await Storage.runTransaction('projects', 'readwrite', (store) => {return store.put(project)}, "");
            }
          };

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
    }

    // ------------------ AUTOSAVE ------------------ 

    private static restartAutoSave(): void {
      Storage.stopAutoSave();
      Storage.startAutoSave(Storage.autoSaveIntervalId);
    }

    private static startAutoSave(interval: number): void {
      Storage.autoSaveIntervalId = window.setInterval(() => {Storage.saveAll()}, interval * 1000);
    }

    private static stopAutoSave(): void {
      clearInterval(Storage.autoSaveIntervalId);
    }

    // ------------------ DATABASE ------------------ 

    public static async saveAll(): Promise<void> {

    }

    public static async saveProject(): Promise<void> {
        
    }

    public static async savePreferences(): Promise<void> {

    }

    private static runTransaction<T>(
        storeName: string,
        mode: IDBTransactionMode,
        operation: (store: IDBObjectStore) => IDBRequest<T>,
        transactionDescription?: string
    ): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const transaction = Storage.db?.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => {
          resolve(request.result);
        };
    
        request.onerror = () => {
          this.console.log(LogType.Error, `Oh no! Something went wrong during the ${transactionDescription} operation`);
          reject(request.error);
          };
      });
    }
}