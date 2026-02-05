

export const getHeartPoints = (count: number, scale: number = 1): Float32Array => {
    const points = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        // Distribute points: some on the surface, some inside
        const t = Math.random() * Math.PI * 2;
        // Use a modified random distribution to clump points nicer
        const r = Math.pow(Math.random(), 0.3); // Bias towards outer edge for definition

        // Heart parametric equations
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)

        // Base heart shape
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        // Normalize and scale
        x *= scale * 0.1;
        y *= scale * 0.1;

        // Add volume (z-axis) based on x/y to make it puffy
        // Thicker in the middle, thinner at edges
        const zScale = 2 * scale * 0.1;
        const z = (Math.random() - 0.5) * zScale * (1 - Math.abs(x) / (16 * scale * 0.1));

        // Fill the volume instead of just shell
        // We linearly interpolate from center (0,0,0) to calculated surface point (x,y,z)
        // using 'r' factor from earlier

        points[i * 3] = x * r;
        points[i * 3 + 1] = y * r;
        points[i * 3 + 2] = z * r;
    }

    return points;
};

export const getSpherePoints = (count: number, radius: number): Float32Array => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random()); // Uniform distribution inside sphere

        points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        points[i * 3 + 2] = r * Math.cos(phi);
    }
    return points;
};
