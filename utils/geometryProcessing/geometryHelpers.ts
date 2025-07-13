import * as THREE from "three";
import { TransformObject } from "../nodeTypes";

export function groupBy3(position: ArrayLike<number>): number[][] {
  const grouped: number[][] = [];
  for (let i = 0; i < position.length; i += 3) {
    grouped.push([position[i], position[i + 1], position[i + 2]]);
  }
  return grouped;
}

export function groupBy3Vector(position: ArrayLike<number>): THREE.Vector3[] {
  const grouped: THREE.Vector3[] = [];
  for (let i = 0; i < position.length; i += 3) {
    grouped.push(
      new THREE.Vector3(position[i], position[i + 1], position[i + 2]),
    );
  }
  return grouped;
}

export function includesVector(
  array: THREE.Vector3[],
  v: THREE.Vector3,
  epsilon = 1e-6,
): boolean {
  return array.some((vec) => vec.distanceToSquared(v) < epsilon * epsilon);
}

export function toRadians(deg: number) {
  return deg * (Math.PI / 180);
}

export function composeTransformMatrix(transform: TransformObject) {
  const { rotation, position, scale } = transform;
  const rotationEuler = new THREE.Euler(rotation.x, rotation.y, rotation.z);

  const matrix = new THREE.Matrix4();
  matrix.compose(
    position,
    new THREE.Quaternion().setFromEuler(rotationEuler),
    scale,
  );
  return matrix;
}

export function getLinestringFromGeom(geom: THREE.BufferGeometry) {
  const positionAttr = geom.getAttribute("position");
  const linestring: THREE.Vector3[] = [];

  for (let i = 0; i < positionAttr.count; i++) {
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    linestring.push(new THREE.Vector3(x, y, z));
  }
  return linestring;
}
