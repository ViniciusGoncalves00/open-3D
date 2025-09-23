import { Mesh } from "../../assets/components/mesh";
import { Transform } from "../../assets/components/transform";
import { ObservableMap } from "../../common/observer/observable-map";
import { ConsoleLogger } from "../../ui/editor/sections/console/console-logger";
import { Entity } from "../api/entity";
import { Registry } from "./registry";

export class EntityManager {
    private static scene: Entity;

    public static readonly entities: ObservableMap<string, Entity> = new ObservableMap();

    private constructor(){};
    
    public static initialize(scene: Entity, entities: Entity[]): void {
        if(this.scene) {
            ConsoleLogger.error("The EntityManager has already been initialized.");
            return;
        }

        this.scene = scene;
        entities.forEach(entity => this.addEntity(entity));
    }

    public static createEntity() {
        if(!this.scene) {
            ConsoleLogger.error("Unable to create entity. The EntityManager has not yet been initialized.");
            return;
        }

        const entity = new Entity(crypto.randomUUID());
        entity.addComponent(new Transform(entity));
        
        const primitive = Registry.getPrimitive("sphere");
        if(primitive) {
            const mesh = new Mesh("sphere", [primitive]);
            entity.addComponent(mesh);
        }
        
        entity.parent = this.scene;
        this.entities.set(entity.id, entity);
    }

    public static addEntity(entity: Entity): void {
        this.entities.set(entity.id, entity);
    }

    public static removeEntity(id: string): void {
        if(!this.scene) {
            ConsoleLogger.error("Unable to remove entity. The EntityManager has not yet been initialized.");
            return;
        }

        if(this.scene.id === id) {
            ConsoleLogger.warning("Isn't possible to remove a scene like a regular entity.");
            return;
        }

        const entity = this.findEntityById(this.scene, id);
        if (entity && entity.parent.value) {
            entity.parent.value?.children.remove(entity);
        }
    }

    private static findEntityById(current: Entity, targetId: string): Entity | undefined {
        if (current.id === targetId) return current;  

        for (const child of current.children.items) {
            const found = this.findEntityById(child, targetId);
            if (found) return found;
        }

        return undefined;
    }
}