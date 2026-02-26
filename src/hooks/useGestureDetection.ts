import { useRef, useState, useEffect, useCallback } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { useGestureStore } from '../store/gestureStore';
import { GestureState } from '../constants/gestureStates';

export const useGestureDetection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const handsRef = useRef<Hands | null>(null);
    const initializationRef = useRef(false);
    const animationIdRef = useRef<number | null>(null);
    const { setGesture, setHandDetected } = useGestureStore();
    const [isReady, setIsReady] = useState(false);

    // Fix: Define onResults with useCallback BEFORE it is passed to hands.onResults
    const onResults = useCallback((results: Results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandDetected(true);
            const landmarks = results.multiHandLandmarks[0];
            const gesture = detectGesture(landmarks);
            setGesture(gesture, results.multiHandedness[0].score);
        } else {
            setHandDetected(false);
            setGesture(GestureState.SCATTERED, 0);
        }
    }, [setGesture, setHandDetected]);

    const detectGesture = (landmarks: any[]): GestureState => {
        const wrist = landmarks[0];

        // Helper: Euclidean distance
        const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

        // Check each finger individually
        // -----------------------------

        // Thumb (Id 4): Open logic improved
        // Comparison: Distance from ThumbTip(4) to IndexMCP(5) vs Palm Scale (Wrist(0) -> IndexMCP(5))
        // If thumb is tucked, tip is close to index base. If extended, it's far.
        const palmScale = dist(landmarks[0], landmarks[5]);
        const thumbIndexDist = dist(landmarks[4], landmarks[5]);
        // Threshold: 0.3 * palmScale implies thumb is somewhat extended.
        const thumbOpen = thumbIndexDist > (palmScale * 0.4);

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
        // 4 Fingers (Index...Pinky Open)
        // If these 4 are open, it's either 4 or 5 fingers.
        if (indexOpen && middleOpen && ringOpen && pinkyOpen) {
            if (thumbOpen) {
                return GestureState.FIVE_FINGERS;
            } else {
                return GestureState.FOUR_FINGERS;
            }
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

    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        const initHands = async () => {
            console.log("Initializing MediaPipe Hands...");
            try {
                const hands = new Hands({
                    locateFile: (file) => {
                        console.log(`Loading MediaPipe file: ${file}`);
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    }
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.6,
                    minTrackingConfidence: 0.6
                });

                // Fix: onResults is now defined above via useCallback so it's always available
                hands.onResults(onResults);

                await hands.initialize();

                handsRef.current = hands;
                setIsReady(true);
                console.log("MediaPipe Hands initialized and ready.");
            } catch (error) {
                console.error("Error initializing MediaPipe Hands:", error);
                initializationRef.current = false; // Allow retry on error
            }
        };

        initHands();

        // Cleanup function
        return () => {
            if (handsRef.current) {
                handsRef.current.close();
                handsRef.current = null;
            }
        };
    }, [onResults]);

    // Fix: processVideo is defined as a useCallback so it has stable identity
    // and can properly be cancelled via the ref-tracked animation frame ID.
    const processVideo = useCallback(async () => {
        if (videoRef.current && handsRef.current) {
            try {
                // react-webcam ref points to the component, which has a 'video' property
                const webcam = videoRef.current as any;
                const video = webcam.video;

                if (video && video.readyState === 4) {
                    await handsRef.current.send({ image: video });
                }
            } catch (error) {
                console.error("Error in gesture detection loop:", error);
            }
        }
        // Fix: Store the animation frame ID so we can cancel it on unmount
        animationIdRef.current = requestAnimationFrame(processVideo);
    }, []);

    useEffect(() => {
        if (isReady) {
            console.log("Starting gesture detection loop...");
            animationIdRef.current = requestAnimationFrame(processVideo);
            return () => {
                // Fix: Cancel the stored animation frame ID to stop the loop on unmount
                if (animationIdRef.current !== null) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }
            };
        }
    }, [isReady, processVideo]);

    return { videoRef, isReady };
};
