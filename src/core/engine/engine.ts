import { ISystem, IAwake, IStart, IFixedUpdate, IUpdate, ILateUpdate } from "../../assets/systems/interfaces/system";
import { ObservableNullableField } from "../../common/patterns/observer/observable-nullable-field";
import { Project } from "./project";

import { Time } from "./time";
import { TimeController } from "./time-controller";
import { isIAwake, isIFixedUpdate, isILateUpdate, isIStart, isIUpdate } from "./typeguard";

export class Engine {
  public readonly time: Time = new Time();
  public readonly timeController: TimeController = new TimeController();
  public readonly currentProject: ObservableNullableField<Project | null> = new ObservableNullableField();

  private _systems: ISystem[] = [];
  private _awakeSystems: IAwake[] = [];
  private _startSystems: IStart[] = [];
  private _fixedUpdateSystems: IFixedUpdate[] = [];
  private _updateSystems: IUpdate[] = [];
  private _lateUpdateSystems: ILateUpdate[] = [];
  private _animationFrameId: number | null = null;

  public constructor() {
    this.timeController.isRunning.subscribe(wasStarted => this.toggleSceneState(wasStarted));
    this.timeController.isPaused.subscribe(wasPaused => this.toggleLoopPause(wasPaused));
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
      this.currentProject.value?.activeScene.value?.saveState();
    }
    else {
      if(!this._animationFrameId) return;

      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
      this.currentProject.value?.activeScene.value?.restoreState();
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
  
    this.time.update();

    const scene = this.currentProject.value?.activeScene.value;
    if(!scene) return;

    const entities = scene.getEntities();
  
    const notAwakedEntities = entities.filter(entity => !entity.isAwaked);
    this._awakeSystems.forEach(system => system.awake(notAwakedEntities));
    notAwakedEntities.forEach(entity => entity.isAwaked = true);
  
    const notStartedEntities = entities.filter(entity => !entity.isStarted);
    this._startSystems.forEach(system => system.start(notStartedEntities));
    notStartedEntities.forEach(entity => entity.isStarted = true);
  
    this._fixedUpdateSystems.forEach(system => system.fixedUpdate(entities, this.time.deltaTime));
    this._updateSystems.forEach(system => system.update(entities, this.time.deltaTime));
    this._lateUpdateSystems.forEach(system => system.lateUpdate(entities, this.time.deltaTime));
  }; 
}