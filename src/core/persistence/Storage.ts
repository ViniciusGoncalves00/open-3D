import { Transform } from "../../assets/components/transform";
import { Console } from "../../ui/elements/console/console";
import { Entity } from "../api/entity";
import { LogType } from "../api/enum/log-type";
import { Engine } from "../engine/engine";

export class Storage {
  private readonly engine;
  private readonly console;
  private dbName = 'open3d-storage';
  private dbVersion = 1;
  private db!: IDBDatabase;
  private saveIntervalId: number | undefined;
  public saveTimeInSeconds: number = 10;

  public constructor(engine: Engine, console: Console) {
    this.engine = engine;
    this.console = console;
  }

  public async init(): Promise<void> {
    this.db = await this.openDatabase();

    const entities = await this.loadEntitiesWithHierarchy();

    for (const entity of entities) {
      this.engine.entityManager.addEntity(entity);
    }

    this.console.log(LogType.Log, `${entities.length} entidades carregadas.`);

    this.startAutoSave();
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains('entities')) {
          db.createObjectStore('entities', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
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

  private startAutoSave() {
    this.saveIntervalId = window.setInterval(() => {
      this.saveAll();
    }, this.saveTimeInSeconds * 1000);
  }

  public stopAutoSave() {
    if (this.saveIntervalId !== undefined) {
      clearInterval(this.saveIntervalId);
    }
  }

  // ------------------ ENTITIES ------------------ 

  public async saveEntity(entity: Entity): Promise<void> {
    const data = entity.toJSON();
    await this.runTransaction('entities', 'readwrite', (store) => {return store.put(data)}, `save entity (name: ${data.name}, id: ${data.id})`);
  }

  public async getEntity(id: string): Promise<any | undefined> {
    return await this.runTransaction('entities', 'readonly', (store) => {return store.get(id)}, `get entity (id: ${id})`);
  }

  public async listEntities(): Promise<any[]> {
    return await this.runTransaction('entities', 'readonly', (store) => {return store.getAll()}, `list entities`);
  }

  public async deleteEntity(id: string): Promise<void> {
    await this.runTransaction('entities', 'readwrite', (store) => {return store.delete(id)}, `delete entity (id: ${id})`);
  }

  public async loadEntitiesWithHierarchy(): Promise<Entity[]> {
    const entitiesData = await this.listEntities();

    const entities: Entity[] = entitiesData.map(data => Entity.fromJSON(data));

    const entityMap = new Map<string, Entity>();
    for (const e of entities) {
      entityMap.set(e.id, e);
    }

    for (const entity of entities) {
      const transform = entity.getComponent(Transform);
      if (!transform) continue;

      const parentId = transform.parent?.id;
      if (parentId) {
        const parentEntity = entityMap.get(parentId);
        if (parentEntity) {
          transform.parent = parentEntity;
        } else {
          this.console.log(LogType.Warning, `Parent entity ${parentId} not found for entity ${entity.id}`);
        }
      }
    }

    return entities;
  }

  // ------------------ ASSETS ------------------

  public async saveAsset(id: string, data: Blob | ArrayBuffer): Promise<void> {
    await this.runTransaction('assets', 'readwrite', (store) => {
      return store.put(data, id);
    }, "save asset");
  }

  public async getAsset(id: string): Promise<Blob | ArrayBuffer | undefined> {
    return await this.runTransaction('assets', 'readonly', (store) => {
      return store.get(id);
    }, "get asset");
  }

  // ------------------ SETTINGS ------------------

  public async saveSetting(key: string, value: any): Promise<void> {
    await this.runTransaction('settings', 'readwrite', (store) => {
      return store.put(value, key);
    }, "save setting");
  }

  public async getSetting(key: string): Promise<any | undefined> {
    return await this.runTransaction('settings', 'readonly', (store) => {
      return store.get(key);
    }, "get setting");
  }

  // ------------------ GLOBAL ------------------

  public async saveAll(): Promise<void> {
    this.console.log(LogType.Log, "Auto-saving...")

    const currentEntities = this.engine.entityManager.getEntities();
    const currentIds = new Set(currentEntities.map(entity => entity.id));
    
    for (const entity of currentEntities) {
      console.log(entity)
      await this.saveEntity(entity);
    }

    const savedEntities = await this.listEntities();
    const savedIds = savedEntities.map(e => e.id);

    for (const savedId of savedIds) {
      if (!currentIds.has(savedId)) {
        await this.deleteEntity(savedId);
        this.console.log(LogType.Log, `Removed entity from storage: ${savedId}`);
      }
    }
  }

  public async clearAll(): Promise<void> {
    await this.runTransaction('entities', 'readwrite', (store) => store.clear(), "clear all");
    await this.runTransaction('assets', 'readwrite', (store) => store.clear(), "clear all");
    await this.runTransaction('settings', 'readwrite', (store) => store.clear(), "clear all");
  }

  // ------------------ UTIL ------------------

  private runTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
    action?: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => {
        this.console.log(LogType.Log, `Successfully completed ${action} operation`);
        resolve(request.result);
      };

      request.onerror = () => {
        this.console.log(LogType.Error, `Oh no! Something went wrong during the ${action} operation`);
        reject(request.error);
        };
    });
  }
}
