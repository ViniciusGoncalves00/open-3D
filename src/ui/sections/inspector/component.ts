import { Component } from "../../../assets/components/abstract/component";
import { Builder } from "./builder";
import { Entity } from "../../../core/api/entity";

export class ComponentUI {
    public readonly container: HTMLElement;
    private open: boolean;

    public constructor(scene: Entity, currentEntity: Entity, component: Component, open: boolean = true) {
        this.open = open;

        this.container = document.createElement("div");

        const bodyElement = Builder.buildBodyElement(scene, currentEntity, component);
        const headElement = Builder.buildComponentHead(currentEntity, bodyElement, component);
        
        this.container.appendChild(headElement);
        this.container.appendChild(bodyElement);
    }
}