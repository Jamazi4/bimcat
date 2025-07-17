import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { Halfedge, HalfedgeDS } from "three-mesh-halfedge";
export function createSideGeometry(
  baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  extrudedGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  isIndexed: boolean,
): THREE.BufferGeometry<THREE.NormalBufferAttributes> {
  const extrudedPositions = extrudedGeom.attributes.position.array;

  const sideGeometry = new THREE.BufferGeometry<THREE.NormalBufferAttributes>();
  const sideVertices: number[] = [];
  const sideIndices: number[] = [];

  let vertexIndex = 0;

  // if (isIndexed) {
  // For indexed geometries (meshes), extract boundary edges
  const edges = extractBoundaryEdges(baseGeom);

  for (const edge of edges) {
    const [v1, v2] = edge;

    if (
      v1 * 3 + 2 >= basePositions.length ||
      v2 * 3 + 2 >= basePositions.length ||
      v1 * 3 + 2 >= extrudedPositions.length ||
      v2 * 3 + 2 >= extrudedPositions.length
    ) {
      continue;
    }

    const base1 = [
      basePositions[v1 * 3],
      basePositions[v1 * 3 + 1],
      basePositions[v1 * 3 + 2],
    ];
    const base2 = [
      basePositions[v2 * 3],
      basePositions[v2 * 3 + 1],
      basePositions[v2 * 3 + 2],
    ];

    const ext1 = [
      extrudedPositions[v1 * 3],
      extrudedPositions[v1 * 3 + 1],
      extrudedPositions[v1 * 3 + 2],
    ];
    const ext2 = [
      extrudedPositions[v2 * 3],
      extrudedPositions[v2 * 3 + 1],
      extrudedPositions[v2 * 3 + 2],
    ];

    if (
      base1.some(isNaN) ||
      base2.some(isNaN) ||
      ext1.some(isNaN) ||
      ext2.some(isNaN)
    ) {
      continue;
    }

    sideVertices.push(...base1, ...base2, ...ext1, ...ext2);

    const offset = vertexIndex;
    sideIndices.push(
      offset,
      offset + 1,
      offset + 2, // Triangle 1
      offset + 1,
      offset + 3,
      offset + 2, // Triangle 2
    );

    vertexIndex += 4;
  }
  // } else {
  //   // For linestrings: connect each vertex to the next, including last to first
  //   const vertexCount = basePositions.length / 3;
  //
  //   for (let i = 0; i < vertexCount; i++) {
  //     const v1 = i;
  //     const v2 = (i + 1) % vertexCount;
  //
  //     const base1 = [
  //       basePositions[v1 * 3],
  //       basePositions[v1 * 3 + 1],
  //       basePositions[v1 * 3 + 2],
  //     ];
  //     const base2 = [
  //       basePositions[v2 * 3],
  //       basePositions[v2 * 3 + 1],
  //       basePositions[v2 * 3 + 2],
  //     ];
  //
  //     const ext1 = [
  //       extrudedPositions[v1 * 3],
  //       extrudedPositions[v1 * 3 + 1],
  //       extrudedPositions[v1 * 3 + 2],
  //     ];
  //     const ext2 = [
  //       extrudedPositions[v2 * 3],
  //       extrudedPositions[v2 * 3 + 1],
  //       extrudedPositions[v2 * 3 + 2],
  //     ];
  //
  //     if (
  //       base1.some(isNaN) ||
  //       base2.some(isNaN) ||
  //       ext1.some(isNaN) ||
  //       ext2.some(isNaN)
  //     ) {
  //       continue;
  //     }
  //
  //     // Skip if vertices are identical (zero-length edge)
  //     if (base1.every((val, idx) => Math.abs(val - base2[idx]) < 1e-10)) {
  //       continue;
  //     }
  //
  //     sideVertices.push(...base1, ...base2, ...ext1, ...ext2);
  //
  //     const offset = vertexIndex;
  //     sideIndices.push(
  //       offset,
  //       offset + 1,
  //       offset + 2, // Triangle 1
  //       offset + 1,
  //       offset + 3,
  //       offset + 2, // Triangle 2
  //     );
  //
  //     vertexIndex += 4;
  //   }
  // }
  //
  if (sideVertices.length > 0) {
    sideGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sideVertices, 3),
    );
    sideGeometry.setIndex(sideIndices);
  }

  return sideGeometry;
}

// export function extractBoundaryEdges(
//   geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
// ): [number, number][] {
// if (!geometry.index) {
//   // For non-indexed geometry, create sequential edges
//   const vertexCount = geometry.attributes.position.count;
//   const edges: [number, number][] = [];
//   for (let i = 0; i < vertexCount - 1; i++) {
//     edges.push([i, i + 1]);
//   }
//   return edges;
// }

