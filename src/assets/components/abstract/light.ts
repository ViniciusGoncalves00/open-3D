import { ObservableField } from "../../../common/observer/observable-field";
import { Color } from "./color";
import { Component } from "./component";

/**
* Abstract base class for lights.
*/
export abstract class Light extends Component {
    public readonly color: Color;
    public readonly intensity: ObservableField<number>;

    /**
    * @param color Light color (default: "1, 1, 1, 1")
    * @param intensity Light intensity (default: 1.0)
    */
    public constructor(color: Color = Color.from01(1, 1, 1, 1), intensity: number = 1.0) {
        super();

        this.color = color;
        this.intensity = new ObservableField(intensity);
    }
}