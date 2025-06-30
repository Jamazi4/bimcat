"use client";

import MenuBar from "@/components/visualiser/MenuBar";
import {
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { Pset } from "@/utils/schemas";
import PsetAccordion from "@/components/editor/PsetAccordion";
import IFCModel from "@/components/visualiser/IFCModel";
import NodeEditor from "@/components/visualiser/NodeEditor";
import { useSearchParams } from "next/navigation";
import * as THREE from "three";

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [displayPsets, setDisplayPsets] = useState<Pset[] | null>(null);
  const [nodeMode, setNodeMode] = useState(false);
  const [nodeNavigation, setNodeNavigation] = useState(false);
  const [nodeMeshGroup, setNodeMeshGroup] = useState<THREE.Group | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const componentId = searchParams.get("component");
    if (!componentId) return;

    setNodeMode(true);
    const group = new THREE.Group();
    setNodeMeshGroup(group);
  }, [searchParams]);

  const handlePointerMissed = (e: MouseEvent) => {
    if (e.button !== 0 && nodeNavigation) return;
    setSelected(null);
    setDisplayPsets(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden">
      {selected && displayPsets && displayPsets.length > 0 && (
        <div className="absolute right-4 top-22 z-10 bg-background-transparent rounded p-4 w-xs border max-h-1/2 overflow-scroll overflow-x-hidden">
          <PsetAccordion edit={false} psets={displayPsets} />
        </div>
      )}
      <MenuBar
        setFile={setFile}
        file={file}
        selected={selected}
        nodeMode={nodeMode}
      />
      <Canvas
        className={`${nodeNavigation === true && "pointer-events-none"}`}
        camera={{ position: [0, 1, 0] }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[-100, 100, -100]} intensity={1} />
        <directionalLight position={[100, 50, 30]} intensity={5} />

        <Grid
          side={2}
          sectionSize={1}
          cellThickness={0.1}
          cellSize={1}
          sectionColor={"#8b8b8b"}
          fadeDistance={40}
          infiniteGrid={true}
        />
        {file && (
          <IFCModel
            file={file}
            setSelected={setSelected}
            setDisplayPsets={setDisplayPsets}
            selected={selected}
          />
        )}

        {nodeMode && <primitive object={nodeMeshGroup!} />}

        <OrbitControls
          enabled={!nodeNavigation}
          enableZoom={true}
          makeDefault
        />
        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
          {/* alternative: <GizmoViewcube /> */}
        </GizmoHelper>
      </Canvas>
      {nodeMode && (
        <NodeEditor
          nodeNavigation={nodeNavigation}
          setNodeNavigation={setNodeNavigation}
          nodeMeshGroup={nodeMeshGroup!}
        />
      )}
    </div>
  );
};
export default Page;
