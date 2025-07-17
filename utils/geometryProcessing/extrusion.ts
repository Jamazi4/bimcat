import * as THREE from "three";
import { Halfedge, HalfedgeDS } from "three-mesh-halfedge";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { groupBy3Vector, isClosedLoop } from "./geometryHelpers";

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
  baseLinestring: THREE.Vector3[],
  extrudedLinestring: THREE.Vector3[],
  isBaseClosed: boolean,
) {
  if (isBaseClosed && !isClosedLoop(extrudedLinestring)) {
    console.log("added to base");
    extrudedLinestring.push(extrudedLinestring[0]);
  }
  if (isBaseClosed && !isClosedLoop(baseLinestring)) {
    console.log("added to extruded");
    baseLinestring.push(baseLinestring[0]);
  }

  const sideGeometry = new THREE.BufferGeometry<THREE.NormalBufferAttributes>();
  const sideVertices: number[] = [];
  const sideIndices: number[] = [];

  const count = baseLinestring.length;

  for (let i = 0; i < count - 1; i += 1) {
    const offset = sideVertices.length / 3;
    const b1 = baseLinestring[i].toArray();
    const b2 = baseLinestring[i + 1].toArray();

    const e1 = extrudedLinestring[i].toArray();
    const e2 = extrudedLinestring[i + 1].toArray();

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

  sideGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(sideVertices, 3),
  );
  sideGeometry.setIndex(sideIndices);
  let final = BufferGeometryUtils.mergeVertices(sideGeometry);
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
