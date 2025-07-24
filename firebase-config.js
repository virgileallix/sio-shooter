// Configuration Firebase
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

// Gestion des événements de connection
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log('Utilisateur connecté:', user.email);
        loadUserData();
        showMainMenu();
    } else {
        currentUser = null;
        console.log('Utilisateur déconnecté');
        showAuthScreen();
    }
});

// Fonctions utilitaires Firebase
function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
}

function showMainMenu() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    
    if (currentUser) {
        document.getElementById('current-username').textContent = 
            currentUser.displayName || currentUser.email.split('@')[0];
    }
}

function showGameScreen() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
}

// Chargement des données utilisateur
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (!userData) {
            // Créer un nouveau profil utilisateur
            await userRef.set({
                email: currentUser.email,
                displayName: currentUser.displayName || currentUser.email.split('@')[0],
                rank: 'Fer I',
                level: 1,
                experience: 0,
                money: 800,
                friends: {},
                stats: {
                    kills: 0,
                    deaths: 0,
                    wins: 0,
                    losses: 0,
                    gamesPlayed: 0
                },
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            // Charger les données existantes
            gameState.friends = Object.values(userData.friends || {});
            updateFriendsList();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
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

// Système de matchmaking simple
async function findMatch(mode, map) {
    try {
        const matchmakingRef = database.ref('matchmaking');
        const newMatchRef = matchmakingRef.push();
        
        await newMatchRef.set({
            host: currentUser.uid,
            hostName: currentUser.displayName || currentUser.email.split('@')[0],
            mode: mode,
            map: map,
            players: {
                [currentUser.uid]: {
                    name: currentUser.displayName || currentUser.email.split('@')[0],
                    ready: true
                }
            },
            status: 'waiting',
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

// Gestion des parties en temps réel
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
}

// Mise à jour de la position du joueur
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

// Envoi d'événements de jeu
async function sendGameEvent(matchId, eventType, data) {
    if (!currentUser) return;
    
    try {
        const eventsRef = database.ref(`games/${matchId}/events`);
        await eventsRef.push({
            type: eventType,
            playerId: currentUser.uid,
            playerName: currentUser.displayName || currentUser.email.split('@')[0],
            data: data,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
        console.error('Erreur envoi événement:', error);
    }
}

// Nettoyage des connexions
function cleanupRealtimeListeners() {
    database.ref().off();
}

console.log('Firebase configuré et prêt!');