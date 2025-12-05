/**
 * Hitbox System for A-Frame (Vanilla JS Port)
 * Ported from Chowa project (Svelte/TS)
 */

// ==========================================
// 1. GEOMETRY UTILITIES
// ==========================================

const GeometryUtils = {
    /**
     * Sort points clockwise around a center
     */
    sortPointsClockwise: function (points, centerX, centerY) {
        return [...points].sort((a, b) => {
            const angleA = Math.atan2(a.y - centerY, a.x - centerX);
            const angleB = Math.atan2(b.y - centerY, b.x - centerX);
            return angleA - angleB;
        });
    },

    /**
     * Simplify polygon using Douglas-Peucker algorithm
     */
    simplifyPolygon: function (points, tolerance) {
        if (points.length <= 2) return points;

        function perpendicularDistance(point, lineStart, lineEnd) {
            const dx = lineEnd.x - lineStart.x;
            const dy = lineEnd.y - lineStart.y;

            if (dx === 0 && dy === 0) {
                return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
            }

            const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);

            if (t < 0) {
                return Math.sqrt(Math.pow(point.x - lineStart.x, 2) + Math.pow(point.y - lineStart.y, 2));
            }
            if (t > 1) {
                return Math.sqrt(Math.pow(point.x - lineEnd.x, 2) + Math.pow(point.y - lineEnd.y, 2));
            }

            const projX = lineStart.x + t * dx;
            const projY = lineStart.y + t * dy;

            return Math.sqrt(Math.pow(point.x - projX, 2) + Math.pow(point.y - projY, 2));
        }

        function douglasPeucker(pts, startIndex, endIndex, tol) {
            if (endIndex <= startIndex + 1) {
                return [pts[startIndex]];
            }

            let maxDistance = 0;
            let maxIndex = 0;

            for (let i = startIndex + 1; i < endIndex; i++) {
                const distance = perpendicularDistance(pts[i], pts[startIndex], pts[endIndex]);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    maxIndex = i;
                }
            }

            let result = [];
            if (maxDistance > tol) {
                const left = douglasPeucker(pts, startIndex, maxIndex, tol);
                const right = douglasPeucker(pts, maxIndex, endIndex, tol);
                result = [...left, ...right];
            } else {
                result = [pts[startIndex], pts[endIndex]];
            }

            return result;
        }

        const result = douglasPeucker(points, 0, points.length - 1, tolerance);

        // Ensure loop closure
        const lastResult = result[result.length - 1];
        const lastPoint = points[points.length - 1];
        if (lastResult && lastPoint && (lastResult.x !== lastPoint.x || lastResult.y !== lastPoint.y)) {
            result.push(lastPoint);
        }

        return result;
    }
};

// ==========================================
// 2. HITBOX MANAGER
// ==========================================

const CONTOUR_CONFIG = {
    ALPHA_THRESHOLD: 20,
    NUM_RAYS: 64,
    STEP: 4,
    SIMPLIFY_TOLERANCE: 2
};

class HitboxManager {
    constructor() {
        this.hitboxes = [];
        this.screenPointsCache = [];
        this.tempVector3 = new THREE.Vector3();
    }

    detectContour(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const outlinePoints = [];

        // Find center (approx)
        let centerX = Math.floor(width / 2);
        let centerY = Math.floor(height / 2);
        let found = false;
        const radius = Math.min(width, height) / 4;

        // Search for non-transparent pixel near center
        for (let r = 0; r < radius && !found; r++) {
            for (let angle = 0; angle < Math.PI * 2 && !found; angle += Math.PI / 8) {
                const testX = Math.floor(centerX + r * Math.cos(angle));
                const testY = Math.floor(centerY + r * Math.sin(angle));

                if (testX >= 0 && testX < width && testY >= 0 && testY < height) {
                    const idx = (testY * width + testX) * 4;
                    if (data[idx + 3] > CONTOUR_CONFIG.ALPHA_THRESHOLD) {
                        centerX = testX;
                        centerY = testY;
                        found = true;
                    }
                }
            }
        }

        if (!found) return this.findBoundingBox(data, width, height);

        // Raycasting for contour
        for (let i = 0; i < CONTOUR_CONFIG.NUM_RAYS; i++) {
            const angle = (i / CONTOUR_CONFIG.NUM_RAYS) * Math.PI * 2;
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            let lastOpaque = false;

            for (let dist = 0; dist < Math.max(width, height); dist++) {
                const x = Math.floor(centerX + dirX * dist);
                const y = Math.floor(centerY + dirY * dist);

                if (x < 0 || x >= width || y < 0 || y >= height) break;

                const idx = (y * width + x) * 4;
                const isOpaque = data[idx + 3] > CONTOUR_CONFIG.ALPHA_THRESHOLD;

                if (lastOpaque && !isOpaque) {
                    outlinePoints.push({ x, y });
                    break;
                }
                lastOpaque = isOpaque;
            }
        }

        if (outlinePoints.length < 6) return this.findBoundingBox(data, width, height);

        const sortedPoints = GeometryUtils.sortPointsClockwise(outlinePoints, centerX, centerY);
        return GeometryUtils.simplifyPolygon(sortedPoints, CONTOUR_CONFIG.SIMPLIFY_TOLERANCE);
    }

