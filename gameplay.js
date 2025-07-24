// Système de gameplay principal

// Variables de jeu
let gameCanvas;
let gameContext;
let minimapCanvas;
let minimapContext;
let gameLoop;
let keys = {};
let mouse = { x: 0, y: 0, pressed: false };
let camera = { x: 0, y: 0 }; // Décalage de la caméra

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
    matchId: null
};

// Cartes du jeu chargées depuis des fichiers séparés
const maps = window.MAPS || {};

// Autres joueurs
let otherPlayers = {};

// Projectiles
let bullets = [];

// Particules d'effets
let particles = [];

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
    
    // Démarrer la boucle de jeu
    startGameLoop();
    
    console.log('Jeu initialisé');
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
    // Position de la souris dans le monde
    mouse.x = e.clientX - rect.left + camera.x;
    mouse.y = e.clientY - rect.top + camera.y;
    
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
    updateCamera();
    updateBullets();
    updateParticles();
    updateOtherPlayers();
    updateUI();
    
    // Synchronisation multijoueur
    if (game.matchId && currentUser) {
        updatePlayerPosition(game.matchId, player.x, player.y, player.angle);
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
    
    // Maintenir le joueur dans les limites de la carte
    const currentMapData = maps[game.currentMap];
    player.x = Math.max(25, Math.min(currentMapData.width - 25, player.x));
    player.y = Math.max(25, Math.min(currentMapData.height - 25, player.y));
}

// Mise à jour de la caméra pour suivre le joueur
function updateCamera() {
    const mapData = maps[game.currentMap];
    camera.x = player.x - gameCanvas.width / 2;
    camera.y = player.y - gameCanvas.height / 2;

    // Limiter le déplacement de la caméra aux bords de la carte
    camera.x = Math.max(0, Math.min(mapData.width - gameCanvas.width, camera.x));
    camera.y = Math.max(0, Math.min(mapData.height - gameCanvas.height, camera.y));
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

// Tir
function shoot() {
    const now = Date.now();
    const fireRate = 60000 / player.weapon.fireRate; // Conversion en ms
    
    if (now - player.weapon.lastShot < fireRate) return; // Cadence de tir
    if (player.weapon.ammo <= 0) return; // Pas de munitions
    
    player.weapon.lastShot = now;
    player.weapon.ammo--;
    
    // Créer le projectile
    const bullet = {
        x: player.x,
        y: player.y,
        dx: Math.cos(player.angle) * 15,
        dy: Math.sin(player.angle) * 15,
        damage: player.weapon.damage,
        owner: currentUser ? currentUser.uid : 'player',
        traveled: 0,
        maxDistance: 800
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
            weapon: player.weapon.name
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

// Mise à jour des projectiles
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
                hitPlayer(playerId, bullet.damage);
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

// Effets visuels
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

// Mise à jour des particules
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

// Mise à jour des autres joueurs
function updateOtherPlayers() {
    // Les autres joueurs sont mis à jour via Firebase
    // Cette fonction peut gérer l'interpolation et la prédiction
}

// Rendu du jeu
function render() {
    // Effacer le canvas
    gameContext.fillStyle = '#1a1a1a';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Appliquer la translation de caméra
    gameContext.save();
    gameContext.translate(-camera.x, -camera.y);

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

    gameContext.restore();

    // Dessiner la minimap
    renderMinimap();
}

// Rendu de la carte
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

// Rendu du joueur
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

// Rendu des autres joueurs
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

// Rendu des projectiles
function renderBullets() {
    gameContext.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        gameContext.beginPath();
        gameContext.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        gameContext.fill();
    });
}

// Rendu des particules
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

// Rendu de la minimap
function renderMinimap() {
    const currentMapData = maps[game.currentMap];
    const scale = minimapCanvas.width / currentMapData.width;
    
    // Effacer la minimap
    minimapContext.fillStyle = '#000000';
    minimapContext.fillRect(0, 0, 150, 150);
    
    // Dessiner la carte
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
    updateAmmoDisplay();
    updateTimer();
}

function updateAmmoDisplay() {
    document.getElementById('current-ammo').textContent = player.weapon.ammo;
    document.getElementById('total-ammo').textContent = player.weapon.totalAmmo;
    document.getElementById('current-weapon').textContent = player.weapon.name;
}

function updateTimer() {
    const minutes = Math.floor(game.roundTime / 60);
    const seconds = game.roundTime % 60;
    document.getElementById('round-timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Gestion du menu de jeu
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
}

// Gestion des événements multijoueur
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
                player.health -= event.data.damage;
                if (player.health <= 0) {
                    handlePlayerDeath();
                }
            }
            break;
    }
}

function handlePlayerDeath() {
    console.log('Joueur éliminé');
    // TODO: Implémenter la logique de mort
}

// Système audio (simulation)
function playSound(soundName) {
    console.log(`🔊 Son joué: ${soundName}`);
}

// Fonctions utilitaires
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

console.log('Système de gameplay initialisé');