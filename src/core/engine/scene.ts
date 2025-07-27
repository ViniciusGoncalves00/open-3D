import { ObservableList } from "../../common/patterns/observer/observable-list";
import { Entity } from "../api/entity";

/**
* Class responsible for representing scene.
*/
export class Scene {
  public id: `${string}-${string}-${string}-${string}-${string}`;
  public name: string;

  public readonly entities: ObservableList<Entity> = new ObservableList();
  public readonly backup: ObservableList<Entity> = new ObservableList();

  public constructor(id: `${string}-${string}-${string}-${string}-${string}`, name: string, entities?: Entity[]) {
    this.id = id;
    this.name = name;
    entities?.forEach(entity => this.addEntity(entity));
  }

  public addEntity(entity: Entity): void {
    if(entity.parent.value !== null || this.entities.items.includes(entity)) return;
    this.entities.add(entity);
  }

  public removeEntity(entityId: string): void {
    const entity = this.entities.items.find(e => e.id === entityId);
    if (!entity) return;

    entity.destroy();
    this.entities.remove(entity);
  }

  public getEntities(): Entity[] {
    return [...this.entities.items];
  }

  public saveState(): void {
    this.backup.clear();
    for (const entity of this.entities.items) {
      this.backup.add(entity.clone());
    }
  }

  public restoreState(): void {
    for (const entity of [...this.entities.items]) {
      const inBackup = this.backup.items.some(b => b.id === entity.id);
      if (!inBackup) this.entities.remove(entity);
    }

    for (const clone of this.backup.items) {
      const existing = this.entities.items.find(e => e.id === clone.id);
      if (existing) {
        existing.restoreFrom(clone);
      } else {
        this.entities.add(clone);
      }
    }
  }

  public static fromJSON(data: any): Scene {
    const entities: Entity[] = [];
    for (const item of data["entities"]) {
      entities.push(Entity.fromJSON(item));
    }
    return new Scene(data["id"], data["name"], entities);
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      entities: this.entities.items.map(e => e.toJSON())
    };
  }
}
