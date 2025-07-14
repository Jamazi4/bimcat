import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export function createSideGeometry(
  baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  extrudedGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  isIndexed: boolean,
): THREE.BufferGeometry<THREE.NormalBufferAttributes> {
  const basePositions = baseGeom.attributes.position.array;
  const extrudedPositions = extrudedGeom.attributes.position.array;

  const sideGeometry = new THREE.BufferGeometry<THREE.NormalBufferAttributes>();
  const sideVertices: number[] = [];
  const sideIndices: number[] = [];

  let vertexIndex = 0;

  if (isIndexed && baseGeom.index) {
    // For indexed geometries (meshes), extract boundary edges
    const edges = extractBoundaryEdges(baseGeom);

    for (const edge of edges) {
      const [v1, v2] = edge;

      // Validate indices
      if (
        v1 * 3 + 2 >= basePositions.length ||
        v2 * 3 + 2 >= basePositions.length ||
        v1 * 3 + 2 >= extrudedPositions.length ||
        v2 * 3 + 2 >= extrudedPositions.length
      ) {
        continue;
      }

      // Base vertices
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

      // Extruded vertices
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

      // Check for NaN values
      if (
        base1.some(isNaN) ||
        base2.some(isNaN) ||
        ext1.some(isNaN) ||
        ext2.some(isNaN)
      ) {
        continue;
      }

      // Add vertices for quad (two triangles)
      sideVertices.push(...base1, ...base2, ...ext1, ...ext2);

      // Create two triangles for the quad
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
  } else {
    // For linestrings: connect each vertex to the next, including last to first
    const vertexCount = basePositions.length / 3;

    for (let i = 0; i < vertexCount; i++) {
      const v1 = i;
      const v2 = (i + 1) % vertexCount;

      // Base vertices
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

      // Extruded vertices
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

      // Check for NaN values
      if (
        base1.some(isNaN) ||
        base2.some(isNaN) ||
        ext1.some(isNaN) ||
        ext2.some(isNaN)
      ) {
        continue;
      }

      // Skip if vertices are identical (zero-length edge)
      if (base1.every((val, idx) => Math.abs(val - base2[idx]) < 1e-10)) {
        continue;
      }

      // Add vertices for quad
      sideVertices.push(...base1, ...base2, ...ext1, ...ext2);

      // Create two triangles for the quad
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
  }

  if (sideVertices.length > 0) {
    sideGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sideVertices, 3),
    );
    sideGeometry.setIndex(sideIndices);
  }

  return sideGeometry;
}

export function extractBoundaryEdges(
  geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
): [number, number][] {
  if (!geometry.index) {
    // For non-indexed geometry, create sequential edges
    const vertexCount = geometry.attributes.position.count;
    const edges: [number, number][] = [];
    for (let i = 0; i < vertexCount - 1; i++) {
      edges.push([i, i + 1]);
    }
    return edges;
  }

  // For indexed geometry, find boundary edges
  const index = geometry.index.array;
  const edgeCount = new Map<string, number>();

  // Count how many times each edge appears
  for (let i = 0; i < index.length; i += 3) {
    const a = index[i];
    const b = index[i + 1];
    const c = index[i + 2];

    // Check each edge of the triangle
    const edges = [
      [Math.min(a, b), Math.max(a, b)],
      [Math.min(b, c), Math.max(b, c)],
      [Math.min(c, a), Math.max(c, a)],
    ];

    for (const [v1, v2] of edges) {
      const key = `${v1}-${v2}`;
      edgeCount.set(key, (edgeCount.get(key) || 0) + 1);
    }
  }

  // Boundary edges appear only once
  const boundaryEdges: [number, number][] = [];
  for (const [key, count] of edgeCount.entries()) {
    if (count === 1) {
      const [v1, v2] = key.split("-").map(Number);
      boundaryEdges.push([v1, v2]);
    }
  }

  return boundaryEdges;
}

export function createExtrudedMesh(
  baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  extrudedGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>,
  isIndexed: boolean,
  includeBase: boolean,
  includeTop: boolean,
): THREE.BufferGeometry<THREE.NormalBufferAttributes> {
  const geometriesToMerge: THREE.BufferGeometry<THREE.NormalBufferAttributes>[] =
    [];

  // Create and prepare side geometry
  const sideGeometry = createSideGeometry(baseGeom, extrudedGeom, isIndexed);
  if (sideGeometry.attributes.position) {
    sideGeometry.computeVertexNormals();
    geometriesToMerge.push(sideGeometry);
  }

  // Create and prepare bottom cap (flipped base)
  if (includeBase && baseGeom.index) {
    const baseCap = baseGeom.clone();
    const indices = baseCap.index!.array;
    for (let i = 0; i < indices.length; i += 3) {
      [indices[i], indices[i + 2]] = [indices[i + 2], indices[i]]; // Flip face
    }
    baseCap.computeVertexNormals();
    geometriesToMerge.push(baseCap);
  }

  // Create and prepare top cap
  if (includeTop && extrudedGeom.index) {
    const topCap = extrudedGeom.clone();
    topCap.computeVertexNormals();
    geometriesToMerge.push(topCap);
  }

  if (geometriesToMerge.length === 0) {
    return new THREE.BufferGeometry();
  }

  // Merge the prepared parts
  const finalGeometry = BufferGeometryUtils.mergeGeometries(geometriesToMerge);
  if (!finalGeometry) {
    throw new Error("Failed to merge geometries");
  }

  return finalGeometry;
}

export function orderBoundaryEdges(edges: [number, number][]): number[] {
  if (edges.length === 0) {
    return [];
  }

  const edgeMap = new Map<number, number[]>();
  const allVertices = new Set<number>();
  for (const [v1, v2] of edges) {
    if (!edgeMap.has(v1)) edgeMap.set(v1, []);
    if (!edgeMap.has(v2)) edgeMap.set(v2, []);
    edgeMap.get(v1)!.push(v2);
    edgeMap.get(v2)!.push(v1);
    allVertices.add(v1);
    allVertices.add(v2);
  }

  const orderedPath: number[] = [];
  const visited = new Set<number>();

  // For a closed loop, all vertices will have 2 connections (in the context of the boundary).
  // If we find a node with one connection, it must be an open path.
  let startNode = -1;
  for (const [vertex, neighbors] of edgeMap.entries()) {
    if (neighbors.length === 1) {
      startNode = vertex;
      break;
    }
  }

  // If no node has only one neighbor, it's a closed loop (or multiple). Pick any.
  if (startNode === -1) {
    startNode = edges[0][0];
  }

  let current = startNode;

  while (visited.size < allVertices.size) {
    if (visited.has(current)) break; // Should not happen in a simple path/loop
    orderedPath.push(current);
    visited.add(current);

    const neighbors = edgeMap.get(current)!;
    let next = -1;
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        next = neighbor;
        break;
      }
    }

    if (next === -1) {
      // Reached end of a path
      break;
    }
    current = next;
  }

  // After the loop, check if it's a closed loop that needs closing.
  const last = orderedPath[orderedPath.length - 1];
  const first = orderedPath[0];
  const lastNeighbors = edgeMap.get(last);

  if (
    lastNeighbors &&
    lastNeighbors.includes(first) &&
    orderedPath.length === allVertices.size
  ) {
    // This confirms it's a closed loop and we've traversed all vertices.
    orderedPath.push(first);
  }

  return orderedPath;
}
