"use client";

import MenuBar from "@/components/visualiser/MenuBar";
import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { Pset } from "@/utils/schemas";
import PsetAccordion from "@/components/editor/PsetAccordion";
import IFCModel from "@/components/visualiser/IFCModel";
import NodeEditor from "@/components/visualiser/NodeEditor";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [displayPsets, setDisplayPsets] = useState<Pset[] | null>(null);
  const [nodeMode, setNodeMode] = useState(false);
  const [nodeNavigation, setNodeNavigation] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const componentId = searchParams.get("component");
    if (!componentId) return;

    setNodeMode(true);
  }, [searchParams]);

  const handlePointerMissed = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setSelected(null);
    setDisplayPsets(null);
  };

  return (
    <div className="w-full h-[calc(100vh-72px)]">
      {selected && displayPsets && displayPsets.length > 0 && (
        <div className="absolute right-4 top-22 z-10 bg-background-transparent rounded p-4 w-xs border max-h-1/2 overflow-scroll overflow-x-hidden">
          <PsetAccordion edit={false} psets={displayPsets} />
        </div>
      )}
      {nodeMode && (
        <NodeEditor
          nodeNavigation={nodeNavigation}
          setNodeNavigation={setNodeNavigation}
        />
      )}
      <MenuBar
        setFile={setFile}
        file={file}
        selected={selected}
        nodeMode={nodeMode}
      />
      <Canvas
        camera={{ position: [0, 1, 0] }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[-100, 100, -100]} intensity={0.5} />

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

        <OrbitControls
          enabled={!nodeNavigation}
          enableZoom={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
};
export default Page;
