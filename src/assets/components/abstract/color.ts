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

    public fromHex(hex: string): void {
        const parsed = hex.replace(/^#/, "");
        const bigint = parseInt(parsed, 16);
        console.log(bigint)

        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        this.r.value = r / 255;
        this.g.value = g / 255;
        this.b.value = b / 255;
    }

    public static fromHex(hex: string, alpha: number = 1): Color {
        const parsed = hex.replace(/^#/, "");
        const bigint = parseInt(parsed, 16);
        console.log(bigint)

        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return Color.from8bit(r, g, b, alpha);
    }

    public static toHex(color: Color): string {
        const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');

        const r = color.r.value;
        const g = color.g.value;
        const b = color.b.value;

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    public static to8bit(color: Color): [number, number, number, number] {
        return [color.r.value * 255, color.g.value * 255, color.b.value * 255, color.a.value]
    }
}