// Orchestrateur principal du jeu avec logique Valorant complète - VERSION CORRIGÉE

// État global de l'application
const AppState = {
    currentScreen: 'auth', // auth, menu, game
    initialized: false,
    user: null,
    gameSettings: {
        masterVolume: 0.5,
        effectsVolume: 0.7,
        graphics: 'medium',
        mouseSensitivity: 5,
        targetFPS: 60,
        showDamage: true,
        extendedKillFeed: true,
        aimMode: 'hold'
    },
    profileSystem: {
        loaded: false,
        achievements: {},
        statistics: {},
        friends: []
    }
};

// Rendre AppState accessible globalement
window.AppState = AppState;

// Système de notifications avancé pour le jeu
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
        this.showing = true;
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
        element.className = `game-notification notification-${notification.type}`;
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
            pointer-events: all;
        `;
        
        const actionsHtml = notification.actions.length > 0 ? `
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
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
        ` : '';
        
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
            <p style="margin: 0; color: rgba(255, 255, 255, 0.9); line-height: 1.4;">
                ${notification.message}
            </p>
            ${actionsHtml}
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
            achievement: '#ffd700',
            kill: '#ff4655',
            round: '#ffd700'
        };
        return colors[type] || colors.info;
    },
    
    getTypeIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle',
            achievement: 'trophy',
            kill: 'crosshairs',
            round: 'clock'
        };
        return icons[type] || icons.info;
    }
};

// Rendre NotificationSystem accessible globalement
window.NotificationSystem = NotificationSystem;

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
        losses: 0,
        roundsPlayed: 0,
        roundsWon: 0,
        bombPlants: 0,
        bombDefuses: 0,
        aces: 0,
        clutches: 0,
        damageDealt: 0,
        damageReceived: 0,
        firstKills: 0,
        multiKills: 0
    },
    
    trackEvent(eventType, data = {}) {
        try {
            switch (eventType) {
                case 'kill':
                    this.sessionStats.kills++;
                    if (data.headshot) this.sessionStats.headshots++;
                    if (data.firstKill) this.sessionStats.firstKills++;
                    if (data.multiKill > 1) this.sessionStats.multiKills++;
                    
                    this.checkKillAchievements(data);
                    
                    // Notification de kill
                    if (AppState.gameSettings.extendedKillFeed) {
                        NotificationSystem.show(
                            'Élimination',
                            `+${data.headshot ? '2x' : '1x'} ${data.headshot ? 'Headshot!' : 'Kill'}`,
                            'kill',
                            2000
                        );
                    }
                    break;
                    
                case 'death':
                    this.sessionStats.deaths++;
                    break;
                    
                case 'shot':
                    this.sessionStats.shots++;
                    break;
                    
                case 'hit':
                    this.sessionStats.hits++;
                    if (data.damage) {
                        this.sessionStats.damageDealt += data.damage;
                    }
                    break;
                    
                case 'damage_received':
                    this.sessionStats.damageReceived += data.damage || 0;
                    break;
                    
                case 'bomb_plant':
                    this.sessionStats.bombPlants++;
                    NotificationSystem.show(
                        'Spike plantée',
                        'Bombe plantée avec succès!',
                        'success',
                        3000
                    );
                    break;
                    
                case 'bomb_defuse':
                    this.sessionStats.bombDefuses++;
                    NotificationSystem.show(
                        'Spike désamorcée',
                        'Bombe désamorcée avec succès!',
                        'success',
                        3000
                    );
                    break;
                    
                case 'ace':
                    this.sessionStats.aces++;
                    NotificationSystem.show(
                        'ACE!',
                        'Toute l\'équipe adverse éliminée!',
                        'achievement',
                        5000
                    );
                    this.playAchievementSound();
                    break;
                    
                case 'clutch':
                    this.sessionStats.clutches++;
                    NotificationSystem.show(
                        'Clutch!',
                        `1v${data.enemyCount} remporté!`,
                        'achievement',
                        4000
                    );
                    break;
                    
                case 'round_end':
                    this.sessionStats.roundsPlayed++;
                    if (data.won) {
                        this.sessionStats.roundsWon++;
                    }
                    break;
                    
                case 'game_end':
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
        } catch (error) {
        }
    },
    
    async checkKillAchievements(data) {
        try {
            // Premier kill de la partie
            if (this.sessionStats.kills === 1 && window.AchievementManager) {
                await window.AchievementManager.checkAchievement('first_kill', { kills: 1 });
            }
            
            // Machine de guerre (10 kills en une partie)
            if (this.sessionStats.kills === 10 && window.AchievementManager) {
                await window.AchievementManager.checkAchievement('kill_spree', { killsInMatch: 10 });
            }
            
            // Vérifier les headshots
            if (data.headshot && window.AchievementManager) {
                const currentStats = await this.getCurrentStats();
                const totalHeadshots = (currentStats.headshots || 0) + this.sessionStats.headshots;
                await window.AchievementManager.checkAchievement('headshot_master', { headshots: totalHeadshots });
            }
        } catch (error) {
        }
    },
    
    async getCurrentStats() {
        if (!currentUser) return {};
        
        try {
            if (!database || !database.ref) return {};
            
            const statsRef = database.ref(`users/${currentUser.uid}/stats`);
            const snapshot = await statsRef.once('value');
            return snapshot.val() || {};
        } catch (error) {
            return {};
        }
    },
    
    async saveSessionStats() {
        if (!currentUser) return;
        
        try {
            if (!database || !database.ref) {
                return;
            }
            
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
            
            // Calculer les nouvelles statistiques dérivées
            updates.accuracy = updates.shotsFired > 0 ? (updates.shotsHit / updates.shotsFired) * 100 : 0;
            updates.kdRatio = updates.deaths > 0 ? updates.kills / updates.deaths : updates.kills;
            updates.winRate = updates.gamesPlayed > 0 ? (updates.wins / updates.gamesPlayed) * 100 : 0;
            updates.headshotPercentage = updates.kills > 0 ? (updates.headshots / updates.kills) * 100 : 0;
            
            // Sauvegarder
            await database.ref(`users/${currentUser.uid}/stats`).update(updates);
            
            // Mettre à jour le niveau et rang
            await this.updateLevelAndRank(updates.experience);
            
            // Réinitialiser les stats de session
            this.resetSessionStats();
            
            
            // Afficher un résumé
            this.showSessionSummary(updates, xpGained);
            
        } catch (error) {
        }
    },
    
    calculateXPGain() {
        let xp = 0;
        
        // XP pour les actions
        xp += this.sessionStats.kills * 100;
        xp += this.sessionStats.headshots * 50;
        xp += this.sessionStats.wins * 500;
        xp += this.sessionStats.gamesPlayed * 50;
        xp += this.sessionStats.bombPlants * 200;
        xp += this.sessionStats.bombDefuses * 300;
        xp += this.sessionStats.aces * 1000;
        xp += this.sessionStats.clutches * 500;
        xp += this.sessionStats.firstKills * 150;
        
        // Bonus de performance
        const accuracy = this.sessionStats.shots > 0 ? (this.sessionStats.hits / this.sessionStats.shots) : 0;
        if (accuracy > 0.7) xp += 200; // Bonus précision
        
        const kd = this.sessionStats.deaths > 0 ? (this.sessionStats.kills / this.sessionStats.deaths) : this.sessionStats.kills;
        if (kd >= 2) xp += 300; // Bonus K/D
        
        return Math.round(xp);
    },
    
    async updateLevelAndRank(experience) {
        if (!window.calculateLevel || !window.calculateRank) {
            return;
        }

        try {
            const newLevel = window.calculateLevel(experience);
            const newRank = window.calculateRank(experience);
            
            if (database && database.ref) {
                await database.ref(`users/${currentUser.uid}`).update({
                    level: newLevel,
                    rank: newRank,
                    experience: experience
                });
            }
            
            // Mettre à jour l'interface si la fonction existe
            if (window.updateUserRankDisplay) {
                window.updateUserRankDisplay();
            }
        } catch (error) {
        }
    },
    
    showSessionSummary(stats, xpGained) {
        const summary = `
            Session terminée:
            • ${this.sessionStats.kills} éliminations
            • ${this.sessionStats.deaths} morts
            • ${this.sessionStats.headshots} headshots
            • +${xpGained} XP
        `;
        
        NotificationSystem.show(
            'Session terminée',
            summary,
            'info',
            6000
        );
    },
    
    resetSessionStats() {
        Object.keys(this.sessionStats).forEach(key => {
            if (typeof this.sessionStats[key] === 'number') {
                this.sessionStats[key] = 0;
            }
        });
        this.sessionStats.sessionStart = Date.now();
    },
    
    playAchievementSound() {
        if (AppState.gameSettings.effectsVolume === 0) return;
        
        try {
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
        } catch (error) {
        }
    },

    async checkRealtimeAchievements() {
        // Placeholder pour la vérification des succès en temps réel
        // Sera complété quand le système de succès sera initialisé
    }
};

// Rendre StatsTracker accessible globalement
window.StatsTracker = StatsTracker;

// Services en ligne
let onlineServices = {
    heartbeat: null,
    matchmaking: null,
    friendsListener: null,
    invitationsListener: null,
    achievementListener: null
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    
    // Vérifier si Firebase est chargé
    if (typeof firebase === 'undefined') {
        showErrorMessage('Erreur de chargement. Veuillez actualiser la page.');
        return;
    }
    
    // Initialiser les modules de base
    try {
        initializeCore();
        initializeUI();
        initializeSettings();
        
        // Attendre que Firebase soit prêt
        setTimeout(() => {
            initializeFirebase();
        }, 500);
        
        // Marquer comme initialisé
        AppState.initialized = true;
        
        // Animation d'entrée
        playEntryAnimation();
    } catch (error) {
        showErrorMessage('Erreur lors de l\'initialisation');
    }
}

// Initialisation du core
function initializeCore() {
    // Précharger les ressources
    preloadAssets();
    
    // Initialiser les systèmes de base
}

// Initialisation de Firebase
function initializeFirebase() {
    try {
        if (typeof auth === 'undefined' || typeof database === 'undefined') {
            return;
        }
        
        
        // Écouter les changements d'authentification
        auth.onAuthStateChanged(handleAuthStateChange);
        
    } catch (error) {
        showErrorMessage('Erreur de connexion à Firebase');
    }
}

// Gestion des changements d'authentification
async function handleAuthStateChange(user) {
    try {
        if (user) {
            AppState.user = user;
            AppState.currentScreen = 'menu';
            
            // Initialiser les systèmes utilisateur
            await initializeUserSystems();
            
        } else {
            AppState.user = null;
            AppState.currentScreen = 'auth';
            
            // Arrêter les services
            stopUserSystems();
        }
    } catch (error) {
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
        
        // Vérifier s'il y a un match actif (si le système est disponible)
        if (window.MatchmakingSystem && typeof window.MatchmakingSystem.handleReconnection === 'function') {
            await window.MatchmakingSystem.handleReconnection();
        }
        
        
    } catch (error) {
    }
}

// Initialisation du profil utilisateur
async function initializeUserProfile() {
    try {
        AppState.profileSystem.loaded = false;
        
        if (!database || !database.ref) {
            return;
        }
        
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
        
    } catch (error) {
    }
}

// Services en ligne
function startOnlineServices() {
    try {
        // Heartbeat pour maintenir la connexion
        onlineServices.heartbeat = setInterval(() => {
            if (currentUser && database && database.ref) {
                database.ref(`users/${currentUser.uid}/lastSeen`)
                    .set(firebase.database.ServerValue.TIMESTAMP);
            }
        }, 30000);
        
        // Écouter les invitations d'amis
        if (currentUser && database && database.ref) {
            onlineServices.invitationsListener = database.ref(`users/${currentUser.uid}/invitations`)
                .on('child_added', handleFriendInvitation);
        }
        
    } catch (error) {
    }
}

function stopUserSystems() {
    // Arrêter les services en ligne
    if (onlineServices.heartbeat) {
        clearInterval(onlineServices.heartbeat);
        onlineServices.heartbeat = null;
    }
    
    if (onlineServices.invitationsListener && database && database.ref) {
        database.ref(`users/${currentUser.uid}/invitations`).off();
        onlineServices.invitationsListener = null;
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
    
}

// Gestion des invitations d'amis
function handleFriendInvitation(snapshot) {
    try {
        const invitation = snapshot.val();
        const invitationId = snapshot.key;
        
        if (!window.gameModes) {
            return;
        }
        
        const gameMode = window.gameModes[invitation.gameMode];
        const modeText = gameMode ? gameMode.name : invitation.gameMode;
        const mapText = invitation.map || 'carte aléatoire';
        
        NotificationSystem.show(
            'Invitation de partie',
            `${invitation.fromName} vous invite à jouer en ${modeText} sur ${mapText}`,
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
    } catch (error) {
    }
}

// Gestion des invitations de partie
async function acceptGameInvitation(invitationId, invitation) {
    try {
        const inv = JSON.parse(invitation);
        
        // Supprimer l'invitation
        if (database && database.ref) {
            await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        }
        
        // Rejoindre la file avec l'ami
        NotificationSystem.show(
            'Invitation acceptée',
            'Recherche de partie avec votre ami...',
            'success',
            3000
        );
        
        // Démarrer le matchmaking avec les paramètres de l'invitation
        if (window.selectedGameMode !== undefined) {
            window.selectedGameMode = inv.gameMode;
        }
        if (window.selectedMap !== undefined) {
            window.selectedMap = inv.map || 'auto';
        }
        
        if (window.launchGame && typeof window.launchGame === 'function') {
            await window.launchGame();
        }
        
    } catch (error) {
        NotificationSystem.show('Erreur', 'Impossible d\'accepter l\'invitation', 'error');
    }
}

async function declineGameInvitation(invitationId) {
    try {
        if (database && database.ref) {
            await database.ref(`users/${currentUser.uid}/invitations/${invitationId}`).remove();
        }
        NotificationSystem.show('Invitation refusée', '', 'info', 2000);
    } catch (error) {
    }
}

// Rendre ces fonctions accessibles globalement
window.acceptGameInvitation = acceptGameInvitation;
window.declineGameInvitation = declineGameInvitation;

// Initialisation de l'interface utilisateur
function initializeUI() {
    // Ajouter les écouteurs d'événements globaux
    setupGlobalEventListeners();
    
    // Initialiser les tooltips
    initializeTooltips();
    
    // Ajouter les styles pour les animations
    addCustomStyles();
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
    if (AppState.currentScreen === 'game' && window.gameCanvas) {
        if (window.resizeCanvas && typeof window.resizeCanvas === 'function') {
            window.resizeCanvas();
        }
    }
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Page cachée - pauser le jeu si nécessaire
        if (AppState.currentScreen === 'game' && window.game && window.game.gameStarted) {
            window.game.gamePaused = true;
        }
        
        // Changer le statut à "away"
        if (currentUser && database && database.ref) {
            database.ref(`users/${currentUser.uid}/status`).set('away');
        }
    } else {
        // Page visible - reprendre le jeu
        if (currentUser && database && database.ref) {
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
                if (currentUser && window.openPlayerProfile) {
                    window.openPlayerProfile();
                }
                break;
        }
    }
    
    // Raccourcis pour les invitations
    if (e.key && e.key.toLowerCase() === 'y') {
        const acceptBtn = document.querySelector('.game-notification button[onclick*="accept"]');
        if (acceptBtn) acceptBtn.click();
    } else if (e.key && e.key.toLowerCase() === 'n') {
        const declineBtn = document.querySelector('.game-notification button[onclick*="decline"]');
        if (declineBtn) declineBtn.click();
    }
}

// Système de tooltips
function initializeTooltips() {
    document.addEventListener('mouseover', (e) => {
        const tooltipText = e.target.getAttribute('data-tooltip');
        if (tooltipText) {
            showTooltip(e, tooltipText);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.getAttribute('data-tooltip')) {
            hideTooltip();
        }
    });
}

function showTooltip(e, text) {
    hideTooltip(); // Supprimer l'ancien tooltip
    
    const tooltip = document.createElement('div');
    tooltip.id = 'game-tooltip';
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
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    document.body.appendChild(tooltip);
    
    // Positionner le tooltip
    const x = e.clientX + 10;
    const y = e.clientY - 30;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    
    // Faire apparaître
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
    });
}

function hideTooltip() {
    const tooltip = document.getElementById('game-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Préchargement des ressources
function preloadAssets() {
    
    const assets = [
        'Système de matchmaking',
        'Profils utilisateur',
        'Système de succès', 
        'Statistiques avancées',
        'Interface de jeu',
        'Économie Valorant',
        'Modes de jeu'
    ];
    
    assets.forEach((asset, index) => {
        setTimeout(() => {
            updateLoadingProgress(index + 1, assets.length, asset);
        }, (index + 1) * 300);
    });
}

function updateLoadingProgress(loaded, total, currentAsset) {
    const progress = (loaded / total) * 100;
    
    if (loaded === total) {
    }
}

// Gestion des paramètres
function initializeSettings() {
    loadSettingsFromStorage();
    applySettings();
}

function loadSettingsFromStorage() {
    const savedSettings = localStorage.getItem('sioshooter_settings');
    if (savedSettings) {
        try {
            AppState.gameSettings = { ...AppState.gameSettings, ...JSON.parse(savedSettings) };
        } catch (error) {
        }
    }
}

function applySettings() {
    // Appliquer le volume
    document.documentElement.style.setProperty('--master-volume', AppState.gameSettings.masterVolume);
    document.documentElement.style.setProperty('--effects-volume', AppState.gameSettings.effectsVolume);
    
    // Appliquer la qualité graphique
    document.documentElement.classList.remove('graphics-low', 'graphics-medium', 'graphics-high');
    document.documentElement.classList.add(`graphics-${AppState.gameSettings.graphics}`);
    
    // Appliquer la sensibilité de la souris
    if (typeof window.player !== 'undefined') {
        window.player.mouseSensitivity = AppState.gameSettings.mouseSensitivity;
    }
}

// Rendre applySettings accessible globalement
window.applySettings = applySettings;

async function loadUserSettings() {
    if (!currentUser) return;
    
    try {
        if (!database || !database.ref) return;
        
        const settingsRef = database.ref(`users/${currentUser.uid}/settings`);
        const snapshot = await settingsRef.once('value');
        
        if (snapshot.exists()) {
            AppState.gameSettings = { ...AppState.gameSettings, ...snapshot.val() };
            applySettings();
        }
    } catch (error) {
    }
}

// Fonctions utilitaires
function toggleMasterVolume() {
    AppState.gameSettings.masterVolume = AppState.gameSettings.masterVolume > 0 ? 0 : 0.5;
    applySettings();
    
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
            NotificationSystem.show('Erreur', 'Impossible de passer en plein écran', 'error');
        });
    } else {
        document.exitFullscreen();
    }
}

// Fonctions d'écrans
function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    if (document.getElementById('profile-modal')) {
        document.getElementById('profile-modal').classList.add('hidden');
    }
}

function showMainMenu() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    if (document.getElementById('profile-modal')) {
        document.getElementById('profile-modal').classList.add('hidden');
    }
    
    if (currentUser && window.updateUserInterface) {
        window.updateUserInterface();
    }
}

function showGameScreen() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    if (document.getElementById('profile-modal')) {
        document.getElementById('profile-modal').classList.add('hidden');
    }
}

// Rendre ces fonctions accessibles globalement
window.showAuthScreen = showAuthScreen;
window.showMainMenu = showMainMenu;
window.showGameScreen = showGameScreen;

// Ajouter les styles personnalisés
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes damageFloat {
            0% {
                opacity: 1;
                transform: translateY(0);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px);
            }
        }
        
        .damage-indicator {
            font-family: 'Arial', sans-serif;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        
        .game-notification {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }
        
        .graphics-low {
            --render-quality: 0.75;
        }
        
        .graphics-medium {
            --render-quality: 1.0;
        }
        
        .graphics-high {
            --render-quality: 1.25;
        }
    `;
    document.head.appendChild(style);
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
    e.preventDefault();
});

