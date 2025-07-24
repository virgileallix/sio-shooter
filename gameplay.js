// Système de gameplay principal avec intégration profils

// Variables de jeu
let gameCanvas;
let gameContext;
let minimapCanvas;
let minimapContext;
let gameLoop;
let keys = {};
let mouse = { x: 0, y: 0, pressed: false };

// État du joueur
let player = {
    x: 400,
    y: 300,
    angle: 0,
    speed: 3,
    health: 100,
    armor: 100,
    money: 800,
    weapon: {
        name: 'AK-47',
        ammo: 30,
        totalAmmo: 90,
        damage: 36,
        fireRate: 600,
        lastShot: 0
    },
    team: 'attackers'
};

// État du jeu
let game = {
    round: 1,
    roundTime: 100, // 1:40 en secondes
    attackersScore: 0,
    defendersScore: 0,
    gameStarted: false,
    gamePaused: false,
    currentMap: 'dust2',
    matchId: null,
    matchStartTime: null,
    roundStartTime: null
};

// Statistiques de session pour le profil
let sessionStats = {
    kills: 0,
    deaths: 0,
    shotsFired: 0,
    shotsHit: 0,
    headshots: 0,
    aces: 0,
    clutchesWon: 0,
    bombsDefused: 0,
    bombsPlanted: 0,
    awpKills: 0,
    assists: 0,
    playtime: 0
};

// Cartes du jeu
const maps = {
    dust2: {
        name: 'Dust2',
        spawnPoints: {
            attackers: [{ x: 100, y: 700 }, { x: 150, y: 700 }, { x: 200, y: 700 }],
            defenders: [{ x: 1000, y: 100 }, { x: 1050, y: 100 }, { x: 1100, y: 100 }]
        },
        walls: [
            // Murs extérieurs
            { x: 0, y: 0, width: 1200, height: 20 },
            { x: 0, y: 780, width: 1200, height: 20 },
            { x: 0, y: 0, width: 20, height: 800 },
            { x: 1180, y: 0, width: 20, height: 800 },
            
            // Structures internes
            { x: 200, y: 200, width: 300, height: 20 },
            { x: 700, y: 200, width: 300, height: 20 },
            { x: 400, y: 300, width: 20, height: 200 },
            { x: 600, y: 300, width: 20, height: 200 },
            { x: 300, y: 550, width: 200, height: 20 },
            { x: 700, y: 550, width: 200, height: 20 }
        ],
        bombSites: [
            { name: 'A', x: 900, y: 200, width: 150, height: 100 },
            { name: 'B', x: 200, y: 600, width: 150, height: 100 }
        ]
    },
    mirage: {
        name: 'Mirage',
        spawnPoints: {
            attackers: [{ x: 100, y: 400 }, { x: 150, y: 400 }, { x: 200, y: 400 }],
            defenders: [{ x: 1000, y: 400 }, { x: 1050, y: 400 }, { x: 1100, y: 400 }]
        },
        walls: [
            { x: 0, y: 0, width: 1200, height: 20 },
            { x: 0, y: 780, width: 1200, height: 20 },
            { x: 0, y: 0, width: 20, height: 800 },
            { x: 1180, y: 0, width: 20, height: 800 },
            
            { x: 250, y: 150, width: 20, height: 200 },
            { x: 930, y: 150, width: 20, height: 200 },
            { x: 250, y: 450, width: 20, height: 200 },
            { x: 930, y: 450, width: 20, height: 200 },
            { x: 500, y: 350, width: 200, height: 100 }
        ],
        bombSites: [
            { name: 'A', x: 850, y: 100, width: 200, height: 150 },
            { name: 'B', x: 150, y: 550, width: 200, height: 150 }
        ]
    }
};

// Autres joueurs
let otherPlayers = {};

// Projectiles
let bullets = [];

// Particules d'effets
let particles = [];

// Variables pour le scoreboard
let scoreboardVisible = false;

// Initialisation du jeu
function initializeGame() {
    gameCanvas = document.getElementById('game-canvas');
    gameContext = gameCanvas.getContext('2d');
    minimapCanvas = document.getElementById('minimap-canvas');
    minimapContext = minimapCanvas.getContext('2d');
    
    // Ajuster la taille du canvas
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Écouteurs d'événements
    setupGameEventListeners();
    
    // Spawn du joueur
    spawnPlayer();
    
    // Initialiser les temps de partie
    game.matchStartTime = Date.now();
    game.roundStartTime = Date.now();
    
    // Démarrer la boucle de jeu
    startGameLoop();
    
    console.log('Jeu initialisé avec intégration profils');
}

