import { Scene } from './components/Canvas/Scene'
import { WebcamFeed } from './components/Camera/WebcamFeed';
import { OverlayObject } from './components/UI/OverlayObject';

function App() {
    return (
        <div className="w-full h-full relative overflow-hidden">
            <Scene />

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8">
                <WebcamFeed />
                <OverlayObject />
                <header className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                        Valentine's Particle System
                    </h1>
                </header>

                <footer className="w-full flex justify-center pb-8">
                    <p className="text-white/50 text-sm">Use hand gestures to control particles</p>
                </footer>
            </div>
        </div>
    )
}

export default App
