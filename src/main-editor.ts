import './styles.css';
import './ui/styles/time-controller.css';

import { Engine } from './core/engine/engine';
import { Timescale } from './ui/windows/controls/timescale';
import { Console } from './ui/windows/console/console';
import { RotateSystem } from './assets/systems/rotateSystem';
import { OrbitSystem } from './assets/systems/orbitSystem';
import { EntityHandler } from './ui/others/entity-handler';
import { Hierarchy } from './ui/windows/hierarchy/hierarchy';
import { Inspector } from './ui/windows/inspector/inspector';
import { Tree } from './ui/windows/assets/tree';
import { FolderNode } from './common/tree/folder-node';
import { FileNode } from './common/tree/file-node';
import { LogType } from './core/api/enum/log-type';
import { Viewports } from './ui/windows/viewports/viewports';
import { IGraphicEngine } from './graphics/IGraphicEngine';
import { ThreeGEAdapter } from './graphics/threeGEAdapter';
import { Player } from './ui/windows/controls/player';
import { Screen } from './ui/windows/controls/screen';
import { Storage } from './database/storage';
import { Settings } from './ui/windows/settings/settings';
import { Open3DAdapter } from './graphics/open3DAdapter';
import { GraphicSettings } from './graphics/graphicSettings';
import { Project } from './core/engine/project';
import { SceneManager } from './ui/windows/sceneManager/scenes';
import { Assets } from './ui/windows/assets/assets';

window.addEventListener('DOMContentLoaded', () => {
    new Program();
});

export class Program {
    public readonly devMode: boolean;
    public engine!: Engine;
    public graphicEngine!: IGraphicEngine;

    //#region [HTMLElements]
    public consoleContent!: HTMLElement;

    public viewportEditorContainer!: HTMLElement;
    public canvasA!: HTMLCanvasElement;

    public viewportSceneContainer!: HTMLElement;
    public canvasB!: HTMLCanvasElement;

    public entitiesContainer!: HTMLElement;
    public inspectorContainer!: HTMLElement;
    public assetsContainer!: HTMLElement;
    public fpsContainer!: HTMLElement;
    public averageFpsContainer!: HTMLElement;

    public save!: HTMLButtonElement;
    //#endregion

    //#region [HTMLElements]
    private console!: Console

    private _inspector!: Inspector;
    public get inspector(): Inspector { return this._inspector; }

    private _assets!: Assets;
    public get assets(): Assets { return this._assets; }

    private _hierarchy!: Hierarchy;
    public get hierarchy(): Hierarchy { return this._hierarchy; }

    private _timescale!: Timescale;
    public get timescale(): Timescale { return this._timescale; }
    
    private _player!: Player;
    public get player(): Player { return this._player; }

    private _screen!: Screen;
    public get screen(): Screen { return this._screen; }

    private _scenes!: Viewports;
    public get scenes(): Viewports { return this._scenes; }

    private _entityHandler!: EntityHandler;
    private get entityHandler(): EntityHandler { return this._entityHandler; }

    private _storage!: Storage;
    private get storage(): Storage { return this._storage; }

    private _settings!: Settings;
    private get settings(): Settings { return this._settings; }

    private _sceneManager!: SceneManager;
    //#endregion

    public constructor(devMode: boolean = false) {
        this.devMode = devMode;

        this.initialize();
    }

