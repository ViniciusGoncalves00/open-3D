import { Transform } from "../../assets/components/transform";
import { ObservableMap } from "../../common/patterns/observer/observable-map";
import { Entity } from "../api/entity";

/**
* Class responsible for representing scene.
*/
export class Scene {
  public id: `${string}-${string}-${string}-${string}-${string}`;
  public name: string;
  
  public readonly entities: ObservableMap<string, Entity> = new ObservableMap(new Map<string, Entity>());
  public readonly backup: ObservableMap<string, Entity> = new ObservableMap(new Map<string, Entity>());

  public constructor(id: `${string}-${string}-${string}-${string}-${string}`, name: string, entities?: Entity[]) {
    this.id = id;
    this.name = name;
    entities?.forEach(entity => this.addEntity(entity));
  }

  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if(!entity) return;
    
    entity.destroy();
    this.entities.delete(entityId);
  }

  public getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }    
  
  public saveState(): void {
    this.backup.clear();
    for (const [id, entity] of this.entities.entries()) {
      this.backup.set(id, entity.clone());
    }
  }
  
  public restoreState(): void {
    for (const [id, clone] of this.backup.entries()) {
      const currentEntity = this.entities.get(id);

      if (currentEntity) {
        currentEntity.restoreFrom(clone);
      }
      else {
        this.addEntity(clone);
      }
    }

    for (const id of this.entities.keys()) {
      if (!this.backup.has(id)) {
        this.removeEntity(id)
      }
    }
  }

  public fromJSON(data: any): Scene {
    const entities: Entity[] =  data["entities"].forEach((data: any) => Entity.fromJSON(data));

    entities.forEach(entity => {
      if(!entity.hasComponent(Transform)) return;
      
      const entityData = data["entities"].find((data: any) => data.id === entity.id);
      const componentsData = entityData["components"] as { type: string; data: any }[];
      const transformData = componentsData.find((component: { type: string; data: Transform }) => component.type === "Transform");
      if(!transformData || !transformData.data.parent) return;

      const parent = entities.find(entity => entity.id === transformData.data.parent?.id)
      if(!parent || !parent.hasComponent(Transform)) return;

      entity.getComponent(Transform).parent = parent;
    })

    return new Scene(data["id"], data["name"], entities);
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      entities: this.entities,
    }
  }
}