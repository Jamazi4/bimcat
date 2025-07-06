import { useMemo, useRef } from "react";
import equal from "fast-deep-equal";
import { GeomNodeBackType, RuntimeNode } from "../nodeTypes";
function useRuntimeNodes(nodes: GeomNodeBackType[]) {
  const prev = useRef<RuntimeNode[]>([]);

  const filtered = useMemo(() => {
    const minimal: RuntimeNode[] = nodes.map((n) => {
      return { id: n.id, type: n.type, values: { ...(n.values || {}) } };
    });
    if (equal(prev.current, minimal)) return prev.current;
    prev.current = minimal;
    return minimal;
  }, [nodes]);
  return filtered;
}

export default useRuntimeNodes;
