/**
 * ============================================================================
 * UTILS.JS - Fonctions Utilitaires Partagees
 * ============================================================================
 * 
 * Ce fichier contient les fonctions utilitaires utilisees par tous les
 * composants de l'application AR.
 * 
 * Auteur: Nuit Blanche
 * ============================================================================
 */

/**
 * Desactive la hitbox d'un element specifique
 * @param {HTMLElement} element - L'element dont on veut desactiver la hitbox
 */
function disableHitbox(element) {
    if (element && element.hasAttribute('hitbox-target')) {
        element.removeAttribute('hitbox-target');
        element.classList.remove('clickable');
        console.log('[Utils] Hitbox desactivee pour:', element.id || 'element');
    }
}

/**
 * Desactive toutes les hitbox a l'interieur d'un conteneur
 * @param {HTMLElement} container - Le conteneur dont on veut desactiver les hitbox
 */
function disableAllHitboxes(container) {
    if (!container) return;
    const hitboxElements = container.querySelectorAll('[hitbox-target]');
    hitboxElements.forEach(el => disableHitbox(el));
}

console.log('[Utils] Module utilitaire charge');
