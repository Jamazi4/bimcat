import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { removeCapsFromConvex } from "../geometryProcessing/geomFunctions";

export function extrudeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "modifier",
    type: "extrude",
    inputs: [
      {
        type: "slot",
        name: "vector",
        id: 0,
        slotValueType: "vector",
      },
      {
        type: "group",
        name: "mesh",
        id: 1,
        slotValueType: "mesh",
        groupIndex: 1,
        value: true,
      },
      {
        type: "group",
        name: "linestring",
        id: 2,
        slotValueType: "linestring",
        groupIndex: 1,
        value: false,
      },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 3 }],
    function: (node, evalFunction) => {
      const activeInputs = Object.entries(node.values)
        .filter(([key, val]) => val === true && (key === "1" || key === "2"))
        .map(([key, _]) => parseInt(key));

      const [initGeom] = getInputValues(
        node.inputs,
        evalFunction,
        activeInputs,
      );

      const vector = getInputValues(node.inputs, evalFunction, [0])[0];

      if (vector.type === "vector") {
        let baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>;

        if (initGeom.type === "mesh" && activeInputs.includes(1)) {
          baseGeom = initGeom.value;
          if (!baseGeom.index) throw new Error("lost original geom");
        } else if (initGeom.type === "linestring" && activeInputs.includes(2)) {
          baseGeom = new THREE.BufferGeometry();
          baseGeom.setFromPoints(initGeom.value);
        } else {
          throw new Error("Invalid geometry input");
        }

        baseGeom.computeVertexNormals();
        baseGeom.computeBoundingBox();
        const position = baseGeom.attributes.position;
        const vertexCount = position.count;

        const vertices = [];
        const extrudedVertices = [];

        for (let i = 0; i < vertexCount; i++) {
          const v = new THREE.Vector3().fromBufferAttribute(position, i);
          vertices.push(v);
          extrudedVertices.push(v.clone().add(vector.value));
        }
        const allVerts = [...vertices, ...extrudedVertices];

        const geom = new ConvexGeometry(allVerts);
        // const geom = buildExtrudedGeometry(allVerts);
        const indexed = BufferGeometryUtils.mergeVertices(geom);

        const final =
          initGeom.type === "linestring"
            ? removeCapsFromConvex(indexed, vertices, extrudedVertices)
            : indexed;

        return { 3: { type: "mesh", value: final } };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  };
}
