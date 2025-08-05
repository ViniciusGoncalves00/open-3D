import { ObservableField } from "../../../common/observer/observable-field";

/**
* Class for represent colors.
*/
export class Color {
    public readonly r: ObservableField<number>;
    public readonly g: ObservableField<number>;
    public readonly b: ObservableField<number>;
    public readonly a: ObservableField<number>;
    
    /**
    * Responsive class to represent colors.
    * 
    * Colors are stored normalized between 0 and 1;
    * 
    * Black is the default color.
    * @param r Red channel
    * @param g Green channel
    * @param b Blue channel
    * @param a Alpha channel
    */
    private constructor(r: number, g: number, b: number, a: number) {
        this.r = new ObservableField(r);
        this.g = new ObservableField(g);
        this.b = new ObservableField(b);
        this.a = new ObservableField(a);
    }

    public static create(): Color {
        return new Color(0, 0, 0, 1);
    }

    public static from01(r: number, g: number, b: number, a: number): Color {
        return new Color(r, g, b, a);
    }

    public static from8bit(r: number, g: number, b: number, a: number): Color {
        const nr = r / 255;
        const ng = g / 255;
        const nb = b / 255;
        return new Color(nr, ng, nb, a);
    }

    public static to8bit(color: Color): [number, number, number, number] {
        return [color.r.value * 255, color.g.value * 255, color.b.value * 255, color.a.value]
    }
}