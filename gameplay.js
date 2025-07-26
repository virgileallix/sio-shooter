// Système de gameplay principal avec logique Valorant COMPLÈTE - VERSION CORRIGÉE

// Variables de jeu
let gameCanvas;
let gameContext;
let minimapCanvas;
let minimapContext;
let gameLoop;
let keys = {};
let mouse = { x: 0, y: 0, pressed: false };

// État du joueur avec logique complète
let player = {
    x: 400,
    y: 300,
    angle: 0,
    speed: 3,
    health: 100,
    maxHealth: 100,
    armor: 0,
    maxArmor: 100,
    money: 800,
    weapon: {
        name: 'Classic',
        ammo: 12,
        totalAmmo: 36,
        damage: 26,
        fireRate: 6.75,
        lastShot: 0,
        penetration: 1,
        price: 0,
        range: 500,
        recoil: 0,
        spread: 0.1
    },
    team: 'attackers',
    alive: true,
    kills: 0,
    deaths: 0,
    roundKills: 0,
    equipped: ['Classic'],
    abilities: [],
    crouching: false,
    running: false,
    reloading: false,
    defusing: false,
    planting: false,
    lastHit: 0,
    respawnTime: 0
};

// État du jeu avec logique Valorant complète
let game = {
    mode: 'competitive',
    round: 1,
    maxRounds: 25,
    roundTime: 100,
    buyTime: 30,
    freezeTime: 5,
    attackersScore: 0,
    defendersScore: 0,
    gameStarted: false,
    gamePaused: false,
    currentMap: 'dust2_complex',
    matchId: null,
    matchStartTime: null,
    roundStartTime: null,
    phase: 'freeze', // freeze, buy, active, ended, overtime
    firstHalf: true,
    overtime: false,
    bomb: {
        planted: false,
        defused: false,
        exploded: false,
        site: null,
        timer: 45,
        defuseTime: 7,
        plantTime: 4,
        defusing: false,
        planting: false,
        carrier: null,
        x: 0,
        y: 0
    },
    economy: {
        killReward: 200,
        winReward: 3000,
        lossReward: [1900, 2400, 2900],
        lossStreak: { attackers: 0, defenders: 0 },
        plantReward: 300,
        defuseReward: 300
    },
    roundEvents: [],
    spectatorMode: false,
    spectatorTarget: null
};

// Cartes complexes avec éléments stratégiques
const complexMaps = {
    dust2_complex: {
        name: 'Dust2 Complex',
        size: { width: 1600, height: 1200 },
        background: '#8B7355',
        spawnPoints: {
            attackers: [
                { x: 80, y: 1000, angle: 0 }, { x: 120, y: 1000, angle: 0 },
                { x: 160, y: 1000, angle: 0 }, { x: 80, y: 1040, angle: 0 },
                { x: 120, y: 1040, angle: 0 }
            ],
            defenders: [
                { x: 1400, y: 150, angle: Math.PI }, { x: 1440, y: 150, angle: Math.PI },
                { x: 1480, y: 150, angle: Math.PI }, { x: 1400, y: 190, angle: Math.PI },
                { x: 1440, y: 190, angle: Math.PI }
            ]
        },
        walls: [
            // Murs extérieurs
            { x: 0, y: 0, width: 1600, height: 20, type: 'wall', destructible: false },
            { x: 0, y: 1180, width: 1600, height: 20, type: 'wall', destructible: false },
            { x: 0, y: 0, width: 20, height: 1200, type: 'wall', destructible: false },
            { x: 1580, y: 0, width: 20, height: 1200, type: 'wall', destructible: false },
            
            // Long A (tunnel principal)
            { x: 200, y: 300, width: 600, height: 20, type: 'wall', destructible: false },
            { x: 200, y: 300, width: 20, height: 200, type: 'wall', destructible: false },
            { x: 800, y: 300, width: 20, height: 200, type: 'wall', destructible: false },
            
            // Site A - Structure complexe
            { x: 1000, y: 100, width: 300, height: 20, type: 'wall', destructible: false },
            { x: 1000, y: 100, width: 20, height: 150, type: 'wall', destructible: false },
            { x: 1300, y: 100, width: 20, height: 150, type: 'wall', destructible: false },
            { x: 1000, y: 250, width: 320, height: 20, type: 'wall', destructible: false },
            
            // Plateforme Site A
            { x: 1050, y: 180, width: 200, height: 15, type: 'platform', destructible: false },
            
            // Mid (zone centrale stratégique)
            { x: 400, y: 550, width: 800, height: 20, type: 'wall', destructible: false },
            { x: 400, y: 550, width: 20, height: 100, type: 'wall', destructible: false },
            { x: 1200, y: 550, width: 20, height: 100, type: 'wall', destructible: false },
            
            // Catwalk (passerelle Mid)
            { x: 500, y: 480, width: 600, height: 10, type: 'catwalk', destructible: false },
            
            // Tunnels vers B
            { x: 300, y: 800, width: 400, height: 20, type: 'wall', destructible: false },
            { x: 300, y: 800, width: 20, height: 200, type: 'wall', destructible: false },
            { x: 700, y: 800, width: 20, height: 200, type: 'wall', destructible: false },
            
            // Site B - Layout complexe
            { x: 200, y: 700, width: 400, height: 20, type: 'wall', destructible: false },
            { x: 200, y: 700, width: 20, height: 100, type: 'wall', destructible: false },
            { x: 600, y: 700, width: 20, height: 100, type: 'wall', destructible: false },
            
            // Double doors B
            { x: 350, y: 750, width: 100, height: 15, type: 'door', destructible: true },
            
            // Caisses et obstacles (destructibles)
            { x: 450, y: 400, width: 40, height: 40, type: 'crate', destructible: true, health: 50 },
            { x: 500, y: 400, width: 40, height: 40, type: 'crate', destructible: true, health: 50 },
            { x: 350, y: 600, width: 60, height: 60, type: 'barrel', destructible: true, health: 30 },
            { x: 1100, y: 350, width: 40, height: 40, type: 'crate', destructible: true, health: 50 },
            
            // Murs haute précision pour angles stratégiques
            { x: 900, y: 400, width: 15, height: 100, type: 'pillar', destructible: false },
            { x: 600, y: 350, width: 100, height: 15, type: 'ledge', destructible: false }
        ],
        bombSites: [
            { 
                name: 'A', 
                x: 1100, y: 150, 
                width: 180, height: 120, 
                planted: false,
                difficulty: 'hard'
            },
            { 
                name: 'B', 
                x: 250, y: 750, 
                width: 150, height: 100, 
                planted: false,
                difficulty: 'medium'
            }
        ],
        callouts: {
            'Long A': { x: 500, y: 350, radius: 100 },
            'Short A': { x: 1000, y: 400, radius: 80 },
            'Site A': { x: 1150, y: 200, radius: 120 },
            'Catwalk': { x: 800, y: 480, radius: 150 },
            'Mid': { x: 800, y: 600, radius: 100 },
            'Tunnels': { x: 500, y: 900, radius: 120 },
            'Site B': { x: 350, y: 750, radius: 100 },
            'CT Spawn': { x: 1420, y: 170, radius: 80 },
            'T Spawn': { x: 120, y: 1020, radius: 80 }
        }
    },
    
    haven_complex: {
        name: 'Haven Complex',
        size: { width: 1800, height: 1400 },
        background: '#4A5D6B',
        spawnPoints: {
            attackers: [
                { x: 900, y: 1300, angle: -Math.PI/2 }, { x: 950, y: 1300, angle: -Math.PI/2 },
                { x: 1000, y: 1300, angle: -Math.PI/2 }, { x: 900, y: 1350, angle: -Math.PI/2 },
                { x: 950, y: 1350, angle: -Math.PI/2 }
            ],
            defenders: [
                { x: 300, y: 100, angle: Math.PI/2 }, { x: 350, y: 100, angle: Math.PI/2 },
                { x: 900, y: 100, angle: Math.PI/2 }, { x: 1500, y: 100, angle: Math.PI/2 },
                { x: 1550, y: 100, angle: Math.PI/2 }
            ]
        },
        walls: [
            // Murs extérieurs
            { x: 0, y: 0, width: 1800, height: 20, type: 'wall', destructible: false },
            { x: 0, y: 1380, width: 1800, height: 20, type: 'wall', destructible: false },
            { x: 0, y: 0, width: 20, height: 1400, type: 'wall', destructible: false },
            { x: 1780, y: 0, width: 20, height: 1400, type: 'wall', destructible: false },
            
            // Site A (gauche)
            { x: 150, y: 200, width: 300, height: 20, type: 'wall', destructible: false },
            { x: 150, y: 200, width: 20, height: 200, type: 'wall', destructible: false },
            { x: 450, y: 200, width: 20, height: 200, type: 'wall', destructible: false },
            
            // Site B (centre)
            { x: 700, y: 600, width: 400, height: 20, type: 'wall', destructible: false },
            { x: 700, y: 600, width: 20, height: 200, type: 'wall', destructible: false },
            { x: 1100, y: 600, width: 20, height: 200, type: 'wall', destructible: false },
            
            // Site C (droite)
            { x: 1400, y: 200, width: 300, height: 20, type: 'wall', destructible: false },
            { x: 1400, y: 200, width: 20, height: 200, type: 'wall', destructible: false },
            { x: 1700, y: 200, width: 20, height: 200, type: 'wall', destructible: false },
            
            // Connexions complexes entre sites
            { x: 500, y: 450, width: 150, height: 20, type: 'wall', destructible: false },
            { x: 1150, y: 450, width: 150, height: 20, type: 'wall', destructible: false },
            
            // Zone centrale avec couvertures
            { x: 850, y: 700, width: 100, height: 20, type: 'wall', destructible: false },
            { x: 850, y: 700, width: 20, height: 100, type: 'wall', destructible: false }
        ],
        bombSites: [
            { name: 'A', x: 200, y: 250, width: 200, height: 120, planted: false },
            { name: 'B', x: 750, y: 650, width: 300, height: 120, planted: false },
            { name: 'C', x: 1450, y: 250, width: 200, height: 120, planted: false }
        ],
        callouts: {
            'Site A': { x: 300, y: 310, radius: 100 },
            'Site B': { x: 900, y: 710, radius: 150 },
            'Site C': { x: 1550, y: 310, radius: 100 },
            'Mid': { x: 900, y: 700, radius: 120 },
            'Heaven': { x: 900, y: 500, radius: 80 }
        }
    }
};

