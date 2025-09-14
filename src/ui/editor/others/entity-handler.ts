import { Transform } from "../../../assets/components/transform";
import { Entity } from "../../../core/api/entity";
import { ObservableField } from '../../../common/observer/observable-field';
import { ObservableVector3 } from '../../../common/observer/observable-vector3';
import { Mesh } from '../../../assets/components/mesh';
import { ObservableNullableField } from '../../../common/observer/observable-nullable-field';
import { PrefabMesh } from "../../../core/api/prefab-mesh";
import { RendererManager } from "../../../graphics/webgpu/renderer-manager";

export class EntityHandler {
    private _scene: Entity;
    private rendererManager: RendererManager;

    private _selectedEntity: ObservableNullableField<Entity> = new ObservableNullableField<Entity>(null);
    public get selectedEntity() : ObservableNullableField<Entity> { return this._selectedEntity; }
    public set selectedEntity(entity: ObservableNullableField<Entity>) { this._selectedEntity = entity; }

    public constructor(scene: Entity, rendererManager: RendererManager) {
        this._scene = scene;
        this.rendererManager = rendererManager;
    }
    
  public addEntity(): void {
    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new Transform(true, entity));

    const mesh = PrefabMesh.cube();
    entity.addComponent(mesh);

    entity.parent = this._scene;
    this.rendererManager.addEntity(entity);
  }

  public removeEntity(id: string): void {
    const entity = this.findEntityById(this._scene, id);
    if (entity && entity.parent) {
      entity.parent.value?.children.remove(entity);
      this.rendererManager.removeEntity(entity);
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