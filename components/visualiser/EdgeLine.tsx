"use client";

interface EdgeLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isTemporary?: boolean;
}

const EdgeLine = ({ x1, y1, x2, y2, isTemporary = false }: EdgeLineProps) => {
  return (
    <line
      className="z-50"
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isTemporary ? "white" : "white"}
      strokeWidth="2"
      strokeDasharray={isTemporary ? "4 4" : undefined}
      markerEnd={!isTemporary ? "url(#arrowhead)" : undefined}
    />
  );
};

export default EdgeLine;
