import { Entity } from "../../../core/api/entity";

export interface ISystem {}
export interface IAwake { awake(entities: Entity[]): void }
export interface IStart { start(entities: Entity[]): void }
export interface IFixedUpdate { fixedUpdate(entities: Entity[], fixedDeltaTime:number): void }
export interface IUpdate { update(entities: Entity[], deltaTime:number): void }
export interface ILateUpdate { lateUpdate(entities: Entity[], deltaTime:number): void }