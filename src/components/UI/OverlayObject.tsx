import { useGestureStore } from '../../store/gestureStore';
import { GestureState } from '../../constants/gestureStates';
// import { useEffect, useState } from 'react';

export const OverlayObject = () => {
    const { currentState, handDetected } = useGestureStore();

    // Helper to get text content based on state
    // 1 finger = Will you
    // 2 finger = Be my
    // 3 Finger = Valentine
    // 4 Finger = Will you be my Valentine
    // 5 Finger = Thank you, See you Soon (Heart and Smile emoji)
    // Close Hand = Heart particle (handled in 3D scene, but we can add text if needed)

    if (!handDetected) {
        return null;
    }

    let content = null;

    switch (currentState) {
        case GestureState.ONE_FINGER:
            content = (
                <h1 className="text-6xl md:text-8xl font-bold text-pink-400 drop-shadow-[0_0_15px_rgba(255,100,150,0.8)]">
                    Will you
                </h1>
            );
            break;
        case GestureState.TWO_FINGERS:
            content = (
                <h1 className="text-6xl md:text-8xl font-bold text-pink-400 drop-shadow-[0_0_15px_rgba(255,100,150,0.8)]">
                    Be my
                </h1>
            );
            break;
        case GestureState.THREE_FINGERS:
            content = (
                <h1 className="text-6xl md:text-8xl font-bold text-pink-500 drop-shadow-[0_0_20px_rgba(255,0,100,0.8)]">
                    Valentine
                </h1>
            );
            break;
        case GestureState.FOUR_FINGERS:
            content = (
                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-600 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] text-center p-4">
                    Will you be my Valentine?
                </h1>
            );
            break;
        case GestureState.FIVE_FINGERS:
            content = (
                <div className="flex flex-col items-center gap-4 animate-bounce">
                    <h1 className="text-5xl md:text-7xl font-bold text-pink-400 text-center">
                        Thank you! <br /> See you Soon
                    </h1>
                    <div className="text-8xl">❤️ 😊</div>
                </div>
            );
            break;
        case GestureState.FIST:
            // Handled by 3D heart, but maybe a small text?
            content = (
                <div className="opacity-0"></div> // Keep it clean for the pure heart moment
            );
            break;
        default:
            content = null;
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500">
            {content}
        </div>
    );
};
