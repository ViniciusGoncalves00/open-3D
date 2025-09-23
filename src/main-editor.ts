import { MathUtils, VectorUtils } from 'ts-math-utils';
import { Camera } from './assets/components/camera';
import { Mesh } from './assets/components/mesh';
import { Transform } from './assets/components/transform';
import { OrbitSystem } from './assets/systems/orbitSystem';
import { RotateSystem } from './assets/systems/rotateSystem';
import { ObservableField } from './common/observer/observable-field';
import { Engine } from './core/engine/engine';
import { Storage } from './database/storage';
// import { GPUMesh, WebGPUBuilder } from './graphics/webgpu/webGPUutils';
import './styles.css';
import { EntityHandler } from './ui/editor/others/entity-handler';
import { InputHandler } from './ui/editor/others/input-handler';
import { Utils } from './ui/editor/others/utils';
import { Assets } from './ui/editor/sections/assets/assets';
import { Builder, Icons } from './ui/editor/sections/builder';
import { ConsoleLogger } from './ui/editor/sections/console/console-logger';
import { Player } from './ui/editor/sections/controls/player';
import { Screen } from './ui/editor/sections/controls/screen';
import { Timescale } from './ui/editor/sections/controls/timescale';
import { Hierarchy } from './ui/editor/sections/hierarchy/hierarchy';
import { Inspector } from './ui/editor/sections/inspector/inspector';
import { SceneManager } from './ui/editor/sections/sceneManager/scenes';
import { Settings } from './ui/editor/sections/settings/settings';
import { Viewports } from './ui/editor/sections/viewports/viewports';
import './ui/styles/time-controller.css';
import { mat4 } from 'gl-matrix';
import { Renderer } from './graphics/webgpu/renderer';
import { Time } from './core/engine/time';
import { RendererManager } from './graphics/webgpu/renderer-manager';
import { Light } from './assets/components/abstract/light';
import { DirectionalLight } from './assets/components/directional-light';
import { Registry } from './core/engine/registry';
import { EntityManager } from './core/engine/entity-manager';

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
    public readonly centerBotDetails: HTMLDivElement;
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
        this.centerBotDetails = Utils.getElementOrFail<HTMLDivElement>("centerBotDetails");

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
        
        const consoleLogger = new ConsoleLogger();

        engine.timeController.isRunning.subscribe((wasStarted => {
                wasStarted ? ConsoleLogger.log("Started.") : ConsoleLogger.log("Stoped.");
                const project = engine.currentProject.value;
                if(!project) return;
                wasStarted ? storage.saveAll(project) : '';
            }
        ))

        engine.timeController.isPaused.subscribe((wasPaused => {
                wasPaused ? ConsoleLogger.log("Paused.") : ConsoleLogger.log("Unpaused.")
            }
        ))

        const viewport = Utils.getElementOrFail<HTMLElement>('viewport');
        const canvasA = document.createElement("canvas");
        canvasA.classList = "w-full h-full";
        viewport.appendChild(canvasA);
        const canvasB = document.createElement("canvas");
        canvasB.classList = "w-full h-full hidden";
        viewport.appendChild(canvasB);

        const camera = engine.currentProject.value.activeScene.value.children.items.find(entity => entity.hasComponent(Transform) && entity.hasComponent(Camera))!;
        const inputHandler = new InputHandler(storage.preferences.editor);
        const viewports = new Viewports(canvasA,  canvasB, inputHandler, camera.getComponent(Transform));
        engine.timeController.isRunning.subscribe(() => viewports.toggleHighlight())      
        
        // const graphicEngine = new Open3DAdapter(engine);
        // graphicEngine.init(engine, canvasA, canvasB);

//         const graphicEngine = new WebGPU();
//         await graphicEngine.init(canvasA);
//         const deviceManager = graphicEngine.getManager();

//         const uniformData = new Float32Array(32);
//         const uniformBuffer = deviceManager.createUniformBuffer(uniformData);
//         const uniformBindGroup = deviceManager.createBindGroup(deviceManager.pipelineBindGroupLayout, uniformBuffer);

//         const observer = new ResizeObserver(entries => {
//             for (const entry of entries) {
//                 const canvas = entry.target as HTMLCanvasElement;
//                 const width = entry.contentBoxSize[0].inlineSize;
//                 const height = entry.contentBoxSize[0].blockSize;
//                 const w = Math.max(1, Math.min(width, deviceManager.device.limits.maxTextureDimension2D));
//                 const h = Math.max(1, Math.min(height, deviceManager.device.limits.maxTextureDimension2D));
//                 canvas.width = w;
//                 canvas.height = h;
//                 deviceManager.resize(w, h);
//                 loop(0);
//             }
//         });
//         observer.observe(canvasA);

//         const cameraCamera = camera.getComponent(Camera);
//         const cameraTransform = camera.getComponent(Transform);

//         function loop(time: number) {
//             deviceManager.render(cameraCamera, cameraTransform, scene);
//             requestAnimationFrame(loop);
// //     const viewProj = cameraCamera.viewProjection(cameraTransform);
// // const gpuMeshes: GPUMesh[] = [];
// // for (const entity of scene.descendants()) {
// //     const mesh = entity.getComponent(Mesh);
// //     if (!mesh) continue;
// //     const gpuMeshArray = deviceManager.createMeshFromMesh(mesh);
// //     gpuMeshes.push(...gpuMeshArray);
// // }

