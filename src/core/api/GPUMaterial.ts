import { BindingGroups } from "../gltf/binding-groups";
import { Material } from "../gltf/material";

export class GPUMaterial {
    private device: GPUDevice;
    private buffer: GPUBuffer;
    private bindGroup: GPUBindGroup;
    private uniformData: Float32Array;

    constructor(
        device: GPUDevice,
        pipeline: GPURenderPipeline,
        material: Material,
        textureView?: GPUTextureView,
        sampler?: GPUSampler
    ) {
        this.device = device;

        this.uniformData = new Float32Array([
            ...material.pbrMetallicRoughness.baseColorFactor, // vec4<f32>
            material.pbrMetallicRoughness.metallicFactor,     // f32
            material.pbrMetallicRoughness.roughnessFactor,    // f32
            0.0, 0.0                                          // padding
        ]);

        this.buffer = device.createBuffer({
            size: this.uniformData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(this.buffer, 0, this.uniformData.buffer);

        const entries: GPUBindGroupEntry[] = [
            { binding: BindingGroups.material.pbrUniform.binding, resource: { buffer: this.buffer } },
        ];

        if (textureView && sampler) {
            entries.push({ binding: BindingGroups.material.baseColorTexture.binding, resource: textureView });
            entries.push({ binding: BindingGroups.material.baseColorSampler.binding, resource: sampler });
        }

        this.bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(2),
            entries
        });
    }

    public update(material: Material) {
        this.uniformData.set([
            ...material.pbrMetallicRoughness.baseColorFactor,
            material.pbrMetallicRoughness.metallicFactor,
            material.pbrMetallicRoughness.roughnessFactor,
            0.0, 0.0
        ]);
        this.device.queue.writeBuffer(this.buffer, 0, this.uniformData.buffer);
    }

    public getBindGroup(): GPUBindGroup {
        return this.bindGroup;
    }

    public getBuffer(): GPUBuffer {
        return this.buffer;
    }
}
