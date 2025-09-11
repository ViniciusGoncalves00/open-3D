// /// <reference types="@webgpu/types" />
// import { IGraphicEngine } from "./IGraphicEngine";
// import { Engine } from "../core/engine/engine";
// import { Entity } from "../core/api/entity";
// import { Mesh } from "../assets/components/mesh";
// import { Transform } from "../assets/components/transform";
// import { Camera } from "../assets/components/camera";
// import { DirectionalLight } from "../assets/components/directional-light";
// import { mat4, vec3 } from "gl-matrix";

// interface EntityBuffers {
//   vertexBuffer: GPUBuffer;
//   colorBuffer: GPUBuffer;
//   indexBuffer: GPUBuffer;
//   indexCount: number;
//   uniformBuffer: GPUBuffer; // MVP
// }

// export class Open3DAdapterWebGPU implements IGraphicEngine {
//   private engine: Engine;

//   private device!: GPUDevice;
//   private contextA!: GPUCanvasContext;
//   private contextB!: GPUCanvasContext;
//   private pipeline!: GPURenderPipeline;
//   private format!: GPUTextureFormat;

//   private depthTextureA!: GPUTexture;
//   private depthTextureB!: GPUTexture;

//   private entityBuffers: Map<Entity, EntityBuffers> = new Map();
//   private activeCamera: Entity | null = null;
//   private editorCamera: Entity | null = null;
//   private previewCamera: Entity | null = null;

//   constructor(engine: Engine) {
//     this.engine = engine;
//   }

//   async init(engine: Engine, canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement) {
//     this.engine = engine;

//     if (!navigator.gpu) throw new Error("WebGPU não suportado!");

//     const adapter = await navigator.gpu.requestAdapter();
//     this.device = await adapter!.requestDevice();

//     this.contextA = canvasA.getContext("webgpu") as GPUCanvasContext;
//     this.contextB = canvasB.getContext("webgpu") as GPUCanvasContext;

//     this.format = navigator.gpu.getPreferredCanvasFormat();

//     this.configureCanvas(this.contextA);
//     this.configureCanvas(this.contextB);

//     this.initPipeline();
//     this.startRender();
//   }

//   private configureCanvas(context: GPUCanvasContext) {
//   const canvas = context.canvas as HTMLCanvasElement;
//   // Garantir que o canvas tenha tamanho real
//   const width = canvas.clientWidth * window.devicePixelRatio || 1;
//   const height = canvas.clientHeight * window.devicePixelRatio || 1;
//   canvas.width = width;
//   canvas.height = height;

//   context.configure({
//     device: this.device,
//     format: this.format,
//     alphaMode: "opaque",
//   });

//   return this.device.createTexture({
//     size: [width, height],
//     format: "depth24plus",
//     usage: GPUTextureUsage.RENDER_ATTACHMENT,
//   });
// }


//   private initPipeline() {
//     const shaderModule = this.device.createShaderModule({
//       code: `
//       struct Uniforms {
//         mvp : mat4x4<f32>
//       };
//       @binding(0) @group(0) var<uniform> uniforms : Uniforms;

//       struct VertexOutput {
//         @builtin(position) Position : vec4<f32>,
//         @location(0) color : vec4<f32>,
//       };

//       @vertex
//       fn vs_main(
//         @location(0) position: vec3<f32>,
//         @location(1) color: vec4<f32>
//       ) -> VertexOutput {
//         var out: VertexOutput;
//         out.Position = uniforms.mvp * vec4<f32>(position, 1.0);
//         out.color = color;
//         return out;
//       }

//       @fragment
//       fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
//         return color;
//       }
//       `,
//     });

//     this.pipeline = this.device.createRenderPipeline({
//       layout: "auto",
//       vertex: {
//         module: shaderModule,
//         entryPoint: "vs_main",
//         buffers: [
//           { arrayStride: 3 * 4, attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }] },
//           { arrayStride: 4 * 4, attributes: [{ shaderLocation: 1, offset: 0, format: "float32x4" }] },
//         ],
//       },
//       fragment: {
//         module: shaderModule,
//         entryPoint: "fs_main",
//         targets: [{ format: this.format }],
//       },
//       primitive: { topology: "triangle-list" },
//       depthStencil: { format: "depth24plus", depthWriteEnabled: true, depthCompare: "less" },
//     });
//   }

//   addEntity(entity: Entity) {
//     if (!entity.hasComponent(Mesh)) return;

//     const mesh = entity.getComponent(Mesh);

//     const vertices: number[] = [];
//     const colors: number[] = [];
//     mesh.vertices.items.forEach(v => {
//       vertices.push(v.x.value, v.y.value, v.z.value);
//       colors.push(1, 0, 0, 1); // vermelho padrão
//     });

//     const indices = mesh.indices.items.map(i => i.value);

