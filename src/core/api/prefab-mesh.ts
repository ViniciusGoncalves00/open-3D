import { Accessor } from "../gltf/accessor";
import { Attributes } from "../gltf/attributes";
import { Buffer } from "../gltf/buffer";
import { BufferView } from "../gltf/buffer-view";
import { Primitive } from "../gltf/primitive";

export class PrefabPrimitive {
    public static quad(size: number = 1, color?: [number, number, number]): Primitive {
    	const half = size / 2;

    	const r = color ? color[0] : 1;
    	const g = color ? color[1] : 1;
    	const b = color ? color[2] : 1;

    	const vertices = new Float32Array([
    	    -half, -half, 0, r, g, b, 0, 0, 1,
    	     half, -half, 0, r, g, b, 0, 0, 1,
    	     half,  half, 0, r, g, b, 0, 0, 1,
    	    -half,  half, 0, r, g, b, 0, 0, 1,
    	]);

    	const indices = new Uint32Array([
    	    0, 1, 2, 0, 2, 3,
    	]);

    	const vertexBuffer = new Buffer(vertices.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, vertices.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

		const stride = 36;
		
		const positionAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 0, stride);
		const colorAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 12, stride);
		const normalAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 24, stride);
		
		const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");

		const attributes = new Map();
		attributes.set(Attributes.Position, positionAccessor);
		attributes.set(Attributes.Color0, colorAccessor);
		attributes.set(Attributes.Normal, normalAccessor);
		
		return new Primitive("quad", attributes, "default", indexAccessor);
  	}

    public static cube(size = 1, color?: [number, number, number]): Primitive {
    	const half = size / 2;

		const r = color ? color[0] : 1;
    	const g = color ? color[1] : 1;
    	const b = color ? color[2] : 1;

    	const positions = new Float32Array([
    		// Front
    		-half, -half,  half, r, g, b, 0, 0, 1,
    		 half, -half,  half, r, g, b, 0, 0, 1,
    		 half,  half,  half, r, g, b, 0, 0, 1,
    		-half,  half,  half, r, g, b, 0, 0, 1,

    		// Back
    		-half, -half, -half, r, g, b, 0, 0, -1,
    		 half, -half, -half, r, g, b, 0, 0, -1,
    		 half,  half, -half, r, g, b, 0, 0, -1,
    		-half,  half, -half, r, g, b, 0, 0, -1,

    		// Right
    		 half, -half, -half, r, g, b, 1, 0, 0,
    		 half, -half,  half, r, g, b, 1, 0, 0,
    		 half,  half,  half, r, g, b, 1, 0, 0,
    		 half,  half, -half, r, g, b, 1, 0, 0,

    		// Left
    		-half, -half, -half, r, g, b, -1, 0, 0,
    		-half, -half,  half, r, g, b, -1, 0, 0,
    		-half,  half,  half, r, g, b, -1, 0, 0,
    		-half,  half, -half, r, g, b, -1, 0, 0,

    		// Up
    		-half,  half,  half, r, g, b, 0, 1, 0,
    		 half,  half,  half, r, g, b, 0, 1, 0,
    		 half,  half, -half, r, g, b, 0, 1, 0,
    		-half,  half, -half, r, g, b, 0, 1, 0,

    		// Down
    		-half, -half,  half, r, g, b, 0, -1, 0,
    		 half, -half,  half, r, g, b, 0, -1, 0,
    		 half, -half, -half, r, g, b, 0, -1, 0,
    		-half, -half, -half, r, g, b, 0, -1, 0,
    	]);

		const indices = new Uint32Array([
			// Front
    		0, 1, 2,   0, 2, 3,
    		// Back
    		4, 6, 5,   4, 7, 6,
    		// Right
    		8, 10, 9,  8, 11, 10,
    		// Left
    		12, 13, 14,  12, 14, 15,
    		// Up
    		16, 17, 18,  16, 18, 19,
    		// Down
    		20, 22, 21,  20, 23, 22,
		]);

    	const vertexBuffer = new Buffer(positions.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, positions.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

		const stride = 36;
		
    	const positionAccessor = new Accessor(vertexBufferView, 5126, 24, "VEC3", 0, stride);
		const colorAccessor = new Accessor(vertexBufferView, 5126, 24, "VEC3", 12, stride);
		const normalAccessor = new Accessor(vertexBufferView, 5126, 24, "VEC3", 24, stride);

    	const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");

    	const attributes = new Map();
		attributes.set(Attributes.Position, positionAccessor);
		attributes.set(Attributes.Color0, colorAccessor);
		attributes.set(Attributes.Normal, normalAccessor);
		
		return new Primitive("cube", attributes, "default", indexAccessor);
	}


	public static sphere(
	    radius = 1,
	    latitudeBands = 512,
	    longitudeBands = 512,
	    color?: [number, number, number]
	): Primitive {
	    const vertices: number[] = [];
	    const indices: number[] = [];

	    const r = color ? color[0] : 1;
	    const g = color ? color[1] : 1;
	    const b = color ? color[2] : 1;

	    for (let latitude = 0; latitude <= latitudeBands; latitude++) {
	        const theta = (latitude * Math.PI) / latitudeBands;
	        const sinTheta = Math.sin(theta);
	        const cosTheta = Math.cos(theta);

	        for (let longitude = 0; longitude <= longitudeBands; longitude++) {
	            const phi = (longitude * 2 * Math.PI) / longitudeBands;
	            const sinPhi = Math.sin(phi);
	            const cosPhi = Math.cos(phi);

	            const x = cosPhi * sinTheta * radius;
	            const y = cosTheta * radius;
	            const z = sinPhi * sinTheta * radius;

				const nx = x / radius;
				const ny = y / radius;
				const nz = z / radius;

	            vertices.push(x, y, z);
	            vertices.push(r, g, b);
	            vertices.push(nx, ny, nz);
	        }
	    }

	    for (let lat = 0; lat < latitudeBands; lat++) {
	        for (let lon = 0; lon < longitudeBands; lon++) {
	            const first = lat * (longitudeBands + 1) + lon;
	            const second = first + longitudeBands + 1;

	            indices.push(first, first + 1, second);
				indices.push(second, first + 1, second + 1);
	        }
	    }

	    const vertexArray = new Float32Array(vertices);
	    const indexArray = new Uint32Array(indices);

	    const vertexBuffer = new Buffer(vertexArray.buffer);
	    const indexBuffer = new Buffer(indexArray.buffer);

	    const vertexBufferView = new BufferView(vertexBuffer, 0, vertexArray.byteLength);
	    const indexBufferView = new BufferView(indexBuffer, 0, indexArray.byteLength);

	    const stride = 36; // 3 pos (12) + 3 color (12) + 3 normal (12) = 36 bytes

	    const positionAccessor = new Accessor(vertexBufferView, 5126, vertexArray.length / 9, "VEC3", 0, stride);
	    const colorAccessor    = new Accessor(vertexBufferView, 5126, vertexArray.length / 9, "VEC3", 12, stride);
	    const normalAccessor   = new Accessor(vertexBufferView, 5126, vertexArray.length / 9, "VEC3", 24, stride);

	    const indexAccessor    = new Accessor(indexBufferView, 5125, indexArray.length, "SCALAR");

	    const attributes = new Map();
		attributes.set(Attributes.Position, positionAccessor);
		attributes.set(Attributes.Color0, colorAccessor);
		attributes.set(Attributes.Normal, normalAccessor);
		
		return new Primitive("sphere", attributes, "default", indexAccessor);
	}

	public static sphereWithMaterial(
	    radius = 1,
	    latitudeBands = 24,
	    longitudeBands = 24,
	    color?: [number, number, number]
	): Primitive {
	    const vertices: number[] = [];
	    const indices: number[] = [];

	    const r = color ? color[0] : 1;
	    const g = color ? color[1] : 1;
	    const b = color ? color[2] : 1;

	    for (let latitude = 0; latitude <= latitudeBands; latitude++) {
	        const theta = (latitude * Math.PI) / latitudeBands;
	        const sinTheta = Math.sin(theta);
	        const cosTheta = Math.cos(theta);

	        for (let longitude = 0; longitude <= longitudeBands; longitude++) {
	            const phi = (longitude * 2 * Math.PI) / longitudeBands;
	            const sinPhi = Math.sin(phi);
	            const cosPhi = Math.cos(phi);

	            const x = cosPhi * sinTheta * radius;
	            const y = cosTheta * radius;
	            const z = sinPhi * sinTheta * radius;

	            vertices.push(x, y, z);
	            vertices.push(x, y, z);
	        }
	    }

	    for (let lat = 0; lat < latitudeBands; lat++) {
	        for (let lon = 0; lon < longitudeBands; lon++) {
	            const first = lat * (longitudeBands + 1) + lon;
	            const second = first + longitudeBands + 1;

	            indices.push(first, first + 1, second);
				indices.push(second, first + 1, second + 1);
	        }
	    }

	    const vertexArray = new Float32Array(vertices);
	    const indexArray = new Uint32Array(indices);

	    const vertexBuffer = new Buffer(vertexArray.buffer);
	    const indexBuffer = new Buffer(indexArray.buffer);

	    const vertexBufferView = new BufferView(vertexBuffer, 0, vertexArray.byteLength);
	    const indexBufferView = new BufferView(indexBuffer, 0, indexArray.byteLength);

	    const stride = 36; // 3 pos (12) + 3 color (12) + 3 normal (12) = 36 bytes

	    const positionAccessor = new Accessor(vertexBufferView, 5126, vertexArray.length / 9, "VEC3", 0, stride);
	    const normalAccessor   = new Accessor(vertexBufferView, 5126, vertexArray.length / 9, "VEC3", 24, stride);

	    const indexAccessor    = new Accessor(indexBufferView, 5125, indexArray.length, "SCALAR");

	    const attributes = new Map();
		attributes.set(Attributes.Position, positionAccessor);
		// attributes.set(Attributes.Color0, colorAccessor);
		attributes.set(Attributes.Normal, normalAccessor);
		
		return new Primitive("sphere", attributes, "default", indexAccessor);
	}

	public static cylinder(
    radius = 1,
    height = 2,
    segments = 64,
    color?: [number, number, number]
): Primitive {
    const vertices: number[] = [];
    const indices: number[] = [];

    const r = color ? color[0] : 1;
    const g = color ? color[1] : 1;
    const b = color ? color[2] : 1;

    // laterais
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        const x = cos * radius;
        const z = sin * radius;

        // topo
        vertices.push(x, height / 2, z, r, g, b, cos, 0, sin);
        // base
        vertices.push(x, -height / 2, z, r, g, b, cos, 0, sin);
    }

    // índices das laterais
    for (let i = 0; i < segments * 2; i += 2) {
        indices.push(i, i + 1, i + 2);
        indices.push(i + 1, i + 3, i + 2);
    }

    // centro topo
    const topCenterIndex = vertices.length / 9;
    vertices.push(0, height / 2, 0, r, g, b, 0, 1, 0);

    // topo disco
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        vertices.push(cos * radius, height / 2, sin * radius, r, g, b, 0, 1, 0);

        if (i > 0) {
            indices.push(topCenterIndex, topCenterIndex + i, topCenterIndex + i + 1);
        }
    }

    // centro base
    const bottomCenterIndex = vertices.length / 9;
    vertices.push(0, -height / 2, 0, r, g, b, 0, -1, 0);

    // base disco
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        vertices.push(cos * radius, -height / 2, sin * radius, r, g, b, 0, -1, 0);

        if (i > 0) {
            indices.push(bottomCenterIndex, bottomCenterIndex + i + 1, bottomCenterIndex + i);
        }
    }

    return this.buildPrimitive("cylinder", vertices, indices);
}