// Système d'armes COMPLÈTE avec réalisme
const completeWeapons = {
    pistols: {
        'Classic': { 
            damage: 26, fireRate: 6.75, accuracy: 55, price: 0, ammo: 12, totalAmmo: 36, 
            penetration: 1, range: 300, recoil: 0.1, spread: 0.15, type: 'pistol',
            sound: 'classic_fire', reload: 2.5
        },
        'Shorty': { 
            damage: 12, fireRate: 3.3, accuracy: 35, price: 200, ammo: 2, totalAmmo: 10, 
            penetration: 1, range: 150, recoil: 0.3, spread: 0.4, type: 'shotgun',
            sound: 'shorty_fire', reload: 2.8, pellets: 8
        },
        'Frenzy': { 
            damage: 22, fireRate: 10, accuracy: 45, price: 400, ammo: 13, totalAmmo: 39, 
            penetration: 1, range: 250, recoil: 0.15, spread: 0.2, type: 'pistol',
            sound: 'frenzy_fire', reload: 2.2, auto: true
        },
        'Ghost': { 
            damage: 30, fireRate: 6.75, accuracy: 65, price: 500, ammo: 15, totalAmmo: 45, 
            penetration: 2, range: 400, recoil: 0.08, spread: 0.1, type: 'pistol',
            sound: 'ghost_fire', reload: 2.6, silenced: true
        },
        'Sheriff': { 
            damage: 55, fireRate: 4, accuracy: 75, price: 800, ammo: 6, totalAmmo: 24, 
            penetration: 3, range: 500, recoil: 0.25, spread: 0.08, type: 'pistol',
            sound: 'sheriff_fire', reload: 3.2
        }
    },
    smgs: {
        'Stinger': { 
            damage: 27, fireRate: 16, accuracy: 60, price: 1100, ammo: 20, totalAmmo: 60, 
            penetration: 1, range: 350, recoil: 0.12, spread: 0.18, type: 'smg',
            sound: 'stinger_fire', reload: 2.8, auto: true
        },
        'Spectre': { 
            damage: 26, fireRate: 13.33, accuracy: 65, price: 1600, ammo: 30, totalAmmo: 90, 
            penetration: 2, range: 400, recoil: 0.1, spread: 0.15, type: 'smg',
            sound: 'spectre_fire', reload: 3.1, auto: true, silenced: true
        }
    },
    rifles: {
        'Bulldog': { 
            damage: 35, fireRate: 9.15, accuracy: 70, price: 2050, ammo: 24, totalAmmo: 72, 
            penetration: 2, range: 600, recoil: 0.15, spread: 0.12, type: 'rifle',
            sound: 'bulldog_fire', reload: 3.5, burst: 3
        },
        'Guardian': { 
            damage: 65, fireRate: 6.5, accuracy: 80, price: 2250, ammo: 12, totalAmmo: 36, 
            penetration: 3, range: 800, recoil: 0.2, spread: 0.08, type: 'rifle',
            sound: 'guardian_fire', reload: 3.8, semi: true
        },
        'Phantom': { 
            damage: 39, fireRate: 11, accuracy: 75, price: 2900, ammo: 30, totalAmmo: 90, 
            penetration: 3, range: 650, recoil: 0.12, spread: 0.1, type: 'rifle',
            sound: 'phantom_fire', reload: 3.6, auto: true, silenced: true
        },
        'Vandal': { 
            damage: 40, fireRate: 9.75, accuracy: 73, price: 2900, ammo: 25, totalAmmo: 75, 
            penetration: 3, range: 700, recoil: 0.18, spread: 0.11, type: 'rifle',
            sound: 'vandal_fire', reload: 3.2, auto: true
        }
    },
    snipers: {
        'Marshal': { 
            damage: 101, fireRate: 1.5, accuracy: 85, price: 950, ammo: 5, totalAmmo: 15, 
            penetration: 2, range: 1000, recoil: 0.4, spread: 0.02, type: 'sniper',
            sound: 'marshal_fire', reload: 4.2, scope: true
        },
        'Operator': { 
            damage: 150, fireRate: 0.6, accuracy: 95, price: 4700, ammo: 5, totalAmmo: 15, 
            penetration: 4, range: 1200, recoil: 0.6, spread: 0.01, type: 'sniper',
            sound: 'operator_fire', reload: 5.5, scope: true
        }
    },
    shotguns: {
        'Bucky': { 
            damage: 34, fireRate: 1.1, accuracy: 40, price: 850, ammo: 5, totalAmmo: 15, 
            penetration: 1, range: 200, recoil: 0.35, spread: 0.5, type: 'shotgun',
            sound: 'bucky_fire', reload: 4.8, pellets: 9
        },
        'Judge': { 
            damage: 17, fireRate: 3.5, accuracy: 35, price: 1850, ammo: 7, totalAmmo: 21, 
            penetration: 1, range: 180, recoil: 0.25, spread: 0.45, type: 'shotgun',
            sound: 'judge_fire', reload: 4.2, pellets: 12, auto: true
        }
    },
    utility: {
        'Light Armor': { price: 400, type: 'armor', value: 25 },
        'Heavy Armor': { price: 1000, type: 'armor', value: 50 },
        'Spike': { price: 0, type: 'spike' }
    }
};

