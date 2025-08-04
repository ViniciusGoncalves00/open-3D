import { ObservableField } from "../../../common/observer/observable-field";
import { Color } from "./color";
import { Component } from "./component";

/**
* Abstract base class for lights.
*/
export abstract class Light extends Component {
    private readonly _color: Color;
    public get color(): Color { return this._color; };

    private readonly _intensity: ObservableField<number>;
    public get intensity(): ObservableField<number> { return this._intensity };

    /**
    * @param color Light color (default: "1, 1, 1, 1")
    * @param intensity Light intensity (default: 1.0)
    */
    public constructor(color: Color = Color.from01(1, 1, 1, 1), intensity: number = 1.0) {
        super();

        this._color = color;
        this._intensity = new ObservableField(intensity);
    }
}