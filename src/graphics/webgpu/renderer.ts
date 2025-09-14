import { Light } from "../../assets/components/abstract/light";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";
import { ConsoleLogger } from "../../ui/editor/sections/console/console";
import { RendererManager } from "./renderer-manager";

export class Renderer {
    public rendererManager: RendererManager;

    public device!: GPUDevice;
    public context!: GPUCanvasContext;
    public canvas!: HTMLCanvasElement;
    public pipeline!: GPURenderPipeline;

    public camera!: Camera;
    public cameraTransform!: Transform;
    public lights: Light[] = [];

    public lightData!: Float32Array;
    public lightBuffer!: GPUBuffer;
    public lightBindGroup!: GPUBindGroup;

    public cameraBuffer!: GPUBuffer;
    public modelBuffer!: GPUBuffer;
    public cameraModelBindGroup!: GPUBindGroup;
    public depthTexture!: GPUTexture;
    public msaaColorTexture: GPUTexture;

    public sampleCount: number = 4;

    constructor(
        rendererManager: RendererManager,
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        pipeline: GPURenderPipeline,
        camera: Camera,
        cameraTransform: Transform,
        lights: Light[]
    ) {
        this.rendererManager = rendererManager;

        this.device = device;
        this.canvas = canvas;
        this.pipeline = pipeline;
        this.context = canvas.getContext("webgpu") as GPUCanvasContext;

        this.camera = camera;
        this.cameraTransform = cameraTransform;
        this.lights = lights;

        // Buffer de luz
        const MAX_LIGHTS = 16;
        const COMPONENTS_BY_LIGHT = 4;
        const COUNT = 1;
        const PADDING = 3;
        const length = COUNT + PADDING + MAX_LIGHTS * COMPONENTS_BY_LIGHT;
        this.lightData = new Float32Array(length);

        this.lightBuffer = this.device.createBuffer({
            size: this.lightData.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.lightBindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(1),
            entries: [{ binding: 0, resource: { buffer: this.lightBuffer } }]
        });

        this.msaaColorTexture = device.createTexture({
          size: [canvas.width, canvas.height],
          sampleCount: this.sampleCount,
          format: navigator.gpu.getPreferredCanvasFormat(),
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            sampleCount: this.sampleCount,
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        // Buffers de câmera e modelo
        this.cameraBuffer = device.createBuffer({
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.modelBuffer = device.createBuffer({
            size: 16 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        this.cameraModelBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraBuffer } },
                { binding: 1, resource: { buffer: this.modelBuffer } },
            ],
        });

        const format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({ device, format, alphaMode: "opaque" });
    }

    public render() {
        this.resize();
        this.updateLights();

        const encoder = this.device.createCommandEncoder();
        const view = this.context.getCurrentTexture().createView();

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.msaaColorTexture.createView(),
                resolveTarget: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
                loadOp: "clear",
                storeOp: "store"
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: "clear",
                depthStoreOp: "store",
            }
        };

        const pass = encoder.beginRenderPass(descriptor);
        pass.setPipeline(this.pipeline);

        this.device.queue.writeBuffer(this.lightBuffer, 0, this.lightData.buffer);

        const cameraMat = this.camera.viewProjection(this.cameraTransform);
        this.device.queue.writeBuffer(this.cameraBuffer, 0, cameraMat.buffer);

        pass.setBindGroup(0, this.cameraModelBindGroup);
        pass.setBindGroup(1, this.lightBindGroup);

        this.rendererManager.entities.forEach(entity => {
            const resources = this.rendererManager.entityResources.get(entity.id);
            if(!resources) {
                ConsoleLogger.log("An attempt was made to render an entity where the corresponding resources were not found. Check synchronization between entities and buffers.");
                return;
            }

            const transform = entity.getComponent(Transform);
            if (!transform) return;

            const modelMatrix = transform.worldMatrix.value;
            const modelBuffer = new Float32Array(modelMatrix);
            this.device.queue.writeBuffer(this.modelBuffer, 0, modelBuffer.buffer);

            pass.setVertexBuffer(0, resources.vertexBuffer);
            if (resources.indexBuffer) {
                pass.setIndexBuffer(resources.indexBuffer, "uint32");
                pass.drawIndexed(resources.indexCount!);
            } else {
                pass.draw(resources.vertexCount);
            }
        })

        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    private updateLights() {
        this.lightData[0] = this.lights.length;
        let offset = 4;
        for (const light of this.lights) {
            this.lightData[offset++] = light.color.r.value;
            this.lightData[offset++] = light.color.g.value;
            this.lightData[offset++] = light.color.b.value;
            this.lightData[offset++] = light.intensity.value;
        }
        while (offset < this.lightData.length) this.lightData[offset++] = 0;
    }

    private resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = Math.floor(this.canvas.clientWidth * dpr);
        const h = Math.floor(this.canvas.clientHeight * dpr);

        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;

            const format = navigator.gpu.getPreferredCanvasFormat();
            this.context.configure({
                device: this.device,
                format,
                alphaMode: "opaque"
            });

            this.depthTexture = this.device.createTexture({
                size: [w, h],
                sampleCount: this.sampleCount,
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });

            this.msaaColorTexture = this.device.createTexture({
                size: [w, h],
                sampleCount: this.sampleCount,
                format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
        }
    }
}