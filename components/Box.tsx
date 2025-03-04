"use client";

import * as THREE from "three";
import React, { useRef, useState } from "react";
import { useFrame, ThreeElements } from "@react-three/fiber";

function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 2.5 : 2}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "#2f74c0"} />
    </mesh>
  );
}
export default Box;
