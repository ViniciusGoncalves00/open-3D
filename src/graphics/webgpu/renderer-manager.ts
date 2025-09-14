import { Renderer } from "./renderer";

export class RendererManager {
    public readonly renderers: Map<string, Renderer> = new Map();
    public readonly pipelines: Map<string, GPURenderPipeline> = new Map();
    public readonly shaders: Map<string, GPUShaderModule> = new Map();

    public constructor(device: GPUDevice) {
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

        const light = `
            struct Light {
                color : vec3<f32>,
                intensity : f32,
            };

            struct Lights {
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
                @location(1) color : vec3<f32>
            ) -> VertexOutput {
                var vertex : VertexOutput;

                let localPos = vec4<f32>(position, 1.0);
                vertex.Position = uCamera.viewProjection * uModel.model * localPos;
                var finalColor =  vec3<f32>(0, 0, 0);
                for (var i: u32 = 0u; i < 16u; i = i + 1u) {
                    finalColor += color * uLights.lights[i].color * uLights.lights[i].intensity;
                }
                vertex.color = finalColor;
                return vertex;
            }
        `;

        const fragmentWorld = `
            ${vertexOutput}

            @fragment
            fn main(input: VertexOutput) -> @location(0) vec4<f32> {
                return vec4<f32>(input.color, 1.0);
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
            arrayStride: 6 * 4,
            attributes: [
                { shaderLocation: 0, offset: 0, format: "float32x3" },
                { shaderLocation: 1, offset: 3 * 4, format: "float32x3" },
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