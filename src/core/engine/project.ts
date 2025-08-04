import { ObservableField } from "../../common/observer/observable-field";
import { ObservableList } from "../../common/observer/observable-list";
import { Entity } from "../api/entity";

export class Project {
    public readonly id: `${string}-${string}-${string}-${string}-${string}`;
    public readonly name: string;
    public readonly activeScene: ObservableField<Entity>
    public readonly scenes: ObservableList<Entity>;

    public constructor(id: `${string}-${string}-${string}-${string}-${string}`, name: string, scenes?: Entity[], activeSceneID?: string) {
        this.id = id;
        this.name = name;

        if(scenes) {
            for (const scene of scenes) {
                if(scene.parent.value !== null) {
                    throw new Error("The entity representing the scene cannot have a parent.");
                }
            }
        
            this.scenes = new ObservableList(scenes);

            if(activeSceneID) {
                const scene = scenes.find(scene => scene.id === activeSceneID);
                if(!scene) throw new Error("The scene with the corresponding ID was not found in the list.");
                this.activeScene = new ObservableField(scene);
            } 
            else {
                this.activeScene = new ObservableField(this.scenes.items[0]);
            } 
        }
        else {
            this.scenes = new ObservableList();
            const scene = this.CreateScene();
            this.activeScene = new ObservableField(scene);
        }
    }

    public GetSceneByName(name: string): Entity | undefined {
        const scene = this.scenes.items.find(scene => scene.name.value === name);
        if(!scene) {
            console.log("The scene with this name was not found.");
            return;
        }
        return scene;
    }

    public GetSceneById(id: `${string}-${string}-${string}-${string}-${string}`): Entity | undefined {
        const scene = this.scenes.items.find(scene => scene.id === id);
        if(!scene) {
            console.log("The scene with this ID was not found.");
            return;
        }
        return scene;
    }

    public CreateScene(name?: string): Entity {
        if (!name) {
            const names = this.scenes.items.map(scene => scene.name.value);
            let index = 1;
            do {
                name = `scene_${index++}`;
            } while (names.includes(name));
        }

        const scene = new Entity(crypto.randomUUID());
        scene.name.value = name;

        this.scenes.add(scene);
        return scene;
    }

    public DestroySceneById(id: string): void {
        const index = this.scenes.items.findIndex(scene => scene.id === id)
        if(index === -1) {
            console.log("The scene with this ID was not found.");
            return;
        }
        this.scenes.removeAt(index);
    }

    public SetActiveScene(scene: Entity): void {
        if(scene.parent !== null) {
            console.log("The entity representing the scene cannot have a parent");
            return;
        }
        this.activeScene.value = scene;
    }

    public SetActiveSceneByIndex(index: number): void {
        if(index < 0 || index >= this.scenes.items.length) {
            console.log("There is no scene in this index")
            return;
        }
        this.activeScene.value = this.scenes.items[index];
    }

    public SetActiveSceneById(id: string): void {
        const scene = this.scenes.items.find(scene => scene.id === id);
        if(!scene) {
            console.log("There is no scene in project with this ID")
            return;
        }
        this.activeScene.value = scene;
    }

    public static fromJSON(data: any): Project {
        const scenes: Entity[] = []
        data["scenes"].forEach((data: any) => scenes.push(Entity.fromJSON(data)));
        return new Project(data["id"], data["name"], scenes, data["activeSceneID"]);
    }

    public toJSON(): Object {
        const scenes: any[] = []
        this.scenes.items.forEach(scene => scenes.push(scene.toJSON()));
        return {
            id : this.id,
            name : this.name,
            scenes : scenes,
            activeSceneID : this.activeScene.value.id,
        }
    }
}