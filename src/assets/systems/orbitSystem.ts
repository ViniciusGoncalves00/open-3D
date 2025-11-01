import { ISystem, IUpdate } from "./interfaces/system";
import { Transform } from "../components/transform";
import { Entity } from "../../core/api/entity";
import { Orbit } from "../components/orbit";
import { VectorUtils } from "@viniciusgoncalves/ts-utils";

export class OrbitSystem implements ISystem, IUpdate {
  public update(entities: Entity[], deltaTime: number): void {
    const orbitEntities = entities.filter(
      (entity) => entity.hasComponent(Transform) && entity.hasComponent(Orbit)
    );
  
    for (const entity of orbitEntities) {
      if(!entity.hasComponent(Transform)) continue;
      if(!entity.hasComponent(Orbit)) continue;

      const transform = entity.getComponent(Transform);
      const orbit = entity.getComponent(Orbit);

      if(orbit.enabled.value === false) continue;
  
      orbit.angle.value += orbit.speed.value * deltaTime;
      orbit.angle.value %= Math.PI * 2;

      const [x, y, z] = VectorUtils.rotateAround([1, 0, 0], orbit.axis.getValues(), orbit.angle.value);
      const [cx, cy, cz] = orbit.center.getValues();

      transform.position.x.value = x + cx;
      transform.position.y.value = y + cy;
      transform.position.z.value = z + cz;
    }
  }
}
  