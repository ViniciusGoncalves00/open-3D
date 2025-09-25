import { Accessor } from "../gltf/accessor";
import { Attributes } from "../gltf/attributes";
import { Primitive } from "../gltf/primitive";

export class GPUPrimitive {
    private device: GPUDevice;
    private vertexBuffers: Map<Attributes, GPUBuffer> = new Map();
    private indexBuffer: GPUBuffer | null = null;
    private indexCount: number | null = null;
    private vertexCount: number = 0;

    public constructor(device: GPUDevice, primitive: Primitive) {
        this.device = device;

        for (const [attribute, accessor] of primitive.attributes.entries()) {
            const buffer = this.createBuffer(device, accessor, true);
            this.vertexBuffers.set(attribute, buffer);

            if (attribute === Attributes.Position) {
                this.vertexCount = accessor.count;
            }
        }

        if (primitive.indices) {
            this.indexBuffer = this.createBuffer(device, primitive.indices, false);
            this.indexCount = primitive.indices.count;
        }
    }

    public draw(pass: GPURenderPassEncoder) {
        let slot = 0;
        for (const [attribute, buffer] of this.vertexBuffers.entries()) {
            pass.setVertexBuffer(slot, buffer);
            slot++;
        }

        if (this.indexBuffer && this.indexCount) {
            pass.setIndexBuffer(this.indexBuffer, "uint32");
            pass.drawIndexed(this.indexCount, 1, 0, 0, 0);
        } else {
            pass.draw(this.vertexCount, 1, 0, 0);
        }
    }

    public getVertexCount(): number {
        return this.vertexCount;
    }

    public getIndexCount(): number | null {
        return this.indexCount;
    }

    private createBuffer(device: GPUDevice, accessor: Accessor, isVertexBuffer: boolean): GPUBuffer {
        const start = accessor.bufferView.byteOffset + accessor.byteOffset;
        const end = start + accessor.count * accessor.getStride();
        const slice = accessor.bufferView.buffer.data.slice(start, end);
        const typedSlice = new Uint8Array(slice);

        let descriptor: GPUBufferDescriptor;
        if(isVertexBuffer) {
            descriptor = {
                size: slice.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            };
        } else {
            descriptor = {
                size: slice.byteLength,
                usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                mappedAtCreation: true,
            };
        }

        const buffer = device.createBuffer(descriptor);
        const range = buffer.getMappedRange();
        const typedRange = new Uint8Array(range);
        typedRange.set(typedSlice);

        buffer.unmap();

        return buffer;
    }
}