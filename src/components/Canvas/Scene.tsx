import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
// import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { ParticleSystem } from './ParticleSystem';
import { Suspense } from 'react';

export const Scene = () => {
    return (
        <div className="w-full h-full absolute top-0 left-0">
            <Canvas
                dpr={[1, 1.5]} // Optimization: Limit pixel ratio for integrated graphics
                gl={{
                    antialias: false,
                    alpha: false,
                    stencil: false,
                    depth: false,
                    powerPreference: "high-performance"
                }}
                performance={{ min: 0.5 }} // Allow degradation to keep FPS up
            >
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
                <color attach="background" args={['#000000']} />

                <Suspense fallback={null}>
                    <ParticleSystem />
                    <Environment preset="city" />
                </Suspense>

                {/* Optimized Post Processing - Disabled for Debugging */}
                {/* <EffectComposer enableNormalPass={false} multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.65} // Higher threshold = fewer glowing pixels = faster
                        mipmapBlur
                        intensity={1.2}
                        radius={0.6}
                    />
                </EffectComposer> */}

                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
};
