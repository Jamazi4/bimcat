import * as THREE from "three";
import earcut from "earcut";
import { Halfedge, HalfedgeDS } from "three-mesh-halfedge";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  composeRelativeTransformMatrix,
  isClosedLoop,
} from "./geometryHelpers";
import { TransformObject } from "../nodeTypes";

export function extractOrderedBoundaryLoop(
  geometry: THREE.BufferGeometry,
): THREE.Vector3[][] {
  const struct = new HalfedgeDS();
  try {
    struct.setFromGeometry(geometry);
  } catch (error) {
    console.warn(error);
    throw new Error("Invalid Geometry.");
  }

  const visited = new Set<Halfedge>();
  const loops: THREE.Vector3[][] = [];

  for (const he of struct.halfedges) {
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

// export function createSideGeometry(
//   baseLinestrings: THREE.Vector3[][],
//   transformMatrix: THREE.Matrix4,
//   isBaseClosed: boolean[],
// ) {
//   const sideGeometries: THREE.BufferGeometry[] = [];
//
//   for (let i = 0; i < baseLinestrings.length; i++) {
//     const base = [...baseLinestrings[i]];
//     if (base.length < 2) continue;
//
//     if (isBaseClosed[i] && !isClosedLoop(base)) {
//       base.push(base[0].clone());
//     }
//
//     const count = base.length;
//     const sideVertices: number[] = [];
//     const sideIndices: number[] = [];
//
//     for (let j = 0; j < count - 1; j++) {
//       const offset = sideVertices.length / 3;
//
//       const b1 = base[j].toArray();
//       const b2 = base[j + 1].toArray();
//
//       const e1 = base[j].clone().applyMatrix4(transformMatrix).toArray();
//       const e2 = base[j + 1].clone().applyMatrix4(transformMatrix).toArray();
//
//       sideVertices.push(...b1, ...b2, ...e1, ...e2);
//
//       sideIndices.push(
//         offset,
//         offset + 1,
//         offset + 2, // Triangle 1
//         offset + 1,
//         offset + 3,
//         offset + 2, // Triangle 2
//       );
//     }
//
//     const geom = new THREE.BufferGeometry();
//     geom.setAttribute(
//       "position",
//       new THREE.Float32BufferAttribute(sideVertices, 3),
//     );
//     geom.setIndex(sideIndices);
//     sideGeometries.push(geom);
//   }
//
//   if (sideGeometries.length === 0) return null;
//
//   let final = BufferGeometryUtils.mergeGeometries(sideGeometries, false);
//   final.computeVertexNormals();
//   final = BufferGeometryUtils.toCreasedNormals(final, 1e-6);
//   final = BufferGeometryUtils.mergeVertices(final);
//   final.deleteAttribute("uv");
//
//   return final;
// }

export function createSideGeometry(
  baseLinestrings: THREE.Vector3[][],
  transform: TransformObject, // Changed from transformMatrix to transform
  isBaseClosed: boolean[],
) {
  const sideGeometries: THREE.BufferGeometry[] = [];

  // Pre-compute matrices once (more efficient than per-vertex)
  const positionMatrix = new THREE.Matrix4().makeTranslation(
    transform.position.x,
    transform.position.y,
    transform.position.z,
  );

  // We need to compute the relative matrix based on a representative geometry
  // Use the first linestring as reference for the origin calculation
  let relativeMatrix: THREE.Matrix4;
  if (baseLinestrings.length > 0 && baseLinestrings[0].length > 0) {
    const tempGeom = new THREE.BufferGeometry().setFromPoints(
      baseLinestrings[0],
    );
    tempGeom.applyMatrix4(positionMatrix); // Position it first
    relativeMatrix = composeRelativeTransformMatrix(tempGeom, transform);
  } else {
    relativeMatrix = new THREE.Matrix4(); // Identity fallback
  }

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

      // Apply the 2-step transform: position then relative transform
      const e1 = base[j]
        .clone()
        .applyMatrix4(positionMatrix)
        .applyMatrix4(relativeMatrix)
        .toArray();
      const e2 = base[j + 1]
        .clone()
        .applyMatrix4(positionMatrix)
        .applyMatrix4(relativeMatrix)
        .toArray();

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
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sideVertices, 3),
    );
    geom.setIndex(sideIndices);
    sideGeometries.push(geom);
  }

  if (sideGeometries.length === 0) return null;

  let final = BufferGeometryUtils.mergeGeometries(sideGeometries, false);
  final.computeVertexNormals();
  final = BufferGeometryUtils.toCreasedNormals(final, 1e-6);
  final = BufferGeometryUtils.mergeVertices(final);
  final.deleteAttribute("uv");

  return final;
}

export function triangulateLinestrings(
  linestrings: THREE.Vector3[][],
): THREE.BufferGeometry | null {
  const geometries: THREE.BufferGeometry[] = [];

  for (const linestring of linestrings) {
    const result = triangulatePolygon3D(linestring);
    if (!result) continue;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(result.positions, 3),
    );
    geom.setIndex(result.indices);
    geometries.push(geom);
  }

  if (geometries.length === 0) return null;

  const merged = BufferGeometryUtils.mergeGeometries(geometries, false);
  merged.computeVertexNormals();
  return merged;
}

