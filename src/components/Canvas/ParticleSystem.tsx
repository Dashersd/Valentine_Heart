import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store/gestureStore';
import { getHeartPoints, getSpherePoints, getTextPoints, getMixedPoints, getSmileyPoints } from '../../utils/particleGeometry';
import { GestureState } from '../../constants/gestureStates';

/*
// Vertex shader...
*/

export const ParticleSystem = () => {
    // Optimization: Reduced to 2000 for Intel UHD Graphics (i3 12th Gen)
    // Update: Increased for better text definition
    const count = 4000;
    const meshRef = useRef<THREE.Points>(null);
    const { currentState } = useGestureStore();

    // ... existing refs ...

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
            case GestureState.FIST:
                // Close Hand = Heart Particle Formation
                newPoints = getHeartPoints(count, 1.5);
                break;

            case GestureState.ONE_FINGER:
                // 1 finger = Will you
                newPoints = getTextPoints("Will you", count, 1.0);
                break;

            case GestureState.TWO_FINGERS:
                // 2 Finger = Be my
                newPoints = getTextPoints("Be my", count, 1.0);
                break;

            case GestureState.THREE_FINGERS:
                // 3 Finger = Valentine
                newPoints = getTextPoints("Valentine", count, 0.8);
                break;

            case GestureState.FOUR_FINGERS:
                // 4 Finger = Will you be my Valentine -> Split into two lines
                {
                    // "Will you be"
                    const line1 = getTextPoints("Will you be", count, 0.4);
                    // "my Valentine?"
                    const line2 = getTextPoints("my Valentine?", count, 0.4);

                    // Shift line 1 up and line 2 down (reduced spacing)
                    for (let i = 0; i < line1.length; i += 3) { line1[i + 1] += 1.5; }
                    for (let i = 0; i < line2.length; i += 3) { line2[i + 1] -= 1.5; }

                    newPoints = getMixedPoints(line1, line2, 0.5);
                }
                break;

            case GestureState.FIVE_FINGERS:
                // 5 Finger = Thank you + Smiley
                {
                    const smiley = getSmileyPoints(count, 2.5); // Smaller Smiley
                    const text = getTextPoints("Thank You!", count, 0.4); // Smaller Text

                    // Shift text down below smiley (reduced gap)
                    for (let i = 0; i < text.length; i += 3) { text[i + 1] -= 3.5; }

                    // Mix: 70% smiley, 30% text (mostly smiley face)
                    newPoints = getMixedPoints(smiley, text, 0.7);
                }
                break;

            case GestureState.SCATTERED:
            default:
                // No Hands = Scatter Particles
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
        const lerpFactor = 0.1; // Faster smooth transition speed

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

        // Slow rotation of the entire system has been removed so words do not rotate
        // meshRef.current.rotation.y += 0.001;
    });

    useEffect(() => {
        // Force reset any rotation that might have gotten stuck during hot-reloads
        if (meshRef.current) {
            meshRef.current.rotation.set(0, 0, 0);
        }
    }, []);

    return (
        <points ref={meshRef} rotation={[0, 0, 0]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
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
