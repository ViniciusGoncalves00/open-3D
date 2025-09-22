import { color } from "three/tsl";
import { Attributes, Mesh } from "../../assets/components/mesh";
import { Entity } from "../../core/api/entity";
import { LogType } from "../../core/api/enum/log-type";
import { ConsoleLogger } from "../../ui/editor/sections/console/console";
import { Renderer } from "./renderer";

interface EntityGPUResources {
  vertexBuffer: GPUBuffer;
  indexBuffer?: GPUBuffer;
  indexCount?: number;
  vertexCount: number;
}

export class RendererManager {
    public readonly device: GPUDevice;
    public readonly renderers: Map<string, Renderer> = new Map();
    public readonly pipelines: Map<string, GPURenderPipeline> = new Map();
    public readonly shaders: Map<string, GPUShaderModule> = new Map();

    public readonly entities: Map<string, Entity> = new Map();
    public readonly entityResources: Map<string, EntityGPUResources> = new Map();


    public constructor(device: GPUDevice) {
        this.device = device;

        const camera = `
            struct Camera {
                viewProjection : mat4x4<f32>
            };
            @group(0) @binding(0) var<uniform> uCamera : Camera;
        `;

        const model = `
            struct Model {
                model : mat4x4<f32>
            };
            @group(0) @binding(1) var<uniform> uModel : Model;
        `;

        const PBRUniform = `
            struct uniformPBR {
                baseColorFactor : vec4<f32>,
                metallicFactor  : f32,
                roughnessFactor : f32,
                _pad0 : vec2<f32>, 
            };
            @group(2) @binding(0) var<uniform> uPBR : uniformPBR;
            @group(2) @binding(1) var uBaseColorTexture : texture_2d<f32>;
            @group(2) @binding(2) var uBaseColorSampler : sampler;
        `

        const light = `
            struct Light {
                color : vec3<f32>,
                intensity : f32,
                direction : vec3<f32>,
                padding : f32, 
            };

            struct Lights {
                count : u32,
                padding_0: u32,
                padding_1: u32,
                padding_2: u32,
                lights : array<Light, 16>
            };

            @group(1) @binding(0) var<uniform> uLights : Lights;
        `;

        const vertexOutput = `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(0) color : vec3<f32>
            };
        `

        const vertexWorld = `
            ${vertexOutput}
            ${light}
            ${camera}
            ${model}

            @vertex
            fn main(
                @location(0) position : vec3<f32>,
                @location(1) color : vec3<f32>,
                @location(2) normal : vec3<f32>
            ) -> VertexOutput {
                var vertex : VertexOutput;

                let localPos = vec4<f32>(position, 1.0);
                vertex.Position = uCamera.viewProjection * uModel.model * localPos;

                var finalColor = vec3<f32>(0, 0, 0);
                let worldNormal = normalize((uModel.model * vec4<f32>(normal, 0.0)).xyz);

                for(var i: u32 = 0u; i < uLights.count; i = i + 1u){
                    let light = uLights.lights[i];
                    let L = -normalize(light.direction);
                    let NdotL = max(dot(worldNormal, L), 0.0);
                    finalColor += color * light.color * light.intensity * NdotL;
                }

                vertex.color = finalColor;
                return vertex;
            }
        `;

        const fragmentWorld = `
            ${vertexOutput}
            ${PBRUniform}

            @fragment
            fn main(input: VertexOutput) -> @location(0) vec4<f32> {
                return uPBR.baseColorFactor;
            }
        `;

        // const vertexScreen = `
        //     ${vertexOutput}

        //     @vertex
        //     fn main(@location(0) position : vec3<f32>, @location(1) color : vec3<f32>) -> VertexOutput {
        //         var output : VertexOutput;
        //         output.Position = vec4<f32>(position, 1.0);
        //         output.color = color;
        //         return output;
        //     }
        // `;

        // const fragmentScreen = `
        //     ${vertexOutput}

        //     @fragment
        //     fn main(input: VertexOutput) -> @location(0) vec4<f32> {
        //         return vec4<f32>(input.color, 1.0);
        //     }
        // `;

        this.shaders.set("vertexWorld", device.createShaderModule({ code: vertexWorld }));
        this.shaders.set("fragmentWorld", device.createShaderModule({ code: fragmentWorld }));
        // this.shaders.set("vertexScreen", device.createShaderModule({ code: vertexScreen }));
        // this.shaders.set("fragmentScreen", device.createShaderModule({ code: fragmentScreen }));

        const vertexBufferLayout: GPUVertexBufferLayout = {
            arrayStride: 9 * 4,
            attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x3" },
                { shaderLocation: 1, offset: 3 * 4, format: "float32x3" },
                { shaderLocation: 2, offset: 6 * 4, format: "float32x3" },
            ],
        };