//     const vertexBuffer = this.device.createBuffer({
//       size: vertices.length * 4,
//       usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     });
//     this.device.queue.writeBuffer(vertexBuffer, 0, new Float32Array(vertices));

//     const colorBuffer = this.device.createBuffer({
//       size: colors.length * 4,
//       usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     });
//     this.device.queue.writeBuffer(colorBuffer, 0, new Float32Array(colors));

//     const indexBuffer = this.device.createBuffer({
//       size: indices.length * 2,
//       usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
//     });
//     this.device.queue.writeBuffer(indexBuffer, 0, new Uint16Array(indices));

//     // Cria buffer de uniformes para MVP
//     const uniformBuffer = this.device.createBuffer({
//       size: 64, // 4x4 float32
//       usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//     });

//     this.entityBuffers.set(entity, { vertexBuffer, colorBuffer, indexBuffer, indexCount: indices.length, uniformBuffer });
//   }

//   removeEntity(entity: Entity) {
//     this.entityBuffers.delete(entity);
//   }

//   setEditorCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number }) {
//     this.editorCamera = this.activeCamera; // simplificado
//   }

//   setPreviewCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number }) {
//     this.previewCamera = this.activeCamera;
//   }

//   toggleActiveCamera() {
//     this.activeCamera = this.activeCamera === this.editorCamera ? this.previewCamera : this.editorCamera;
//   }

//   startRender() {
//     const loop = () => {
//       this.render(this.contextA, this.depthTextureA);
//       this.render(this.contextB, this.depthTextureB);
//       requestAnimationFrame(loop);
//     };
//     requestAnimationFrame(loop);
//   }

//   private render(context: GPUCanvasContext, depthTexture: GPUTexture) {
//   const currentTexture = context.getCurrentTexture();
//   if (!currentTexture) return;

//   const textureView = currentTexture.createView();
// const commandEncoder = this.device.createCommandEncoder();

//   const renderPass = commandEncoder.beginRenderPass({
//     colorAttachments: [{
//       view: textureView,
//       clearValue: { r: 0.2, g: 0.2, b: 0.2, a: 1 },
//       loadOp: "clear",
//       storeOp: "store"
//     }],
//     depthStencilAttachment: {
//       view: depthTexture.createView(),
//       depthLoadOp: "clear",
//       depthClearValue: 1.0,
//       depthStoreOp: "store"
//     }
//   });

//     renderPass.setPipeline(this.pipeline);

//     // Calcular MVP global para cada entidade
//     const camera = this.activeCamera;
//     let viewProjection = mat4.create();
//     if (camera) {
//       const camTransform = camera.getComponent(Transform);
//       const camCamera = camera.getComponent(Camera);

//       const projection = mat4.create();
//       mat4.perspective(projection, camCamera.fov.value * Math.PI / 180, camCamera.aspectRatio.value, camCamera.nearClip.value, camCamera.farClip.value);

//       const view = mat4.create();
//       const lookAt = vec3.create();
//       vec3.add(lookAt, camTransform.position.getValues(), [0,0,-1]); // simplificado
//       mat4.lookAt(view, camTransform.position.getValues(), lookAt, [0,1,0]);

//       mat4.multiply(viewProjection, projection, view);
//     }

//     for (const [entity, buffers] of this.entityBuffers) {
//       const model = entity.hasComponent(Transform) ? entity.getComponent(Transform).worldMatrix.value : mat4.create();
//       const mvp = mat4.create();
//       mat4.multiply(mvp, viewProjection, model);

//       this.device.queue.writeBuffer(buffers.uniformBuffer, 0, new Float32Array(mvp as any));

//       renderPass.setVertexBuffer(0, buffers.vertexBuffer);
//       renderPass.setVertexBuffer(1, buffers.colorBuffer);
//       renderPass.setIndexBuffer(buffers.indexBuffer, "uint16");
//       renderPass.setBindGroup(0, this.device.createBindGroup({
//         layout: this.pipeline.getBindGroupLayout(0),
//         entries: [{ binding: 0, resource: { buffer: buffers.uniformBuffer } }],
//       }));

//       renderPass.drawIndexed(buffers.indexCount, 1, 0, 0, 0);
//     }

//     renderPass.end();
//     this.device.queue.submit([commandEncoder.finish()]);
//   }

//   setBackground(color: { r: number; g: number; b: number; a: number }) {
//     // Aplicado no clearValue do renderPass
//   }

//   resize(width: number, height: number) {
//     this.configureCanvas(this.contextA);
//     this.configureCanvas(this.contextB);
//   }

//   bind(entity: Entity) {}
//   setFog(color: { r: number; g: number; b: number }, near: number, far: number) {}
//   setGridHelper(color: { r: number; g: number; b: number }) {}
//   setAxisHelper(color: { r: number; g: number; b: number }) {}
// }