    private async initialize(): Promise<void> {
        this._storage = new Storage(this.engine, this.console);
        await this._storage.init();

        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("projectId");
        const sceneId = params.get("sceneId");
        
        if(!projectId || !sceneId) return;
        
        const project = await this._storage.loadProjectById(projectId);
        if(!project) return;
        project.SetActiveSceneById(sceneId);
        
        this.engine = new Engine(project);
        this.engine.currentProject.value.scenes.subscribe({
            onAdd: () => this.storage.saveProject(this.engine.currentProject.value),
            onRemove: () => this.storage.saveProject(this.engine.currentProject.value)
        });

        this._sceneManager = new SceneManager(this.engine.currentProject.value);
        
        this.save = this.getElementOrFail<HTMLButtonElement>('save')
        this.save.addEventListener("click", () => this._storage.saveAll(project));
        
        this.console = new Console();
        this.engine.timeController.isRunning.subscribe((wasStarted => {
                wasStarted ? this.console.log("Started.") : this.console.log("Stoped.");
                const project = this.engine.currentProject.value;
                if(!project) return;
                wasStarted ? this._storage.saveAll(project) : '';
            }
        ))

        this.engine.timeController.isPaused.subscribe((wasPaused => {
                wasPaused ? this.console.log("Paused.") : this.console.log("Unpaused.")
            }
        ))

        this.initializeCanvas();        
        this.initializeGraphicEngine();
        
        const scene = this.engine.currentProject.value.activeScene.value;
        if(!scene) return;

        this._entityHandler = new EntityHandler(scene);
        this._hierarchy = new Hierarchy(this.engine.currentProject.value.activeScene.value, this.entityHandler);
        this._inspector = new Inspector(this.engine, this.entityHandler, this.hierarchy);
        this._assets = new Assets();
        this._player = new Player(this.engine.timeController);
        this._timescale = new Timescale(this.engine.time);
        this._screen = new Screen(this.engine.timeController, this.viewportSceneContainer);

        this.fpsContainer = this.getElementOrFail<HTMLElement>('fpsContainer');
        this.averageFpsContainer = this.getElementOrFail<HTMLElement>('averageFpsContainer');

        if (this.fpsContainer) this.engine.time.framesPerSecond.subscribe(() => this.fpsContainer.innerHTML = `${this.engine.time.framesPerSecond.value.toString()} FPS`);
        if (this.averageFpsContainer) this.engine.time.averageFramesPerSecond.subscribe(() => this.averageFpsContainer.innerHTML = `${this.engine.time.averageFramesPerSecond.value.toString()} avgFPS`);


        this.initializeSettings();

        this.initializeTEMP();

        this.console.log("All right! You can start now!")
    }

    private initializeGraphicEngine(): void {
        this.graphicEngine = new Open3DAdapter();

        this.graphicEngine.init(this.engine, this.canvasA, this.canvasB);

        this.graphicEngine.setEditorCamera(this.canvasA, {x: 10, y: 10, z: 10});
        this.graphicEngine.setPreviewCamera(this.canvasB, {x: 0, y: 1, z: -10});

        this.engine.timeController.isRunning.subscribe(() => this.graphicEngine.toggleActiveCamera());
        this.engine.timeController.isPaused.subscribe(() => this.graphicEngine.toggleActiveCamera());

        const observerA = new ResizeObserver(() => this.graphicEngine.resize(this.canvasA.clientHeight, this.canvasA.clientWidth));
        observerA.observe(this.canvasA);  

        const observerB = new ResizeObserver(() => this.graphicEngine.resize(this.canvasB.clientHeight, this.canvasB.clientWidth));
        observerB.observe(this.canvasB);

        this.graphicEngine.setFog({r: 0.02, g: 0.02, b: 0.02}, 0, 100);
        this.graphicEngine.setBackground(GraphicSettings.backgroundColor);
        this.graphicEngine.setGridHelper({r: 0.1, g: 0.1, b: 0.1, a: 1});

        this.graphicEngine.startRender();
    }

    private initializeTEMP(): void {
        this.engine.registerSystem(new RotateSystem());
        this.engine.registerSystem(new OrbitSystem());
    };

    private initializeSettings(): void {
        const window = this.getElementOrFail<HTMLDivElement>("settingsOverlay");
        const open = this.getElementOrFail<HTMLButtonElement>("openSettings");
        const close = this.getElementOrFail<HTMLButtonElement>("closeSettings");
        const autoSaveEnabledButton = this.getElementOrFail<HTMLButtonElement>("autoSaveEnabled");
        const autoSaveIntervalInput = this.getElementOrFail<HTMLInputElement>("autoSaveInterval");

        this._settings = new Settings(window, open, close, this._storage, autoSaveEnabledButton, autoSaveIntervalInput);
    };

    private initializeCanvas(): void {
        this.viewportEditorContainer = this.getElementOrFail<HTMLElement>('viewportEditorContainer');
        this.canvasA = this.getElementOrFail<HTMLCanvasElement>('canvasA');
        this.viewportSceneContainer = this.getElementOrFail<HTMLElement>('viewportSceneContainer');
        this.canvasB = this.getElementOrFail<HTMLCanvasElement>('canvasB');

        this._scenes = new Viewports(this.viewportEditorContainer,  this.viewportSceneContainer);
        this.engine.timeController.isRunning.subscribe(() => this._scenes.toggleHighlight())
    };

    private getElementOrFail<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            this.console.log(`failed to load container: '${id}' -> ${element}`, LogType.Error);
            throw new Error(`UI element '${id}' not found`);
        }
        return element as T;
    }
}