import { mesh } from "./types";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { vec3 } from "gl-matrix";

export class PrefabMesh {
    public static quad(size: number = 1): mesh {
      const v = 0.5 * size;
      const vertices = new Float32Array([
          -v, -v, 0,
           v, -v, 0,
          -v,  v, 0,
           v,  v, 0,
      ]);

      const indices = new Uint32Array([
          0, 1, 2,
          2, 1, 3,
      ]);

      return { vertices, indices };
  }


    public static cube(size: number = 1): mesh {
        const v = 0.5 * size;
        const vertices = new Float32Array([
          // Front face
          -v, -v,  v,
           v, -v,  v,
           v,  v,  v,
          -v,  v,  v,

          // Back face
          -v, -v, -v,
          -v,  v, -v,
           v,  v, -v,
           v, -v, -v,

          // Top face
          -v,  v, -v,
          -v,  v,  v,
           v,  v,  v,
           v,  v, -v,

          // Bottom face
          -v, -v, -v,
           v, -v, -v,
           v, -v,  v,
          -v, -v,  v,

          // Right face
           v, -v, -v,
           v,  v, -v,
           v,  v,  v,
           v, -v,  v,

          // Left face
          -v, -v, -v,
          -v, -v,  v,
          -v,  v,  v,
          -v,  v, -v,
      ]);

        const indices =  new Uint32Array([
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ]);

        return { vertices, indices };
    }

    public static sphere(radius = 1, latitudeBands = 12, longitudeBands = 12): mesh {
        const vertices: number[] = [];
        const indices: number[] = [];
        
        for (let lat = 0; lat <= latitudeBands; lat++) {
          const theta = (lat * Math.PI) / latitudeBands;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = (lon * 2 * Math.PI) / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);
        
            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;
        
            vertices.push(radius * x, radius * y, radius * z);
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

        return {
          vertices: new Float32Array(vertices),
          indices: new Uint32Array(indices),
        };
    }
}