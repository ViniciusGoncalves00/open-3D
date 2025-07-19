import { Transform } from "../../assets/components/transform";
import { Entity } from "../../core/api/entity";
import { ObservableField } from '../../common/patterns/observer/observable-field';
import { Vector3 } from '../../core/api/vector3';
import { Mesh } from '../../assets/components/mesh';
import { ObservableNullableField } from '../../common/patterns/observer/observable-nullable-field';
import { Scene } from "../../core/engine/scene";

export class EntityHandler {
    private _scene: Scene;

    private _selectedEntity: ObservableNullableField<Entity> = new ObservableNullableField<Entity>(null);
    public get selectedEntity() : ObservableNullableField<Entity> { return this._selectedEntity; }
    public set selectedEntity(entity: ObservableNullableField<Entity>) { this._selectedEntity = entity; }

    public constructor(scene: Scene) {
        this._scene = scene;
    }
    
  public addEntity(): void {
    const sphereVertices = generateSphereVertices(1, 4, 4);
    const vertices = float32ArrayToVector3List(sphereVertices);
    const indices = createSequentialIndices(vertices.length);

    const entity = new Entity(crypto.randomUUID());
    entity.addComponent(new Transform(entity));

    const meshComponent = new Mesh("Sphere", vertices, indices);
    entity.addComponent(meshComponent);

    this._scene.addEntity(entity);
  }

  public removeEntity(id: string): void {
    this._scene.removeEntity(id);
  }
}

function generateSphereVertices(radius = 1, widthSegments = 16, heightSegments = 12) {
  const vertices = [];

  for (let y = 0; y < heightSegments; y++) {
    const v0 = y / heightSegments;
    const v1 = (y + 1) / heightSegments;

    const phi0 = v0 * Math.PI;
    const phi1 = v1 * Math.PI;

    for (let x = 0; x < widthSegments; x++) {
      const u0 = x / widthSegments;
      const u1 = (x + 1) / widthSegments;

      const theta0 = u0 * Math.PI * 2;
      const theta1 = u1 * Math.PI * 2;

      const p0 = sphericalToCartesian(radius, theta0, phi0);
      const p1 = sphericalToCartesian(radius, theta1, phi0);
      const p2 = sphericalToCartesian(radius, theta1, phi1);
      const p3 = sphericalToCartesian(radius, theta0, phi1);

      vertices.push(...p0, ...p1, ...p2);
      vertices.push(...p2, ...p3, ...p0);
    }
  }

  return new Float32Array(vertices);
}

function sphericalToCartesian(radius: number, theta: number, phi: number) {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function createSequentialIndices(length: number): ObservableField<number>[] {
  const indices: ObservableField<number>[] = [];
  for (let i = 0; i < length; i++) {
    indices.push(new ObservableField(i));
  }
  return indices;
}

function float32ArrayToVector3List(array: Float32Array): Vector3[] {
  const result: Vector3[] = [];
  for (let i = 0; i < array.length; i += 3) {
    result.push(new Vector3(array[i], array[i + 1], array[i + 2]));
  }
  return result;
}
