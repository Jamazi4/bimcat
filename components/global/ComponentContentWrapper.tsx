"use client";

import * as THREE from "three";
import { ComponentGeometry } from "@/utils/types";
import PsetsList from "../editor/PsetsList";
import Renderer from "../editor/Renderer";
import { ComponentControlsType, Pset } from "@/utils/schemas";
import ComponentControlsPanel from "../editor/ComponentControlsPanel";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useCallback, useEffect, useState } from "react";

const ComponentContentWrapper = ({
  componentGeometry,
  componentEditable,
  componentPsets,
  componentId,
  isUsingNodes,
  uiControls,
}: {
  componentGeometry: ComponentGeometry[];
  componentPsets: Pset[] | undefined;
  componentEditable: boolean;
  componentId: string;
  isUsingNodes: boolean;
  uiControls?: ComponentControlsType;
}) => {
  const controlsAvailable = !!uiControls;
  const [paramMeshGroup, setParamMeshGroup] = useState<THREE.Group | null>(
    new THREE.Group(),
  );
  const [pendingFetch, setPendingFetch] = useState(true); //use to load button
  const [activeControls, setActiveControls] = useState(false);

  const ns = useNodeSystem(paramMeshGroup!);
  const { fetchNodes, changeNodeValue } = ns;

  const fetchNodesWrapper = useCallback(async () => {
    if (!activeControls) return;
    await fetchNodes(componentId);
    setPendingFetch(false);
  }, [componentId, activeControls, fetchNodes]);

  useEffect(() => {
    fetchNodesWrapper();
  }, [ns.fetchNodes, fetchNodesWrapper]);

  return (
    <div>
      <div
        className="justify-center grid grid-cols-1 lg:grid-cols-6
   gap-4 sm:w-2/3 sm:mx-auto lg:w-full mx-auto"
      >
        <div className="lg:col-span-4">
          {componentGeometry ? (
            <Renderer
              paramGeometry={paramMeshGroup}
              geometry={componentGeometry}
              componentId={componentId}
              isUsingNodes={isUsingNodes}
            />
          ) : (
            <div>Please wait...</div>
          )}
        </div>
        <div className="lg:col-span-2">
          <PsetsList
            psets={componentPsets ?? []}
            editable={componentEditable}
          />
        </div>
      </div>
      {controlsAvailable && (
        <ComponentControlsPanel
          paramMeshGroup={paramMeshGroup}
          activeControls={activeControls}
          setActiveControls={setActiveControls}
          uiControls={uiControls}
          changeNodeValue={changeNodeValue}
        />
      )}
    </div>
  );
};

export default ComponentContentWrapper;
