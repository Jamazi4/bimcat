import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";

const MeshItem = ({
  obj,
  selectedId,
  onMeshClick,
  onPointerOver,
  onPointerOut,
  onPointerMissed,
  colorHighlighted,
}: {
  obj: any;
  selectedId: number | null;
  onMeshClick: (e: ThreeEvent<MouseEvent>, id: number) => void;
  onPointerOver: (
    e: ThreeEvent<PointerEvent>,
    material: THREE.MeshStandardMaterial
  ) => void;
  onPointerOut: (
    e: ThreeEvent<PointerEvent>,
    material: THREE.MeshStandardMaterial,
    curColor: THREE.Color
  ) => void;
  onPointerMissed: (
    e: MouseEvent,
    material: THREE.MeshStandardMaterial,
    curColor: THREE.Color
  ) => void;
  colorHighlighted: THREE.Color;
}) => {
  const id = obj.ids.values().next().value!;
  const transform = obj.get(id).transforms[0];
  const curColor = obj.get(id).colors?.[0] || new THREE.Color(0xd1d1d1);

  // Create a persistent material instance once for each mesh.
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: curColor }),
    [curColor]
  );

  // Update the material color based on selection.
  useEffect(() => {
    if (selectedId === id) {
      material.color.set(colorHighlighted);
    } else {
      material.color.set(curColor);
    }
  }, [selectedId, id, curColor, material, colorHighlighted]);

  return (
    <mesh
      geometry={obj.mesh.geometry}
      material={material}
      matrix={transform}
      matrixAutoUpdate={false}
      userData={{ expressId: id }}
      onClick={(e) => onMeshClick(e, id)}
      onPointerOver={(e) => onPointerOver(e, material)}
      onPointerOut={(e) => onPointerOut(e, material, curColor)}
      onPointerMissed={(e) => onPointerMissed(e, material, curColor)}
    />
  );
};

export default MeshItem;