// 	public static capsule(
//     radius = 1,
//     height = 2,
//     segments = 32,
//     rings = 16,
//     color?: [number, number, number]
// ): Primitive {
//     const cylHeight = height - 2 * radius;
//     const vertices: number[] = [];
//     const indices: number[] = [];

//     // cilindro
//     const cyl = this.cylinder(radius, cylHeight, segments, color);
//     vertices.push(...cyl.attributes.get(Attributes.Position).bufferView.buffer);
//     indices.push(...cyl.indices);

//     // topo (meia esfera deslocada para cima)
//     const sphereTop = this.sphere(radius, rings, segments, color);
//     // deslocar os vértices no Y em +cylHeight/2
//     // mesma coisa para a base, mas deslocando em -cylHeight/2

//     // (para não poluir aqui, posso detalhar a fusão no próximo passo se quiser 😉)

//     return cyl; // versão simplificada
// }


	public static pyramid(
    baseSize = 1,
    height = 1,
    color?: [number, number, number]
): Primitive {
    const r = color ? color[0] : 1;
    const g = color ? color[1] : 1;
    const b = color ? color[2] : 1;

    const vertices = [
        // base quadrada
        -baseSize, 0, -baseSize, r, g, b, 0, -1, 0,
         baseSize, 0, -baseSize, r, g, b, 0, -1, 0,
         baseSize, 0,  baseSize, r, g, b, 0, -1, 0,
        -baseSize, 0,  baseSize, r, g, b, 0, -1, 0,

        // ápice
        0, height, 0, r, g, b, 0, 1, 0
    ];

    const indices = [
        0, 1, 2, 0, 2, 3, // base
        0, 1, 4,
        1, 2, 4,
        2, 3, 4,
        3, 0, 4
    ];

    return this.buildPrimitive("pyramid", vertices, indices);
}


	public static torus(
    radius = 1,
    tube = 0.4,
    radialSegments = 64,
    tubularSegments = 32,
    color?: [number, number, number]
): Primitive {
    const vertices: number[] = [];
    const indices: number[] = [];

    const r = color ? color[0] : 1;
    const g = color ? color[1] : 1;
    const b = color ? color[2] : 1;

    for (let j = 0; j <= radialSegments; j++) {
        const v = (j / radialSegments) * Math.PI * 2;
        const cosV = Math.cos(v);
        const sinV = Math.sin(v);

        for (let i = 0; i <= tubularSegments; i++) {
            const u = (i / tubularSegments) * Math.PI * 2;
            const cosU = Math.cos(u);
            const sinU = Math.sin(u);

            const x = (radius + tube * cosV) * cosU;
            const y = (radius + tube * cosV) * sinU;
            const z = tube * sinV;

            const nx = cosV * cosU;
            const ny = cosV * sinU;
            const nz = sinV;

            vertices.push(x, y, z, r, g, b, nx, ny, nz);
        }
    }

    for (let j = 1; j <= radialSegments; j++) {
        for (let i = 1; i <= tubularSegments; i++) {
            const a = (tubularSegments + 1) * j + i - 1;
            const b1 = (tubularSegments + 1) * (j - 1) + i - 1;
            const c = (tubularSegments + 1) * (j - 1) + i;
            const d = (tubularSegments + 1) * j + i;

            indices.push(a, b1, d);
            indices.push(b1, c, d);
        }
    }

    return this.buildPrimitive("torus", vertices, indices);
}


	public static cone(
    radius = 1,
    height = 2,
    segments = 64,
    color?: [number, number, number]
): Primitive {
    const vertices: number[] = [];
    const indices: number[] = [];

    const r = color ? color[0] : 1;
    const g = color ? color[1] : 1;
    const b = color ? color[2] : 1;

    // ápice
    const apexIndex = 0;
    vertices.push(0, height / 2, 0, r, g, b, 0, 1, 0);

    // base
    const baseCenterIndex = 1;
    vertices.push(0, -height / 2, 0, r, g, b, 0, -1, 0);

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        vertices.push(x, -height / 2, z, r, g, b, x, 0, z);

        // faces laterais
        if (i > 0) {
            const curr = i + 1;
            const prev = i;
            indices.push(apexIndex, prev + 1, curr + 1); // lateral
            indices.push(baseCenterIndex, curr + 1, prev + 1); // base
        }
    }

    return this.buildPrimitive("cone", vertices, indices);
}


	private static buildPrimitive(name: string, vertices: number[], indices: number[]): Primitive {
    	const vertexArray = new Float32Array(vertices);
    	const indexArray = new Uint32Array(indices);

    	const vertexBuffer = new Buffer(vertexArray.buffer);
    	const indexBuffer = new Buffer(indexArray.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, vertexArray.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indexArray.byteLength);

    	const stride = 36; // 3 pos + 3 color + 3 normal

    	const count = vertexArray.length / 9;
    	const positionAccessor = new Accessor(vertexBufferView, 5126, count, "VEC3", 0, stride);
    	const colorAccessor    = new Accessor(vertexBufferView, 5126, count, "VEC3", 12, stride);
    	const normalAccessor   = new Accessor(vertexBufferView, 5126, count, "VEC3", 24, stride);
    	const indexAccessor    = new Accessor(indexBufferView, 5125, indexArray.length, "SCALAR");

    	const attributes = new Map();
    	attributes.set(Attributes.Position, positionAccessor);
    	attributes.set(Attributes.Color0, colorAccessor);
    	attributes.set(Attributes.Normal, normalAccessor);

    	return new Primitive(name, attributes, "default", indexAccessor);
	}
}