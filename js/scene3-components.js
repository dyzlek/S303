/**
 * ============================================================================
 * SCENE 3 COMPONENTS - Audio Interactif
 * ============================================================================
 * 
 * Gere la scene 3: images cliquables avec sons, volume
 * 
 * Auteur: Nuit Blanche
 * ============================================================================
 */

// Animation principale de la scene 3
AFRAME.registerComponent('scene3-animation', {
    init: function () {
        this.fond = this.el.querySelector('#scene3-fond');
        this.titre = this.el.querySelector('#scene3-titre');
        this.img1 = this.el.querySelector('#scene3-img1');
        this.img2 = this.el.querySelector('#scene3-img2');
        this.img3 = this.el.querySelector('#scene3-img3');
        this.img4 = this.el.querySelector('#scene3-img4');
        this.bp4Group = this.el.querySelector('#bp4-group');
        this.bp4 = this.el.querySelector('#scene3-bp');
        this.volume = this.el.querySelector('#scene3-volume');
        this.isAnimating = false;
        this.startSequence = this.startSequence.bind(this);
        this.el.addEventListener('startScene3', this.startSequence);
    },

    startSequence: function () {
        if (this.isAnimating) return;
        this.isAnimating = true;
        console.log('[Scene3] Demarrage');

        // Fond avec rotation
        if (this.fond) {
            this.fond.setAttribute('animation__reveal', { property: 'scale', from: '0 0 0', to: '4 2.4 1', dur: 1200, easing: 'easeOutElastic' });
            this.fond.setAttribute('animation__fade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
            this.fond.setAttribute('animation__rotateIn', { property: 'rotation', from: '0 180 0', to: '0 0 0', dur: 1000, easing: 'easeOutCubic' });
        }

        // Titre et volume
        setTimeout(() => {
            if (this.titre) {
                this.titre.setAttribute('animation__titreReveal', { property: 'scale', from: '0 0 0', to: '3.5 0.5 0.5', dur: 1000, easing: 'easeOutElastic' });
                this.titre.setAttribute('animation__titreFade', { property: 'opacity', from: '0', to: '1', dur: 500, easing: 'easeOutQuad' });
                this.titre.setAttribute('animation__titreSlide', { property: 'position', from: '0 1.4 0.2', to: '0 0.85 0.2', dur: 800, easing: 'easeOutBack' });
            }
            if (this.volume) {
                this.volume.setAttribute('animation__volumeReveal', { property: 'scale', from: '0 0 0', to: '1.5 0.35 0.5', dur: 800, easing: 'easeOutBack' });
                this.volume.setAttribute('animation__volumeFade', { property: 'opacity', from: '0', to: '1', dur: 500, easing: 'easeOutQuad' });
                this.volume.setAttribute('animation__volumeSlide', { property: 'position', from: '-1.8 -1.4 0.2', to: '-1.1 -1.05 0.2', dur: 600, easing: 'easeOutBack' });
                setTimeout(() => {
                    this.volume.setAttribute('animation__volumePulse', { property: 'scale', from: '1.5 0.35 0.5', to: '1.65 0.38 0.55', dur: 800, dir: 'alternate', loop: true, easing: 'easeInOutSine' });
                }, 800);
            }
        }, 400);

        // Image 1 (haut gauche)
        setTimeout(() => {
            if (this.img1) {
                this.img1.setAttribute('animation__img1Reveal', { property: 'scale', from: '0 0 0', to: '0.9 0.7 1', dur: 800, easing: 'easeOutBack' });
                this.img1.setAttribute('animation__img1Fade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
                this.img1.setAttribute('animation__img1Slide', { property: 'position', from: '-1.5 0.2 0.1', to: '-0.8 0.2 0.1', dur: 600, easing: 'easeOutCubic' });
                this.img1.setAttribute('animation__img1Rotate', { property: 'rotation', from: '0 -45 -10', to: '0 0 0', dur: 700, easing: 'easeOutQuad' });
            }
        }, 1500);

        // Image 2 (haut droite)
        setTimeout(() => {
            if (this.img2) {
                this.img2.setAttribute('animation__img2Reveal', { property: 'scale', from: '0 0 0', to: '0.9 0.7 1', dur: 800, easing: 'easeOutBack' });
                this.img2.setAttribute('animation__img2Fade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
                this.img2.setAttribute('animation__img2Slide', { property: 'position', from: '1.5 0.2 0.1', to: '0.8 0.2 0.1', dur: 600, easing: 'easeOutCubic' });
                this.img2.setAttribute('animation__img2Rotate', { property: 'rotation', from: '0 45 10', to: '0 0 0', dur: 700, easing: 'easeOutQuad' });
            }
        }, 2000);

        // Image 3 (bas gauche)
        setTimeout(() => {
            if (this.img3) {
                this.img3.setAttribute('animation__img3Reveal', { property: 'scale', from: '0 0 0', to: '0.9 0.7 1', dur: 800, easing: 'easeOutBack' });
                this.img3.setAttribute('animation__img3Fade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
                this.img3.setAttribute('animation__img3Slide', { property: 'position', from: '-1.5 -0.85 0.1', to: '-0.8 -0.55 0.1', dur: 600, easing: 'easeOutCubic' });
                this.img3.setAttribute('animation__img3Rotate', { property: 'rotation', from: '0 -45 10', to: '0 0 0', dur: 700, easing: 'easeOutQuad' });
            }
        }, 2500);

        // Image 4 (bas droite)
        setTimeout(() => {
            if (this.img4) {
                this.img4.setAttribute('animation__img4Reveal', { property: 'scale', from: '0 0 0', to: '0.9 0.7 1', dur: 800, easing: 'easeOutBack' });
                this.img4.setAttribute('animation__img4Fade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
                this.img4.setAttribute('animation__img4Slide', { property: 'position', from: '1.5 -0.85 0.1', to: '0.8 -0.55 0.1', dur: 600, easing: 'easeOutCubic' });
                this.img4.setAttribute('animation__img4Rotate', { property: 'rotation', from: '0 45 -10', to: '0 0 0', dur: 700, easing: 'easeOutQuad' });
            }
        }, 3000);

        // BP
        setTimeout(() => {
            if (this.bp4Group && this.bp4) {
                this.bp4Group.setAttribute('visible', true);
                this.bp4Group.setAttribute('animation__bp4Scale', { property: 'scale', from: '0 0 0', to: '1 0.4 0.4', dur: 1000, easing: 'easeOutElastic' });
                this.bp4.setAttribute('animation__bp4Fade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
                this.bp4Group.setAttribute('animation__bp4Pulse', { property: 'scale', from: '1 0.4 0.4', to: '1.1 0.44 0.44', dur: 800, delay: 1000, dir: 'alternate', loop: true, easing: 'easeInOutSine' });
            }
            this.isAnimating = false;
        }, 3500);
    }
});

// Jouer un son au clic
AFRAME.registerComponent('play-sound-on-click', {
    schema: { sound: { type: 'selector' } },
    init: function () {
        this.el.addEventListener('click', () => {
            if (this.data.sound) {
                try {
                    this.data.sound.currentTime = 0;
                    this.data.sound.play().catch(e => console.warn("Erreur lecture son:", e));
                } catch (e) { console.error("Erreur son:", e); }
            }
            // Animation visuelle
            try {
                const scaleAttr = this.el.getAttribute('scale');
                let baseX = 0.9, baseY = 0.7, baseZ = 1;
                if (scaleAttr && Math.abs(scaleAttr.x) >= 0.01) { baseX = scaleAttr.x; baseY = scaleAttr.y; baseZ = scaleAttr.z; }
                this.el.setAttribute('animation__clickScaleIn', { property: 'scale', to: `${baseX * 1.2} ${baseY * 1.2} ${baseZ}`, dur: 150, easing: 'easeOutQuad' });
                setTimeout(() => {
                    this.el.setAttribute('animation__clickScaleOut', { property: 'scale', to: `${baseX} ${baseY} ${baseZ}`, dur: 150, easing: 'easeInQuad' });
                }, 160);
            } catch (e) { console.error("Erreur animation clic:", e); }
        });
    }
});

console.log('[Scene3] Composants charges');
