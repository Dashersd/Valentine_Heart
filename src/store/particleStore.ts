import { create } from 'zustand';
import { Color } from 'three';

interface ParticleStore {
    targetFormation: string; // 'heart' | 'text' | 'scattered' | 'emoji'
    particleColor: Color;
    setFormation: (formation: string) => void;
    setColor: (color: Color) => void;
}

export const useParticleStore = create<ParticleStore>((set) => ({
    targetFormation: 'scattered',
    particleColor: new Color('#ff69b4'),
    setFormation: (formation) => set({ targetFormation: formation }),
    setColor: (color) => set({ particleColor: color }),
}));