    findBoundingBox(data, width, height) {
        // Simple fallback
        return [
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width, y: height },
            { x: 0, y: height }
        ];
    }

    convertToScreenCoordinates(el, contourPoints, imgWidth, imgHeight) {
        if (!this.tempVector3) return [];
        this.screenPointsCache = [];

        const object3D = el.object3D;

        // Find the active camera
        let camera = null;
        const scene = document.querySelector('a-scene');
        if (scene && scene.camera) {
            camera = scene.camera;
        } else {
            const cameraEl = document.querySelector('a-camera, [camera]');
            if (cameraEl) {
                camera = cameraEl.getObject3D('camera');
            }
        }

        if (!camera) {
            if (this.debug && Math.random() < 0.01) console.warn('[HitboxSystem] No active camera found!');
            return [];
        }

        // Assuming plane geometry ratio matches image ratio
        // We project 0..imgWidth to -0.5..0.5 in local space

        for (const point of contourPoints) {
            // Normalize to -0.5 to 0.5 range (A-Frame plane default center)
            const normalizedX = (point.x / imgWidth) - 0.5;
            const normalizedY = 0.5 - (point.y / imgHeight); // Flip Y for 3D

            this.tempVector3.set(normalizedX, normalizedY, 0);
            this.tempVector3.applyMatrix4(object3D.matrixWorld);
            this.tempVector3.project(camera);

            const screenX = (this.tempVector3.x + 1) * window.innerWidth / 2;
            const screenY = -(this.tempVector3.y - 1) * window.innerHeight / 2;

            this.screenPointsCache.push({ x: screenX, y: screenY });
        }

        return this.screenPointsCache;
    }
}

// ==========================================
// 3. A-FRAME SYSTEM & COMPONENT
// ==========================================

