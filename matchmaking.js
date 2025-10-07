// ========================================
// COPIEZ CETTE SECTION AU TOUT DÉBUT DE matchmaking.js
// AVANT TOUT AUTRE CODE !
// ========================================

// Configuration des modes de jeu (exportée globalement)
window.gameModes = {
    duel: {
        name: 'Duel',
        description: '1v1 - Premier à 5 rounds - Pas de bombe',
        maxPlayers: 2,
        minPlayers: 2,
        maxRounds: 9,
        winCondition: 5,
        economy: true,
        ranked: true,
        teamSize: 1,
        hasBomb: false,
        roundDuration: 90,
        buyPhaseDuration: 20
    },
    competitive: {
        name: 'Compétitif',
        description: '5v5 - Premier à 13 rounds - Plant de spike',
        maxPlayers: 10,
        minPlayers: 2,
        maxRounds: 25,
        winCondition: 13,
        economy: true,
        ranked: true,
        teamSize: 5,
        hasBomb: true,
        roundDuration: 100,
        buyPhaseDuration: 45
    },
    attack_defense: {
        name: 'Attaque / Défense',
        description: '5v5 avec changement de camp à la mi-temps - Plant de spike',
        maxPlayers: 10,
        minPlayers: 2,
        maxRounds: 24,
        winCondition: 13,
        economy: true,
        ranked: false,
        teamSize: 5,
        hasBomb: true,
        roundDuration: 100,
        buyPhaseDuration: 30,
        swapRounds: 12
    },
    deathmatch: {
        name: 'Deathmatch',
        description: 'Combat libre - 10 minutes - Pas de bombe',
        maxPlayers: 14,
        minPlayers: 2,
        maxRounds: 1,
        winCondition: 50,
        economy: false,
        ranked: false,
        teamSize: 0,
        hasBomb: false,
        roundDuration: 600,
        buyPhaseDuration: 0
    },
    unrated: {
        name: 'Non classé',
        description: '5v5 - Mode casual - Plant de spike',
        maxPlayers: 10,
        minPlayers: 2,
        maxRounds: 25,
        winCondition: 13,
        economy: true,
        ranked: false,
        teamSize: 5,
        hasBomb: true,
        roundDuration: 100,
        buyPhaseDuration: 30
    }
};

// Système de rangs pour le matchmaking réel
const rankSystem = {
    'Fer I': { mmr: 0, variance: 100 },
    'Fer II': { mmr: 100, variance: 90 },
    'Fer III': { mmr: 200, variance: 85 },
    'Bronze I': { mmr: 300, variance: 80 },
    'Bronze II': { mmr: 400, variance: 75 },
    'Bronze III': { mmr: 500, variance: 70 },
    'Argent I': { mmr: 600, variance: 65 },
    'Argent II': { mmr: 700, variance: 60 },
    'Argent III': { mmr: 800, variance: 55 },
    'Or I': { mmr: 900, variance: 50 },
    'Or II': { mmr: 1000, variance: 45 },
    'Or III': { mmr: 1100, variance: 40 },
    'Platine I': { mmr: 1200, variance: 35 },
    'Platine II': { mmr: 1300, variance: 30 },
    'Platine III': { mmr: 1400, variance: 25 },
    'Diamant I': { mmr: 1500, variance: 20 },
    'Diamant II': { mmr: 1600, variance: 18 },
    'Diamant III': { mmr: 1700, variance: 15 },
    'Immortel': { mmr: 1800, variance: 12 },
    'Radiant': { mmr: 2000, variance: 10 }
};

console.log('✅ window.gameModes défini avec succès');
console.log('✅ rankSystem défini avec succès');

// ========================================
// APRÈS CETTE SECTION, CONTINUEZ AVEC LE RESTE DE VOTRE CODE matchmaking.js
// (window.matchmakingState, class MatchmakingSystem, etc.)
// ========================================

// État global du matchmaking
window.matchmakingState = {
    inQueue: false,
    queueStartTime: null,
    selectedMode: null,
    selectedMap: null,
    currentMatchId: null,
    currentQueueId: null,
    preferences: {
        region: 'EU',
        maxPing: 100,
        allowHigherRanks: true,
        preferredLanguage: 'fr'
    },
    listeners: {}
};

// Classe MatchmakingSystem RÉELLE
class MatchmakingSystem {
    constructor() {
        this.queue = new Map();
        this.activeMatches = new Map();
        this.playerData = new Map();
        this.listeners = new Map();
        this.gameModes = window.gameModes;
        this.queueCheckInterval = null;
        this.matchCheckInterval = null;
    }

    // Fonction principale pour rejoindre la file d'attente RÉELLE
    async findMatch(mode, map = null, options = {}) {
        console.log('🔍 Recherche de match RÉELLE:', { mode, map, options });
        
        if (window.matchmakingState.inQueue) {
            throw new Error('Déjà en file d\'attente');
        }

        if (!currentUser) {
            throw new Error('Utilisateur non connecté');
        }

        if (!this.gameModes[mode]) {
            throw new Error(`Mode de jeu invalide: ${mode}`);
        }

        if (!database || !database.ref) {
            throw new Error('Firebase non disponible');
        }

        try {
            const normalizedMap = this.normalizeMapName(map);
            const playerData = await this.getPlayerData(currentUser.uid);
            
            const queueId = await this.createQueueEntry(mode, normalizedMap, playerData, options);
            
            this.showMatchmakingUI(mode, normalizedMap);
            
            await this.startQueueSearch(queueId, mode, playerData, normalizedMap);
            
            return queueId;
        } catch (error) {
            console.error('Erreur findMatch:', error);
            this.hideMatchmakingUI();
            throw error;
        }
    }

