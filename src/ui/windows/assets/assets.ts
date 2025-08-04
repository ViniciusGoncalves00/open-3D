import { Utils } from "../../others/utils";
import { Builder, Icons } from "../builder";

export class Assets{
    public readonly element: HTMLElement;

    public constructor() {
        this.element = Builder.section("Assets", Icons.Box);
        Utils.getElementOrFail<HTMLDivElement>("Assets").replaceWith(this.element);
    }
}