import { Component } from "./component";
import { Vector3 } from "../../core/api/vector3";
import { mat4 as matrix4 } from "gl-matrix";
import { vec3 as vector3 } from "gl-matrix";
import { quat as quaternion } from "gl-matrix";
import { ObservableField } from "../../common/patterns/observer/observable-field";
import { ObservableMatrix4 } from "../../common/patterns/observer/observable-matrix4";

export class Transform extends Component {
  private _parent: Transform | null = null;
  public get parent(): Transform | null { return this._parent; }
  public set parent(parent: Transform | null) {
    if (this._parent) {
      const index = this._parent.children.indexOf(this);
      if (index !== -1) this._parent.children.splice(index, 1);
    }

    this._parent = parent;

    if (parent && !parent.children.includes(this)) {
      parent.children.push(this);
    }

    this.updateWorldMatrix();
  }

  public readonly children: Transform[] = [];

  private readonly _position: Vector3;
  public get position(): Vector3 { return this._position; }

  private readonly _rotation: Vector3;
  public get rotation(): Vector3 { return this._rotation; }

  private readonly _scale: Vector3;
  public get scale(): Vector3 { return this._scale; }

  public readonly localMatrix: ObservableMatrix4 = new ObservableMatrix4();
  public readonly worldMatrix: ObservableMatrix4 = new ObservableMatrix4();

  constructor(position?: Vector3, rotation?: Vector3, scale?: Vector3) {
    super();

    this._position = position ?? Vector3.zero();
    this._rotation = rotation ?? Vector3.zero();
    this._scale = scale ?? Vector3.one();

    this._position.x.subscribe(() => this.updateLocalMatrix());
    this._position.y.subscribe(() => this.updateLocalMatrix());
    this._position.z.subscribe(() => this.updateLocalMatrix());

    this._rotation.x.subscribe(() => this.updateLocalMatrix());
    this._rotation.y.subscribe(() => this.updateLocalMatrix());
    this._rotation.z.subscribe(() => this.updateLocalMatrix());

    this._scale.x.subscribe(() => this.updateLocalMatrix());
    this._scale.y.subscribe(() => this.updateLocalMatrix());
    this._scale.z.subscribe(() => this.updateLocalMatrix());

    this.updateLocalMatrix();
  }

  public updateLocalMatrix(): void {
    const t = vector3.fromValues(this._position.x.value, this._position.y.value, this._position.z.value);
    const r = vector3.fromValues(this._rotation.x.value, this._rotation.y.value, this._rotation.z.value);
    const s = vector3.fromValues(this._scale.x.value, this._scale.y.value, this._scale.z.value);

    const q = quaternion.create();
    quaternion.fromEuler(q, r[0], r[1], r[2]); // graus

    const temp = matrix4.create();
    this.localMatrix.value = matrix4.fromRotationTranslationScale(temp, q, t, s);
    this.updateWorldMatrix();
  }

public updateWorldMatrix(): void {
  if (this._parent) {
    const temp = matrix4.create();
    matrix4.multiply(temp, this._parent.worldMatrix.value, this.localMatrix.value);
    this.worldMatrix.value = temp;
  } else {
    this.worldMatrix.value = matrix4.clone(this.localMatrix.value);
  }

  for (const child of this.children) {
    child.updateWorldMatrix();
  }
}


  public setWorldMatrix(matrix: matrix4): void {
    this.worldMatrix.value = matrix;

    const inverseParent = this._parent?.worldMatrix.value ?? matrix4.create();
    const inv = matrix4.invert(matrix4.create(), inverseParent);
    if (inv) {
      matrix4.multiply(this.localMatrix.value, inv, matrix);
    }

    const t = vector3.create();
    const r = quaternion.create();
    const s = vector3.create();
    matrix4.getTranslation(t, this.localMatrix.value);
    matrix4.getRotation(r, this.localMatrix.value);
    matrix4.getScaling(s, this.localMatrix.value);

    const euler = vector3.create();
    quatToEulerXYZ?.(euler, r);

    this._position.set(t[0], t[1], t[2]);
    this._rotation.set(euler[0], euler[1], euler[2]);
    this._scale.set(s[0], s[1], s[2]);
  }

  public clone(): Transform {
    const clone = new Transform(
      this._position.clone(),
      this._rotation.clone(),
      this._scale.clone()
    );
    clone.enabled = this.enabled;
    return clone;
  }

  public copyFrom(transform: Transform): void {
    this._position.setFromVector(transform.position);
    this._rotation.setFromVector(transform.rotation);
    this._scale.setFromVector(transform.scale);
  }

  public destroy(): void {
    this.children.length = 0;
    this._parent = null;
  }
}

function quatToEulerXYZ(out: vector3, q: quaternion): vector3 {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const xx = x * x, yy = y * y, zz = z * z;
  const wx = w * x, wy = w * y, wz = w * z;
  const xy = x * y, xz = x * z, yz = y * z;

  const rx = -Math.atan2(2 * (yz - wx), 1 - 2 * (xx + yy));
  const ry = Math.asin(Math.max(-1, Math.min(1, 2 * (xz + wy))));
  const rz = -Math.atan2(2 * (xy - wz), 1 - 2 * (yy + zz));

  const toDeg = 180 / Math.PI;
  out[0] = rx * toDeg;
  out[1] = ry * toDeg;
  out[2] = rz * toDeg;
  return out;
}