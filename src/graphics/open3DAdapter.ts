import { IGraphicEngine } from "./IGraphicEngine";
import { Entity } from '../core/api/entity';
import { Engine } from '../core/engine/engine';
import { GraphicSettings } from "./graphicSettings";
import { glMatrix, mat3, mat4, vec3, vec4 } from "gl-matrix";
import { Mesh } from "../assets/components/mesh";
import { Transform } from "../assets/components/transform";
import { ObservableVector3 } from "../common/observer/observable-vector3";
import { DirectionalLight } from "../assets/components/directional-light";

export class Open3DAdapter implements IGraphicEngine {
    private _engine: Engine | null = null;
    private _entities: Map<string, any> = new Map<string, any>();

    private rendererA: WebGLRenderingContext | null = null;
    private rendererB: WebGLRenderingContext | null = null;

    private directionalLights: DirectionalLight[] = [];
    
    public init(engine: Engine, canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
      this._engine = engine;

      this.rendererA = canvasA.getContext("webgl");
      this.rendererB = canvasB.getContext("webgl");

      if (this.rendererA === null || this.rendererB === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
      }
    }

    private render(gl: WebGLRenderingContext): void {
      const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        varying lowp vec4 vColor;
        
        void main(void) {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }
      `;

      const fsSource = `
        varying lowp vec4 vColor;

        void main(void) {
          gl_FragColor = vColor;
        }
      `;

      const shaderProgram = this.initShaderProgram(gl, vsSource, fsSource);
      if(!shaderProgram) return;

      const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
          vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
          modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
      };
      
      const loop = () => {
        this.drawScene(gl, programInfo, this._engine!.currentProject.value.activeScene.value);

        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

    }

    public startRender(): void {
      if(!this.rendererA || !this.rendererB) return;

      this.render(this.rendererA);
      this.render(this.rendererB);
    }
    public resize(width: number, height: number): void {
        // throw new Error("Method not implemented.");
    }
    public bind(entity: Entity): void {
        // throw new Error("Method not implemented.");
    }
    public addEntity(entity: Entity): void {
        // throw new Error("Method not implemented.");
    }
    public removeEntity(entity: Entity): void {
        // throw new Error("Method not implemented.");
    }
    public setEditorCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number; }): void {
        // throw new Error("Method not implemented.");
    }
    public setPreviewCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number; }): void {
        // throw new Error("Method not implemented.");
    }
    public toggleActiveCamera(): void {
        // throw new Error("Method not implemented.");
    }
    public setFog(color: { r: number; g: number; b: number; }, near: number, far: number): void {
        // throw new Error("Method not implemented.");
    }
    public setBackground(color: { r: number; g: number; b: number;  a: number}): void {
      this.rendererA?.clearColor(color.r, color.g, color.b, color.a)
      this.rendererB?.clearColor(color.r, color.g, color.b, color.a)
    }
    public setGridHelper(color: { r: number; g: number; b: number; }): void {
        // throw new Error("Method not implemented.");
    }
    public setAxisHelper(color: { r: number; g: number; b: number; }): void {
        // throw new Error("Method not implemented.");
    }

    private initShaderProgram(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if(!fragmentShader || !vertexShader) return;
        
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
          return null;
        }
    
        return shaderProgram;
    }

    private loadShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader | null {
        const shader = gl.createShader(type);

        if(!shader) return null;

        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
          );
          gl.deleteShader(shader);
          return null;
        }
    
        return shader;
    }

    private initBuffers(gl: WebGLRenderingContext, transform: mat4, mesh: Mesh) {
      const vectors = mesh.vertices.items;
      let vertices: number[] = [];
      vectors.forEach(vector => vertices.push(vector.x.value, vector.y.value, vector.z.value))

      const items = mesh.indices.items;
      let indices: number[] = [];
      items.forEach(index => indices.push(index.value))
      
      const verticesBuffer = this.initVerticesBuffer(gl, vertices);
      const indexBuffer = this.initIndexBuffer(gl, indices);
      const colorBuffer = this.initColorBuffer(gl, transform, mesh);

      return {
        position: verticesBuffer,
        indices: indexBuffer,
        color: colorBuffer,
      };
    }

    private initVerticesBuffer(gl: WebGLRenderingContext, vertices: number[]) {
      const buffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      return buffer;
    }
    
    private drawScene(gl: WebGLRenderingContext, programInfo: any, scene: Entity) {
        const bgColor = GraphicSettings.backgroundColor;
        gl.clearColor(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfViewRadians = (45 * Math.PI) / 180;
        const aspect = gl.canvas.width / gl.canvas.height;
        const zNear = 0.01;
        const zFar = 10000.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fieldOfViewRadians, aspect, zNear, zFar);

        const cameraPosition: Float32Array = new Float32Array([-5, 5, -10]);

        const viewMatrix = mat4.create();
        mat4.translate(viewMatrix, viewMatrix, cameraPosition);
        mat4.lookAt(viewMatrix, cameraPosition, [0, 0, 0], [0, 1, 0]);

        this.directionalLights = [];
        const getDirectionalLights = (entity: Entity) => {
          if (entity.hasComponent(DirectionalLight)) {
            const directionalLight = entity.getComponent(DirectionalLight);
            this.directionalLights.push(directionalLight);
          }

          for (const child of entity.children.items ?? []) {
              getDirectionalLights(child);
          }
        }

        getDirectionalLights(scene);

        const drawEntityRecursive = (entity: Entity) => {
          if (entity.hasComponent(Transform) && entity.hasComponent(Mesh)) {
              const transform = entity.getComponent(Transform);
              const mesh = entity.getComponent(Mesh);

              const modelMatrix = transform.worldMatrix.value;

              const modelViewMatrix = mat4.create();
              mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

              const buffers = this.initBuffers(gl, modelMatrix, mesh);

              this.setPositionAttribute(gl, buffers, programInfo);
              this.setColorAttribute(gl, buffers, programInfo);
              gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

              gl.useProgram(programInfo.program);
              gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
              gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

              const vertexCount = mesh.indices.items.length;
              const type = gl.UNSIGNED_SHORT;
              const offset = 0;
              gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
          }

          for (const child of entity.children.items ?? []) {
              drawEntityRecursive(child);
          }
      };

      drawEntityRecursive(scene);
    }

  private setPositionAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: any) {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

    private computeTriangleNormal(p0: ArrayLike<number>, p1: ArrayLike<number>, p2: ArrayLike<number>): [number, number, number] {
        const u = [
            p1[0] - p0[0],
            p1[1] - p0[1],
            p1[2] - p0[2]
        ];
        const v = [
            p2[0] - p0[0],
            p2[1] - p0[1],
            p2[2] - p0[2]
        ];

        const nx = u[1] * v[2] - u[2] * v[1];
        const ny = u[2] * v[0] - u[0] * v[2];
        const nz = u[0] * v[1] - u[1] * v[0];

        const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        return [nx / length, ny / length, nz / length];
    }

    private transformVertexToWorld(localPosition: number[], transform: mat4): vec3 {
        const local = vec4.fromValues(localPosition[0], localPosition[1], localPosition[2], 1.0);
        const world = vec4.create();
        vec4.transformMat4(world, local, transform);
        return vec3.fromValues(world[0], world[1], world[2]);
    }

    private initColorBuffer(gl: WebGLRenderingContext, transform: mat4, mesh: Mesh) {
        const vertices = mesh.vertices.items;
        const numVertices = vertices.length;

        const normals: vec3[] = vertices.map(() => vec3.fromValues(0, 0, 0));

        for (let i = 0; i < mesh.indices.items.length; i += 3) {
            const i0 = mesh.indices.items[i + 0].value;
            const i1 = mesh.indices.items[i + 1].value;
            const i2 = mesh.indices.items[i + 2].value;

            const p0 = this.transformVertexToWorld(vertices[i0].getValues(), transform);
            const p1 = this.transformVertexToWorld(vertices[i1].getValues(), transform);
            const p2 = this.transformVertexToWorld(vertices[i2].getValues(), transform);

            const [nx, ny, nz] = this.computeTriangleNormal(p0, p1, p2);

            normals[i0][0] = nx; normals[i0][1] = ny; normals[i0][2] = nz;
            normals[i1][0] = nx; normals[i1][1] = ny; normals[i1][2] = nz;
            normals[i2][0] = nx; normals[i2][1] = ny; normals[i2][2] = nz;
        }

        const colors: number[] = [];
        const directionalLight = this.directionalLights.find((light) => light !== undefined);
        const sunDirection = vec3.fromValues(directionalLight!.direction.x.value, directionalLight!.direction.y.value, directionalLight!.direction.z.value);
        // const sunDirection = vec3.fromValues(1, 1, 1);
        vec3.normalize(sunDirection, sunDirection);
        const globalIlluminationIntensity = 0.1;

        for (let i = 0; i < numVertices; i++) {
          const t = i / numVertices;
          // const r = t % 2 == 0 ? 0 : t / 3;
          // const g = t % 2 == 0 ? 0 : t / 3;
          // const b = t % 2 == 0 ? 0 : t;
          const normal = normals[i]
          const dot = vec3.dot(sunDirection, normal);
          const intensity = Math.max(0, dot);
          let r = intensity * t % 2 == 0 ? 0 : t / 3;
          let g = intensity * t % 2 == 0 ? 0 : t / 3;
          let b = intensity * t % 2 == 0 ? 0 : t;
          r = Math.min(r + globalIlluminationIntensity, 1);
          g = Math.min(g + globalIlluminationIntensity, 1);
          b = Math.min(b + globalIlluminationIntensity, 1);
          colors.push(r, g, b, 1.0);
        }

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        return colorBuffer;
    }

  private setColorAttribute(gl: WebGLRenderingContext, buffers: any, programInfo: any) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
  }

  private initIndexBuffer(gl: WebGLRenderingContext, indices: number[]) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    );

    return indexBuffer;
  }
}