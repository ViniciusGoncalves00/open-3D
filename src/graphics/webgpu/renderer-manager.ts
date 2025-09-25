import { BindingGroups } from "../../core/gltf/binding-groups";
import { Renderer } from "./renderer";

export class RendererManager {
    public readonly device: GPUDevice;
    public readonly renderers: Map<string, Renderer> = new Map();
    public readonly pipelines: Map<string, GPURenderPipeline> = new Map();
    public readonly shaders: Map<string, GPUShaderModule> = new Map();

    public constructor(device: GPUDevice) {
        this.device = device;

        const camera = `
            struct Camera {
                viewProjection : mat4x4<f32>
            };
            @group(${BindingGroups.camera.group}) @binding(${BindingGroups.camera.binding}) var<uniform> uCamera : Camera;
        `;

        const model = `
            struct Model {
                model : mat4x4<f32>
            };
            @group(${BindingGroups.model.group}) @binding(${BindingGroups.model.binding}) var<uniform> uModel : Model;
        `;

        const PBRUniform = `
            struct uniformPBR {
                baseColorFactor : vec4<f32>,
                metallicFactor  : f32,
                roughnessFactor : f32,
                _pad0 : vec2<f32>, 
            };
            @group(${BindingGroups.material.pbrUniform.group}) @binding(${BindingGroups.material.pbrUniform.binding}) var<uniform> uPBR : uniformPBR;
            @group(${BindingGroups.material.baseColorTexture.group}) @binding(${BindingGroups.material.baseColorTexture.binding}) var uBaseColorTexture : texture_2d<f32>;
            @group(${BindingGroups.material.baseColorSampler.group}) @binding(${BindingGroups.material.baseColorSampler.binding}) var uBaseColorSampler : sampler;
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

            @group(${BindingGroups.light.group}) @binding(${BindingGroups.light.binding}) var<uniform> uLights : Lights;
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
                let litColor = input.color;
                let finalColor = litColor * uPBR.baseColorFactor.rgb;
                return vec4<f32>(finalColor, uPBR.baseColorFactor.a);
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
}