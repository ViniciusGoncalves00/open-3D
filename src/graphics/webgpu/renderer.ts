import { Light } from "../../assets/components/abstract/light";
import { Camera } from "../../assets/components/camera";
import { DirectionalLight } from "../../assets/components/directional-light";
import { Mesh } from "../../assets/components/mesh";
import { Transform } from "../../assets/components/transform";
import { EntityManager } from "../../core/engine/entity-manager";
import { Registry } from "../../core/engine/registry";
import { Attributes } from "../../core/gltf/attributes";
import { BindingGroups } from "../../core/gltf/binding-groups";
import { ConsoleLogger } from "../../ui/editor/sections/console/console-logger";
import { RendererManager } from "./renderer-manager";

export class Renderer {
    public rendererManager: RendererManager;

    public device!: GPUDevice;
    public context!: GPUCanvasContext;
    public canvas!: HTMLCanvasElement;
    public pipeline!: GPURenderPipeline;

    public camera!: Camera;
    public cameraTransform!: Transform;
    public lights: DirectionalLight[] = [];

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
        lights: DirectionalLight[]
    ) {
        this.rendererManager = rendererManager;

        this.device = device;
        this.canvas = canvas;
        this.pipeline = pipeline;
        this.context = canvas.getContext("webgpu") as GPUCanvasContext;

        this.camera = camera;
        this.cameraTransform = cameraTransform;
        this.lights = lights;

        const LIGHT_STRUCT_SIZE = 32;
        const MAX_LIGHTS = 16;
        const COUNT_SIZE = 4;
        const PADDING = 12;
        const bufferSize = Math.ceil((COUNT_SIZE + PADDING + LIGHT_STRUCT_SIZE * MAX_LIGHTS) / 256) * 256;

        this.lightData = new Float32Array(bufferSize / 4);
        this.lightBuffer = device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });


        this.lightBindGroup = this.device.createBindGroup({
            layout: pipeline.getBindGroupLayout(BindingGroups.light.group),
            entries: [{ binding: BindingGroups.light.binding, resource: { buffer: this.lightBuffer } }]
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
            layout: pipeline.getBindGroupLayout(BindingGroups.camera.group),
            entries: [
                { binding: BindingGroups.camera.binding, resource: { buffer: this.cameraBuffer } },
                { binding: BindingGroups.model.binding, resource: { buffer: this.modelBuffer } },
            ],
        });

        const format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({ device, format, alphaMode: "opaque" });
    }

    public render() {
        this.resize();
        this.updateLights();

        const encoder = this.device.createCommandEncoder();

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.msaaColorTexture.createView(),
                resolveTarget: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
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

        pass.setBindGroup(BindingGroups.camera.group, this.cameraModelBindGroup);
        pass.setBindGroup(BindingGroups.light.group, this.lightBindGroup);

        EntityManager.entities.forEach(entity => {
            const transform = entity.getComponent(Transform);
            if (!transform) return;

            const mesh = entity.getComponent(Mesh);
            if (!mesh) return;

            const modelMatrix = transform.worldMatrix.value;
            const modelMatrixBuffer = new Float32Array(modelMatrix);

            const entityModelBuffer = this.device.createBuffer({
                size: 16 * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            });
            this.device.queue.writeBuffer(entityModelBuffer, 0, modelMatrixBuffer.buffer);
        
            const entityBindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(BindingGroups.camera.group),
                entries: [
                    { binding: BindingGroups.camera.binding, resource: { buffer: this.cameraBuffer } },
                    { binding: BindingGroups.model.binding, resource: { buffer: entityModelBuffer } },
                ],
            });
        
            mesh.primitives.forEach(primitive => {
                const GPUPrimitive = Registry.getGPUPrimitive("sphere");
                if (!GPUPrimitive) return;
            
                const GPUMaterial = Registry.getGPUMaterial(primitive.material);
                if (!GPUMaterial) return;
            
                pass.setBindGroup(BindingGroups.camera.group, entityBindGroup);
                pass.setBindGroup(BindingGroups.light.group, this.lightBindGroup);
                pass.setBindGroup(BindingGroups.material.pbrUniform.group, GPUMaterial.getBindGroup());
            
                let slot = 0;
                for (const [, buffer] of GPUPrimitive.vertexBuffers.entries()) {
                    pass.setVertexBuffer(slot++, buffer);
                }
            
                if (GPUPrimitive.indexBuffer && GPUPrimitive.indexCount) {
                    pass.setIndexBuffer(GPUPrimitive.indexBuffer, "uint32");
                    pass.drawIndexed(GPUPrimitive.indexCount, 1, 0, 0, 0);
                } else {
                    pass.draw(GPUPrimitive.vertexCount, 1, 0, 0);
                }
            });
        });

        pass.end();
        this.device.queue.submit([encoder.finish()]);
    }

    private updateLights() {
        this.lightData.fill(0);

        let OFFSET = 4;
        for (const light of this.lights) {
            this.lightData[OFFSET++] = light.color.r.value;
            this.lightData[OFFSET++] = light.color.g.value;
            this.lightData[OFFSET++] = light.color.b.value;
            this.lightData[OFFSET++] = light.intensity.value;

            this.lightData[OFFSET++] = light.direction.x.value;
            this.lightData[OFFSET++] = light.direction.y.value;
            this.lightData[OFFSET++] = light.direction.z.value;
            this.lightData[OFFSET++] = 0;
        }

        const dataView = new DataView(this.lightData.buffer);
        dataView.setUint32(0, this.lights.length, true);

        this.device.queue.writeBuffer(this.lightBuffer, 0, dataView.buffer);
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
                size: { width: w, height: h },
                sampleCount: this.sampleCount,
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });

            this.msaaColorTexture = this.device.createTexture({
                size: { width: w, height: h },
                sampleCount: this.sampleCount,
                format,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
            });
        }
    }
}