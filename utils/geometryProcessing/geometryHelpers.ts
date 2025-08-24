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

// export function includesVector(
//   array: THREE.Vector3[],
//   v: THREE.Vector3,
//   epsilon = 1e-6,
// ): boolean {
//   return array.some((vec) => vec.distanceToSquared(v) < epsilon * epsilon);
// }

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
  let center;
  if (transform.origin !== undefined && transform.origin !== null) {
    center = transform.origin.clone();
  } else {
    baseGeom.computeBoundingBox();
    center = new THREE.Vector3();
    baseGeom.boundingBox?.getCenter(center);
  }

  // Step 1: Translate to origin (center becomes 0,0,0)
  const toOrigin = new THREE.Matrix4().makeTranslation(
    -center.x,
    -center.y,
    -center.z,
  );

  // Step 2: Apply rotation and scale around origin (0,0,0)
  // NO POSITION - position should be applied before this function is called
  const rotationEuler = new THREE.Euler(
    transform.rotation.x,
    transform.rotation.y,
    transform.rotation.z,
  );
  const rotationScaleMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(0, 0, 0), // No position
    new THREE.Quaternion().setFromEuler(rotationEuler),
    transform.scale,
  );

  // Step 3: Translate back to center position
  const backToCenter = new THREE.Matrix4().makeTranslation(
    center.x,
    center.y,
    center.z,
  );

  // Combine transformations (no position here!)
  const finalMatrix = new THREE.Matrix4()
    .multiply(backToCenter) // 3. Move back to center
    .multiply(rotationScaleMatrix) // 2. Rotate and scale around origin
    .multiply(toOrigin); // 1. Move center to origin

  return finalMatrix;
}

export function applyTransform(
  baseGeom: THREE.BufferGeometry,
  transform: TransformObject,
) {
  const positionMatrix = new THREE.Matrix4().makeTranslation(
    transform.position.x,
    transform.position.y,
    transform.position.z,
  );

  baseGeom.applyMatrix4(positionMatrix);

  const transformMatrix = composeRelativeTransformMatrix(baseGeom, transform);
  baseGeom.applyMatrix4(transformMatrix);
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
    if (base.length === 2) return;
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

  resultant.normalize();

  return resultant;
}

export function getLinestringCentroid(linestring: THREE.Vector3[][]) {
  const centroid = new THREE.Vector3();
  let totalLength = 0;

  for (const group of linestring) {
    for (let i = 0; i < group.length - 1; i++) {
      const p1 = group[i];
      const p2 = group[i + 1];
      const segmentMid = new THREE.Vector3()
        .addVectors(p1, p2)
        .multiplyScalar(0.5);
      const len = p1.distanceTo(p2);

      centroid.addScaledVector(segmentMid, len);
      totalLength += len;
    }
  }
  return centroid.divideScalar(totalLength);
}

//This is not accurate as it's not taking the surface area into consideration
//but now is only used to get inside point for volume calcs - when fixing -
//update getOriginNode
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

export function applyTransformToLinestring(
  geom: THREE.Vector3[][],
  positionMatrix: THREE.Matrix4,
  relativeMatrix: THREE.Matrix4,
) {
  const transformedLinestring: THREE.Vector3[][] = [];
  geom.forEach((linestring) => {
    const temp: THREE.Vector3[] = [];
    linestring.forEach((v) => {
      const positioned = v.clone().applyMatrix4(positionMatrix);
      const transformed = positioned.clone().applyMatrix4(relativeMatrix);
      temp.push(transformed);
    });
    transformedLinestring.push(temp);
  });
  return transformedLinestring;
}