    // Créer une entrée dans la file d'attente Firebase
    async createQueueEntry(mode, map, playerData, options) {
        const queueRef = database.ref('matchmaking_queue');
        const newQueueRef = queueRef.push();
        
        const queueEntry = {
            playerId: currentUser.uid,
            playerName: playerData.displayName || 'Joueur',
            playerLevel: playerData.level || 1,
            playerRank: playerData.rank || 'Fer I',
            playerMMR: this.calculateMMR(playerData),
            mode: mode,
            map: map || null,
            region: options.region || 'EU',
            maxPing: options.maxPing || 100,
            preferences: options,
            status: 'searching',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            lastActivity: firebase.database.ServerValue.TIMESTAMP
        };
        
        await newQueueRef.set(queueEntry);
        
        window.matchmakingState.inQueue = true;
        window.matchmakingState.queueStartTime = Date.now();
        window.matchmakingState.selectedMode = mode;
        window.matchmakingState.selectedMap = map || null;
        window.matchmakingState.currentQueueId = newQueueRef.key;
        
        console.log('✅ Entrée file d\'attente créée:', newQueueRef.key);
        return newQueueRef.key;
    }

    // Démarrer la recherche active de matchs
    async startQueueSearch(queueId, mode, playerData, preferredMap = null) {
        // Rechercher immédiatement
        await this.searchForExistingMatches(queueId, mode, playerData, preferredMap);
        
        // Configurer les listeners
        this.setupQueueListeners(queueId);
        
        // Recherche périodique
        this.queueCheckInterval = setInterval(async () => {
            if (window.matchmakingState.inQueue) {
                await this.searchForExistingMatches(queueId, mode, playerData, preferredMap);
                await this.updateQueueActivity(queueId);
            }
        }, 3000); // Vérifier toutes les 3 secondes
        
        // Timeout de file d'attente (5 minutes)
        setTimeout(() => {
            if (window.matchmakingState.inQueue && window.matchmakingState.currentQueueId === queueId) {
                this.handleQueueTimeout(queueId);
            }
        }, 300000); // 5 minutes
    }

    // Rechercher des matchs existants ou créer un nouveau match
    async searchForExistingMatches(queueId, mode, playerData, preferredMap = null) {
        try {
            // Rechercher des matchs en attente
            const matchesRef = database.ref('active_matches');
            const snapshot = await matchesRef.orderByChild('status').equalTo('waiting').once('value');
            
            if (snapshot.exists()) {
                const matches = snapshot.val();
                
                for (const matchId in matches) {
                    const match = matches[matchId];
                    
                    // Vérifier la compatibilité
                    if (await this.isMatchCompatible(match, mode, playerData, preferredMap)) {
                        // Tenter de rejoindre le match
                        const joined = await this.joinExistingMatch(queueId, matchId, match, playerData);
                        if (joined) {
                            return; // Match rejoint avec succès
                        }
                    }
                }
            }
            
            // Aucun match compatible trouvé, créer un nouveau match
            await this.createNewMatch(queueId, mode, playerData);
            
        } catch (error) {
            console.error('Erreur recherche matchs:', error);
        }
    }

    // Vérifier si un match est compatible
    async isMatchCompatible(match, mode, playerData, preferredMap = null) {
        // Vérifier le mode de jeu
        if (match.mode !== mode) return false;
        
        if (preferredMap && match.map && match.map !== preferredMap) {
            return false;
        }
        
        // Vérifier si le match n'est pas plein
        const currentPlayers = Object.keys(match.players || {}).length;
        if (currentPlayers >= this.gameModes[mode].maxPlayers) return false;
        
        // Vérifier le MMR si c'est un mode classé
        if (this.gameModes[mode].ranked) {
            const playerMMR = this.calculateMMR(playerData);
            const matchMMR = match.averageMMR || 0;
            const mmrDifference = Math.abs(playerMMR - matchMMR);
            
            // Tolérance MMR basée sur le temps d'attente
            const waitTime = Date.now() - window.matchmakingState.queueStartTime;
            const mmrTolerance = 200 + (waitTime / 1000) * 10; // Augmente avec le temps
            
            if (mmrDifference > mmrTolerance) return false;
        }
        
        // Vérifier la région
        if (match.region !== window.matchmakingState.preferences.region) {
            return false;
        }
        
        return true;
    }

    // Rejoindre un match existant
    async joinExistingMatch(queueId, matchId, match, playerData) {
        try {
            const matchRef = database.ref(`active_matches/${matchId}`);
            
            // Vérifier que le match existe encore et n'est pas plein
            const currentSnapshot = await matchRef.once('value');
            const currentMatch = currentSnapshot.val();
            
            if (!currentMatch || currentMatch.status !== 'waiting') {
                return false;
            }
            
            const currentPlayers = Object.keys(currentMatch.players || {}).length;
            if (currentPlayers >= this.gameModes[match.mode].maxPlayers) {
                return false;
            }
            
            // Ajouter le joueur au match
            const playerInfo = {
                id: currentUser.uid,
                name: playerData.displayName || 'Joueur',
                level: playerData.level || 1,
                rank: playerData.rank || 'Fer I',
                mmr: this.calculateMMR(playerData),
                avatar: playerData.avatar || 'user',
                team: this.assignTeam(currentMatch, match.mode),
                ready: false,
                connected: true,
                joinedAt: firebase.database.ServerValue.TIMESTAMP
            };
            
            // Mise à jour atomique
            const updates = {};
            updates[`players/${currentUser.uid}`] = playerInfo;
            
            // Recalculer le MMR moyen
            const newPlayerCount = currentPlayers + 1;
            const newAverageMMR = ((currentMatch.averageMMR || 0) * currentPlayers + playerInfo.mmr) / newPlayerCount;
            updates['averageMMR'] = newAverageMMR;
            updates['lastActivity'] = firebase.database.ServerValue.TIMESTAMP;
            
            // Si le match est plein, le démarrer
            if (newPlayerCount >= this.gameModes[match.mode].maxPlayers) {
                updates['status'] = 'starting';
                updates['startTime'] = firebase.database.ServerValue.TIMESTAMP;
            }
            
            await matchRef.update(updates);
            
            // Quitter la file d'attente
            await this.leaveQueue(queueId);
            
            // Écouter les changements du match
            this.setupMatchListeners(matchId);
            
            window.matchmakingState.currentMatchId = matchId;
            
            console.log('✅ Match rejoint:', matchId);
            return true;
            
        } catch (error) {
            console.error('Erreur rejoindre match:', error);
            return false;
        }
    }

