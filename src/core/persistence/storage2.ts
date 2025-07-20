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

    public async init(): Promise<void> {
        Storage.db = await Storage.openDB();

        const dbPreferencesData = await Storage.runTransaction('preferences', 'readonly', (store) => {return store.getAll()}, "");
        Storage.preferences = Preferences.fromJson(dbPreferencesData);

        const dbProjects = await Storage.runTransaction('projects', 'readonly', (store) => {return store.getAll()}, ``) as Project[];
        if(dbProjects.length < 1) return;

        Storage.engine.currentProject.value = new Project(dbProjects[0].id, dbProjects[0].name, dbProjects[0].scenes);
        Storage.engine.currentProject.value.SetActiveSceneByIndex(0);

        if(Storage.preferences.autoSaveEnabled) Storage.startAutoSave(Storage.preferences.autoSaveInterval);
    }

    private static async openDB(): Promise<IDBDatabase> {
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

      if(interval < Storage.second || interval > Storage.hour) return;
      Storage.preferences.autoSaveInterval = interval;
    }

    public toggleAutoSave(): void {
      Storage.preferences.autoSaveEnabled = !Storage.preferences.autoSaveEnabled;
      Storage.preferences.autoSaveEnabled ? Storage.startAutoSave(Storage.preferences.autoSaveInterval) : Storage.stopAutoSave();
    }

    private static restartAutoSave(): void {
      Storage.stopAutoSave();
      Storage.startAutoSave(Storage.autoSaveIntervalId);
    }

    private static startAutoSave(interval: number): void {
      Storage.autoSaveIntervalId = window.setInterval(() => {Storage.saveAll()}, interval);
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