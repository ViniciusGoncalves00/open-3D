import { Buffer } from "./buffer";

export class BufferView {
    public constructor(
        public buffer: Buffer,
        public byteOffset: number,
        public byteLength: number,
        public target?: number
    ) {}
}