// Redimensionnement du canvas
function resizeCanvas() {
    const container = document.getElementById('game-screen');
    gameCanvas.width = container.clientWidth;
    gameCanvas.height = container.clientHeight;
}

// Configuration des contrôles
function setupGameEventListeners() {
    // Contrôles clavier
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Contrôles souris
    gameCanvas.addEventListener('mousemove', handleMouseMove);
    gameCanvas.addEventListener('mousedown', handleMouseDown);
    gameCanvas.addEventListener('mouseup', handleMouseUp);
    gameCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Menu de jeu (Échap)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleGameMenu();
        }
        // Scoreboard (Tab)
        if (e.key === 'Tab') {
            e.preventDefault();
            showScoreboard();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            hideScoreboard();
        }
    });
}

// Gestion des touches
function handleKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    
    // Actions spéciales
    switch(e.key.toLowerCase()) {
        case 'r':
            reloadWeapon();
            break;
        case 'e':
            interact();
            break;
        case 'g':
            dropWeapon();
            break;
        case 'b':
            openBuyMenu();
            break;
    }
}

function handleKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

// Gestion de la souris
function handleMouseMove(e) {
    const rect = gameCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    // Calculer l'angle de visée
    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    player.angle = Math.atan2(dy, dx);
}

function handleMouseDown(e) {
    mouse.pressed = true;
    
    if (e.button === 0) { // Clic gauche
        shoot();
    }
}

function handleMouseUp(e) {
    mouse.pressed = false;
}

// Spawn du joueur
function spawnPlayer() {
    const currentMapData = maps[game.currentMap];
    const spawnPoints = currentMapData.spawnPoints[player.team];
    const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.health = 100;
    player.armor = 100;
    
    // Réinitialiser les statistiques du round si nouvelle partie
    if (game.round === 1) {
        sessionStats = {
            kills: 0,
            deaths: 0,
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            aces: 0,
            clutchesWon: 0,
            bombsDefused: 0,
            bombsPlanted: 0,
            awpKills: 0,
            assists: 0,
            playtime: 0
        };
    }
}

// Boucle de jeu principale
function startGameLoop() {
    game.gameStarted = true;
    gameLoop = setInterval(() => {
        if (!game.gamePaused) {
            update();
            render();
        }
    }, 1000 / 60); // 60 FPS
}

// Mise à jour du jeu
function update() {
    updatePlayer();
    updateBullets();
    updateParticles();
    updateOtherPlayers();
    updateTimer();
    updateUI();
    
    // Synchronisation multijoueur
    if (game.matchId && currentUser) {
        updatePlayerPosition(game.matchId, player.x, player.y, player.angle);
    }
    
    // Mettre à jour le temps de jeu
    if (game.matchStartTime) {
        const currentTime = Date.now();
        const playtimeMinutes = Math.floor((currentTime - game.matchStartTime) / 60000);
        sessionStats.playtime = playtimeMinutes;
    }
}

// Mise à jour du joueur
function updatePlayer() {
    let deltaX = 0;
    let deltaY = 0;
    
    // Mouvement
    if (keys['z'] || keys['w']) deltaY -= player.speed;
    if (keys['s']) deltaY += player.speed;
    if (keys['q'] || keys['a']) deltaX -= player.speed;
    if (keys['d']) deltaX += player.speed;
    
    // Course (Shift)
    const isRunning = keys['shift'];
    const speedMultiplier = isRunning ? 1.5 : 1;
    deltaX *= speedMultiplier;
    deltaY *= speedMultiplier;
    
    // Vérifier les collisions
    const newX = player.x + deltaX;
    const newY = player.y + deltaY;
    
    if (!checkWallCollision(newX, player.y)) {
        player.x = newX;
    }
    if (!checkWallCollision(player.x, newY)) {
        player.y = newY;
    }
    
    // Maintenir le joueur dans les limites
    player.x = Math.max(25, Math.min(gameCanvas.width - 25, player.x));
    player.y = Math.max(25, Math.min(gameCanvas.height - 25, player.y));
}

