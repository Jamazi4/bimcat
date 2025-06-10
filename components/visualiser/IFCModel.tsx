import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { Pset } from "@/utils/schemas";
import { FragmentsGroup } from "@thatopen/fragments";
import { IfcRelationsIndexer } from "@thatopen/components";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { getIfcPsetsById } from "@/utils/ifc/ifcjs";
import MeshItem from "./MeshItem";

const IFCModel = ({
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

      const data = await file.arrayBuffer();
      const buffer = new Uint8Array(data);
      const model = await loader.load(buffer);
      await indexer.process(model);

      setIndexer(indexer);
      setFragments(model);

      // Cleanup will refer to *this* instance
      return () => {
        scene.remove(model);
        model.dispose();
      };
    };

    let cleanup: (() => void) | undefined;

    loadModel().then((clean) => {
      cleanup = clean;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [file, scene]);

  if (!fragments) return;

  const retrievePsets = async (id: number) => {
    if (!indexer) return;
    let psets: Pset[] = [];
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
export default IFCModel;