/**
 * Triangulates a single 3D polygon (Vector3 array) by projecting it onto its best-fit plane.
 * Returns an object containing the indices and original positions array.
 */
export function triangulatePolygon3D(polygon: THREE.Vector3[]): {
  indices: number[];
  positions: number[];
} | null {
  if (polygon.length < 3) return null;

  // Compute normal from first 3 points (assuming mostly planar)
  // TODO: extend this to calculate normal from entire polygon
  const normal = new THREE.Vector3()
    .crossVectors(
      new THREE.Vector3().subVectors(polygon[1], polygon[0]),
      new THREE.Vector3().subVectors(polygon[2], polygon[0]),
    )
    .normalize();
  if (normal.lengthSq() === 0) return null;

  // Local basis (u,v) in plane
  const u = new THREE.Vector3().subVectors(polygon[1], polygon[0]).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();

  // Project to 2D coordinates in plane space
  const vertices2D: number[] = [];
  for (const p of polygon) {
    const ap = new THREE.Vector3().subVectors(p, polygon[0]);
    vertices2D.push(ap.dot(u), ap.dot(v));
  }

  // Triangulate in 2D
  const indices = earcut(vertices2D);
  if (indices.length === 0) return null;

  // Flatten original positions into Float32-friendly array
  const positions: number[] = [];
  for (const p of polygon) {
    positions.push(p.x, p.y, p.z);
  }

  return { indices, positions };
}

/**
 * Triangulates an outer polygon + holes (all as 3D linestrings).
 * Projects everything to 2D, runs earcut with hole indices, then returns a BufferGeometry.
 *
 * @param outer The outer boundary polygon (Vector3[])
 * @param holes Array of hole polygons (Vector3[][])
 */
export function triangulateLinestringsWithHoles(
  outer: THREE.Vector3[],
  holes: THREE.Vector3[][],
): THREE.BufferGeometry | null {
  if (outer.length < 3) {
    console.warn("Triangulate with holes outer needs at least 3 points");
    return null;
  }

  // --- 1. Compute local plane (same as triangulatePolygon3D) ---
  // TODO: as in triangulatePolygon3D - handle normal for entire polygon
  const normal = new THREE.Vector3()
    .crossVectors(
      new THREE.Vector3().subVectors(outer[1], outer[0]),
      new THREE.Vector3().subVectors(outer[2], outer[0]),
    )
    .normalize();
  if (normal.lengthSq() === 0) {
    console.warn("Triangulate with holes invalid normal for outer");
    return null;
  }

  const u = new THREE.Vector3().subVectors(outer[1], outer[0]).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();

  // --- 2. Flatten outer + holes into single vertices2D array ---
  const vertices2D: number[] = [];
  const positions: number[] = [];
  const holeIndices: number[] = [];

  // Outer first
  for (const p of outer) {
    const ap = new THREE.Vector3().subVectors(p, outer[0]);
    vertices2D.push(ap.dot(u), ap.dot(v));
    positions.push(p.x, p.y, p.z);
  }

  let indexOffset = outer.length;

  // Then each hole
  for (const hole of holes) {
    if (hole.length < 3) continue; // skip invalid holes
    holeIndices.push(vertices2D.length / 2); // mark starting index of this hole
    for (const p of hole) {
      const ap = new THREE.Vector3().subVectors(p, outer[0]);
      vertices2D.push(ap.dot(u), ap.dot(v));
      positions.push(p.x, p.y, p.z);
    }
    indexOffset += hole.length;
  }
  const indices = earcut(
    vertices2D,
    holeIndices.length > 0 ? holeIndices : undefined,
    2,
  );

  if (indices.length === 0) return null;

  // ADD THIS: Remove degenerate triangles
  const cleanIndices: number[] = [];
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    // Skip degenerate triangles
    if (a !== b && b !== c && c !== a) {
      // Also check if vertices are actually different in 3D space
      const va = new THREE.Vector3(
        positions[a * 3],
        positions[a * 3 + 1],
        positions[a * 3 + 2],
      );
      const vb = new THREE.Vector3(
        positions[b * 3],
        positions[b * 3 + 1],
        positions[b * 3 + 2],
      );
      const vc = new THREE.Vector3(
        positions[c * 3],
        positions[c * 3 + 1],
        positions[c * 3 + 2],
      );

      const EPSILON = 1e-10;
      if (
        va.distanceTo(vb) > EPSILON &&
        vb.distanceTo(vc) > EPSILON &&
        vc.distanceTo(va) > EPSILON
      ) {
        cleanIndices.push(a, b, c);
      }
    }
  }

  if (cleanIndices.length === 0) return null;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(cleanIndices); // Use cleaned indices
  geom.computeVertexNormals();
  return geom;
}
