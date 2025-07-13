import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Fragment } from "@thatopen/fragments";

const MeshItem = ({
  obj,
  selectedId,
  onMeshClick,
  onPointerOver,
  onPointerOut,
  onPointerMissed,
  colorHighlighted,
}: {
  obj: Fragment;
  selectedId: number | null;
  onMeshClick: (e: ThreeEvent<MouseEvent>, id: number) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  onPointerMissed: (e: MouseEvent) => void;
  colorHighlighted: THREE.Color;
}) => {
  const id = obj.ids.values().next().value!;
  const transform = obj.get(id).transforms[0];
  const curColor = useMemo(
    () => obj.get(id).colors?.[0] || new THREE.Color(0xd1d1d1),
    [id, obj],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: curColor,
        side: THREE.DoubleSide,
      }),
    [curColor],
  );

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
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerMissed={onPointerMissed}
    />
  );
};

export default MeshItem;
