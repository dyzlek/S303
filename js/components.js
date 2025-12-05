// Custom A-Frame Components

// Fonction utilitaire pour désactiver une hitbox
function disableHitbox(element) {
  if (element && element.hasAttribute('hitbox-target')) {
    element.removeAttribute('hitbox-target');
    element.classList.remove('clickable');
    console.log('[LOG]', element.id || 'element');
  }
}

// Fonction pour désactiver toutes les hitbox d'un conteneur
function disableAllHitboxes(container) {
  if (!container) return;
  const hitboxElements = container.querySelectorAll('[hitbox-target]');
  hitboxElements.forEach(el => disableHitbox(el));
}
// Abstract Shape Component: Generates a procedural 3D shape
AFRAME.registerComponent('abstract-shape', {
  init: function () {
    const el = this.el;

    // Create a stretched triangle (Cone with 3 radial segments)
    const triangle = document.createElement('a-cone');
    triangle.setAttribute('radius-bottom', 1);
    triangle.setAttribute('radius-top', 0);
    triangle.setAttribute('height', 2);
    triangle.setAttribute('segments-radial', 3); // Makes it a triangular pyramid/tetrahedron look
    triangle.setAttribute('color', '#FF6B00');
    triangle.setAttribute('material', 'opacity: 0.6; metalness: 0.2; roughness: 0.8; wireframe: true'); // Wireframe or solid? Let's go solid with opacity

    // Stretch it
    triangle.setAttribute('scale', '1 3 0.2'); // Stretched vertically and flattened

    // Animation
    triangle.setAttribute('animation', {
      property: 'rotation',
      to: '360 360 0',
      loop: true,
      dur: 15000,
      easing: 'linear'
    });

    el.appendChild(triangle);
  }
});

