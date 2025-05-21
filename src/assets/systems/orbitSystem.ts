import { ISystem } from "./interfaces/system";
import { Transform } from "../components/transform";
import { IUpdate } from "./interfaces/update";
import { Entity } from "../../core/api/entity";
import { Vector3 } from "../../core/api/vector3";
import { Orbit } from "../components/orbit";

export class OrbitSystem implements ISystem, IUpdate {
    public update(entities: Entity[], deltaTime: number): void {
      const orbitEntities = entities.filter(
        (entity) => entity.hasComponent(Transform) && entity.hasComponent(Orbit)
      );
  
      for (const entity of orbitEntities) {
        const transform = entity.getComponent(Transform);
        const orbit = entity.getComponent(Orbit);
  
        if (transform && orbit && orbit.enabled) {
          orbit.angle.value += orbit.speed.value * deltaTime;
          orbit.angle.value %= Math.PI * 2;
  
          const initial = new Vector3(orbit.distance.value, 0, 0);
  
          const rotated = initial.rotateAround(orbit.axis.normalize(), orbit.angle.value);
          const position = orbit.center.add(rotated);
  
          transform.position.x.value = position.x.value;
          transform.position.y.value = position.y.value;
          transform.position.z.value = position.z.value;
        }
      }
    }
  }
  