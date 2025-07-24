// Fichier principal d'orchestration du jeu

// État global de l'application
const AppState = {
    currentScreen: 'auth', // auth, menu, game
    initialized: false,
    user: null,
    gameSettings: {
        masterVolume: 0.5,
        effectsVolume: 0.7,
        graphics: 'medium',
        mouseSensitivity: 5
    }
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('🚀 Initialisation de Valorant 2D...');
    
    // Vérifier si Firebase est chargé
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase non chargé');
        showErrorMessage('Erreur de chargement. Veuillez actualiser la page.');
        return;
    }
    
    // Initialiser les modules
    initializeFirebase();
    initializeUI();
    initializeSettings();
    
    // Marquer comme initialisé
    AppState.initialized = true;
    console.log('✅ Application initialisée avec succès');
    
    // Animation d'entrée
    playEntryAnimation();
}

// Initialisation de Firebase
function initializeFirebase() {
    try {
        // Firebase est déjà initialisé dans firebase-config.js
        console.log('🔥 Firebase connecté');
        
        // Écouter les changements d'authentification
        auth.onAuthStateChanged(handleAuthStateChange);
        
    } catch (error) {
        console.error('❌ Erreur Firebase:', error);
        showErrorMessage('Erreur de connexion à Firebase');
    }
}

// Gestion des changements d'authentification
function handleAuthStateChange(user) {
    if (user) {
        AppState.user = user;
        AppState.currentScreen = 'menu';
        console.log('👤 Utilisateur connecté:', user.email);
        
        // Charger les paramètres utilisateur
        loadUserSettings();
        
        // Démarrer les services en ligne
        startOnlineServices();
        
    } else {
        AppState.user = null;
        AppState.currentScreen = 'auth';
        console.log('👤 Utilisateur déconnecté');
        
        // Arrêter les services
        stopOnlineServices();
    }
}

// Services en ligne
let onlineServices = {
    heartbeat: null,
    matchmaking: null,
    friendsListener: null
};

function startOnlineServices() {
    // Heartbeat pour maintenir la connexion
    onlineServices.heartbeat = setInterval(() => {
        if (currentUser) {
            database.ref(`users/${currentUser.uid}/lastSeen`)
                .set(firebase.database.ServerValue.TIMESTAMP);
        }
    }, 30000); // Toutes les 30 secondes
    
    // Écouter les invitations d'amis
    if (currentUser) {
        onlineServices.friendsListener = database.ref(`users/${currentUser.uid}/invitations`)
            .on('child_added', handleFriendInvitation);
    }
    
    console.log('🌐 Services en ligne démarrés');
}

function stopOnlineServices() {
    if (onlineServices.heartbeat) {
        clearInterval(onlineServices.heartbeat);
        onlineServices.heartbeat = null;
    }
    
    if (onlineServices.friendsListener) {
        database.ref(`users/${currentUser.uid}/invitations`).off();
        onlineServices.friendsListener = null;
    }
    
    console.log('🌐 Services en ligne arrêtés');
}

// Gestion des invitations d'amis
function handleFriendInvitation(snapshot) {
    const invitation = snapshot.val();
    const invitationId = snapshot.key;
    
    showNotification(
        `Invitation de ${invitation.fromName}`,
        'Voulez-vous rejoindre sa partie ?',
        [
            {
                text: 'Accepter',
                action: () => acceptInvitation(invitationId, invitation),
                class: 'accept'
            },
            {
                text: 'Refuser',
                action: () => declineInvitation(invitationId),
                class: 'decline'
            }
        ]
    );
}

async function acceptInvitation(invitationId, invitation) {
    try {
        // Supprimer l'invitation
        await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        
        // Rejoindre la partie
        if (invitation.matchId) {
            joinMatch(invitation.matchId);
        }
        
        showMessage('Invitation acceptée !', 'success');
    } catch (error) {
        console.error('Erreur acceptation invitation:', error);
        showMessage('Erreur lors de l\'acceptation', 'error');
    }
}

async function declineInvitation(invitationId) {
    try {
        await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        showMessage('Invitation refusée', 'info');
    } catch (error) {
        console.error('Erreur refus invitation:', error);
    }
}

