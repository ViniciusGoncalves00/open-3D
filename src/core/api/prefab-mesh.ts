import { Accessor, BufferView, Buffer, Mesh, Primitive } from "../../assets/components/mesh";

export class PrefabMesh {
    public static quad(size: number = 1, color?: [number, number, number]): Mesh {
    	const half = size / 2;

    	const r = color ? color[0] : Math.random();
    	const g = color ? color[1] : Math.random();
    	const b = color ? color[2] : Math.random();

    	const vertices = new Float32Array([
    	    -half, -half, 0, r, g, b,
    	     half, -half, 0, r, g, b,
    	     half,  half, 0, r, g, b,
    	    -half,  half, 0, r, g, b,
    	]);

    	const indices = new Uint32Array([
    	    0, 1, 2, 0, 2, 3,
    	]);

    	const vertexBuffer = new Buffer(vertices.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, vertices.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

		const stride = 24;
		
		const positionAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 0, stride);
		const colorAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 12, stride);
		
		const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");
		
		const primitive = new Primitive({
		    POSITION: positionAccessor,
		    COLOR_0: colorAccessor
		}, indexAccessor);
		
		return new Mesh("Quad", [primitive]);
  	}

    public static cube(size = 1, color?: [number, number, number]): Mesh {
    	const half = size / 2;

		const r = color ? color[0] : Math.random();
    	const g = color ? color[1] : Math.random();
    	const b = color ? color[2] : Math.random();

    	const positions = new Float32Array([
    	    -half, -half,  half, r, g, b,
    	     half, -half,  half, r, g, b,
    	     half,  half,  half, r, g, b,
    	    -half,  half,  half, r, g, b,
    	    -half, -half, -half, r, g, b,
    	     half, -half, -half, r, g, b,
    	     half,  half, -half, r, g, b,
    	    -half,  half, -half, r, g, b,
    	]);

    	const indices = new Uint32Array([
    	    0, 1, 2, 0, 2, 3,
    	    1, 5, 6, 1, 6, 2,
    	    5, 4, 7, 5, 7, 6,
    	    4, 0, 3, 4, 3, 7,
    	    3, 2, 6, 3, 6, 7,
    	    4, 5, 1, 4, 1, 0
    	]);

    	const vertexBuffer = new Buffer(positions.buffer);
    	const indexBuffer = new Buffer(indices.buffer);

    	const vertexBufferView = new BufferView(vertexBuffer, 0, positions.byteLength);
    	const indexBufferView = new BufferView(indexBuffer, 0, indices.byteLength);

		const stride = 24;
		
    	const positionAccessor = new Accessor(vertexBufferView, 5126, positions.length / 3, "VEC3", 0, stride);
		const colorAccessor = new Accessor(vertexBufferView, 5126, 4, "VEC3", 12, stride);
    	const indexAccessor = new Accessor(indexBufferView, 5125, indices.length, "SCALAR");

    	const primitive = new Primitive({
    	    POSITION: positionAccessor,
    	    COLOR_0: colorAccessor
    	}, indexAccessor);

    	return new Mesh("Cube", [primitive]);
	}


	public static sphere(radius = 1, latitudeBands = 12, longitudeBands = 12, color?: [number, number, number]): Mesh {
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

	            const x = cosPhi * sinTheta;
	            const y = cosTheta;
	            const z = sinPhi * sinTheta;

	            vertices.push(radius * x, radius * y, radius * z);
	            vertices.push(r, g, b);
	        }
	    }

	    for (let lat = 0; lat < latitudeBands; lat++) {
	        for (let lon = 0; lon < longitudeBands; lon++) {
	            const first = lat * (longitudeBands + 1) + lon;
	            const second = first + longitudeBands + 1;

	            indices.push(first, second, first + 1);
	            indices.push(second, second + 1, first + 1);
	        }
	    }

	    const vertexArray = new Float32Array(vertices);
	    const indexArray = new Uint32Array(indices);

	    const vertexBuffer = new Buffer(vertexArray.buffer);
	    const indexBuffer = new Buffer(indexArray.buffer);

	    const vertexBufferView = new BufferView(vertexBuffer, 0, vertexArray.byteLength);
	    const indexBufferView = new BufferView(indexBuffer, 0, indexArray.byteLength);

	    const stride = 24;

	    const positionAccessor = new Accessor(vertexBufferView, 5126, vertexArray.length / 6, "VEC3", 0, stride);
	    const colorAccessor    = new Accessor(vertexBufferView, 5126, vertexArray.length / 6, "VEC3", 12, stride);
	    const indexAccessor    = new Accessor(indexBufferView, 5125, indexArray.length, "SCALAR");

	    const primitive = new Primitive({
	        POSITION: positionAccessor,
	        COLOR_0: colorAccessor
	    }, indexAccessor);

	    return new Mesh("Sphere", [primitive]);
	}
}