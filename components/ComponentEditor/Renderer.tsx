"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Box from "./Box";

const Renderer = () => {
  return (
    <div className="bg-muted rounded border w-auto mr-6 aspect-square">
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Box position={[0, 0, 0]} />
        <OrbitControls autoRotate autoRotateSpeed={0.1} enableZoom={false} />
      </Canvas>
    </div>
  );
};
export default Renderer;
