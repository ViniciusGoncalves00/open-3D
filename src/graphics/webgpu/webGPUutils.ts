// import { Mesh } from "../../assets/components/mesh";
// import { DeviceManager } from "./webGPU";

// export class GPUMesh {
//     public vertexBuffer: GPUBuffer;
//     public indexBuffer: GPUBuffer;
//     public indexCount: number;

//     public constructor(vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer, indexCount: number) {
//         this.vertexBuffer = vertexBuffer;
//         this.indexBuffer = indexBuffer;
//         this.indexCount = indexCount;
//     }
// }

export class Options {
    public backgroundColor = [0.15, 0.15, 0.15, 1.0];
}

// export class WebGPUBuilder {
//     public static createGPUMesh(deviceManager: DeviceManager, mesh: Mesh): GPUMesh {
//         const vertexArray = new Float32Array(mesh.vertices.items.length * 3);
//         mesh.vertices.items.forEach((vertex, i) => {
//             vertexArray[i*3 + 0] = vertex.x.value;
//             vertexArray[i*3 + 1] = vertex.y.value;
//             vertexArray[i*3 + 2] = vertex.z.value;
//         });

//         const indexArray = new Uint32Array(mesh.indices.items.length);
//         mesh.indices.items.forEach((index, idx) => {
//             indexArray[idx] = index.value;
//         });

//         const vertexBuffer = deviceManager.createBuffer({
//             size: vertexArray.byteLength,
//             usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Float32Array(vertexBuffer.getMappedRange()).set(vertexArray);
//         vertexBuffer.unmap();

//         const indexBuffer = deviceManager.createBuffer({
//             size: indexArray.byteLength,
//             usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
//             mappedAtCreation: true
//         });
//         new Uint32Array(indexBuffer.getMappedRange()).set(indexArray);
//         indexBuffer.unmap();
    
//         return new GPUMesh(vertexBuffer, indexBuffer, indexArray.length);
//     }
// }