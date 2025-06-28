"use client";

import { useCallback } from "react";
import { GeomNodeBackType, NodeEdgeType } from "../schemas";
import * as THREE from "three";

interface useNodesRuntimeProps {
  nodes: GeomNodeBackType[];
  edges: NodeEdgeType[];
  meshGroup: THREE.Group;
}

const useNodesRuntime = ({ nodes, edges, meshGroup }: useNodesRuntimeProps) => {
  const getChildrenNodes = useCallback(
    (parentId: string) => {
      const edgesToParent = edges.filter((edge) => edge.toNodeId === parentId);
      const childrenNodes = edgesToParent
        .map((edge) => nodes.find((node) => node.id === edge.fromNodeId))
        .filter((node): node is GeomNodeBackType => node !== undefined);
      return childrenNodes;
    },
    [edges, nodes],
  );

  const startNodeRuntime = useCallback(() => {
    try {
      const outputs = nodes.filter((node) => node.type === "output");

      const finalEdge = edges.find((edge) => edge.toNodeId === outputs[0].id);
      if (!finalEdge) throw new Error("Nothing connected to output");

      const prevNode = nodes.find((node) => node.id === finalEdge?.fromNodeId);
      if (!prevNode) throw new Error("Could not find node");

      const valueNodes = getChildrenNodes(prevNode.id);
      if (!valueNodes || valueNodes.length === 0)
        throw new Error("Wrong values");

      const valueNodesFiltered = valueNodes.filter(
        (node): node is GeomNodeBackType & { values: string } =>
          node.values !== undefined,
      );

      if (valueNodesFiltered.length !== 3) throw new Error("Not enough values");

      const valuesParsed = valueNodesFiltered.flatMap((node) =>
        node.values.map((val) => {
          const value = parseFloat(val);
          if (!isNaN(value)) {
            return parseFloat(val);
          } else {
            return 0;
          }
        }),
      );

      const geom = new THREE.BufferGeometry();

      //assuming that prevnodes output is point
      const vert = new Float32Array(valuesParsed);
      geom.setAttribute("position", new THREE.BufferAttribute(vert, 3));

      const col = new THREE.Color(0x7aadfa);
      const mat = new THREE.PointsMaterial({
        color: col,
        size: 0.05,
        sizeAttenuation: true,
      });

      const mesh = new THREE.Points(geom, mat);
      meshGroup.clear();
      meshGroup.add(mesh);
    } catch (error) {
      meshGroup.clear();
    }
  }, [edges, nodes, meshGroup, getChildrenNodes]);

  return startNodeRuntime;
};

export default useNodesRuntime;
