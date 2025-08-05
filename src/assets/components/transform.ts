import { Component } from "./abstract/component";
import { ObservableVector3 } from "../../common/observer/observable-vector3";
import { mat4 as matrix4 } from "gl-matrix";
import { vec3 as vector3 } from "gl-matrix";
import { quat as quaternion } from "gl-matrix";
import { ObservableMatrix4 } from "../../common/observer/observable-matrix4";
import { Entity } from "../../core/api/entity";
import { HideInInspector } from "../../common/reflection/reflection";

export class Transform extends Component {
  @HideInInspector public readonly owner: Entity;

  public readonly position: ObservableVector3;
  public readonly rotation: ObservableVector3;
  public readonly scale: ObservableVector3;
  
  @HideInInspector public readonly localMatrix: ObservableMatrix4 = new ObservableMatrix4();
  @HideInInspector public readonly worldMatrix: ObservableMatrix4 = new ObservableMatrix4();

  constructor(owner: Entity, position: ObservableVector3 = ObservableVector3.zero(), rotation: ObservableVector3 = ObservableVector3.zero(), scale: ObservableVector3 = ObservableVector3.one()) {
    super();

    this.owner = owner;
    this.owner.parent.subscribe(newParent => this.updateLocalMatrix());
    this.owner.children.subscribe({
      onAdd: (value) => this.updateLocalMatrix(),
      onRemove: (value) => this.updateLocalMatrix()
    });

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;

    this.position.x.subscribe(() => this.updateLocalMatrix());
    this.position.y.subscribe(() => this.updateLocalMatrix());
    this.position.z.subscribe(() => this.updateLocalMatrix());

    this.rotation.x.subscribe((value) => {
      this.updateLocalMatrix();
      this.rotation.x.value = value % 360;
    });
    this.rotation.y.subscribe((value) => {
      this.updateLocalMatrix();
      this.rotation.y.value = value % 360;
    });
    this.rotation.z.subscribe((value) => {
      this.updateLocalMatrix();
      this.rotation.z.value = value % 360;
    });

    this.scale.x.subscribe(() => this.updateLocalMatrix());
    this.scale.y.subscribe(() => this.updateLocalMatrix());
    this.scale.z.subscribe(() => this.updateLocalMatrix());

    this.updateLocalMatrix();
  }

  public updateLocalMatrix(): void {
    const translation = vector3.fromValues(this.position.x.value, this.position.y.value, this.position.z.value);
    const rotation = vector3.fromValues(this.rotation.x.value, this.rotation.y.value, this.rotation.z.value);
    const scale = vector3.fromValues(this.scale.x.value, this.scale.y.value, this.scale.z.value);
    
    const q = quaternion.create();
    quaternion.fromEuler(q, rotation[0], rotation[1], rotation[2]);
    
    const temp = matrix4.create();
    this.localMatrix.value = matrix4.fromRotationTranslationScale(temp, q, translation, scale);
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

    this.position.set(t[0], t[1], t[2]);
    this.rotation.set(euler[0], euler[1], euler[2]);
    this.scale.set(s[0], s[1], s[2]);
  }

  public clone(): Transform {
    const clone = new Transform(
      this.owner,
      this.position.clone(),
      this.rotation.clone(),
      this.scale.clone()
    );
    clone.enabled.value = this.enabled.value;
    return clone;
  }

  public copyFrom(transform: Transform): void {
    this.position.setFromVector(transform.position);
    this.rotation.setFromVector(transform.rotation);
    this.scale.setFromVector(transform.scale);
  }

  public toJSON() {
    return {
      enabled: this.enabled.value,
      position: {
        x: this.position.x.value,
        y: this.position.y.value,
        z: this.position.z.value,
      },
      rotation: {
        x: this.rotation.x.value,
        y: this.rotation.y.value,
        z: this.rotation.z.value,
      },
      scale: {
        x: this.scale.x.value,
        y: this.scale.y.value,
        z: this.scale.z.value,
      },
    };
  }

  public fromJSON(json: any): void {
    this.position.set(json.position.x, json.position.y, json.position.z)
    this.rotation.set(json.rotation.x, json.rotation.y, json.rotation.z)
    this.scale.set(json.scale.x, json.scale.y, json.scale.z)

    this.enabled.value = json.enabled ?? true;
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