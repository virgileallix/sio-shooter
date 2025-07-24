// Fichier principal d'orchestration du jeu avec système de profils complet

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
    },
    profileSystem: {
        loaded: false,
        achievements: {},
        statistics: {},
        friends: []
    }
};

// Système de notifications avancé
const NotificationSystem = {
    queue: [],
    showing: false,
    
    show(title, message, type = 'info', duration = 5000, actions = []) {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            duration,
            actions,
            timestamp: Date.now()
        };
        
        this.queue.push(notification);
        this.processQueue();
    },
    
    processQueue() {
        if (this.showing || this.queue.length === 0) return;
        
        const notification = this.queue.shift();
        this.displaying = true;
        this.displayNotification(notification);
    },
    
    displayNotification(notification) {
        const container = this.getOrCreateContainer();
        const element = this.createNotificationElement(notification);
        
        container.appendChild(element);
        
        // Animation d'entrée
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
        }, 100);
        
        // Auto-suppression
        setTimeout(() => {
            this.removeNotification(element);
        }, notification.duration);
    },
    
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.style.cssText = `
            background: rgba(15, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-left: 4px solid ${this.getTypeColor(notification.type)};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.5s ease;
            min-width: 350px;
            max-width: 450px;
        `;
        
        element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h4 style="margin: 0; color: ${this.getTypeColor(notification.type)}; font-size: 16px;">
                    <i class="fas fa-${this.getTypeIcon(notification.type)}" style="margin-right: 8px;"></i>
                    ${notification.title}
                </h4>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none; border: none; color: rgba(255, 255, 255, 0.7);
                    cursor: pointer; padding: 0; width: 20px; height: 20px;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p style="margin: 0 0 15px 0; color: rgba(255, 255, 255, 0.9); line-height: 1.4;">
                ${notification.message}
            </p>
            ${notification.actions.length > 0 ? `
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    ${notification.actions.map(action => `
                        <button onclick="${action.callback}" style="
                            padding: 8px 16px; border: none; border-radius: 6px;
                            background: ${action.primary ? this.getTypeColor(notification.type) : 'rgba(255, 255, 255, 0.1)'};
                            color: white; cursor: pointer; font-size: 14px; transition: all 0.3s ease;
                        ">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        return element;
    },
    
    getOrCreateContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        return container;
    },
    
    removeNotification(element) {
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
            this.showing = false;
            this.processQueue();
        }, 500);
    },
    
    getTypeColor(type) {
        const colors = {
            success: '#4ade80',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#00d4ff',
            achievement: '#ffd700'
        };
        return colors[type] || colors.info;
    },
    
    getTypeIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle',
            achievement: 'trophy'
        };
        return icons[type] || icons.info;
    }
};

// Système de gestion des succès en temps réel
const AchievementManager = {
    unlockedThisSession: new Set(),
    
    async checkAchievement(achievementId, currentStats) {
        if (this.unlockedThisSession.has(achievementId)) return;
        
        const achievement = achievements[achievementId];
        if (!achievement) return;
        
        // Vérifier si le succès est déjà débloqué
        try {
            const achievementsRef = database.ref(`users/${currentUser.uid}/achievements/${achievementId}`);
            const snapshot = await achievementsRef.once('value');
            
            if (snapshot.exists()) return; // Déjà débloqué
            
            // Vérifier les conditions
            if (this.isAchievementUnlocked(achievement, currentStats)) {
                await this.unlockAchievement(achievementId, achievement);
            }
        } catch (error) {
            console.error('Erreur vérification succès:', error);
        }
    },
    
    isAchievementUnlocked(achievement, stats) {
        const req = achievement.requirement;
        const value = stats[req.stat] || 0;
        
        switch (req.stat) {
            case 'accuracy':
                const shotsFired = stats.shotsFired || 0;
                const shotsHit = stats.shotsHit || 0;
                if (shotsFired < 100) return false;
                return (shotsHit / shotsFired * 100) >= req.value;
            
            case 'rank':
                return value === req.value;
            
            default:
                return value >= req.value;
        }
    },
    
    async unlockAchievement(achievementId, achievement) {
        try {
            // Sauvegarder en base
            await database.ref(`users/${currentUser.uid}/achievements/${achievementId}`)
                .set(Date.now());
            
            // Marquer comme débloqué cette session
            this.unlockedThisSession.add(achievementId);
            
            // Afficher la notification
            this.showAchievementNotification(achievement);
            
            // Jouer un son (si activé)
            playAchievementSound();
            
            console.log(`🏆 Succès débloqué: ${achievement.name}`);
            
        } catch (error) {
            console.error('Erreur débloquage succès:', error);
        }
    },
    
    showAchievementNotification(achievement) {
        NotificationSystem.show(
            'Succès débloqué !',
            `🏆 ${achievement.name}: ${achievement.description}`,
            'achievement',
            8000,
            [
                {
                    text: 'Voir profil',
                    primary: true,
                    callback: 'openPlayerProfile()'
                }
            ]
        );
    }
};

