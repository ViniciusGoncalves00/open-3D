import { Entity } from "../core/api/entity";
import { Engine } from "../core/engine/engine";

export interface IGraphicEngine {
  init(engine: Engine,canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void;
  startRender(): void;
  resize(width: number, height: number): void;
  bind(entity: Entity): void;

  addEntity(entity: Entity): void;
  removeEntity(entity: Entity): void;
//   updateObject(object: Renderable): void;

//   addLight(light: Light): void;
//   removeLight(light: Light): void;
//   updateLight(light: Light): void;

//   createMaterial(params: MaterialParams): Material;
//   updateMaterial(material: Material, params: MaterialParams): void;
//   disposeMaterial(material: Material): void;

//   createGeometry(params: GeometryParams): Geometry;
//   updateGeometry(geometry: Geometry, params: GeometryParams): void;
//   disposeGeometry(geometry: Geometry): void;

  setEditorCamera(canvas: HTMLCanvasElement, startPosition: {x: number, y: number, z: number}): void;
  setPreviewCamera(canvas: HTMLCanvasElement, startPosition: {x: number, y: number, z: number}): void;
  toggleActiveCamera(): void;
//   setActiveCamera(camera: Camera): void;
//   getActiveCamera(): Camera;

  setFog(color: {r: number, g: number, b: number}, near: number, far: number): void;
  setBackground(color: {r: number, g: number, b: number, a: number}): void;
  setGridHelper(color: {r: number, g: number, b: number, a: number}): void;
  setAxisHelper(color: {r: number, g: number, b: number, a: number}): void;
}