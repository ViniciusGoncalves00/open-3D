import { vec3, mat4, quat } from "gl-matrix";
import { Transform } from "../../assets/components/transform";

type DegEuler = { x: number; y: number; z: number };

const EPS = 1e-6;
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const rad2deg = (r: number) => (r * 180) / Math.PI;
const deg2rad = (d: number) => (d * Math.PI) / 180;

/**
 * Extrai Euler XYZ (intrínseco) em radianos a partir da parte de rotação de uma mat4 (column-major).
 * Convecção: col0 = right, col1 = up, col2 = forwardLocal->world (aqui usamos -forward).
 */
function mat4ToEulerXYZRadians(m: mat4): vec3 {
  // Elementos da rotação (m[row + col*4])
  const m00 = m[0],  m01 = m[4],  m02 = m[8];
  const m10 = m[1],  m11 = m[5],  m12 = m[9];
  const m20 = m[2],  m21 = m[6],  m22 = m[10];

  let x: number, y: number, z: number;

  // y = asin(-m20)
  const sy = -m20;
  if (Math.abs(sy) < 1 - 1e-10) {
    y = Math.asin(sy);
    x = Math.atan2(m21, m22);
    z = Math.atan2(m10, m00);
  } else {
    // Gimbal: y ≈ ±90°
    y = Math.asin(sy);
    x = 0;
    // z resolve pela outra coluna
    z = Math.atan2(-m01, m11);
  }

  return vec3.fromValues(x, y, z);
}

export interface OrbitOptions {
  sensitivityDegPerPx?: number; // sensibilidade em graus por pixel (padrão 0.25)
  worldUp?: vec3;               // eixo Y do mundo
  minPitchDeg?: number;         // limite inferior do pitch (padrão -89.9)
  maxPitchDeg?: number;         // limite superior do pitch (padrão +89.9)
  invertY?: boolean;            // inverte movimento vertical do mouse (padrão: false)
  rollWith?: "middle" | "ctrl" | "alt"; // como acionar roll (padrão: "ctrl")
}

/**
 * Controlador de órbita. Mantém estado de yaw/pitch/roll e raio, e calcula posição + Euler XYZ (graus).
 * - Botão esquerdo: yaw/pitch
 * - Roll: segure CTRL (padrão) OU use botão do meio/ALT conforme `rollWith`
 */
export class OrbitController {
  target: vec3;
  radius: number;
  yaw: number;   // rad (azimute em torno do worldUp)
  pitch: number; // rad (elevação)
  roll: number;  // rad (rotação em torno do eixo de visão)
  worldUp: vec3;

  private sensitivity: number; // rad por pixel
  private minPitch: number;
  private maxPitch: number;
  private invertY: boolean;
  private rollWith: OrbitOptions["rollWith"];

  constructor(position: vec3, target: vec3, opts?: OrbitOptions) {
    this.target = vec3.clone(target);
    this.worldUp = vec3.normalize(vec3.create(), opts?.worldUp ?? vec3.fromValues(0, 1, 0));

    const offset = vec3.sub(vec3.create(), position, target);
    this.radius = Math.max(vec3.length(offset), EPS);

    // Esféricas a partir da posição atual
    // yaw: atan2(x, z) — gira em torno de Y
    this.yaw = Math.atan2(offset[0], offset[2]);
    // pitch: asin(y / r) — elevação
    this.pitch = Math.asin(clamp(offset[1] / this.radius, -1, 1));
    this.roll = 0;

    const sensDeg = opts?.sensitivityDegPerPx ?? 0.25;
    this.sensitivity = deg2rad(sensDeg);
    this.minPitch = deg2rad(opts?.minPitchDeg ?? -89.9);
    this.maxPitch = deg2rad(opts?.maxPitchDeg ?? +89.9);
    this.invertY = !!opts?.invertY;
    this.rollWith = opts?.rollWith ?? "ctrl";
  }

  /**
   * Processa UM evento de mouse e retorna pose atualizada.
   * - Use `event.buttons & 1` (botão esquerdo) para yaw/pitch.
   * - Para ROLL: segure CTRL (padrão) OU botão do meio/ALT conforme `rollWith`.
   */
  public handleMouseEvent(event: MouseEvent): {
    position: vec3;
    eulerDeg: DegEuler;  // XYZ (graus)
    right: vec3;
    up: vec3;
    forward: vec3;       // direção de visão (da câmera para o alvo)
  } {
    const dx = event.movementX || 0;
    const dy = event.movementY || 0;

    // Yaw/Pitch: botão esquerdo
    if (event.buttons & 1) {
      this.yaw += dx * this.sensitivity;
      const signY = this.invertY ? -1 : 1;
      this.pitch += (-dy * this.sensitivity) * signY;
      this.pitch = clamp(this.pitch, this.minPitch, this.maxPitch);
    }

    // Roll (opcional): CTRL (padrão) ou botão do meio / ALT
    const rollByCtrl = this.rollWith === "ctrl" && event.ctrlKey;
    const rollByMiddle = this.rollWith === "middle" && (event.buttons & 4) !== 0;
    const rollByAlt = this.rollWith === "alt" && event.altKey;

    if (rollByCtrl || rollByMiddle || rollByAlt) {
      this.roll += dx * this.sensitivity; // gira ao arrastar na horizontal
    }

    return this.computePose();
  }

  /**
   * Recalcula posição/orientação a partir de yaw/pitch/roll atuais.
   * Mantém a câmera olhando para o `target`.
   */
  public computePose(): {
    position: vec3;
    eulerDeg: DegEuler;
    right: vec3;
    up: vec3;
    forward: vec3;
  } {
    // Posição em esféricas (referência: yaw em torno de Y)
    const cosP = Math.cos(this.pitch);
    const sinP = Math.sin(this.pitch);
    const cosY = Math.cos(this.yaw);
    const sinY = Math.sin(this.yaw);

    const position = vec3.fromValues(
      this.target[0] + this.radius * sinY * cosP,
      this.target[1] + this.radius * sinP,
      this.target[2] + this.radius * cosY * cosP
    );

    // Base "look-at": forward aponta do olho para o alvo
    const forward = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), this.target, position));
    let right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), forward, this.worldUp));
    let up = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), right, forward));

    // Aplica ROLL em torno de forward
    if (Math.abs(this.roll) > 1e-10) {
      const qRoll = quat.setAxisAngle(quat.create(), forward, this.roll);
      vec3.transformQuat(right, right, qRoll);
      vec3.transformQuat(up, up, qRoll);
    }

    // Matriz de rotação "world" da câmera (colunas: right, up, -forward)
    const R = mat4.create();
    // col0 = right
    R[0] = right[0]; R[1] = right[1]; R[2] = right[2];
    // col1 = up
    R[4] = up[0];    R[5] = up[1];    R[6] = up[2];
    // col2 = -forward (porque o -Z local aponta para frente)
    R[8] = -forward[0]; R[9] = -forward[1]; R[10] = -forward[2];

    const eulerRad = mat4ToEulerXYZRadians(R);
    const eulerDeg: DegEuler = {
      x: rad2deg(eulerRad[0]),
      y: rad2deg(eulerRad[1]),
      z: rad2deg(eulerRad[2]),
    };

    return { position, eulerDeg, right, up, forward };
  }

  public handleMouseEventForTransform(event: MouseEvent, transform: Transform) {
  const { position, eulerDeg } = this.handleMouseEvent(event);

  // aplica no Transform
  transform.position.set(position[0], position[1], position[2]);
  transform.rotation.set(eulerDeg.x, eulerDeg.y, eulerDeg.z);
}
}
