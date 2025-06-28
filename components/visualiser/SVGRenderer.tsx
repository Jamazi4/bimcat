import { NodeSlot } from "@/utils/customHooks/useNodeSystem";
import { NodeEdgeType } from "@/utils/schemas";
import EdgeLine from "./EdgeLine";

interface SVGRendererProps {
  nodeNavigation: boolean;
  edges: NodeEdgeType[];
  nodeSlots: NodeSlot[];
  getSlotCenter: (element: SVGSVGElement) => { iconX: number; iconY: number };
  deleteEdge: (edgeId: string) => void;
  tempEdgePosition: { x1: number; y1: number; x2: number; y2: number } | null;
  zoom: number;
}

const SVGRenderer = ({
  nodeNavigation,
  edges,
  nodeSlots,
  getSlotCenter,
  deleteEdge,
  tempEdgePosition,
  zoom,
}: SVGRendererProps) => {
  return (
    <svg
      width="100%"
      height="100%"
      className={`absolute top-0 left-0 ${!nodeNavigation && "pointer-events-none"}`}
    >
      <g transform={`scale(${zoom})`}>
        {edges.map((edge) => {
          const sourceIcon = nodeSlots.find(
            (fns) =>
              fns.nodeId === edge.fromNodeId && fns.slotId === edge.fromSlotId,
          )?.el;
          const targetIcon = nodeSlots.find(
            (tns) =>
              tns.nodeId === edge.toNodeId && tns.slotId === edge.toSlotId,
          )?.el;
          if (!sourceIcon || !targetIcon) return null;

          const { iconX: sourceX, iconY: sourceY } = getSlotCenter(sourceIcon);
          const { iconX: targetX, iconY: targetY } = getSlotCenter(targetIcon);

          return (
            <EdgeLine
              deleteEdge={deleteEdge.bind(null, edge.id)}
              key={edge.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              nodeNavigation={nodeNavigation}
            />
          );
        })}
        {tempEdgePosition && (
          <EdgeLine
            x1={tempEdgePosition.x1}
            y1={tempEdgePosition.y1}
            x2={tempEdgePosition.x2}
            y2={tempEdgePosition.y2}
            isTemporary
            nodeNavigation={nodeNavigation}
          />
        )}
      </g>
    </svg>
  );
};

export default SVGRenderer;
