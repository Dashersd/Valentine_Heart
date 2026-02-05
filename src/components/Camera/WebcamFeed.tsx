import Webcam from 'react-webcam';
import { useGestureDetection } from '../../hooks/useGestureDetection';
import { useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

export const WebcamFeed = () => {
    const { videoRef } = useGestureDetection();
    // Automatically show camera on start so user knows it's working
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="bg-zinc-800 p-2 rounded-full text-white hover:bg-zinc-700 transition"
                title={isVisible ? "Hide Camera" : "Show Camera"}
            >
                {isVisible ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>

            <div className={`overflow-hidden rounded-lg border border-zinc-700 bg-black transition-all duration-300 ${isVisible ? 'w-48 h-36 opacity-100' : 'w-0 h-0 opacity-0'}`}>
                <Webcam
                    ref={videoRef as any}
                    mirrored
                    className="w-full h-full object-cover"
                    width={320}
                    height={240}
                />
            </div>
        </div>
    );
};
