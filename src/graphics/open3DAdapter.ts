import { IGraphicEngine } from "./IGraphicEngine";
import { Entity } from '../core/api/entity';
import { Engine } from '../core/engine/engine';
import { GraphicSettings } from "./graphicSettings";

export class Open3DAdapter implements IGraphicEngine {
    private _engine: Engine | null = null;
    private _entities: Map<string, any> = new Map<string, any>();
    
    public init(engine: Engine, canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        const glA = canvasA.getContext("webgl");
        const glB = canvasB.getContext("webgl");

        if (glA === null || glB === null) {
          alert("Unable to initialize WebGL. Your browser or machine may not support it.");
          return;
        }

        const bgColor = GraphicSettings.backgroundColor;
        glA.clearColor(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
        glB.clearColor(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
        glA.clear(glA.COLOR_BUFFER_BIT);
        glB.clear(glA.COLOR_BUFFER_BIT);
    }
    public startRender(): void {
        throw new Error("Method not implemented.");
    }
    public resize(width: number, height: number): void {
        throw new Error("Method not implemented.");
    }
    public bind(entity: Entity): void {
        throw new Error("Method not implemented.");
    }
    public addEntity(entity: Entity): void {
        throw new Error("Method not implemented.");
    }
    public removeEntity(entity: Entity): void {
        throw new Error("Method not implemented.");
    }
    public setEditorCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number; }): void {
        throw new Error("Method not implemented.");
    }
    public setPreviewCamera(canvas: HTMLCanvasElement, startPosition: { x: number; y: number; z: number; }): void {
        throw new Error("Method not implemented.");
    }
    public toggleActiveCamera(): void {
        throw new Error("Method not implemented.");
    }
    public setFog(color: { r: number; g: number; b: number; }, near: number, far: number): void {
        throw new Error("Method not implemented.");
    }
    public setBackground(color: { r: number; g: number; b: number; }): void {
        throw new Error("Method not implemented.");
    }
    public setGridHelper(color: { r: number; g: number; b: number; }): void {
        throw new Error("Method not implemented.");
    }
    public setAxisHelper(color: { r: number; g: number; b: number; }): void {
        throw new Error("Method not implemented.");
    }
}