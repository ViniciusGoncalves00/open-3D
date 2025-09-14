import { Light } from "../../assets/components/abstract/light";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";
import { Entity } from "../../core/api/entity";

export class TestModel {
    public vertexData: Float32Array;
    public vertexBuffer!: GPUBuffer;
    public transform: Transform;

    constructor(transform?: Transform) {
        this.transform = transform ?? new Transform(true, new Entity("0-0-0-0-0"))
        // Um triângulo simples no plano XY
        this.vertexData = new Float32Array([
                // Face frontal (z = 0.5)
    -0.5, -0.5,  0.5, 1, 0, 0, // vermelho
     0.5, -0.5,  0.5, 1, 0, 0,
     0.5,  0.5,  0.5, 1, 0, 0,
    -0.5, -0.5,  0.5, 1, 0, 0,
     0.5,  0.5,  0.5, 1, 0, 0,
    -0.5,  0.5,  0.5, 1, 0, 0,

    // Face traseira (z = -0.5)
    -0.5, -0.5, -0.5, 0, 1, 0, // verde
     0.5,  0.5, -0.5, 0, 1, 0,
     0.5, -0.5, -0.5, 0, 1, 0,
    -0.5, -0.5, -0.5, 0, 1, 0,
    -0.5,  0.5, -0.5, 0, 1, 0,
     0.5,  0.5, -0.5, 0, 1, 0,

    // Face esquerda (x = -0.5)
    -0.5, -0.5, -0.5, 0, 0, 1, // azul
    -0.5, -0.5,  0.5, 0, 0, 1,
    -0.5,  0.5,  0.5, 0, 0, 1,
    -0.5, -0.5, -0.5, 0, 0, 1,
    -0.5,  0.5,  0.5, 0, 0, 1,
    -0.5,  0.5, -0.5, 0, 0, 1,

    // Face direita (x = 0.5)
     0.5, -0.5, -0.5, 1, 1, 0, // amarelo
     0.5,  0.5,  0.5, 1, 1, 0,
     0.5, -0.5,  0.5, 1, 1, 0,
     0.5, -0.5, -0.5, 1, 1, 0,
     0.5,  0.5, -0.5, 1, 1, 0,
     0.5,  0.5,  0.5, 1, 1, 0,

    // Face superior (y = 0.5)
    -0.5,  0.5, -0.5, 1, 0, 1, // magenta
    -0.5,  0.5,  0.5, 1, 0, 1,
     0.5,  0.5,  0.5, 1, 0, 1,
    -0.5,  0.5, -0.5, 1, 0, 1,
     0.5,  0.5,  0.5, 1, 0, 1,
     0.5,  0.5, -0.5, 1, 0, 1,

    // Face inferior (y = -0.5)
    -0.5, -0.5, -0.5, 0, 1, 1, // ciano
     0.5, -0.5,  0.5, 0, 1, 1,
    -0.5, -0.5,  0.5, 0, 1, 1,
    -0.5, -0.5, -0.5, 0, 1, 1,
     0.5, -0.5, -0.5, 0, 1, 1,
     0.5, -0.5,  0.5, 0, 1, 1,
        ]);
    }

    public createBuffer(device: GPUDevice) {
        this.vertexBuffer = device.createBuffer({
            size: this.vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this.vertexBuffer, 0, new Float32Array(this.vertexData));
    }
}

export class Renderer {
    public device!: GPUDevice;
    public context!: GPUCanvasContext;
    public canvas!: HTMLCanvasElement;
    public pipeline!: GPURenderPipeline;

    public camera!: Camera;
    public cameraTransform!: Transform;
    public lights: Light[] = [];
    public testModel!: TestModel;

    public lightData!: Float32Array;
    public lightBuffer!: GPUBuffer;
    public lightBindGroup!: GPUBindGroup;

    public cameraBuffer!: GPUBuffer;
    public modelBuffer!: GPUBuffer;
    public cameraModelBindGroup!: GPUBindGroup;
    public depthTexture!: GPUTexture;

    constructor(
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        pipeline: GPURenderPipeline,
        camera: Camera,
        cameraTransform: Transform,
        lights: Light[]
    ) {
        this.device = device;
        this.canvas = canvas;
        this.pipeline = pipeline;
        this.context = canvas.getContext("webgpu") as GPUCanvasContext;

        this.camera = camera;
        this.cameraTransform = cameraTransform;
        this.lights = lights;

        // Test model
        this.testModel = new TestModel();
        this.testModel.createBuffer(this.device);

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

        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
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
                view,
                clearValue: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
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

        // Atualiza buffers
        this.device.queue.writeBuffer(this.lightBuffer, 0, this.lightData.buffer);

        const cameraMat = this.camera.viewProjection(this.cameraTransform);
        this.device.queue.writeBuffer(this.cameraBuffer, 0, cameraMat.buffer);

        const modelMat = this.testModel.transform.worldMatrix.value;
        this.device.queue.writeBuffer(this.modelBuffer, 0, new Float32Array(modelMat));

        // Bind groups e vertices
        pass.setBindGroup(0, this.cameraModelBindGroup);
        pass.setBindGroup(1, this.lightBindGroup);

        pass.setVertexBuffer(0, this.testModel.vertexBuffer);
        pass.draw(this.testModel.vertexData.length / 6, 1, 0, 0); // triângulo

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
            this.context.configure({
                device: this.device,
                format: navigator.gpu.getPreferredCanvasFormat(),
                alphaMode: "opaque"
            });
            this.depthTexture = this.device.createTexture({
                size: [w, h],
                format: "depth24plus",
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
        }
    }
}