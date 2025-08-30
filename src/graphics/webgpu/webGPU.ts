// WebGPUAdapter.ts
import { ObservableMap } from "../../common/observer/observable-map";

export interface GPUMesh {
    vertexBuffer: GPUBuffer;
    indexBuffer: GPUBuffer;
    indexCount: number;
}

export class WebGPU {
    private readonly canvas: ObservableMap<number, GPUCanvasContext> = new ObservableMap();
    private deviceManager!: DeviceManager;

    public async init(canvas: HTMLCanvasElement): Promise<void> {
        if (!navigator.gpu) throw new Error("WebGPU not supported.");

        const context = canvas.getContext("webgpu") as GPUCanvasContext;
        this.canvas.set(0, context);

        this.deviceManager = new DeviceManager(context);

        await this.deviceManager.init();
    }

    public getManager(): DeviceManager {
        return this.deviceManager;
    }
}

export class DeviceManager {
    public adapter!: GPUAdapter;
    public device!: GPUDevice;
    public queue!: GPUQueue;
    public context: GPUCanvasContext;
    public format!: GPUTextureFormat;

    public pipeline!: GPURenderPipeline;
    public depthTexture!: GPUTexture;

    public buffers: Set<GPUBuffer> = new Set();
    public textures: Set<GPUTexture> = new Set();

    public pipelineBindGroupLayout!: GPUBindGroupLayout;

    constructor(context: GPUCanvasContext) {
        this.context = context;
    }

    public async init() {
        this.adapter = (await navigator.gpu.requestAdapter())!;
        this.device = await this.adapter.requestDevice();
        this.queue = this.device.queue;

        this.format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({ device: this.device, format: this.format, alphaMode: "opaque" });

        this.pipeline = this.initPipeline();
        this.depthTexture = this.createDepthTexture(this.context.canvas.width, this.context.canvas.height);

        this.device.lost.then(info => console.warn("GPUDevice lost:", info));
    }

    // =========================
    // Pipeline e Shaders
    // =========================
    private initPipeline(): GPURenderPipeline {
        const shaderCode = `
            struct Uniforms {
                viewProj : mat4x4<f32>
            };
            @group(0) @binding(0) var<uniform> uniforms : Uniforms;

            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(0) color : vec3<f32>
            };

            @vertex
            fn vs_main(
                @location(0) position : vec3<f32>,
                @location(1) color : vec3<f32>
            ) -> VertexOutput {
                var output : VertexOutput;
                output.Position = uniforms.viewProj * vec4<f32>(position, 1.0);
                output.color = color;
                return output;
            }

            @fragment
            fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
                return vec4<f32>(input.color, 1.0);
            }
        `;

        const shaderModule = this.device.createShaderModule({ code: shaderCode });

        this.pipelineBindGroupLayout = this.device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: { type: "uniform" }
            }]
        });

        const pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.pipelineBindGroupLayout] }),
            vertex: {
                module: shaderModule,
                entryPoint: "vs_main",
                buffers: [{
                    arrayStride: 6 * 4,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x3" },
                        { shaderLocation: 1, offset: 12, format: "float32x3" }
                    ]
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fs_main",
                targets: [{ format: this.format }]
            },
            primitive: { topology: "triangle-list", cullMode: "back" },
            depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" }
        });

        return pipeline;
    }

    public createBuffer(desc: GPUBufferDescriptor): GPUBuffer {
        const buffer = this.device.createBuffer(desc);
        this.buffers.add(buffer);
        return buffer;
    }

    public createUniformBuffer(data: Float32Array): GPUBuffer {
        const buffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        this.buffers.add(buffer);
        return buffer;
    }

    public createBindGroup(layout: GPUBindGroupLayout, buffer: GPUBuffer): GPUBindGroup {
        return this.device.createBindGroup({
            layout,
            entries: [{ binding: 0, resource: { buffer } }]
        });
    }

    public createTexture2D(width: number, height: number, format: GPUTextureFormat): GPUTexture {
        return this.device.createTexture({
            size: [width, height],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
    }

    public createDepthTexture(width: number, height: number): GPUTexture {
        const texture = this.device.createTexture({
            size: [width, height],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.textures.add(texture);
        return texture;
    }

    public createMesh(vertices: Float32Array, indices: Uint16Array): GPUMesh {
        const vertexBuffer = this.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        vertexBuffer.unmap();

        const indexBuffer = this.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Uint16Array(indexBuffer.getMappedRange()).set(indices);
        indexBuffer.unmap();

        return { vertexBuffer, indexBuffer, indexCount: indices.length };
    }

    public render(uniformBindGroup: GPUBindGroup, meshes: GPUMesh[]) {
        const encoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.2, g: 0.3, b: 0.3, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store"
            }
        });

        renderPass.setPipeline(this.pipeline);
        renderPass.setBindGroup(0, uniformBindGroup);

        for (const mesh of meshes) {
            renderPass.setVertexBuffer(0, mesh.vertexBuffer);
            renderPass.setIndexBuffer(mesh.indexBuffer, "uint16");
            renderPass.drawIndexed(mesh.indexCount);
        }

        renderPass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    public resize(width: number, height: number) {
        this.depthTexture.destroy();
        this.depthTexture = this.device.createTexture({
            size: [width, height],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }

    public destroyAll() {
        this.buffers.forEach(buffer => buffer.destroy());
        this.buffers.clear();
        this.textures.forEach(texture => texture.destroy());
        this.textures.clear();
        this.depthTexture?.destroy();
    }

    public stats() {
        return {
            buffers: this.buffers.size,
            textures: this.textures.size
        };
    }
}