// Rocket Sequence Component: Handles the intro animation
AFRAME.registerComponent('rocket-sequence', {
  init: function () {
    this.rocket = document.querySelector('#rocket-entity');
    this.mainContent = document.querySelector('#main-content');
    this.smokeGroup = document.querySelector('#smoke-group');

    this.isHovering = false;
    this.isCentering = false;
    this.isLaunching = false;
    this.hasLaunched = false; // Empêche de relancer l'animation
    this.contentRevealed = false; // Le contenu a été révélé au moins une fois
    this.startTime = 0;

    // État initial
    if (this.mainContent) this.mainContent.setAttribute('visible', false);
    if (this.rocket) this.rocket.setAttribute('visible', false);
    if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);

    const target = document.querySelector('[mindar-image-target]');

    // Événement: cible trouvée
    target.addEventListener('targetFound', () => {
      console.log('[LOG]', this.hasLaunched, 'contentRevealed:', this.contentRevealed);

      // Si le contenu a déjà été révélé, on le reaffiche simplement (sans animation)
      if (this.contentRevealed) {
        // Trouver la scène active actuelle
        const scenes = [
          '#main-content', '#scene2-content', '#scene3-content',
          '#scene4-content', '#scene5-content', '#scene6-content'
        ];

        // Ne rien cacher, juste s'assurer que tout est tracké correctement
        console.log('[LOG]');
        return;
      }

      if (!this.rocket) return;

      // 1. Afficher la fusée et la fumée
      this.rocket.setAttribute('visible', true);
      if (this.smokeGroup) this.smokeGroup.setAttribute('visible', true);

      // 2. Démarrer le vol dynamique
      this.isHovering = true;
      this.isCentering = false;
      this.isLaunching = false;
      this.startTime = Date.now();

      // 3. Centrer après 4 secondes
      this.centerTimeout = setTimeout(() => {
        if (this.hasLaunched) return;

        this.isHovering = false;
        this.isCentering = true;

        this.rocket.setAttribute('animation__center', {
          property: 'position',
          to: '0 0 0.1',
          dur: 500,
          easing: 'easeInOutQuad'
        });
        this.rocket.setAttribute('animation__rotate_center', {
          property: 'rotation',
          to: '0 0 0',
          dur: 500,
          easing: 'easeInOutQuad'
        });

        // 4. Lancer après le centrage
        this.launchTimeout = setTimeout(() => {
          if (this.hasLaunched) return;

          this.isCentering = false;
          this.isLaunching = true;
          this.hasLaunched = true;
          this.rocket.emit('launch');

          // Cacher la fumée après le lancement
          setTimeout(() => {
            if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);
          }, 1000);

          // 5. Révéler le contenu principal
          setTimeout(() => {
            if (this.mainContent) {
              this.mainContent.setAttribute('visible', true);
              this.contentRevealed = true; // Marquer comme révélé
              this.mainContent.emit('startReveal');

              const children = this.mainContent.querySelectorAll('*');
              children.forEach(child => child.emit('startReveal'));
            }
          }, 300);

        }, 500);

      }, 4000);
    });

    // Événement: cible perdue
    target.addEventListener('targetLost', () => {
      console.log('[LOG]', this.hasLaunched, 'contentRevealed:', this.contentRevealed);

      // Si le contenu a déjà été révélé, NE PAS le cacher
      // L'utilisateur peut juste avoir bougé légèrement
      if (this.contentRevealed) {
        console.log('[LOG]');
        return;
      }

      // Annuler les timeouts en cours si on perd la cible avant le lancement
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

  // Méthode publique pour réinitialiser complètement
  resetSequence: function () {
    console.log('[LOG]');

    // Annuler les timeouts
    if (this.centerTimeout) clearTimeout(this.centerTimeout);
    if (this.launchTimeout) clearTimeout(this.launchTimeout);

    // Reset des flags
    this.isHovering = false;
    this.isCentering = false;
    this.isLaunching = false;
    this.hasLaunched = false;
    this.contentRevealed = false;

    // Reset de la fusée
    if (this.rocket) {
      this.rocket.setAttribute('visible', false);
      this.rocket.setAttribute('position', '0 0 0.1');
      this.rocket.setAttribute('rotation', '0 0 0');
      this.rocket.removeAttribute('animation__center');
      this.rocket.removeAttribute('animation__rotate_center');
      this.rocket.removeAttribute('animation__launch');
    }

    if (this.smokeGroup) this.smokeGroup.setAttribute('visible', false);
  },

  tick: function (time, timeDelta) {
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

// Text Animation Component: Animate text on target found
AFRAME.registerComponent('animate-on-target', {
  init: function () {
    const el = this.el;
    el.setAttribute('visible', false);

    const target = document.querySelector('[mindar-image-target]');

    target.addEventListener('targetFound', () => {
      el.setAttribute('visible', true);
      el.emit('startAnimation');
    });

    target.addEventListener('targetLost', () => {
      el.setAttribute('visible', false);
    });
  }
});

// Interactive Icon Component: Handle clicks to reveal stats
AFRAME.registerComponent('interactive-icon', {
  init: function () {
    const el = this.el;
    const statText = document.querySelector('#stat-text');

    // Pulse animation on hover/click
    el.addEventListener('click', (evt) => {
      console.log('[LOG]' + (evt.target.tagName) + ')!', evt);
      // Trigger pulse
      el.emit('pulse');
      // Trigger rotation
      el.emit('rotate');

      // Toggle stat text visibility
      const isVisible = statText.getAttribute('visible');
      statText.setAttribute('visible', !isVisible);

      if (!isVisible) {
        statText.emit('showStat');
      }
    });

    // Add cursor feedback (optional if we had a cursor, but good for logic)
    el.addEventListener('mouseenter', () => {
      el.setAttribute('scale', '0.65 0.65 0.65');
    });

    el.addEventListener('mouseleave', () => {
      el.setAttribute('scale', '0.6 0.6 0.6');
    });
  }
});

// Generic Click Feedback Component: Simple pulse animation on click
AFRAME.registerComponent('click-feedback', {
  init: function () {
    const el = this.el;

    el.addEventListener('click', () => {
      // Avoid conflict if the element has its own click handler doing scale animations (like the icon)
      if (el.hasAttribute('interactive-icon')) {
        return;
      }

      // Get current scale to return to
      const currentScale = el.getAttribute('scale') || { x: 1, y: 1, z: 1 };
      const targetScale = {
        x: currentScale.x * 1.2,
        y: currentScale.y * 1.2,
        z: currentScale.z * 1.2
      };

      // Manually animate
      el.setAttribute('animation__click', {
        property: 'scale',
        to: `${targetScale.x} ${targetScale.y} ${targetScale.z}`,
        dur: 150,
        easing: 'easeOutQuad',
        dir: 'alternate',
        loop: 2
      });
    });

    // Hover effect
    el.addEventListener('mouseenter', () => {
      el.emit('hover-start');
    });
  }
});

// Falling Caps Component: Spawns falling graduation caps on reveal
AFRAME.registerComponent('falling-caps', {
  schema: {
    count: { type: 'int', default: 20 },
    model: { type: 'string', default: '#cap-model' }
  },
  init: function () {
    this.el.addEventListener('startReveal', () => {
      this.spawnCaps();
    });
  },
  spawnCaps: function () {
    for (let i = 0; i < this.data.count; i++) {
      const el = document.createElement('a-entity');

      // Use the model
      el.setAttribute('gltf-model', this.data.model);

      // Random Position (Relative to parent)
      // X: -3 to 3, Y: 4 to 8 (start high), Z: -1 to 2
      const x = (Math.random() - 0.5) * 6;
      const y = 4 + Math.random() * 4;
      const z = (Math.random() - 0.5) * 3;
      el.setAttribute('position', `${x} ${y} ${z}`);

      // Random Rotation
      el.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} ${Math.random() * 360}`);

      // Scale (Adjustable, starting safe)
      el.setAttribute('scale', '0.2 0.2 0.2');

      // Animation: Fall
      const duration = 2500 + Math.random() * 2000;
      el.setAttribute('animation__fall', {
        property: 'position',
        to: `${x} -5 ${z}`,
        dur: duration,
        easing: 'easeInQuad'
      });

      // Animation: Spin
      el.setAttribute('animation__spin', {
        property: 'rotation',
        to: `${Math.random() * 720} ${Math.random() * 720} ${Math.random() * 720}`,
        dur: duration,
        easing: 'linear'
      });

      this.el.appendChild(el);

      // Cleanup
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, duration + 100);
    }
  }
});

// Dismiss Component: Hides everything with animation on click
AFRAME.registerComponent('dismiss-on-click', {
  init: function () {
    console.log('[LOG]', this.el);

    // Simple visual feedback (cursor only)
    this.el.classList.add('clickable');

    this.el.addEventListener('click', (evt) => {
      console.log('[LOG]');
      const mainContent = document.querySelector('#main-content');

      // Désactiver les hitbox de la scène 1
      disableAllHitboxes(mainContent);
      disableHitbox(this.el);

      if (mainContent) {
        // 1. Animate the Container (Spin + Scale Down)
        mainContent.setAttribute('animation__dismiss_scale', {
          property: 'scale',
          to: '0 0 0',
          dur: 1000,
          easing: 'easeInBack'
        });

        mainContent.setAttribute('animation__dismiss_rotate', {
          property: 'rotation',
          to: '0 360 0',
          dur: 1000,
          easing: 'easeInCubic'
        });

        // 2. Staggered Fade Out for Children
        const children = mainContent.querySelectorAll('a-image');
        children.forEach((child, index) => {
          // Stagger based on index
          const delay = index * 100;

          child.setAttribute('animation__dismiss_fade', {
            property: 'opacity',
            to: '0',
            dur: 600,
            delay: delay,
            easing: 'easeInQuad'
          });

          // Optional: Fly upwards
          const currentPos = child.getAttribute('position');
          child.setAttribute('animation__dismiss_fly', {
            property: 'position',
            to: `${currentPos.x} ${currentPos.y + 2} ${currentPos.z}`,
            dur: 800,
            delay: delay,
            easing: 'easeInQuad'
          });
        });

        // 3. Hide after animation and trigger Scene 2
        setTimeout(() => {
          mainContent.setAttribute('visible', false);
          // Reset for next time (optional)
          mainContent.removeAttribute('animation__dismiss_scale');
          mainContent.removeAttribute('animation__dismiss_rotate');

          // Trigger Scene 2
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

// Presentation Manager: Handles the flow (Plan -> Content -> Graph)
AFRAME.registerComponent('presentation-manager', {
  schema: {
    step: { type: 'int', default: 1 } // Start directly at step 1 (Content)
  },
  init: function () {
    this.planEntity = document.querySelector('#plan-travail');
    this.mainContent = document.querySelector('#main-content');
    this.pieChart = document.querySelector('#pie-chart-container');
    this.arrows = document.querySelectorAll('.nav-arrow');

    // Bind methods
    this.startPresentation = this.startPresentation.bind(this);
    this.nextStep = this.nextStep.bind(this);
    this.nextGraph = this.nextGraph.bind(this);
    this.prevGraph = this.prevGraph.bind(this);

    // Listeners
    if (this.planEntity) {
      this.planEntity.addEventListener('click', this.startPresentation);
    }

    // Setup Arrows
    this.el.addEventListener('next-step', this.nextStep);
    this.el.addEventListener('next-graph', this.nextGraph);
    this.el.addEventListener('prev-graph', this.prevGraph);

    this.updateVisibility();
  },
  updateVisibility: function () {
    const step = this.data.step;
    console.log('[LOG]', step);

    // Step 0: Idle / Plan de Travail
    if (this.planEntity) this.planEntity.setAttribute('visible', step === 0);

    // Step 1: Main Content (Title, etc.)
    if (this.mainContent) {
      if (step === 1) {
        this.mainContent.setAttribute('visible', true);
        this.mainContent.emit('startReveal');
      } else if (step !== 1) {
        // Keep visible if moving to step 2? Or hide? 
        // Based on user flow: Plan -> Title -> Stats -> Graph
        // Let's hide it for Graph (Step 3)
        if (step === 3) this.mainContent.setAttribute('visible', false);
      }
    }

    // Step 3: Pie Chart
    if (this.pieChart) {
      this.pieChart.setAttribute('visible', step === 3);
    }

    // Arrows logic removed
    /*
    this.arrows.forEach(arrow => {
      // Simple logic: show arrows if not in step 0
      arrow.setAttribute('visible', step > 0);
    });
    */
  },
  startPresentation: function () {
    this.data.step = 1;
    this.updateVisibility();
  },
  nextStep: function () {
    if (this.data.step < 3) {
      this.data.step++;
      this.updateVisibility();
    }
  },
  nextGraph: function () {
    // Dispatch to pie chart
    if (this.pieChart) this.pieChart.emit('next-dataset');
  },
  prevGraph: function () {
    // Dispatch to pie chart
    if (this.pieChart) this.pieChart.emit('prev-dataset');
  }
});

// Pie Chart Component
AFRAME.registerComponent('pie-chart', {
  schema: {
    data: { type: 'string', default: '[30, 40, 30]' }, // JSON string
    colors: { type: 'array', default: ['#FF6384', '#36A2EB', '#FFCE56'] }
  },
  init: function () {
    this.slices = [];
    this.datasetIndex = 0;
    this.datasets = [
      [30, 40, 30],
      [20, 50, 30],
      [10, 20, 70],
      [31, 26, 13, 30] // Filières
    ];
    this.colors = ['#FF6384', '#36A2EB', '#4BC0C0', '#E7E9ED'];

    this.el.addEventListener('next-dataset', () => {
      this.datasetIndex = (this.datasetIndex + 1) % this.datasets.length;
      this.renderChart();
    });

    this.el.addEventListener('prev-dataset', () => {
      this.datasetIndex = (this.datasetIndex - 1 + this.datasets.length) % this.datasets.length;
      this.renderChart();
    });

    this.renderChart();
  },
  renderChart: function () {
    // Clear existing
    this.el.innerHTML = '';
    this.slices = [];

    const data = this.datasets[this.datasetIndex];
    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = 0;

    data.forEach((value, index) => {
      const angle = (value / total) * 360;
      const theta = (startAngle + angle / 2) * (Math.PI / 180); // Midpoint angle in radians

      // Create slice (Cylinder segment)
      // A-Frame doesn't have a perfect 'slice' primitive, using cylinder with theta-length
      const slice = document.createElement('a-cylinder');
      slice.setAttribute('radius', 0.5);
      slice.setAttribute('height', 0.1);
      slice.setAttribute('theta-start', startAngle);
      slice.setAttribute('theta-length', angle);
      slice.setAttribute('color', this.colors[index % this.colors.length]);
      slice.setAttribute('position', '0 0 0');
      slice.setAttribute('rotation', '90 0 0'); // Face camera
      slice.classList.add('clickable');

      // Interaction
      slice.addEventListener('click', () => this.onSliceClick(slice));

      this.el.appendChild(slice);
      this.slices.push(slice);

      startAngle += angle;
    });
  },
  onSliceClick: function (clickedSlice) {
    this.slices.forEach(slice => {
      if (slice === clickedSlice) {
        // Toggle Zoom
        const currentScale = slice.getAttribute('scale');
        const isZoomed = currentScale.x > 1.1;

        const target = isZoomed ? '1 1 1' : '1.2 1.2 1.2'; // Zoom 20%

        slice.setAttribute('animation', {
          property: 'scale',
          to: target,
          dur: 300,
          easing: 'easeOutQuad'
        });
      } else {
        // Reset others
        slice.setAttribute('animation', {
          property: 'scale',
          to: '1 1 1',
          dur: 300,
          easing: 'easeOutQuad'
        });
      }
    });
  }
});

// Navigation Arrow Component
AFRAME.registerComponent('nav-arrow', {
  schema: {
    action: { type: 'string' } // 'next-step', 'next-graph', 'prev-graph'
  },
  init: function () {
    this.el.classList.add('clickable');
    this.el.addEventListener('click', () => {
      // Emit event up to the presentation manager (parent or scene)
      // Assuming manager is on the parent 'mindar-image-target' entity
      const manager = this.el.closest('[presentation-manager]');
      if (manager) {
        manager.emit(this.data.action);
      }
    });

    // Hover effect
    this.el.addEventListener('mouseenter', () => {
      this.el.setAttribute('scale', '1.2 1.2 1.2');
    });
    this.el.addEventListener('mouseleave', () => {
      this.el.setAttribute('scale', '1 1 1');
    });
  }
});

// Scene 2 Animation Component: Handles the full scene 2 animation sequence
// Déclenché quand le bouton BP est cliqué - affiche fond.png, puis les 4 personnages
// qui bougent de façon chaotique, s'alignent, le premier change de couleur, puis le titre apparaît
AFRAME.registerComponent('scene2-animation', {
  init: function () {
    this.fond = this.el.querySelector('#scene2-fond');
    this.fond1 = this.el.querySelector('#scene2-fond1'); // Ajout de fond1
    this.persos = this.el.querySelectorAll('.perso');
    this.titre = this.el.querySelector('#scene2-titre');
    this.bp2Group = this.el.querySelector('#bp2-group'); // BP de la scène 2
    this.bp2 = this.el.querySelector('#scene2-bp');

    // État de l'animation
    this.isAnimating = false;
    this.chaoticPhase = false;
    this.chaoticStartTime = 0;

    // Position individuelle pour chaque perso (mouvement aléatoire)
    this.persoVelocities = [];

    // Bind methods
    this.startSequence = this.startSequence.bind(this);

    // Listen for trigger
    this.el.addEventListener('startScene2', this.startSequence);
  },

  startSequence: function () {
    if (this.isAnimating) return;
    this.isAnimating = true;
    console.log('[LOG]');

    // Réinitialiser les paramètres pour le mouvement de profondeur et sautillement
    this.persoAnimParams = [];
    this.persos.forEach((perso, index) => {
      // Chaque perso a une phase différente pour le sautillement et le mouvement Z
      this.persoAnimParams.push({
        phaseZ: Math.random() * Math.PI * 2,      // Phase pour le mouvement en profondeur
        phaseBounce: Math.random() * Math.PI * 2, // Phase pour le sautillement
        speedZ: 1.2 + Math.random() * 0.6,        // Vitesse du mouvement Z (plus rapide)
        speedBounce: 5 + Math.random() * 3,       // Vitesse du sautillement (plus rapide)
        amplitudeZ: 0.5 + Math.random() * 0.3,    // Amplitude mouvement profondeur (plus grand)
        amplitudeBounce: 0.15 + Math.random() * 0.08 // Amplitude sautillement (plus grand)
      });
    });

    // Phase 1: Afficher les deux fonds avec animation élastique
    if (this.fond) {
      this.fond.setAttribute('animation__reveal', {
        property: 'scale',
        from: '0 0 0',
        to: '4 2.4 1',
        dur: 1000,
        easing: 'easeOutElastic'
      });
      this.fond.setAttribute('animation__fade', {
        property: 'opacity',
        from: '0',
        to: '1',
        dur: 600,
        easing: 'easeOutQuad'
      });
    }

    // Fond1 - légèrement plus en avant, animation avec léger décalage
    if (this.fond1) {
      this.fond1.setAttribute('animation__reveal', {
        property: 'scale',
        from: '0 0 0',
        to: '4 2.4 1',
        dur: 1000,
        delay: 100, // Léger décalage pour effet de profondeur
        easing: 'easeOutElastic'
      });
      this.fond1.setAttribute('animation__fade', {
        property: 'opacity',
        from: '0',
        to: '1',
        dur: 600,
        delay: 100,
        easing: 'easeOutQuad'
      });
    }

    // Phase 2: Les personnages apparaissent à leurs positions initiales après 800ms
    setTimeout(() => {
      // Positions de base espacées horizontalement
      const basePositions = [
        { x: -0.9, y: -0.2 },
        { x: -0.3, y: -0.2 },
        { x: 0.3, y: -0.2 },
        { x: 0.9, y: -0.2 }
      ];

      this.persos.forEach((perso, index) => {
        const basePos = basePositions[index];
        // Position de départ avec Z aléatoire
        const startZ = 0.2 + Math.random() * 0.3;
        perso.setAttribute('position', `${basePos.x} ${basePos.y} ${startZ}`);

        // Stocker la position de base pour l'animation
        this.persoAnimParams[index].baseX = basePos.x;
        this.persoAnimParams[index].baseY = basePos.y;

        // Apparition avec effet de pop - personnages étirés en longueur
        perso.setAttribute('animation__appear', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          delay: index * 100,
          easing: 'easeOutQuad'
        });

        // Scale étiré en hauteur (Y plus grand)
        perso.setAttribute('animation__pop', {
          property: 'scale',
          from: '0 0 0',
          to: '0.4 0.7 0.4',  // Étiré en longueur (Y = 0.7)
          dur: 500,
          delay: index * 100,
          easing: 'easeOutBack'
        });
      });

      // Démarrer le mouvement de profondeur + sautillement
      this.chaoticPhase = true;
      this.chaoticStartTime = Date.now();
    }, 800);

    // Phase 3: Alignement après 3 secondes de chaos
    setTimeout(() => {
      this.chaoticPhase = false;
      this.alignPersos();
    }, 3800);

    // Phase 4: Le premier perso change de couleur après alignement
    setTimeout(() => {
      const firstPerso = this.persos[0];
      if (firstPerso) {
        console.log('[LOG]');

        // Animation de mise en avant (scale up) - garder l'étirement en longueur
        firstPerso.setAttribute('animation__highlight', {
          property: 'scale',
          to: '0.45 0.8 0.45',  // Légèrement plus grand mais toujours étiré
          dur: 300,
          easing: 'easeOutQuad'
        });

        // Changement de couleur avec un léger délai pour le teint orange
        // On utilise un shader personnalisé via material
        firstPerso.setAttribute('material', {
          shader: 'flat',
          color: '#FF6B00',
          opacity: 1
        });

        // Animation de pulsation pour attirer l'attention - garder l'étirement
        setTimeout(() => {
          firstPerso.setAttribute('animation__pulse', {
            property: 'scale',
            from: '0.42 0.75 0.42',
            to: '0.48 0.85 0.48',
            dur: 500,
            dir: 'alternate',
            loop: 4,
            easing: 'easeInOutSine'
          });
        }, 300);
      }
    }, 4500);

    // Phase 5: Le titre apparaît avec effet élastique (plus tôt)
    setTimeout(() => {
      if (this.titre) {
        console.log('[LOG]');
        this.titre.setAttribute('animation__titleScale', {
          property: 'scale',
          from: '0 0 0',
          to: '3 0.65 0.65',
          dur: 1200,
          easing: 'easeOutElastic'
        });
        this.titre.setAttribute('animation__titleFade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 800,
          easing: 'easeOutQuad'
        });
      }

      // Animation terminée pour le titre
      setTimeout(() => {
        console.log('[LOG]');
      }, 1200);
    }, 5000); // 500ms plus tôt

    // Phase 6: Le BP apparaît rapidement après le titre (5000 + 800 = 5800ms)
    setTimeout(() => {
      if (this.bp2Group && this.bp2) {
        console.log('[LOG]');

        // Animation du groupe (scale)
        this.bp2Group.setAttribute('animation__bpScale', {
          property: 'scale',
          from: '0 0 0',
          to: '1 0.4 0.4',
          dur: 1000,
          easing: 'easeOutElastic'
        });

        // Animation de l'image (opacity)
        this.bp2.setAttribute('animation__bpFade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 600,
          easing: 'easeOutQuad'
        });
      }

      // Animation complètement terminée
      setTimeout(() => {
        this.isAnimating = false;
        console.log('[LOG]');
      }, 1000);
    }, 5800); // Beaucoup plus tôt (était 8500ms)
  },

  alignPersos: function () {
    console.log('[LOG]');

    // Positions d'alignement finales en ligne horizontale (même Z)
    const positions = [
      { x: -0.9, y: -0.2, z: 0.3 },
      { x: -0.3, y: -0.2, z: 0.3 },
      { x: 0.3, y: -0.2, z: 0.3 },
      { x: 0.9, y: -0.2, z: 0.3 }
    ];

    this.persos.forEach((perso, index) => {
      const pos = positions[index];

      // Animation de déplacement vers la position alignée
      perso.setAttribute('animation__align', {
        property: 'position',
        to: `${pos.x} ${pos.y} ${pos.z}`,
        dur: 700,
        easing: 'easeOutBack'
      });

      // Maintenir le scale étiré
      perso.setAttribute('animation__scaleAlign', {
        property: 'scale',
        to: '0.4 0.7 0.4',
        dur: 500,
        easing: 'easeOutQuad'
      });
    });
  },

  tick: function (time, timeDelta) {
    // Mouvement de profondeur (Z) + sautillement (Y) pendant la phase d'animation
    if (this.chaoticPhase && this.persos && this.persoAnimParams && this.persoAnimParams.length > 0) {
      const t = time * 0.001; // Temps en secondes

      this.persos.forEach((perso, index) => {
        const params = this.persoAnimParams[index];
        if (!params) return;

        // Mouvement sur l'axe Z (profondeur) - oscillation douce
        const zOffset = Math.sin(t * params.speedZ + params.phaseZ) * params.amplitudeZ;
        const newZ = 0.3 + zOffset;

        // Sautillement sur l'axe Y - rebond rapide
        // Utiliser une fonction qui simule un rebond (abs de sin pour toujours aller vers le haut)
        const bounceValue = Math.abs(Math.sin(t * params.speedBounce + params.phaseBounce));
        const yOffset = bounceValue * params.amplitudeBounce;
        const newY = params.baseY + yOffset;

        // Appliquer la position (X reste fixe à la base)
        perso.setAttribute('position', `${params.baseX} ${newY} ${newZ}`);

        // Léger écrasement/étirement pendant le sautillement pour un effet "squash & stretch"
        const squashFactor = 1 - bounceValue * 0.15; // Léger écrasement quand en l'air
        const stretchFactor = 1 + bounceValue * 0.1;  // Légèrement étiré en hauteur
        perso.setAttribute('scale', `${0.4 * squashFactor} ${0.7 * stretchFactor} 0.4`);
      });
    }
  }
});

// Scene 2 BP Click Component: Gère le clic sur le BP de la scène 2
// Déclenche la phase 3: personnages bougent, texte "ce que ça fait..." avec points animés, puis info + BP
AFRAME.registerComponent('scene2-bp-click', {
  init: function () {
    this.hasClicked = false;
    this.phase3ChaoticPhase = false;

    // Références aux éléments
    this.persos = document.querySelectorAll('.perso');
    this.cqfImage = document.querySelector('#scene2-cqf'); // Nouvelle image
    this.infoImage = document.querySelector('#scene2-info');
    this.bp3Group = document.querySelector('#bp3-group');
    this.bp3 = document.querySelector('#scene2-bp-final');
    this.bp2Group = document.querySelector('#bp2-group');
    this.titre = document.querySelector('#scene2-titre'); // Titre de la scène 2

    // Paramètres d'animation pour les persos
    this.persoAnimParams = [];

    this.el.addEventListener('click', () => {
      if (this.hasClicked) return;
      this.hasClicked = true;
      console.log('[LOG]');

      // Désactiver la hitbox du bouton
      disableHitbox(this.el);

      this.startPhase3();
    });
  },

  startPhase3: function () {
    // 1. Cacher le BP cliqué
    if (this.bp2Group) {
      this.bp2Group.setAttribute('animation__hideScale', {
        property: 'scale',
        to: '0 0 0',
        dur: 300,
        easing: 'easeInBack'
      });
    }

    // 2. Afficher l'image "Ce qui fait..." (cqf.png) au milieu des persos
    setTimeout(() => {
      if (this.cqfImage) {
        this.cqfImage.setAttribute('visible', true);

        // Animation d'apparition avec effet de scale
        this.cqfImage.setAttribute('animation__scaleIn', {
          property: 'scale',
          from: '0 0 0',
          to: '1.8 0.4 1',
          dur: 500, // Plus rapide
          easing: 'easeOutBack'
        });
        this.cqfImage.setAttribute('animation__fadeIn', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400, // Plus rapide
          easing: 'easeOutQuad'
        });

        console.log('[LOG]');
      }
    }, 100); // Délai réduit à 100ms

    // 3. Les persos fuient vers les côtés après 0.6s (très rapide)
    setTimeout(() => {
      console.log('[LOG]');

      // Positions de fuite : perso 1 et 2 vont à gauche, perso 3 et 4 vont à droite
      const fleePositions = [
        { x: -2.0, y: -0.2, z: 0.25 }, // Perso 1 -> très à gauche
        { x: -1.5, y: -0.2, z: 0.25 }, // Perso 2 -> à gauche
        { x: 1.5, y: -0.2, z: 0.25 },  // Perso 3 -> à droite
        { x: 2.0, y: -0.2, z: 0.25 }   // Perso 4 -> très à droite
      ];

      this.persos.forEach((perso, index) => {
        const pos = fleePositions[index];
        perso.setAttribute('animation__flee', {
          property: 'position',
          to: `${pos.x} ${pos.y} ${pos.z}`,
          dur: 600, // Fuite plus rapide
          easing: 'easeInBack'
        });
        // Les faire disparaître aussi
        perso.setAttribute('animation__fadeOut', {
          property: 'opacity',
          to: '0',
          dur: 400,
          delay: 100,
          easing: 'easeInQuad'
        });
      });
    }, 600); // Délai réduit à 600ms

    // 4. Faire disparaître l'image cqf ET le titre de façon stylée après 1.2s
    setTimeout(() => {
      // Disparition stylée de l'image cqf (rotation + scale + fade)
      if (this.cqfImage) {
        this.cqfImage.setAttribute('animation__spinOut', {
          property: 'rotation',
          to: '0 360 0',
          dur: 500,
          easing: 'easeInCubic'
        });
        this.cqfImage.setAttribute('animation__scaleOut', {
          property: 'scale',
          to: '0 0 0',
          dur: 400,
          easing: 'easeInBack'
        });
        this.cqfImage.setAttribute('animation__fadeOut', {
          property: 'opacity',
          to: '0',
          dur: 300,
          easing: 'easeInQuad'
        });
      }

      // Disparition stylée du titre scene 2 (zoom out + rotation)
      if (this.titre) {
        this.titre.setAttribute('animation__titleSpinOut', {
          property: 'rotation',
          to: '0 -180 0',
          dur: 500,
          easing: 'easeInCubic'
        });
        this.titre.setAttribute('animation__titleScaleOut', {
          property: 'scale',
          to: '0 0 0',
          dur: 400,
          easing: 'easeInBack'
        });
        this.titre.setAttribute('animation__titleFadeOut', {
          property: 'opacity',
          to: '0',
          dur: 300,
          easing: 'easeInQuad'
        });
      }

      console.log('[LOG]');

      // Cacher complètement après l'animation
      setTimeout(() => {
        if (this.cqfImage) {
          this.cqfImage.setAttribute('visible', false);
        }
      }, 500);
    }, 1200); // Délai réduit à 1200ms

    // 5. Afficher info.png après la disparition (plus rapide)
    setTimeout(() => {
      if (this.infoImage) {
        this.infoImage.setAttribute('visible', true);
        this.infoImage.setAttribute('animation__infoScale', {
          property: 'scale',
          from: '0 0 0',
          to: '2.5 1.8 1',
          dur: 600, // Très rapide
          easing: 'easeOutElastic'
        });
        this.infoImage.setAttribute('animation__infoFade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }
    }, 1400); // Délai réduit à 1400ms

    // 6. Afficher le BP final très rapidement après info (200ms après)
    setTimeout(() => {
      if (this.bp3Group && this.bp3) {
        this.bp3Group.setAttribute('visible', true);
        this.bp3Group.setAttribute('animation__bp3Scale', {
          property: 'scale',
          from: '0 0 0',
          to: '1 0.4 0.4',
          dur: 800,
          easing: 'easeOutElastic'
        });
        this.bp3.setAttribute('animation__bp3Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 500,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }

      console.log('[LOG]');
    }, 1600); // Délai réduit à 1600ms
  },

  tick: function (time, timeDelta) {
    // Mouvement chaotique des personnages pendant la phase 3
    if (this.phase3ChaoticPhase && this.persos && this.persoAnimParams.length > 0) {
      const t = time * 0.001;

      this.persos.forEach((perso, index) => {
        const params = this.persoAnimParams[index];
        if (!params) return;

        // Mouvement chaotique sur tous les axes
        const xOffset = Math.sin(t * params.speedX + params.phaseX) * params.amplitudeX;
        const yOffset = Math.abs(Math.sin(t * params.speedY + params.phaseY)) * params.amplitudeY;
        const zOffset = Math.sin(t * params.speedZ + params.phaseZ) * params.amplitudeZ;

        const newX = params.baseX + xOffset;
        const newY = params.baseY + yOffset;
        const newZ = 0.3 + zOffset;

        perso.setAttribute('position', `${newX} ${newY} ${newZ}`);

        // Squash & stretch
        const squashFactor = 1 - yOffset * 0.5;
        const stretchFactor = 1 + yOffset * 0.3;
        perso.setAttribute('scale', `${0.4 * squashFactor} ${0.7 * stretchFactor} 0.4`);
      });
    }
  }
});

// Scene 3 Trigger: Déclenche la transition vers la scène 3
AFRAME.registerComponent('scene3-trigger', {
  init: function () {
    this.hasClicked = false;

    this.el.addEventListener('click', () => {
      if (this.hasClicked) return;
      this.hasClicked = true;
      console.log('[LOG]');

      // Désactiver les hitbox de la scène 2
      const scene2Content = document.querySelector('#scene2-content');
      disableAllHitboxes(scene2Content);
      disableHitbox(this.el);

      const scene3Content = document.querySelector('#scene3-content');

      // Faire disparaître tout de la scène 2
      if (scene2Content) {
        // Récupérer tous les enfants visibles et les faire disparaître
        const elementsToHide = scene2Content.querySelectorAll('a-image, a-entity');
        elementsToHide.forEach(el => {
          if (el.getAttribute('opacity') !== '0') {
            el.setAttribute('animation__fadeOutAll', {
              property: 'opacity',
              to: '0',
              dur: 500,
              easing: 'easeInQuad'
            });
          }
          if (el.getAttribute('scale')) {
            el.setAttribute('animation__scaleOutAll', {
              property: 'scale',
              to: '0 0 0',
              dur: 500,
              easing: 'easeInBack'
            });
          }
        });

        // Cacher la scène 2 après l'animation
        setTimeout(() => {
          scene2Content.setAttribute('visible', false);

          // Afficher la scène 3
          if (scene3Content) {
            scene3Content.setAttribute('visible', true);
            scene3Content.emit('startScene3');
            console.log('[LOG]');
          }
        }, 600);
      }
    });
  }
});

// Scene 3 Animation Component
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
    console.log('[LOG]');

    // Phase 1: Afficher le fond avec animation zoom + rotation
    if (this.fond) {
      this.fond.setAttribute('animation__reveal', {
        property: 'scale',
        from: '0 0 0',
        to: '4 2.4 1',
        dur: 1200,
        easing: 'easeOutElastic'
      });
      this.fond.setAttribute('animation__fade', {
        property: 'opacity',
        from: '0',
        to: '1',
        dur: 600,
        easing: 'easeOutQuad'
      });
      this.fond.setAttribute('animation__rotateIn', {
        property: 'rotation',
        from: '0 180 0',
        to: '0 0 0',
        dur: 1000,
        easing: 'easeOutCubic'
      });
    }

    // Phase 2: Afficher le titre étiré avec slide depuis le haut
    setTimeout(() => {
      if (this.titre) {
        // Titre plus étiré horizontalement
        this.titre.setAttribute('animation__titreReveal', {
          property: 'scale',
          from: '0 0 0',
          to: '3.5 0.5 0.5',
          dur: 1000,
          easing: 'easeOutElastic'
        });
        this.titre.setAttribute('animation__titreFade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 500,
          easing: 'easeOutQuad'
        });
        // Slide depuis le haut avec plus de perspective
        this.titre.setAttribute('animation__titreSlide', {
          property: 'position',
          from: '0 1.4 0.2',
          to: '0 0.85 0.2',
          dur: 800,
          easing: 'easeOutBack'
        });
        console.log('[LOG]');
      }

      // Volume apparaît en même temps (en bas à gauche) - étiré et plus gros
      if (this.volume) {
        this.volume.setAttribute('animation__volumeReveal', {
          property: 'scale',
          from: '0 0 0',
          to: '1.5 0.35 0.5',
          dur: 800,
          easing: 'easeOutBack'
        });
        this.volume.setAttribute('animation__volumeFade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 500,
          easing: 'easeOutQuad'
        });
        // Slide depuis le bas gauche
        this.volume.setAttribute('animation__volumeSlide', {
          property: 'position',
          from: '-1.8 -1.4 0.2',
          to: '-1.1 -1.05 0.2',
          dur: 600,
          easing: 'easeOutBack'
        });

        // Animation de pulsation continue après l'apparition
        setTimeout(() => {
          this.volume.setAttribute('animation__volumePulse', {
            property: 'scale',
            from: '1.5 0.35 0.5',
            to: '1.65 0.38 0.55',
            dur: 800,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
          });
        }, 800);

        console.log('[LOG]');
      }
    }, 400);

    // Phase 3: Images apparaissent une par une avec slide-in
    // Image 1 (haut gauche) - slide depuis la gauche
    setTimeout(() => {
      if (this.img1) {
        this.img1.setAttribute('animation__img1Reveal', {
          property: 'scale',
          from: '0 0 0',
          to: '0.9 0.7 1',
          dur: 800,
          easing: 'easeOutBack'
        });
        this.img1.setAttribute('animation__img1Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          easing: 'easeOutQuad'
        });
        this.img1.setAttribute('animation__img1Slide', {
          property: 'position',
          from: '-1.5 0.2 0.1',
          to: '-0.8 0.2 0.1',
          dur: 600,
          easing: 'easeOutCubic'
        });
        this.img1.setAttribute('animation__img1Rotate', {
          property: 'rotation',
          from: '0 -45 -10',
          to: '0 0 0',
          dur: 700,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }
    }, 1500);

    // Image 2 (haut droite) - slide depuis la droite
    setTimeout(() => {
      if (this.img2) {
        this.img2.setAttribute('animation__img2Reveal', {
          property: 'scale',
          from: '0 0 0',
          to: '0.9 0.7 1',
          dur: 800,
          easing: 'easeOutBack'
        });
        this.img2.setAttribute('animation__img2Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          easing: 'easeOutQuad'
        });
        this.img2.setAttribute('animation__img2Slide', {
          property: 'position',
          from: '1.5 0.2 0.1',
          to: '0.8 0.2 0.1',
          dur: 600,
          easing: 'easeOutCubic'
        });
        this.img2.setAttribute('animation__img2Rotate', {
          property: 'rotation',
          from: '0 45 10',
          to: '0 0 0',
          dur: 700,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }
    }, 2000);

    // Image 3 (bas gauche) - slide depuis la gauche + bas
    setTimeout(() => {
      if (this.img3) {
        this.img3.setAttribute('animation__img3Reveal', {
          property: 'scale',
          from: '0 0 0',
          to: '0.9 0.7 1',
          dur: 800,
          easing: 'easeOutBack'
        });
        this.img3.setAttribute('animation__img3Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          easing: 'easeOutQuad'
        });
        this.img3.setAttribute('animation__img3Slide', {
          property: 'position',
          from: '-1.5 -0.85 0.1',
          to: '-0.8 -0.55 0.1',
          dur: 600,
          easing: 'easeOutCubic'
        });
        this.img3.setAttribute('animation__img3Rotate', {
          property: 'rotation',
          from: '0 -45 10',
          to: '0 0 0',
          dur: 700,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }
    }, 2500);

    // Image 4 (bas droite) - slide depuis la droite + bas
    setTimeout(() => {
      if (this.img4) {
        this.img4.setAttribute('animation__img4Reveal', {
          property: 'scale',
          from: '0 0 0',
          to: '0.9 0.7 1',
          dur: 800,
          easing: 'easeOutBack'
        });
        this.img4.setAttribute('animation__img4Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 400,
          easing: 'easeOutQuad'
        });
        this.img4.setAttribute('animation__img4Slide', {
          property: 'position',
          from: '1.5 -0.85 0.1',
          to: '0.8 -0.55 0.1',
          dur: 600,
          easing: 'easeOutCubic'
        });
        this.img4.setAttribute('animation__img4Rotate', {
          property: 'rotation',
          from: '0 45 -10',
          to: '0 0 0',
          dur: 700,
          easing: 'easeOutQuad'
        });
        console.log('[LOG]');
      }
    }, 3000);

    // Phase 4: Afficher le BP rapidement après la dernière image (500ms après)
    setTimeout(() => {
      if (this.bp4Group && this.bp4) {
        this.bp4Group.setAttribute('visible', true);
        this.bp4Group.setAttribute('animation__bp4Scale', {
          property: 'scale',
          from: '0 0 0',
          to: '1 0.4 0.4',
          dur: 1000,
          easing: 'easeOutElastic'
        });
        this.bp4.setAttribute('animation__bp4Fade', {
          property: 'opacity',
          from: '0',
          to: '1',
          dur: 600,
          easing: 'easeOutQuad'
        });
        // Animation de pulsation
        this.bp4Group.setAttribute('animation__bp4Pulse', {
          property: 'scale',
          from: '1 0.4 0.4',
          to: '1.1 0.44 0.44',
          dur: 800,
          delay: 1000,
          dir: 'alternate',
          loop: true,
          easing: 'easeInOutSine'
        });
        console.log('[LOG]');
      }

      this.isAnimating = false;
      console.log('[LOG]');
    }, 3500); // 3000 (dernière image) + 500 (délai)
  }
});

// Composant pour jouer un son et animer au clic
AFRAME.registerComponent('play-sound-on-click', {
  schema: {
    sound: { type: 'selector' }
  },

  init: function () {
    this.el.addEventListener('click', () => {
      // Jouer le son
      if (this.data.sound) {
        try {
          // Rembobiner si déjà en cours
          this.data.sound.currentTime = 0;
          this.data.sound.play().catch(e => console.warn("Erreur lecture son (peut-être bloqué par le navigateur):", e));
          console.log('[LOG]', this.data.sound.id);
        } catch (e) {
          console.error("Erreur accès son:", e);
        }
      }

      // Animation visuelle (scale up puis retour à la normale)
      try {
        const scaleAttr = this.el.getAttribute('scale');

        // Copier les valeurs pour éviter les problèmes de référence
        let baseX, baseY, baseZ;
        if (!scaleAttr || (Math.abs(scaleAttr.x) < 0.01 && Math.abs(scaleAttr.y) < 0.01)) {
          // Valeur par défaut si l'échelle est trop petite
          baseX = 0.9;
          baseY = 0.7;
          baseZ = 1;
        } else {
          baseX = scaleAttr.x;
          baseY = scaleAttr.y;
          baseZ = scaleAttr.z;
        }

        const targetX = baseX * 1.2;
        const targetY = baseY * 1.2;
        const targetZ = baseZ;

        console.log(`🎯 Animation clic: ${baseX},${baseY},${baseZ} -> ${targetX},${targetY},${targetZ}`);

        // Animation aller (zoom in)
        this.el.setAttribute('animation__clickScaleIn', {
          property: 'scale',
          to: `${targetX} ${targetY} ${targetZ}`,
          dur: 150,
          easing: 'easeOutQuad'
        });

        // Animation retour (zoom out) après le zoom in
        setTimeout(() => {
          this.el.setAttribute('animation__clickScaleOut', {
            property: 'scale',
            to: `${baseX} ${baseY} ${baseZ}`,
            dur: 150,
            easing: 'easeInQuad'
          });
          console.log(`🎯 Retour à la normale: ${baseX},${baseY},${baseZ}`);
        }, 160);
      } catch (e) {
        console.error("Erreur animation clic:", e);
      }
    });
  }
});

