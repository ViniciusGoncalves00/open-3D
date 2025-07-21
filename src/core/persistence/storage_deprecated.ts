// import { Transform } from "../../assets/components/transform";
// import { Console } from "../../ui/elements/console/console";
// import { Entity } from "../api/entity";
// import { LogType } from "../api/enum/log-type";
// import { Engine } from "../engine/engine";

// export class Storage {
//   private readonly engine;
//   private readonly console;
//   private dbName = 'open3d-storage';
//   private dbVersion = 1;
//   private db!: IDBDatabase;
//   private autoSaveEnabled: boolean = true;
//   private autoSaveIntervalId: number | undefined;
//   private _autoSaveIntervalInSeconds: number = 60;
//   public get autoSaveIntervalInSeconds(): number { return this._autoSaveIntervalInSeconds};
//   public set autoSaveIntervalInSeconds(intervalInSeconds: number) {
//     this._autoSaveIntervalInSeconds =  intervalInSeconds
//     this.restartAutoSave();
//   };

//   public constructor(engine: Engine, console: Console) {
//     this.engine = engine;
//     this.console = console;
//   }

//   public async init(): Promise<void> {
//     this.db = await this.openDatabase();

//     await this.loadSettings();
//     const entities = await this.loadEntitiesWithHierarchy();

//     for (const entity of entities) {
//       this.engine.currentProject.addEntity(entity);
//     }

//     this.autoSaveEnabled ? this.startAutoSave(this._autoSaveIntervalInSeconds) : undefined;
//   }

//   private openDatabase(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.dbVersion);

//       request.onupgradeneeded = (event) => {
//         const db = request.result;
//         let neededCreateStore = false;
//         if (!db.objectStoreNames.contains('entities')) {
//           db.createObjectStore('entities', { keyPath: 'id' });
//           neededCreateStore = true;
//         }
//         if (!db.objectStoreNames.contains('assets')) {
//           db.createObjectStore('assets');
//           neededCreateStore = true;
//         }
//         if (!db.objectStoreNames.contains('settings')) {
//           db.createObjectStore('settings');
//           neededCreateStore = true;
//         }
//         if(neededCreateStore) {
//           this.console.log(LogType.Debug, `Creating missing stores in your database...`);
//         }
//       };

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         this.console.log(LogType.Error, `Oh no! Something went wrong during opening your local database`);
//         reject(request.error);
//       };
//     });
//   }

//   // ------------------ AUTOSAVE ------------------ 
  
//   public toggleAutoSave(): void {
//     this.autoSaveEnabled = !this.autoSaveEnabled;
//     this.autoSaveEnabled ? this.startAutoSave(this._autoSaveIntervalInSeconds) : this.stopAutoSave();
//   }

//   private restartAutoSave(): void {
//     this.stopAutoSave();
//     this.startAutoSave(this._autoSaveIntervalInSeconds);
//   }

//   private startAutoSave(interval: number): void {
//     this.autoSaveIntervalId = window.setInterval(() => {
//       this.saveAll();
//     }, interval * 1000);
//   }

//   private stopAutoSave(): void {
//     clearInterval(this.autoSaveIntervalId);
//   }

//   // ------------------ ENTITIES ------------------ 

//   public async saveEntity(entity: Entity): Promise<void> {
//     const data = entity.toJSON();
//     await this.runTransaction('entities', 'readwrite', (store) => {return store.put(data)}, `save entity (name: ${data.name}, id: ${data.id})`);
//   }

//   public async saveAllEntities(): Promise<void> {
//     const currentEntities = this.engine.currentProject.getEntities();
//     const currentIds = new Set(currentEntities.map(entity => entity.id));
    
//     for (const entity of currentEntities) {
//       await this.saveEntity(entity);
//     }

//     const savedEntities = await this.listEntities();
//     const savedIds = savedEntities.map(e => e.id);

//     for (const savedId of savedIds) {
//       if (!currentIds.has(savedId)) {
//         await this.deleteEntity(savedId);
//       }
//     }
//   }

//   public async getEntity(id: string): Promise<any | undefined> {
//     return await this.runTransaction('entities', 'readonly', (store) => {return store.get(id)}, `get entity (id: ${id})`);
//   }

