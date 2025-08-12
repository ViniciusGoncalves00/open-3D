import { OrbitSystem } from './assets/systems/orbitSystem';
import { RotateSystem } from './assets/systems/rotateSystem';
import { Engine } from './core/engine/engine';
import { Storage } from './database/storage';
import { GraphicSettings } from './graphics/graphicSettings';
import { Open3DAdapter } from './graphics/open3DAdapter';
import './styles.css';
import { EntityHandler } from './ui/others/entity-handler';
import { Utils } from './ui/others/utils';
import { Assets } from './ui/sections/assets/assets';
import { Section } from './ui/sections/base';
import { Builder, Icons } from './ui/sections/builder';
import { Console } from './ui/sections/console/console';
import { Player } from './ui/sections/controls/player';
import { Screen } from './ui/sections/controls/screen';
import { Timescale } from './ui/sections/controls/timescale';
import { Hierarchy } from './ui/sections/hierarchy/hierarchy';
import { Inspector } from './ui/sections/inspector/inspector';
import { SceneManager } from './ui/sections/sceneManager/scenes';
import { Settings } from './ui/sections/settings/settings';
import { Viewports } from './ui/sections/viewports/viewports';
import './ui/styles/time-controller.css';

window.addEventListener('DOMContentLoaded', () => {
    new Program();
});

export class Program {
    //#region [HTMLElements]
    public readonly overlay: HTMLDivElement;
    public readonly right: HTMLDivElement;
    public readonly rightButtons: HTMLDivElement;
    public readonly rightDetails: HTMLDivElement;
    public readonly center: HTMLDivElement;
    public readonly centerTop: HTMLDivElement;
    public readonly centerMid: HTMLDivElement;
    public readonly centerBot: HTMLDivElement;
    public readonly left: HTMLDivElement;
    public readonly leftButtons: HTMLDivElement;
    public readonly leftDetails: HTMLDivElement;
    //#endregion

    public constructor() {
        this.overlay = Utils.getElementOrFail<HTMLDivElement>("overlay");

        this.right = Utils.getElementOrFail<HTMLDivElement>("right");
        this.rightButtons = Utils.getElementOrFail<HTMLDivElement>("rightButtons");
        this.rightDetails = Utils.getElementOrFail<HTMLDivElement>("rightDetails");

        this.center = Utils.getElementOrFail<HTMLDivElement>("center");
        this.centerTop = Utils.getElementOrFail<HTMLDivElement>("centerTop");
        this.centerMid = Utils.getElementOrFail<HTMLDivElement>("centerMid");
        this.centerBot = Utils.getElementOrFail<HTMLDivElement>("centerBot");

        this.left = Utils.getElementOrFail<HTMLDivElement>("left");
        this.leftButtons = Utils.getElementOrFail<HTMLDivElement>("leftButtons");
        this.leftDetails = Utils.getElementOrFail<HTMLDivElement>("leftDetails");

        this.initialize();
    }