// For indexed geometry, find boundary edges
// const struct = new HalfedgeDS();
// struct.setFromGeometry(geometry);
// const boundaries = new Set<Halfedge>();
// const boundaryEdges: [number, number][] = [];
// for (const halfedge of struct.halfedges) {
//   if (!boundaries.has(halfedge.twin) && !halfedge.face) {
//     boundaries.add(halfedge);
//     const startIndex = halfedge.vertex.id;
//     const endIndex = halfedge.next.vertex.id;
//     boundaryEdges.push([startIndex, endIndex]);
//   }
// }
//
// const index = geometry.index?.array;
// if (!index) throw new Error("Extracting edges failed, no index");
// const edgeCount = new Map<string, number>();
//
// // Count how many times each edge appears
// for (let i = 0; i < index.length; i += 3) {
//   const a = index[i];
//   const b = index[i + 1];
//   const c = index[i + 2];
//
//   // Check each edge of the triangle
//   const edges = [
//     [Math.min(a, b), Math.max(a, b)],
//     [Math.min(b, c), Math.max(b, c)],
//     [Math.min(c, a), Math.max(c, a)],
//   ];
//
//   for (const [v1, v2] of edges) {
//     const key = `${v1}-${v2}`;
//     edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
//   }
// }
//
// // Boundary edges appear only once
// const boundaryEdges: [number, number][] = [];
// for (const [key, count] of edgeCount.entries()) {
//   if (count === 1) {
//     const [v1, v2] = key.split("-").map(Number);
//     boundaryEdges.push([v1, v2]);
//   }
// }

//   return boundaryEdges;
// }
//
export function createExtrudedMesh(
  baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  extrudedGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  isInputMesh: boolean,
  includeTop: boolean,
): THREE.BufferGeometry<THREE.NormalBufferAttributes> {
  const geometriesToMerge: THREE.BufferGeometry<THREE.NormalBufferAttributes>[] =
    [];

  // console.log(baseGeom);
  // Create side geometry
  const sideGeometry = createSideGeometry(baseGeom, extrudedGeom, isInputMesh);
  if (sideGeometry.attributes.position) {
    geometriesToMerge.push(sideGeometry);
  }

  // Create bottom cap (flipped base)
  // if (isInputMesh) {
  //   const baseCap = baseGeom.clone();
  //   const indices = baseCap.index!.array;
  //   for (let i = 0; i < indices.length; i += 3) {
  //     [indices[i], indices[i + 2]] = [indices[i + 2], indices[i]]; // Flip face
  //   }
  //   baseCap.deleteAttribute("normal"); // Ensure no normals before merging
  //   geometriesToMerge.push(baseCap);
  // }
  //
  // Create top cap
  if (includeTop && extrudedGeom.index) {
    const topCap = extrudedGeom.clone();
    topCap.deleteAttribute("normal"); // Ensure no normals before merging
    geometriesToMerge.push(topCap);
  }

  if (geometriesToMerge.length === 0) {
    return new THREE.BufferGeometry();
  }

  // Merge the raw parts first
  const finalGeometry = BufferGeometryUtils.mergeGeometries(geometriesToMerge);
  if (!finalGeometry) {
    throw new Error("Failed to merge geometries");
  }

  // Compute creased normals on the final merged geometry to preserve sharp edges
  return BufferGeometryUtils.toCreasedNormals(finalGeometry);
}

// export function orderBoundaryEdges(edges: [number, number][]): number[][] {
//   const adj = new Map<number, Set<number>>();
//   for (const [u, v] of edges) {
//     if (!adj.has(u)) adj.set(u, new Set());
//     if (!adj.has(v)) adj.set(v, new Set());
//     adj.get(u)!.add(v);
//     adj.get(v)!.add(u);
//   }
//
//   const paths: number[][] = [];
//   const visited = new Set<number>();
//
//   for (const startNode of adj.keys()) {
//     if (visited.has(startNode)) {
//       continue;
//     }
//
//     const path = [startNode];
//     visited.add(startNode);
//     let current = startNode;
//
//     while (true) {
//       const neighbors = adj.get(current);
//       if (!neighbors) break;
//
//       let nextNode = -1;
//       for (const neighbor of neighbors) {
//         if (!visited.has(neighbor)) {
//           nextNode = neighbor;
//           break;
//         }
//       }
//
//       if (nextNode !== -1) {
//         visited.add(nextNode);
//         path.push(nextNode);
//         current = nextNode;
//       } else {
//         // No more unvisited neighbors. Check if we can close the loop.
//         if (neighbors.has(startNode) && path.length > 2) {
//           path.push(startNode);
//         }
//         break;
//       }
//     }
//     paths.push(path);
//   }
//
//   return paths;
// }
