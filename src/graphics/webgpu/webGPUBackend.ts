// import { Camera } from "../../assets/components/camera";
// import { Mesh } from "../../assets/components/mesh";
// import { Transform } from "../../assets/components/transform";
// import { ObservableMap } from "../../common/observer/observable-map";
// import { Entity } from "../../core/api/entity";
// import { Options } from "./webGPUutils";
// // import basicVertWGSL from './shaders/basic.vert.wgsl';
// // import vertexPositionColorWGSL from './shaders/vertexPositionColor.frag.wgsl';

// export interface GPUMesh {
//     vertexBuffer: GPUBuffer;
//     indexBuffer?: GPUBuffer;
//     indexCount?: number;
// }


// export class WebGPU {
//     private readonly canvas: ObservableMap<number, GPUCanvasContext> = new ObservableMap();
//     private deviceManager!: DeviceManager;

//     public async init(canvas: HTMLCanvasElement): Promise<void> {
//         if (!navigator.gpu) throw new Error("WebGPU not supported.");

//         const context = canvas.getContext("webgpu") as GPUCanvasContext;
//         this.canvas.set(0, context);

//         this.deviceManager = new DeviceManager(context);

//         await this.deviceManager.init();
//     }

//     public getManager(): DeviceManager {
//         return this.deviceManager;
//     }
// }

// export class DeviceManager {
//     public adapter!: GPUAdapter;
//     public device!: GPUDevice;
//     public queue!: GPUQueue;
//     public context: GPUCanvasContext;
//     public format!: GPUTextureFormat;

//     public currentPipeline!: GPURenderPipeline;
//     public worldPipeline!: GPURenderPipeline;
//     public screenPipeline!: GPURenderPipeline;

//     public depthTexture!: GPUTexture;

//     public buffers: Set<GPUBuffer> = new Set();
//     public textures: Set<GPUTexture> = new Set();

//     public pipelineBindGroupLayout!: GPUBindGroupLayout;
//     public uniformBindGroup!: any;

//     public cameraUniformBuffer!: GPUBuffer;
//     public modelUniformBuffer!: GPUBuffer;
//     public cameraBindGroup!: GPUBindGroup;
//     public modelBindGroup!: GPUBindGroup;

//     private options!: Options;

//     constructor(context: GPUCanvasContext, options?: Options) {
//         this.context = context;
//         this.options = options ?? new Options();
//     }

//     public async init() {
//         this.adapter = (await navigator.gpu.requestAdapter())!;
//         this.device = await this.adapter.requestDevice();
//         this.queue = this.device.queue;

//         this.format = navigator.gpu.getPreferredCanvasFormat();
//         this.context.configure({ device: this.device, format: this.format, alphaMode: "opaque" });

//         this.initPipeline();
//         this.depthTexture = this.createDepthTexture(this.context.canvas.width, this.context.canvas.height);

//         this.device.lost.then(info => console.warn("GPUDevice lost:", info));
//     }

//     private initPipeline(): void {
//         const shaderCode = `
//             struct CameraUBO {
//                 viewProj : mat4x4<f32>
//             };
//             @group(0) @binding(0) var<uniform> uCamera : CameraUBO;

//             struct ModelUBO {
//                 model : mat4x4<f32>
//             };
//             @group(0) @binding(1) var<uniform> uModel : ModelUBO;

//             struct VertexOutput {
//                 @builtin(position) Position : vec4<f32>,
//                 @location(0) color : vec3<f32>
//             };

//             @vertex
//             fn vs_main(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
//                 var out : VertexOutput;
//                 out.Position = uCamera.viewProj * uModel.model * vec4<f32>(position, 1.0);
//                 out.color = color;
//                 return out;
//             }

//             @fragment
//             fn fs_main(inp : VertexOutput) -> @location(0) vec4<f32> {
//                 return vec4<f32>(inp.color, 1.0);
//             }

//             @vertex
//             fn vs_screen(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
//                 var output : VertexOutput;
//                 output.Position = vec4<f32>(position, 1.0);
//                 output.color = color;
//                 return output;
//             }

//             @fragment
//             fn fs_screen(input: VertexOutput) -> @location(0) vec4<f32> {
//                 return vec4<f32>(input.color, 1.0);
//             }
//         `;


//         const shaderModule = this.device.createShaderModule({ code: shaderCode });

//         this.pipelineBindGroupLayout = this.device.createBindGroupLayout({
//             entries: [
//             {
//                 binding: 0,
//                 visibility: GPUShaderStage.VERTEX,
//                 buffer: { type: "uniform" }
//             },
//             {
//                 binding: 1,
//                 visibility: GPUShaderStage.VERTEX,
//                 buffer: { type: "uniform" }
//             }
//           ]
//         });


