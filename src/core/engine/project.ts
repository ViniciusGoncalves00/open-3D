import { ObservableNullableField } from "../../common/patterns/observer/observable-nullable-field";
import { Scene } from "./scene";

export class Project {
    public readonly id: `${string}-${string}-${string}-${string}-${string}`;
    public readonly name: string;
    public readonly activeScene: ObservableNullableField<Scene> = new ObservableNullableField();
    public readonly scenes: Scene[] = [];

    public constructor(id: `${string}-${string}-${string}-${string}-${string}`, name: string, scenes: Scene[]) {
        this.id = id;
        this.name = name;
        this.scenes = scenes;
    }

    public GetSceneByName(name: string): Scene | undefined {
        return this.scenes.find(scene => scene.name = name);
    }

    public GetSceneById(id: `${string}-${string}-${string}-${string}-${string}`): Scene | undefined {
        return this.scenes.find(scene => scene.id = id);
    }

    public SetActiveScene(scene: Scene): void {
        this.activeScene.value = scene;
    }

    public SetActiveSceneByIndex(index: number): void {
        if(index < 0 || index >= this.scenes.length) return;
        this.activeScene.value = this.scenes[index];
    }

    public static fromJSON(data: any): Project {
        const scenes: Scene[] = []
        data["scenes"].forEach((data: any) => scenes.push(Scene.fromJSON(data)));
        return new Project(data["id"], data["name"], scenes);
    }

    public toJSON(): Object {
        const scenes: any[] = []
        this.scenes.forEach(scene => scenes.push(scene.toJSON()));
        return {
            id : this.id,
            name : this.name,
            scenes : scenes,
        }
    }
}