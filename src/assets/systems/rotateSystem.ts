import { ISystem, IUpdate } from "./interfaces/system";
import { Transform } from "../components/transform";
import { Rotate } from "../components/rotate";
import { Entity } from "../../core/api/entity";

export class RotateSystem implements ISystem, IUpdate {
    public update(entities: Entity[], deltaTime: number): void {
        const rotatingEntities = entities.filter(
            (entity) => entity.hasComponent(Transform) && entity.hasComponent(Rotate)
        );

        for (const entity of rotatingEntities) {
            const transform = entity.getComponent(Transform);
            const rotate = entity.getComponent(Rotate);

            if(transform && rotate) {
                transform.rotation.x.value += rotate.speed.value * rotate.axis.x.value * deltaTime;
                transform.rotation.y.value += rotate.speed.value * rotate.axis.y.value * deltaTime;
                transform.rotation.z.value += rotate.speed.value * rotate.axis.z.value * deltaTime;
            }
        }
    }
}