// Vérification des collisions avec les murs
function checkWallCollision(x, y) {
    const currentMapData = maps[game.currentMap];
    const playerRadius = 15;
    
    for (let wall of currentMapData.walls) {
        if (x + playerRadius > wall.x &&
            x - playerRadius < wall.x + wall.width &&
            y + playerRadius > wall.y &&
            y - playerRadius < wall.y + wall.height) {
            return true;
        }
    }
    return false;
}

// Tir avec statistiques
function shoot() {
    const now = Date.now();
    const fireRate = 60000 / player.weapon.fireRate; // Conversion en ms
    
    if (now - player.weapon.lastShot < fireRate) return; // Cadence de tir
    if (player.weapon.ammo <= 0) return; // Pas de munitions
    
    player.weapon.lastShot = now;
    player.weapon.ammo--;
    
    // Incrémenter les statistiques de tir
    sessionStats.shotsFired++;
    
    // Calculer la précision (avec un peu d'aléatoire pour la démo)
    const accuracy = Math.random();
    const isHit = accuracy > 0.3; // 70% de chance de toucher pour la démo
    
    // Créer le projectile
    const bullet = {
        x: player.x,
        y: player.y,
        dx: Math.cos(player.angle) * 15,
        dy: Math.sin(player.angle) * 15,
        damage: player.weapon.damage,
        owner: currentUser ? currentUser.uid : 'player',
        traveled: 0,
        maxDistance: 800,
        isHit: isHit
    };
    
    bullets.push(bullet);
    
    // Effet de recul
    createMuzzleFlash(player.x, player.y, player.angle);
    
    // Son de tir (simulation)
    playSound('gunshot');
    
    // Envoyer l'événement multijoueur
    if (game.matchId) {
        sendGameEvent(game.matchId, 'shoot', {
            x: player.x,
            y: player.y,
            angle: player.angle,
            weapon: player.weapon.name,
            hit: isHit
        });
    }
    
    updateAmmoDisplay();
}

// Rechargement
function reloadWeapon() {
    if (player.weapon.ammo === 30) return; // Chargeur plein
    if (player.weapon.totalAmmo <= 0) return; // Pas de munitions
    
    const ammoNeeded = 30 - player.weapon.ammo;
    const ammoToReload = Math.min(ammoNeeded, player.weapon.totalAmmo);
    
    player.weapon.ammo += ammoToReload;
    player.weapon.totalAmmo -= ammoToReload;
    
    updateAmmoDisplay();
    playSound('reload');
}

// Mise à jour des projectiles avec statistiques
function updateBullets() {
    bullets = bullets.filter(bullet => {
        // Mouvement
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        bullet.traveled += Math.sqrt(bullet.dx * bullet.dx + bullet.dy * bullet.dy);
        
        // Vérifier la portée maximale
        if (bullet.traveled > bullet.maxDistance) {
            return false;
        }
        
        // Vérifier les collisions avec les murs
        if (checkWallCollision(bullet.x, bullet.y)) {
            createImpactEffect(bullet.x, bullet.y);
            return false;
        }
        
        // Vérifier les collisions avec les joueurs
        for (let playerId in otherPlayers) {
            const otherPlayer = otherPlayers[playerId];
            const distance = Math.sqrt(
                Math.pow(bullet.x - otherPlayer.x, 2) + 
                Math.pow(bullet.y - otherPlayer.y, 2)
            );
            
            if (distance < 20) { // Rayon de collision
                // Si c'est notre projectile qui touche
                if (bullet.owner === (currentUser ? currentUser.uid : 'player')) {
                    handlePlayerHit(playerId, bullet);
                } else {
                    // Un autre joueur nous a touché
                    handlePlayerDamage(bullet.damage);
                }
                
                createBloodEffect(bullet.x, bullet.y);
                return false;
            }
        }
        
        // Sortie de l'écran
        if (bullet.x < 0 || bullet.x > gameCanvas.width || 
            bullet.y < 0 || bullet.y > gameCanvas.height) {
            return false;
        }
        
        return true;
    });
}

