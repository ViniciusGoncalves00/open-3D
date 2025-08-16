import { Component } from "../../assets/components/abstract/component";
import { DirectionalLight } from "../../assets/components/directional-light";
import { Mesh } from "../../assets/components/mesh";
import { Orbit } from "../../assets/components/orbit";
import { Rotate } from "../../assets/components/rotate";
import { Transform } from "../../assets/components/transform";
import { ObservableField } from "../../common/observer/observable-field";
import { ObservableList } from "../../common/observer/observable-list";
import { ObservableMap } from "../../common/observer/observable-map";
import { ObservableNullableField } from "../../common/observer/observable-nullable-field";

export class Entity {
  public readonly id: `${string}-${string}-${string}-${string}-${string}`;
  public readonly name: ObservableField<string> = new ObservableField("Entity");
  public readonly enabled: ObservableField<boolean> = new ObservableField(true);
  
  private readonly _components = new ObservableMap<new (...args: any[]) => Component, Component>(new Map());
  public get components(): ObservableMap<new (...args: any[]) => Component, Component> { return this._components; }

  private readonly _parent: ObservableNullableField<Entity | null> = new ObservableNullableField();

  public get parent(): ObservableNullableField<Entity | null> { return this._parent; }
  public set parent(newParent: Entity | null) {
    // return if it is the same entity
    if(this._parent.value?.id === newParent?.id) return;
    // return if the parent is a child of this entity or descendant
    if (newParent && this.isMyDescendant(newParent)) return;
    
    // remove this entity from the previous parent's children before assigning the new parent
    if(this._parent.value !== null) this._parent.value.children.remove(this);
    if(newParent) newParent.children.add(this)

    this._parent.value = newParent;
  }

  private readonly _children: ObservableList<Entity> = new ObservableList();
  public get children(): ObservableList<Entity> { return this._children; }
  
  public constructor(id: `${string}-${string}-${string}-${string}-${string}`) {
    this.id = id;
  }

  public addComponent<T extends Component>(component: T): void {
    this._components.set(component.constructor as new (...args: any[]) => T, component);
  }

  public getComponent<T extends Component>(type: new (...args: any[]) => T): T {
    return this._components.get(type) as T;
  }

  public getComponents(): Component[] {
    return Array.from(this._components.values());
  }

  public hasComponent<T extends Component>(type: new (...args: any[]) => T): boolean {
    return this._components.has(type);
  }

  public removeComponent<T extends Component>(type: new (...args: any[]) => T): boolean {
    return this._components.delete(type);
  }

  public destroy(): void {
    this._components.forEach(component => component.destroy())
  }

  public clone(): Entity {
    const clone = new Entity(this.id);
    clone.parent.value = this._parent.value;
    clone.name.value = this.name.value;
    clone.enabled.value = this.enabled.value;
    this._children.items.forEach(child => clone.children.items.push(child.clone()));
  
    for (const [type, component] of this._components.entries()) {
      clone.addComponent(component.clone());
    }
  
    return clone;
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name.value,
      enabled: this.enabled.value,
      components: this.getComponents().map(component => ({
        type: component.constructor.name,
        data: component.toJSON?.() ?? {}
      })),
      children: this.children.items.map(child => child.toJSON())
    };
  }

  public static fromJSON(json: any, parent: Entity | null = null): Entity {
    const entity = new Entity(json.id);
  
    entity.name.value = json.name;
    entity.enabled.value = json.enabled;
  
    const componentMap: Record<string, new () => Component> = {
      'Mesh': Mesh,
      'Rotate': Rotate,
      'Orbit': Orbit,
      'DirectionalLight': DirectionalLight,
    };
  
    for (const compJson of json.components) {
      if(compJson.type === "Transform") {
        const transform = new Transform(true, entity);
        if (transform.fromJSON) {
          transform.fromJSON(compJson.data);
          entity.addComponent(transform);
        }
        continue;
      }

      const ctor = componentMap[compJson.type];

      if (!ctor) {
        console.warn(`Unknown component: ${compJson.type}`);
        continue;
      }
      else {
        const component = new ctor();
        if (component.fromJSON) {
          component.fromJSON(compJson.data);
          entity.addComponent(component);
        }
      }  
    }

    entity.parent = parent;

    if (json.children && Array.isArray(json.children)) {
      for (const childJson of json.children) {
        Entity.fromJSON(childJson, entity);
      }
    }

    return entity;
  }

  public restoreFrom(clone: Entity): void {
    this.name.value = clone.name.value;
    this.enabled.value = clone.enabled.value;

    for (const type of this._components.keys()) {
      if (!clone._components.has(type)) {
        this._components.delete(type);
      }
    }

    for (const [type, otherComponent] of clone._components.entries()) {
      if (!this._components.has(type)) {
        this._components.set(type, otherComponent.clone());
      } else {
        const thisComponent = this._components.get(type)!;
        thisComponent.copyFrom(otherComponent as any);
      }
    }

    for (let index = 0; index < this.children.items.length; index++) {
      const child = this.children.items[index];      
      const childClone = clone.children.items[index];
      child.restoreFrom(childClone);
    }
  }

  public descendants(): Entity[] {
    const descendants: Entity[] = [];
    const visited = new Set<Entity>();
    const stack: Entity[] = [...this.children.items];

    while (stack.length > 0) {
        const current = stack.pop()!;
        
        if (visited.has(current)) continue;
        visited.add(current);

        descendants.push(current);

        if (current.children.items.length) {
            stack.push(...current.children.items);
        }
    }

    return descendants;
  }

  private isMyDescendant(possibleDescendant: Entity): boolean {
    for (const child of this._children.items) {
      if (child === possibleDescendant || child.isMyDescendant(possibleDescendant)) return true;
    }
    return false;
  }
}