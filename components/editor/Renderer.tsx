"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Grid, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";

import { ComponentGeometry } from "@/utils/types";
import * as THREE from "three";

const Renderer = ({ geometry }: { geometry: ComponentGeometry[] }) => {
  const group = new THREE.Group();
  const geometries = geometry.map((geom) => {
    const bufferGeometry = new THREE.BufferGeometry();
    const position = new Float32Array(geom.position);
    bufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(position, 3)
    );
    bufferGeometry.setIndex(geom.indices);
    bufferGeometry.computeVertexNormals();
    return bufferGeometry;
  });

  // const bufferGeometry = useMemo(() => {
  //   if (!geometry) return null;
  //   const geo = new THREE.BufferGeometry();
  //   const position = new Float32Array(geometry.position);

  //   geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  //   geo.setIndex(geometry.indices);
  //   geo.computeVertexNormals();
  //   return geo;
  // }, [geometry]);

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
          <group>
            {geometries.map((geom, index) => {
              for (let index = 0; index < 2; index++) {}
              return (
                <group key={index}>
                  <mesh geometry={geom} scale={0.001}>
                    <meshStandardMaterial color="orange" />
                  </mesh>
                  <mesh geometry={geom} scale={0.001}>
                    <meshStandardMaterial color="black" wireframe />
                  </mesh>
                </group>
              );
            })}
          </group>

          {/* <>
              <mesh geometry={bufferGeometry} scale={0.001}>
                <meshStandardMaterial color="orange" />
              </mesh>
              <mesh geometry={bufferGeometry} scale={0.001}>
                <meshStandardMaterial color="black" wireframe />
              </mesh>
            </> */}
        </Bounds>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};
export default Renderer;