// Système de statistiques en temps réel
const StatsTracker = {
    sessionStats: {
        sessionStart: Date.now(),
        kills: 0,
        deaths: 0,
        shots: 0,
        hits: 0,
        headshots: 0,
        gamesPlayed: 0,
        wins: 0,
        losses: 0
    },
    
    trackEvent(eventType, data = {}) {
        switch (eventType) {
            case 'kill':
                this.sessionStats.kills++;
                if (data.headshot) this.sessionStats.headshots++;
                this.checkAchievementsAfterKill(data);
                break;
                
            case 'death':
                this.sessionStats.deaths++;
                break;
                
            case 'shot':
                this.sessionStats.shots++;
                break;
                
            case 'hit':
                this.sessionStats.hits++;
                break;
                
            case 'gameEnd':
                this.sessionStats.gamesPlayed++;
                if (data.won) {
                    this.sessionStats.wins++;
                } else {
                    this.sessionStats.losses++;
                }
                this.saveSessionStats();
                break;
        }
        
        // Vérifier les succès après chaque événement
        this.checkRealtimeAchievements();
    },
    
    async checkAchievementsAfterKill(data) {
        // Vérifier le succès "Premier sang"
        if (this.sessionStats.kills === 1) {
            await AchievementManager.checkAchievement('first_kill', { kills: 1 });
        }
        
        // Vérifier "Machine de guerre" (10 kills en une partie)
        if (this.sessionStats.kills === 10) {
            await AchievementManager.checkAchievement('kill_spree', { killsInMatch: 10 });
        }
        
        // Vérifier les headshots
        if (data.headshot) {
            const currentStats = await this.getCurrentStats();
            const totalHeadshots = (currentStats.headshots || 0) + this.sessionStats.headshots;
            await AchievementManager.checkAchievement('headshot_master', { headshots: totalHeadshots });
        }
    },
    
    async checkRealtimeAchievements() {
        if (!currentUser) return;
        
        try {
            const currentStats = await this.getCurrentStats();
            const combinedStats = this.combineStats(currentStats);
            
            // Vérifier tous les succès
            for (const achievementId of Object.keys(achievements)) {
                await AchievementManager.checkAchievement(achievementId, combinedStats);
            }
        } catch (error) {
            console.error('Erreur vérification succès temps réel:', error);
        }
    },
    
    async getCurrentStats() {
        const statsRef = database.ref(`users/${currentUser.uid}/stats`);
        const snapshot = await statsRef.once('value');
        return snapshot.val() || {};
    },
    
    combineStats(dbStats) {
        return {
            kills: (dbStats.kills || 0) + this.sessionStats.kills,
            deaths: (dbStats.deaths || 0) + this.sessionStats.deaths,
            headshots: (dbStats.headshots || 0) + this.sessionStats.headshots,
            shotsFired: (dbStats.shotsFired || 0) + this.sessionStats.shots,
            shotsHit: (dbStats.shotsHit || 0) + this.sessionStats.hits,
            gamesPlayed: (dbStats.gamesPlayed || 0) + this.sessionStats.gamesPlayed,
            wins: (dbStats.wins || 0) + this.sessionStats.wins,
            losses: (dbStats.losses || 0) + this.sessionStats.losses
        };
    },
    
    async saveSessionStats() {
        if (!currentUser) return;
        
        try {
            const currentStats = await this.getCurrentStats();
            const updates = {};
            
            // Fusionner les statistiques
            Object.keys(this.sessionStats).forEach(key => {
                if (key !== 'sessionStart' && typeof this.sessionStats[key] === 'number') {
                    updates[key] = (currentStats[key] || 0) + this.sessionStats[key];
                }
            });
            
            // Calculer l'XP gagné
            const xpGained = this.calculateXPGain();
            updates.experience = (currentStats.experience || 0) + xpGained;
            
            // Sauvegarder
            await database.ref(`users/${currentUser.uid}/stats`).update(updates);
            
            // Mettre à jour le niveau et rang
            await this.updateLevelAndRank(updates.experience);
            
            // Réinitialiser les stats de session
            this.resetSessionStats();
            
            console.log('Statistiques de session sauvegardées:', updates);
            
        } catch (error) {
            console.error('Erreur sauvegarde stats session:', error);
        }
    },
    
    calculateXPGain() {
        let xp = 0;
        xp += this.sessionStats.kills * 100;
        xp += this.sessionStats.headshots * 50;
        xp += this.sessionStats.wins * 500;
        xp += this.sessionStats.gamesPlayed * 50;
        return xp;
    },
    
    async updateLevelAndRank(experience) {
        const newLevel = calculateLevel(experience);
        const newRank = calculateRank(experience);
        
        await database.ref(`users/${currentUser.uid}`).update({
            level: newLevel,
            rank: newRank,
            experience: experience
        });
        
        // Mettre à jour l'interface
        updateUserRankDisplay();
    },
    
    resetSessionStats() {
        Object.keys(this.sessionStats).forEach(key => {
            if (typeof this.sessionStats[key] === 'number') {
                this.sessionStats[key] = 0;
            }
        });
        this.sessionStats.sessionStart = Date.now();
    }
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    console.log('🚀 Initialisation de SIO SHOOTER 2D...');
    
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
    initializeProfileSystem();
    
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

// Gestion des changements d'authentification avec profils
function handleAuthStateChange(user) {
    if (user) {
        AppState.user = user;
        AppState.currentScreen = 'menu';
        console.log('👤 Utilisateur connecté:', user.email);
        
        // Initialiser les systèmes utilisateur
        initializeUserSystems();
        
    } else {
        AppState.user = null;
        AppState.currentScreen = 'auth';
        console.log('👤 Utilisateur déconnecté');
        
        // Arrêter les services
        stopUserSystems();
    }
}

// Initialisation des systèmes utilisateur
async function initializeUserSystems() {
    try {
        // Charger les paramètres utilisateur
        await loadUserSettings();
        
        // Initialiser le système de profils
        await initializeUserProfile();
        
        // Démarrer les services en ligne
        startOnlineServices();
        
        // Démarrer le tracking des statistiques
        StatsTracker.resetSessionStats();
        
        console.log('✅ Systèmes utilisateur initialisés');
        
    } catch (error) {
        console.error('❌ Erreur initialisation systèmes utilisateur:', error);
    }
}

// Initialisation du profil utilisateur
async function initializeUserProfile() {
    try {
        AppState.profileSystem.loaded = false;
        
        // Charger le profil utilisateur
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            AppState.profileSystem.statistics = userData.stats || {};
            AppState.profileSystem.achievements = userData.achievements || {};
            AppState.profileSystem.friends = userData.friends || {};
        }
        
        AppState.profileSystem.loaded = true;
        console.log('📊 Système de profils chargé');
        
    } catch (error) {
        console.error('❌ Erreur chargement profil:', error);
    }
}

