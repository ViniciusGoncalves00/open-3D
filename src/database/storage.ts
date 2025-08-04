import { Console } from "../ui/windows/console/console";
import { Engine } from "../core/engine/engine";
import { Project } from "../core/engine/project";
import { Metadata } from "./metadata";
import { Preferences } from "./preferences";

export class Storage {
  public readonly dbName = 'open3d-storage';
  public readonly dbVersion = 1;
  public db!: IDBDatabase | null;
  public autoSaveIntervalId: number = 0;
  public metadata: Map<string, Metadata> = new Map();

  public preferences!: Preferences;

  private readonly hour: number = 3600000;
  private readonly second: number = 1000;
  public engine!: Engine | undefined;
  public console!: Console | undefined;
    
  public constructor(engine?: Engine, console?: Console) {
    this.engine = engine;
    this.console = console;
  }

  public async init(): Promise<void> {
    await this.openDB();
    await this.loadPreferences();
    await this.loadMetadata();
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
      const project = this.engine!.currentProject.value;
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
      const timestamp = Date.now();
    
      const project = new Project(id, name ?? "project");
      const metadata = new Metadata(id, project.name, timestamp, timestamp, this.dbVersion);
      
      const data = {
        metadata: metadata.toJSON(),
        data: project.toJSON(),
      }
    
      await this.runTransaction('projects', 'readwrite', (store) => store.put(data, id));
      this.metadata.set(id, metadata);
    
      return project;
    }

    public async saveProject(project: Project): Promise<void> {
      const id = project.id;
      const record = await this.runTransaction('projects', 'readonly', (store) => store.get(id));
      if (!record) return;

      const metadata = Metadata.fromJSON(record.metadata);
      metadata.updatedAt = Date.now();

      const updatedRecord = {
        metadata: metadata.toJSON(),
        data: project.toJSON(),
      };

      await this.runTransaction('projects', 'readwrite', (store) => store.delete(id));
      await this.runTransaction('projects', 'readwrite', (store) => store.put(updatedRecord, id));
    
      this.metadata.set(id, metadata);
    }

    public async updateMetadata(id: string, name?: string, updatedAt?: number): Promise<void> {
      const record = await this.runTransaction('projects', 'readonly', (store) => store.get(id), '');
      if (!record) return;

      const metadata = Metadata.fromJSON(record.metadata);
      if (name) metadata.name = name;
      if (updatedAt) metadata.updatedAt = updatedAt;

      const updatedRecord = {
        metadata: metadata.toJSON(),
        data: record.data,
      };
    
      await this.runTransaction('projects', 'readwrite', (store) => store.put(updatedRecord, id));
    
      this.metadata.set(id, metadata);
    }

    private async loadMetadata(): Promise<void> {
      const records = await this.runTransaction('projects', 'readonly', (store) => store.getAll(), '');
      this.metadata.clear();

      records.forEach(record => {
        if (record.metadata) {
          const metadata = Metadata.fromJSON(record.metadata);
          this.metadata.set(metadata.id, metadata);
        }
      });
    }

    public async loadProjectById(id: string): Promise<Project | null> {
      const entry = await this.runTransaction('projects', 'readonly', (store) => store.get(id), '');
      
      if (!entry || !entry.data) {
        return null;
      }
      
      return Project.fromJSON(entry.data);
    }

    public async deleteProjectById(id: string): Promise<void> {
      await this.runTransaction('projects', 'readwrite', (store) => store.delete(id));
      this.metadata.delete(id);
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