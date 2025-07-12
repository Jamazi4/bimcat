import * as THREE from "three";
import { groupBy3, groupBy3Vector, includesVector } from "./geometryHelpers";

export function removeCapsFromConvex(
  geometry: THREE.BufferGeometry,
  initVerts: THREE.Vector3[],
  extrudedVerts: THREE.Vector3[],
): THREE.BufferGeometry {
  const indexAttr = geometry.getIndex();

  if (!indexAttr)
    throw new Error("Cannot removed caps from geom with no indices");
  const indices = indexAttr.array;
  const positions = geometry.attributes.position.array;
  const vertices = groupBy3Vector(positions);
  const triangleIndices = groupBy3(indices);

  const resultIndices: number[] = [];

  for (const [a, b, c] of triangleIndices) {
    const va = vertices[a];
    const vb = vertices[b];
    const vc = vertices[c];

    const inInit =
      includesVector(initVerts, va) &&
      includesVector(initVerts, vb) &&
      includesVector(initVerts, vc);

    const inExtruded =
      includesVector(extrudedVerts, va) &&
      includesVector(extrudedVerts, vb) &&
      includesVector(extrudedVerts, vc);

    if (inInit || inExtruded) continue;

    resultIndices.push(a, b, c);
  }

  const newGeometry = new THREE.BufferGeometry();
  newGeometry.setAttribute("position", geometry.attributes.position.clone());
  newGeometry.setIndex(resultIndices);
  newGeometry.computeVertexNormals();

  return newGeometry;
}

export function buildExtrudedGeometry(vertices: THREE.Vector3[]) {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const next = (i + 1) % vertices.length;

    const a = i;
    const b = next;
    const c = i + vertices.length;
    const d = next + vertices.length;

    indices.push(a, b, d);
    indices.push(a, d, c);
  }
  vertices.forEach((v) => {
    positions.push(v.x, v.y, v.z);
  });

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}
