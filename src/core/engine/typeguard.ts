import { Component } from "../../assets/components/component";
import { ISystem, IAwake, IStart, IFixedUpdate, IUpdate, ILateUpdate } from "../../assets/systems/interfaces/system";

export function isIAwake(system: ISystem): system is IAwake {
    return 'awake' in system;
}
export function isIStart(system: ISystem): system is IStart {
  return 'start' in system;
}
export function isIFixedUpdate(system: ISystem): system is IFixedUpdate {
  return 'fixedUpdate' in system;
}
export function isIUpdate(system: ISystem): system is IUpdate {
  return 'update' in system;
}
export function isILateUpdate(system: ISystem): system is ILateUpdate {
  return 'lateUpdate' in system;
}
export function isComponent(obj: any): obj is Component {
  return obj && typeof obj === 'object' && 'entity' in obj;
}