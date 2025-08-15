"use client";

import { Canvas } from "@react-three/fiber";
import { Bounds, Grid, OrbitControls } from "@react-three/drei";

import { ComponentGeometry } from "@/utils/types";
import * as THREE from "three";
import { Button } from "../ui/button";
import { Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { mainColor } from "@/utils/threeJsConstants";

const Renderer = ({
  paramGeometry,
  geometry,
  componentId,
  isUsingNodes,
}: {
  paramGeometry: THREE.Group<THREE.Object3DEventMap> | null;
  geometry: ComponentGeometry[];
  componentId: string;
  isUsingNodes: boolean;
}) => {
  const router = useRouter();
  const geometries = geometry.map((geom) => {
    const bufferGeometry = new THREE.BufferGeometry();

    const position = new Float32Array(geom.position);
    bufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(position, 3),
    );

    bufferGeometry.setIndex(geom.indices);
    bufferGeometry.computeVertexNormals();
    return bufferGeometry;
  });

  const handleOpenEditor = () => {
    router.replace(`/visualiser?component=${componentId}`);
  };

  return (
    <div className="relative bg-background border rounded w-full  h-[calc(80vh-4rem)]">
      {isUsingNodes && (
        <Button
          size="icon"
          variant="ghost"
          asChild
          className="absolute top-2 right-2 z-10 cursor-pointer "
          onClick={handleOpenEditor}
        >
          <Workflow className="p-1" />
        </Button>
      )}
      <Canvas
        camera={{ position: [0, 0, 1], up: [0, 0, 1] }}
        className=" h-1/2"
      >
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
          rotation={[Math.PI / 2, 0, 0]}
        />

        <Bounds fit clip margin={1.2}>
          {paramGeometry!.children.length > 0 ? (
            <primitive object={paramGeometry!} />
          ) : (
            <group>
              {geometries.map((geom, index) => {
                for (let index = 0; index < 2; index++) {}
                return (
                  <group key={index} rotation={[Math.PI / 2, 0, 0]}>
                    <mesh geometry={geom} scale={1}>
                      <meshStandardMaterial
                        color={mainColor}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                    <mesh geometry={geom} scale={1}>
                      <meshStandardMaterial color="black" wireframe />
                    </mesh>
                  </group>
                );
              })}
            </group>
          )}
        </Bounds>

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};
export default Renderer;
