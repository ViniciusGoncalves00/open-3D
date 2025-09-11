import { ISystem, IAwake, IStart, IFixedUpdate, IUpdate, ILateUpdate } from "../../assets/systems/interfaces/system";
import { ObservableField } from "../../common/observer/observable-field";
import { Entity } from "../api/entity";
import { Project } from "./project";

import { Time } from "./time";
import { TimeController } from "./time-controller";
import { isIAwake, isIFixedUpdate, isILateUpdate, isIStart, isIUpdate } from "./typeguard";

/**
 * Central class responsible for managing the execution lifecycle of the engine.
 * 
 * This includes:
 * - Controlling simulation time through Time and TimeController.
 * - Managing and dispatching ECS systems according to their lifecycle phase (awake, start, fixedUpdate, update, lateUpdate).
 * - Executing the main loop using requestAnimationFrame.
 * - Backing up and restoring the active scene state when toggling between editor and runtime modes.
 * - Observing the current project and coordinating updates accordingly.
 */

export class Engine {
  public readonly timeController: TimeController = new TimeController();
  public readonly currentProject: ObservableField<Project>;
  public backup: Entity | null = null;

  private _systems: ISystem[] = [];
  private _awakeSystems: IAwake[] = [];
  private _startSystems: IStart[] = [];
  private _fixedUpdateSystems: IFixedUpdate[] = [];
  private _updateSystems: IUpdate[] = [];
  private _lateUpdateSystems: ILateUpdate[] = [];
  private _animationFrameId: number | null = null;

  public constructor(project: Project) {
    this.currentProject = new ObservableField(project);

    this.timeController.isRunning.subscribe(wasStarted => this.toggleSceneState(wasStarted));
    this.timeController.isPaused.subscribe(wasPaused => this.toggleLoopPause(wasPaused));

    const loop = () => {
      Time.update()
      requestAnimationFrame(loop)
    }
    loop()
  }

  public registerSystem(system: ISystem) {
    this._systems.push(system);

    if (isIAwake(system)) this._awakeSystems.push(system);
    if (isIStart(system)) this._startSystems.push(system);
    if (isIFixedUpdate(system)) this._fixedUpdateSystems.push(system);
    if (isIUpdate(system)) this._updateSystems.push(system);
    if (isILateUpdate(system)) this._lateUpdateSystems.push(system);
  }

  private toggleSceneState(value: boolean) {
    if(value) {
      if(this._animationFrameId) return;

      this._animationFrameId = requestAnimationFrame(this.loop);
      this.backup = this.currentProject.value.activeScene.value.clone();
    }
    else {
      if(!this._animationFrameId) return;

      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
      
      if(this.backup !== null) this.currentProject.value.activeScene.value.restoreFrom(this.backup);
    }
  }

  private toggleLoopPause(value: boolean): void {
    if(value) {
      if(!this._animationFrameId) return;

      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    else {
      if(this._animationFrameId) return;

      this._animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  private loop = () => {
    this._animationFrameId = requestAnimationFrame(this.loop);

    const root = this.currentProject.value?.activeScene.value;
    if (!root) return;

    // const notAwaked: Entity[] = [];
    // const notStarted: Entity[] = [];

    // this.collectLifecycleEntities(root, notAwaked, notStarted);

    // this._awakeSystems.forEach(system => system.awake(notAwaked));
    // notAwaked.forEach(entity => entity.isAwaked = true);

    // this._startSystems.forEach(system => system.start(notStarted));
    // notStarted.forEach(entity => entity.isStarted = true);

    this.updateRecursively(root, (entity) => {
      this._fixedUpdateSystems.forEach(system => system.fixedUpdate([entity], Time.deltaTime.value));
      this._updateSystems.forEach(system => system.update([entity], Time.deltaTime.value));
      this._lateUpdateSystems.forEach(system => system.lateUpdate([entity], Time.deltaTime.value));
    });
  };

  // private collectLifecycleEntities(entity: Entity, notAwaked: Entity[], notStarted: Entity[]): void {
  //   if (!entity.isAwaked) notAwaked.push(entity);
  //   if (!entity.isStarted) notStarted.push(entity);

  //   for (const child of entity.children.items) {
  //     this.collectLifecycleEntities(child, notAwaked, notStarted);
  //   }
  // }

  private updateRecursively(entity: Entity, callback: (entity: Entity) => void): void {
    callback(entity);
    for (const child of entity.children.items) {
      this.updateRecursively(child, callback);
    }
  }
}