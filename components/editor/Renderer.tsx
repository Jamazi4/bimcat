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
  }, [id]);

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
    <div className="bg-muted rounded border w-full aspect-square">
      <Canvas camera={{ position: [0, 1, 0] }} className="w-full">
        <ambientLight intensity={2} />
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

        <Bounds fit clip observe margin={1.2}>
          {bufferGeometry && (
            <>
              <mesh geometry={bufferGeometry} scale={0.001}>
                <meshStandardMaterial color="orange" />
              </mesh>
              <mesh geometry={bufferGeometry} scale={0.001}>
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
