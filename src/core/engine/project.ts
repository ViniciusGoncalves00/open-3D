import { ObservableNullableField } from "../../common/patterns/observer/observable-nullable-field";
import { Entity } from "../api/entity";
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

    public loadScene(data: any): Scene | undefined {
        return this.activeScene.value?.fromJSON(data);
    }
}