// Services en ligne améliorés
let onlineServices = {
    heartbeat: null,
    matchmaking: null,
    friendsListener: null,
    invitationsListener: null,
    achievementListener: null
};

function startOnlineServices() {
    // Heartbeat pour maintenir la connexion
    onlineServices.heartbeat = setInterval(() => {
        if (currentUser) {
            database.ref(`users/${currentUser.uid}/lastSeen`)
                .set(firebase.database.ServerValue.TIMESTAMP);
        }
    }, 30000);
    
    // Écouter les invitations d'amis
    if (currentUser) {
        onlineServices.invitationsListener = database.ref(`users/${currentUser.uid}/invitations`)
            .on('child_added', handleFriendInvitation);
        
        // Écouter les nouveaux succès (en cas de déconnexion/reconnexion)
        onlineServices.achievementListener = database.ref(`users/${currentUser.uid}/achievements`)
            .on('child_added', handleNewAchievement);
    }
    
    console.log('🌐 Services en ligne démarrés');
}

function stopUserSystems() {
    // Arrêter les services en ligne
    if (onlineServices.heartbeat) {
        clearInterval(onlineServices.heartbeat);
        onlineServices.heartbeat = null;
    }
    
    if (onlineServices.invitationsListener) {
        database.ref(`users/${currentUser.uid}/invitations`).off();
        onlineServices.invitationsListener = null;
    }
    
    if (onlineServices.achievementListener) {
        database.ref(`users/${currentUser.uid}/achievements`).off();
        onlineServices.achievementListener = null;
    }
    
    // Nettoyer les données du profil
    AppState.profileSystem = {
        loaded: false,
        achievements: {},
        statistics: {},
        friends: []
    };
    
    // Sauvegarder les stats de session si nécessaire
    if (StatsTracker.sessionStats.gamesPlayed > 0) {
        StatsTracker.saveSessionStats();
    }
    
    console.log('🌐 Systèmes utilisateur arrêtés');
}

