// Système de matchmaking RÉEL avec Firebase - Pas de simulation

// Configuration des modes de jeu (exportée globalement)
window.gameModes = {
    duel: {
        name: 'Duel',
        description: '1v1 - Premier à 5 rounds',
        maxPlayers: 2,
        maxRounds: 9,
        winCondition: 5,
        economy: true,
        ranked: true,
        teamSize: 1
    },
    competitive: {
        name: 'Compétitif',
        description: '5v5 - Premier à 13 rounds',
        maxPlayers: 10,
        maxRounds: 25,
        winCondition: 13,
        economy: true,
        ranked: true,
        teamSize: 5
    },
    deathmatch: {
        name: 'Deathmatch',
        description: 'Combat libre - 10 minutes',
        maxPlayers: 14,
        maxRounds: 1,
        winCondition: 50,
        economy: false,
        ranked: false,
        teamSize: 0
    },
    unrated: {
        name: 'Non classé',
        description: '5v5 - Mode casual',
        maxPlayers: 10,
        maxRounds: 25,
        winCondition: 13,
        economy: true,
        ranked: false,
        teamSize: 5
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

// État du matchmaking (global)
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
            // Récupérer les données du joueur
            const playerData = await this.getPlayerData(currentUser.uid);
            
            // Créer l'entrée dans la file d'attente
            const queueId = await this.createQueueEntry(mode, map, playerData, options);
            
            // Afficher l'interface de matchmaking
            this.showMatchmakingUI(mode, map);
            
            // Démarrer la recherche
            await this.startQueueSearch(queueId, mode, playerData);
            
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
            map: map,
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
        window.matchmakingState.selectedMap = map;
        window.matchmakingState.currentQueueId = newQueueRef.key;
        
        console.log('✅ Entrée file d\'attente créée:', newQueueRef.key);
        return newQueueRef.key;
    }

    // Démarrer la recherche active de matchs
    async startQueueSearch(queueId, mode, playerData) {
        // Rechercher immédiatement
        await this.searchForExistingMatches(queueId, mode, playerData);
        
        // Configurer les listeners
        this.setupQueueListeners(queueId);
        
        // Recherche périodique
        this.queueCheckInterval = setInterval(async () => {
            if (window.matchmakingState.inQueue) {
                await this.searchForExistingMatches(queueId, mode, playerData);
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
    async searchForExistingMatches(queueId, mode, playerData) {
        try {
            // Rechercher des matchs en attente
            const matchesRef = database.ref('active_matches');
            const snapshot = await matchesRef.orderByChild('status').equalTo('waiting').once('value');
            
            if (snapshot.exists()) {
                const matches = snapshot.val();
                
                for (const matchId in matches) {
                    const match = matches[matchId];
                    
                    // Vérifier la compatibilité
                    if (await this.isMatchCompatible(match, mode, playerData)) {
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
    async isMatchCompatible(match, mode, playerData) {
        // Vérifier le mode de jeu
        if (match.mode !== mode) return false;
        
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
                map: window.matchmakingState.selectedMap || this.selectRandomMap(),
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
                        ready: true, // Le créateur est automatiquement prêt
                        connected: true,
                        joinedAt: firebase.database.ServerValue.TIMESTAMP
                    }
                },
                settings: {
                    economy: this.gameModes[mode].economy,
                    ranked: this.gameModes[mode].ranked,
                    maxRounds: this.gameModes[mode].maxRounds,
                    winCondition: this.gameModes[mode].winCondition
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
    assignTeam(match, mode) {
        if (mode === 'deathmatch') return null;
        
        const players = match.players || {};
        let attackersCount = 0;
        let defendersCount = 0;
        
        Object.values(players).forEach(player => {
            if (player.team === 'attackers') attackersCount++;
            if (player.team === 'defenders') defendersCount++;
        });
        
        // Assigner à l'équipe avec le moins de joueurs
        return attackersCount <= defendersCount ? 'attackers' : 'defenders';
    }

    // Configurer les listeners de file d'attente
    setupQueueListeners(queueId) {
        // Écouter les changements de statut
        const queueRef = database.ref(`matchmaking_queue/${queueId}`);
        
        window.matchmakingState.listeners.queueStatus = queueRef.on('value', (snapshot) => {
            const queueData = snapshot.val();
            if (!queueData) {
                // File d'attente supprimée (match trouvé ou timeout)
                return;
            }
            
            if (queueData.status === 'match_found') {
                this.handleMatchFound(queueData.matchId);
            }
        });
        
        // Nettoyer si le joueur se déconnecte
        queueRef.onDisconnect().remove();
    }

    // Configurer les listeners de match
    setupMatchListeners(matchId) {
        const matchRef = database.ref(`active_matches/${matchId}`);
        
        // Écouter les changements de statut du match
        window.matchmakingState.listeners.matchStatus = matchRef.on('value', (snapshot) => {
            const matchData = snapshot.val();
            if (!matchData) {
                console.log('Match supprimé');
                return;
            }
            
            this.handleMatchUpdate(matchData);
        });
        
        // Écouter les nouveaux joueurs
        window.matchmakingState.listeners.players = matchRef.child('players').on('child_added', (snapshot) => {
            const playerId = snapshot.key;
            const playerData = snapshot.val();
            
            if (playerId !== currentUser.uid) {
                this.handlePlayerJoined(playerId, playerData);
            }
        });
        
        // Écouter les joueurs qui partent
        window.matchmakingState.listeners.playersLeft = matchRef.child('players').on('child_removed', (snapshot) => {
            const playerId = snapshot.key;
            this.handlePlayerLeft(playerId);
        });
    }

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
                        <p style="font-size: 18px;">${matchData.map}</p>
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
        
        // Configurer les données du jeu
        if (window.game && window.player) {
            window.game.mode = matchData.mode;
            window.game.currentMap = matchData.map;
            window.game.matchId = matchData.id;
            
            // Assigner l'équipe du joueur
            const playerData = matchData.players[currentUser.uid];
            if (playerData) {
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
        this.setupGameSync(matchData.id);
    }

    // Configurer la synchronisation de jeu en temps réel
    setupGameSync(matchId) {
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
        
        // Écouter les événements de jeu
        window.matchmakingState.listeners.gameEvents = gameRef.child('events').on('child_added', (snapshot) => {
            const event = snapshot.val();
            if (event.playerId !== currentUser.uid) {
                this.handleGameEvent(event);
            }
        });
        
        // Écouter les positions des joueurs
        window.matchmakingState.listeners.playerPositions = gameRef.child('players').on('child_changed', (snapshot) => {
            const playerId = snapshot.key;
            const playerData = snapshot.val();
            
            if (playerId !== currentUser.uid && window.updateOtherPlayerPosition) {
                window.updateOtherPlayerPosition(playerId, playerData);
            }
        });
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
            
            if (allReady && players.length >= matchData.maxPlayers) {
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
        
        // Arrêter les listeners Firebase
        Object.values(window.matchmakingState.listeners).forEach(listener => {
            if (typeof listener === 'function') {
                database.ref().off('value', listener);
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

        matchmakingUI.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="width: 60px; height: 60px; border: 4px solid rgba(0, 212, 255, 0.3); 
                            border-top: 4px solid #00d4ff; border-radius: 50%; 
                            animation: spin 1s linear infinite; margin: 0 auto 20px;">
                </div>
                <h2 style="color: #00d4ff; margin-bottom: 10px;">Recherche de partie</h2>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                    ${this.gameModes[mode].name} ${map ? `sur ${map}` : ''}
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
        const elements = ['matchmaking-ui', 'match-lobby', 'match-preparation'];
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