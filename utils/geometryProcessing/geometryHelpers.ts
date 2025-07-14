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

  // 2. Create a translation matrix to move the geometry to origin
  const toOrigin = new THREE.Matrix4().makeTranslation(
    -center.x,
    -center.y,
    -center.z,
  );

  // 3. Your transformation matrix (e.g., scale, rotation, etc.)
  const transformMatrix = composeTransformMatrix(transform);

  // 4. Create a matrix to move it back to original position
  const backToPosition = new THREE.Matrix4().makeTranslation(
    center.x,
    center.y,
    center.z,
  );

  // 5. Combine the matrices: move to origin → transform → move back
  const finalMatrix = new THREE.Matrix4()
    .multiply(backToPosition)
    .multiply(transformMatrix)
    .multiply(toOrigin);

  return finalMatrix;
}