//         this.worldPipeline = this.device.createRenderPipeline({
//             layout: this.device.createPipelineLayout({ bindGroupLayouts: [this.pipelineBindGroupLayout] }),
//             vertex: {
//                 module: shaderModule,
//                 entryPoint: "vs_main",
//                 buffers: [{
//                     arrayStride: 6 * 4,
//                     attributes: [
//                         { shaderLocation: 0, offset: 0, format: "float32x3" },
//                         { shaderLocation: 1, offset: 12, format: "float32x3" }
//                     ]
//                 }]
//             },
//             fragment: {
//                 module: shaderModule,
//                 entryPoint: "fs_main",
//                 targets: [{ format: this.format }]
//             },
//             primitive: { frontFace: "ccw", topology: "triangle-list", cullMode: "back" },
//             depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" }
//         });

//         this.screenPipeline = this.device.createRenderPipeline({
//             layout: "auto",
//             vertex: {
//                 module: shaderModule,
//                 entryPoint: "vs_screen",
//                 buffers: [{
//                     arrayStride: 6 * 4,
//                     attributes: [
//                         { shaderLocation: 0, offset: 0, format: "float32x3" },
//                         { shaderLocation: 1, offset: 12, format: "float32x3" }
//                     ]
//                 }]
//             },
//             fragment: {
//                 module: shaderModule,
//                 entryPoint: "fs_screen",
//                 targets: [{ format: this.format }]
//             },
//             primitive: { topology: "triangle-list", cullMode: "back" }
//         });

//         this.currentPipeline = this.worldPipeline;

//         this.cameraUniformBuffer = this.createUniformBuffer(new Float32Array(16));
//         this.modelUniformBuffer = this.createUniformBuffer(new Float32Array(16));

//         this.cameraBindGroup = this.device.createBindGroup({
//             layout: this.pipelineBindGroupLayout,
//             entries: [
//                 { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
//                 { binding: 1, resource: { buffer: this.modelUniformBuffer } }
//             ]
//         });


//         this.modelBindGroup = this.device.createBindGroup({
//             layout: this.pipelineBindGroupLayout,
//             entries: [{ binding: 0, resource: { buffer: this.modelUniformBuffer } }]
//         });

//         this.uniformBindGroup = this.device.createBindGroup({
//             layout: this.pipelineBindGroupLayout,
//             entries: [
//               { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
//               { binding: 1, resource: { buffer: this.modelUniformBuffer } }
//             ]
//         });
//     }


//     public createBuffer(desc: GPUBufferDescriptor): GPUBuffer {
//         const buffer = this.device.createBuffer(desc);
//         this.buffers.add(buffer);
//         return buffer;
//     }

//     public createUniformBuffer(data: Float32Array): GPUBuffer {
//         const buffer = this.device.createBuffer({
//             size: data.byteLength,
//             usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Float32Array(buffer.getMappedRange()).set(data);
//         buffer.unmap();
//         this.buffers.add(buffer);
//         return buffer;
//     }

//     public createBindGroup(layout: GPUBindGroupLayout, buffer: GPUBuffer): GPUBindGroup {
//         return this.device.createBindGroup({
//             layout,
//             entries: [{ binding: 0, resource: { buffer } }]
//         });
//     }

//     public createTexture2D(width: number, height: number, format: GPUTextureFormat): GPUTexture {
//         return this.device.createTexture({
//             size: [width, height],
//             format,
//             usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
//         });
//     }

//     public createDepthTexture(width: number, height: number): GPUTexture {
//         const texture = this.device.createTexture({
//             size: [width, height],
//             format: "depth24plus",
//             usage: GPUTextureUsage.RENDER_ATTACHMENT
//         });
//         this.textures.add(texture);
//         return texture;
//     }

//     public createMesh(vertices: Float32Array, indices: Uint32Array): GPUMesh {
//         const vertexBuffer = this.createBuffer({
//             size: vertices.byteLength,
//             usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
//         vertexBuffer.unmap();

//         const indexBuffer = this.createBuffer({
//             size: indices.byteLength,
//             usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Uint32Array(indexBuffer.getMappedRange()).set(indices);
//         indexBuffer.unmap();

//         return { vertexBuffer, indexBuffer, indexCount: indices.length };
//     }

// public render(camera: Camera, cameraTransform: Transform, scene: Entity) {
//     const commandEncoder = this.device.createCommandEncoder();
//     const textureView = this.context.getCurrentTexture().createView();

//     const renderPass = commandEncoder.beginRenderPass({
//         colorAttachments: [{
//             view: textureView,
//             clearValue: { r: 0, g: 0, b: 0, a: 1 },
//             loadOp: "clear",
//             storeOp: "store"
//         }],
//         depthStencilAttachment: {
//             view: this.depthTexture.createView(),
//             depthClearValue: 1.0,
//             depthLoadOp: "clear",
//             depthStoreOp: "store"
//         }
//     });