AFRAME.registerSystem('hitbox-system', {
    init: function () {
        this.manager = new HitboxManager();
        this.targets = [];

        // Setup Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'hitbox-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none'; // Let clicks pass through to be handled by JS
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Handle Resize
        window.addEventListener('resize', () => this.onResize());
        this.onResize();

        // Handle Click
        window.addEventListener('click', (e) => this.onClick(e));

        // Debug Mode - false pour cacher les bords verts
        this.debug = false;
    },

    registerTarget: function (el, options = {}) {
        this.targets.push(el);
        el.hitboxOptions = options; // Stocker les options sur l'élément

        // Si on utilise un rectangle, pas besoin de détecter le contour des pixels
        if (options.useRectangle) {
            console.log(`[HitboxSystem] Using rectangle hitbox for ${el.id}`);
            // Générer un contour rectangulaire simple basé sur la géométrie
            this.generateRectangleContour(el);
        } else {
            // Generate contour when image loads (mode pixel-perfect original)
            el.addEventListener('materialtextureloaded', () => {
                this.generateContour(el);
            });
            // Try immediately in case already loaded
            if (el.getObject3D('mesh')?.material?.map?.image) {
                this.generateContour(el);
            }
        }
    },

    generateRectangleContour: function (el) {
        // Pour un a-image, la taille par défaut est 1x1 en espace local
        // On récupère width/height si définis, sinon on prend 1
        const width = parseFloat(el.getAttribute('width')) || 1;
        const height = parseFloat(el.getAttribute('height')) || 1;

        // Créer un contour rectangulaire simple (coins du rectangle)
        el.hitboxContour = [
            { x: 0, y: 0 },
            { x: width, y: 0 },
            { x: width, y: height },
            { x: 0, y: height }
        ];
        el.hitboxImgSize = { width: width, height: height };
        el.hitboxIsRectangle = true;
        console.log(`[HitboxSystem] Rectangle hitbox generated for ${el.id}: ${width}x${height}`);
    },

    unregisterTarget: function (el) {
        const index = this.targets.indexOf(el);
        if (index > -1) this.targets.splice(index, 1);
    },

    generateContour: function (el) {
        const mesh = el.getObject3D('mesh');
        if (!mesh || !mesh.material || !mesh.material.map || !mesh.material.map.image) {
            console.warn(`[HitboxSystem] No mesh/image found for ${el.id}`);
            return;
        }

        const img = mesh.material.map.image;
        console.log(`[HitboxSystem] Generating contour for ${el.id} (Image: ${img.src})`);

        // Create temp canvas to get pixel data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Ensure CORS if possible
        if (img.crossOrigin !== 'Anonymous') {
            // If the image is already loaded without CORS, we might be stuck.
            // But for local server, it should be fine if served from same origin.
        }

        try {
            tempCtx.drawImage(img, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            const contour = this.manager.detectContour(imageData);

            if (contour.length > 0) {
                el.hitboxContour = contour;
                el.hitboxImgSize = { width: img.width, height: img.height };
                console.log(`[HitboxSystem] Success! Generated ${contour.length} points for ${el.id}`);
            } else {
                console.warn(`[HitboxSystem] No contour detected for ${el.id} (all transparent?)`);
            }
        } catch (e) {
            console.error(`[HitboxSystem] Error generating contour for ${el.id}. Possible CORS issue?`, e);
        }
    },

    onResize: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    onClick: function (e) {
        const x = e.clientX;
        const y = e.clientY;

        // Check all targets
        // Sort by distance to camera (simple z-sort not perfect but okay for now)
        // Actually, we should check all and find the closest one if overlapping.
        // For now, let's just check in order.

        for (const el of this.targets) {
            if (!el.object3D.visible || !el.hitboxPath) continue;

            if (this.ctx.isPointInPath(el.hitboxPath, x, y)) {
                console.log('Hitbox clicked:', el.id);

                // Visual Feedback
                if (this.debug) {
                    this.ctx.save();
                    this.ctx.strokeStyle = '#00FF00';
                    this.ctx.lineWidth = 3;
                    this.ctx.stroke(el.hitboxPath);
                    this.ctx.restore();
                    setTimeout(() => {
                        // Clear specific feedback? Hard on canvas. Just let next tick clear it.
                    }, 200);
                }

                // Emit click event on the element so other components (like dismiss-on-click) react
                el.emit('click', { clientX: x, clientY: y, detail: { intersectedEl: el } });
                return; // Stop after first hit
            }
        }
    },

    tick: function () {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let drawnCount = 0;

        this.targets.forEach(el => {
            if (!el.object3D.visible) return;

            // Vérifier l'opacité minimale (pour les éléments qui apparaissent avec une animation de fade)
            const minOpacity = el.hitboxOptions?.minOpacity ?? 0.1;
            const material = el.getObject3D('mesh')?.material;
            if (material && material.opacity < minOpacity) {
                el.hitboxPath = null; // Reset le path pour éviter les clics sur un élément invisible
                return;
            }

            if (!el.hitboxContour) {
                // Pour les rectangles, on peut régénérer le contour si manquant
                if (el.hitboxOptions?.useRectangle) {
                    this.generateRectangleContour(el);
                } else {
                    // Try generating again if missing (maybe image loaded late)
                    if (el.getObject3D('mesh')?.material?.map?.image?.complete) {
                        // Debounce or check flag to avoid spam
                        if (!el.hasTriedGen) {
                            el.hasTriedGen = true;
                            this.generateContour(el);
                        }
                    }
                }
                return;
            }

            // Project contour to screen
            const screenPoints = this.manager.convertToScreenCoordinates(
                el,
                el.hitboxContour,
                el.hitboxImgSize.width,
                el.hitboxImgSize.height
            );

            if (screenPoints.length < 3) return;

            // Create Path2D
            const path = new Path2D();
            path.moveTo(screenPoints[0].x, screenPoints[0].y);
            for (let i = 1; i < screenPoints.length; i++) {
                path.lineTo(screenPoints[i].x, screenPoints[i].y);
            }
            path.closePath();

            el.hitboxPath = path;
            drawnCount++;

            // Draw Debug Outline
            if (this.debug) {
                // Couleur différente pour les hitbox rectangulaires
                this.ctx.strokeStyle = el.hitboxIsRectangle ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 0, 0, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke(path);
            }
        });

        // Occasional log
        if (this.debug && Math.random() < 0.01 && drawnCount > 0) {
            console.log(`[HitboxSystem] Drawing ${drawnCount} hitboxes`);
        }
    }
});

AFRAME.registerComponent('hitbox-target', {
    schema: {
        useRectangle: { type: 'boolean', default: false }, // Utiliser un rectangle simple au lieu du contour pixel-perfect
        minOpacity: { type: 'number', default: 0.1 } // Opacité minimale pour que la hitbox soit active
    },
    init: function () {
        this.system = this.el.sceneEl.systems['hitbox-system'];
        this.system.registerTarget(this.el, this.data);
    },
    remove: function () {
        this.system.unregisterTarget(this.el);
    }
});