// Gestion d'un hit sur un joueur
function handlePlayerHit(targetPlayerId, bullet) {
    // Incrémenter les statistiques
    sessionStats.shotsHit++;
    
    // Vérifier si c'est un headshot (25% de chance pour la démo)
    const isHeadshot = Math.random() < 0.25;
    if (isHeadshot) {
        sessionStats.headshots++;
        bullet.damage *= 2; // Double dégâts pour headshot
    }
    
    // Vérifier si c'est un kill avec l'AWP
    if (player.weapon.name === 'AWP') {
        sessionStats.awpKills++;
    }
    
    // Simuler un kill (pour la démo, 60% de chance)
    const isKill = Math.random() < 0.6;
    if (isKill) {
        handleKill(targetPlayerId, isHeadshot);
    }
    
    // Envoyer l'événement de hit
    if (game.matchId) {
        sendGameEvent(game.matchId, 'hit', {
            targetId: targetPlayerId,
            damage: bullet.damage,
            weapon: player.weapon.name,
            headshot: isHeadshot,
            kill: isKill
        });
    }
}

// Gestion d'un kill
function handleKill(targetPlayerId, isHeadshot) {
    sessionStats.kills++;
    
    // Afficher les informations du kill
    showKillFeed(currentUser.displayName || 'Vous', targetPlayerId, player.weapon.name, isHeadshot);
    
    // Vérifier les succès spéciaux
    checkSpecialKillAchievements();
    
    // Récompense en argent
    player.money += isHeadshot ? 350 : 300;
    
    console.log(`Kill! Total kills: ${sessionStats.kills}`);
}

// Gestion des dégâts reçus
function handlePlayerDamage(damage) {
    // Réduire l'armure puis la vie
    if (player.armor > 0) {
        const armorAbsorption = Math.min(damage * 0.5, player.armor);
        player.armor -= armorAbsorption;
        damage -= armorAbsorption;
    }
    
    player.health -= damage;
    
    if (player.health <= 0) {
        handlePlayerDeath();
    }
}

// Gestion de la mort du joueur
function handlePlayerDeath() {
    sessionStats.deaths++;
    player.health = 0;
    
    console.log('Vous êtes mort!');
    
    // Afficher l'écran de mort
    showDeathScreen();
    
    // Respawn après 5 secondes (pour la démo)
    setTimeout(() => {
        spawnPlayer();
        hideDeathScreen();
    }, 5000);
}

// Vérifier les succès spéciaux
function checkSpecialKillAchievements() {
    // Vérifier si c'est un ACE (5 kills dans le round)
    if (sessionStats.kills % 5 === 0 && sessionStats.kills > 0) {
        sessionStats.aces++;
        showMessage('🏆 ACE! Toute l\'équipe adverse éliminée!', 'success');
    }
    
    // Autres vérifications de succès
    checkAchievementProgress();
}

// Vérifier la progression des succès
async function checkAchievementProgress() {
    if (!currentUser) return;
    
    // Récupérer les statistiques actuelles du joueur
    try {
        const userRef = database.ref(`users/${currentUser.uid}/stats`);
        const snapshot = await userRef.once('value');
        const currentStats = snapshot.val() || {};
        
        // Combiner avec les statistiques de session
        const totalStats = {
            kills: (currentStats.kills || 0) + sessionStats.kills,
            headshots: (currentStats.headshots || 0) + sessionStats.headshots,
            aces: (currentStats.aces || 0) + sessionStats.aces,
            shotsFired: (currentStats.shotsFired || 0) + sessionStats.shotsFired,
            shotsHit: (currentStats.shotsHit || 0) + sessionStats.shotsHit,
            awpKills: (currentStats.awpKills || 0) + sessionStats.awpKills
        };
        
        // Vérifier les seuils de succès
        if (totalStats.kills >= 1 && currentStats.kills === 0) {
            showMessage('🏆 Succès débloqué: Premier sang!', 'success');
        }
        
        if (totalStats.headshots >= 100 && currentStats.headshots < 100) {
            showMessage('🏆 Succès débloqué: Maître du headshot!', 'success');
        }
        
        if (totalStats.awpKills >= 50 && currentStats.awpKills < 50) {
            showMessage('🏆 Succès débloqué: Sniper d\'élite!', 'success');
        }
        
    } catch (error) {
        console.error('Erreur vérification succès:', error);
    }
}

// Mise à jour du timer
function updateTimer() {
    if (game.roundTime > 0) {
        game.roundTime--;
        
        // Fin du round si le temps est écoulé
        if (game.roundTime <= 0) {
            endRound('timeup');
        }
    }
}

