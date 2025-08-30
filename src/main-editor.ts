import { Camera } from './assets/components/camera';
import { Mesh } from './assets/components/mesh';
import { Transform } from './assets/components/transform';
import { OrbitSystem } from './assets/systems/orbitSystem';
import { RotateSystem } from './assets/systems/rotateSystem';
import { ObservableField } from './common/observer/observable-field';
import { Engine } from './core/engine/engine';
import { Storage } from './database/storage';
import { DeviceManager, GPUMesh, WebGPU } from './graphics/webgpu/webGPU';
import './styles.css';
import { EntityHandler } from './ui/editor/others/entity-handler';
import { InputHandler } from './ui/editor/others/input-handler';
import { Utils } from './ui/editor/others/utils';
import { Assets } from './ui/editor/sections/assets/assets';
import { Builder, Icons } from './ui/editor/sections/builder';
import { Console } from './ui/editor/sections/console/console';
import { Player } from './ui/editor/sections/controls/player';
import { Screen } from './ui/editor/sections/controls/screen';
import { Timescale } from './ui/editor/sections/controls/timescale';
import { Hierarchy } from './ui/editor/sections/hierarchy/hierarchy';
import { Inspector } from './ui/editor/sections/inspector/inspector';
import { SceneManager } from './ui/editor/sections/sceneManager/scenes';
import { Settings } from './ui/editor/sections/settings/settings';
import { Viewports } from './ui/editor/sections/viewports/viewports';
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

        const camera = engine.currentProject.value.activeScene.value.children.items.find(entity => entity.hasComponent(Transform) && entity.hasComponent(Camera))!;
        const inputHandler = new InputHandler(storage.preferences.editor);
        const viewports = new Viewports(canvasA,  canvasB, inputHandler, camera.getComponent(Transform));
        engine.timeController.isRunning.subscribe(() => viewports.toggleHighlight())      
        
        // const graphicEngine = new Open3DAdapter(engine);
        // graphicEngine.init(engine, canvasA, canvasB);

        const graphicEngine = new WebGPU();
        await graphicEngine.init(canvasA);
        const deviceManager = graphicEngine.getManager();

        const uniformData = new Float32Array(16);
        const uniformBuffer = deviceManager.createUniformBuffer(uniformData);
        const uniformBindGroup = deviceManager.createBindGroup(deviceManager.pipelineBindGroupLayout, uniformBuffer);

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
              const canvas = entry.target as HTMLCanvasElement;
              const width = entry.contentBoxSize[0].inlineSize;
              const height = entry.contentBoxSize[0].blockSize;
              canvas.width = Math.max(1, Math.min(width, deviceManager.device.limits.maxTextureDimension2D));
              canvas.height = Math.max(1, Math.min(height, deviceManager.device.limits.maxTextureDimension2D));
              deviceManager.resize(width, height);
              // re-render
              loop(0);
            }
        });
        observer.observe(canvasA);

        const vertices = new Float32Array([
            -1, -1, 0,  1, 0, 0,
             1, -1, 0,  0, 1, 0,
             1,  1, 0,  0, 0, 1,
            -1,  1, 0,  1, 1, 0
        ]);

        const indices = new Uint16Array([0,1,2,0,2,3]);
        const testQuad = deviceManager.createMesh(vertices, indices);

        function loop(time: number) {
            // câmera girando em torno da origem
            const eye = [Math.sin(time * 0.001) * 5, 0, Math.cos(time * 0.001) * 5];
            const target = [0, 0, 0];
            const up = [0, 1, 0];

            const view = lookAt(eye, target, up);
            const proj = perspectiveFovRH(Math.PI / 4, canvasA.width / canvasA.height, 0.01, 1000);
            const viewProj = multiplyColumnMajor(proj, view);

            deviceManager.queue.writeBuffer(uniformBuffer, 0, viewProj);

            deviceManager.render(uniformBindGroup, [testQuad]);

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        // function loop(time: number) {
        //     // Atualiza câmera
        //     // const eye = [Math.sin(time*0.001)*5, 0, Math.cos(time*0.001)*5];
        //     const eye = [0, 0, -5];
        //     const target = [0, 0, 0];
        //     const proj = perspectiveFovRH(Math.PI/4, canvasA.width/canvasA.height, 0.1, 100);
        //     const view = lookAt(eye, target, [0,1,0]);
        //     const viewProj = multiply(proj, view);

        //     deviceManager.queue.writeBuffer(uniformBuffer, 0, viewProj.buffer, viewProj.byteOffset, viewProj.byteLength);

        //     const entities = engine.currentProject.value.activeScene.value.descendants();
        //     const meshes = entities
        //         .filter(entity => entity.hasComponent(Mesh))
        //         .map(entity => entity.getComponent(Mesh));

        //     const gpuMeshes = meshes.map(mesh => createGPUMeshWithColor(deviceManager, mesh));

        //     deviceManager.render(uniformBindGroup, [testQuad]);

        //     requestAnimationFrame(loop);
        // }
        // requestAnimationFrame(loop);

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

        const scene = engine.currentProject.value.activeScene.value;
        if(!scene) return;

        const entityHandler = new EntityHandler(scene);
        const hierarchy = new Hierarchy(scene, entityHandler);

        const inspector = new Inspector(engine, entityHandler, hierarchy);
        const assets = new Assets();

        const player = new Player(engine.timeController);
        const timescale = new Timescale(engine.time);
        const screen = new Screen(engine.timeController, viewport);
        const settings = new Settings(storage, inputHandler);

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
        sceneManager.assign(this.leftDetails, groupStartLeft);
        
        inspector.assign(this.rightDetails, groupStartRight);
        console.assign(this.centerBotDetails, groupStartRight);

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

        console.log("All right! You can start now!")
    }
}

