import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store/gestureStore';
import { getHeartPoints, getSpherePoints } from '../../utils/particleGeometry';
import { GestureState } from '../../constants/gestureStates';

/*
// Vertex shader
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader
const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (r > 0.5) discard;
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);
    gl_FragColor = vec4(vColor, glow);
  }
`;
*/

export const ParticleSystem = () => {
    // Optimization: Reduced to 2000 for Intel UHD Graphics (i3 12th Gen)
    const count = 2000;
    const meshRef = useRef<THREE.Points>(null);
    const { currentState } = useGestureStore();

    // Target positions buffer for transitions
    const targets = useRef(new Float32Array(count * 3));

    // Geometry Data
    const [positions] = useMemo(() => {
        const p = getSpherePoints(count, 10); // Start scattered

        // Initialize targets to current positions to avoid collapse
        for (let i = 0; i < count * 3; i++) {
            targets.current[i] = p[i];
        }

        return [p];
    }, []);

    // Handle State Transitions
    useEffect(() => {
        let newPoints: Float32Array;

        switch (currentState) {
            case GestureState.FIVE_FINGERS:
            case GestureState.FIST:
                // Map closed hand OR open hand to Heart for easier testing
                newPoints = getHeartPoints(count, 1.5);
                break;
            case GestureState.SCATTERED:
            default:
                // Default scatter
                newPoints = getSpherePoints(count, 12);
                break;
        }

        // Update targets for animation
        for (let i = 0; i < count * 3; i++) {
            targets.current[i] = newPoints[i];
        }

    }, [currentState]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        const currentPositions = meshRef.current.geometry.attributes.position.array as Float32Array;

        // Lerp factor
        const lerpFactor = 0.05; // Smooth transition speed

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Interpolate position towards target
            currentPositions[i3] += (targets.current[i3] - currentPositions[i3]) * lerpFactor;
            currentPositions[i3 + 1] += (targets.current[i3 + 1] - currentPositions[i3 + 1]) * lerpFactor;
            currentPositions[i3 + 2] += (targets.current[i3 + 2] - currentPositions[i3 + 2]) * lerpFactor;

            // Add Idle Noise (always alive)
            if (currentState === GestureState.FIVE_FINGERS || currentState === GestureState.FIST) {
                // Heartbeat effect
                const beat = Math.sin(time * 3) * 0.03;
                currentPositions[i3] += currentPositions[i3] * beat;
                currentPositions[i3 + 1] += currentPositions[i3 + 1] * beat;
                currentPositions[i3 + 2] += currentPositions[i3 + 2] * beat;
            } else {
                // Gentle drift
                currentPositions[i3 + 1] += Math.sin(time + currentPositions[i3] * 0.1) * 0.005;
                // Slowly rotate the whole cloud via individual particle offset if desired, 
                // but easier to rotate the mesh itself for general spin. 
                // sticking to position drift here.
            }
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;

        // Slow rotation of the entire system
        meshRef.current.rotation.y += 0.001;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            {/* Using standard material for robust visibility */}
            <pointsMaterial
                size={0.15}
                color="#ff69b4" // Hot Pink
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                transparent={true}
                opacity={0.8}
            />
        </points>
    );
};
