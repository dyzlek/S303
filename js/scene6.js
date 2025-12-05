/**
 * Scene 6 Components
 * Animation finale de la presentation
 */

// Declencheur pour passer a la scene 6
AFRAME.registerComponent('scene6-trigger', {
    init: function () {
        this.el.addEventListener('click', () => {
            console.log('[Scene6] Passage a la Scene 6 finale');
            const scene5 = document.querySelector('#scene5-content');
            const scene6 = document.querySelector('#scene6-content');

            // Desactiver les hitbox de la scene 5
            disableAllHitboxes(scene5);
            disableHitbox(this.el);

            if (scene5) scene5.setAttribute('visible', false);
            if (scene6) {
                scene6.setAttribute('visible', true);
                scene6.emit('startScene6');
            }
        });
    }
});

// Animation principale de la scene 6
AFRAME.registerComponent('scene6-animation', {
    init: function () {
        this.img1 = this.el.querySelector('#scene6-img1');
        this.img2 = this.el.querySelector('#scene6-img2');
        this.isAnimating = false;
        this.el.addEventListener('startScene6', () => this.startSequence());
    },

    startSequence: function () {
        if (this.isAnimating) return;
        this.isAnimating = true;
        console.log('[Scene6] Animation finale');

        this.animateImages();

        // Lancer les confettis apres les images
        setTimeout(() => this.celebrate(), 1500);
    },

    animateImages: function () {
        // Image 1 a gauche
        if (this.img1) {
            this.img1.setAttribute('animation__slideIn', {
                property: 'position', from: '-2.5 0 0.4', to: '-1.1 0 0.4',
                dur: 1000, easing: 'easeOutBack'
            });
            this.img1.setAttribute('animation__scaleIn', {
                property: 'scale', from: '0 0 0', to: '1.4 1.4 1',
                dur: 1000, easing: 'easeOutElastic'
            });
            this.img1.setAttribute('animation__fadeIn', {
                property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad'
            });
        }

        // Image 2 a droite avec delai
        setTimeout(() => {
            if (this.img2) {
                this.img2.setAttribute('animation__slideIn', {
                    property: 'position', from: '2.5 0 0.4', to: '1.1 0 0.4',
                    dur: 1000, easing: 'easeOutBack'
                });
                this.img2.setAttribute('animation__scaleIn', {
                    property: 'scale', from: '0 0 0', to: '1.4 1.4 1',
                    dur: 1000, easing: 'easeOutElastic'
                });
                this.img2.setAttribute('animation__fadeIn', {
                    property: 'opacity', from: '0', to: '1', dur: 600, easing: 'easeOutQuad'
                });
            }
        }, 400);
    },

    celebrate: function () {
        const scene6 = document.querySelector('#scene6-content');
        if (!scene6) return;

        // Confettis colores
        const colors = ['#FFD700', '#FF6B00', '#FF4500', '#FFC300', '#32CD32', '#1E90FF', '#FF1493', '#00CED1'];

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('a-box');
                const x = (Math.random() - 0.5) * 4;
                const startY = 2.5 + Math.random() * 1.5;
                const z = 0.6 + Math.random() * 0.2;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 0.02 + Math.random() * 0.04;
                const duration = 3000 + Math.random() * 2000;

                confetti.setAttribute('position', x + ' ' + startY + ' ' + z);
                confetti.setAttribute('color', color);
                confetti.setAttribute('width', size);
                confetti.setAttribute('height', size);
                confetti.setAttribute('depth', size * 0.3);
                confetti.setAttribute('rotation', (Math.random() * 360) + ' ' + (Math.random() * 360) + ' ' + (Math.random() * 360));
                confetti.setAttribute('animation__fall', {
                    property: 'position',
                    to: (x + (Math.random() - 0.5) * 0.8) + ' -2 ' + z,
                    dur: duration,
                    easing: 'easeInQuad'
                });
                confetti.setAttribute('animation__spin', {
                    property: 'rotation',
                    to: (Math.random() * 1080) + ' ' + (Math.random() * 1080) + ' ' + (Math.random() * 1080),
                    dur: duration,
                    easing: 'linear'
                });
                scene6.appendChild(confetti);

                // Supprimer apres animation
                setTimeout(() => {
                    if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
                }, duration + 200);
            }, i * 60);
        }

        this.isAnimating = false;
    }
});
