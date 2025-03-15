"use client";

import MenuBar from "@/components/visualiser/MenuBar";
import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { FragmentsGroup } from "@thatopen/fragments";
import { type IfcRelationsIndexer } from "@thatopen/components";

const page = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handlePointerMissed = (e: MouseEvent) => {
    console.log("nothing selected");
    setSelected(null);
  };

  return (
    <div className="w-full h-[calc(100vh-72px)]">
      {selected && <p className="absolute right-4 top-18">selection</p>}
      <MenuBar setFile={setFile} />
      <Canvas
        camera={{ position: [0, 1, 0] }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={2} />
        <directionalLight
          position={[-10, 10, -10]}
          intensity={Math.PI / 2}
          rotateX={12}
        />
        <Grid
          side={2}
          sectionSize={1}
          cellThickness={0.1}
          cellSize={1}
          sectionColor={"#8b8b8b"}
          fadeDistance={40}
          infiniteGrid={true}
        />
        {file && <Model file={file} setSelected={setSelected} />}

        <OrbitControls enableZoom={true} makeDefault />
      </Canvas>
    </div>
  );
};
export default page;

const Model = ({
  file,
  setSelected,
}: {
  file: File;
  setSelected: Dispatch<SetStateAction<number | null>>;
}) => {
  // const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);
  const [fragments, setFragments] = useState<FragmentsGroup>();
  const [indexer, setIndexer] = useState<IfcRelationsIndexer | null>(null);

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

  const displayPsets = (id: number) => {
    const psetIds = indexer?.getEntityRelations(fragments, id, "IsDefinedBy");
    psetIds?.map(async (psetId) => {
      const pset = await fragments.getProperties(psetId);
      console.log(pset);
    });

    console.log(id);
  };

  const colorHighlighted = new THREE.Color().setRGB(0.9, 0.1, 0.9);

  const handlePointerOver = (
    e: ThreeEvent<PointerEvent>,
    material: THREE.MeshBasicMaterial
  ) => {
    e.stopPropagation();
    console.log("Pointer over!", e.object);
    document.body.style.cursor = "pointer";
    material.color = colorHighlighted;
  };

  const handlePointerOut = (
    e: ThreeEvent<PointerEvent>,
    material: THREE.MeshBasicMaterial,
    curColor: THREE.Color | undefined
  ) => {
    e.stopPropagation();
    console.log("Pointer out!");
    document.body.style.cursor = "default";
    material.color = curColor!;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>, id: number) => {
    e.stopPropagation();
    // console.log("Clicked!", e.object.userData);
    displayPsets(id);
    setSelected(id);
  };

  return (
    <>
      {fragments.items.map((obj, index) => {
        const mesh = obj.mesh;
        const id = obj.ids.values().next().value!;
        const transform = obj.get(id).transforms[0];
        const curColor = obj.get(id).colors?.[0];
        const material = new THREE.MeshBasicMaterial({
          color: curColor,
        });

        return (
          <mesh
            key={index}
            geometry={mesh.geometry}
            material={material}
            matrix={transform}
            matrixAutoUpdate={false}
            userData={{ expressId: id }}
            // scale={0.01}
            onPointerOver={(e) => {
              handlePointerOver(e, material);
            }}
            onPointerOut={(e) => {
              handlePointerOut(e, material, curColor);
            }}
            onClick={(e) => {
              handleClick(e, id);
            }}
          ></mesh>
        );
      })}
    </>
  );
};
