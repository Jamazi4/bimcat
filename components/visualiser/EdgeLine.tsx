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

  return (
    <>
      {!isTemporary && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth={12}
          onMouseEnter={() => applyHover(true)}
          onMouseLeave={() => applyHover(false)}
          onClick={() => {
            if (deleteEdge) {
              if (!nodeNavigation) return;
              deleteEdge();
            }
          }}
          style={{
            pointerEvents: nodeNavigation ? "stroke" : "none",
            cursor: nodeNavigation ? "pointer" : "default",
          }}
        />
      )}

      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={hover ? hoverStroke : stroke}
        strokeWidth={5}
        strokeDasharray={isTemporary ? "4 4" : undefined}
        pointerEvents="none"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={hover ? hoverStrokeInside : strokeInside}
        strokeWidth={2}
        strokeDasharray={isTemporary ? "4 4" : undefined}
        pointerEvents="none"
      />
    </>
  );
};

export default EdgeLine;
