
/* =========================================
   TERRACOTTA — INTERACTIVE TOPOGRAPHY
   Optimized Canvas 2D engine
========================================= */

const canvas = document.getElementById("topography-canvas");
const ctx = canvas.getContext("2d");

// =========================================
// 1. CONFIGURATION
// =========================================

const CONFIG = {
    // Qualité et précision
    gridSize: 6,
    contourStep: 0.065,
    contourMin: -0.45,
    contourMax: 0.90,

    // Apparence
    lineColor: "rgba(67, 86, 69, 0.19)",
    majorLineColor: "rgba(67, 86, 69, 0.32)",

    // Interaction souris
    mouseRadius: 0.15,
    mouseStrength: 0.48,
    mouseInertia: 0.075,

    // Relief fractal
    noiseScale: 5,
    noiseOctaves: 5,
    noisePersistence: 0.52,
    noiseStrength: 0.17,
    warpStrength: 0.035,

    // Performance
    maxFPS: 30,
    mobileGridSize: 9
};

// =========================================
// 2. VARIABLES
// =========================================

let width = 0;
let height = 0;
let pixelRatio = 1;
let gridStep = CONFIG.gridSize;

let gridWidth = 0;
let gridHeight = 0;

let grid = null;
let baseGrid = null;

let animationFrame = null;
let lastFrameTime = 0;

const pointer = {
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    influence: 0,
    targetInfluence: 0
};

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

// =========================================
// 3. GÉNÉRATION DU RELIEF
// =========================================

function gaussian(x, y, cx, cy, radius, intensity) {
    const dx = x - cx;
    const dy = y - cy;

    return intensity * Math.exp(
        -(dx * dx + dy * dy) /
        (2 * radius * radius)
    );
}

function hashNoise(x, y) {
    const value = Math.sin(
        x * 127.1 + y * 311.7
    ) * 43758.5453;

    return (value - Math.floor(value)) * 2 - 1;
}

function smoothInterpolation(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function noise2D(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);

    const sx = smoothInterpolation(x - x0);
    const sy = smoothInterpolation(y - y0);

    const n00 = hashNoise(x0, y0);
    const n10 = hashNoise(x0 + 1, y0);
    const n01 = hashNoise(x0, y0 + 1);
    const n11 = hashNoise(x0 + 1, y0 + 1);

    const nx0 = n00 + (n10 - n00) * sx;
    const nx1 = n01 + (n11 - n01) * sx;

    return nx0 + (nx1 - nx0) * sy;
}

function fractalNoise(x, y) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let totalAmplitude = 0;

    for (let i = 0; i < CONFIG.noiseOctaves; i++) {
        value += noise2D(
            x * frequency,
            y * frequency
        ) * amplitude;

        totalAmplitude += amplitude;
        amplitude *= CONFIG.noisePersistence;
        frequency *= 2;
    }

    return value / totalAmplitude;
}

function terrain(x, y) {
    const warpX = fractalNoise(
        x * 5 + 12,
        y * 5 + 8
    );

    const warpY = fractalNoise(
        x * 5 + 35,
        y * 5 + 21
    );

    const px = x + warpX * CONFIG.warpStrength;
    const py = y + warpY * CONFIG.warpStrength;

    let value = 0;

    // Massifs
    value += gaussian(px, py, 0.22, 0.25, 0.16, 1.0);
    value += gaussian(px, py, 0.73, 0.30, 0.20, 0.85);
    value += gaussian(px, py, 0.48, 0.78, 0.22, 0.75);
    value += gaussian(px, py, 0.92, 0.82, 0.16, 0.65);

    // Vallées
    value -= gaussian(px, py, 0.49, 0.43, 0.15, 0.65);
    value -= gaussian(px, py, 0.12, 0.76, 0.18, 0.45);

    // Détails fractals
    value += fractalNoise(
        px * CONFIG.noiseScale,
        py * CONFIG.noiseScale
    ) * CONFIG.noiseStrength;

    // Irrégularités
    value += Math.sin(px * 25 + py * 17) * 0.018;
    value += Math.cos(py * 31 - px * 13) * 0.014;

    return value;
}

// =========================================
// 4. INITIALISATION DU CANVAS
// =========================================

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    if (width <= 0 || height <= 0) return;

    const isMobile = width < 768;

    gridStep = isMobile
        ? CONFIG.mobileGridSize
        : CONFIG.gridSize;

    pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1.5 : 2
    );

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);

    ctx.setTransform(
        pixelRatio, 0,
        0, pixelRatio,
        0, 0
    );

    gridWidth = Math.ceil(width / gridStep) + 1;
    gridHeight = Math.ceil(height / gridStep) + 1;

    grid = new Float32Array(gridWidth * gridHeight);

    calculateBaseGrid();
    calculateGrid();
    render();
}

// =========================================
// 5. PRÉCALCUL DU TERRAIN STATIQUE
// =========================================

function calculateBaseGrid() {
    baseGrid = new Float32Array(
        gridWidth * gridHeight
    );

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const x = (col * gridStep) / width;
            const y = (row * gridStep) / height;

            const index = row * gridWidth + col;

            baseGrid[index] = terrain(x, y);
        }
    }
}

// =========================================
// 6. DÉFORMATION DYNAMIQUE
// =========================================

function calculateGrid() {
    const radius = CONFIG.mouseRadius;
    const strength =
        CONFIG.mouseStrength * pointer.influence;

    if (Math.abs(strength) < 0.0001) {
        grid.set(baseGrid);
        return;
    }

    const radiusSquared = 2 * radius * radius;

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const index = row * gridWidth + col;

            const x = (col * gridStep) / width;
            const y = (row * gridStep) / height;

            const dx = x - pointer.x;
            const dy = y - pointer.y;

            const influence = Math.exp(
                -(dx * dx + dy * dy) / radiusSquared
            );

            grid[index] =
                baseGrid[index] + influence * strength;
        }
    }
}