// Gestion des invitations d'amis améliorée
function handleFriendInvitation(snapshot) {
    const invitation = snapshot.val();
    const invitationId = snapshot.key;
    
    NotificationSystem.show(
        'Invitation de partie',
        `${invitation.fromName} vous invite à rejoindre une partie ${invitation.gameMode} sur ${invitation.map}`,
        'info',
        10000,
        [
            {
                text: 'Accepter',
                primary: true,
                callback: `acceptGameInvitation('${invitationId}', '${JSON.stringify(invitation).replace(/'/g, "\\'")}');`
            },
            {
                text: 'Refuser',
                primary: false,
                callback: `declineGameInvitation('${invitationId}');`
            }
        ]
    );
}

// Gestion des nouveaux succès
function handleNewAchievement(snapshot) {
    const achievementId = snapshot.key;
    const timestamp = snapshot.val();
    
    // Éviter les notifications pour les anciens succès
    const now = Date.now();
    if (now - timestamp > 60000) return; // Plus de 1 minute = ancien
    
    const achievement = achievements[achievementId];
    if (achievement && !AchievementManager.unlockedThisSession.has(achievementId)) {
        AchievementManager.showAchievementNotification(achievement);
        AchievementManager.unlockedThisSession.add(achievementId);
    }
}

// Gestion des invitations de partie
async function acceptGameInvitation(invitationId, invitation) {
    try {
        const inv = JSON.parse(invitation);
        
        // Supprimer l'invitation
        await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        
        // Rejoindre la partie ou créer une nouvelle partie avec l'ami
        NotificationSystem.show(
            'Invitation acceptée',
            'Recherche de partie en cours...',
            'success',
            3000
        );
        
        // Lancer le matchmaking avec l'ami
        const matchId = await findMatch(inv.gameMode, inv.map);
        if (matchId) {
            // Notifier l'ami que l'invitation a été acceptée
            await database.ref(`users/${inv.from}/notifications`).push({
                type: 'invitation_accepted',
                from: currentUser.uid,
                fromName: currentUser.displayName || 'Joueur',
                matchId: matchId,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }
        
    } catch (error) {
        console.error('Erreur acceptation invitation:', error);
        NotificationSystem.show('Erreur', 'Impossible d\'accepter l\'invitation', 'error');
    }
}

async function declineGameInvitation(invitationId) {
    try {
        await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        NotificationSystem.show('Invitation refusée', '', 'info', 2000);
    } catch (error) {
        console.error('Erreur refus invitation:', error);
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
    
    // Gestion des invitations en jeu (touche Y pour accepter, N pour refuser)
    document.addEventListener('keydown', handleInvitationShortcuts);
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
        
        // Changer le statut à "away"
        if (currentUser) {
            database.ref(`users/${currentUser.uid}/status`).set('away');
        }
    } else {
        // Page visible - reprendre le jeu
        if (currentUser) {
            database.ref(`users/${currentUser.uid}/status`).set('online');
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
            case 'p': // Ctrl+P pour ouvrir le profil
                e.preventDefault();
                if (currentUser) openPlayerProfile();
                break;
        }
    }
}

function handleInvitationShortcuts(e) {
    // Raccourcis pour les invitations (seulement si une notification est visible)
    const activeNotification = document.querySelector('.notification');
    if (!activeNotification) return;
    
    if (e.key.toLowerCase() === 'y') {
        // Accepter l'invitation
        const acceptBtn = activeNotification.querySelector('button[onclick*="accept"]');
        if (acceptBtn) acceptBtn.click();
    } else if (e.key.toLowerCase() === 'n') {
        // Refuser l'invitation
        const declineBtn = activeNotification.querySelector('button[onclick*="decline"]');
        if (declineBtn) declineBtn.click();
    }
}

// Système de tooltips amélioré
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('mousemove', updateTooltipPosition);
    });
}

