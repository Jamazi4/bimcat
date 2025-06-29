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
  viewTransform: { x: number; y: number; scale: number };
  selectionRect: { x1: number; y1: number; x2: number; y2: number } | null;
}

const SVGRenderer = ({
  nodeNavigation,
  edges,
  nodeSlots,
  getSlotCenter,
  deleteEdge,
  tempEdgePosition,
  viewTransform,
  selectionRect,
}: SVGRendererProps) => {
  return (
    <svg
      width="100%"
      height="100%"
      className={`absolute top-0 left-0 ${!nodeNavigation && "pointer-events-none"}`}
    >
      <g
        transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}
      >
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
      {selectionRect && (
        <rect
          x={Math.min(selectionRect.x1, selectionRect.x2)}
          y={Math.min(selectionRect.y1, selectionRect.y2)}
          width={Math.abs(selectionRect.x2 - selectionRect.x1)}
          height={Math.abs(selectionRect.y2 - selectionRect.y1)}
          stroke="var(--primary)"
          strokeWidth={1}
          fillOpacity={0.2}
          fill="var(--primary)"
        />
      )}
    </svg>
  );
};

export default SVGRenderer;
