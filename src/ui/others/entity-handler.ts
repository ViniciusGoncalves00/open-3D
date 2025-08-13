import { Transform } from "../../assets/components/transform";
import { Entity } from "../../core/api/entity";
import { ObservableField } from '../../common/observer/observable-field';
import { ObservableVector3 } from '../../common/observer/observable-vector3';
import { Mesh } from '../../assets/components/mesh';
import { ObservableNullableField } from '../../common/observer/observable-nullable-field';
import { PrefabMesh } from "../../core/api/prefab-mesh";

export class EntityHandler {
    private _scene: Entity;

    private _selectedEntity: ObservableNullableField<Entity> = new ObservableNullableField<Entity>(null);
    public get selectedEntity() : ObservableNullableField<Entity> { return this._selectedEntity; }
    public set selectedEntity(entity: ObservableNullableField<Entity>) { this._selectedEntity = entity; }

    public constructor(scene: Entity) {
        this._scene = scene;
    }
    
  public addEntity(): void {
    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new Transform(true, entity));

    const cube = PrefabMesh.sphere();
    const observableIndices: ObservableField<number>[] = []
    cube.indices.forEach(index => observableIndices.push(new ObservableField(index)));
    const observableVectors: ObservableVector3[] = [];
    for (let index = 0; index < cube.vertices.length; index += 3) {
      observableVectors.push(new ObservableVector3(
        cube.vertices[index + 0],
        cube.vertices[index + 1],
        cube.vertices[index + 2]
      ));
    }
    const meshComponent = new Mesh("Sphere", observableVectors, observableIndices);
    entity.addComponent(meshComponent);

    entity.parent = this._scene;
  }

  public removeEntity(id: string): void {
    const entity = this.findEntityById(this._scene, id);
    if (entity && entity.parent) {
      entity.parent.value?.children.remove(entity);
    }
  }

  private findEntityById(current: Entity, targetId: string): Entity | undefined {
    if (current.id === targetId) return current;

    for (const child of current.children.items) {
      const found = this.findEntityById(child, targetId);
      if (found) return found;
    }

    return undefined;
  }
}