export class Buffer {
    public constructor(
        public readonly data: ArrayBuffer,
        public readonly byteLength: number = data.byteLength,
        public readonly URI: string = "",
    ) {}
}