//     // --- Atualiza buffer da câmera ---
//     const viewProj = camera.viewProjection(cameraTransform);
//     this.queue.writeBuffer(this.cameraUniformBuffer, 0, viewProj);

//     for (const child of scene.descendants()) {
//         if (!child.hasComponent(Transform) || !child.hasComponent(Mesh)) continue;

//         const transform = child.getComponent(Transform);
//         const mesh = child.getComponent(Mesh);

//         transform.updateWorldMatrix();
//         const modelMatrix = new Float32Array(transform.worldMatrix.value);

//         // Atualiza buffer do modelo
//         this.queue.writeBuffer(this.modelUniformBuffer, 0, modelMatrix);

//         // --- Cria bind group único (camera + modelo) ---
//         const bindGroup = this.device.createBindGroup({
//             layout: this.pipelineBindGroupLayout,
//             entries: [
//                 { binding: 0, resource: { buffer: this.cameraUniformBuffer } },
//                 { binding: 1, resource: { buffer: this.modelUniformBuffer } }
//             ]
//         });

//         for (const primitive of this.createMeshFromMesh(mesh)) {
//             renderPass.setPipeline(this.currentPipeline);

//             renderPass.setBindGroup(0, bindGroup); // Apenas um bind group

//             renderPass.setVertexBuffer(0, primitive.vertexBuffer);
//             if (primitive.indexBuffer) {
//                 renderPass.setIndexBuffer(primitive.indexBuffer, "uint32");
//                 renderPass.drawIndexed(primitive.indexCount!);
//             } else {
//                 renderPass.draw(primitive.indexCount!);
//             }
//         }
//     }

//     renderPass.end();
//     this.device.queue.submit([commandEncoder.finish()]);
// }



//     public resize(width: number, height: number) {
//         this.depthTexture.destroy();
//         this.depthTexture = this.device.createTexture({
//             size: [width, height],
//             format: "depth24plus",
//             usage: GPUTextureUsage.RENDER_ATTACHMENT
//         });
//     }

//     public destroyAll() {
//         this.buffers.forEach(buffer => buffer.destroy());
//         this.buffers.clear();
//         this.textures.forEach(texture => texture.destroy());
//         this.textures.clear();
//         this.depthTexture?.destroy();
//     }

//     public stats() {
//         return {
//             buffers: this.buffers.size,
//             textures: this.textures.size
//         };
//     }

//     public createMeshFromMesh(mesh: Mesh): GPUMesh[] {
//     const gpuMeshes: GPUMesh[] = [];

//     for (const primitive of mesh.primitives) {
//         const positionAccessor = primitive.attributes["POSITION"];
//         const colorAccessor = primitive.attributes["COLOR"];
//         if (!positionAccessor || !colorAccessor) continue;

//         const vertexCount = positionAccessor.count;
//         const vertexData = new Float32Array(vertexCount * 6); // 3 pos + 3 color

//         const posSource = new Float32Array(
//             positionAccessor.bufferView.buffer.data,
//             positionAccessor.bufferView.byteOffset + positionAccessor.byteOffset,
//             vertexCount * 3
//         );
//         const colSource = new Float32Array(
//             colorAccessor.bufferView.buffer.data,
//             colorAccessor.bufferView.byteOffset + colorAccessor.byteOffset,
//             vertexCount * 3
//         );

//         for (let i = 0; i < vertexCount; i++) {
//             vertexData.set(posSource.subarray(i * 3, i * 3 + 3), i * 6);
//             vertexData.set(colSource.subarray(i * 3, i * 3 + 3), i * 6 + 3);
//         }

//         const vertexBuffer = this.createBuffer({
//             size: vertexData.byteLength,
//             usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
//         vertexBuffer.unmap();

//         // Indices...
//         let indexBuffer: GPUBuffer | undefined;
//         let indexCount: number | undefined;
//         if (primitive.indices) {
//             const idxAccessor = primitive.indices;
//             const count = idxAccessor.count;
//             const indexData = new Uint32Array(
//                 idxAccessor.bufferView.buffer.data,
//                 idxAccessor.bufferView.byteOffset + idxAccessor.byteOffset,
//                 count
//             );

//             indexBuffer = this.createBuffer({
//                 size: indexData.byteLength,
//                 usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
//                 mappedAtCreation: true
//             });
//             new Uint32Array(indexBuffer.getMappedRange()).set(indexData);
//             indexBuffer.unmap();
//             indexCount = indexData.length;
//         }

//         gpuMeshes.push({ vertexBuffer, indexBuffer, indexCount: indexCount ?? vertexCount });
//     }

//     return gpuMeshes;
// }

// }
