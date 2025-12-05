/**
 * ============================================================================
 * SCENE 2 COMPONENTS - Animation des Personnages
 * ============================================================================
 * 
 * Gere la scene 2: personnages, mouvements chaotiques, alignement
 * 
 * Auteur: Nuit Blanche
 * ============================================================================
 */

// Animation principale de la scene 2
AFRAME.registerComponent('scene2-animation', {
    init: function () {
        this.fond = this.el.querySelector('#scene2-fond');
        this.fond1 = this.el.querySelector('#scene2-fond1');
        this.persos = this.el.querySelectorAll('.perso');
        this.titre = this.el.querySelector('#scene2-titre');
        this.bp2Group = this.el.querySelector('#bp2-group');
        this.bp2 = this.el.querySelector('#scene2-bp');
        this.isAnimating = false;
        this.chaoticPhase = false;
        this.persoAnimParams = [];
        this.startSequence = this.startSequence.bind(this);
        this.el.addEventListener('startScene2', this.startSequence);
    },

    startSequence: function () {
        if (this.isAnimating) return;
        this.isAnimating = true;
        console.log('[Scene2] Demarrage');

        this.persoAnimParams = [];
        this.persos.forEach(() => {
            this.persoAnimParams.push({
                phaseZ: Math.random() * Math.PI * 2,
                phaseBounce: Math.random() * Math.PI * 2,
                speedZ: 1.2 + Math.random() * 0.6,
                speedBounce: 5 + Math.random() * 3,
                amplitudeZ: 0.5 + Math.random() * 0.3,
                amplitudeBounce: 0.15 + Math.random() * 0.08
            });
        });

        // Fonds
        if (this.fond) {
            this.fond.setAttribute('animation__reveal', { property: 'scale', from: '0 0 0', to: '4 2.4 1', dur: 1000, easing: 'easeOutElastic' });
            this.fond.setAttribute('animation__fade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
        }
        if (this.fond1) {
            this.fond1.setAttribute('animation__reveal', { property: 'scale', from: '0 0 0', to: '4 2.4 1', dur: 1000, delay: 100, easing: 'easeOutElastic' });
            this.fond1.setAttribute('animation__fade', { property: 'opacity', from: '0', to: '1', dur: 600, delay: 100, easing: 'easeOutQuad' });
        }

        // Personnages
        setTimeout(() => {
            const basePositions = [{ x: -0.9, y: -0.2 }, { x: -0.3, y: -0.2 }, { x: 0.3, y: -0.2 }, { x: 0.9, y: -0.2 }];
            this.persos.forEach((perso, index) => {
                const basePos = basePositions[index];
                perso.setAttribute('position', `${basePos.x} ${basePos.y} ${0.2 + Math.random() * 0.3}`);
                this.persoAnimParams[index].baseX = basePos.x;
                this.persoAnimParams[index].baseY = basePos.y;
                perso.setAttribute('animation__appear', { property: 'opacity', from: '0', to: '1', dur: 400, delay: index * 100, easing: 'easeOutQuad' });
                perso.setAttribute('animation__pop', { property: 'scale', from: '0 0 0', to: '0.4 0.7 0.4', dur: 500, delay: index * 100, easing: 'easeOutBack' });
            });
            this.chaoticPhase = true;
        }, 800);

        // Alignement
        setTimeout(() => { this.chaoticPhase = false; this.alignPersos(); }, 3800);

        // Premier perso orange
        setTimeout(() => {
            const firstPerso = this.persos[0];
            if (firstPerso) {
                firstPerso.setAttribute('animation__highlight', { property: 'scale', to: '0.45 0.8 0.45', dur: 300, easing: 'easeOutQuad' });
                firstPerso.setAttribute('material', { shader: 'flat', color: '#FF6B00', opacity: 1 });
                setTimeout(() => {
                    firstPerso.setAttribute('animation__pulse', { property: 'scale', from: '0.42 0.75 0.42', to: '0.48 0.85 0.48', dur: 500, dir: 'alternate', loop: 4, easing: 'easeInOutSine' });
                }, 300);
            }
        }, 4500);

        // Titre
        setTimeout(() => {
            if (this.titre) {
                this.titre.setAttribute('animation__titleScale', { property: 'scale', from: '0 0 0', to: '3 0.65 0.65', dur: 1200, easing: 'easeOutElastic' });
                this.titre.setAttribute('animation__titleFade', { property: 'opacity', from: '0', to: '1', dur: 800, easing: 'easeOutQuad' });
            }
        }, 5000);

        // BP
        setTimeout(() => {
            if (this.bp2Group && this.bp2) {
                this.bp2Group.setAttribute('animation__bpScale', { property: 'scale', from: '0 0 0', to: '1 0.4 0.4', dur: 1000, easing: 'easeOutElastic' });
                this.bp2.setAttribute('animation__bpFade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
            }
            setTimeout(() => { this.isAnimating = false; }, 1000);
        }, 5800);
    },

    alignPersos: function () {
        const positions = [{ x: -0.9, y: -0.2, z: 0.3 }, { x: -0.3, y: -0.2, z: 0.3 }, { x: 0.3, y: -0.2, z: 0.3 }, { x: 0.9, y: -0.2, z: 0.3 }];
        this.persos.forEach((perso, index) => {
            const pos = positions[index];
            perso.setAttribute('animation__align', { property: 'position', to: `${pos.x} ${pos.y} ${pos.z}`, dur: 700, easing: 'easeOutBack' });
            perso.setAttribute('animation__scaleAlign', { property: 'scale', to: '0.4 0.7 0.4', dur: 500, easing: 'easeOutQuad' });
        });
    },

    tick: function (time) {
        if (this.chaoticPhase && this.persos && this.persoAnimParams.length > 0) {
            const t = time * 0.001;
            this.persos.forEach((perso, index) => {
                const params = this.persoAnimParams[index];
                if (!params) return;
                const zOffset = Math.sin(t * params.speedZ + params.phaseZ) * params.amplitudeZ;
                const bounceValue = Math.abs(Math.sin(t * params.speedBounce + params.phaseBounce));
                const yOffset = bounceValue * params.amplitudeBounce;
                perso.setAttribute('position', `${params.baseX} ${params.baseY + yOffset} ${0.3 + zOffset}`);
                perso.setAttribute('scale', `${0.4 * (1 - bounceValue * 0.15)} ${0.7 * (1 + bounceValue * 0.1)} 0.4`);
            });
        }
    }
});

// Clic sur BP Scene 2
AFRAME.registerComponent('scene2-bp-click', {
    init: function () {
        this.hasClicked = false;
        this.persos = document.querySelectorAll('.perso');
        this.cqfImage = document.querySelector('#scene2-cqf');
        this.infoImage = document.querySelector('#scene2-info');
        this.bp3Group = document.querySelector('#bp3-group');
        this.bp3 = document.querySelector('#scene2-bp-final');
        this.bp2Group = document.querySelector('#bp2-group');
        this.titre = document.querySelector('#scene2-titre');

        this.el.addEventListener('click', () => {
            if (this.hasClicked) return;
            this.hasClicked = true;
            disableHitbox(this.el);
            this.startPhase3();
        });
    },

    startPhase3: function () {
        if (this.bp2Group) this.bp2Group.setAttribute('animation__hideScale', { property: 'scale', to: '0 0 0', dur: 300, easing: 'easeInBack' });

        setTimeout(() => {
            if (this.cqfImage) {
                this.cqfImage.setAttribute('visible', true);
                this.cqfImage.setAttribute('animation__scaleIn', { property: 'scale', from: '0 0 0', to: '1.8 0.4 1', dur: 500, easing: 'easeOutBack' });
                this.cqfImage.setAttribute('animation__fadeIn', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
            }
        }, 100);

        setTimeout(() => {
            const fleePositions = [{ x: -2.0, y: -0.2, z: 0.25 }, { x: -1.5, y: -0.2, z: 0.25 }, { x: 1.5, y: -0.2, z: 0.25 }, { x: 2.0, y: -0.2, z: 0.25 }];
            this.persos.forEach((perso, index) => {
                const pos = fleePositions[index];
                perso.setAttribute('animation__flee', { property: 'position', to: `${pos.x} ${pos.y} ${pos.z}`, dur: 600, easing: 'easeInBack' });
                perso.setAttribute('animation__fadeOut', { property: 'opacity', to: '0', dur: 400, delay: 100, easing: 'easeInQuad' });
            });
        }, 600);

        setTimeout(() => {
            if (this.cqfImage) {
                this.cqfImage.setAttribute('animation__spinOut', { property: 'rotation', to: '0 360 0', dur: 500, easing: 'easeInCubic' });
                this.cqfImage.setAttribute('animation__scaleOut', { property: 'scale', to: '0 0 0', dur: 400, easing: 'easeInBack' });
            }
            if (this.titre) {
                this.titre.setAttribute('animation__titleSpinOut', { property: 'rotation', to: '0 -180 0', dur: 500, easing: 'easeInCubic' });
                this.titre.setAttribute('animation__titleScaleOut', { property: 'scale', to: '0 0 0', dur: 400, easing: 'easeInBack' });
            }
            setTimeout(() => { if (this.cqfImage) this.cqfImage.setAttribute('visible', false); }, 500);
        }, 1200);

        setTimeout(() => {
            if (this.infoImage) {
                this.infoImage.setAttribute('visible', true);
                this.infoImage.setAttribute('animation__infoScale', { property: 'scale', from: '0 0 0', to: '2.5 1.8 1', dur: 600, easing: 'easeOutElastic' });
                this.infoImage.setAttribute('animation__infoFade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
            }
        }, 1400);

        setTimeout(() => {
            if (this.bp3Group && this.bp3) {
                this.bp3Group.setAttribute('visible', true);
                this.bp3Group.setAttribute('animation__bp3Scale', { property: 'scale', from: '0 0 0', to: '1 0.4 0.4', dur: 800, easing: 'easeOutElastic' });
                this.bp3.setAttribute('animation__bp3Fade', { property: 'opacity', from: '0', to: '1', dur: 500, easing: 'easeOutQuad' });
            }
        }, 1600);
    }
});

// Declencheur vers Scene 3
AFRAME.registerComponent('scene3-trigger', {
    init: function () {
        this.hasClicked = false;
        this.el.addEventListener('click', () => {
            if (this.hasClicked) return;
            this.hasClicked = true;
            const scene2Content = document.querySelector('#scene2-content');
            disableAllHitboxes(scene2Content);
            disableHitbox(this.el);
            const scene3Content = document.querySelector('#scene3-content');
            if (scene2Content) {
                scene2Content.querySelectorAll('a-image, a-entity').forEach(el => {
                    if (el.getAttribute('opacity') !== '0') el.setAttribute('animation__fadeOutAll', { property: 'opacity', to: '0', dur: 500, easing: 'easeInQuad' });
                    if (el.getAttribute('scale')) el.setAttribute('animation__scaleOutAll', { property: 'scale', to: '0 0 0', dur: 500, easing: 'easeInBack' });
                });
                setTimeout(() => {
                    scene2Content.setAttribute('visible', false);
                    if (scene3Content) { scene3Content.setAttribute('visible', true); scene3Content.emit('startScene3'); }
                }, 600);
            }
        });
    }
});

console.log('[Scene2] Composants charges');
