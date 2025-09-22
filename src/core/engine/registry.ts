import { Mesh } from "../../assets/components/mesh";
import { ObservableMap } from "../../common/observer/observable-map";
import { ConsoleLogger } from "../../ui/editor/sections/console/console";
import { LogType } from "../api/enum/log-type";
import { GPUMaterial } from "../api/GPUMaterial";
import { Material } from "../api/material";
import { PrefabMesh } from "../api/prefab-mesh";

export class Registry {
    private static instance: Registry | null = null;

    public primitives: ObservableMap<string, Mesh> = new ObservableMap(
        new Map<string, Mesh>([
            ["quad", PrefabMesh.quad()],
            ["cube", PrefabMesh.cube()],
            ["sphere", PrefabMesh.sphere()],
        ])
    );
    public materials: ObservableMap<string, Material> = new ObservableMap();
    public GPUMaterials: ObservableMap<string, GPUMaterial> = new ObservableMap();

    private constructor(device: GPUDevice, pipeline: GPURenderPipeline) {
        const defaultMaterial = new Material("default");
        this.materials.set(defaultMaterial.uuid, defaultMaterial);
        
        const GPUDefaultMaterial = new GPUMaterial(device, pipeline, defaultMaterial);
        this.GPUMaterials.set(defaultMaterial.uuid, GPUDefaultMaterial);
    }

    public static getInstance(device: GPUDevice, pipeline: GPURenderPipeline): Registry {
        if(this.instance === null) {
            this.instance = new Registry(device, pipeline);
        }
        return this.instance;
    }

    public removeMaterial(id: string): void {
        const material = this.materials.get(id);
        if(!material) {
            ConsoleLogger.log(`Was not possible to remove material with id ${id}: material not founded.`, LogType.Warning);
            return;
        }

        material.dispose();

        this.materials.delete(id);
        this.GPUMaterials.delete(id);
    }
}