// Système de notifications
function showNotification(title, message, actions = []) {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <h4>${title}</h4>
                <button class="notification-close" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-message">${message}</div>
            <div class="notification-actions">
                ${actions.map(action => 
                    `<button class="notification-btn ${action.class}" onclick="${action.action}">${action.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: rgba(15, 20, 25, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 20px;
        z-index: 2000;
        animation: slideInRight 0.5s ease;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 10 secondes si pas d'actions
    if (actions.length === 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notation.remove();
            }
        }, 10000);
    }
}

// Initialisation de l'interface utilisateur
function initializeUI() {
    // Ajouter les écouteurs d'événements globaux
    setupGlobalEventListeners();
    
    // Initialiser les tooltips
    initializeTooltips();
    
    // Précharger les ressources
    preloadAssets();
}

function setupGlobalEventListeners() {
    // Gestion du redimensionnement
    window.addEventListener('resize', handleWindowResize);
    
    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Gestion des raccourcis clavier globaux
    document.addEventListener('keydown', handleGlobalKeyboard);
}

function handleWindowResize() {
    if (AppState.currentScreen === 'game' && gameCanvas) {
        resizeCanvas();
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Page cachée - pausser le jeu si nécessaire
        if (AppState.currentScreen === 'game' && game.gameStarted) {
            game.gamePaused = true;
        }
    }
}

function handleGlobalKeyboard(e) {
    // Raccourcis globaux
    if (e.ctrlKey) {
        switch(e.key) {
            case 'm': // Ctrl+M pour couper le son
                e.preventDefault();
                toggleMasterVolume();
                break;
            case 'f': // Ctrl+F pour plein écran
                e.preventDefault();
                toggleFullscreen();
                break;
        }
    }
}

// Système de tooltips
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const text = e.target.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 3000;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    // Positionner le tooltip
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        e.target._tooltip = null;
    }
}

// Préchargement des ressources (simulé pour la démo)
function preloadAssets() {
    console.log('📦 Simulation du chargement des ressources...');
    
    // Simuler le chargement avec un délai
    setTimeout(() => {
        updateLoadingProgress(1, 4);
    }, 100);
    
    setTimeout(() => {
        updateLoadingProgress(2, 4);
    }, 200);
    
    setTimeout(() => {
        updateLoadingProgress(3, 4);
    }, 300);
    
    setTimeout(() => {
        updateLoadingProgress(4, 4);
    }, 400);
}

function updateLoadingProgress(loaded, total) {
    const progress = (loaded / total) * 100;
    console.log(`📦 Ressources chargées: ${progress.toFixed(1)}%`);
    
    if (loaded === total) {
        console.log('✅ Toutes les ressources sont chargées');
    }
}

// Gestion des paramètres
function initializeSettings() {
    loadSettingsFromStorage();
    applySettings();
}

function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('valorant2d_settings');
    if (savedSettings) {
        try {
            AppState.gameSettings = { ...AppState.gameSettings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
        }
    }
}

function saveSettingsToStorage() {
    localStorage.setItem('valorant2d_settings', JSON.stringify(AppState.gameSettings));
}

function applySettings() {
    // Appliquer le volume
    document.documentElement.style.setProperty('--master-volume', AppState.gameSettings.masterVolume);
    
    // Appliquer la qualité graphique
    document.documentElement.classList.remove('graphics-low', 'graphics-medium', 'graphics-high');
    document.documentElement.classList.add(`graphics-${AppState.gameSettings.graphics}`);
}

async function loadUserSettings() {
    if (!currentUser) return;
    
    try {
        const settingsRef = database.ref(`users/${currentUser.uid}/settings`);
        const snapshot = await settingsRef.once('value');
        
        if (snapshot.exists()) {
            AppState.gameSettings = { ...AppState.gameSettings, ...snapshot.val() };
            applySettings();
        }
    } catch (error) {
        console.error('Erreur chargement paramètres utilisateur:', error);
    }
}

async function saveUserSettings() {
    if (!currentUser) return;
    
    try {
        const settingsRef = database.ref(`users/${currentUser.uid}/settings`);
        await settingsRef.set(AppState.gameSettings);
        saveSettingsToStorage();
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
    }
}

// Fonctions utilitaires avancées
function toggleMasterVolume() {
    AppState.gameSettings.masterVolume = AppState.gameSettings.masterVolume > 0 ? 0 : 0.5;
    applySettings();
    saveUserSettings();
    
    showMessage(
        AppState.gameSettings.masterVolume > 0 ? 'Son activé' : 'Son coupé',
        'info'
    );
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Erreur plein écran:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Système de statistiques
const Statistics = {
    sessionStart: Date.now(),
    kills: 0,
    deaths: 0,
    shots: 0,
    hits: 0,
    gamesPlayed: 0
};

function updateStatistic(stat, value = 1) {
    Statistics[stat] += value;
    
    // Sauvegarder périodiquement
    if (currentUser && Math.random() < 0.1) { // 10% de chance
        saveStatistics();
    }
}

async function saveStatistics() {
    if (!currentUser) return;
    
    try {
        const statsRef = database.ref(`users/${currentUser.uid}/stats`);
        const currentStats = (await statsRef.once('value')).val() || {};
        
        // Fusionner les statistiques
        const updatedStats = {
            kills: (currentStats.kills || 0) + Statistics.kills,
            deaths: (currentStats.deaths || 0) + Statistics.deaths,
            shots: (currentStats.shots || 0) + Statistics.shots,
            hits: (currentStats.hits || 0) + Statistics.hits,
            gamesPlayed: (currentStats.gamesPlayed || 0) + Statistics.gamesPlayed,
            lastPlayed: firebase.database.ServerValue.TIMESTAMP
        };
        
        await statsRef.set(updatedStats);
        
        // Reset des stats de session
        Object.keys(Statistics).forEach(key => {
            if (key !== 'sessionStart') Statistics[key] = 0;
        });
        
    } catch (error) {
        console.error('Erreur sauvegarde statistiques:', error);
    }
}

// Animation d'entrée
function playEntryAnimation() {
    const authScreen = document.getElementById('auth-screen');
    if (authScreen && !authScreen.classList.contains('hidden')) {
        authScreen.style.opacity = '0';
        authScreen.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            authScreen.style.transition = 'all 0.5s ease';
            authScreen.style.opacity = '1';
            authScreen.style.transform = 'scale(1)';
        }, 100);
    }
}

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('❌ Erreur globale:', e.error);
    
    // Ne pas afficher d'erreur pour les ressources manquantes
    if (e.error && e.error.message && e.error.message.includes('Loading')) {
        return;
    }
    
    showErrorMessage('Une erreur inattendue s\'est produite');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesse rejetée:', e.reason);
    e.preventDefault(); // Empêcher l'affichage dans la console
});

function showErrorMessage(message) {
    showMessage(message, 'error');
}

// Fonctions d'intégration avec les autres modules
function startGame(matchData) {
    console.log('🎮 Démarrage du jeu:', matchData);
    
    AppState.currentScreen = 'game';
    game.matchId = matchData.id;
    game.currentMap = matchData.map;
    
    // Assigner l'équipe
    player.team = Math.random() > 0.5 ? 'attackers' : 'defenders';
    
    // Démarrer les listeners temps réel
    setupGameRealtimeListeners(matchData.id);
    
    // Mettre à jour les statistiques
    updateStatistic('gamesPlayed');
}

async function joinMatch(matchId) {
    try {
        const matchRef = database.ref(`matches/${matchId}`);
        const matchSnapshot = await matchRef.once('value');
        
        if (!matchSnapshot.exists()) {
            throw new Error('Partie introuvable');
        }
        
        const matchData = matchSnapshot.val();
        
        // Ajouter le joueur à la partie
        await matchRef.child('players').child(currentUser.uid).set({
            name: currentUser.displayName || currentUser.email.split('@')[0],
            ready: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        startGame({ ...matchData, id: matchId });
        showGameScreen();
        
    } catch (error) {
        console.error('Erreur rejoindre partie:', error);
        showMessage('Impossible de rejoindre la partie', 'error');
    }
}

// Styles supplémentaires pour les nouvelles fonctionnalités
const additionalGameStyles = document.createElement('style');
additionalGameStyles.textContent = `
    .game-notification {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border-left: 4px solid #00d4ff;
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .notification-header h4 {
        margin: 0;
        color: #00d4ff;
        font-size: 16px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 5px;
        border-radius: 3px;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .notification-message {
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 15px;
        line-height: 1.4;
    }
    
    .notification-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .notification-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .notification-btn.accept {
        background: #4ade80;
        color: white;
    }
    
    .notification-btn.accept:hover {
        background: #22c55e;
    }
    
    .notification-btn.decline {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .notification-btn.decline:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .tooltip {
        animation: fadeIn 0.2s ease !important;
    }
    
    .graphics-low * {
        image-rendering: pixelated;
    }
    
    .graphics-high * {
        filter: blur(0px) contrast(1.1) saturate(1.1);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(additionalGameStyles);

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', (e) => {
    // Sauvegarder les statistiques
    if (currentUser) {
        saveStatistics();
        saveUserSettings();
    }
    
    // Nettoyer les listeners
    stopOnlineServices();
    cleanupRealtimeListeners();
    
    // Marquer comme hors ligne
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/status`).set('offline');
    }
});

// Debug et développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
        AppState,
        Statistics,
        gameState,
        player,
        game,
        otherPlayers,
        
        // Fonctions de debug
        addMoney: (amount) => {
            player.money += amount;
            updateUI();
        },
        
        setHealth: (health) => {
            player.health = Math.max(0, Math.min(100, health));
            updateUI();
        },
        
        teleport: (x, y) => {
            player.x = x;
            player.y = y;
        },
        
        listOnlineUsers: async () => {
            const snapshot = await database.ref('users').orderByChild('status').equalTo('online').once('value');
            console.table(Object.values(snapshot.val() || {}));
        }
    };
    
    console.log('🛠️ Mode debug activé. Utilisez window.DEBUG pour accéder aux outils.');
}

console.log('🎮 Valorant 2D - Prêt à jouer !');
console.log('📱 Version: 1.0.0');
console.log('🔧 Développé avec Firebase, HTML5 Canvas et beaucoup d\'amour ❤️');