// Autres joueurs et données complètes
let otherPlayers = {};
let bullets = [];
let particles = [];
let sounds = [];
let damageIndicators = [];
let scoreboardVisible = false;
let buyMenuVisible = false;
let destructibleObjects = [];

// Initialisation du jeu COMPLÈTE
function initializeGame() {
    console.log('🎮 Initialisation du jeu complet...');
    
    gameCanvas = document.getElementById('game-canvas');
    gameContext = gameCanvas ? gameCanvas.getContext('2d') : null;
    minimapCanvas = document.getElementById('minimap-canvas');
    minimapContext = minimapCanvas ? minimapCanvas.getContext('2d') : null;
    
    if (!gameCanvas || !gameContext) {
        console.error('❌ Canvas de jeu non trouvé');
        return;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    setupGameEventListeners();
    
    // Copier les objets destructibles de la carte
    initializeDestructibleObjects();
    
    // Initialiser selon le mode de jeu
    initializeGameMode();
    
    // Démarrer les systèmes
    startGameLoop();
    startNetworkSync();
    
    console.log('✅ Jeu initialisé - Mode:', game.mode, 'Carte:', game.currentMap);
}

function resizeCanvas() {
    if (gameCanvas) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    }
    if (minimapCanvas) {
        minimapCanvas.width = 150;
        minimapCanvas.height = 150;
    }
}

function setupGameEventListeners() {
    if (!gameCanvas) return;
    
    // Événements clavier
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Événements souris
    gameCanvas.addEventListener('mousedown', handleMouseDown);
    gameCanvas.addEventListener('mouseup', handleMouseUp);
    gameCanvas.addEventListener('mousemove', handleMouseMove);
    
    console.log('🎮 Event listeners configurés');
}

function handleKeyDown(e) {
    keys[e.key.toLowerCase()] = true;
    
    switch(e.key.toLowerCase()) {
        case 'r':
            reloadWeapon();
            break;
        case 'b':
            if (game.phase === 'buy') {
                toggleBuyMenu();
            }
            break;
        case '4':
            if (game.bomb.planted && player.team === 'defenders') {
                defuseBomb();
            } else if (game.bomb.carrier === (currentUser ? currentUser.uid : 'player') && player.team === 'attackers') {
                plantBomb();
            }
            break;
        case 'tab':
            toggleScoreboard(true);
            break;
        case 'escape':
            toggleGameMenu();
            break;
    }
}

function handleKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
    
    if (e.key.toLowerCase() === 'tab') {
        toggleScoreboard(false);
    }
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

function handleMouseMove(e) {
    if (!gameCanvas) return;
    
    const rect = gameCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    // Calculer l'angle de visée
    const centerX = gameCanvas.width / 2;
    const centerY = gameCanvas.height / 2;
    player.angle = Math.atan2(mouse.y - centerY, mouse.x - centerX);
}

function toggleBuyMenu() {
    buyMenuVisible = !buyMenuVisible;
    if (buyMenuVisible) {
        openBuyMenu();
    } else {
        closeBuyMenu();
    }
}

function openBuyMenu() {
    // Implémentation du menu d'achat
    console.log('💰 Menu d\'achat ouvert');
}

function closeBuyMenu() {
    buyMenuVisible = false;
    console.log('💰 Menu d\'achat fermé');
}

function toggleScoreboard(show) {
    scoreboardVisible = show;
    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) {
        scoreboard.classList.toggle('hidden', !show);
    }
}

function toggleGameMenu() {
    const gameMenu = document.getElementById('game-menu-overlay');
    if (gameMenu) {
        gameMenu.classList.toggle('hidden');
        game.gamePaused = !gameMenu.classList.contains('hidden');
    }
}

function resumeGame() {
    const gameMenu = document.getElementById('game-menu-overlay');
    if (gameMenu) {
        gameMenu.classList.add('hidden');
        game.gamePaused = false;
    }
}

function leaveGame() {
    if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
        stopGame();
        if (window.showMainMenu) {
            window.showMainMenu();
        }
    }
}

function initializeDestructibleObjects() {
    const mapData = complexMaps[game.currentMap];
    if (!mapData) return;
    
    destructibleObjects = [];
    mapData.walls.forEach((wall, index) => {
        if (wall.destructible) {
            destructibleObjects.push({
                id: `obj_${index}`,
                x: wall.x,
                y: wall.y,
                width: wall.width,
                height: wall.height,
                type: wall.type,
                health: wall.health || 100,
                maxHealth: wall.health || 100,
                destroyed: false
            });
        }
    });
}

function initializeGameMode() {
    switch(game.mode) {
        case 'duel':
            game.maxRounds = 9;
            game.winCondition = 5;
            break;
        case 'competitive':
            game.maxRounds = 25;
            game.winCondition = 13;
            break;
        case 'deathmatch':
            game.maxRounds = 1;
            game.roundTime = 600;
            game.buyTime = 0;
            player.money = 9000;
            break;
        case 'unrated':
            game.maxRounds = 25;
            game.winCondition = 13;
            break;
    }
    
    spawnPlayer();
    
    if (game.mode !== 'deathmatch') {
        startFreezeTime();
    } else {
        game.phase = 'active';
    }
}

function spawnPlayer() {
    const mapData = complexMaps[game.currentMap];
    if (!mapData) return;
    
    const spawnPoints = mapData.spawnPoints[player.team];
    if (spawnPoints && spawnPoints.length > 0) {
        const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        player.x = spawn.x;
        player.y = spawn.y;
        player.angle = spawn.angle || 0;
        player.alive = true;
        player.health = player.maxHealth;
    }
}

function spawnAllPlayers() {
    spawnPlayer();
    Object.values(otherPlayers).forEach(otherPlayer => {
        const mapData = complexMaps[game.currentMap];
        if (mapData) {
            const spawnPoints = mapData.spawnPoints[otherPlayer.team];
            if (spawnPoints && spawnPoints.length > 0) {
                const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
                otherPlayer.x = spawn.x;
                otherPlayer.y = spawn.y;
                otherPlayer.angle = spawn.angle || 0;
                otherPlayer.alive = true;
            }
        }
    });
}

