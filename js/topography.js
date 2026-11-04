/* =========================================
   TERRACOTTA — INTERACTIVE TOPOGRAPHY
========================================= */

const canvas = document.getElementById("topography-canvas");
const ctx = canvas.getContext("2d");


// =========================================
// 1. CONFIGURATION
// =========================================

const CONFIG = {
    // Précision du relief
    gridSize: 6,

    // Densité des courbes
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

    // Détails topographiques
    noiseScale: 5,
    noiseOctaves: 5,
    noisePersistence: 0.52,
    noiseStrength: 0.17,

    // Déformation naturelle
    warpStrength: 0.035
};


// =========================================
// 2. VARIABLES
// =========================================

let width = 0;
let height = 0;
let pixelRatio = 1;

let gridWidth = 0;
let gridHeight = 0;
let grid = [];

let animationFrame = null;

const pointer = {
    x: 0.5,
    y: 0.5,

    targetX: 0.5,
    targetY: 0.5,

    active: false,
    influence: 0,
    targetInfluence: 0
};

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


// =========================================
// 3. MOTEUR DE RELIEF FRACTAL
// =========================================

// Générateur pseudo-aléatoire déterministe
// Chaque position conserve la même valeur.

function hashNoise(x, y) {

    const value = Math.sin(
        x * 127.1 + y * 311.7
    ) * 43758.5453;

    return (value - Math.floor(value)) * 2 - 1;

}


// Interpolation douce entre les points

function smoothInterpolation(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}


// Bruit 2D continu

function noise2D(x, y) {

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);

    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const sx = smoothInterpolation(x - x0);
    const sy = smoothInterpolation(y - y0);

    const n00 = hashNoise(x0, y0);
    const n10 = hashNoise(x1, y0);
    const n01 = hashNoise(x0, y1);
    const n11 = hashNoise(x1, y1);

    const nx0 = n00 + (n10 - n00) * sx;
    const nx1 = n01 + (n11 - n01) * sx;

    return nx0 + (nx1 - nx0) * sy;

}


// Superposition de plusieurs fréquences