    private async initialize(): Promise<void> {
        //initialize database
        const storage = new Storage();
        await storage.init();

        //get params from url
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("projectId");
        const sceneId = params.get("sceneId");
        
        if(!projectId || !sceneId) return;
        
        //get params from url
        const project = await storage.loadProjectById(projectId);
        if(!project) return;
        project.SetActiveSceneById(sceneId);
        
        //set engine
        const engine = new Engine(project);
        engine.currentProject.value.scenes.subscribe({
            onAdd: () => storage.saveProject(engine.currentProject.value),
            onRemove: () => storage.saveProject(engine.currentProject.value)
        });

        const sceneManager = new SceneManager(engine.currentProject.value);
        
        const console = new Console();

        engine.timeController.isRunning.subscribe((wasStarted => {
                wasStarted ? console.log("Started.") : console.log("Stoped.");
                const project = engine.currentProject.value;
                if(!project) return;
                wasStarted ? storage.saveAll(project) : '';
            }
        ))

        engine.timeController.isPaused.subscribe((wasPaused => {
                wasPaused ? console.log("Paused.") : console.log("Unpaused.")
            }
        ))

        const viewport = Utils.getElementOrFail<HTMLElement>('viewport');
        const canvasA = document.createElement("canvas");
        canvasA.classList = "w-full h-full";
        viewport.appendChild(canvasA);
        const canvasB = document.createElement("canvas");
        canvasB.classList = "w-full h-full hidden";
        viewport.appendChild(canvasB);

        const viewports = new Viewports(canvasA,  canvasB);
        engine.timeController.isRunning.subscribe(() => viewports.toggleHighlight())      
        
        const graphicEngine = new Open3DAdapter();
        graphicEngine.init(engine, canvasA, canvasB);

        // graphicEngine.setEditorCamera(canvasA, {x: 10, y: 10, z: 10});
        // graphicEngine.setPreviewCamera(canvasB, {x: 0, y: 1, z: -10});

        // engine.timeController.isRunning.subscribe(() => graphicEngine.toggleActiveCamera());
        // engine.timeController.isPaused.subscribe(() => graphicEngine.toggleActiveCamera());

        // const observerA = new ResizeObserver(() => graphicEngine.resize(canvasA.clientHeight, canvasA.clientWidth));
        // observerA.observe(canvasA);  

        // const observerB = new ResizeObserver(() => graphicEngine.resize(canvasB.clientHeight, canvasB.clientWidth));
        // observerB.observe(canvasB);

        // graphicEngine.setFog({r: 0.02, g: 0.02, b: 0.02}, 0, 100);
        graphicEngine.setBackground(GraphicSettings.backgroundColor);
        graphicEngine.setGridHelper({r: 0.1, g: 0.1, b: 0.1});

        graphicEngine.startRender();

        const scene = engine.currentProject.value.activeScene.value;
        if(!scene) return;

        const entityHandler = new EntityHandler(scene);
        const hierarchy = new Hierarchy(scene, entityHandler);

        const inspector = new Inspector(engine, entityHandler, hierarchy);
        const assets = new Assets();

        const player = new Player(engine.timeController);
        const timescale = new Timescale(engine.time);
        const screen = new Screen(engine.timeController, viewport);

        const fpsContainer = Utils.getElementOrFail<HTMLElement>('fpsContainer');
        const averageFpsContainer = Utils.getElementOrFail<HTMLElement>('averageFpsContainer');

        if (fpsContainer) engine.time.framesPerSecond.subscribe(() => fpsContainer.innerHTML = `${engine.time.framesPerSecond.value.toString()} FPS`);
        if (averageFpsContainer) engine.time.averageFramesPerSecond.subscribe(() => averageFpsContainer.innerHTML = `${engine.time.averageFramesPerSecond.value.toString()} avgFPS`);


        //         const window = this.getElementOrFail<HTMLDivElement>("settingsOverlay");
//         const open = this.getElementOrFail<HTMLButtonElement>("openSettings");
//         const close = this.getElementOrFail<HTMLButtonElement>("closeSettings");
//         const autoSaveEnabledButton = this.getElementOrFail<HTMLButtonElement>("autoSaveEnabled");
//         const autoSaveIntervalInput = this.getElementOrFail<HTMLInputElement>("autoSaveInterval");

        // this._settings = new Settings(window, open, close, this._storage, autoSaveEnabledButton, autoSaveIntervalInput);

        const groupStartLeft = document.createElement("div");
        this.leftButtons.appendChild(groupStartLeft);

        const groupEndLeft = document.createElement("div");
        this.leftButtons.appendChild(groupEndLeft);

        const groupStartRight = document.createElement("div");
        this.rightButtons.appendChild(groupStartRight);

        const groupEndRight = document.createElement("div");
        this.rightButtons.appendChild(groupEndRight);

        hierarchy.assign(this.leftDetails, groupStartLeft);
        assets.assign(this.leftDetails, groupStartLeft);
        assets.toggle();
        sceneManager.assign(this.leftDetails, groupStartLeft);
        console.assign(this.leftDetails, groupStartLeft);
        
        inspector.assign(this.rightDetails, groupStartRight);

        const settings = Builder.sectionButton(Icons.Gear, () => '');
        groupEndLeft.appendChild(settings);

        const save = Builder.sectionButton(Icons.Floppy, () => storage.saveAll(project));
        groupEndLeft.appendChild(save);

        const linkedIn = Builder.sectionButton(Icons.LinkedIn, () => window.open("https://www.linkedin.com/in/viniciusgonçalves00/", "_blank"));
        const github = Builder.sectionButton(Icons.Github, () => window.open("https://github.com/ViniciusGoncalves00", "_blank"));
        const repository = Builder.sectionButton(Icons.Dice3, () => window.open("https://github.com/ViniciusGoncalves00/open-3D", "_blank"));
        groupEndRight.appendChild(linkedIn);
        groupEndRight.appendChild(github);
        groupEndRight.appendChild(repository);

        engine.registerSystem(new RotateSystem());
        engine.registerSystem(new OrbitSystem());

//         this.console.log("All right! You can start now!")
    }
}