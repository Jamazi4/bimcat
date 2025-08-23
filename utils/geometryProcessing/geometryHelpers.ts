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

export function composeRelativeTransformMatrix(
  baseGeom: THREE.BufferGeometry,
  transform: TransformObject,
) {
  baseGeom.computeBoundingBox();
  const center = new THREE.Vector3();
  baseGeom.boundingBox?.getCenter(center);

  const toOrigin = new THREE.Matrix4().makeTranslation(
    -center.x,
    -center.y,
    -center.z,
  );

  const transformMatrix = composeTransformMatrix(transform);

  const backToPosition = new THREE.Matrix4().makeTranslation(
    center.x,
    center.y,
    center.z,
  );

  const finalMatrix = new THREE.Matrix4()
    .multiply(backToPosition)
    .multiply(transformMatrix)
    .multiply(toOrigin);

  return finalMatrix;
}

export function isClosedLoop(points: THREE.Vector3[]): boolean {
  if (points.length < 3) return false;
  return points[0].distanceToSquared(points[points.length - 1]) < 1e-6;
}

export function closeLinestrings(
  linestrings: THREE.Vector3[][],
  isBaseClosed: boolean[],
) {
  for (let i = 0; i < linestrings.length; i++) {
    const base = linestrings[i];
    if (isBaseClosed[i] && !isClosedLoop(base)) base.push(base[0].clone());
  }
}
export function getResultantNormal(
  geom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
) {
  const geometry = geom.clone().toNonIndexed();
  const posAttr = geometry.getAttribute("position");

  const resultant = new THREE.Vector3();
  const vA = new THREE.Vector3(),
    vB = new THREE.Vector3(),
    vC = new THREE.Vector3();
  const cb = new THREE.Vector3(),
    ab = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i += 3) {
    vA.fromBufferAttribute(posAttr, i);
    vB.fromBufferAttribute(posAttr, i + 1);
    vC.fromBufferAttribute(posAttr, i + 2);

    // Calculate face normal using cross product
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab);

    // cb now points in the direction of the face normal and its length is proportional to area
    resultant.add(cb);
  }

  // Normalize to get the direction
  resultant.normalize();

  return resultant;
}

export function getLinestringCentroid(linestring: THREE.Vector3[][]) {
  const sum = new THREE.Vector3(0, 0, 0);
  let totalPoints = 0;

  for (const group of linestring) {
    for (const p of group) {
      sum.add(p);
      totalPoints++;
    }
  }
  const origin = sum.divideScalar(totalPoints);
  return origin;
}

export function getBufferGeomCentroid(
  posAttr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
) {
  const centroid = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    centroid.add(v);
  }
  return centroid.divideScalar(posAttr.count);
}