    // Créer un nouveau match
    async createNewMatch(queueId, mode, playerData) {
        try {
            const matchesRef = database.ref('active_matches');
            const newMatchRef = matchesRef.push();
            
            const matchData = {
                id: newMatchRef.key,
                mode: mode,
            map: this.normalizeMapName(window.matchmakingState.selectedMap) || this.selectRandomMap(),
                status: 'waiting',
                host: currentUser.uid,
                region: window.matchmakingState.preferences.region,
                averageMMR: this.calculateMMR(playerData),
                maxPlayers: this.gameModes[mode].maxPlayers,
                players: {
                    [currentUser.uid]: {
                        id: currentUser.uid,
                        name: playerData.displayName || 'Joueur',
                        level: playerData.level || 1,
                        rank: playerData.rank || 'Fer I',
                        mmr: this.calculateMMR(playerData),
                        avatar: playerData.avatar || 'user',
                        team: mode === 'deathmatch' ? null : 'attackers',
                        ready: false,
                        connected: true,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    }
                },
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastActivity: firebase.database.ServerValue.TIMESTAMP
            };
            
            await newMatchRef.set(matchData);
            
            // Quitter la file d'attente
            await this.leaveQueue(queueId);
            
            // Écouter les changements du match
            this.setupMatchListeners(newMatchRef.key);
            
            window.matchmakingState.currentMatchId = newMatchRef.key;
            
            console.log('✅ Nouveau match créé:', newMatchRef.key);
            
        } catch (error) {
            console.error('Erreur création match:', error);
        }
    }

    // Assigner une équipe au joueur
    assignTeam(matchData, mode) {
        if (mode === 'deathmatch') return null;
        
        const players = Object.values(matchData.players || {});
        const attackers = players.filter(p => p.team === 'attackers').length;
        const defenders = players.filter(p => p.team === 'defenders').length;
        
        return attackers <= defenders ? 'attackers' : 'defenders';
    }

    // Configurer les listeners de file d'attente
    setupQueueListeners(queueId) {
        const queueRef = database.ref(`matchmaking_queue/${queueId}`);
        
        const statusHandler = (snapshot) => {
            const queueData = snapshot.val();
            if (!queueData) {
                return;
            }
            
            if (queueData.status === 'match_found') {
                this.handleMatchFound(queueData.matchId);
            }
        };
        
        queueRef.on('value', statusHandler);
        window.matchmakingState.listeners.queueStatus = {
            ref: queueRef,
            eventType: 'value',
            handler: statusHandler
        };
        
        queueRef.onDisconnect().remove();
    }

    // Configurer les listeners de match
    setupMatchListeners(matchId) {
        const matchRef = database.ref(`active_matches/${matchId}`);
        
        const statusHandler = (snapshot) => {
            const matchData = snapshot.val();
            if (!matchData) {
                console.log('Match supprimé');
                return;
            }
            
            matchData.id = matchId;
            this.handleMatchUpdate(matchData);
        };
        
        matchRef.on('value', statusHandler);
        window.matchmakingState.listeners.matchStatus = {
            ref: matchRef,
            eventType: 'value',
            handler: statusHandler
        };
        
        const playersRef = matchRef.child('players');
        const playerAddedHandler = (snapshot) => {
            const playerId = snapshot.key;
            const playerData = snapshot.val();
            
            if (playerId !== currentUser.uid) {
                this.handlePlayerJoined(playerId, playerData);
            }
        };
        
        const playerRemovedHandler = (snapshot) => {
            const playerId = snapshot.key;
            this.handlePlayerLeft(playerId);
        };
        
        playersRef.on('child_added', playerAddedHandler);
        playersRef.on('child_removed', playerRemovedHandler);
        
        window.matchmakingState.listeners.players = {
            ref: playersRef,
            eventType: 'child_added',
            handler: playerAddedHandler
        };
        
        window.matchmakingState.listeners.playersLeft = {
            ref: playersRef,
            eventType: 'child_removed',
            handler: playerRemovedHandler
        };
    }

    // ========================================
    // MÉTHODES CORRIGÉES - AJOUTÉES
    // ========================================

