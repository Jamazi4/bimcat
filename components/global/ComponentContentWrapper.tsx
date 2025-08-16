"use client";

import * as THREE from "three";
import { ComponentGeometry, SelectedRow } from "@/utils/types";
import PsetsList from "../editor/PsetsList";
import Renderer from "../editor/Renderer";
import { ComponentControlsType, Pset } from "@/utils/schemas";
import ComponentControlsPanel from "../editor/ComponentControlsPanel";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  setLiveStateGeometry,
  setLiveStateInfo,
  setLiveStatePsets,
} from "@/lib/downloadIfcSlice";
import { toast } from "sonner";
import { convertGroupToDbGeom } from "@/utils/nodeDefinitions/nodeUtilFunctions";

const ComponentContentWrapper = ({
  componentAuthor,
  componentData,
  componentGeometry,
  componentEditable,
  componentPsets,
  componentId,
  isUsingNodes,
  uiControls,
}: {
  componentAuthor: string;
  componentData: SelectedRow;
  componentGeometry: ComponentGeometry[];
  componentPsets: Pset[] | undefined;
  componentEditable: boolean;
  componentId: string;
  isUsingNodes: boolean;
  uiControls?: ComponentControlsType;
}) => {
  const controlsAvailable = !!uiControls;
  const [paramMeshGroup, _] = useState<THREE.Group | null>(new THREE.Group());
  const [pendingFetch, setPendingFetch] = useState(true); //use to load button
  const [activeControls, setActiveControls] = useState(false);
  const dispatch = useAppDispatch();
  const downloadIfcState = useAppSelector((s) => s.downloadIfcSlice);

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

  useEffect(() => {
    if (downloadIfcState.liveGeometryRequested) {
      if (pendingFetch) {
        toast("Fetching parametric data in progress, try again.");
        return;
      }
      if (!paramMeshGroup || paramMeshGroup?.children?.length < 0) {
        toast("Could not resolve live geometry");
        return;
      }

      const liveStateInfo = {
        info: {
          name: componentData[componentId].name,
          author: componentAuthor,
        },
      };

      const liveStateGeom = convertGroupToDbGeom(paramMeshGroup);

      dispatch(setLiveStatePsets({ psets: componentPsets || [] }));
      dispatch(setLiveStateInfo(liveStateInfo));
      dispatch(setLiveStateGeometry({ geometry: liveStateGeom }));
    }
  }, [
    componentAuthor,
    componentData,
    componentId,
    componentPsets,
    dispatch,
    downloadIfcState.liveGeometryRequested,
    paramMeshGroup,
    paramMeshGroup?.children,
    pendingFetch,
  ]);

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