// Fin d'un round
function endRound(reason) {
    console.log('Fin du round:', reason);
    
    // Déterminer le gagnant du round
    let roundWinner = null;
    if (reason === 'timeup') {
        roundWinner = 'defenders'; // Les défenseurs gagnent si le temps s'écoule
    }
    
    // Mettre à jour le score
    if (roundWinner === 'attackers') {
        game.attackersScore++;
    } else if (roundWinner === 'defenders') {
        game.defendersScore++;
    }
    
    // Vérifier si la partie est terminée
    if (game.attackersScore >= 13 || game.defendersScore >= 13) {
        endMatch();
        return;
    }
    
    // Préparer le round suivant
    game.round++;
    game.roundTime = 100; // Réinitialiser le timer
    
    // Changer les équipes tous les 15 rounds
    if (game.round === 16) {
        switchTeams();
    }
    
    // Respawn des joueurs
    spawnPlayer();
}

// Changement d'équipes
function switchTeams() {
    player.team = player.team === 'attackers' ? 'defenders' : 'attackers';
    console.log('Changement d\'équipes! Nouvelle équipe:', player.team);
}

// Fin de partie
async function endMatch() {
    const won = (player.team === 'attackers' && game.attackersScore > game.defendersScore) ||
                 (player.team === 'defenders' && game.defendersScore > game.attackersScore);
    
    console.log('Fin de partie!', won ? 'Victoire!' : 'Défaite!');
    
    // Préparer les données de résultat
    const matchResult = {
        mode: selectedGameMode || 'deathmatch',
        map: game.currentMap,
        won: won,
        score: `${game.attackersScore}-${game.defendersScore}`,
        kills: sessionStats.kills,
        deaths: sessionStats.deaths,
        assists: sessionStats.assists,
        shotsFired: sessionStats.shotsFired,
        shotsHit: sessionStats.shotsHit,
        headshots: sessionStats.headshots,
        aces: sessionStats.aces,
        clutchesWon: sessionStats.clutchesWon,
        bombsDefused: sessionStats.bombsDefused,
        bombsPlanted: sessionStats.bombsPlanted,
        awpKills: sessionStats.awpKills,
        playtime: sessionStats.playtime
    };
    
    // Sauvegarder les statistiques
    if (currentUser) {
        try {
            await updateGameStatistics(matchResult);
            console.log('Statistiques sauvegardées avec succès');
        } catch (error) {
            console.error('Erreur sauvegarde statistiques:', error);
        }
    }
    
    // Afficher l'écran de fin de partie
    showMatchEndScreen(matchResult);
    
    // Retourner au menu après quelques secondes
    setTimeout(() => {
        stopGame();
        showMainMenu();
    }, 10000);
}

