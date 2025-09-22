export interface Material {
    id: string;
    pipeline: GPURenderPipeline;
    bindGroup: GPUBindGroup;
}

class SolidColorMaterial implements Material {
    public readonly id: string;
    public readonly pipeline: GPURenderPipeline;
    public readonly bindGroup: GPUBindGroup;

    private colorBuffer: GPUBuffer;
    private colorData: Float32Array;

    public constructor(id: string, device: GPUDevice, pipeline: GPURenderPipeline, color: [number, number, number, number]) {
        this.id = id;
        this.pipeline = pipeline;
        this.colorData = new Float32Array(color);

        this.colorBuffer = device.createBuffer({
            size: this.colorData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });   

        device.queue.writeBuffer(this.colorBuffer, 0, this.colorData.buffer);    
        this.bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: this.colorBuffer } }],
        });
    }

    public setColor(device: GPUDevice, color: [number, number, number, number]) {
        this.colorData.set(color);
        device.queue.writeBuffer(this.colorBuffer, 0, this.colorData.buffer);
    }

}

class TextureMaterial implements Material {
    public readonly id: string;
    public readonly pipeline: GPURenderPipeline;
    public readonly bindGroup: GPUBindGroup;

    public constructor(id: string, device: GPUDevice, pipeline: GPURenderPipeline, textureView: GPUTextureView, sampler: GPUSampler) {
        this.id = id;
        this.pipeline = pipeline;
        
        this.bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: textureView },
            ],
        });
    }
}