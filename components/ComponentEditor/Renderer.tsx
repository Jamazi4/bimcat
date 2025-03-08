"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Grid, OrbitControls } from "@react-three/drei";
import { fetchGeometryAction } from "@/utils/actions";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import { ComponentGeometry } from "@/utils/types";
import * as THREE from "three";

const Renderer = ({ id }: { id: string }) => {
  const [geometry, setGeometry] = useState<
    ComponentGeometry | null | undefined
  >(null);

  useEffect(() => {
    const asyncFetch = async () => {
      const response = await fetchGeometryAction(id);
      setGeometry(response);
    };
    asyncFetch();
  }, []);

  const bufferGeometry = useMemo(() => {
    if (!geometry) return null;
    const geo = new THREE.BufferGeometry();
    const position = new Float32Array(geometry.position);

    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setIndex(geometry.indices);
    geo.computeVertexNormals();
    return geo;
  }, [geometry]);

  return (
    <div className="bg-muted rounded border w-auto aspect-square">
      <Canvas camera={{ position: [0, 1, 0] }}>
        <ambientLight intensity={2} />
        <pointLight
          position={[-10, 10, -10]}
          decay={0}
          intensity={Math.PI / 2}
        />
        <Grid
          cellThickness={0.1}
          cellSize={100}
          sectionColor={"#8b8b8b"}
          fadeDistance={40}
          infiniteGrid={true}
        />

        <Bounds fit clip observe margin={1.2}>
          {bufferGeometry && (
            <>
              <mesh geometry={bufferGeometry} scale={0.01}>
                <meshStandardMaterial color="orange" />
              </mesh>
              <mesh geometry={bufferGeometry} scale={0.01}>
                <meshStandardMaterial color="black" wireframe />
              </mesh>
            </>
          )}
        </Bounds>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};
export default Renderer;
