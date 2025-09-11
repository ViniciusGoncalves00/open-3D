import { Renderer } from "./renderer";

export class RendererManager {
    public readonly renderers: Map<string, Renderer> = new Map();
    public readonly pipelines: Map<string, GPURenderPipeline> = new Map();
    public readonly shaders: Map<string, GPUShaderModule> = new Map();

    public constructor(device: GPUDevice) {
        const camera = `
            struct Camera {
                projection : mat4x4<f32>
            };
            @group(0) @binding(0) var<uniform> uCamera : Camera;
        `;

        const light = `
            struct Light {
                color : vec3<f32>,
                intensity : f32,
            };

            struct Lights {
                lights : array<Light, 16>,
            };

            @group(1) @binding(0) var<uniform> uLights : Lights;
        `

        const vertexOutput = `
            struct VertexOutput {
                @builtin(position) Position : vec4<f32>,
                @location(0) color : vec3<f32>
            };
        `

        const vertexWorld = `
            ${vertexOutput}
            ${light}

            @vertex
            fn main(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {
                var positions = array<vec2<f32>, 6>(
                    vec2<f32>(-0.5, -0.5),
                    vec2<f32>( 0.5, -0.5),
                    vec2<f32>(-0.5,  0.5),
                    
                    vec2<f32>(-0.5,  0.5),
                    vec2<f32>(-0.5, -0.5),
                    vec2<f32>( 0.5,  0.5),
                );

                let baseColors = array<vec3<f32>, 6>(
                    vec3<f32>(1.0, 0.0, 0.0),
                    vec3<f32>(0.0, 1.0, 0.0),
                    vec3<f32>(0.0, 0.0, 1.0),
                    vec3<f32>(0.0, 0.0, 1.0),
                    vec3<f32>(0.0, 0.0, 1.0),
                    vec3<f32>(0.0, 0.0, 1.0),
                );

                var finalColors = array<vec3<f32>, 6>(
                    vec3<f32>(0.0, 0.0, 0.0),
                    vec3<f32>(0.0, 0.0, 0.0),
                    vec3<f32>(0.0, 0.0, 0.0),
                    vec3<f32>(0.0, 0.0, 0.0),
                    vec3<f32>(0.0, 0.0, 0.0),
                    vec3<f32>(0.0, 0.0, 0.0)
                );

                for (var i: u32 = 0u; i < 16; i = i + 1u) {
                    let light = uLights.lights[i];
                    finalColors[0] = finalColors[0] + baseColors[0] * light.color * light.intensity;
                    finalColors[1] = finalColors[1] + baseColors[1] * light.color * light.intensity;
                    finalColors[2] = finalColors[2] + baseColors[2] * light.color * light.intensity;
                }

                var output : VertexOutput;
                output.Position = vec4<f32>(positions[VertexIndex], 0.0, 1.0);
                output.color = finalColors[VertexIndex];
                return output;
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

        const world = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: this.shaders.get("vertexWorld")!,
                entryPoint: "main",
                buffers: []
            },
            fragment: {
                module: this.shaders.get("fragmentWorld")!,
                entryPoint: "main",
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
            },
            primitive: {
                topology: "triangle-list"
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