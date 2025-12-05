// Scene 4 Components - Animation smooth avec explosion pendant la montée

// Scene 4 Trigger
AFRAME.registerComponent('scene4-trigger', {
    init: function () {
        this.hasClicked = false;
        this.el.addEventListener('click', () => {
            if (this.hasClicked) return;
            this.hasClicked = true;
            console.log(' BP Scene 3 cliqué! Transition vers Scene 4...');

            const scene3Content = document.querySelector('#scene3-content');
            const scene4Content = document.querySelector('#scene4-content');

            // Désactiver les hitbox de la scène 3
            disableAllHitboxes(scene3Content);
            disableHitbox(this.el);

            if (scene3Content) {
                const elementsToHide = scene3Content.querySelectorAll('a-image, a-entity');
                elementsToHide.forEach(el => {
                    if (el.getAttribute('opacity') !== '0') {
                        el.setAttribute('animation__fadeOutAll', { property: 'opacity', to: '0', dur: 500, easing: 'easeInQuad' });
                    }
                    if (el.getAttribute('scale')) {
                        el.setAttribute('animation__scaleOutAll', { property: 'scale', to: '0 0 0', dur: 500, easing: 'easeInBack' });
                    }
                });

                setTimeout(() => {
                    scene3Content.setAttribute('visible', false);
                    if (scene4Content) {
                        scene4Content.setAttribute('visible', true);
                        scene4Content.emit('startScene4');
                        console.log(' Scene 4 started!');
                    }
                }, 600);
            }
        });
    }
});

