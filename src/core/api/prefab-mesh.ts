import { Accessor, BufferView, Buffer, Mesh, Primitive, Attributes } from "../../assets/components/mesh";

export class PrefabMesh {
    public static quad(size: number = 1, color?: [number, number, number]): Mesh {
    	const half = size / 2;

    	const r = color ? color[0] : Math.random();
    	const g = color ? color[1] : Math.random();
    	const b = color ? color[2] : Math.random();

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
		
		const primitive = new Primitive(attributes, "default", indexAccessor);
		
		return new Mesh("Quad", [primitive]);
  	}

    public static cube(size = 1, color?: [number, number, number]): Mesh {
    	const half = size / 2;

		const r = color ? color[0] : Math.random();
    	const g = color ? color[1] : Math.random();
    	const b = color ? color[2] : Math.random();

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
		
		const primitive = new Primitive(attributes, "default", indexAccessor);

    	return new Mesh("Cube", [primitive]);
	}


	public static sphere(
	    radius = 1,
	    latitudeBands = 12,
	    longitudeBands = 12,
	    color?: [number, number, number]
	): Mesh {
	    const vertices: number[] = [];
	    const indices: number[] = [];

	    const r = color ? color[0] : Math.random();
	    const g = color ? color[1] : Math.random();
	    const b = color ? color[2] : Math.random();

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
		
		const primitive = new Primitive(attributes, "default", indexAccessor);

	    return new Mesh("Sphere", [primitive]);
	}

	public static sphereWithMaterial(
	    radius = 1,
	    latitudeBands = 12,
	    longitudeBands = 12,
	    color?: [number, number, number]
	): Mesh {
	    const vertices: number[] = [];
	    const indices: number[] = [];

	    const r = color ? color[0] : Math.random();
	    const g = color ? color[1] : Math.random();
	    const b = color ? color[2] : Math.random();

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
		
		const primitive = new Primitive(attributes, "default", indexAccessor);

	    return new Mesh("Sphere", [primitive]);
	}
}