type GPUMeshData = {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  indexCount: number;
};

export function createGPUMesh(deviceManager: DeviceManager, mesh: Mesh): GPUMeshData {
  // Converte vertices em Float32Array (x, y, z, r, g, b)
  // Aqui você pode adicionar cores fixas ou campos extras se tiver
  const vertexArray = new Float32Array(mesh.vertices.items.length * 3);
  mesh.vertices.items.forEach((v, i) => {
    vertexArray[i*3 + 0] = v.x.value;
    vertexArray[i*3 + 1] = v.y.value;
    vertexArray[i*3 + 2] = v.z.value;
  });

  const indexArray = new Uint16Array(mesh.indices.items.length);
  mesh.indices.items.forEach((i, idx) => {
    indexArray[idx] = i.value;
  });

  const vertexBuffer = deviceManager.createBuffer({
    size: vertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });
  new Float32Array(vertexBuffer.getMappedRange()).set(vertexArray);
  vertexBuffer.unmap();

  const indexBuffer = deviceManager.createBuffer({
    size: indexArray.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });
  new Uint16Array(indexBuffer.getMappedRange()).set(indexArray);
  indexBuffer.unmap();

  return { vertexBuffer, indexBuffer, indexCount: indexArray.length };
}

function createGPUMeshWithColor(deviceManager: DeviceManager, mesh: Mesh): GPUMesh {
    const vertexCount = mesh.vertices.items.length;
    const vertexArray = new Float32Array(vertexCount * 6); // x,y,z + r,g,b

    mesh.vertices.items.forEach((v, i) => {
        vertexArray[i*6 + 0] = v.x.value;
        vertexArray[i*6 + 1] = v.y.value;
        vertexArray[i*6 + 2] = v.z.value;
        // cores fixas (exemplo)
        vertexArray[i*6 + 3] = 1.0; // r
        vertexArray[i*6 + 4] = 0.0; // g
        vertexArray[i*6 + 5] = 0.0; // b
    });

    const indexArray = new Uint16Array(mesh.indices.items.length);
    mesh.indices.items.forEach((i, idx) => {
        indexArray[idx] = i.value;
    });

    return deviceManager.createMesh(vertexArray, indexArray);
}


function perspectiveFovRH(fovY: number, aspect: number, near: number, far: number) {
  const f = 1.0 / Math.tan(fovY / 2);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, far / (near - far), (near * far) / (near - far),
    0, 0, -1, 0
  ]);
}


      function lookAt(eye: number[], target: number[], up: number[]) {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  return new Float32Array([
    x[0], x[1], x[2], -dot(x, eye),
    y[0], y[1], y[2], -dot(y, eye),
    z[0], z[1], z[2], -dot(z, eye),
    0,    0,    0,     1
  ]);
}


      function multiplyColumnMajor(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i + j*4] =
        a[0 + j*4] * b[i + 0*4] +
        a[1 + j*4] * b[i + 1*4] +
        a[2 + j*4] * b[i + 2*4] +
        a[3 + j*4] * b[i + 3*4];
    }
  }
  return out;
}


      function subtract(a: number[], b: number[]) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
      function cross(a: number[], b: number[]) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
      function dot(a: number[], b: number[]) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
      function normalize(v: number[]) { const l = Math.hypot(...v); return [v[0]/l,v[1]/l,v[2]/l]; }