// Scene 4 Animation - Animation smooth + explosion pendant la montée finale
AFRAME.registerComponent('scene4-animation', {
    init: function () {
        this.fond = this.el.querySelector('#scene4-fond');
        this.fond1 = this.el.querySelector('#scene4-fond1');
        this.titre = this.el.querySelector('#scene4-titre');
        this.fois = this.el.querySelector('#scene4-fois');
        this.graphContainer = this.el.querySelector('#scene4-graph-container');
        this.arrow1 = this.el.querySelector('#scene4-arrow1');
        this.arrow2 = this.el.querySelector('#scene4-arrow2');
        this.arrow2Bar = this.el.querySelector('#scene4-arrow2-bar');
        this.arrow2Tip = this.el.querySelector('#scene4-arrow2-tip');
        this.counter = this.el.querySelector('#scene4-counter');
        this.label2 = this.el.querySelector('#scene4-label2');
        this.year2 = this.el.querySelector('#scene4-year2');
        this.explosion = this.el.querySelector('#scene4-explosion');
        this.rocket3d = this.el.querySelector('#scene4-rocket-3d');
        this.rocketParticles = this.el.querySelector('#scene4-rocket-particles');
        this.bp5Group = this.el.querySelector('#bp5-group');

        this.isAnimating = false;
        this.startSequence = this.startSequence.bind(this);
        this.el.addEventListener('startScene4', this.startSequence);
    },

    startSequence: function () {
        if (this.isAnimating) return;
        this.isAnimating = true;
        console.log(' Scene 4 animation started!');

        // Phase 1: Fonds (smooth)
        if (this.fond) {
            this.fond.setAttribute('animation__reveal', { property: 'scale', from: '0 0 0', to: '4 2.4 1', dur: 1200, easing: 'easeOutCubic' });
            this.fond.setAttribute('animation__fade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
        }
        setTimeout(() => {
            if (this.fond1) {
                this.fond1.setAttribute('animation__reveal', { property: 'scale', from: '0 0 0', to: '4 2.4 1', dur: 1200, easing: 'easeOutCubic' });
                this.fond1.setAttribute('animation__fade', { property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad' });
            }
        }, 150);

        // Phase 2: Titre et fois (étiré horizontalement)
        setTimeout(() => {
            if (this.titre) {
                this.titre.setAttribute('animation__titreReveal', { property: 'scale', from: '0 0 0', to: '3.5 0.5 0.5', dur: 1000, easing: 'easeOutCubic' });
                this.titre.setAttribute('animation__titreFade', { property: 'opacity', from: '0', to: '1', dur: 500, easing: 'easeOutQuad' });
            }
            // Fois très étiré horizontalement
            if (this.fois) {
                this.fois.setAttribute('animation__foisReveal', { property: 'scale', from: '0 0 0', to: '1.5 0.3 0.4', dur: 800, easing: 'easeOutBack' });
                this.fois.setAttribute('animation__foisFade', { property: 'opacity', from: '0', to: '1', dur: 400, easing: 'easeOutQuad' });
            }
        }, 400);

        // Phase 3: Flèche 1 (2015 - 78 apprentis) avec animation smooth
        setTimeout(() => {
            if (this.arrow1) {
                this.arrow1.setAttribute('visible', true);
                this.arrow1.setAttribute('animation__arrow1Grow', { property: 'scale', from: '0 0 0', to: '1 1 1', dur: 1000, easing: 'easeOutCubic' });
                console.log('📈 2015: 78 apprentis!');
            }
        }, 1000);

        // Phase 4: Flèche 2 et compteur avec animation smooth + explosion pendant la montée
        setTimeout(() => {
            if (this.arrow2) this.arrow2.setAttribute('visible', true);
            if (this.counter) this.counter.setAttribute('visible', true);
            if (this.label2) this.label2.setAttribute('visible', true);
            if (this.year2) this.year2.setAttribute('visible', true);

            // Animation smooth : 0 → 928 directement avec explosion en cours de route
            this.animateSmoothWithExplosion();
        }, 1800);
    },

    animateSmoothWithExplosion: function () {
        const startTime = Date.now();
        const duration = 4000; // 4 secondes pour une animation smooth
        const explosionTriggered = { at400: false, at600: false, at800: false };

        const counterEl = this.counter;
        const arrow2Bar = this.arrow2Bar;
        const arrow2Tip = this.arrow2Tip;
        const maxHeight = 0.85;
        const maxValue = 928;
        const self = this;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing smooth (easeInOutCubic)
            let eased;
            if (progress < 0.5) {
                eased = 4 * progress * progress * progress;
            } else {
                eased = 1 - Math.pow(-2 * progress + 2, 3) / 2;
            }

            const currentValue = Math.round(eased * maxValue);

            // Mettre à jour le compteur
            if (counterEl) counterEl.setAttribute('value', currentValue.toString());

            // Hauteur de la flèche proportionnelle (smooth)
            const heightRatio = currentValue / maxValue;
            const barHeight = 0.1 + heightRatio * maxHeight;
            if (arrow2Bar) {
                arrow2Bar.setAttribute('height', barHeight);
                arrow2Bar.setAttribute('position', '0 ' + (barHeight / 2) + ' 0');
            }
            if (arrow2Tip) {
                arrow2Tip.setAttribute('position', '0 ' + (barHeight + 0.06) + ' 0');
            }

            // Déclencher des explosions à différents moments (effet de propulsion)
            if (currentValue >= 400 && !explosionTriggered.at400) {
                explosionTriggered.at400 = true;
                self.triggerMiniExplosion(8, 0.25);
            }
            if (currentValue >= 600 && !explosionTriggered.at600) {
                explosionTriggered.at600 = true;
                self.triggerMiniExplosion(10, 0.35);
            }
            if (currentValue >= 800 && !explosionTriggered.at800) {
                explosionTriggered.at800 = true;
                self.triggerBigExplosion();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                console.log('🔢 2025: 928 apprentis!');
                // Décaler et montrer la fusée
                setTimeout(() => self.shiftLeftAndShowRocket(), 600);
            }
        };

        requestAnimationFrame(animate);
    },

    triggerMiniExplosion: function (count, distance) {
        if (!this.explosion) return;
        this.explosion.setAttribute('visible', true);

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('a-sphere');
            const colors = ['#FF6B00', '#FFD700', '#FF4500'];
            particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            particle.setAttribute('radius', (0.02 + Math.random() * 0.02).toString());
            particle.setAttribute('position', '0 0.3 0');
            particle.setAttribute('opacity', '0.9');

            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const dist = distance + Math.random() * 0.1;
            const x = Math.cos(angle) * dist;
            const y = 0.3 + Math.sin(angle) * dist * 0.6;

            particle.setAttribute('animation__explode', { property: 'position', to: x + ' ' + y + ' 0', dur: 400, easing: 'easeOutQuad' });
            particle.setAttribute('animation__fade', { property: 'opacity', from: '0.9', to: '0', dur: 400, easing: 'easeInQuad' });

            this.explosion.appendChild(particle);
            setTimeout(() => { if (particle.parentNode) particle.parentNode.removeChild(particle); }, 450);
        }
    },

    triggerBigExplosion: function () {
        console.log(' EXPLOSION FINALE!');
        if (!this.explosion) return;
        this.explosion.setAttribute('visible', true);

        // Flash du compteur
        if (this.counter) {
            this.counter.setAttribute('animation__flash1', { property: 'color', from: '#FFD700', to: '#FF0000', dur: 60, dir: 'alternate', loop: 8 });
            this.counter.setAttribute('animation__scale', { property: 'scale', from: '1 1 1', to: '1.4 1.4 1.4', dur: 200, dir: 'alternate', loop: 2 });
        }

        // Particules en vagues
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElement('a-sphere');
                    const colors = ['#FF6B00', '#FFD700', '#FF4500', '#FFFF00', '#FF0000'];
                    particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
                    particle.setAttribute('radius', (0.03 + Math.random() * 0.04).toString());
                    particle.setAttribute('position', '0 0.4 0');
                    particle.setAttribute('opacity', '1');

                    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
                    const dist = 0.4 + wave * 0.15 + Math.random() * 0.15;
                    const x = Math.cos(angle) * dist;
                    const y = 0.4 + Math.sin(angle) * dist * 0.7;
                    const z = (Math.random() - 0.5) * 0.2;

                    particle.setAttribute('animation__explode', { property: 'position', to: x + ' ' + y + ' ' + z, dur: 500 + wave * 100, easing: 'easeOutQuad' });
                    particle.setAttribute('animation__fade', { property: 'opacity', from: '1', to: '0', dur: 500 + wave * 100, easing: 'easeInQuad' });
                    particle.setAttribute('animation__shrink', { property: 'scale', from: '1 1 1', to: '0.2 0.2 0.2', dur: 500 + wave * 100, easing: 'easeInQuad' });

                    this.explosion.appendChild(particle);
                    setTimeout(() => { if (particle.parentNode) particle.parentNode.removeChild(particle); }, 700 + wave * 100);
                }
            }, wave * 80);
        }

        // Onde de choc
        const shockwave = document.createElement('a-ring');
        shockwave.setAttribute('color', '#FFFFFF');
        shockwave.setAttribute('radius-inner', '0.01');
        shockwave.setAttribute('radius-outer', '0.05');
        shockwave.setAttribute('opacity', '0.9');
        shockwave.setAttribute('position', '0 0.4 0.1');
        shockwave.setAttribute('animation__expand', { property: 'radius-outer', from: '0.05', to: '0.7', dur: 350, easing: 'easeOutQuad' });
        shockwave.setAttribute('animation__expandInner', { property: 'radius-inner', from: '0.01', to: '0.6', dur: 350, easing: 'easeOutQuad' });
        shockwave.setAttribute('animation__fadeShock', { property: 'opacity', from: '0.9', to: '0', dur: 350, easing: 'easeInQuad' });
        this.explosion.appendChild(shockwave);
        setTimeout(() => { if (shockwave.parentNode) shockwave.parentNode.removeChild(shockwave); }, 400);
    },

    shiftLeftAndShowRocket: function () {
        console.log('⬅️ Décalage vers la gauche...');
        if (this.graphContainer) {
            this.graphContainer.setAttribute('animation__shiftLeft', { property: 'position', to: '-0.5 -0.1 0.3', dur: 1000, easing: 'easeInOutCubic' });
        }

        setTimeout(() => {
            if (this.rocket3d) {
                this.rocket3d.setAttribute('visible', true);
                // Fusée plus grosse : scale 0.5 au lieu de 0.25
                this.rocket3d.setAttribute('animation__rocketReveal', { property: 'scale', from: '0 0 0', to: '0.5 0.5 0.5', dur: 1200, easing: 'easeOutCubic' });
                this.rocket3d.setAttribute('animation__rocketSpin', { property: 'rotation', from: '0 -30 15', to: '0 330 15', dur: 5000, loop: true, easing: 'linear' });
                this.rocket3d.setAttribute('animation__rocketFloat', { property: 'position', from: '1.0 -0.1 0.5', to: '1.0 0.1 0.5', dur: 2500, dir: 'alternate', loop: true, easing: 'easeInOutSine' });
            }

            // Particules centrées sous la fusée
            if (this.rocketParticles) {
                this.rocketParticles.setAttribute('visible', true);
                this.startRocketParticles();
            }

            console.log(' Fusée 3D grosse avec particules centrées!');

            // Afficher le bouton BP pour la scène 5 après 2 secondes
            setTimeout(() => {
                this.showBPButton();
            }, 2000);

            this.isAnimating = false;
        }, 1200);
    },

    showBPButton: function () {
        if (this.bp5Group) {
            this.bp5Group.setAttribute('visible', true);
            this.bp5Group.setAttribute('animation__scale', {
                property: 'scale', from: '0 0 0', to: '1 0.4 0.4',
                dur: 800, easing: 'easeOutBack'
            });
            const bpImage = this.bp5Group.querySelector('#scene4-bp');
            if (bpImage) {
                bpImage.setAttribute('animation__fade', {
                    property: 'opacity', from: '0', to: '1',
                    dur: 600, easing: 'easeOutQuad'
                });
            }
            console.log(' Bouton BP Scene 5 affiché!');
        }
    },

    startRocketParticles: function () {
        const self = this;
        const createParticle = () => {
            if (!self.rocketParticles || !self.rocketParticles.getAttribute('visible')) return;

            const particle = document.createElement('a-sphere');
            const colors = ['#FF6B00', '#FFD700', '#FF4500', '#FFFFFF', '#FFAA00'];
            particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            // Particules plus grosses : 0.03 à 0.06 au lieu de 0.015 à 0.035
            particle.setAttribute('radius', (0.03 + Math.random() * 0.03).toString());
            particle.setAttribute('opacity', '0.9');

            // Position centrée (réacteur au centre de la fusée)
            const startX = (Math.random() - 0.5) * 0.06;
            const startZ = (Math.random() - 0.5) * 0.06;
            particle.setAttribute('position', startX + ' 0 ' + startZ);

            const endX = startX + (Math.random() - 0.5) * 0.15;
            const endY = -0.4 - Math.random() * 0.3;
            const endZ = startZ + (Math.random() - 0.5) * 0.1;

            particle.setAttribute('animation__fall', { property: 'position', to: endX + ' ' + endY + ' ' + endZ, dur: 450 + Math.random() * 200, easing: 'easeInQuad' });
            particle.setAttribute('animation__fade', { property: 'opacity', from: '0.9', to: '0', dur: 450 + Math.random() * 200, easing: 'easeInQuad' });
            particle.setAttribute('animation__shrink', { property: 'scale', from: '1 1 1', to: '0.2 0.2 0.2', dur: 450 + Math.random() * 200, easing: 'easeInQuad' });

            self.rocketParticles.appendChild(particle);
            setTimeout(() => { if (particle.parentNode) particle.parentNode.removeChild(particle); }, 700);
        };

        // Plus de particules : interval 30ms au lieu de 50ms, 15 initiales au lieu de 10
        this.particleInterval = setInterval(createParticle, 30);
        for (let i = 0; i < 15; i++) setTimeout(createParticle, i * 20);
    }
});

