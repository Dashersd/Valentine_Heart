import { create } from 'zustand';
import { GestureState } from '../constants/gestureStates';

interface GestureStore {
    currentState: GestureState;
    previousState: GestureState;
    handDetected: boolean;
    confidence: number;
    setGesture: (state: GestureState, confidence: number) => void;
    setHandDetected: (detected: boolean) => void;
}

export const useGestureStore = create<GestureStore>((set) => ({
    currentState: GestureState.SCATTERED,
    previousState: GestureState.SCATTERED,
    handDetected: false,
    confidence: 0,
    setGesture: (state, confidence) =>
        set((s) => {
            if (s.currentState === state) return s;
            return { currentState: state, previousState: s.currentState, confidence };
        }),
    setHandDetected: (detected) => set({ handDetected: detected }),
}));
