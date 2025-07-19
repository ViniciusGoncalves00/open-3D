import { ObservableNullableField } from "../../common/patterns/observer/observable-nullable-field";
import { Scene } from "./scene";

export class Project {
    public readonly id: string;
    public readonly name: string;
    public readonly activeScene: ObservableNullableField<Scene> = new ObservableNullableField();
    public readonly scenes: Map<string, Scene> = new Map<string, Scene>();

    public constructor(id: string, name: string, scenes: Scene[]) {
        this.id = id;
        this.name = name;
        scenes.forEach(scene => this.scenes.set(scene.id, scene));
    }

    public SetActiveScene(id: string): void {
        const scene = this.scenes.get(id);
        if(!scene) return;

        this.activeScene.value = scene;
    }
}