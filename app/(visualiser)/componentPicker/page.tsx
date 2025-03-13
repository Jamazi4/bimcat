"use client";

import MenuBar from "@/components/visualiser/MenuBar";
import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const page = () => {
  return (
    <div className="w-full h-[calc(100vh-72px)]">
      <MenuBar />
      <Canvas camera={{ position: [0, 1, 0] }}>
        <ambientLight intensity={2} />
        <pointLight
          position={[-10, 10, -10]}
          decay={0}
          intensity={Math.PI / 2}
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

        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
};
export default page;
