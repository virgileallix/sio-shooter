// Configuration Firebase avec système de profils

const firebaseConfig = {
    apiKey: "AIzaSyDVR6PulRxYb4BYBwglmy-uw1sc-JMIbzo",
    authDomain: "csweb-428eb.firebaseapp.com",
    databaseURL: "https://csweb-428eb-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "csweb-428eb",
    storageBucket: "csweb-428eb.firebasestorage.app",
    messagingSenderId: "698101872735",
    appId: "1:698101872735:web:0950c951015b8f58a243ea",
    measurementId: "G-V7XP0L7XMM"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

// Services Firebase
const auth = firebase.auth();
const database = firebase.database();

// Configuration du provider Google
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Variables globales
let currentUser = null;
let gameState = {
    selectedMode: 'deathmatch',
    selectedMap: 'dust2',
    inGame: false,
    friends: [],
    weapons: {
        rifles: [
            { name: 'AK-47', damage: 36, fireRate: 600, accuracy: 73, price: 2700 },
            { name: 'M4A4', damage: 33, fireRate: 666, accuracy: 75, price: 3100 },
            { name: 'M4A1-S', damage: 38, fireRate: 600, accuracy: 78, price: 2900 },
            { name: 'Galil AR', damage: 30, fireRate: 666, accuracy: 56, price: 2000 }
        ],
        pistols: [
            { name: 'Glock-18', damage: 28, fireRate: 400, accuracy: 56, price: 200 },
            { name: 'USP-S', damage: 35, fireRate: 400, accuracy: 67, price: 200 },
            { name: 'Desert Eagle', damage: 63, fireRate: 267, accuracy: 51, price: 700 },
            { name: 'P250', damage: 38, fireRate: 400, accuracy: 64, price: 300 }
        ],
        smgs: [
            { name: 'MP9', damage: 26, fireRate: 857, accuracy: 62, price: 1250 },
            { name: 'MAC-10', damage: 29, fireRate: 800, accuracy: 48, price: 1050 },
            { name: 'UMP-45', damage: 35, fireRate: 666, accuracy: 51, price: 1200 },
            { name: 'P90', damage: 26, fireRate: 857, accuracy: 68, price: 2350 }
        ],
        snipers: [
            { name: 'AWP', damage: 115, fireRate: 41, accuracy: 79, price: 4750 },
            { name: 'Scout SSG 08', damage: 88, fireRate: 48, accuracy: 81, price: 1700 },
            { name: 'G3SG1', damage: 80, fireRate: 240, accuracy: 62, price: 5000 },
            { name: 'SCAR-20', damage: 80, fireRate: 240, accuracy: 62, price: 5000 }
        ]
    }
};

// Gestion des événements de connection avec création automatique de profil
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        console.log('Utilisateur connecté:', user.email);
        
        // Charger ou créer le profil utilisateur
        await loadOrCreateUserProfile();
        
        // Initialiser le statut en ligne
        await setUserOnlineStatus();
        
        // Afficher le menu principal
        showMainMenu();
    } else {
        currentUser = null;
        console.log('Utilisateur déconnecté');
        
        // Nettoyer les listeners en temps réel
        cleanupRealtimeListeners();
        
        // Afficher l'écran d'authentification
        showAuthScreen();
    }
});

// Fonctions utilitaires Firebase
function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('profile-modal').classList.add('hidden');
}

function showMainMenu() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('profile-modal').classList.add('hidden');
    
    if (currentUser) {
        // Charger les informations utilisateur dans l'interface
        updateUserInterface();
    }
}

function showGameScreen() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('profile-modal').classList.add('hidden');
}

// Chargement ou création du profil utilisateur
async function loadOrCreateUserProfile() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (!userData) {
            // Créer un nouveau profil utilisateur complet
            const newUserProfile = {
                // Informations de base
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                avatar: 'user',
                status: 'online',
                
                // Progression et niveau
                experience: 0,
                level: 1,
                rank: 'Fer I',
                
                // Statistiques de jeu
                stats: {
                    kills: 0,
                    deaths: 0,
                    wins: 0,
                    losses: 0,
                    gamesPlayed: 0,
                    shotsFired: 0,
                    shotsHit: 0,
                    headshots: 0,
                    playtime: 0, // en minutes
                    aces: 0,
                    winStreak: 0,
                    currentWinStreak: 0,
                    awpKills: 0,
                    clutchesWon: 0,
                    bombsDefused: 0,
                    bombsPlanted: 0
                },
                
                // Paramètres de confidentialité
                privacy: {
                    publicStats: true,
                    showOnline: true,
                    allowFriendRequests: true
                },
                
                // Économie du jeu
                money: 800,
                
                // Store and inventory system
                inventory: {
                    skins: [],
                    cases: [],
                    equippedSkins: {
                        rifles: {},
                        pistols: {},
                        smgs: {},
                        snipers: {},
                        knives: {}
                    },
                    currency: {
                        coins: 1000,
                        vp: 0
                    }
                },
                
                // Métadonnées
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            };
            
            await userRef.set(newUserProfile);
            console.log('Nouveau profil utilisateur créé');
            
        } else {
            // Mettre à jour la dernière connexion
            await userRef.child('lastLogin').set(firebase.database.ServerValue.TIMESTAMP);
            
            // Vérifier et ajouter les nouveaux champs si nécessaire
            await updateUserProfileStructure(userData);
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement/création du profil:', error);
    }
}