// Phases de jeu complètes
function startFreezeTime() {
    game.phase = 'freeze';
    game.freezeTime = 5;
    
    showCenterMessage('PRÉPARATION', 'Le round commence dans 5 secondes...', 5000);
    
    setTimeout(() => {
        startBuyPhase();
    }, 5000);
}

function startBuyPhase() {
    game.phase = 'buy';
    game.buyTime = 30;
    game.roundStartTime = Date.now();
    
    showCenterMessage('PHASE D\'ACHAT', 'Appuyez sur B pour acheter', 3000);
    
    // Ouvrir automatiquement le menu d'achat
    if (game.mode !== 'deathmatch') {
        setTimeout(() => openBuyMenu(), 1000);
    }
    
    setTimeout(() => {
        startActivePhase();
    }, 30000);
}

function startActivePhase() {
    game.phase = 'active';
    game.roundTime = game.mode === 'deathmatch' ? 600 : 100;
    closeBuyMenu();
    
    showCenterMessage('COMBAT !', 'Bonne chance !', 2000);
    
    // Assigner la bombe si c'est un mode bombe
    if ((game.mode === 'competitive' || game.mode === 'unrated') && player.team === 'attackers') {
        if (!game.bomb.carrier && Math.random() < 0.4) { // 40% de chance de porter la bombe
            assignBombToPlayer();
        }
    }
    
    // Réinitialiser les stats du round
    player.roundKills = 0;
    Object.values(otherPlayers).forEach(p => p.roundKills = 0);
}

function assignBombToPlayer() {
    game.bomb.carrier = currentUser ? currentUser.uid : 'player';
    console.log('💣 Bombe assignée au joueur');
}

function showCenterMessage(title, subtitle, duration) {
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1000;
        pointer-events: none;
    `;
    
    messageContainer.innerHTML = `
        <h1 style="color: #00d4ff; font-size: 48px; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${title}</h1>
        <p style="color: white; font-size: 18px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${subtitle}</p>
    `;
    
    document.body.appendChild(messageContainer);
    
    setTimeout(() => {
        if (messageContainer.parentNode) {
            messageContainer.remove();
        }
    }, duration);
}

function endRound(reason, winner, details = {}) {
    game.phase = 'ended';
    
    // Enregistrer les événements du round
    game.roundEvents.push({
        type: 'round_end',
        reason: reason,
        winner: winner,
        details: details,
        timestamp: Date.now()
    });
    
    // Calculer les récompenses
    calculateRoundRewards(reason, winner);
    
    // Mettre à jour le score
    if (winner === 'attackers') {
        game.attackersScore++;
        game.economy.lossStreak.defenders++;
        game.economy.lossStreak.attackers = 0;
    } else if (winner === 'defenders') {
        game.defendersScore++;
        game.economy.lossStreak.attackers++;
        game.economy.lossStreak.defenders = 0;
    }
    
    // Afficher le résultat
    showRoundResult(reason, winner, details);
    
    // Vérifier la fin de partie
    if (checkGameEnd()) {
        endMatch();
        return;
    }
    
    // Changement d'équipes à la mi-temps
    if (game.round === 12 && game.mode === 'competitive') {
        switchTeams();
        showCenterMessage('MI-TEMPS', 'Changement d\'équipes !', 3000);
    }
    
    // Préparer le round suivant
    setTimeout(() => {
        game.round++;
        resetRound();
        spawnAllPlayers();
        startFreezeTime();
    }, 5000);
}

function showRoundResult(reason, winner, details) {
    let message = '';
    let submessage = '';
    
    switch(reason) {
        case 'elimination':
            message = winner === 'attackers' ? 'ATTAQUANTS GAGNENT' : 'DÉFENSEURS GAGNENT';
            submessage = 'Équipe adverse éliminée';
            break;
        case 'bomb_exploded':
            message = 'ATTAQUANTS GAGNENT';
            submessage = 'La spike a explosé !';
            break;
        case 'bomb_defused':
            message = 'DÉFENSEURS GAGNENT';
            submessage = 'Spike désamorcée !';
            break;
        case 'time_up':
            message = 'DÉFENSEURS GAGNENT';
            submessage = 'Temps écoulé';
            break;
    }
    
    const color = winner === player.team ? '#4ade80' : '#ef4444';
    showCenterMessage(message, submessage, 4000, color);
}

function checkGameEnd() {
    const winCondition = game.mode === 'duel' ? 5 : 13;
    
    // Victoire normale
    if (game.attackersScore >= winCondition || game.defendersScore >= winCondition) {
        return true;
    }
    
    // Overtime en compétitif
    if (game.mode === 'competitive' && 
        game.attackersScore === 12 && game.defendersScore === 12) {
        startOvertime();
        return false;
    }
    
    return false;
}

function startOvertime() {
    game.overtime = true;
    game.winCondition = 15; // Premier à 15 en overtime
    showCenterMessage('PROLONGATIONS !', 'Premier à 15 rounds', 3000);
}

function switchTeams() {
    // Échanger les équipes
    player.team = player.team === 'attackers' ? 'defenders' : 'attackers';
    Object.values(otherPlayers).forEach(p => {
        p.team = p.team === 'attackers' ? 'defenders' : 'attackers';
    });
}

function resetRound() {
    // Réinitialiser l'état du round
    game.bomb.planted = false;
    game.bomb.defused = false;
    game.bomb.exploded = false;
    game.bomb.carrier = null;
    game.bomb.timer = 45;
    
    // Réinitialiser les joueurs
    player.alive = true;
    player.health = player.maxHealth;
    player.roundKills = 0;
    
    Object.values(otherPlayers).forEach(p => {
        p.alive = true;
        p.roundKills = 0;
    });
}

function calculateRoundRewards(reason, winner) {
    const isWin = winner === player.team;
    let reward = 0;
    
    if (isWin) {
        reward = game.economy.winReward;
        
        // Bonus spéciaux pour victoire
        if (reason === 'bomb_defused' && player.team === 'defenders') {
            reward += game.economy.defuseReward;
        }
        if (reason === 'bomb_exploded' && player.team === 'attackers') {
            reward += game.economy.plantReward;
        }
    } else {
        // Bonus de défaite selon la série
        const lossStreak = game.economy.lossStreak[player.team];
        const lossIndex = Math.min(lossStreak, game.economy.lossReward.length - 1);
        reward = game.economy.lossReward[lossIndex];
    }
    
    // Bonus pour les éliminations
    reward += player.roundKills * game.economy.killReward;
    
    // Bonus pour plantation/désamorçage
    if (game.bomb.planted && game.bomb.carrier === (currentUser ? currentUser.uid : 'player') && player.team === 'attackers') {
        reward += game.economy.plantReward;
    }
    
    player.money = Math.min(player.money + reward, 9000); // Cap à 9000
    
    showMoneyUpdate(reward, isWin);
}

function showMoneyUpdate(reward, isWin) {
    const sign = reward > 0 ? '+' : '';
    const color = isWin ? '#4ade80' : '#ef4444';
    
    console.log(`💰 ${sign}$${reward} (${isWin ? 'Victoire' : 'Défaite'})`);
}

// Système de combat complet
function shoot() {
    if (!player.alive || game.phase !== 'active') return;
    if (player.reloading) return;
    
    const now = Date.now();
    const fireRateMs = 60000 / (player.weapon.fireRate * 60);
    
    if (now - player.weapon.lastShot < fireRateMs) return;
    if (player.weapon.ammo <= 0) {
        playSound('empty_mag');
        return;
    }
    
    player.weapon.lastShot = now;
    player.weapon.ammo--;
    
    // Calculer la précision avec facteurs réalistes
    let accuracy = player.weapon.accuracy / 100;
    
    // Facteurs qui affectent la précision
    if (player.running) accuracy *= 0.4; // Course diminue précision
    if (player.crouching) accuracy *= 1.3; // Accroupi améliore précision
    if (keys['shift'] && !player.running) accuracy *= 1.1; // Marche améliore précision
    
    // Recul et dispersion
    const recoil = player.weapon.recoil * (1 - accuracy);
    const spread = player.weapon.spread * (1 - accuracy);
    
    // Angle final avec dispersion aléatoire
    const finalAngle = player.angle + 
        (Math.random() - 0.5) * spread + 
        (Math.random() - 0.5) * recoil;
    
    // Traitement des armes à plombs (shotguns)
    const pellets = player.weapon.pellets || 1;
    
    for (let i = 0; i < pellets; i++) {
        const pelletAngle = finalAngle + (Math.random() - 0.5) * spread * 2;
        
        // Créer le projectile
        const bullet = {
            x: player.x + Math.cos(player.angle) * 25,
            y: player.y + Math.sin(player.angle) * 25,
            dx: Math.cos(pelletAngle) * 15,
            dy: Math.sin(pelletAngle) * 15,
            damage: player.weapon.damage / pellets,
            penetration: player.weapon.penetration,
            owner: currentUser ? currentUser.uid : 'player',
            traveled: 0,
            maxDistance: player.weapon.range,
            weapon: player.weapon.name,
            type: player.weapon.type,
            silenced: player.weapon.silenced || false
        };
        
        bullets.push(bullet);
    }
    
    // Effets
    createAdvancedMuzzleFlash(player.x, player.y, player.angle);
    playWeaponSound(player.weapon.sound);
    addCameraShake(recoil * 5);
    
    // Envoyer l'événement multijoueur
    if (game.matchId) {
        sendGameEvent(game.matchId, 'shoot', {
            x: player.x,
            y: player.y,
            angle: finalAngle,
            weapon: player.weapon.name,
            pellets: pellets
        });
    }
    
    updateAmmoDisplay();
    
    // Auto-reload si plus de munitions
    if (player.weapon.ammo === 0 && player.weapon.totalAmmo > 0) {
        setTimeout(() => reloadWeapon(), 500);
    }
}

function createAdvancedMuzzleFlash(x, y, angle) {
    // Flash principal
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            dx: Math.cos(angle + (Math.random() - 0.5) * 0.3) * (5 + Math.random() * 8),
            dy: Math.sin(angle + (Math.random() - 0.5) * 0.3) * (5 + Math.random() * 8),
            size: 3 + Math.random() * 4,
            color: `rgb(255, ${220 + Math.random() * 35}, ${Math.random() * 100})`,
            life: 15 + Math.random() * 15,
            maxLife: 15 + Math.random() * 15,
            type: 'muzzle'
        });
    }
}

function addCameraShake(intensity) {
    // Effet de secousse de caméra
    if (gameCanvas) {
        const originalTransform = gameCanvas.style.transform;
        const shakeX = (Math.random() - 0.5) * intensity;
        const shakeY = (Math.random() - 0.5) * intensity;
        
        gameCanvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        
        setTimeout(() => {
            gameCanvas.style.transform = originalTransform;
        }, 100);
    }
}

function updateAmmoDisplay() {
    const ammoElement = document.getElementById('current-ammo');
    const totalAmmoElement = document.getElementById('total-ammo');
    
    if (ammoElement) ammoElement.textContent = player.weapon.ammo;
    if (totalAmmoElement) totalAmmoElement.textContent = player.weapon.totalAmmo;
}

// Rechargement avec animation
function reloadWeapon() {
    if (player.weapon.ammo === findWeaponStats(player.weapon.name).ammo) return;
    if (player.weapon.totalAmmo <= 0) return;
    if (player.reloading) return;
    
    player.reloading = true;
    const reloadTime = (findWeaponStats(player.weapon.name).reload || 3) * 1000;
    
    playSound('reload_' + player.weapon.type);
    showReloadProgress(reloadTime);
    
    setTimeout(() => {
        const weaponStats = findWeaponStats(player.weapon.name);
        const maxAmmo = weaponStats.ammo;
        const ammoNeeded = maxAmmo - player.weapon.ammo;
        const ammoToReload = Math.min(ammoNeeded, player.weapon.totalAmmo);
        
        player.weapon.ammo += ammoToReload;
        player.weapon.totalAmmo -= ammoToReload;
        player.reloading = false;
        
        updateAmmoDisplay();
        playSound('reload_complete');
    }, reloadTime);
}

function findWeaponStats(weaponName) {
    for (const category in completeWeapons) {
        if (completeWeapons[category][weaponName]) {
            return completeWeapons[category][weaponName];
        }
    }
    return { ammo: 30, reload: 3 }; // Valeur par défaut
}

function showReloadProgress(duration) {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        bottom: 150px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        overflow: hidden;
        z-index: 200;
    `;
    
    const progress = document.createElement('div');
    progress.style.cssText = `
        width: 0%;
        height: 100%;
        background: linear-gradient(90deg, #ff4655, #00d4ff);
        border-radius: 4px;
        transition: width ${duration}ms linear;
    `;
    
    progressBar.appendChild(progress);
    document.body.appendChild(progressBar);
    
    setTimeout(() => progress.style.width = '100%', 10);
    
    setTimeout(() => {
        if (progressBar.parentNode) {
            progressBar.remove();
        }
    }, duration);
}

