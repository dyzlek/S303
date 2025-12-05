document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const homeScreen = document.getElementById('home-screen');
    const scanOverlay = document.getElementById('scan-overlay');
    const scene = document.querySelector('a-scene');

    startBtn.addEventListener('click', () => {
        // Hide home screen
        homeScreen.classList.add('hidden-ui');

        // Show scan instruction
        scanOverlay.classList.remove('opacity-0');
        scanOverlay.classList.add('visible-ui');
    });

    // Optional: Listen for target found to hide scan overlay
    const target = document.querySelector('[mindar-image-target]');
    target.addEventListener('targetFound', () => {
        scanOverlay.textContent = "Cible détectée !";
        setTimeout(() => {
            scanOverlay.style.opacity = '0';
        }, 2000);
    });

    target.addEventListener('targetLost', () => {
        scanOverlay.textContent = "Scannez l'affiche...";
        scanOverlay.style.opacity = '1';
    });
});

// Generic Click Feedback Component: Simple pulse animation on click
AFRAME.registerComponent('click-feedback', {
    init: function () {
        const el = this.el;

        el.addEventListener('click', () => {
            // Avoid conflict if the element has its own click handler doing scale animations
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
