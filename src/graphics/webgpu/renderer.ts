import { Light } from "../../assets/components/abstract/light";
import { Camera } from "../../assets/components/camera";
import { Transform } from "../../assets/components/transform";

export class Renderer {
    public device!: GPUDevice;
    public context: GPUCanvasContext;
    public canvas: HTMLCanvasElement;
    public pipeline: GPURenderPipeline;

    public camera: Camera;
    public transform: Transform;
    public lights: Light[];

    public lightData: Float32Array;
    public lightBuffer: GPUBuffer;
    public lightBindGroup: GPUBindGroup;

    public constructor(device: GPUDevice, canvas: HTMLCanvasElement, pipeline: GPURenderPipeline, camera: Camera, transform: Transform, lights: Light[]) {
        this.device = device;
        this.canvas = canvas;
        this.pipeline = pipeline;
        this.context = canvas.getContext("webgpu") as GPUCanvasContext;

        this.camera = camera;
        this.transform = transform;
        this.lights = lights;
        
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
            layout: this.pipeline.getBindGroupLayout(1),
            entries: [{ binding: 0, resource: { buffer: this.lightBuffer } }]
        });

        const format = navigator.gpu.getPreferredCanvasFormat();
        this.context.configure({
            device: this.device,
            format,
            alphaMode: "opaque"
        });
    }

    public render() {
        this.updateLights();

        const encoder = this.device.createCommandEncoder();
        const view = this.context.getCurrentTexture().createView();

        const descriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: view,
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: "clear",
                storeOp: "store"
            }]
        };

        const renderPass = encoder.beginRenderPass(descriptor);

        renderPass.setPipeline(this.pipeline);

        this.device.queue.writeBuffer(this.lightBuffer, 0, this.lightData.buffer);
        renderPass.setBindGroup(1, this.lightBindGroup);

        renderPass.draw(3, 1, 0, 0);

        renderPass.end();
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
}