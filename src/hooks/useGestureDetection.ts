import { useRef, useState, useEffect } from 'react';

import { Hands, Results, VERSION } from '@mediapipe/hands';
import { useGestureStore } from '../store/gestureStore';
import { GestureState } from '../constants/gestureStates';

export const useGestureDetection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handsRef = useRef<Hands | null>(null);
    const { setGesture, setHandDetected } = useGestureStore();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initHands = async () => {
            console.log("Initializing MediaPipe Hands...");
            try {
                const hands = new Hands({
                    locateFile: (file) => {
                        console.log(`Loading MediaPipe file: ${file}`);
                        return `https://unpkg.com/@mediapipe/hands@${VERSION}/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.6
                });

                hands.onResults(onResults);

                await hands.initialize();

                handsRef.current = hands;
                setIsReady(true);
                console.log("MediaPipe Hands initialized and ready.");
            } catch (error) {
                console.error("Error initializing MediaPipe Hands:", error);
            }
        };

        initHands();
    }, []);

    const onResults = (results: Results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(true);
            const landmarks = results.multiHandLandmarks[0];
            const gesture = detectGesture(landmarks);
            setGesture(gesture, results.multiHandedness[0].score);
        } else {
            setHandDetected(false);
        }
    };

    const detectGesture = (landmarks: any[]): GestureState => {
        const wrist = landmarks[0];

        // Helper: Euclidean distance
        const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        // Check each finger individually
        // -----------------------------

        // Thumb (Id 4): Open if Tip (4) is further from wrist than IP joint (3)
        const thumbOpen = dist(landmarks[4], wrist) > dist(landmarks[3], wrist);

        // Index (Id 8): Open if Tip (8) is further than PIP (6)
        const indexOpen = dist(landmarks[8], wrist) > dist(landmarks[6], wrist);

        // Middle (Id 12): Open if Tip (12) is further than PIP (10)
        const middleOpen = dist(landmarks[12], wrist) > dist(landmarks[10], wrist);

        // Ring (Id 16): Open if Tip (16) is further than PIP (14)
        const ringOpen = dist(landmarks[16], wrist) > dist(landmarks[14], wrist);

        // Pinky (Id 20): Open if Tip (20) is further than PIP (18)
        const pinkyOpen = dist(landmarks[20], wrist) > dist(landmarks[18], wrist);

        // Strict mapping for Valentine's Sequence
        // -------------------------------------

        // 5 Fingers: All Open
        if (thumbOpen && indexOpen && middleOpen && ringOpen && pinkyOpen) {
            return GestureState.FIVE_FINGERS;
        }

        // 4 Fingers: Index, Middle, Ring, Pinky Open AND Thumb Closed
        if (indexOpen && middleOpen && ringOpen && pinkyOpen && !thumbOpen) {
            return GestureState.FOUR_FINGERS;
        }

        // 3 Fingers: Index, Middle, Ring Open (Pinky Closed)
        if (indexOpen && middleOpen && ringOpen && !pinkyOpen) {
            return GestureState.THREE_FINGERS;
        }

        // 2 Fingers: Index, Middle Open (Ring, Pinky Closed)
        if (indexOpen && middleOpen && !ringOpen && !pinkyOpen) {
            return GestureState.TWO_FINGERS;
        }

        // 1 Finger: Index Open (Middle, Ring, Pinky Closed)
        if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
            return GestureState.ONE_FINGER;
        }

        // Fist: All fingers closed (Thumb can be flexible, but usually closed)
        if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
            return GestureState.FIST;
        }

        // If it's some weird combo (like just Pinky up, or 'Rock' sign), treat as scattered
        return GestureState.SCATTERED;
    };

    const processVideo = async () => {
        if (videoRef.current && handsRef.current && isReady) {
            // react-webcam ref points to the component, which has a 'video' property
            const webcam = videoRef.current as any;
            const video = webcam.video;

            if (video && video.readyState === 4) {
                await handsRef.current.send({ image: video });
            }
        }
        requestAnimationFrame(processVideo);
    };

    useEffect(() => {
        if (isReady && videoRef.current) {
            const animationId = requestAnimationFrame(processVideo);
            return () => cancelAnimationFrame(animationId);
        }
    }, [isReady]);

    return { videoRef, isReady };
};