// //     let i = 0;
// //     for (const entity of scene.descendants()) {
// //         const transform = entity.getComponent(Transform);
// //         const mesh = entity.getComponent(Mesh);
// //         if (!mesh) continue;

// //         transform.updateWorldMatrix();
// //         const modelMatrix = transform.worldMatrix.value;

// //         // Escreve model e viewProj no uniform
// //         uniformData.set(modelMatrix, 0);
// //         uniformData.set(viewProj, 16);
// //         deviceManager.queue.writeBuffer(uniformBuffer, 0, uniformData);

// //         // Renderiza os meshes GPU desse entity
// //         const gpuMeshArray = deviceManager.createMeshFromMesh(mesh); // <-- deve ser cacheado
// //         for (const gpuMesh of gpuMeshArray) {
// //             deviceManager.render(uniformBindGroup, [gpuMesh]);
// //         }
// //         i++;
// //     }
// }

//         requestAnimationFrame(loop);

        // graphicEngine.setEditorCamera(canvasA, {x: 10, y: 10, z: 10});
        // graphicEngine.setPreviewCamera(canvasB, {x: 0, y: 1, z: -10});

        // engine.timeController.isRunning.subscribe(() => graphicEngine.toggleActiveCamera());
        // engine.timeController.isPaused.subscribe(() => graphicEngine.toggleActiveCamera());

        // const observerA = new ResizeObserver(() => graphicEngine.resize(canvasA.clientHeight, canvasA.clientWidth));
        // observerA.observe(canvasA);  

        // const observerB = new ResizeObserver(() => graphicEngine.resize(canvasB.clientHeight, canvasB.clientWidth));
        // observerB.observe(canvasB);

        // graphicEngine.setFog({r: 0.02, g: 0.02, b: 0.02}, 0, 100);
        // graphicEngine.setBackground(GraphicSettings.backgroundColor);
        // graphicEngine.setGridHelper({r: 0.1, g: 0.1, b: 0.1});

        // graphicEngine.startRender();

        const cameraCamera = camera.getComponent(Camera);
        const cameraTransform = camera.getComponent(Transform);
        const light = engine.currentProject.value.activeScene.value.children.items.filter(entity => entity.hasComponent(DirectionalLight)).map(entity => entity.getComponent(DirectionalLight))

        const adapter = await navigator.gpu.requestAdapter();
        if(!adapter) {
            console.log("Adapter cannot be found.");
            return;
        } 

        const device = await adapter.requestDevice()

        const rendererManager = new RendererManager(device);
        const renderer = new Renderer(rendererManager, device, canvasA, rendererManager.pipelines.get("world")!, cameraCamera, cameraTransform, light);
        rendererManager.renderers.set("renderer", renderer);

        const loop = () => {
            renderer.render();
            requestAnimationFrame(loop);
        }
        loop();

        const scene = engine.currentProject.value.activeScene.value;
        if(!scene) return;

        const entityHandler = new EntityHandler(scene, rendererManager);

        const hierarchy = new Hierarchy(scene, entityHandler);

        const inspector = new Inspector(engine, entityHandler, hierarchy);
        const assets = new Assets();

        const player = new Player(engine.timeController);
        const timescale = new Timescale();
        const screen = new Screen(engine.timeController, viewport);
        const settings = new Settings(storage, inputHandler);

        const fpsContainer = Utils.getElementOrFail<HTMLElement>('fpsContainer');
        const averageFpsContainer = Utils.getElementOrFail<HTMLElement>('averageFpsContainer');

        if (fpsContainer) Time.framesPerSecond.subscribe(() => fpsContainer.innerHTML = `${Time.framesPerSecond.value.toString()} FPS`);
        if (averageFpsContainer) Time.averageFramesPerSecond.subscribe(() => averageFpsContainer.innerHTML = `${Time.averageFramesPerSecond.value.toString()} avgFPS`);

        EntityManager.initialize(scene, scene.descendants());
        Registry.initialize(device, rendererManager.pipelines.get("world")!);

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
        sceneManager.assign(this.leftDetails, groupStartLeft);
        
        inspector.assign(this.rightDetails, groupStartRight);
        ConsoleLogger.assign(this.centerBotDetails, groupStartRight);

        const settingsButton = Builder.sectionButton(Icons.Gear, () => settings.toggle());
        groupEndLeft.appendChild(settingsButton);

        const save = Builder.sectionButton(Icons.Floppy, () => storage.saveAll(project));
        groupEndLeft.appendChild(save);

        const github = Builder.sectionButton(Icons.Github, () => window.open("https://github.com/ViniciusGoncalves00/open-3D", "_blank"), new ObservableField(false), "Report Github Issues");
        const discord = Builder.sectionButton(Icons.Discord, () => window.open("https://discord.gg/pFpWD7dr", "_blank"), new ObservableField(false), "Join our Discord server!");
        const linkedIn = Builder.sectionButton(Icons.LinkedIn, () => window.open("https://www.linkedin.com/in/viniciusgonçalves00/", "_blank"), new ObservableField(false), "Check author LinkedIn");

        groupEndRight.appendChild(github);
        groupEndRight.appendChild(discord);
        groupEndRight.appendChild(linkedIn);

        engine.registerSystem(new RotateSystem());
        engine.registerSystem(new OrbitSystem());

        document.addEventListener('contextmenu', event => {
            event.preventDefault();
        });

        ConsoleLogger.log("All right! You can start now!")
    }
}