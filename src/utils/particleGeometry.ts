

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

export const getTextPoints = (text: string, count: number, scale: number = 1): Float32Array => {
    const points = new Float32Array(count * 3);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return getSpherePoints(count, 10); // Fallback

    // Dynamic width based on approx char count to avoid cutoff
    // This is a heuristic; better would be measureText but we need a context first.
    // Let's just use a large wide canvas.
    const width = 2000;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    // Background black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Text white
    ctx.font = 'bold 150px Arial'; // Larger font
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const validPixels: number[] = [];

    // Scan with step to improve performance
    const step = 4;
    for (let i = 0; i < height; i += step) {
        for (let j = 0; j < width; j += step) {
            const index = (i * width + j) * 4;
            // brightness
            if (data[index] > 128) {
                validPixels.push(j, i);
            }
        }
    }

    if (validPixels.length === 0) return getSpherePoints(count, 10);

    for (let i = 0; i < count; i++) {
        // Randomly pick a valid pixel (pair of x, y)
        const randIdx = Math.floor(Math.random() * (validPixels.length / 2)) * 2;
        const px = validPixels[randIdx];
        const py = validPixels[randIdx + 1];

        // Center the text
        const x = (px - width / 2) * 0.02 * scale; // Adjusted scale for larger canvas
        const y = -(py - height / 2) * 0.02 * scale; // Flip Y
        const z = (Math.random() - 0.5) * 0.5; // Slight depth

        points[i * 3] = x;
        points[i * 3 + 1] = y;
        points[i * 3 + 2] = z;
    }

    return points;
};

// Helper to mix two point sets
export const getMixedPoints = (pointsA: Float32Array, pointsB: Float32Array, ratio: number = 0.5): Float32Array => {
    const count = pointsA.length / 3;
    const result = new Float32Array(count * 3);
    const splitIndex = Math.floor(count * ratio);

    // Copy first part from A
    for (let i = 0; i < splitIndex; i++) {
        result[i * 3] = pointsA[i * 3];
        result[i * 3 + 1] = pointsA[i * 3 + 1];
        result[i * 3 + 2] = pointsA[i * 3 + 2];
    }

    // Copy second part from B
    for (let i = splitIndex; i < count; i++) {
        // Safe check for B length
        if ((i * 3 + 2) < pointsB.length) {
            result[i * 3] = pointsB[i * 3];
            result[i * 3 + 1] = pointsB[i * 3 + 1];
            result[i * 3 + 2] = pointsB[i * 3 + 2];
        } else {
            // Fallback to A if B runs out
            result[i * 3] = pointsA[i * 3];
            result[i * 3 + 1] = pointsA[i * 3 + 1];
            result[i * 3 + 2] = pointsA[i * 3 + 2];
        }
    }

    return result;
};

export const getSmileyPoints = (count: number, radius: number = 5): Float32Array => {
    const points = new Float32Array(count * 3);

    // Distribution:
    // 50% Head outline/fill
    // 15% Left Eye
    // 15% Right Eye
    // 20% Smile

    const headCount = Math.floor(count * 0.5);
    const eyeCount = Math.floor(count * 0.15);
    const smileCount = count - headCount - (eyeCount * 2);

    let i = 0;

    // Head (Hollow Sphere / Circle Surface)
    for (let j = 0; j < headCount; j++) {
        const theta = Math.random() * Math.PI * 2;
        // Concentrate on rim but fill slightly
        const r = radius * (0.8 + Math.random() * 0.2);
        points[i * 3] = r * Math.cos(theta);
        points[i * 3 + 1] = r * Math.sin(theta);
        points[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Flat z
        i++;
    }

    // Eyes (Solid Circles)
    const eyeOffset = radius * 0.35;
    const eyeRadius = radius * 0.15;

    // Left Eye
    for (let j = 0; j < eyeCount; j++) {
        const r = Math.sqrt(Math.random()) * eyeRadius;
        const theta = Math.random() * Math.PI * 2;
        points[i * 3] = -eyeOffset + r * Math.cos(theta);
        points[i * 3 + 1] = eyeOffset + r * Math.sin(theta);
        points[i * 3 + 2] = 0.5; // Pop out
        i++;
    }

    // Right Eye
    for (let j = 0; j < eyeCount; j++) {
        const r = Math.sqrt(Math.random()) * eyeRadius;
        const theta = Math.random() * Math.PI * 2;
        points[i * 3] = eyeOffset + r * Math.cos(theta);
        points[i * 3 + 1] = eyeOffset + r * Math.sin(theta);
        points[i * 3 + 2] = 0.5; // Pop out
        i++;
    }

    // Smile (Arc)
    for (let j = 0; j < smileCount; j++) {
        // Arc from PI/4 to 3PI/4 (roughly)
        const range = Math.PI * 0.8;
        const theta = Math.PI + (Math.random() - 0.5) * range; // Bottom half
        const smileRadius = radius * 0.6;
        // Thickness
        const r = smileRadius + (Math.random() - 0.5) * 0.5;

        points[i * 3] = r * Math.cos(theta);
        points[i * 3 + 1] = r * Math.sin(theta) + (radius * 0.1); // Shift up slightly
        points[i * 3 + 2] = 0.5;
        i++;
    }

    return points;
};
