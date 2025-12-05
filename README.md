# L'Apprentissage à Béziers - Expérience AR

Une application de Réalité Augmentée (WebAR) interactive, visualisant l'évolution et les statistiques de l'enseignement supérieur à Béziers.

Ce projet permet aux utilisateurs de scanner une affiche cible pour voir apparaître des animations 3D, des graphiques interactifs et des séquences narratives racontant l'histoire de l'apprentissage dans la ville.

## 🌟 Fonctionnalités

*   **Tracking d'Image** : Utilise MindAR pour ancrer le contenu sur une affiche spécifique.
*   **Scénario Interactif** : Une séquence de 6 scènes animées (Introduction, "Ce que ça fait", Graphiques 2015-2025, Podium, Final).
*   **Animations 3D** : Intégration de modèles GLB (Fusée, Trophées, Chapeau de diplômé) et d'animations de particules.
*   **Interactivité** : Boutons tactiles pour naviguer entre les scènes, et éléments cliquables déclenchant des sons ou des animations.
*   **Audio** : Effets sonores et narration intégrés.

## 🛠️ Technologies Utilisées

*   **[A-Frame](https://aframe.io/)** : Framework WebVR/WebAR pour la création de la scène 3D.
*   **[MindAR](https://hiukim.github.io/mind-ar-js-doc/)** : Librairie de tracking d'images pour le navigateur.
*   **Tailwind CSS** : Pour le stylisme de l'interface utilisateur (écran d'accueil, overlays).
*   **Vanilla JavaScript** : Toute la logique application est centralisée dans `js/components.js`.

## 📂 Structure du Projet

```
├── assets/             # Images, sons, modèles 3D et cible (affiche.mind)
├── js/
│   └── components.js   # Contient toute la logique des composants A-Frame
├── index.html          # Point d'entrée de l'application
└── README.md           # Documentation
```

## 🚀 Installation et Lancement

Pour fonctionner, l'application nécessite un serveur web local et une connexion HTTPS (obligatoire pour l'accès à la caméra du navigateur).

### Prérequis

*   Python (installé par défaut sur la plupart des systèmes pour le serveur simple, ou tout autre serveur web comme Live Server pour VS Code).
*   [ngrok](https://ngrok.com/) (pour créer un tunnel HTTPS sécurisé vers votre serveur local).

### Étapes

1.  **Démarrer le serveur local** :
    Dans le dossier du projet, ouvrez un terminal et lancez :
    ```bash
    python -m http.server 8080
    ```

2.  **Exposer via HTTPS avec ngrok** :
    Ouvrez un second terminal et lancez :
    ```bash
    ngrok http 8080
    ```

3.  **Accéder à l'application** :
    Copiez l'URL `https://xxxx-xxxx.ngrok-free.app` fournie par ngrok et ouvrez-la sur votre smartphone.

4.  **Scanner** :
    Autorisez l'accès à la caméra et pointez votre téléphone vers l'affiche cible (`affiche.mind` ou l'image correspondante).

## 📝 Notes de Développement

La logique a été consolidée pour simplifier la maintenance.
- **`index.html`** contient la structure de la scène A-Frame et l'import des `a-assets`.
- **`js/components.js`** contient tous les composants personnalisés :
    - `hitbox-system` : Gestion des clics précis sur les images transparentes.
    - `sceneX-animation` : Logique d'animation spécifique à chaque scène.
    - `sceneX-trigger` : Gestion des transitions entre les scènes.

**Attention aux chemins :** Tous les liens vers les ressources (`src`) sont relatifs (`./assets/...`) pour assurer la compatibilité quel que soit le dossier racine du serveur.
