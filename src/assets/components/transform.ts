import { Component } from "./component";
import { Vector3 } from "../../core/api/vector3";
import { mat4 as matrix4 } from "gl-matrix";
import { vec3 as vector3 } from "gl-matrix";
import { quat as quaternion } from "gl-matrix";
import { ObservableMatrix4 } from "../../common/patterns/observer/observable-matrix4";
import { Entity } from "../../core/api/entity";

export class Transform extends Component {
  public readonly owner: Entity;

  private readonly _position: Vector3;
  public get position(): Vector3 { return this._position; }

  private readonly _rotation: Vector3;
  public get rotation(): Vector3 { return this._rotation; }

  private readonly _scale: Vector3;
  public get scale(): Vector3 { return this._scale; }

  public readonly localMatrix: ObservableMatrix4 = new ObservableMatrix4();
  public readonly worldMatrix: ObservableMatrix4 = new ObservableMatrix4();

  constructor(owner: Entity, position: Vector3 = Vector3.zero(), rotation: Vector3 = Vector3.zero(), scale: Vector3 = Vector3.one()) {
    super();

    this.owner = owner;
    this.owner.parent.subscribe(newParent => this.updateLocalMatrix());
    this.owner.children.subscribe({
      onAdd: (value) => this.updateLocalMatrix(),
      onRemove: (value) => this.updateLocalMatrix()
    });

    this._position = position;
    this._rotation = rotation;
    this._scale = scale;

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
    const parentTransform = this.owner.parent.value?.getComponent(Transform);
    if (parentTransform) {
      const temp = matrix4.create();
      matrix4.multiply(temp, parentTransform.worldMatrix.value, this.localMatrix.value);
      this.worldMatrix.value = temp;
    } else {
      this.worldMatrix.value = matrix4.clone(this.localMatrix.value);
    }

    for (const childEntity of this.owner.children.items) {
      const childTransform = childEntity.getComponent(Transform);
      childTransform?.updateWorldMatrix();
    }
  }

  public setWorldMatrix(matrix: matrix4): void {
    this.worldMatrix.value = matrix;

    const inverseParent = this.owner.parent.value?.getComponent(Transform).worldMatrix.value ?? matrix4.create();
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
      this.owner,
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

  public toJSON() {
    return {
      enabled: this.enabled,
      position: {
        x: this._position.x.value,
        y: this._position.y.value,
        z: this._position.z.value,
      },
      rotation: {
        x: this._rotation.x.value,
        y: this._rotation.y.value,
        z: this._rotation.z.value,
      },
      scale: {
        x: this._scale.x.value,
        y: this._scale.y.value,
        z: this._scale.z.value,
      },
    };
  }

  public fromJSON(json: any): void {
    this.position.set(json.position.x, json.position.y, json.position.z)
    this.rotation.set(json.rotation.x, json.rotation.y, json.rotation.z)
    this.scale.set(json.scale.x, json.scale.y, json.scale.z)

    this.enabled = json.enabled ?? true;
  }

  public destroy(): void {
    // this.children.length = 0;
    // this._parent = null;
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