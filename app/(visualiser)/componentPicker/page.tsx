"use client";

import MenuBar from "@/components/visualiser/MenuBar";
import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import { type IfcRelationsIndexer } from "@thatopen/components";
import type { Pset } from "@/utils/types";
import { getIfcPsetsById } from "@/utils/ifc/ifcjs";
import PsetAccordion from "@/components/editor/PsetAccordion";
import MeshItem from "@/components/visualiser/MeshItem";

const page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [displayPsets, setDisplayPsets] = useState<Pset[] | null>(null);

  const handlePointerMissed = (e: MouseEvent) => {
    if (e.button !== 0) return;
    console.log(e.button);
    setSelected(null);
    setDisplayPsets(null);
  };

  return (
    <div className="w-full h-[calc(100vh-72px)]">
      {selected && displayPsets && displayPsets.length > 0 && (
        <div className="absolute right-4 top-22 z-10 bg-background-transparent rounded p-4 w-md border max-h-1/2 overflow-scroll overflow-x-hidden">
          <PsetAccordion edit={false} psets={displayPsets} />
        </div>
      )}
      <MenuBar setFile={setFile} file={file} selected={selected} />
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
          <Model
            file={file}
            setSelected={setSelected}
            setDisplayPsets={setDisplayPsets}
            selected={selected}
          />
        )}

        <OrbitControls enableZoom={true} makeDefault />
      </Canvas>
    </div>
  );
};
export default page;

const Model = ({
  file,
  setSelected,
  setDisplayPsets,
  selected,
}: {
  file: File;
  setSelected: Dispatch<SetStateAction<number | null>>;
  setDisplayPsets: Dispatch<SetStateAction<Pset[] | null>>;
  selected: number | null;
}) => {
  const [fragments, setFragments] = useState<FragmentsGroup>();
  const [indexer, setIndexer] = useState<IfcRelationsIndexer | null>(null);

  const colorHighlighted = new THREE.Color().setRGB(0.9, 0.1, 0.9);

  const { scene } = useThree();

  useEffect(() => {
    const loadModel = async () => {
      const components = new OBC.Components();
      const loader = components.get(OBC.IfcLoader);
      const indexer = components.get(OBC.IfcRelationsIndexer);

      await loader.setup();
      // loader.settings.webIfc.COORDINATE_TO_ORIGIN = false;

      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await loader.load(buffer);
      await indexer.process(model);

      setIndexer(indexer);
      setFragments(model);

      return () => {
        if (fragments) {
          scene.remove(fragments);
          fragments.dispose();
        }
      };
    };

    loadModel();
  }, [file]);

  if (!fragments) return;

  const retrievePsets = async (id: number) => {
    if (!indexer) return;
    let psets = [];
    psets = await getIfcPsetsById(fragments, indexer, id); //granted that the indexer already processed the model
    setDisplayPsets(psets);
  };

  const handleMeshClick = (e: ThreeEvent<MouseEvent>, id: number) => {
    e.stopPropagation();
    retrievePsets(id);
    setSelected(id);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "default";
  };

  const handlePointerMissed = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {fragments.items.map((obj, index) => (
        <MeshItem
          key={index}
          obj={obj}
          selectedId={selected}
          onMeshClick={handleMeshClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onPointerMissed={handlePointerMissed}
          colorHighlighted={colorHighlighted}
        />
      ))}
    </>
  );
};