function fractalNoise(x, y) {

    let value = 0;

    let amplitude = 1;
    let frequency = 1;

    let totalAmplitude = 0;

    for (
        let i = 0;
        i < CONFIG.noiseOctaves;
        i++
    ) {

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


// =========================================
// 4. TERRAIN TOPOGRAPHIQUE
// =========================================

function gaussian(x, y, cx, cy, radius, intensity) {
    const dx = x - cx;
    const dy = y - cy;

    return intensity * Math.exp(
        -(dx * dx + dy * dy) /
        (2 * radius * radius)
    );
}

function terrain(x, y) {

    // Déformation spatiale pour casser
    // les formes trop concentriques.

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

    // Reliefs principaux : massifs montagneux

    value += gaussian(px, py, 0.22, 0.25, 0.16, 1.0);
    value += gaussian(px, py, 0.73, 0.30, 0.20, 0.85);
    value += gaussian(px, py, 0.48, 0.78, 0.22, 0.75);
    value += gaussian(px, py, 0.92, 0.82, 0.16, 0.65);

    // Vallées

    value -= gaussian(px, py, 0.49, 0.43, 0.15, 0.65);
    value -= gaussian(px, py, 0.12, 0.76, 0.18, 0.45);

    // Bruit fractal : détails du relief

    const detailedNoise = fractalNoise(
        px * CONFIG.noiseScale,
        py * CONFIG.noiseScale
    );

    value += detailedNoise * CONFIG.noiseStrength;

    // Irrégularités supplémentaires

    value += Math.sin(px * 25 + py * 17) * 0.018;
    value += Math.cos(py * 31 - px * 13) * 0.014;

    return value;

}


// =========================================
// 5. DÉFORMATION PAR LA SOURIS
// =========================================

function getTerrainValue(x, y) {

    let value = terrain(x, y);

    const dx = x - pointer.x;
    const dy = y - pointer.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const radius = CONFIG.mouseRadius;

    // Déformation progressive autour du curseur
    const influence = Math.exp(
        -(distance * distance) / (2 * radius * radius)
    );

    value += influence
        * CONFIG.mouseStrength
        * pointer.influence;

    return value;
}


// =========================================
// 6. INITIALISATION DU CANVAS
// =========================================

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    ctx.setTransform(
        pixelRatio, 0,
        0, pixelRatio,
        0, 0
    );

    gridWidth = Math.ceil(width / CONFIG.gridSize) + 1;
    gridHeight = Math.ceil(height / CONFIG.gridSize) + 1;

    grid = new Float32Array(gridWidth * gridHeight);

    render();

}


// =========================================
// 7. CALCUL DE LA GRILLE
// =========================================

function calculateGrid() {

    for (let row = 0; row < gridHeight; row++) {

        for (let col = 0; col < gridWidth; col++) {

            const x = col * CONFIG.gridSize;
            const y = row * CONFIG.gridSize;

            // Coordonnées normalisées
            const normalizedX = x / width;
            const normalizedY = y / height;

            grid[row * gridWidth + col] = getTerrainValue(
                normalizedX,
                normalizedY
            );

        }

    }

}


// =========================================
// 8. INTERPOLATION DES COURBES
// =========================================

function interpolate(x1, y1, v1, x2, y2, v2, level) {

    let ratio = (level - v1) / (v2 - v1);

    ratio = Math.max(0, Math.min(1, ratio));

    return {
        x: x1 + (x2 - x1) * ratio,
        y: y1 + (y2 - y1) * ratio
    };

}


// =========================================
// 9. TRACÉ DES COURBES DE NIVEAU
// =========================================

function drawContours() {

    const step = CONFIG.gridSize;

    for (
        let level = CONFIG.contourMin;
        level <= CONFIG.contourMax;
        level += CONFIG.contourStep
    ) {

        const levelIndex = Math.round(
            (level - CONFIG.contourMin) / CONFIG.contourStep
        );

        const isMajor = levelIndex % 5 === 0;

        ctx.beginPath();

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.strokeStyle = isMajor
            ? CONFIG.majorLineColor
            : CONFIG.lineColor;

        ctx.lineWidth = isMajor ? 1.15 : 0.75;

        for (let row = 0; row < gridHeight - 1; row++) {

            for (let col = 0; col < gridWidth - 1; col++) {

                const x = col * step;
                const y = row * step;

                const vTL = grid[row * gridWidth + col];
                const vTR = grid[row * gridWidth + col + 1];

                const vBR = grid[(row + 1) * gridWidth + col + 1];
                const vBL = grid[(row + 1) * gridWidth + col];

                const edges = [];

                // Haut
                if ((vTL < level) !== (vTR < level)) {
                    edges.push(
                        interpolate(
                            x, y, vTL,
                            x + step, y, vTR,
                            level
                        )
                    );
                }

                // Droite
                if ((vTR < level) !== (vBR < level)) {
                    edges.push(
                        interpolate(
                            x + step, y, vTR,
                            x + step, y + step, vBR,
                            level
                        )
                    );
                }

                // Bas
                if ((vBR < level) !== (vBL < level)) {
                    edges.push(
                        interpolate(
                            x + step, y + step, vBR,
                            x, y + step, vBL,
                            level
                        )
                    );
                }

                // Gauche
                if ((vBL < level) !== (vTL < level)) {
                    edges.push(
                        interpolate(
                            x, y + step, vBL,
                            x, y, vTL,
                            level
                        )
                    );
                }

                // Liaison des intersections
                if (edges.length === 2) {

                    ctx.moveTo(edges[0].x, edges[0].y);
                    ctx.lineTo(edges[1].x, edges[1].y);

                } else if (edges.length === 4) {

                    const center = (vTL + vTR + vBR + vBL) / 4;

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
// 10. RENDU GLOBAL
// =========================================

function render() {

    ctx.clearRect(0, 0, width, height);

    calculateGrid();

    drawContours();

}


// =========================================
// 11. ANIMATION FLUIDE
// =========================================

function animate() {

    animationFrame = null;

    const inertia = CONFIG.mouseInertia;

    pointer.x += (pointer.targetX - pointer.x) * inertia;
    pointer.y += (pointer.targetY - pointer.y) * inertia;

    pointer.influence += (
        pointer.targetInfluence - pointer.influence
    ) * inertia;

    render();

    const distance = Math.abs(pointer.targetX - pointer.x)
        + Math.abs(pointer.targetY - pointer.y)
        + Math.abs(pointer.targetInfluence - pointer.influence);

    if (distance > 0.0005) {
        requestAnimationFrame(animate);
    }

}

function requestRender() {

    if (!animationFrame) {
        animationFrame = requestAnimationFrame(animate);
    }

}


// =========================================
// 12. INTERACTION UTILISATEUR
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
// 13. ÉVÉNEMENTS
// =========================================

window.addEventListener("resize", () => {

    resizeCanvas();

});

reducedMotion.addEventListener("change", () => {

    if (reducedMotion.matches) {

        pointer.targetInfluence = 0;
        pointer.influence = 0;

    }

    render();

});


// =========================================
// 14. DÉMARRAGE
// =========================================

resizeCanvas();