// Affichage de l'écran de fin de partie
function showMatchEndScreen(result) {
    const overlay = document.createElement('div');
    overlay.className = 'match-end-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="
            background: rgba(15, 20, 25, 0.95);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            max-width: 500px;
        ">
            <h2 style="
                font-size: 48px;
                margin-bottom: 20px;
                color: ${result.won ? '#4ade80' : '#ef4444'};
            ">${result.won ? 'VICTOIRE!' : 'DÉFAITE!'}</h2>
            
            <div style="margin-bottom: 30px;">
                <div style="font-size: 24px; margin-bottom: 10px;">${result.score}</div>
                <div style="color: rgba(255, 255, 255, 0.7);">${result.map} - ${result.mode}</div>
            </div>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            ">
                <div style="text-align: center;">
                    <div style="font-size: 32px; color: #00d4ff; font-weight: bold;">${result.kills}</div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Éliminations</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; color: #ef4444; font-weight: bold;">${result.deaths}</div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Morts</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; color: #fbbf24; font-weight: bold;">${result.assists}</div>
                    <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Assists</div>
                </div>
            </div>
            
            <div style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                Retour au menu dans quelques secondes...
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Affichage du kill feed
function showKillFeed(killer, victim, weapon, headshot) {
    const killFeed = document.getElementById('kill-feed') || createKillFeed();
    
    const killEntry = document.createElement('div');
    killEntry.className = 'kill-entry';
    killEntry.style.cssText = `
        background: rgba(0, 0, 0, 0.8);
        padding: 8px 15px;
        margin-bottom: 5px;
        border-radius: 5px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    killEntry.innerHTML = `
        <span style="color: #00d4ff; font-weight: bold;">${killer}</span>
        <i class="fas fa-crosshairs" style="color: ${headshot ? '#ff4655' : '#ffffff'};"></i>
        <span style="color: #ffffff;">${weapon}</span>
        ${headshot ? '<i class="fas fa-bullseye" style="color: #ff4655;"></i>' : ''}
        <span style="color: #ef4444; font-weight: bold;">${victim}</span>
    `;
    
    killFeed.appendChild(killEntry);
    
    // Supprimer l'entrée après 5 secondes
    setTimeout(() => {
        if (killEntry.parentNode) {
            killEntry.remove();
        }
    }, 5000);
}

// Créer le conteneur du kill feed
function createKillFeed() {
    const killFeed = document.createElement('div');
    killFeed.id = 'kill-feed';
    killFeed.style.cssText = `
        position: fixed;
        top: 20px;
        right: 200px;
        z-index: 150;
        pointer-events: none;
    `;
    document.body.appendChild(killFeed);
    return killFeed;
}

// Afficher/masquer le scoreboard
function showScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) {
        scoreboard.classList.remove('hidden');
        updateScoreboard();
    }
}

function hideScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) {
        scoreboard.classList.add('hidden');
    }
}

// Mettre à jour le scoreboard
function updateScoreboard() {
    const attackersList = document.getElementById('attackers-list');
    const defendersList = document.getElementById('defenders-list');
    
    if (!attackersList || !defendersList) return;
    
    // Effacer les listes
    attackersList.innerHTML = '';
    defendersList.innerHTML = '';
    
    // Ajouter le joueur actuel
    const currentPlayerDiv = createPlayerScoreEntry({
        name: currentUser?.displayName || 'Vous',
        kills: sessionStats.kills,
        deaths: sessionStats.deaths,
        score: sessionStats.kills * 100 - sessionStats.deaths * 50,
        ping: 25
    }, true);
    
    if (player.team === 'attackers') {
        attackersList.appendChild(currentPlayerDiv);
    } else {
        defendersList.appendChild(currentPlayerDiv);
    }
    
    // Ajouter les autres joueurs (simulés pour la démo)
    for (let i = 0; i < 4; i++) {
        const botPlayer = createPlayerScoreEntry({
            name: `Bot${i + 1}`,
            kills: Math.floor(Math.random() * 20),
            deaths: Math.floor(Math.random() * 15),
            score: Math.floor(Math.random() * 2000),
            ping: Math.floor(Math.random() * 100) + 20
        }, false);
        
        if (i % 2 === 0) {
            attackersList.appendChild(botPlayer);
        } else {
            defendersList.appendChild(botPlayer);
        }
    }
}

// Créer une entrée du scoreboard
function createPlayerScoreEntry(playerData, isCurrentPlayer) {
    const entry = document.createElement('div');
    entry.className = `player-entry ${isCurrentPlayer ? 'current-player' : ''}`;
    entry.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 15px;
        background: ${isCurrentPlayer ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
        border-radius: 5px;
        margin-bottom: 5px;
    `;
    
    entry.innerHTML = `
        <span style="font-weight: bold; min-width: 120px;">${playerData.name}</span>
        <span style="min-width: 40px; text-align: center;">${playerData.kills}</span>
        <span style="min-width: 40px; text-align: center;">${playerData.deaths}</span>
        <span style="min-width: 60px; text-align: center;">${playerData.score}</span>
        <span style="min-width: 40px; text-align: center; color: rgba(255, 255, 255, 0.7);">${playerData.ping}ms</span>
    `;
    
    return entry;
}

// Impact sur un joueur
function hitPlayer(playerId, damage) {
    if (game.matchId) {
        sendGameEvent(game.matchId, 'hit', {
            targetId: playerId,
            damage: damage,
            weapon: player.weapon.name
        });
    }
}

// Effets visuels (inchangés)
function createMuzzleFlash(x, y, angle) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            dx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * (3 + Math.random() * 5),
            dy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * (3 + Math.random() * 5),
            size: 2 + Math.random() * 3,
            color: `rgb(255, ${200 + Math.random() * 55}, 0)`,
            life: 10 + Math.random() * 10,
            maxLife: 10 + Math.random() * 10
        });
    }
}

function createImpactEffect(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            size: 1 + Math.random() * 2,
            color: `rgb(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${100 + Math.random() * 100})`,
            life: 20 + Math.random() * 20,
            maxLife: 20 + Math.random() * 20
        });
    }
}

function createBloodEffect(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: 2 + Math.random() * 3,
            color: `rgb(${150 + Math.random() * 50}, 0, 0)`,
            life: 30 + Math.random() * 30,
            maxLife: 30 + Math.random() * 30
        });
    }
}

