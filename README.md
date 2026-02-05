# Valentine Heart Particle System

A romantic, interactive 3D particle experience controlled by hand gestures. This project uses your webcam to detect hand movements and manipulates a beautiful particle system in real-time, creating a magical visual storytelling experience for Valentine's Day.

## Features

- **Gesture Control**: Use hand gestures to interact with the particle system.
  - **Fist**: Contract/Gather particles.
  - **Open Hand**: Expand/Scatter particles.
  - **Finger Counting**: Trigger specific animations and text reveals (1-5 fingers).
- **3D Particle Engine**: built with Three.js and React Three Fiber for high-performance visual effects.
- **Responsive Design**: Works on various screen sizes.
- **Audio Integration**: Ambient sound and interaction effects.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Computer Vision**: [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + [GSAP](https://gsap.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A device with a webcam

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Dashersd/Valentine_Heart.git
    cd Valentine_Heart
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in your browser:**
    Navigate to the URL shown in the terminal (usually `http://localhost:5173`). Allow camera access when prompted.

## Usage Instructions

1.  Grant camera permission when the application loads.
2.  Hold your hand up to the camera.
3.  Experiment with different gestures:
    - **Close your hand (Fist)** to see the particles contract.
    - **Open your hand (Palm)** to see them expand.
    - **Show different numbers of fingers** to reveal hidden messages and shapes.

## License

This project is licensed under the MIT License.