    // Gérer quand un joueur rejoint le match
    handlePlayerJoined(playerId, playerData) {
        console.log(`👤 Joueur rejoint: ${playerData.name}`);
        
        // Afficher une notification
        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Nouveau joueur',
                `${playerData.name} a rejoint le match`,
                'info',
                3000
            );
        }
        
        // Mettre à jour l'interface du lobby si visible
        const lobby = document.getElementById('match-lobby');
        if (lobby && window.matchmakingState.currentMatchId) {
            this.refreshLobbyDisplay();
        }
    }

    // Gérer quand un joueur quitte le match
    handlePlayerLeft(playerId) {
        console.log(`👋 Joueur parti: ${playerId}`);
        
        // Afficher une notification
        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Joueur déconnecté',
                'Un joueur a quitté le match',
                'warning',
                3000
            );
        }
        
        // Mettre à jour l'interface du lobby si visible
        const lobby = document.getElementById('match-lobby');
        if (lobby && window.matchmakingState.currentMatchId) {
            this.refreshLobbyDisplay();
        }
        
        // Vérifier si le match doit être annulé
        this.checkMatchValidity();
    }

    // Gérer quand un match est trouvé
    async handleMatchFound(matchId) {
        console.log('✅ Match trouvé:', matchId);
        
        // Nettoyer la file d'attente
        if (window.matchmakingState.currentQueueId) {
            const queueRef = database.ref(`matchmaking_queue/${window.matchmakingState.currentQueueId}`);
            await queueRef.remove();
        }
        
        window.matchmakingState.inQueue = false;
        window.matchmakingState.currentMatchId = matchId;
        
        // Récupérer les données du match
        const matchRef = database.ref(`active_matches/${matchId}`);
        const snapshot = await matchRef.once('value');
        const matchData = snapshot.val();
        
        if (matchData) {
            matchData.id = matchId;
            // Afficher le lobby du match
            this.showMatchLobby(matchData);
            
            // Configurer les listeners du match
            this.setupMatchListeners(matchId);
            
            // Notification
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Match trouvé !',
                    'Préparez-vous pour la bataille',
                    'success',
                    5000
                );
            }
        }
    }

    // Rafraîchir l'affichage du lobby
    async refreshLobbyDisplay() {
        if (!window.matchmakingState.currentMatchId) return;
        
        try {
            const matchRef = database.ref(`active_matches/${window.matchmakingState.currentMatchId}`);
            const snapshot = await matchRef.once('value');
            const matchData = snapshot.val();
            
            if (matchData) {
                this.showMatchLobby(matchData);
            }
        } catch (error) {
            console.error('Erreur rafraîchissement lobby:', error);
        }
    }

    // Vérifier la validité du match
    async checkMatchValidity() {
        if (!window.matchmakingState.currentMatchId) return;
        
        try {
            const matchRef = database.ref(`active_matches/${window.matchmakingState.currentMatchId}`);
            const snapshot = await matchRef.once('value');
            const matchData = snapshot.val();
            
            if (!matchData) {
                // Le match a été supprimé
                this.handleMatchCancelled();
                return;
            }
            
            const playerCount = Object.keys(matchData.players || {}).length;
            
            // Si moins de 2 joueurs, annuler le match
            if (playerCount < 2 && matchData.status === 'waiting') {
                console.log('⚠️ Pas assez de joueurs, match annulé');
                await matchRef.remove();
                this.handleMatchCancelled();
            }
        } catch (error) {
            console.error('Erreur vérification match:', error);
        }
    }

    // Gérer l'annulation du match
    handleMatchCancelled() {
        console.log('❌ Match annulé');
        
        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Match annulé',
                'Le match a été annulé. Retour au menu principal.',
                'error',
                5000
            );
        }
        
        this.clearCurrentMatchState();
        this.handlePostMatchCleanup();
    }

    // Gérer la fin du match
    async handleMatchEnded(matchData) {
        console.log('🏁 Match terminé');
        
        // Afficher les résultats
        this.showMatchResults(matchData);
        
        // Nettoyer après un délai
        setTimeout(() => {
            this.clearCurrentMatchState();
            this.handlePostMatchCleanup();
        }, 10000);
    }

    // Afficher l'écran de démarrage du match
    showMatchStarting(matchData) {
        this.hideAllMatchmakingUI();
        
        if (!matchData.id && window.matchmakingState.currentMatchId) {
            matchData.id = window.matchmakingState.currentMatchId;
        }
        
        const startingUI = document.createElement('div');
        startingUI.id = 'match-preparation';
        startingUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
        `;
        
        startingUI.innerHTML = `
            <div style="text-align: center;">
                <h1 style="font-size: 64px; margin-bottom: 20px; color: #00d4ff; animation: pulse 2s infinite;">
                    MATCH COMMENCE
                </h1>
                <div style="font-size: 24px; margin-bottom: 40px; color: rgba(255,255,255,0.7);">
                    ${this.gameModes[matchData.mode].name}
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #ffd700;">
                    ${this.getMapDisplayName(matchData.map)}
                </div>
                <div style="margin-top: 40px; color: rgba(255,255,255,0.5);">
                    Préparez-vous...
                </div>
            </div>
        `;
        
        document.body.appendChild(startingUI);
        
        // Démarrer le jeu après 3 secondes
        setTimeout(() => {
            this.startGameSession(matchData);
        }, 3000);
    }

    // Afficher les résultats du match
    showMatchResults(matchData) {
        this.hideAllMatchmakingUI();
        
        const resultsUI = document.createElement('div');
        resultsUI.id = 'match-results';
        resultsUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
            overflow-y: auto;
            padding: 40px;
        `;
        
        const winningTeam = matchData.score?.attackers > matchData.score?.defenders ? 'Attaquants' : 'Défenseurs';
        const playerWon = (matchData.players[currentUser?.uid]?.team === 'attackers' && winningTeam === 'Attaquants') ||
                          (matchData.players[currentUser?.uid]?.team === 'defenders' && winningTeam === 'Défenseurs');
        
        resultsUI.innerHTML = `
            <div style="text-align: center; max-width: 800px;">
                <h1 style="font-size: 64px; margin-bottom: 20px; color: ${playerWon ? '#4ade80' : '#ef4444'};">
                    ${playerWon ? 'VICTOIRE' : 'DÉFAITE'}
                </h1>
                
                <div style="display: flex; justify-content: center; gap: 40px; margin: 40px 0; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 15px;">
                    <div>
                        <h3 style="color: #ff4655; margin-bottom: 10px;">Attaquants</h3>
                        <div style="font-size: 48px; font-weight: bold;">${matchData.score?.attackers || 0}</div>
                    </div>
                    <div style="font-size: 48px; color: rgba(255,255,255,0.3);">-</div>
                    <div>
                        <h3 style="color: #00d4ff; margin-bottom: 10px;">Défenseurs</h3>
                        <div style="font-size: 48px; font-weight: bold;">${matchData.score?.defenders || 0}</div>
                    </div>
                </div>
                
                <div style="margin-top: 40px; color: rgba(255,255,255,0.7);">
                    Retour au menu dans 10 secondes...
                </div>
            </div>
        `;
        
        document.body.appendChild(resultsUI);
    }

    // ========================================
    // FIN DES MÉTHODES AJOUTÉES
    // ========================================

    // Gérer la mise à jour du match
    handleMatchUpdate(matchData) {
        switch (matchData.status) {
            case 'waiting':
                this.showMatchLobby(matchData);
                break;
            case 'starting':
                this.showMatchStarting(matchData);
                break;
            case 'in_progress':
                this.startGameSession(matchData);
                break;
            case 'ended':
                this.handleMatchEnded(matchData);
                break;
        }
    }

    // Afficher le lobby de match
    showMatchLobby(matchData) {
        this.hideMatchmakingUI();
        
        const lobbyUI = document.createElement('div');
        lobbyUI.id = 'match-lobby';
        lobbyUI.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            color: white;
        `;

        const playersList = Object.values(matchData.players || {})
            .map(player => `
                <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; margin: 5px 0;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(45deg, #ff4655, #00d4ff); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-${player.avatar || 'user'}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold;">${player.name}</div>
                        <div style="font-size: 12px; color: rgba(255,255,255,0.7);">${player.rank} - Niveau ${player.level}</div>
                    </div>
                    <div style="color: ${player.ready ? '#4ade80' : '#ef4444'};">
                        <i class="fas fa-${player.ready ? 'check' : 'clock'}"></i>
                    </div>
                </div>
            `).join('');

        lobbyUI.innerHTML = `
            <div style="text-align: center; max-width: 600px;">
                <h1 style="font-size: 48px; margin-bottom: 20px; color: #00d4ff;">MATCH TROUVÉ</h1>
                
                <div style="display: flex; justify-content: space-between; margin: 40px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                    <div style="text-align: center;">
                        <h3 style="color: #ff4655; margin-bottom: 10px;">MODE</h3>
                        <p style="font-size: 18px;">${this.gameModes[matchData.mode].name}</p>
                    </div>
                    <div style="text-align: center;">
                        <h3 style="color: #ffd700; margin-bottom: 10px;">CARTE</h3>
                        <p style="font-size: 18px;">${this.getMapDisplayName(matchData.map)}</p>
                    </div>
                    <div style="text-align: center;">
                        <h3 style="color: #4ade80; margin-bottom: 10px;">JOUEURS</h3>
                        <p style="font-size: 18px;">${Object.keys(matchData.players || {}).length}/${matchData.maxPlayers}</p>
                    </div>
                </div>

                <div style="margin: 30px 0;">
                    <h3 style="margin-bottom: 20px;">Joueurs dans le match:</h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${playersList}
                    </div>
                </div>

                <div style="margin: 30px 0;">
                    <button onclick="window.MatchmakingSystem.setPlayerReady(true)" style="background: linear-gradient(45deg, #00d4ff, #0099cc); border: none; border-radius: 10px; color: white; padding: 15px 30px; font-size: 18px; font-weight: bold; cursor: pointer; margin-right: 15px;">
                        <i class="fas fa-check"></i> PRÊT
                    </button>
                    <button onclick="window.MatchmakingSystem.leaveMatch()" style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 10px; color: #ef4444; padding: 15px 30px; font-size: 18px; cursor: pointer;">
                        <i class="fas fa-times"></i> Quitter
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(lobbyUI);
    }

    // Démarrer la session de jeu
    startGameSession(matchData) {
        console.log('🚀 Démarrage de la session de jeu');
        
        this.hideAllMatchmakingUI();
        
        const resolvedMatchId = matchData?.id || window.matchmakingState.currentMatchId;
        if (!resolvedMatchId) {
            console.error('Impossible de démarrer la partie: matchId manquant', matchData);
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Erreur de match',
                    'Impossible de démarrer la partie (ID manquant). Veuillez relancer la recherche.',
                    'error',
                    6000
                );
            }
            return;
        }

        // Configurer les données du jeu
        if (window.game && window.player) {
            window.game.mode = matchData.mode;
            window.game.currentMap = this.normalizeMapName(matchData.map) || matchData.map;
            window.game.matchId = resolvedMatchId;
            
            const modeSettings = this.gameModes[matchData.mode] || {};
            window.game.modeSettings = modeSettings;
            if (typeof modeSettings.maxRounds === 'number') {
                window.game.maxRounds = modeSettings.maxRounds;
            }
            if (typeof modeSettings.winCondition === 'number') {
                window.game.winCondition = modeSettings.winCondition;
            }
            window.game.defaultRoundTime = modeSettings.roundDuration || window.game.defaultRoundTime || 100;
            window.game.defaultBuyTime = modeSettings.buyPhaseDuration || window.game.defaultBuyTime || 30;
            window.game.swapRounds = modeSettings.swapRounds || window.game.swapRounds || Math.floor((window.game.maxRounds || 24) / 2);
            
            // Assigner l'équipe du joueur
            const playerData = matchData.players?.[currentUser.uid];
            if (playerData?.team) {
                window.player.team = playerData.team;
            }
        }
        
        // Passer à l'écran de jeu
        if (window.showGameScreen) {
            window.showGameScreen();
        }
        
        // Initialiser le jeu
        setTimeout(() => {
            if (window.initializeGame) {
                window.initializeGame();
            }
        }, 500);
        
        // Configurer la synchronisation en temps réel
        this.setupGameSync(resolvedMatchId);
    }

    // Configurer la synchronisation de jeu en temps réel
    setupGameSync(matchId) {
        if (!matchId) {
            console.error('Impossible de configurer la synchronisation: matchId manquant');
            return;
        }

        const gameRef = database.ref(`game_sessions/${matchId}`);
        
        // Initialiser la session de jeu si c'est l'hôte
        const matchRef = database.ref(`active_matches/${matchId}`);
        matchRef.once('value', (snapshot) => {
            const matchData = snapshot.val();
            if (matchData && matchData.host === currentUser.uid) {
                // L'hôte initialise la session de jeu
                gameRef.set({
                    matchId: matchId,
                    status: 'active',
                    round: 1,
                    phase: 'freeze',
                    score: { attackers: 0, defenders: 0 },
                    players: {},
                    events: {},
                    bomb: { planted: false, carrier: null },
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            }
        });
        
        const eventsRef = gameRef.child('events');
        const eventHandler = (snapshot) => {
            const event = snapshot.val();
            if (event && event.playerId !== currentUser.uid) {
                this.handleGameEvent(event);
            }
        };
        
        eventsRef.on('child_added', eventHandler);
        window.matchmakingState.listeners.gameEvents = {
            ref: eventsRef,
            eventType: 'child_added',
            handler: eventHandler
        };
        
        const positionsRef = gameRef.child('players');

        // Charger d'abord tous les joueurs existants
        positionsRef.once('value', (snapshot) => {
            const players = snapshot.val() || {};
            console.log('📍 Chargement des joueurs existants:', Object.keys(players).length);

            for (const playerId in players) {
                if (playerId !== currentUser.uid && window.updateOtherPlayerPosition) {
                    window.updateOtherPlayerPosition(playerId, players[playerId]);
                }
            }
        });

        // Écouter les mises à jour en temps réel
        const positionHandler = (snapshot) => {
            const playerId = snapshot.key;
            const playerData = snapshot.val();

            if (playerId !== currentUser.uid && window.updateOtherPlayerPosition) {
                window.updateOtherPlayerPosition(playerId, playerData);
            }
        };

        positionsRef.on('child_added', positionHandler);
        positionsRef.on('child_changed', positionHandler);

        // Gérer la déconnexion des joueurs
        positionsRef.on('child_removed', (snapshot) => {
            const playerId = snapshot.key;
            if (window.otherPlayers && window.otherPlayers[playerId]) {
                console.log('👋 Joueur déconnecté:', playerId);
                delete window.otherPlayers[playerId];
            }
        });

        window.matchmakingState.listeners.playerPositions = {
            ref: positionsRef,
            eventType: 'multiple',
            handler: positionHandler
        };
    }

    // Gérer les événements de jeu
    handleGameEvent(event) {
        if (window.handleGameEvent) {
            window.handleGameEvent(event);
        }
    }

    // Marquer le joueur comme prêt
    async setPlayerReady(ready) {
        if (!window.matchmakingState.currentMatchId) return;
        
        const matchRef = database.ref(`active_matches/${window.matchmakingState.currentMatchId}`);
        await matchRef.child(`players/${currentUser.uid}/ready`).set(ready);
        
        // Vérifier si tous les joueurs sont prêts
        const snapshot = await matchRef.once('value');
        const matchData = snapshot.val();
        
        if (matchData) {
            const players = Object.values(matchData.players || {});
            const allReady = players.every(player => player.ready);
            const modeConfig = this.gameModes[matchData.mode] || {};
            const minPlayers = Math.min(
                matchData.maxPlayers || players.length,
                Math.max(modeConfig.minPlayers || 2, 2)
            );
            
            if (allReady && players.length >= minPlayers) {
                // Démarrer le match
                await matchRef.update({
                    status: 'in_progress',
                    gameStartTime: firebase.database.ServerValue.TIMESTAMP
                });
            }
        }
    }

    // Quitter le match
    async leaveMatch() {
        if (!window.matchmakingState.currentMatchId) return;
        
        const matchRef = database.ref(`active_matches/${window.matchmakingState.currentMatchId}`);
        await matchRef.child(`players/${currentUser.uid}`).remove();
        
        this.clearCurrentMatchState();
        this.handlePostMatchCleanup();
    }

    async forfeitCurrentMatch(options = {}) {
        const matchId = window.matchmakingState.currentMatchId;
        if (!matchId) return;
        
        if (!database || !database.ref) {
            this.cleanup();
            window.matchmakingState.currentMatchId = null;
            return;
        }

        try {
            const matchRef = database.ref(`active_matches/${matchId}`);
            const sessionRef = database.ref(`game_sessions/${matchId}`);
            
            await matchRef.child(`players/${currentUser.uid}`).remove();
            
            try {
                await sessionRef.child(`players/${currentUser.uid}`).remove();
            } catch (playerRemovalError) {
                console.warn('Suppression joueur session échouée:', playerRemovalError);
            }
            
            if (options.recordEvent !== false) {
                try {
                    await sessionRef.child('events').push({
                        type: 'player_left',
                        playerId: currentUser.uid,
                        reason: options.reason || 'forfeit',
                        timestamp: firebase.database.ServerValue.TIMESTAMP
                    });
                } catch (eventError) {
                    console.warn('Enregistrement événement abandon échoué:', eventError);
                }
            }
            
            const snapshot = await matchRef.once('value');
            const remainingMatch = snapshot.val();
            const remainingPlayers = Object.keys(remainingMatch?.players || {});
            
            if (remainingPlayers.length === 0) {
                await matchRef.remove();
                try {
                    await sessionRef.remove();
                } catch (sessionRemovalError) {
                    console.warn('Suppression session échouée:', sessionRemovalError);
                }
            } else {
                await matchRef.child('lastActivity').set(firebase.database.ServerValue.TIMESTAMP);
            }
        } catch (error) {
            console.error('Erreur lors de l\'abandon du match:', error);
        } finally {
            this.clearCurrentMatchState();
            this.handlePostMatchCleanup();
        }
    }

    async finishCurrentMatch(result = {}) {
        const matchId = window.matchmakingState.currentMatchId;
        if (!matchId || !database || !database.ref) {
            return;
        }

        const attackersScore = result.attackersScore ?? window.game?.attackersScore ?? 0;
        const defendersScore = result.defendersScore ?? window.game?.defendersScore ?? 0;
        const winningTeam = result.winner || (attackersScore === defendersScore ? 'draw' : (attackersScore > defendersScore ? 'attackers' : 'defenders'));
        const reason = result.reason || 'completed';

        try {
            const matchRef = database.ref(`active_matches/${matchId}`);
            await matchRef.update({
                status: 'ended',
                score: { attackers: attackersScore, defenders: defendersScore },
                winningTeam: winningTeam,
                endReason: reason,
                endedAt: firebase.database.ServerValue.TIMESTAMP
            });

            const sessionRef = database.ref(`game_sessions/${matchId}`);
            await sessionRef.update({
                status: 'completed',
                score: { attackers: attackersScore, defenders: defendersScore },
                winningTeam: winningTeam,
                endedAt: firebase.database.ServerValue.TIMESTAMP
            });
        } catch (error) {
            console.error('Erreur finalisation match:', error);
        }
    }

    clearCurrentMatchState() {
        window.matchmakingState.currentMatchId = null;
        window.matchmakingState.selectedMode = null;
        window.matchmakingState.selectedMap = null;
        window.matchmakingState.inQueue = false;
    }

    handlePostMatchCleanup() {
        this.cleanup();
        this.hideAllMatchmakingUI();
        
        if (window.showMainMenu) {
            window.showMainMenu();
        }
    }

    // Quitter la file d'attente
    async leaveQueue(queueId = null) {
        const targetQueueId = queueId || window.matchmakingState.currentQueueId;
        
        if (targetQueueId) {
            const queueRef = database.ref(`matchmaking_queue/${targetQueueId}`);
            await queueRef.remove();
        }
        
        window.matchmakingState.inQueue = false;
        window.matchmakingState.queueStartTime = null;
        window.matchmakingState.currentQueueId = null;
        
        this.cleanup();
        this.hideMatchmakingUI();
        
        console.log('❌ File d\'attente quittée');
    }

    // Nettoyer les listeners et intervalles
    cleanup() {
        // Arrêter les intervalles
        if (this.queueCheckInterval) {
            clearInterval(this.queueCheckInterval);
            this.queueCheckInterval = null;
        }
        
        if (this.matchCheckInterval) {
            clearInterval(this.matchCheckInterval);
            this.matchCheckInterval = null;
        }
        
        Object.values(window.matchmakingState.listeners).forEach(listener => {
            if (listener && listener.ref && listener.handler) {
                listener.ref.off(listener.eventType, listener.handler);
            }
        });
        
        window.matchmakingState.listeners = {};
    }

    // Interface de matchmaking
    showMatchmakingUI(mode, map) {
        this.hideMatchmakingUI();
        
        const matchmakingUI = document.createElement('div');
        matchmakingUI.id = 'matchmaking-ui';
        matchmakingUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            z-index: 1500;
            text-align: center;
            backdrop-filter: blur(10px);
            min-width: 400px;
        `;

        const mapLabel = map ? this.getMapDisplayName(map) : 'Carte aléatoire';

        matchmakingUI.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(0, 212, 255, 0.3); 
                            border-top: 4px solid #00d4ff; border-radius: 50%; 
                            animation: spin 1s linear infinite; margin: 0 auto 20px;">
                </div>
                <h2 style="color: #00d4ff; margin-bottom: 10px;">Recherche de partie</h2>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                    ${this.gameModes[mode].name} • ${mapLabel}
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; 
                        padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-bottom: 5px;">TEMPS D'ATTENTE</div>
                    <div id="queue-time" style="font-size: 24px; font-weight: bold; color: #ffd700;">0:00</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin-bottom: 5px;">STATUT</div>
                    <div id="queue-status" style="font-size: 16px; font-weight: bold; color: #4ade80;">Recherche...</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 10px;">
                    Matchmaking réel avec Firebase
                </div>
                <div style="color: rgba(255, 255, 255, 0.5); font-size: 12px;">
                    Recherche de joueurs en cours...
                </div>
            </div>

            <button onclick="window.MatchmakingSystem.cancelMatchmaking()" style="
                background: rgba(239, 68, 68, 0.2);
                border: 1px solid #ef4444;
                border-radius: 10px;
                color: #ef4444;
                padding: 12px 24px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-times"></i> Annuler
            </button>
        `;

        document.body.appendChild(matchmakingUI);
        this.updateQueueTimeDisplay();
    }

    hideMatchmakingUI() {
        const ui = document.getElementById('matchmaking-ui');
        if (ui) ui.remove();
    }

    hideAllMatchmakingUI() {
        const elements = ['matchmaking-ui', 'match-lobby', 'match-preparation', 'match-results'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
    }

    // Annuler le matchmaking
    async cancelMatchmaking() {
        try {
            await this.leaveQueue();
            console.log('🚫 Matchmaking annulé');
        } catch (error) {
            console.error('Erreur annulation matchmaking:', error);
        }
    }

    // Calculer le MMR d'un joueur
    calculateMMR(playerData) {
        const rank = playerData.rank || 'Fer I';
        const baseMMR = rankSystem[rank]?.mmr || 0;
        
        const stats = playerData.stats || {};
        const gamesPlayed = stats.gamesPlayed || 1;
        const winRate = (stats.wins || 0) / gamesPlayed;
        const kdRatio = (stats.kills || 0) / Math.max(stats.deaths || 1, 1);
        
        const winRateBonus = (winRate - 0.5) * 100;
        const kdBonus = (kdRatio - 1) * 50;
        
        return Math.max(0, baseMMR + winRateBonus + kdBonus);
    }

    // Récupérer les données d'un joueur
    async getPlayerData(playerId) {
        try {
            if (!database || !database.ref) {
                return this.getDefaultPlayerData();
            }
            
            const userRef = database.ref(`users/${playerId}`);
            const snapshot = await userRef.once('value');
            return snapshot.val() || this.getDefaultPlayerData();
        } catch (error) {
            console.error('Erreur récupération données joueur:', error);
            return this.getDefaultPlayerData();
        }
    }

    getDefaultPlayerData() {
        return {
            displayName: currentUser?.displayName || 'Joueur',
            rank: 'Fer I',
            level: 1,
            stats: {}
        };
    }

    normalizeMapName(map) {
        if (!map) return null;
        const value = String(map).toLowerCase();
        switch (value) {
            case 'dust2':
            case 'dust2_complex':
                return 'dust2_complex';
            case 'haven':
            case 'haven_complex':
                return 'haven_complex';
            case 'auto':
                return null;
            default:
                return map;
        }
    }

    getMapDisplayName(mapId) {
        if (!mapId) return 'Aléatoire';
        const normalized = this.normalizeMapName(mapId) || mapId;
        const displayNames = {
            dust2_complex: 'Dust2',
            haven_complex: 'Haven'
        };
        return displayNames[normalized] || normalized;
    }

    // Sélectionner une carte aléatoire
    selectRandomMap() {
        const availableMaps = ['dust2_complex', 'haven_complex'];
        return availableMaps[Math.floor(Math.random() * availableMaps.length)];
    }

    // Mettre à jour l'activité de la file d'attente
    async updateQueueActivity(queueId) {
        try {
            const queueRef = database.ref(`matchmaking_queue/${queueId}`);
            await queueRef.child('lastActivity').set(firebase.database.ServerValue.TIMESTAMP);
        } catch (error) {
            console.error('Erreur mise à jour activité:', error);
        }
    }

    // Gérer le timeout de file d'attente
    async handleQueueTimeout(queueId) {
        console.log('⏰ Timeout de file d\'attente');
        await this.leaveQueue(queueId);
        
        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Timeout de recherche',
                'Aucun match trouvé après 5 minutes. Réessayez.',
                'warning',
                5000
            );
        }
    }

    // Mise à jour du temps d'attente
    updateQueueTimeDisplay() {
        if (!window.matchmakingState.inQueue) return;
        
        const interval = setInterval(() => {
            if (!window.matchmakingState.inQueue) {
                clearInterval(interval);
                return;
            }
            
            const elapsed = Math.floor((Date.now() - window.matchmakingState.queueStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            const display = document.getElementById('queue-time');
            if (display) {
                display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
}

// Créer l'instance globale
window.MatchmakingSystem = new MatchmakingSystem();

// Fonctions globales pour la compatibilité
window.findMatch = window.MatchmakingSystem.findMatch.bind(window.MatchmakingSystem);
window.cancelMatchmaking = window.MatchmakingSystem.cancelMatchmaking.bind(window.MatchmakingSystem);

// Nettoyage automatique des files d'attente inactives
if (database && database.ref) {
    setInterval(async () => {
        try {
            const queueRef = database.ref('matchmaking_queue');
            const snapshot = await queueRef.once('value');
            
            if (snapshot.exists()) {
                const now = Date.now();
                const queue = snapshot.val();
                
                for (const queueId in queue) {
                    const entry = queue[queueId];
                    const timeSinceActivity = now - (entry.lastActivity || entry.createdAt || 0);
                    
                    // Supprimer les entrées inactives depuis plus de 10 minutes
                    if (timeSinceActivity > 600000) {
                        await queueRef.child(queueId).remove();
                        console.log('🧹 Entrée de file d\'attente inactive supprimée:', queueId);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur nettoyage file d\'attente:', error);
        }
    }, 60000); // Vérifier toutes les minutes
}

console.log('🎮 Système de matchmaking RÉEL chargé avec Firebase !');

