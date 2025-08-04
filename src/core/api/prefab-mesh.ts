import { mesh } from "./types";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { vec3 } from "gl-matrix";

export class PrefabMesh {
    public static quad(size: number = 1): mesh {
        const value = 0.5 * size;
        const vertices = new Float32Array([
            -value, 0.0, -value,
            value, 0.0, -value,
            -value, 0.0,  value,
            value, 0.0,  value,
        ]);

        const indices = new Uint16Array([
            0, 1, 2,
            3, 2, 1,
        ]);

        return { vertices, indices };
    }

    public static cube(size: number = 1): mesh {
        const value = 0.5 * size;
        const vertices = new Float32Array( [
            // Front face
            -value, -value, value, value, -value, value, value, value, value, -value, value, value,
                
            // Back face
            -value, -value, -value, -value, value, -value, value, value, -value, value, -value, -value,
                
            // Top face
            -value, value, -value, -value, value, value, value, value, value, value, value, -value,
                
            // Bottom face
            -value, -value, -value, value, -value, -value, value, -value, value, -value, -value, value,
                
            // Right face
            value, -value, -value, value, value, -value, value, value, value, value, -value, value,
                
            // Left face
            -value, -value, -value, -value, -value, value, -value, value, value, -value, value, -value,
        ] );

        const indices =  new Uint16Array([
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
          indices: new Uint16Array(indices),
        };
    }
}