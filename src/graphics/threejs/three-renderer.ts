import * as THREE from 'three';
import { IObserver } from '../../common/patterns/observer/observer';
import { ISubject } from '../../common/patterns/observer/subject';

export class RendererManager implements IObserver {
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private _active: boolean = false;
  public get isActive(): boolean { return this._active};

  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, canvas: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);
  
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
  }

  public resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
  
    this.renderer.setSize(width, height, false);
  }

  public render(scene: THREE.Scene, camera: THREE.Camera) {
    if (!this._active) return;
    this.renderer.render(scene, camera);
  }

  public setActive(value: boolean) {
    this._active = value;
  }

  public onNotify(subject: ISubject, args?: string[]) {
    // Placeholder: pode ser usado para reagir a notificações futuras
  }

  public update(deltaTime: number): void {
    // Placeholder
  }
}