// Mise à jour des particules (inchangé)
function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dx *= 0.98; // Friction
        particle.dy *= 0.98;
        particle.life--;
        
        return particle.life > 0;
    });
}

// Mise à jour des autres joueurs (inchangé)
function updateOtherPlayers() {
    // Les autres joueurs sont mis à jour via Firebase
    // Cette fonction peut gérer l'interpolation et la prédiction
}

// Rendu du jeu (inchangé)
function render() {
    // Effacer le canvas
    gameContext.fillStyle = '#1a1a1a';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Dessiner la carte
    renderMap();
    
    // Dessiner les autres joueurs
    renderOtherPlayers();
    
    // Dessiner le joueur
    renderPlayer();
    
    // Dessiner les projectiles
    renderBullets();
    
    // Dessiner les particules
    renderParticles();
    
    // Dessiner la minimap
    renderMinimap();
}

// Rendu de la carte (inchangé)
function renderMap() {
    const currentMapData = maps[game.currentMap];
    
    // Dessiner les murs
    gameContext.fillStyle = '#444444';
    currentMapData.walls.forEach(wall => {
        gameContext.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Dessiner les sites de bombes
    currentMapData.bombSites.forEach(site => {
        gameContext.fillStyle = 'rgba(255, 70, 85, 0.3)';
        gameContext.fillRect(site.x, site.y, site.width, site.height);
        
        gameContext.fillStyle = '#ff4655';
        gameContext.font = '20px Arial';
        gameContext.textAlign = 'center';
        gameContext.fillText(
            `Site ${site.name}`, 
            site.x + site.width / 2, 
            site.y + site.height / 2
        );
    });
}

// Rendu du joueur (inchangé)
function renderPlayer() {
    gameContext.save();
    
    // Corps du joueur
    gameContext.fillStyle = player.team === 'attackers' ? '#ff4655' : '#00d4ff';
    gameContext.beginPath();
    gameContext.arc(player.x, player.y, 15, 0, Math.PI * 2);
    gameContext.fill();
    
    // Direction de visée
    gameContext.strokeStyle = '#ffffff';
    gameContext.lineWidth = 3;
    gameContext.beginPath();
    gameContext.moveTo(player.x, player.y);
    gameContext.lineTo(
        player.x + Math.cos(player.angle) * 25,
        player.y + Math.sin(player.angle) * 25
    );
    gameContext.stroke();
    
    // Nom du joueur
    gameContext.fillStyle = '#ffffff';
    gameContext.font = '12px Arial';
    gameContext.textAlign = 'center';
    gameContext.fillText(
        currentUser ? (currentUser.displayName || 'Joueur') : 'Joueur',
        player.x,
        player.y - 25
    );
    
    gameContext.restore();
}

// Rendu des autres joueurs (inchangé)
function renderOtherPlayers() {
    Object.values(otherPlayers).forEach(otherPlayer => {
        gameContext.save();
        
        // Corps
        gameContext.fillStyle = otherPlayer.team === 'attackers' ? '#ff4655' : '#00d4ff';
        gameContext.beginPath();
        gameContext.arc(otherPlayer.x, otherPlayer.y, 15, 0, Math.PI * 2);
        gameContext.fill();
        
        // Direction
        gameContext.strokeStyle = '#ffffff';
        gameContext.lineWidth = 2;
        gameContext.beginPath();
        gameContext.moveTo(otherPlayer.x, otherPlayer.y);
        gameContext.lineTo(
            otherPlayer.x + Math.cos(otherPlayer.angle || 0) * 25,
            otherPlayer.y + Math.sin(otherPlayer.angle || 0) * 25
        );
        gameContext.stroke();
        
        // Nom
        gameContext.fillStyle = '#ffffff';
        gameContext.font = '12px Arial';
        gameContext.textAlign = 'center';
        gameContext.fillText(otherPlayer.name || 'Joueur', otherPlayer.x, otherPlayer.y - 25);
        
        gameContext.restore();
    });
}

// Rendu des projectiles (inchangé)
function renderBullets() {
    gameContext.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        gameContext.beginPath();
        gameContext.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        gameContext.fill();
    });
}

// Rendu des particules (inchangé)
function renderParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        gameContext.save();
        gameContext.globalAlpha = alpha;
        gameContext.fillStyle = particle.color;
        gameContext.beginPath();
        gameContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        gameContext.fill();
        gameContext.restore();
    });
}