// Gestion de la bombe complète
function plantBomb() {
    if (game.bomb.carrier !== (currentUser ? currentUser.uid : 'player')) return;
    if (player.planting) return;
    
    const currentMapData = complexMaps[game.currentMap];
    const playerInSite = currentMapData.bombSites.find(site => 
        player.x >= site.x && player.x <= site.x + site.width &&
        player.y >= site.y && player.y <= site.y + site.height
    );
    
    if (!playerInSite) {
        showMessage('Vous devez être sur un site pour planter la spike', 'error');
        return;
    }
    
    // Vérifier les ennemis proches
    const nearbyEnemies = checkNearbyEnemies(150);
    if (nearbyEnemies.length > 0) {
        showMessage('Ennemis trop proches pour planter !', 'error');
        return;
    }
    
    // Commencer la plantation
    player.planting = true;
    game.bomb.planting = true;
    
    showPlantProgress();
    playSound('bomb_plant_start');
    
    setTimeout(() => {
        if (player.planting && player.alive) {
            // Plantation réussie
            game.bomb.planted = true;
            game.bomb.site = playerInSite.name;
            game.bomb.carrier = null;
            game.bomb.planting = false;
            game.bomb.x = player.x;
            game.bomb.y = player.y;
            game.bomb.timer = 45;
            player.planting = false;
            
            playerInSite.planted = true;
            
            showMessage(`Spike plantée sur le site ${playerInSite.name} !`, 'success');
            playSound('bomb_planted');
            
            // Démarrer le timer de la bombe
            startBombTimer();
            
            // Envoyer l'événement
            if (game.matchId) {
                sendGameEvent(game.matchId, 'bomb_planted', {
                    site: playerInSite.name,
                    x: game.bomb.x,
                    y: game.bomb.y
                });
            }
        }
    }, 4000);
}

