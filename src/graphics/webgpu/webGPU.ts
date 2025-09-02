import { ObservableMap } from "../../common/observer/observable-map";
import { GPUMesh, Options } from "./webGPUutils";


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

    public currentPipeline!: GPURenderPipeline;
    public worldPipeline!: GPURenderPipeline;
    public screenPipeline!: GPURenderPipeline;

    public depthTexture!: GPUTexture;

    public buffers: Set<GPUBuffer> = new Set();
    public textures: Set<GPUTexture> = new Set();

    public pipelineBindGroupLayout!: GPUBindGroupLayout;

    private options!: Options;

    constructor(context: GPUCanvasContext, options?: Options) {
        this.context = context;
        this.options = options ?? new Options();
    }

    public async init() {
        this.adapter = (await navigator.gpu.requestAdapter())!;
        this.device = await this.adapter.requestDevice();
        this.queue = this.device.queue;

        this.format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({ device: this.device, format: this.format, alphaMode: "opaque" });

        this.initPipeline();
        this.depthTexture = this.createDepthTexture(this.context.canvas.width, this.context.canvas.height);

        this.device.lost.then(info => console.warn("GPUDevice lost:", info));
    }

    private initPipeline(): void {
        const shaderCode = `
            struct Uniforms {
                model : mat4x4<f32>,
                viewProj : mat4x4<f32>
            };
            @group(0) @binding(0) var<uniform> uniforms : Uniforms;

            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(0) color : vec3<f32>
            };

            @vertex
            fn vs_main(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
                var output : VertexOutput;
                output.Position = uniforms.viewProj * uniforms.model * vec4<f32>(position, 1.0);
                output.color = color;
                return output;
            }

            @fragment
            fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
                return vec4<f32>(input.color, 1.0);
            }

            @vertex
            fn vs_screen(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
                var output : VertexOutput;
                output.Position = vec4<f32>(position, 1.0);
                output.color = color;
                return output;
            }

            @fragment
            fn fs_screen(input: VertexOutput) -> @location(0) vec4<f32> {
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

        this.worldPipeline = this.device.createRenderPipeline({
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
            primitive: { topology: "triangle-list", cullMode: "none" },
            depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" }
        });

        this.screenPipeline = this.device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: shaderModule,
                entryPoint: "vs_screen",
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
                entryPoint: "fs_screen",
                targets: [{ format: this.format }]
            },
            primitive: { topology: "triangle-list", cullMode: "none" }
        });

        this.currentPipeline = this.worldPipeline;
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

    public createMesh(vertices: Float32Array, indices: Uint32Array): GPUMesh {
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
        new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        indexBuffer.unmap();

        return { vertexBuffer, indexBuffer, indexCount: indices.length };
    }

    public render(uniformBindGroup: GPUBindGroup, meshes: GPUMesh[]) {
        const encoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();
        const bgColor = this.options.backgroundColor;
        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: bgColor[0], g: bgColor[1], b: bgColor[2], a: 1.0 },
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

        renderPass.setPipeline(this.currentPipeline);
        renderPass.setBindGroup(0, uniformBindGroup);

        for (const mesh of meshes) {
            renderPass.setVertexBuffer(0, mesh.vertexBuffer);
            renderPass.setIndexBuffer(mesh.indexBuffer, "uint32");
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