function showTooltip(e) {
    const text = e.target.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(tooltip);
    updateTooltipPosition(e, tooltip);
    e.target._tooltip = tooltip;
}

function updateTooltipPosition(e, tooltip = null) {
    const tooltipElement = tooltip || e.target._tooltip;
    if (!tooltipElement) return;
    
    const x = e.clientX + 10;
    const y = e.clientY - 30;
    
    tooltipElement.style.left = x + 'px';
    tooltipElement.style.top = y + 'px';
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        e.target._tooltip = null;
    }
}

// Préchargement des ressources
function preloadAssets() {
    console.log('📦 Chargement des ressources...');
    
    const assets = [
        'Profils utilisateur',
        'Système de succès', 
        'Statistiques de jeu',
        'Interface graphique'
    ];
    
    assets.forEach((asset, index) => {
        setTimeout(() => {
            updateLoadingProgress(index + 1, assets.length, asset);
        }, (index + 1) * 200);
    });
}

function updateLoadingProgress(loaded, total, currentAsset) {
    const progress = (loaded / total) * 100;
    console.log(`📦 Chargement: ${currentAsset} (${progress.toFixed(1)}%)`);
    
    if (loaded === total) {
        console.log('✅ Toutes les ressources sont chargées');
    }
}

// Gestion des paramètres améliorée
function initializeSettings() {
    loadSettingsFromStorage();
    applySettings();
    setupSettingsListeners();
}