function defuseBomb() {
    if (!game.bomb.planted || player.team !== 'defenders') return;
    if (player.defusing) return;
    
    const distance = Math.sqrt(
        Math.pow(player.x - game.bomb.x, 2) +
        Math.pow(player.y - game.bomb.y, 2)
    );
    
    if (distance > 50) {
        showMessage('Vous devez être près de la spike', 'error');
        return;
    }
    
    // Vérifier les ennemis proches
    const nearbyEnemies = checkNearbyEnemies(200);
    if (nearbyEnemies.length > 0) {
        showMessage('Ennemis trop proches pour désamorcer !', 'error');
        return;
    }
    
    // Commencer le désamorçage
    player.defusing = true;
    game.bomb.defusing = true;
    
    showDefuseProgress();
    playSound('bomb_defuse_start');
    
    setTimeout(() => {
        if (player.defusing && player.alive && game.bomb.planted) {
            // Désamorçage réussi
            game.bomb.defused = true;
            game.bomb.defusing = false;
            player.defusing = false;
            
            showMessage('Spike désamorcée !', 'success');
            playSound('bomb_defused');
            
            endRound('bomb_defused', 'defenders', { defuser: currentUser ? currentUser.uid : 'player' });
        }
    }, 7000);
}

function checkNearbyEnemies(radius) {
    const enemies = [];
    Object.values(otherPlayers).forEach(otherPlayer => {
        if (otherPlayer.team !== player.team && otherPlayer.alive) {
            const distance = Math.sqrt(
                Math.pow(player.x - otherPlayer.x, 2) +
                Math.pow(player.y - otherPlayer.y, 2)
            );
            if (distance <= radius) {
                enemies.push(otherPlayer);
            }
        }
    });
    return enemies;
}

function showPlantProgress() {
    showActionProgress('PLANTATION DE LA SPIKE', 4000, '#ff4655');
}

function showDefuseProgress() {
    showActionProgress('DÉSAMORÇAGE DE LA SPIKE', 7000, '#00d4ff');
}

