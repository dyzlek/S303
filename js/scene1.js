/**
 * Scene 1 - Introduction et Animation de la Fusee
 * 
 * Gere la premiere scene: fusee d'intro, revelation du contenu, bouton BP
 */

// Sequence de la fusee d'introduction
AFRAME.registerComponent('rocket-sequence', {
    init: function () {
        this.rocket = document.querySelector('#rocket-entity');
        this.mainContent = document.querySelector('#main-content');
        this.smokeGroup = document.querySelector('#smoke-group');
        this.isHovering = false;
        this.isCentering = false;
        this.isLaunching = false;
        this.hasLaunched = false;
        this.contentRevealed = false;
        this.startTime = 0;

        if (this.mainContent) this.mainContent.setAttribute('visible', false);
        if (this.rocket) this.rocket.setAttribute('visible', false);
        if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);

        const target = document.querySelector('[mindar-image-target]');

        // Cible AR detectee
        target.addEventListener('targetFound', () => {
            console.log('[Scene1] Cible detectee');
            if (this.contentRevealed) return;
            if (!this.rocket) return;

            this.rocket.setAttribute('visible', true);
            if (this.smokeGroup) this.smokeGroup.setAttribute('visible', true);

            this.isHovering = true;
            this.isCentering = false;
            this.isLaunching = false;
            this.startTime = Date.now();

            // Centrer apres 4 secondes
            this.centerTimeout = setTimeout(() => {
                if (this.hasLaunched) return;
                this.isHovering = false;
                this.isCentering = true;

                this.rocket.setAttribute('animation__center', {
                    property: 'position', to: '0 0 0.1', dur: 500, easing: 'easeInOutQuad'
                });
                this.rocket.setAttribute('animation__rotate_center', {
                    property: 'rotation', to: '0 0 0', dur: 500, easing: 'easeInOutQuad'
                });

                // Lancer apres centrage
                this.launchTimeout = setTimeout(() => {
                    if (this.hasLaunched) return;
                    this.isCentering = false;
                    this.isLaunching = true;
                    this.hasLaunched = true;
                    this.rocket.emit('launch');

                    setTimeout(() => {
                        if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);
                    }, 1000);

                    // Reveler le contenu
                    setTimeout(() => {
                        if (this.mainContent) {
                            this.mainContent.setAttribute('visible', true);
                            this.contentRevealed = true;
                            this.mainContent.emit('startReveal');
                            const children = this.mainContent.querySelectorAll('*');
                            children.forEach(child => child.emit('startReveal'));
                        }
                    }, 300);
                }, 500);
            }, 4000);
        });

        // Cible AR perdue
        target.addEventListener('targetLost', () => {
            console.log('[Scene1] Cible perdue');
            if (this.contentRevealed) return;

            if (this.centerTimeout) clearTimeout(this.centerTimeout);
            if (this.launchTimeout) clearTimeout(this.launchTimeout);

            this.isHovering = false;
            this.isCentering = false;
            this.isLaunching = false;

            if (this.rocket) {
                this.rocket.setAttribute('visible', false);
                this.rocket.removeAttribute('animation__center');
                this.rocket.removeAttribute('animation__rotate_center');
                this.rocket.setAttribute('position', '0 0 0.1');
                this.rocket.setAttribute('rotation', '0 0 0');
            }
            if (this.mainContent) this.mainContent.setAttribute('visible', false);
            if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);
        });
    },

    resetSequence: function () {
        if (this.centerTimeout) clearTimeout(this.centerTimeout);
        if (this.launchTimeout) clearTimeout(this.launchTimeout);
        this.isHovering = false;
        this.isCentering = false;
        this.isLaunching = false;
        this.hasLaunched = false;
        this.contentRevealed = false;
        if (this.rocket) {
            this.rocket.setAttribute('visible', false);
            this.rocket.setAttribute('position', '0 0 0.1');
            this.rocket.setAttribute('rotation', '0 0 0');
        }
        if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);
    },

    tick: function (time) {
        if (this.isHovering && this.rocket && !this.isCentering) {
            const t = time * 0.003;
            const x = Math.sin(t) * 0.4;
            const y = Math.sin(t * 1.3) * 0.3;
            const z = 0.1 + Math.cos(t * 0.9) * 0.15;
            this.rocket.setAttribute('position', `${x} ${y} ${z}`);

            const dx = Math.cos(t);
            const dy = Math.cos(t * 1.3) * 1.3;
            const bankZ = -dx * 25;
            const bankX = -dy * 10;
            this.rocket.setAttribute('rotation', `${bankX} 0 ${bankZ}`);
        }
    }
});