function setupSettingsListeners() {
    // Écouter les changements de volume
    const volumeSliders = document.querySelectorAll('input[type="range"]');
    volumeSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            const setting = e.target.id || e.target.getAttribute('data-setting');
            if (setting) {
                AppState.gameSettings[setting] = e.target.value / 100;
                applySettings();
                saveSettingsToStorage();
            }
        });
    });
    
    // Écouter les changements de qualité graphique
    const graphicsSelect = document.querySelector('select');
    if (graphicsSelect) {
        graphicsSelect.addEventListener('change', (e) => {
            AppState.gameSettings.graphics = e.target.value;
            applySettings();
            saveSettingsToStorage();
            saveUserSettings();
        });
    }
}

function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('sioshooter_settings');
    if (savedSettings) {
        try {
            AppState.gameSettings = { ...AppState.gameSettings, ...JSON.parse(savedSettings) };
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
        }
    }
}

function saveSettingsToStorage() {
    localStorage.setItem('sioshooter_settings', JSON.stringify(AppState.gameSettings));
}

function applySettings() {
    // Appliquer le volume
    document.documentElement.style.setProperty('--master-volume', AppState.gameSettings.masterVolume);
    document.documentElement.style.setProperty('--effects-volume', AppState.gameSettings.effectsVolume);
    
    // Appliquer la qualité graphique
    document.documentElement.classList.remove('graphics-low', 'graphics-medium', 'graphics-high');
    document.documentElement.classList.add(`graphics-${AppState.gameSettings.graphics}`);
    
    // Appliquer la sensibilité de la souris (pour le jeu)
    if (typeof player !== 'undefined') {
        player.mouseSensitivity = AppState.gameSettings.mouseSensitivity;
    }
}