// Mise à jour de la structure du profil utilisateur (pour la compatibilité)
async function updateUserProfileStructure(userData) {
    const userRef = database.ref(`users/${currentUser.uid}`);
    const updates = {};
    
    // Ajouter les champs manquants
    if (!userData.privacy) {
        updates['privacy'] = {
            publicStats: true,
            showOnline: true,
            allowFriendRequests: true
        };
    }
    
    if (!userData.inventory) {
        updates['inventory'] = {
            skins: [],
            cases: [],
            equippedSkins: {
                rifles: {},
                pistols: {},
                smgs: {},
                snipers: {},
                knives: {}
            },
            currency: {
                coins: 1000,
                vp: 0
            }
        };
    }
    
    if (!userData.avatar) {
        updates['avatar'] = 'user';
    }
    
    if (!userData.stats) {
        updates['stats'] = {
            kills: 0,
            deaths: 0,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            playtime: 0,
            aces: 0,
            winStreak: 0,
            currentWinStreak: 0,
            awpKills: 0,
            clutchesWon: 0,
            bombsDefused: 0,
            bombsPlanted: 0
        };
    } else {
        // Ajouter les nouvelles statistiques si elles n'existent pas
        const newStats = ['aces', 'winStreak', 'currentWinStreak', 'awpKills', 'clutchesWon', 'bombsDefused', 'bombsPlanted'];
        newStats.forEach(stat => {
            if (userData.stats[stat] === undefined) {
                updates[`stats/${stat}`] = 0;
            }
        });
    }
    
    if (!userData.experience) {
        updates['experience'] = 0;
    }
    
    if (!userData.level) {
        updates['level'] = 1;
    }
    
    if (!userData.rank) {
        updates['rank'] = 'Fer I';
    }
    
    // Appliquer les mises à jour si nécessaire
    if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
        console.log('Structure du profil mise à jour');
    }
}

// Mise à jour de l'interface utilisateur
async function updateUserInterface() {
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            // Mettre à jour le nom d'utilisateur
            const usernameElement = document.getElementById('current-username');
            if (usernameElement) {
                usernameElement.textContent = userData.displayName || 'Joueur';
            }
            
            // Mettre à jour le rang
            const rankElement = document.getElementById('current-user-rank');
            if (rankElement) {
                rankElement.textContent = `Rang: ${userData.rank || 'Fer I'}`;
            }
            
            // Mettre à jour l'avatar
            const avatarElement = document.getElementById('user-avatar-icon');
            if (avatarElement) {
                avatarElement.className = `fas fa-${userData.avatar || 'user'}`;
            }
        }
        
    } catch (error) {
        console.error('Erreur mise à jour interface:', error);
    }
}

// Définir le statut en ligne de l'utilisateur
async function setUserOnlineStatus() {
    if (!currentUser) return;
    
    const statusRef = database.ref(`users/${currentUser.uid}/status`);
    
    try {
        // Définir comme en ligne
        await statusRef.set('online');
        
        // Définir automatiquement hors ligne lors de la déconnexion
        statusRef.onDisconnect().set('offline');
        
        // Gérer les changements de visibilité de la page
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                statusRef.set('away');
            } else {
                statusRef.set('online');
            }
        });
        
    } catch (error) {
        console.error('Erreur définition statut:', error);
    }
}