// =========================================
// 7. INTERPOLATION
// =========================================

function interpolate(
    x1, y1, v1,
    x2, y2, v2,
    level
) {
    const difference = v2 - v1;

    const ratio = difference === 0
        ? 0.5
        : Math.max(
            0,
            Math.min(1, (level - v1) / difference)
        );

    return {
        x: x1 + (x2 - x1) * ratio,
        y: y1 + (y2 - y1) * ratio
    };
}

// =========================================
// 8. TRACÉ DES COURBES DE NIVEAU
// =========================================

function drawContours() {
    const step = gridStep;

    const levelCount = Math.floor(
        (CONFIG.contourMax - CONFIG.contourMin) /
        CONFIG.contourStep
    ) + 1;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let levelIndex = 0;
         levelIndex < levelCount;
         levelIndex++) {

        const level =
            CONFIG.contourMin +
            levelIndex * CONFIG.contourStep;

        const isMajor = levelIndex % 5 === 0;

        ctx.beginPath();

        ctx.strokeStyle = isMajor
            ? CONFIG.majorLineColor
            : CONFIG.lineColor;

        ctx.lineWidth = isMajor ? 1.15 : 0.75;

        for (let row = 0; row < gridHeight - 1; row++) {
            for (let col = 0; col < gridWidth - 1; col++) {

                const x = col * step;
                const y = row * step;

                const index = row * gridWidth + col;

                const vTL = grid[index];
                const vTR = grid[index + 1];
                const vBL = grid[index + gridWidth];
                const vBR = grid[index + gridWidth + 1];

                const edges = [];

                if ((vTL < level) !== (vTR < level)) {
                    edges.push(interpolate(
                        x, y, vTL,
                        x + step, y, vTR,
                        level
                    ));
                }

                if ((vTR < level) !== (vBR < level)) {
                    edges.push(interpolate(
                        x + step, y, vTR,
                        x + step, y + step, vBR,
                        level
                    ));
                }

                if ((vBR < level) !== (vBL < level)) {
                    edges.push(interpolate(
                        x + step, y + step, vBR,
                        x, y + step, vBL,
                        level
                    ));
                }

                if ((vBL < level) !== (vTL < level)) {
                    edges.push(interpolate(
                        x, y + step, vBL,
                        x, y, vTL,
                        level
                    ));
                }

                if (edges.length === 2) {
                    ctx.moveTo(edges[0].x, edges[0].y);
                    ctx.lineTo(edges[1].x, edges[1].y);
                }

                else if (edges.length === 4) {
                    const center =
                        (vTL + vTR + vBR + vBL) / 4;

                    if (center >= level) {
                        ctx.moveTo(edges[0].x, edges[0].y);
                        ctx.lineTo(edges[1].x, edges[1].y);

                        ctx.moveTo(edges[2].x, edges[2].y);
                        ctx.lineTo(edges[3].x, edges[3].y);
                    } else {
                        ctx.moveTo(edges[0].x, edges[0].y);
                        ctx.lineTo(edges[3].x, edges[3].y);

                        ctx.moveTo(edges[1].x, edges[1].y);
                        ctx.lineTo(edges[2].x, edges[2].y);
                    }
                }
            }
        }

        ctx.stroke();
    }
}

// =========================================
// 9. RENDU
// =========================================

function render() {
    if (!grid || !baseGrid) return;

    calculateGrid();

    ctx.clearRect(0, 0, width, height);
    drawContours();
}

// =========================================
// 10. ANIMATION OPTIMISÉE
// =========================================

function animate(timestamp) {
    animationFrame = null;

    const frameInterval = 1000 / CONFIG.maxFPS;

    if (timestamp - lastFrameTime < frameInterval) {
        requestRender();
        return;
    }

    lastFrameTime = timestamp;

    const inertia = CONFIG.mouseInertia;

    pointer.x +=
        (pointer.targetX - pointer.x) * inertia;

    pointer.y +=
        (pointer.targetY - pointer.y) * inertia;

    pointer.influence +=
        (pointer.targetInfluence - pointer.influence) *
        inertia;

    render();

    const distance =
        Math.abs(pointer.targetX - pointer.x) +
        Math.abs(pointer.targetY - pointer.y) +
        Math.abs(
            pointer.targetInfluence - pointer.influence
        );

    if (distance > 0.0005) {
        requestRender();
    }
}

function requestRender() {
    if (reducedMotion.matches) return;
    if (document.hidden) return;

    if (animationFrame === null) {
        animationFrame = requestAnimationFrame(animate);
    }
}

// =========================================
// 11. INTERACTION SOURIS
// =========================================

window.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;

    pointer.targetX = event.clientX / width;
    pointer.targetY = event.clientY / height;
    pointer.targetInfluence = 1;

    requestRender();
});

window.addEventListener("pointerleave", () => {
    pointer.targetInfluence = 0;
    requestRender();
});

// =========================================
// 12. VISIBILITÉ DE LA PAGE
// =========================================

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    } else {
        lastFrameTime = 0;
        requestRender();
    }
});

// =========================================
// 13. ACCESSIBILITÉ
// =========================================

reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
        if (animationFrame !== null) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        pointer.influence = 0;
        pointer.targetInfluence = 0;

        render();
    } else {
        requestRender();
    }
});

// =========================================
// 14. REDIMENSIONNEMENT
// =========================================

let resizeTimeout = null;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        resizeCanvas();
    }, 150);
});

// =========================================
// 15. INITIALISATION
// =========================================

resizeCanvas();
