import { Transform } from "../../../assets/components/transform";
import { Entity } from "../../../core/api/entity";
import { ObservableField } from '../../../common/observer/observable-field';
import { ObservableVector3 } from '../../../common/observer/observable-vector3';
import { Mesh } from '../../../assets/components/mesh';
import { ObservableNullableField } from '../../../common/observer/observable-nullable-field';
import { PrefabPrimitive } from "../../../core/api/prefab-mesh";
import { RendererManager } from "../../../graphics/webgpu/renderer-manager";
import { EntityManager } from "../../../core/engine/entity-manager";

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
    EntityManager.createEntity();
  }

  public removeEntity(id: string): void {
    EntityManager.removeEntity(id);
  }
}