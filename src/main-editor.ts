import './styles.css';
import './ui/styles/time-controller.css';

import { Engine } from './core/engine/engine';
import { Timescale } from './ui/sections/controls/timescale';
import { Console } from './ui/sections/console/console';
import { RotateSystem } from './assets/systems/rotateSystem';
import { OrbitSystem } from './assets/systems/orbitSystem';
import { EntityHandler } from './ui/handlers/entity-handler';
import { Hierarchy } from './ui/sections/hierarchy/hierarchy';
import { Inspector } from './ui/sections/inspector/inspector';
import { Tree } from './ui/components/assets/tree';
import { FolderNode } from './common/tree/folder-node';
import { FileNode } from './common/tree/file-node';
import { LogType } from './core/api/enum/log-type';
import { Viewports } from './ui/sections/viewports/viewports';
import { IGraphicEngine } from './graphics/IGraphicEngine';
import { ThreeGEAdapter } from './graphics/threeGEAdapter';
import { Player } from './ui/sections/controls/player';
import { Screen } from './ui/sections/controls/screen';
import { Storage } from './core/persistence/storage';
import { Settings } from './ui/sections/settings/settings';
import { Open3DAdapter } from './graphics/open3DAdapter';
import { GraphicSettings } from './graphics/graphicSettings';
import { Project } from './core/engine/project';
import { SceneManager } from './ui/sections/sceneManager/scenes';

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

    public play!: HTMLButtonElement;
    public stop!: HTMLButtonElement;
    public pause!: HTMLButtonElement;
    public speedUp!: HTMLButtonElement;
    public speedNormal!: HTMLButtonElement;
    public speedDown!: HTMLButtonElement;
    public fullScreen!: HTMLButtonElement;

    public save!: HTMLButtonElement;
    //#endregion

    //#region [HTMLElements]
    private console!: Console

    private _inspector!: Inspector;
    public get inspector(): Inspector { return this._inspector; }

    private _tree!: Tree;
    public get tree(): Tree { return this._tree; }

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
        await this.initializeStorage();

        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("projectId");
        const sceneId = params.get("sceneId");
        
        if(!projectId || !sceneId) return;
        
        const project = await this._storage.loadProjectById(projectId);
        if(!project) return;
        project.SetActiveSceneById(sceneId);
        
        this.initializeEngine(project);
        this.initializeScenes();
        
        this.save = this.getElementOrFail<HTMLButtonElement>('save')
        this.save.addEventListener("click", () => this._storage.saveAll(project));
        
        this.initializeConsole();

        this.initializeCanvas();        
        this.initializeGraphicEngine();
        
        const scene = this.engine.currentProject.value.activeScene.value;
        if(!scene) return;

        this._entityHandler = new EntityHandler(scene);
        
        this.initializeHierarchy();
        this.initializeInspector(this.engine, this.entityHandler, this.hierarchy);

        this.initializeAssets();

        this.initializePlayer();
        this.initializeTimescale();
        this.initializeScreen();

        this.fpsContainer = this.getElementOrFail<HTMLElement>('fpsContainer');
        this.averageFpsContainer = this.getElementOrFail<HTMLElement>('averageFpsContainer');

        if (this.fpsContainer) this.engine.time.framesPerSecond.subscribe(() => this.fpsContainer.innerHTML = `${this.engine.time.framesPerSecond.value.toString()} FPS`);
        if (this.averageFpsContainer) this.engine.time.averageFramesPerSecond.subscribe(() => this.averageFpsContainer.innerHTML = `${this.engine.time.averageFramesPerSecond.value.toString()} avgFPS`);


        this.initializeSettings();

        this.initializeTEMP();

        this.console.log("All right! You can start now!")
    }

    private initializeEngine(project: Project): void {
        this.engine = new Engine(project);
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

    private initializeConsole(): void {
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
    };

    private initializeHierarchy(): void {
        this.entitiesContainer = this.getElementOrFail<HTMLElement>('entitiesContainer');
        
        this._hierarchy = new Hierarchy(
            this.engine.currentProject.value.activeScene.value,
            this.entitiesContainer,
            this.entityHandler
        );

        const scene = this.engine.currentProject.value?.activeScene.value;
        if (!scene) return;

        scene.children.subscribe({
            onAdd: (entity) => this._hierarchy.constructHierarchy(),
            onRemove: (entity) => this._hierarchy.constructHierarchy()
        });
        this._hierarchy.constructHierarchy();

        const newEntity = this.getElementOrFail<HTMLElement>('newEntity');
        newEntity.addEventListener("click", () => this.entityHandler.addEntity());
    }

    private async initializeStorage(): Promise<void>  {
        this._storage = new Storage(this.engine, this.console);
        await this._storage.init();
    }

    private initializeSettings(): void {
        const window = this.getElementOrFail<HTMLDivElement>("settingsOverlay");
        const open = this.getElementOrFail<HTMLButtonElement>("openSettings");
        const close = this.getElementOrFail<HTMLButtonElement>("closeSettings");
        const autoSaveEnabledButton = this.getElementOrFail<HTMLButtonElement>("autoSaveEnabled");
        const autoSaveIntervalInput = this.getElementOrFail<HTMLInputElement>("autoSaveInterval");

        this._settings = new Settings(window, open, close, this._storage, autoSaveEnabledButton, autoSaveIntervalInput);
    };

    private initializeAssets(): void {
        this.assetsContainer = this.getElementOrFail<HTMLElement>('assetsContainer');
        this._tree = new Tree(this.assetsContainer);

        // (async () => {
        //     const rootNode = await this.loadAssets();
        //     this._tree.addChild(rootNode);
        // })();
    };

    private initializeInspector(engine: Engine, handler: EntityHandler, hierarchy: Hierarchy): void {
        this.inspectorContainer = this.getElementOrFail<HTMLElement>('inspectorContainer');
        this._inspector = new Inspector(this.inspectorContainer, engine, handler, hierarchy);
    };

    private initializePlayer(): void {
        this.play = this.getElementOrFail<HTMLButtonElement>('play');
        this.stop = this.getElementOrFail<HTMLButtonElement>('stop');
        this.pause = this.getElementOrFail<HTMLButtonElement>('pause');

        this._player = new Player(this.engine.timeController, this.play, this.stop, this.pause);
    };


    private initializeTimescale(): void {
        this.speedUp = this.getElementOrFail<HTMLButtonElement>('speedUp');
        this.speedNormal = this.getElementOrFail<HTMLButtonElement>('speedNormal');
        this.speedDown = this.getElementOrFail<HTMLButtonElement>('speedDown');

        this._timescale = new Timescale(this.engine.time, this.speedUp, this.speedNormal, this.speedDown);
    };

    private initializeScreen(): void {
        this.fullScreen = this.getElementOrFail<HTMLButtonElement>('fullScreen');

        this._screen = new Screen(this.engine.timeController, this.viewportSceneContainer, this.fullScreen);
    };

    private initializeCanvas(): void {
        this.viewportEditorContainer = this.getElementOrFail<HTMLElement>('viewportEditorContainer');
        this.canvasA = this.getElementOrFail<HTMLCanvasElement>('canvasA');
        this.viewportSceneContainer = this.getElementOrFail<HTMLElement>('viewportSceneContainer');
        this.canvasB = this.getElementOrFail<HTMLCanvasElement>('canvasB');

        this._scenes = new Viewports(this.viewportEditorContainer,  this.viewportSceneContainer);
        this.engine.timeController.isRunning.subscribe(() => this._scenes.toggleHighlight())
    };

    private initializeScenes(): void {
        const newScene = this.getElementOrFail<HTMLElement>('newScene');
        newScene.addEventListener("click", () => {
            const scene = this.engine.currentProject.value.CreateScene();
            this.engine.currentProject.value.SetActiveScene(scene);
            window.location.href = `editor.html?projectId=${this.engine.currentProject.value.id}&sceneId=${scene.id}`;
        });
        
        this.engine.currentProject.value.scenes.subscribe({
            onAdd: () => this.storage.saveProject(this.engine.currentProject.value),
            onRemove: () => this.storage.saveProject(this.engine.currentProject.value)
        });
        
        const sceneManagerContainer = this.getElementOrFail<HTMLElement>('sceneManagerContainer');
        this._sceneManager = new SceneManager(sceneManagerContainer, this.engine.currentProject.value);
    }

    private getElementOrFail<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            this.console.log(`failed to load container: '${id}' -> ${element}`, LogType.Error);
            throw new Error(`UI element '${id}' not found`);
        }
        return element as T;
    }

    private async loadAssets(): Promise<FolderNode | FileNode<any>> {
        const assetsJson = localStorage.getItem("assets");

        if (assetsJson) {
            this.console.log("loading assets from local storage...", LogType.Log);
            try {
                const root = this.deserializeTree(JSON.parse(assetsJson));
                this.console.log("assets loaded successfully.", LogType.Success);
                return root;
            } catch (e) {
                this.console.log("failed to parse local assets. Fetching from remote...", LogType.Warning);
                return await this.fetchAndLoadAssetsFromRepo();
            }
        } else {
            this.console.log("there are no assets in local storage. Loading from remote...", LogType.Log);
            return await this.fetchAndLoadAssetsFromRepo();
        }
    }

    private async fetchAndLoadAssetsFromRepo(): Promise<FolderNode | FileNode<any>> {
        try {
            const response = await fetch("dist/assets.json");
            const data = await response.json();

            const root = this.deserializeTree(data);
            localStorage.setItem("assets", JSON.stringify(data));
            this.console.log("assets loaded from remote and saved to localStorage.", LogType.Success);
            return root;
        } catch (error) {
            this.console.log("failed to fetch assets from remote.", LogType.Warning);
            console.error(error);
            throw error;
        }
    }


    private deserializeTree(obj: any): FolderNode | FileNode<any> {
        if (!obj.children) return new FileNode(obj.name, obj.content);

        const folder = new FolderNode(obj.name);
        for (const child of obj.children) {
            const node = this.deserializeTree(child);
            folder.addChild(node);
        }
        return folder;
    }
}