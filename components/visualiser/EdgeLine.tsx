"use client";

import { useState } from "react";

interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isTemporary?: boolean;
  deleteEdge?: () => void;
  nodeNavigation: boolean;
}

const EdgeLine = ({
  x1,
  y1,
  x2,
  y2,
  isTemporary = false,
  deleteEdge,
  nodeNavigation,
}: EdgeLineProps) => {
  const [hover, setHover] = useState(false);
  const stroke = "var(--background)";
  const hoverStroke = "var(--primary)";

  const strokeInside = "var(--primary)";
  const hoverStrokeInside = "var(--primary)";

  const applyHover = (isHovering: boolean) => {
    if (!nodeNavigation || isTemporary) return;
    setHover(isHovering);
  };

  const dx = Math.abs(x2 - x1);
  const controlOffsetX = Math.max(dx * 0.5, 40);
  const controlPoint1 = { x: x1 + controlOffsetX, y: y1 };
  const controlPoint2 = { x: x2 - controlOffsetX, y: y2 };

  const pathD = `M ${x1},${y1} C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${x2},${y2}`;

  return (
    <>
      {/* Invisible stroke for interactivity */}
      {!isTemporary && (
        <path
          d={pathD}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          onMouseEnter={() => applyHover(true)}
          onMouseLeave={() => applyHover(false)}
          onClick={() => {
            if (deleteEdge && nodeNavigation) {
              deleteEdge();
            }
          }}
          style={{
            pointerEvents: nodeNavigation ? "stroke" : "none",
            cursor: nodeNavigation ? "pointer" : "default",
          }}
        />
      )}

      {/* Outer stroke */}
      <path
        d={pathD}
        stroke={hover ? hoverStroke : stroke}
        strokeWidth={5}
        fill="none"
        strokeDasharray={isTemporary ? "4 4" : undefined}
        pointerEvents="none"
      />

      {/* Inner stroke */}
      <path
        d={pathD}
        stroke={hover ? hoverStrokeInside : strokeInside}
        strokeWidth={2}
        fill="none"
        strokeDasharray={isTemporary ? "4 4" : undefined}
        pointerEvents="none"
      />
    </>
  );
};

export default EdgeLine;