function showErrorMessage(message) {
    NotificationSystem.show('Erreur', message, 'error');
}

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', (e) => {
    // Sauvegarder les statistiques de session
    if (currentUser && StatsTracker.sessionStats.gamesPlayed > 0) {
        StatsTracker.saveSessionStats();
    }
    
    // Nettoyer les listeners
    stopUserSystems();
    
    // Marquer comme hors ligne
    if (currentUser && database && database.ref) {
        database.ref(`users/${currentUser.uid}/status`).set('offline');
    }
});

// Export des fonctions principales
window.GameOrchestrator = {
    AppState,
    StatsTracker,
    NotificationSystem,
    initializeApp,
    showAuthScreen,
    showMainMenu,
    showGameScreen
};

// Debug et développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
        AppState,
        StatsTracker,
        NotificationSystem,
        
        // Fonctions de debug
        testNotification: (type = 'info') => {
            NotificationSystem.show(
                'Test Notification',
                'Ceci est un test de notification',
                type
            );
        },
        
        addKills: (count) => {
            for (let i = 0; i < count; i++) {
                StatsTracker.trackEvent('kill', { headshot: Math.random() > 0.7 });
            }
        },
        
        simulateMatch: (won = true) => {
            StatsTracker.trackEvent('game_end', { won });
        }
    };
    
}

