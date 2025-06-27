"use client";

import { useState } from "react";

interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isTemporary?: boolean;
  deleteEdge?: () => void;
}

const EdgeLine = ({
  x1,
  y1,
  x2,
  y2,
  isTemporary = false,
  deleteEdge,
}: EdgeLineProps) => {
  const [hover, setHover] = useState(false);
  const stroke = "var(--secondary-foreground)";
  const hoverStroke = "var(--primary)";

  const applyHover = (isHovering: boolean) => {
    if (isTemporary) return;
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
              deleteEdge();
            }
          }}
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
        />
      )}

      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={hover ? hoverStroke : stroke}
        strokeWidth={2}
        strokeDasharray={isTemporary ? "4 4" : undefined}
        pointerEvents="none"
      />
    </>
  );
};

export default EdgeLine;