// Sauvegarde des données utilisateur
async function saveUserData(data) {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        await userRef.update(data);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

// Système de matchmaking simple avec données de profil
async function findMatch(mode, map) {
    try {
        const matchmakingRef = database.ref('matchmaking');
        const newMatchRef = matchmakingRef.push();
        
        // Récupérer les données du joueur pour le matchmaking
        const userRef = database.ref(`users/${currentUser.uid}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();
        
        await newMatchRef.set({
            host: currentUser.uid,
            hostName: userData.displayName || currentUser.email.split('@')[0],
            hostLevel: userData.level || 1,
            hostRank: userData.rank || 'Fer I',
            mode: mode,
            map: map,
            players: {
                [currentUser.uid]: {
                    name: userData.displayName || currentUser.email.split('@')[0],
                    level: userData.level || 1,
                    rank: userData.rank || 'Fer I',
                    avatar: userData.avatar || 'user',
                    ready: true,
                    kills: 0,
                    deaths: 0,
                    score: 0
                }
            },
            status: 'waiting',
            maxPlayers: mode === 'deathmatch' ? 10 : 10,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Écouter les changements de la partie
        newMatchRef.on('value', (snapshot) => {
            const matchData = snapshot.val();
            if (matchData && matchData.status === 'started') {
                startGame(matchData);
            }
        });
        
        return newMatchRef.key;
    } catch (error) {
        console.error('Erreur lors de la recherche de partie:', error);
        return null;
    }
}

// Rejoindre une partie existante
async function joinMatch(matchId) {
    if (!currentUser) return false;
    
    try {
        const matchRef = database.ref(`matchmaking/${matchId}`);
        const snapshot = await matchRef.once('value');
        const matchData = snapshot.val();
        
        if (!matchData || matchData.status !== 'waiting') {
            throw new Error('Partie non disponible');
        }
        
        // Vérifier le nombre de joueurs
        const currentPlayers = Object.keys(matchData.players || {}).length;
        if (currentPlayers >= matchData.maxPlayers) {
            throw new Error('Partie complète');
        }
        
        // Récupérer les données du joueur
        const userRef = database.ref(`users/${currentUser.uid}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();
        
        // Ajouter le joueur à la partie
        await matchRef.child(`players/${currentUser.uid}`).set({
            name: userData.displayName || currentUser.email.split('@')[0],
            level: userData.level || 1,
            rank: userData.rank || 'Fer I',
            avatar: userData.avatar || 'user',
            ready: false,
            kills: 0,
            deaths: 0,
            score: 0,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        return true;
    } catch (error) {
        console.error('Erreur rejoindre partie:', error);
        return false;
    }
}

// Gestion des parties en temps réel avec profils
function setupGameRealtimeListeners(matchId) {
    const gameRef = database.ref(`games/${matchId}`);
    
    // Écouter les mises à jour de position des joueurs
    gameRef.child('players').on('child_changed', (snapshot) => {
        const playerId = snapshot.key;
        const playerData = snapshot.val();
        
        if (playerId !== currentUser.uid) {
            updateOtherPlayerPosition(playerId, playerData);
        }
    });
    
    // Écouter les événements de jeu
    gameRef.child('events').on('child_added', (snapshot) => {
        const event = snapshot.val();
        handleGameEvent(event);
    });
    
    // Écouter les changements de score
    gameRef.child('score').on('value', (snapshot) => {
        const scoreData = snapshot.val();
        if (scoreData) {
            updateGameScore(scoreData);
        }
    });
}

// Mise à jour de la position du joueur avec données de profil
async function updatePlayerPosition(matchId, x, y, angle) {
    if (!currentUser) return;
    
    try {
        const playerRef = database.ref(`games/${matchId}/players/${currentUser.uid}`);
        await playerRef.update({
            x: x,
            y: y,
            angle: angle,
            lastUpdate: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Erreur mise à jour position:', error);
    }
}

// Envoi d'événements de jeu avec profil joueur
async function sendGameEvent(matchId, eventType, data) {
    if (!currentUser) return;
    
    try {
        // Récupérer les informations du joueur
        const userRef = database.ref(`users/${currentUser.uid}`);
        const userSnapshot = await userRef.once('value');
        const userData = userSnapshot.val();
        
        const eventsRef = database.ref(`games/${matchId}/events`);
        await eventsRef.push({
            type: eventType,
            playerId: currentUser.uid,
            playerName: userData.displayName || currentUser.email.split('@')[0],
            playerAvatar: userData.avatar || 'user',
            data: data,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Erreur envoi événement:', error);
    }
}

// Mise à jour des statistiques en fin de partie
async function updateGameStatistics(matchResult) {
    if (!currentUser) return;
    
    try {
        const statsRef = database.ref(`users/${currentUser.uid}/stats`);
        const snapshot = await statsRef.once('value');
        const currentStats = snapshot.val() || {};
        
        // Calculer les nouvelles statistiques
        const updates = {
            kills: (currentStats.kills || 0) + (matchResult.kills || 0),
            deaths: (currentStats.deaths || 0) + (matchResult.deaths || 0),
            shotsFired: (currentStats.shotsFired || 0) + (matchResult.shotsFired || 0),
            shotsHit: (currentStats.shotsHit || 0) + (matchResult.shotsHit || 0),
            headshots: (currentStats.headshots || 0) + (matchResult.headshots || 0),
            gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
            playtime: (currentStats.playtime || 0) + (matchResult.playtime || 0)
        };
        
        // Gérer les victoires/défaites et les séries
        if (matchResult.won) {
            updates.wins = (currentStats.wins || 0) + 1;
            updates.currentWinStreak = (currentStats.currentWinStreak || 0) + 1;
            updates.winStreak = Math.max(currentStats.winStreak || 0, updates.currentWinStreak);
        } else {
            updates.losses = (currentStats.losses || 0) + 1;
            updates.currentWinStreak = 0;
        }
        
        // Autres statistiques spéciales
        if (matchResult.aces) {
            updates.aces = (currentStats.aces || 0) + matchResult.aces;
        }
        
        if (matchResult.awpKills) {
            updates.awpKills = (currentStats.awpKills || 0) + matchResult.awpKills;
        }
        
        if (matchResult.clutchesWon) {
            updates.clutchesWon = (currentStats.clutchesWon || 0) + matchResult.clutchesWon;
        }
        
        if (matchResult.bombsDefused) {
            updates.bombsDefused = (currentStats.bombsDefused || 0) + matchResult.bombsDefused;
        }
        
        if (matchResult.bombsPlanted) {
            updates.bombsPlanted = (currentStats.bombsPlanted || 0) + matchResult.bombsPlanted;
        }
        
        // Calculer l'expérience gagnée
        const baseXP = matchResult.won ? 100 : 50;
        const killXP = (matchResult.kills || 0) * 10;
        const bonusXP = (matchResult.aces || 0) * 50 + (matchResult.clutchesWon || 0) * 25;
        const totalXP = baseXP + killXP + bonusXP;
        
        updates.experience = (currentStats.experience || 0) + totalXP;
        
        // Sauvegarder les statistiques
        await statsRef.update(updates);
        
        // Mettre à jour le niveau et le rang
        await updatePlayerLevelAndRank(updates.experience);
        
        // Ajouter la partie à l'historique
        await addMatchToHistory({
            mode: matchResult.mode,
            map: matchResult.map,
            result: matchResult.won ? 'Victoire' : 'Défaite',
            score: matchResult.score,
            kills: matchResult.kills || 0,
            deaths: matchResult.deaths || 0,
            assists: matchResult.assists || 0,
            playtime: matchResult.playtime || 0
        });
        
        // Vérifier les nouveaux succès
        await checkAndUnlockAchievements(updates);
        
        console.log('Statistiques mises à jour:', updates);
        
    } catch (error) {
        console.error('Erreur mise à jour statistiques:', error);
    }
}

// Mise à jour du niveau et du rang
async function updatePlayerLevelAndRank(experience) {
    if (!currentUser) return;
    
    try {
        // Calculer le nouveau niveau et rang (utilise les fonctions du profil.js)
        const newLevel = calculateLevel(experience);
        const newRank = calculateRank(experience);
        
        // Mettre à jour dans Firebase
        const userRef = database.ref(`users/${currentUser.uid}`);
        await userRef.update({
            level: newLevel,
            rank: newRank,
            experience: experience
        });
        
        // Mettre à jour l'interface
        const rankElement = document.getElementById('current-user-rank');
        if (rankElement) {
            rankElement.textContent = `Rang: ${newRank}`;
        }
        
    } catch (error) {
        console.error('Erreur mise à jour niveau/rang:', error);
    }
}

// Pont pour les anciens déclencheurs de démarrage de partie
function startGame(matchData = {}) {
    try {
        const safeMatchData = { ...matchData };
        
        if (!safeMatchData.id && window.matchmakingState?.currentMatchId) {
            safeMatchData.id = window.matchmakingState.currentMatchId;
        }
        
        if (window.MatchmakingSystem && typeof window.MatchmakingSystem.startGameSession === 'function') {
            window.MatchmakingSystem.startGameSession(safeMatchData);
            return;
        }
        
        // Fallback minimal si le système de matchmaking n'est pas disponible
        console.warn('MatchmakingSystem indisponible, utilisation du fallback startGame');
        if (typeof showGameScreen === 'function') {
            showGameScreen();
        }
        if (typeof initializeGame === 'function') {
            initializeGame();
        }
    } catch (error) {
        console.error('Erreur lors du démarrage de la partie:', error);
    }
}

window.startGame = startGame;

// Nettoyage des connexions en temps réel
function cleanupRealtimeListeners() {
    // Arrêter tous les listeners Firebase
    database.ref().off();
    
    // Nettoyer les références spécifiques si nécessaire
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/friends`).off();
        database.ref(`users/${currentUser.uid}/invitations`).off();
    }
}