//   public async listEntities(): Promise<any[]> {
//     return await this.runTransaction('entities', 'readonly', (store) => {return store.getAll()}, `list entities`);
//   }

//   public async deleteEntity(id: string): Promise<void> {
//     await this.runTransaction('entities', 'readwrite', (store) => {return store.delete(id)}, `delete entity (id: ${id})`);
//   }

//   public async loadEntitiesWithHierarchy(): Promise<Entity[]> {
//     const entitiesData = await this.listEntities();
//     const entities: Entity[] = entitiesData.map(data => Entity.fromJSON(data));

//     const entityMap = new Map<string, Entity>();
//     for (const entity of entities) {
//       entityMap.set(entity.id, entity);
//     }
//     entities.forEach(entity => {
//       const transform = entity.getComponent(Transform);
//       const entityData = entitiesData.find((value: any) => value.id === entity.id);
//       const componentsData = entityData["components"] as { type: string; data: any }[];
    
//       const transformData = componentsData.find((component: { type: string; data: any }) => component.type === "Transform");
    
//       transform.parent = entityMap.get(transformData?.data.parentId) as Entity;
//     });


//     return entities;
//   }

//   // ------------------ ASSETS ------------------

//   public async saveAsset(id: string, data: Blob | ArrayBuffer): Promise<void> {
//     await this.runTransaction('assets', 'readwrite', (store) => {
//       return store.put(data, id);
//     }, "save asset");
//   }

//   public async getAsset(id: string): Promise<Blob | ArrayBuffer | undefined> {
//     return await this.runTransaction('assets', 'readonly', (store) => {
//       return store.get(id);
//     }, "get asset");
//   }

//   // ------------------ SETTINGS ------------------

//   public async saveSetting(key: string, value: any): Promise<void> {
//     await this.runTransaction('settings', 'readwrite', (store) => {
//       return store.put(value, key);
//     }, "save setting");
//   }

//   public async loadSettings(): Promise<void> {
//     const savedAutoSaveEnabled = await this.getSetting(`autoSaveEnabled`);
//     const savedAutoSaveInterval = await this.getSetting(`autoSaveIntervalInSeconds`);
    
//     this.autoSaveEnabled = savedAutoSaveEnabled !== undefined ? savedAutoSaveEnabled : true;
//     this._autoSaveIntervalInSeconds = savedAutoSaveInterval !== undefined ? savedAutoSaveInterval : 60;
//   }

//   public async saveAllSettings(): Promise<void> {
//     await this.saveSetting(`autoSaveEnabled`, this.autoSaveEnabled);
//     await this.saveSetting(`autoSaveIntervalInSeconds`, this._autoSaveIntervalInSeconds);
//   }

//   public async getSetting(key: string): Promise<any | undefined> {
//     return await this.runTransaction('settings', 'readonly', (store) => {
//       return store.get(key);
//     }, "get setting");
//   }

//   // ------------------ GLOBAL ------------------

//   public async saveAll(): Promise<void> {
//     this.console.log(LogType.Debug, "Saving...")

//     this.saveAllEntities();
//     this.saveAllSettings();
//   }

//   public async clearAll(): Promise<void> {
//     await this.runTransaction('entities', 'readwrite', (store) => store.clear(), "clear all");
//     await this.runTransaction('assets', 'readwrite', (store) => store.clear(), "clear all");
//     await this.runTransaction('settings', 'readwrite', (store) => store.clear(), "clear all");
//   }

//   // ------------------ UTIL ------------------

//   private runTransaction<T>(
//     storeName: string,
//     mode: IDBTransactionMode,
//     operation: (store: IDBObjectStore) => IDBRequest<T>,
//     action?: string
//   ): Promise<T> {
//     return new Promise<T>((resolve, reject) => {
//       const transaction = this.db.transaction(storeName, mode);
//       const store = transaction.objectStore(storeName);
//       const request = operation(store);

//       request.onsuccess = () => {
//         resolve(request.result);
//       };

//       request.onerror = () => {
//         this.console.log(LogType.Error, `Oh no! Something went wrong during the ${action} operation`);
//         reject(request.error);
//         };
//     });
//   }
// }
