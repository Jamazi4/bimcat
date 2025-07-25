import * as THREE from "three";
import { Halfedge, HalfedgeDS } from "three-mesh-halfedge";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { isClosedLoop } from "./geometryHelpers";

export function extractOrderedBoundaryLoop(
  geometry: THREE.BufferGeometry,
): THREE.Vector3[][] {
  const struct = new HalfedgeDS();
  struct.setFromGeometry(geometry);

  const visited = new Set<Halfedge>();
  const loops: THREE.Vector3[][] = [];

  for (const he of struct.halfedges) {
    // Only start from boundary halfedges
    if (!he.face && !visited.has(he)) {
      const loop: THREE.Vector3[] = [];
      const start = he;
      let current: Halfedge | undefined = he;

      do {
        if (!current || visited.has(current)) break;

        visited.add(current);
        if (current.vertex?.position instanceof THREE.Vector3) {
          loop.push(current.vertex.position.clone());
        }

        // Walk to next boundary edge around the vertex
        let next: Halfedge = current.next;
        while (next && next.face && next.twin && next.twin.next) {
          next = next.twin.next;
        }

        current = next;
      } while (current && current !== start);

      if (loop.length > 0) {
        loops.push(loop);
      }
    }
  }

  return loops;
}
export function createSideGeometry(
  baseLinestrings: THREE.Vector3[][],
  transformMatrix: THREE.Matrix4,
  isBaseClosed: boolean[],
) {
  const sideGeometries: THREE.BufferGeometry[] = [];

  for (let i = 0; i < baseLinestrings.length; i++) {
    const base = [...baseLinestrings[i]];
    if (base.length < 2) continue;


    if (isBaseClosed[i] && !isClosedLoop(base)) {
      base.push(base[0].clone());
    }

    const count = base.length;
    const sideVertices: number[] = [];
    const sideIndices: number[] = [];

    for (let j = 0; j < count - 1; j++) {
      const offset = sideVertices.length / 3;

      const b1 = base[j].toArray();
      const b2 = base[j + 1].toArray();

      const e1 = base[j].clone().applyMatrix4(transformMatrix).toArray();
      const e2 = base[j + 1].clone().applyMatrix4(transformMatrix).toArray();

      sideVertices.push(...b1, ...b2, ...e1, ...e2);

      sideIndices.push(
        offset,
        offset + 1,
        offset + 2, // Triangle 1
        offset + 1,
        offset + 3,
        offset + 2, // Triangle 2
      );
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(sideVertices, 3));
    geom.setIndex(sideIndices);
    sideGeometries.push(geom);
  }

  if (sideGeometries.length === 0) return null;

  let final = BufferGeometryUtils.mergeGeometries(sideGeometries, true);
  final = BufferGeometryUtils.mergeVertices(final);
  final.computeVertexNormals();
  final = BufferGeometryUtils.toCreasedNormals(final, 0.01);

  return final;
}

export function orderBoundaryEdges(edges: [number, number][]): number[][] {
  const adj = new Map<number, Set<number>>();
  for (const [u, v] of edges) {
    if (!adj.has(u)) adj.set(u, new Set());
    if (!adj.has(v)) adj.set(v, new Set());
    adj.get(u)!.add(v);
    adj.get(v)!.add(u);
  }

  const paths: number[][] = [];
  const visited = new Set<number>();

  for (const startNode of adj.keys()) {
    if (visited.has(startNode)) {
      continue;
    }

    const path = [startNode];
    visited.add(startNode);
    let current = startNode;

    while (true) {
      const neighbors = adj.get(current);
      if (!neighbors) break;

      let nextNode = -1;
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          nextNode = neighbor;
          break;
        }
      }

      if (nextNode !== -1) {
        visited.add(nextNode);
        path.push(nextNode);
        current = nextNode;
      } else {
        // No more unvisited neighbors. Check if we can close the loop.
        if (neighbors.has(startNode) && path.length > 2) {
          path.push(startNode);
        }
        break;
      }
    }
    paths.push(path);
  }

  return paths;
}
