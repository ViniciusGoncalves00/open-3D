import { ObservableMap } from "../../common/observer/observable-map";
import { ConsoleLogger } from "../../ui/editor/sections/console/console-logger";
import { GPUMaterial } from "../api/GPUMaterial";
import { GPUPrimitive } from "../api/GPUPrimitive";
import { Material } from "../gltf/material";
import { PrefabPrimitive } from "../api/prefab-mesh";
import { Accessor } from "../gltf/accessor";
import { Buffer } from "../gltf/buffer";
import { BufferView } from "../gltf/buffer-view";
import { Primitive } from "../gltf/primitive";

export class Registry {
    private static device: GPUDevice;

    private static buffers: Buffer[];
    private static bufferViews: BufferView[];
    private static accessors: Accessor[];

    private static primitives: ObservableMap<string, Primitive> = new ObservableMap();
    private static materials: ObservableMap<string, Material> = new ObservableMap();
    private static GPUMaterials: ObservableMap<string, GPUMaterial> = new ObservableMap();
    private static GPUPrimitives: ObservableMap<string, GPUPrimitive> = new ObservableMap();

    private constructor(){};

    public static initialize(device: GPUDevice, pipeline: GPURenderPipeline): void {
        if(this.device) {
            ConsoleLogger.error("The registry has already been initialized.");
            return;
        }

        this.device = device;

        this.addPrimitive("quad", PrefabPrimitive.quad());
        this.addPrimitive("cube", PrefabPrimitive.cube());
        this.addPrimitive("sphere", PrefabPrimitive.sphere());

        this.addMaterial(new Material("default"), pipeline);
    }

    public static addMaterial(material: Material, pipeline: GPURenderPipeline): void {
        if(!this.device) {
            ConsoleLogger.error("Unable to add material. The registry has not yet been initialized.");
            return;
        }

        this.materials.set(material.uuid, material);
        
        const gpuMaterial = new GPUMaterial(this.device, pipeline, material);
        this.GPUMaterials.set(material.uuid, gpuMaterial);
    }

    public static removeMaterial(id: string): void {
        if(!this.device) {
            ConsoleLogger.error("Unable to remove material. The registry has not yet been initialized.");
            return;
        }

        const material = this.materials.get(id);
        if(!material) {
            ConsoleLogger.warning(`Was not possible to remove material with id ${id}: material not found.`);
            return;
        }

        this.materials.delete(id);
        this.GPUMaterials.delete(id);
    }

    public static getMaterial(id: string): Material | null {
        if(!this.device) {
            ConsoleLogger.error("Unable to get material. The registry has not yet been initialized.");
            return null;
        }

        const material = this.materials.get(id);
        if(!material) {
            ConsoleLogger.warning(`Was not possible to get material with id ${id}: material not found.`);
            return null;
        }

        return material;
    }

    public static getGPUMaterial(id: string): GPUMaterial | null {
        if(!this.device) {
            ConsoleLogger.error("Unable to get gpu material. The registry has not yet been initialized.");
            return null;
        }

        const material = this.GPUMaterials.get(id);
        if(!material) {
            ConsoleLogger.warning(`Was not possible to get gpu material with id ${id}: gpu material not found.`);
            return null;
        }

        return material;
    }

    public static addPrimitive(id: string, primitive: Primitive): void {
        if(!this.device) {
            ConsoleLogger.error("Unable to add primitive. The registry has not yet been initialized.");
            return;
        }

        this.primitives.set(id, primitive);
        
        const gpuPrimitive = new GPUPrimitive(this.device, primitive);
        this.GPUPrimitives.set(id, gpuPrimitive);
    }

    public static removePrimitive(id: string): void {
        if(!this.device) {
            ConsoleLogger.error("Unable to remove primitive. The registry has not yet been initialized.");
            return;
        }

        const primitive = this.primitives.get(id);
        if(!primitive) {
            ConsoleLogger.warning(`Was not possible to remove primitive with id ${id}: primitive not found.`);
            return;
        }

        this.primitives.delete(id);
        this.GPUPrimitives.delete(id);
    }

    public static getPrimitive(id: string): Primitive | null {
        if(!this.device) {
            ConsoleLogger.error("Unable to get primitive. The registry has not yet been initialized.");
            return null;
        }

        const primitive = this.primitives.get(id);
        if(!primitive) {
            ConsoleLogger.warning(`Was not possible to get primitive with id ${id}: primitive not found.`);
            return null;
        }

        return primitive;
    }

    public static getGPUPrimitive(id: string): GPUPrimitive | null {
        if(!this.device) {
            ConsoleLogger.error("Unable to get gpu primitive. The registry has not yet been initialized.");
            return null;
        }

        const primitive = this.GPUPrimitives.get(id);
        if(!primitive) {
            ConsoleLogger.warning(`Was not possible to get gpu primitive with id ${id}: gpu primitive not found.`);
            return null;
        }

        return primitive;
    }
}