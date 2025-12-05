// Scene 5 Components - Podium animation with cups

// Trigger pour passer à la scène 5
AFRAME.registerComponent('scene5-trigger', {
    init: function () {
        this.el.addEventListener('click', () => {
            console.log(' Passage à la Scène 5 - Podium...');
            const scene4 = document.querySelector('#scene4-content');
            const scene5 = document.querySelector('#scene5-content');

            // Désactiver les hitbox de la scène 4
            disableAllHitboxes(scene4);
            disableHitbox(this.el);

            if (scene4) scene4.setAttribute('visible', false);
            if (scene5) {
                scene5.setAttribute('visible', true);
                scene5.emit('startScene5');
            }
        });
    }
});

// Animation principale de la scène 5 - Podium
AFRAME.registerComponent('scene5-animation', {
    init: function () {
        this.fond = this.el.querySelector('#scene5-fond');
        this.titre = this.el.querySelector('#scene5-titre');
        this.flipContainer = this.el.querySelector('#scene5-flip-container');
        // Images: 2 = podium vide, 3 = 3ème place, 4 = 2ème place, 5 = 1ère place
        this.podiumEmpty = this.el.querySelector('#scene5-card-front');   // Image 2 - Podium vide
        this.place3 = this.el.querySelector('#scene5-card-back1');        // Image 3 - 3ème place
        this.place2 = this.el.querySelector('#scene5-card-back2');        // Image 4 - 2ème place
        this.place1 = this.el.querySelector('#scene5-card-back3');        // Image 5 - 1ère place
        this.cupLeft = this.el.querySelector('#scene5-cup-left');
        this.cupRight = this.el.querySelector('#scene5-cup-right');
        this.bp6Group = this.el.querySelector('#bp6-group');

        this.isAnimating = false;
        this.el.addEventListener('startScene5', () => this.startSequence());
    },

    startSequence: function () {
        if (this.isAnimating) return;
        this.isAnimating = true;
        console.log(' Démarrage Scène 5 - Animation Podium');

        // Étape 1: Fond et titre
        this.animateBackground();

        // Étape 2: Coupes 3D (après 800ms)
        setTimeout(() => this.showCups(), 800);

        // Étape 3: Animation du podium (après 1500ms)
        setTimeout(() => this.startPodiumSequence(), 1500);
    },

    animateBackground: function () {
        if (this.fond) {
            this.fond.setAttribute('animation__scale', {
                property: 'scale', from: '0.2 0.2 0.2', to: '4 2.3 1',
                dur: 1000, easing: 'easeOutCubic'
            });
            this.fond.setAttribute('animation__fade', {
                property: 'opacity', from: '0', to: '1',
                dur: 800, easing: 'easeOutQuad'
            });
        }

        if (this.titre) {
            setTimeout(() => {
                // Titre plus petit mais plus étiré
                this.titre.setAttribute('animation__scale', {
                    property: 'scale', from: '0 0 0', to: '3.5 0.55 0.55',
                    dur: 800, easing: 'easeOutBack'
                });
                this.titre.setAttribute('animation__fade', {
                    property: 'opacity', from: '0', to: '1',
                    dur: 600, easing: 'easeOutQuad'
                });
            }, 300);
        }
    },

    showCups: function () {
        // Coupe gauche avec animations - plus basse
        if (this.cupLeft) {
            this.cupLeft.setAttribute('visible', true);
            this.cupLeft.setAttribute('animation__reveal', {
                property: 'scale', from: '0 0 0', to: '0.6 0.6 0.6',
                dur: 1000, easing: 'easeOutElastic'
            });
            this.cupLeft.setAttribute('animation__spin', {
                property: 'rotation', from: '0 0 0', to: '0 360 0',
                dur: 4000, loop: true, easing: 'linear'
            });
            this.cupLeft.setAttribute('animation__float', {
                property: 'position', from: '-1.2 -0.8 0.8', to: '-1.2 -0.5 0.8',
                dur: 2000, dir: 'alternate', loop: true, easing: 'easeInOutSine'
            });
        }

        // Coupe droite avec animations - plus basse
        if (this.cupRight) {
            this.cupRight.setAttribute('visible', true);
            setTimeout(() => {
                this.cupRight.setAttribute('animation__reveal', {
                    property: 'scale', from: '0 0 0', to: '0.6 0.6 0.6',
                    dur: 1000, easing: 'easeOutElastic'
                });
                this.cupRight.setAttribute('animation__spin', {
                    property: 'rotation', from: '0 360 0', to: '0 0 0',
                    dur: 3500, loop: true, easing: 'linear'
                });
                this.cupRight.setAttribute('animation__float', {
                    property: 'position', from: '1.2 -0.5 0.8', to: '1.2 -0.8 0.8',
                    dur: 2200, dir: 'alternate', loop: true, easing: 'easeInOutSine'
                });
            }, 200);
        }
    },

    startPodiumSequence: function () {
        console.log(' Séquence Podium : Vide → 3ème → 2ème → 1er');

        // Étape 1: Podium vide apparaît avec effet de zoom
        this.showPodiumEmpty();

        // Étape 2: 3ème place (après 2s)
        setTimeout(() => this.showPlace(3, this.place3), 2000);

        // Étape 3: 2ème place (après 4s)
        setTimeout(() => this.showPlace(2, this.place2), 4000);

        // Étape 4: 1ère place avec explosion (après 6s)
        setTimeout(() => this.showFirstPlace(), 6000);
    },

    showPodiumEmpty: function () {
        if (this.podiumEmpty) {
            // Apparition avec effet de zoom et rebond
            this.podiumEmpty.setAttribute('animation__scale', {
                property: 'scale', from: '0 0 0', to: '1.4 1.4 1',
                dur: 1000, easing: 'easeOutElastic'
            });
            this.podiumEmpty.setAttribute('animation__fade', {
                property: 'opacity', from: '0', to: '1',
                dur: 500, easing: 'easeOutQuad'
            });
            // Légère pulsation
            setTimeout(() => {
                this.podiumEmpty.setAttribute('animation__pulse', {
                    property: 'scale', from: '1.4 1.4 1', to: '1.35 1.35 1',
                    dur: 1000, dir: 'alternate', loop: true, easing: 'easeInOutSine'
                });
            }, 1000);
        }
    },

    showPlace: function (placeNum, cardEl) {
        if (!cardEl) return;

        console.log(`🥉 Révélation ${placeNum}ème place!`);

        // Cacher la carte précédente avec un slide out
        const prevCard = placeNum === 3 ? this.podiumEmpty : (placeNum === 2 ? this.place3 : this.place2);
        if (prevCard) {
            prevCard.setAttribute('animation__slideOut', {
                property: 'position',
                to: '-2 0 0.01',
                dur: 500,
                easing: 'easeInBack'
            });
            prevCard.setAttribute('animation__fadeOut', {
                property: 'opacity', to: '0',
                dur: 400, easing: 'easeInQuad'
            });
        }

        // Nouvelle carte slide in depuis la droite
        setTimeout(() => {
            cardEl.setAttribute('position', '2 0 0.01');
            cardEl.setAttribute('opacity', '1');
            cardEl.setAttribute('scale', '1.4 1.4 1');

            cardEl.setAttribute('animation__slideIn', {
                property: 'position',
                from: '2 0 0.01',
                to: '0 0 0.01',
                dur: 600,
                easing: 'easeOutBack'
            });

            // Effet de brillance/pulse
            setTimeout(() => {
                cardEl.setAttribute('animation__pulse', {
                    property: 'scale', from: '1.4 1.4 1', to: '1.35 1.35 1',
                    dur: 1000, dir: 'alternate', loop: true, easing: 'easeInOutSine'
                });
            }, 600);

            // Particules de confettis
            this.createConfetti(placeNum);
        }, 400);
    },

    showFirstPlace: function () {
        console.log('🥇 RÉVÉLATION 1ère PLACE!');

        // Cacher la 2ème place avec explosion
        if (this.place2) {
            this.place2.setAttribute('animation__explode', {
                property: 'scale', to: '2 2 1',
                dur: 300, easing: 'easeOutQuad'
            });
            this.place2.setAttribute('animation__fadeOut', {
                property: 'opacity', to: '0',
                dur: 300, easing: 'easeOutQuad'
            });
        }

        // Flash blanc
        setTimeout(() => {
            this.createFlash();
        }, 200);

        // 1ère place apparaît avec effet spectaculaire
        setTimeout(() => {
            if (this.place1) {
                this.place1.setAttribute('position', '0 0 0.01');
                this.place1.setAttribute('opacity', '1');

                // Zoom depuis le centre
                this.place1.setAttribute('animation__zoomIn', {
                    property: 'scale', from: '0 0 0', to: '1.5 1.5 1',
                    dur: 800, easing: 'easeOutElastic'
                });

                // Rotation de célébration
                this.place1.setAttribute('animation__celebrate', {
                    property: 'rotation', from: '0 0 -5', to: '0 0 5',
                    dur: 500, dir: 'alternate', loop: 4, easing: 'easeInOutSine'
                });

                // Puis revenir stable avec pulsation dorée
                setTimeout(() => {
                    this.place1.removeAttribute('animation__celebrate');
                    this.place1.setAttribute('rotation', '0 0 0');
                    this.place1.setAttribute('animation__goldPulse', {
                        property: 'scale', from: '1.5 1.5 1', to: '1.45 1.45 1',
                        dur: 800, dir: 'alternate', loop: true, easing: 'easeInOutSine'
                    });
                }, 2500);
            }
        }, 400);

        // Beaucoup de confettis!
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.createConfetti(1), i * 200);
            }
        }, 500);

        // Afficher le bouton BP pour la scène 6 après 3 secondes
        setTimeout(() => {
            this.showBPButton();
        }, 3000);

        this.isAnimating = false;
    },

    showBPButton: function () {
        if (this.bp6Group) {
            this.bp6Group.setAttribute('visible', true);
            this.bp6Group.setAttribute('animation__scale', {
                property: 'scale', from: '0 0 0', to: '1 0.4 0.4',
                dur: 800, easing: 'easeOutBack'
            });
            const bpImage = this.bp6Group.querySelector('#scene5-bp');
            if (bpImage) {
                bpImage.setAttribute('animation__fade', {
                    property: 'opacity', from: '0', to: '1',
                    dur: 600, easing: 'easeOutQuad'
                });
            }
            console.log(' Bouton BP Scene 6 affiché!');
        }
    },

    createConfetti: function (place) {
        const colors = place === 1 ? ['#FFD700', '#FFA500', '#FFFF00'] :
            place === 2 ? ['#C0C0C0', '#A0A0A0', '#E0E0E0'] :
                ['#CD7F32', '#B87333', '#D4A574'];

        for (let i = 0; i < 8; i++) {
            const confetti = document.createElement('a-box');
            confetti.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.setAttribute('width', '0.03');
            confetti.setAttribute('height', '0.03');
            confetti.setAttribute('depth', '0.01');
            confetti.setAttribute('position', `${(Math.random() - 0.5) * 0.5} 0.5 0.4`);
            confetti.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`);

            const endX = (Math.random() - 0.5) * 1.5;
            const endY = -0.8 - Math.random() * 0.5;

            confetti.setAttribute('animation__fall', {
                property: 'position',
                to: `${endX} ${endY} 0.4`,
                dur: 1500 + Math.random() * 500,
                easing: 'easeInQuad'
            });
            confetti.setAttribute('animation__spin', {
                property: 'rotation',
                to: `${Math.random() * 720} ${Math.random() * 720} ${Math.random() * 720}`,
                dur: 1500,
                easing: 'linear'
            });
            confetti.setAttribute('animation__fadeConf', {
                property: 'opacity', from: '1', to: '0',
                dur: 1500, easing: 'easeInQuad'
            });

            this.flipContainer.appendChild(confetti);
            setTimeout(() => { if (confetti.parentNode) confetti.parentNode.removeChild(confetti); }, 2000);
        }
    },

    createFlash: function () {
        const flash = document.createElement('a-plane');
        flash.setAttribute('color', '#FFFFFF');
        flash.setAttribute('width', '5');
        flash.setAttribute('height', '5');
        flash.setAttribute('position', '0 0 0.5');
        flash.setAttribute('opacity', '0');
        flash.setAttribute('animation__flashIn', {
            property: 'opacity', from: '0', to: '0.9',
            dur: 100, easing: 'easeOutQuad'
        });
        flash.setAttribute('animation__flashOut', {
            property: 'opacity', from: '0.9', to: '0',
            dur: 400, delay: 100, easing: 'easeOutQuad'
        });

        this.flipContainer.appendChild(flash);
        setTimeout(() => { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 600);
    }
});