        const world = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: this.shaders.get("vertexWorld")!,
                entryPoint: "main",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: this.shaders.get("fragmentWorld")!,
                entryPoint: "main",
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
            },
            primitive: {
                topology: "triangle-list",
                frontFace: "ccw",
                cullMode: "back"
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            },
            multisample: {
                count: 4
            }
        });

        // const screen = device.createRenderPipeline({
        //     layout: "auto",
        //     vertex: {
        //         module: this.shaders.get("vertexScreen")!,
        //         entryPoint: "main",
        //         buffers: []
        //     },
        //     fragment: {
        //         module: this.shaders.get("fragmentScreen")!,
        //         entryPoint: "main",
        //         targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
        //     },
        //     primitive: {
        //         topology: "triangle-list"
        //     }
        // });

        this.pipelines.set("world", world); 
        // this.pipelines.set("screen", screen); 
    }

    public addEntity(entity: Entity): void {
        if (!entity.hasComponent(Mesh)) {
            ConsoleLogger.log("Entity doesn't have components necessary to be rendered.", LogType.Warning);
            return;
        }

        const mesh = entity.getComponent(Mesh);

        for (const primitive of mesh.primitives) {
            const positionAccessor = primitive.tryGetAttribute(Attributes.Position);
            const colorAccessor = primitive.tryGetAttribute(Attributes.Color0);

            if (!positionAccessor) {
                ConsoleLogger.log("Mesh primitive missing POSITION accessor.", LogType.Error);
                continue;
            }

            let vertexBuffer: GPUBuffer;

            if (colorAccessor) {
                const slice = positionAccessor.bufferView.buffer.data.slice(
                    positionAccessor.bufferView.byteOffset,
                    positionAccessor.bufferView.byteOffset + positionAccessor.bufferView.byteLength
                );

                vertexBuffer = this.device.createBuffer({
                    size: slice.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    mappedAtCreation: true,
                });
                new Uint8Array(vertexBuffer.getMappedRange()).set(new Uint8Array(slice));
                vertexBuffer.unmap();
            } else {
                const positionData = new Float32Array(
                    positionAccessor.bufferView.buffer.data,
                    positionAccessor.bufferView.byteOffset,
                    positionAccessor.count * positionAccessor.getNumComponents()
                );

                const vertexData: number[] = [];
                for (let i = 0; i < positionAccessor.count; i++) {
                    for (let j = 0; j < positionAccessor.getNumComponents(); j++) {
                        vertexData.push(positionData[i * positionAccessor.getNumComponents() + j]);
                    }
                    vertexData.push(1, 1, 1);
                }

                vertexBuffer = this.device.createBuffer({
                    size: vertexData.length * 4,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                    mappedAtCreation: true,
                });
                new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
                vertexBuffer.unmap();
            }

            let indexBuffer: GPUBuffer | undefined;
            let indexCount: number | undefined;

            if (primitive.indices) {
                const accessor = primitive.indices;
                const slice = accessor.bufferView.buffer.data.slice(
                    accessor.bufferView.byteOffset + accessor.byteOffset,
                    accessor.bufferView.byteOffset + accessor.byteOffset + accessor.count * accessor.getComponentSize()
                );
                indexCount = accessor.count;

                indexBuffer = this.device.createBuffer({
                    size: slice.byteLength,
                    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                    mappedAtCreation: true,
                });
                new Uint8Array(indexBuffer.getMappedRange()).set(new Uint8Array(slice));
                indexBuffer.unmap();
            }

            this.entityResources.set(entity.id, {
                vertexBuffer,
                indexBuffer,
                indexCount,
                vertexCount: positionAccessor.count,
            });
        }

        this.entities.set(entity.id, entity);
    }

    public removeEntity(entity: Entity): void {
        const resources = this.entityResources.get(entity.id);

        if (!resources) {
            ConsoleLogger.log(`There is no data stored for the entity ${entity.name.value} to be removed.`, LogType.Warning);
            return;
        }

        resources.vertexBuffer.destroy();
        if (resources.indexBuffer) {
            resources.indexBuffer.destroy();
        }

        this.entityResources.delete(entity.id);
        this.entities.delete(entity.id);
    }
}