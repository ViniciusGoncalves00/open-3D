import { Accessor, BufferView, Buffer, Mesh, Primitive } from "../../assets/components/mesh";

export class MeshBufferDescriptor {
	public readonly typeBytes;
	public readonly elementsByVertex;
	public readonly colorOffset;
	public readonly uvOffset;
	public readonly vertexCount;
	public readonly positionOffset;
	public readonly vertices;

	public readonly vertexByteSize;
    public readonly colorBytesOffset;
    public readonly UVBytesOffset;

	public constructor(typeBytes: number, elementsByVertex: number, colorOffset: number, uvOffset: number, vertexCount: number, positionOffset: number, vertices: Float32Array) {
		this.typeBytes = typeBytes;
		this.elementsByVertex = elementsByVertex;
		this.colorOffset = colorOffset;
		this.uvOffset = uvOffset;
		this.vertexCount = vertexCount;
		this.positionOffset = positionOffset;
		this.vertices = vertices;

		this.vertexByteSize = typeBytes * elementsByVertex;
    	this.colorBytesOffset = typeBytes * colorOffset;
    	this.UVBytesOffset = typeBytes * uvOffset;
	}
}

export class PrefabMesh {
    public static quad(size: number = 1): Mesh {
    	const half = size / 2;

    	const positions = new Float32Array([
    	    -half, -half,  0, 1, 0, 0,
    	     half, -half,  0, 1, 0, 0,
    	     half,  half,  0, 1, 0, 0,
    	    -half,  half,  0, 1, 0, 0,
    	]);

    	const indices = new Uint32Array([
    	    0, 1, 2, 0, 2, 3,
    	]);

    	const vertexBuffer = new Buffer(positions.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, positions.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

const stride = 6 * 4; // 24 bytes

// POSITION (primeiros 3 floats de cada vértice)
const positionAccessor = new Accessor(
    vertexBufferView,
    5126,           // FLOAT
    4,              // 4 vértices
    "VEC3",
    0,              // byteOffset
	
);

// COLOR (3 floats seguintes)
const colorAccessor = new Accessor(
    vertexBufferView,
    5126,           // FLOAT
    4,              // 4 vértices
    "VEC3",
    12,             // byteOffset (pula os 3 primeiros floats = 12 bytes)
);

const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");

const primitive = new Primitive({
    POSITION: positionAccessor,
    COLOR: colorAccessor
}, indexAccessor);

return new Mesh("Quad", [primitive]);
  	}

    public static cube(size = 1): Mesh {
    	const half = size / 2;

    	// --- vertices do cubo (Float32Array) ---
    	const positions = new Float32Array([
    	    // front
    	    -half, -half,  half, // 0
    	     half, -half,  half, // 1
    	     half,  half,  half, // 2
    	    -half,  half,  half, // 3
    	    // back
    	    -half, -half, -half, // 4
    	     half, -half, -half, // 5
    	     half,  half, -half, // 6
    	    -half,  half, -half  // 7
    	]);

    	// --- indices (Uint32Array, sentido CCW para cada face) ---
    	const indices = new Uint32Array([
    	    // front
    	    0, 1, 2, 0, 2, 3,
    	    // right
    	    1, 5, 6, 1, 6, 2,
    	    // back
    	    5, 4, 7, 5, 7, 6,
    	    // left
    	    4, 0, 3, 4, 3, 7,
    	    // top
    	    3, 2, 6, 3, 6, 7,
    	    // bottom
    	    4, 5, 1, 4, 1, 0
    	]);

    	// --- buffers ---
    	const vertexBuffer = new Buffer(positions.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, positions.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

    	// --- accessors ---
    	const positionAccessor = new Accessor(vertexBufferView, 5126, positions.length / 3, "VEC3"); // FLOAT32
    	const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");        // UINT32

    	// --- primitive ---
    	const primitive = new Primitive({
    	    POSITION: positionAccessor
    	    // NORMAL e TEXCOORD_0 podem ser adicionados aqui
    	}, indexAccessor);

    	// --- mesh ---
    	return new Mesh("Cube", [primitive]);
	}


    // public static sphere(radius = 1, latitudeBands = 12, longitudeBands = 12): MeshBufferDescriptor {
    //     const vertices: number[] = [];
    //     const indices: number[] = [];
        
    //     for (let lat = 0; lat <= latitudeBands; lat++) {
    //       const theta = (lat * Math.PI) / latitudeBands;
    //       const sinTheta = Math.sin(theta);
    //       const cosTheta = Math.cos(theta);

    //       for (let lon = 0; lon <= longitudeBands; lon++) {
    //         const phi = (lon * 2 * Math.PI) / longitudeBands;
    //         const sinPhi = Math.sin(phi);
    //         const cosPhi = Math.cos(phi);
        
    //         const x = cosPhi * sinTheta;
    //         const y = cosTheta;
    //         const z = sinPhi * sinTheta;
        
    //         vertices.push(radius * x, radius * y, radius * z);
    //       }
    //     }
  
    //     for (let lat = 0; lat < latitudeBands; lat++) {
    //       for (let lon = 0; lon < longitudeBands; lon++) {
    //         const first = lat * (longitudeBands + 1) + lon;
    //         const second = first + longitudeBands + 1;
        
    //         indices.push(first, second, first + 1);
    //         indices.push(second, second + 1, first + 1);
    //       }
    //     }

    //     return {
    //       vertices: new Float32Array(vertices),
    //       indices: new Uint32Array(indices),
    //     };
    // }
}