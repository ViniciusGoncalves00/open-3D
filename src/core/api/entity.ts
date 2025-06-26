import { Component } from "../../assets/components/component";
import { Mesh } from "../../assets/components/mesh";
import { Transform } from "../../assets/components/transform";
import { ObservableField } from "../../common/patterns/observer/observable-field";
import { ObservableMap } from "../../common/patterns/observer/observable-map";

export class Entity {
  private _id: `${string}-${string}-${string}-${string}-${string}`;
  public get id(): string { return this._id; }

  private _name: ObservableField<string> = new ObservableField("Entity");
  public get name(): ObservableField<string> { return this._name; }
  public set name(name: ObservableField<string>) { this._name = name; }

  private _isEnabled = true;
  public get isEnabled(): boolean { return this._isEnabled; }
  public set isEnabled(isEnabled: boolean) { this._isEnabled = isEnabled; }
  
  private _isAwaked = false;
  public get isAwaked(): boolean { return this._isAwaked; }
  public set isAwaked(isAwaked: boolean) { this._isAwaked = isAwaked; }

  private _isStarted = false;
  public get isStarted(): boolean { return this._isStarted; }
  public set isStarted(isStarted: boolean) { this._isStarted = isStarted; }
  
  private _components = new ObservableMap<new (...args: any[]) => Component, Component>(new Map());
  public get components(): ObservableMap<new (...args: any[]) => Component, Component> { return this._components; }
  
  public constructor(id: `${string}-${string}-${string}-${string}-${string}`) {
    this._id = id;
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
    const clone = new Entity(this._id);
    clone._name = this._name;
    clone._isEnabled = this._isEnabled;
    clone._isAwaked = this._isAwaked;
    clone._isStarted = this._isStarted;
  
    for (const [type, component] of this._components.entries()) {
      clone.addComponent(component.clone());
    }
  
    return clone;
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name.value,
      isEnabled: this.isEnabled,
      isAwaked: this.isAwaked,
      isStarted: this.isStarted,
      components: this.getComponents().map(component => ({
        type: component.constructor.name,
        data: component.toJSON?.() ?? {}
      }))
    };
  }

  public static fromJSON(json: any): Entity {
    const entity = new Entity(json.id);
  
    entity.name.value = json.name;
    entity.isEnabled = json.isEnabled;
    entity.isAwaked = json.isAwaked;
    entity.isStarted = json.isStarted;
  
    const componentMap: Record<string, new () => Component> = {
      'Mesh': Mesh,
    };
  
    for (const compJson of json.components) {
      const ctor = componentMap[compJson.type];
      if (!ctor) {
        console.warn(`Componente desconhecido: ${compJson.type}`);
        continue;
      }
      else if(ctor instanceof Transform) {
        const component = new Transform(entity);
        if (component.fromJSON) {
          component.fromJSON(compJson.data);
          entity.addComponent(component);
        }
      }
      else {
        const component = new ctor();
        if (component.fromJSON) {
          component.fromJSON(compJson.data);
          entity.addComponent(component);
        }
      }  
    }

    return entity;
  }

  public restoreFrom(clone: Entity): void {
    this._name = clone.name;
    this._isEnabled = clone.isEnabled;
    this._isAwaked = clone.isAwaked;
    this._isStarted = clone.isStarted;

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
  }
}