// Rendu de la minimap (inchangé)
function renderMinimap() {
    const scale = 0.15;
    
    // Effacer la minimap
    minimapContext.fillStyle = '#000000';
    minimapContext.fillRect(0, 0, 150, 150);
    
    // Dessiner la carte
    const currentMapData = maps[game.currentMap];
    minimapContext.fillStyle = '#444444';
    currentMapData.walls.forEach(wall => {
        minimapContext.fillRect(
            wall.x * scale, 
            wall.y * scale, 
            wall.width * scale, 
            wall.height * scale
        );
    });
    
    // Dessiner les joueurs
    minimapContext.fillStyle = player.team === 'attackers' ? '#ff4655' : '#00d4ff';
    minimapContext.beginPath();
    minimapContext.arc(player.x * scale, player.y * scale, 3, 0, Math.PI * 2);
    minimapContext.fill();
    
    // Autres joueurs
    Object.values(otherPlayers).forEach(otherPlayer => {
        minimapContext.fillStyle = otherPlayer.team === 'attackers' ? '#ff4655' : '#00d4ff';
        minimapContext.beginPath();
        minimapContext.arc(otherPlayer.x * scale, otherPlayer.y * scale, 2, 0, Math.PI * 2);
        minimapContext.fill();
    });
}

// Mise à jour de l'interface
function updateUI() {
    document.getElementById('player-health').textContent = player.health;
    document.getElementById('player-armor').textContent = player.armor;
    document.getElementById('player-money').textContent = player.money;
    document.getElementById('attackers-score').textContent = game.attackersScore;
    document.getElementById('defenders-score').textContent = game.defendersScore;
    updateAmmoDisplay();
    updateTimerDisplay();
}

function updateAmmoDisplay() {
    document.getElementById('current-ammo').textContent = player.weapon.ammo;
    document.getElementById('total-ammo').textContent = player.weapon.totalAmmo;
    document.getElementById('current-weapon').textContent = player.weapon.name;
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.roundTime / 60);
    const seconds = game.roundTime % 60;
    document.getElementById('round-timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Gestion du menu de jeu (inchangé)
function toggleGameMenu() {
    const overlay = document.getElementById('game-menu-overlay');
    game.gamePaused = !game.gamePaused;
    
    if (game.gamePaused) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function resumeGame() {
    game.gamePaused = false;
    document.getElementById('game-menu-overlay').classList.add('hidden');
}

function leaveGame() {
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
        stopGame();
        showMainMenu();
    }
}

function stopGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    game.gameStarted = false;
    cleanupRealtimeListeners();
    
    // Nettoyer les éléments d'interface de jeu
    const killFeed = document.getElementById('kill-feed');
    if (killFeed) {
        killFeed.remove();
    }
    
    const matchEndOverlay = document.querySelector('.match-end-overlay');
    if (matchEndOverlay) {
        matchEndOverlay.remove();
    }
}

// Écrans de mort
function showDeathScreen() {
    // TODO: Implémenter l'écran de mort
    console.log('Écran de mort affiché');
}

function hideDeathScreen() {
    // TODO: Cacher l'écran de mort
    console.log('Écran de mort caché');
}

// Gestion des événements multijoueur (inchangés)
function updateOtherPlayerPosition(playerId, playerData) {
    otherPlayers[playerId] = {
        ...otherPlayers[playerId],
        x: playerData.x,
        y: playerData.y,
        angle: playerData.angle,
        lastUpdate: Date.now()
    };
}

function handleGameEvent(event) {
    switch(event.type) {
        case 'shoot':
            // Créer un effet visuel pour le tir d'un autre joueur
            createMuzzleFlash(event.data.x, event.data.y, event.data.angle);
            playSound('gunshot');
            break;
            
        case 'hit':
            if (event.data.targetId === currentUser.uid) {
                // Le joueur a été touché
                handlePlayerDamage(event.data.damage);
            }
            break;
    }
}

// Système audio (simulation)
function playSound(soundName) {
    console.log(`🔊 Son joué: ${soundName}`);
}

// Fonctions utilitaires (inchangées)
function interact() {
    console.log('Interaction');
}

function dropWeapon() {
    console.log('Arme jetée');
}

function openBuyMenu() {
    console.log('Menu d\'achat ouvert');
}

function showSettings() {
    console.log('Paramètres');
}
