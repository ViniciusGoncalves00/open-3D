import { ObservableVector3 } from "../../core/api/ObservableVector3";
import { Component } from "./component";
import { Light } from "./light";

export class DirectionalLight extends Light {
    public fromJSON(json: any): void {
        throw new Error("Method not implemented.");
    }
    private readonly _direction: ObservableVector3;
    public get direction(): ObservableVector3 { return this._direction; }

    public constructor(color: string = "0xffffff", intensity: number = 1.0, direction: ObservableVector3 = new ObservableVector3(0, 0, 0)) {
        super(color, intensity);

        this._direction = direction;
    }

    public clone(): DirectionalLight {
        throw new Error("Method not implemented.");
    }
    public copyFrom(component: DirectionalLight): void {
        throw new Error("Method not implemented.");
    }
    public toJSON() {
        throw new Error("Method not implemented.");
    }
    public destroy(): void {}
}