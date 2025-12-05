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