// Transition vers Scene 2
AFRAME.registerComponent('dismiss-on-click', {
    init: function () {
        this.el.classList.add('clickable');

        this.el.addEventListener('click', () => {
            console.log('[Scene1] Transition vers Scene 2');
            const mainContent = document.querySelector('#main-content');
            disableAllHitboxes(mainContent);
            disableHitbox(this.el);

            if (mainContent) {
                mainContent.setAttribute('animation__dismiss_scale', {
                    property: 'scale', to: '0 0 0', dur: 1000, easing: 'easeInBack'
                });
                mainContent.setAttribute('animation__dismiss_rotate', {
                    property: 'rotation', to: '0 360 0', dur: 1000, easing: 'easeInCubic'
                });

                const children = mainContent.querySelectorAll('a-image');
                children.forEach((child, index) => {
                    const delay = index * 100;
                    child.setAttribute('animation__dismiss_fade', {
                        property: 'opacity', to: '0', dur: 600, delay: delay, easing: 'easeInQuad'
                    });
                    const currentPos = child.getAttribute('position');
                    child.setAttribute('animation__dismiss_fly', {
                        property: 'position', to: `${currentPos.x} ${currentPos.y + 2} ${currentPos.z}`,
                        dur: 800, delay: delay, easing: 'easeInQuad'
                    });
                });

                setTimeout(() => {
                    mainContent.setAttribute('visible', false);
                    mainContent.removeAttribute('animation__dismiss_scale');
                    mainContent.removeAttribute('animation__dismiss_rotate');
                    const scene2 = document.querySelector('#scene2-content');
                    if (scene2) {
                        scene2.setAttribute('visible', true);
                        scene2.emit('startScene2');
                    }
                }, 1200);
            }
        });
    }
});

// Animation sur cible detectee
AFRAME.registerComponent('animate-on-target', {
    init: function () {
        this.el.setAttribute('visible', false);
        const target = document.querySelector('[mindar-image-target]');
        target.addEventListener('targetFound', () => {
            this.el.setAttribute('visible', true);
            this.el.emit('startAnimation');
        });
        target.addEventListener('targetLost', () => {
            this.el.setAttribute('visible', false);
        });
    }
});

// Chapeaux tombants
AFRAME.registerComponent('falling-caps', {
    schema: {
        count: { type: 'int', default: 20 },
        model: { type: 'string', default: '#cap-model' }
    },
    init: function () {
        this.el.addEventListener('startReveal', () => this.spawnCaps());
    },
    spawnCaps: function () {
        for (let i = 0; i < this.data.count; i++) {
            const el = document.createElement('a-entity');
            el.setAttribute('gltf-model', this.data.model);
            const x = (Math.random() - 0.5) * 6;
            const y = 4 + Math.random() * 4;
            const z = (Math.random() - 0.5) * 3;
            el.setAttribute('position', `${x} ${y} ${z}`);
            el.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`);
            el.setAttribute('scale', '0.2 0.2 0.2');
            const duration = 2500 + Math.random() * 2000;
            el.setAttribute('animation__fall', {
                property: 'position', to: `${x} -5 ${z}`, dur: duration, easing: 'easeInQuad'
            });
            el.setAttribute('animation__spin', {
                property: 'rotation', to: `${Math.random() * 720} ${Math.random() * 720} ${Math.random() * 720}`,
                dur: duration, easing: 'linear'
            });
            this.el.appendChild(el);
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, duration + 100);
        }
    }
});

console.log('[Scene1] Composants charges');