async function loadUserSettings() {
    if (!currentUser) return;
    
    try {
        const settingsRef = database.ref(`users/${currentUser.uid}/settings`);
        const snapshot = await settingsRef.once('value');
        
        if (snapshot.exists()) {
            AppState.gameSettings = { ...AppState.gameSettings, ...snapshot.val() };
            applySettings();
            updateSettingsUI();
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

function updateSettingsUI() {
    // Mettre à jour les sliders
    const volumeSlider = document.querySelector('input[data-setting="masterVolume"]');
    if (volumeSlider) {
        volumeSlider.value = AppState.gameSettings.masterVolume * 100;
    }
    
    const effectsSlider = document.querySelector('input[data-setting="effectsVolume"]');
    if (effectsSlider) {
        effectsSlider.value = AppState.gameSettings.effectsVolume * 100;
    }
    
    const sensitivitySlider = document.querySelector('input[data-setting="mouseSensitivity"]');
    if (sensitivitySlider) {
        sensitivitySlider.value = AppState.gameSettings.mouseSensitivity;
    }
    
    // Mettre à jour le select de qualité
    const graphicsSelect = document.querySelector('select');
    if (graphicsSelect) {
        graphicsSelect.value = AppState.gameSettings.graphics;
    }
}

// Système de profils avancé
function initializeProfileSystem() {
    console.log('📊 Initialisation du système de profils...');
    
    // Écouter les clics sur les cartes d'amis pour ouvrir les profils
    document.addEventListener('click', (e) => {
        const friendCard = e.target.closest('.friend-card');
        if (friendCard && !e.target.closest('.friend-actions')) {
            const friendId = friendCard.getAttribute('data-friend-id');
            if (friendId) {
                openProfileModal(friendId);
            }
        }
        
        // Écouter les clics sur les entrées du classement
        const leaderboardEntry = e.target.closest('.leaderboard-entry');
        if (leaderboardEntry) {
            const playerId = leaderboardEntry.getAttribute('data-player-id');
            if (playerId) {
                openProfileModal(playerId);
            }
        }
    });
}

// Fonctions utilitaires avancées
function toggleMasterVolume() {
    AppState.gameSettings.masterVolume = AppState.gameSettings.masterVolume > 0 ? 0 : 0.5;
    applySettings();
    saveUserSettings();
    
    NotificationSystem.show(
        'Audio',
        AppState.gameSettings.masterVolume > 0 ? 'Son activé' : 'Son coupé',
        'info',
        2000
    );
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Erreur plein écran:', err);
            NotificationSystem.show('Erreur', 'Impossible de passer en plein écran', 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

// Système de son pour les succès
function playAchievementSound() {
    if (AppState.gameSettings.effectsVolume === 0) return;
    
    // Créer un son pour les succès (simulation)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // Do
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // Mi
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // Sol
    
    gainNode.gain.setValueAtTime(AppState.gameSettings.effectsVolume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Intégration du gameplay avec les statistiques
function integrateGameplayStats() {
    // Hook pour les kills
    const originalHitPlayer = window.handlePlayerHit || function() {};
    window.handlePlayerHit = function(targetPlayerId, bullet) {
        const result = originalHitPlayer.call(this, targetPlayerId, bullet);
        
        // Tracker les statistiques
        StatsTracker.trackEvent('hit');
        if (bullet.damage >= 100) { // Kill
            StatsTracker.trackEvent('kill', { 
                headshot: bullet.headshot,
                weapon: player.weapon.name 
            });
        }
        
        return result;
    };
    
    // Hook pour les tirs
    const originalShoot = window.shoot || function() {};
    window.shoot = function() {
        const result = originalShoot.call(this);
        StatsTracker.trackEvent('shot');
        return result;
    };
    
    // Hook pour les morts
    const originalHandlePlayerDeath = window.handlePlayerDeath || function() {};
    window.handlePlayerDeath = function() {
        const result = originalHandlePlayerDeath.call(this);
        StatsTracker.trackEvent('death');
        return result;
    };
}

// Démarrage du jeu avec intégration profils
function startGame(matchData) {
    console.log('🎮 Démarrage du jeu avec profils:', matchData);
    
    AppState.currentScreen = 'game';
    game.matchId = matchData.id;
    game.currentMap = matchData.map;
    
    // Assigner l'équipe
    player.team = Math.random() > 0.5 ? 'attackers' : 'defenders';
    
    // Intégrer les statistiques
    integrateGameplayStats();
    
    // Démarrer les listeners temps réel
    setupGameRealtimeListeners(matchData.id);
    
    // Mettre à jour le statut
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/status`).set('playing');
    }
    
    // Notifier le début de partie
    NotificationSystem.show(
        'Partie commencée',
        `${matchData.map} - ${matchData.mode}`,
        'success',
        3000
    );
}

// Fin de partie avec sauvegarde des statistiques
async function endGame(result) {
    console.log('🏁 Fin de partie:', result);
    
    // Tracker la fin de partie
    StatsTracker.trackEvent('gameEnd', { won: result.won });
    
    // Remettre le statut en ligne
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/status`).set('online');
    }
    
    // Sauvegarder les statistiques
    await StatsTracker.saveSessionStats();
    
    // Calculer les récompenses
    const rewards = calculateGameRewards(result);
    showGameRewards(rewards);
}

function calculateGameRewards(result) {
    const rewards = {
        xp: 0,
        money: 0,
        achievements: []
    };
    
    // XP de base
    rewards.xp += result.won ? 500 : 250;
    rewards.xp += StatsTracker.sessionStats.kills * 100;
    rewards.xp += StatsTracker.sessionStats.headshots * 50;
    
    // Argent
    rewards.money += result.won ? 1000 : 500;
    rewards.money += StatsTracker.sessionStats.kills * 200;
    
    // Bonus pour les performances exceptionnelles
    if (StatsTracker.sessionStats.kills >= 20) {
        rewards.xp += 1000;
        rewards.achievements.push('Machine de guerre');
    }
    
    if (StatsTracker.sessionStats.headshots >= 10) {
        rewards.xp += 500;
        rewards.achievements.push('Tireur de précision');
    }
    
    return rewards;
}

function showGameRewards(rewards) {
    const rewardsModal = document.createElement('div');
    rewardsModal.className = 'rewards-modal';
    rewardsModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    rewardsModal.innerHTML = `
        <div style="
            background: rgba(15, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        ">
            <h2 style="color: #00d4ff; margin-bottom: 30px; font-size: 32px;">
                🎉 Récompenses de partie
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 30px;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; color: #ffd700; margin-bottom: 10px;">+${rewards.xp}</div>
                    <div style="color: rgba(255, 255, 255, 0.7);">Points d'expérience</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 48px; color: #4ade80; margin-bottom: 10px;">+${rewards.money}</div>
                    <div style="color: rgba(255, 255, 255, 0.7);">Argent gagné</div>
                </div>
            </div>
            
            ${rewards.achievements.length > 0 ? `
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #ff4655; margin-bottom: 15px;">🏆 Nouveaux succès</h3>
                    ${rewards.achievements.map(achievement => `
                        <div style="background: rgba(255, 70, 85, 0.1); border: 1px solid #ff4655; 
                                    border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                            ${achievement}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <button onclick="this.parentElement.parentElement.remove(); showMainMenu();" style="
                background: linear-gradient(45deg, #ff4655, #00d4ff);
                border: none;
                border-radius: 12px;
                color: white;
                padding: 15px 30px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                Continuer
            </button>
        </div>
    `;
    
    document.body.appendChild(rewardsModal);
    
    // Auto-suppression après 15 secondes
    setTimeout(() => {
        if (rewardsModal.parentNode) {
            rewardsModal.remove();
            showMainMenu();
        }
    }, 15000);
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
    
    NotificationSystem.show(
        'Erreur système',
        'Une erreur inattendue s\'est produite',
        'error'
    );
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesse rejetée:', e.reason);
    e.preventDefault(); // Empêcher l'affichage dans la console
});

function showErrorMessage(message) {
    NotificationSystem.show('Erreur', message, 'error');
}

// Debug et développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
        AppState,
        StatsTracker,
        AchievementManager,
        NotificationSystem,
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
        
        unlockAchievement: (id) => {
            if (achievements[id]) {
                AchievementManager.unlockAchievement(id, achievements[id]);
            }
        },
        
        addKills: (count) => {
            for (let i = 0; i < count; i++) {
                StatsTracker.trackEvent('kill');
            }
        },
        
        simulateMatch: (won = true) => {
            StatsTracker.trackEvent('gameEnd', { won });
        },
        
        listOnlineUsers: async () => {
            const snapshot = await database.ref('users').orderByChild('status').equalTo('online').once('value');
            console.table(Object.values(snapshot.val() || {}));
        },
        
        showNotification: (title, message, type = 'info') => {
            NotificationSystem.show(title, message, type);
        }
    };
    
    console.log('🛠️ Mode debug activé. Utilisez window.DEBUG pour accéder aux outils.');
}

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', (e) => {
    // Sauvegarder les statistiques de session
    if (currentUser && StatsTracker.sessionStats.gamesPlayed > 0) {
        StatsTracker.saveSessionStats();
    }
    
    // Sauvegarder les paramètres
    if (currentUser) {
        saveUserSettings();
    }
    
    // Nettoyer les listeners
    stopUserSystems();
    cleanupRealtimeListeners();
    
    // Marquer comme hors ligne
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/status`).set('offline');
    }
});

// Intégration avec les autres modules
function startGameLoop() {
    // Démarrer le loop de jeu avec intégration profils
    integrateGameplayStats();
    
    if (typeof startGameLoop !== 'undefined') {
        window.originalStartGameLoop = startGameLoop;
    }
}

// Export des fonctions principales pour les autres modules
window.GameOrchestrator = {
    AppState,
    StatsTracker,
    AchievementManager,
    NotificationSystem,
    startGame,
    endGame,
    integrateGameplayStats
};