function showActionProgress(title, duration, color) {
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        z-index: 300;
        min-width: 300px;
    `;
    
    progressContainer.innerHTML = `
        <h3 style="color: ${color}; margin-bottom: 15px;">${title}</h3>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
            <div id="action-progress" style="width: 0%; height: 100%; background: ${color}; border-radius: 4px; transition: width ${duration}ms linear;"></div>
        </div>
        <p style="color: white; margin-top: 10px; font-size: 12px;">Relâchez pour annuler</p>
    `;
    
    document.body.appendChild(progressContainer);
    
    setTimeout(() => {
        document.getElementById('action-progress').style.width = '100%';
    }, 10);
    
    setTimeout(() => {
        if (progressContainer.parentNode) {
            progressContainer.remove();
        }
    }, duration);
    
    window.currentActionProgress = progressContainer;
}

function startBombTimer() {
    const bombTimerInterval = setInterval(() => {
        if (game.bomb.timer <= 0) {
            clearInterval(bombTimerInterval);
            game.bomb.exploded = true;
            endRound('bomb_exploded', 'attackers');
        } else {
            game.bomb.timer -= 0.1;
        }
    }, 100);
}

// Système de sons complet
function playWeaponSound(soundName) {
    const sounds = {
        'classic_fire': { frequency: 400, duration: 0.1 },
        'shorty_fire': { frequency: 200, duration: 0.3, type: 'sawtooth' },
        'sheriff_fire': { frequency: 300, duration: 0.2 },
        'phantom_fire': { frequency: 450, duration: 0.08 },
        'vandal_fire': { frequency: 380, duration: 0.12 },
        'operator_fire': { frequency: 250, duration: 0.4, type: 'square' },
        'reload_pistol': { frequency: 600, duration: 0.1 },
        'reload_rifle': { frequency: 500, duration: 0.15 },
        'empty_mag': { frequency: 800, duration: 0.05 }
    };
    
    const sound = sounds[soundName] || sounds['classic_fire'];
    createTone(sound.frequency, sound.duration, 0.1, sound.type || 'sine');
}

function playSound(soundName) {
    const sounds = {
        'headshot_hit': { frequency: 1000, duration: 0.1 },
        'body_hit': { frequency: 400, duration: 0.08 },
        'bullet_impact_wall': { frequency: 300, duration: 0.05 },
        'bomb_plant_start': { frequency: 200, duration: 2 },
        'bomb_planted': { frequency: 800, duration: 0.5 },
        'bomb_defuse_start': { frequency: 400, duration: 2 },
        'bomb_defused': { frequency: 1200, duration: 1 }
    };
    
    const sound = sounds[soundName];
    if (sound) {
        createTone(sound.frequency, sound.duration, 0.1);
    }
}

function createTone(frequency, duration, volume = 0.1, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.warn('Audio context error:', error);
    }
}

// Boucle de jeu principale améliorée
function startGameLoop() {
    game.gameStarted = true;
    let lastTime = performance.now();
    
    function gameLoopStep(currentTime) {
        if (!game.gamePaused && game.gameStarted) {
            const deltaTime = currentTime - lastTime;
            
            update(deltaTime);
            render();
            
            lastTime = currentTime;
        }
        
        gameLoop = requestAnimationFrame(gameLoopStep);
    }
    
    gameLoop = requestAnimationFrame(gameLoopStep);
}

function startNetworkSync() {
    // Synchronisation réseau basique
    if (game.matchId) {
        console.log('🌐 Synchronisation réseau démarrée');
    }
}

function update(deltaTime) {
    if (!player.alive && game.mode !== 'deathmatch') {
        updateSpectator();
        return;
    }
    
    updatePlayer(deltaTime);
    updateBullets();
    updateParticles();
    updateDamageIndicators();
    updateOtherPlayers();
    updateGameTimers(deltaTime);
    updateUI();
    
    // Vérifications de fin de round
    if (game.phase === 'active') {
        checkRoundEndConditions();
    }
}

function updatePlayer(deltaTime) {
    // Mouvement du joueur
    let dx = 0, dy = 0;
    
    if (keys['w'] || keys['arrowup']) dy -= player.speed;
    if (keys['s'] || keys['arrowdown']) dy += player.speed;
    if (keys['a'] || keys['arrowleft']) dx -= player.speed;
    if (keys['d'] || keys['arrowright']) dx += player.speed;
    
    // Normaliser le mouvement diagonal
    if (dx !== 0 && dy !== 0) {
        const normalizer = Math.sqrt(2) / 2;
        dx *= normalizer;
        dy *= normalizer;
    }
    
    // Appliquer le mouvement avec vérification de collision
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (!checkWallCollision(newX, player.y)) {
        player.x = newX;
    }
    if (!checkWallCollision(player.x, newY)) {
        player.y = newY;
    }
    
    // États du joueur
    player.running = keys['shift'] && (dx !== 0 || dy !== 0);
    player.crouching = keys['control'];
    
    // Synchroniser avec le réseau
    if (game.matchId && (dx !== 0 || dy !== 0)) {
        updatePlayerPosition(game.matchId, player.x, player.y, player.angle);
    }
}

function checkWallCollision(x, y) {
    const mapData = complexMaps[game.currentMap];
    if (!mapData) return false;
    
    for (const wall of mapData.walls) {
        if (x >= wall.x && x <= wall.x + wall.width &&
            y >= wall.y && y <= wall.y + wall.height) {
            return true;
        }
    }
    return false;
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        bullet.traveled += Math.sqrt(bullet.dx * bullet.dx + bullet.dy * bullet.dy);
        
        if (bullet.traveled > bullet.maxDistance) return false;
        
        // Collision avec les murs
        if (checkBulletWallCollision(bullet)) {
            createImpactEffect(bullet.x, bullet.y, 'wall');
            return bullet.penetration-- > 1;
        }
        
        // Collision avec les joueurs
        if (checkBulletPlayerCollision(bullet)) {
            return bullet.penetration-- > 1;
        }
        
        return true;
    });
}

function checkBulletWallCollision(bullet) {
    const mapData = complexMaps[game.currentMap];
    if (!mapData) return false;
    
    for (const wall of mapData.walls) {
        if (bullet.x >= wall.x && bullet.x <= wall.x + wall.width &&
            bullet.y >= wall.y && bullet.y <= wall.y + wall.height) {
            return true;
        }
    }
    return false;
}

function checkBulletPlayerCollision(bullet) {
    // Collision avec les autres joueurs
    for (const playerId in otherPlayers) {
        const otherPlayer = otherPlayers[playerId];
        if (!otherPlayer.alive) continue;
        
        const distance = Math.sqrt(
            Math.pow(bullet.x - otherPlayer.x, 2) + 
            Math.pow(bullet.y - otherPlayer.y, 2)
        );
        
        if (distance < 20) {
            if (bullet.owner === (currentUser ? currentUser.uid : 'player')) {
                handlePlayerHit(playerId, bullet);
            }
            createBloodEffect(bullet.x, bullet.y);
            return true;
        }
    }
    
    // Collision avec le joueur local (tirs ennemis)
    if (bullet.owner !== (currentUser ? currentUser.uid : 'player') && player.alive) {
        const distance = Math.sqrt(
            Math.pow(bullet.x - player.x, 2) + 
            Math.pow(bullet.y - player.y, 2)
        );
        
        if (distance < 20) {
            handlePlayerDamage(bullet.damage, bullet.owner);
            createBloodEffect(bullet.x, bullet.y);
            return true;
        }
    }
    
    return false;
}

function handlePlayerHit(targetPlayerId, bullet) {
    const finalDamage = bullet.damage;
    const isHeadshot = Math.random() < 0.2; // 20% chance de headshot
    const isKill = finalDamage >= 100; // Simulation
    
    if (isKill) {
        player.roundKills++;
        player.kills++;
        
        showKillFeed(
            currentUser?.displayName || 'Vous',
            targetPlayerId,
            bullet.weapon,
            isHeadshot
        );
    }
    
    console.log(`🎯 Hit sur ${targetPlayerId}: ${finalDamage} dégâts`);
}

function handlePlayerDamage(damage, attackerId) {
    player.health -= damage;
    
    if (player.health <= 0) {
        player.alive = false;
        player.deaths++;
        
        console.log(`💀 Vous avez été éliminé par ${attackerId}`);
        
        // Respawn en deathmatch
        if (game.mode === 'deathmatch') {
            setTimeout(() => {
                spawnPlayer();
            }, 3000);
        }
    }
    
    // Mettre à jour l'interface
    const healthElement = document.getElementById('player-health');
    if (healthElement) {
        healthElement.textContent = Math.max(0, player.health);
    }
}

function showKillFeed(killerName, victimName, weapon, isHeadshot) {
    console.log(`🔫 ${killerName} ${isHeadshot ? '(HS)' : ''} → ${victimName} [${weapon}]`);
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

function createImpactEffect(x, y, surfaceType) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            size: 1 + Math.random() * 2,
            color: 'rgb(200, 200, 200)',
            life: 20 + Math.random() * 20,
            maxLife: 20 + Math.random() * 20
        });
    }
}

function updateParticles() {
    particles = particles.filter(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;
        
        if (particle.gravity) {
            particle.dy += particle.gravity;
        }
        
        return particle.life > 0;
    });
}

function updateDamageIndicators() {
    damageIndicators = damageIndicators.filter(indicator => {
        indicator.x += indicator.dx;
        indicator.y += indicator.dy;
        indicator.life--;
        
        return indicator.life > 0;
    });
}

function updateOtherPlayers() {
    // Mise à jour des autres joueurs (réseau)
    Object.values(otherPlayers).forEach(otherPlayer => {
        // Logique de mise à jour des autres joueurs
    });
}

function updateGameTimers(deltaTime) {
    if (game.phase === 'buy' && game.buyTime > 0) {
        game.buyTime -= deltaTime / 1000;
        if (game.buyTime <= 0) {
            startActivePhase();
        }
    }
    
    if (game.phase === 'active' && game.roundTime > 0) {
        game.roundTime -= deltaTime / 1000;
        if (game.roundTime <= 0) {
            const winner = game.bomb.planted ? 'attackers' : 'defenders';
            endRound('time_up', winner);
        }
    }
    
    if (game.bomb.planted && game.bomb.timer > 0) {
        game.bomb.timer -= deltaTime / 1000;
        if (game.bomb.timer <= 0) {
            game.bomb.exploded = true;
            endRound('bomb_exploded', 'attackers');
        }
    }
}

function updateUI() {
    // Mettre à jour les éléments de l'interface
    const roundTimerElement = document.getElementById('round-timer');
    if (roundTimerElement && game.roundTime > 0) {
        const minutes = Math.floor(game.roundTime / 60);
        const seconds = Math.floor(game.roundTime % 60);
        roundTimerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    const attackersScoreElement = document.getElementById('attackers-score');
    const defendersScoreElement = document.getElementById('defenders-score');
    
    if (attackersScoreElement) attackersScoreElement.textContent = game.attackersScore;
    if (defendersScoreElement) defendersScoreElement.textContent = game.defendersScore;
    
    const roundNumberElement = document.getElementById('round-number');
    if (roundNumberElement) roundNumberElement.textContent = `Round ${game.round}`;
    
    const gamePhaseElement = document.getElementById('game-phase');
    if (gamePhaseElement) {
        switch(game.phase) {
            case 'freeze':
                gamePhaseElement.textContent = 'Préparation';
                break;
            case 'buy':
                gamePhaseElement.textContent = 'Phase d\'achat';
                break;
            case 'active':
                gamePhaseElement.textContent = 'Combat';
                break;
            case 'ended':
                gamePhaseElement.textContent = 'Round terminé';
                break;
        }
    }
}

function checkRoundEndConditions() {
    // Vérifier si tous les joueurs d'une équipe sont morts
    const aliveAttackers = Object.values(otherPlayers).filter(p => p.team === 'attackers' && p.alive).length + 
                          (player.team === 'attackers' && player.alive ? 1 : 0);
    const aliveDefenders = Object.values(otherPlayers).filter(p => p.team === 'defenders' && p.alive).length + 
                          (player.team === 'defenders' && player.alive ? 1 : 0);
    
    if (aliveAttackers === 0) {
        endRound('elimination', 'defenders');
    } else if (aliveDefenders === 0) {
        endRound('elimination', 'attackers');
    }
}

function updateSpectator() {
    // Mode spectateur basique
    console.log('👻 Mode spectateur');
}

function render() {
    if (!gameContext) return;
    
    // Effacer le canvas
    gameContext.fillStyle = '#1a1a1a';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Rendu basique de la carte
    renderMap();
    
    // Rendu des joueurs
    renderPlayers();
    
    // Rendu des projectiles
    renderBullets();
    
    // Rendu des particules
    renderParticles();
    
    // Rendu des indicateurs de dégâts
    renderDamageIndicators();
}

function renderMap() {
    const mapData = complexMaps[game.currentMap];
    if (!mapData) return;
    
    // Rendu des murs
    gameContext.fillStyle = '#444444';
    mapData.walls.forEach(wall => {
        gameContext.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Rendu des sites de bombe
    mapData.bombSites.forEach(site => {
        gameContext.fillStyle = game.bomb.site === site.name ? 
            'rgba(255, 70, 85, 0.4)' : 'rgba(255, 70, 85, 0.2)';
        gameContext.fillRect(site.x, site.y, site.width, site.height);
        
        gameContext.strokeStyle = '#ff4655';
        gameContext.lineWidth = 2;
        gameContext.strokeRect(site.x, site.y, site.width, site.height);
    });
}

function renderPlayers() {
    // Rendu du joueur principal
    renderPlayer(player, true);
    
    // Rendu des autres joueurs
    Object.values(otherPlayers).forEach(otherPlayer => {
        if (otherPlayer.alive) {
            renderPlayer(otherPlayer, false);
        }
    });
}

function renderPlayer(playerObj, isCurrentPlayer) {
    if (!playerObj.alive) return;
    
    const teamColor = playerObj.team === 'attackers' ? '#ff4655' : '#00d4ff';
    
    // Corps du joueur
    gameContext.fillStyle = teamColor;
    gameContext.beginPath();
    gameContext.arc(playerObj.x, playerObj.y, 15, 0, Math.PI * 2);
    gameContext.fill();
    
    // Direction de visée
    gameContext.strokeStyle = '#ffffff';
    gameContext.lineWidth = isCurrentPlayer ? 3 : 2;
    gameContext.beginPath();
    gameContext.moveTo(playerObj.x, playerObj.y);
    gameContext.lineTo(
        playerObj.x + Math.cos(playerObj.angle || 0) * 30,
        playerObj.y + Math.sin(playerObj.angle || 0) * 30
    );
    gameContext.stroke();
}

function renderBullets() {
    bullets.forEach(bullet => {
        gameContext.fillStyle = '#ffff00';
        gameContext.beginPath();
        gameContext.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        gameContext.fill();
    });
}

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

function renderDamageIndicators() {
    damageIndicators.forEach(indicator => {
        const alpha = indicator.life / indicator.maxLife;
        gameContext.save();
        gameContext.globalAlpha = alpha;
        gameContext.fillStyle = indicator.isHeadshot ? '#ff0000' : '#ffffff';
        gameContext.font = `${indicator.isHeadshot ? 'bold ' : ''}16px Arial`;
        gameContext.textAlign = 'center';
        gameContext.fillText(`-${indicator.damage}`, indicator.x, indicator.y);
        gameContext.restore();
    });
}

// Fonctions réseau
function updatePlayerPosition(matchId, x, y, angle) {
    if (!currentUser) return;
    
    // Simulation d'envoi de position
    console.log(`📡 Position: ${x}, ${y}, ${angle}`);
}

function sendGameEvent(matchId, eventType, data) {
    if (!currentUser) return;
    
    // Simulation d'envoi d'événement
    console.log(`📡 Event: ${eventType}`, data);
}

function updateOtherPlayerPosition(playerId, playerData) {
    if (otherPlayers[playerId]) {
        otherPlayers[playerId] = { ...otherPlayers[playerId], ...playerData };
    } else {
        otherPlayers[playerId] = playerData;
    }
}

function handleGameEvent(event) {
    console.log('📡 Event reçu:', event);
}

// Fonctions manquantes
function stopGame() {
    console.log('🛑 Arrêt du jeu...');
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    game.gameStarted = false;
    game.gamePaused = true;
    
    // Nettoyer les listeners
    if (window.cleanupRealtimeListeners) {
        window.cleanupRealtimeListeners();
    }
    
    // Sauvegarder les statistiques si nécessaire
    if (window.StatsTracker && window.StatsTracker.sessionStats.gamesPlayed > 0) {
        window.StatsTracker.saveSessionStats();
    }
    
    console.log('✅ Jeu arrêté');
}

function endMatch() {
    console.log('🏁 Fin de match...');
    
    // Calculer le résultat du match
    const matchResult = {
        won: game.attackersScore > game.defendersScore ? player.team === 'attackers' : player.team === 'defenders',
        mode: game.mode,
        map: game.currentMap,
        score: `${game.attackersScore}-${game.defendersScore}`,
        kills: player.roundKills || 0,
        deaths: player.deaths || 0,
        assists: 0, // À implémenter
        playtime: Math.floor((Date.now() - (game.matchStartTime || Date.now())) / 60000)
    };
    
    // Envoyer les statistiques
    if (window.StatsTracker) {
        window.StatsTracker.trackEvent('game_end', matchResult);
    }
    
    // Arrêter le jeu
    stopGame();
    
    // Afficher les résultats
    showMatchResults(matchResult);
    
    // Retourner au menu après un délai
    setTimeout(() => {
        if (window.showMainMenu) {
            window.showMainMenu();
        }
    }, 10000);
    
    console.log('✅ Match terminé');
}

function showMatchResults(result) {
    const resultsContainer = document.createElement('div');
    resultsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        color: white;
    `;
    
    const resultColor = result.won ? '#4ade80' : '#ef4444';
    const resultText = result.won ? 'VICTOIRE' : 'DÉFAITE';
    
    resultsContainer.innerHTML = `
        <div style="text-align: center; max-width: 600px; padding: 40px;">
            <h1 style="font-size: 72px; margin-bottom: 30px; color: ${resultColor};">${resultText}</h1>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 40px;">
                <div style="text-align: center;">
                    <div style="font-size: 36px; font-weight: bold; color: #00d4ff;">${result.kills}</div>
                    <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Éliminations</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 36px; font-weight: bold; color: #ef4444;">${result.deaths}</div>
                    <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Morts</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 36px; font-weight: bold; color: #ffd700;">${result.score}</div>
                    <div style="font-size: 14px; color: rgba(255,255,255,0.7);">Score</div>
                </div>
            </div>
            
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 30px;">
                ${result.mode} sur ${result.map} - ${result.playtime} minutes
            </p>
            
            <button onclick="this.parentElement.parentElement.remove(); window.showMainMenu();" style="
                background: linear-gradient(45deg, #ff4655, #00d4ff);
                border: none;
                border-radius: 10px;
                color: white;
                padding: 15px 30px;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
            ">
                Retour au Menu
            </button>
        </div>
    `;
    
    document.body.appendChild(resultsContainer);
}

function showMessage(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Export des fonctions pour utilisation globale
window.GameEngine = {
    initializeGame,
    startGame: initializeGame,
    stopGame,
    endMatch,
    updateOtherPlayerPosition,
    handleGameEvent,
    complexMaps,
    completeWeapons
};

// Rendre les fonctions globales accessibles
window.resumeGame = resumeGame;
window.leaveGame = leaveGame;

console.log('🎮 Système de gameplay COMPLET chargé avec cartes complexes !');