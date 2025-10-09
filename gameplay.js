// ========================================
// GAMEPLAY.JS - SYSTÈME AVANCÉ COMPLET
// Top-down shooter 2D inspiré de Valorant et surviv.io
// ========================================

// ========================================
// VARIABLES GLOBALES
// ========================================

window.keys = {};
window.mouse = { x: 0, y: 0, pressed: false, worldX: 0, worldY: 0 };
let gameCanvas, gameContext;
let minimapCanvas = null;
let minimapContext = null;
let minimapScale = 1;
let minimapOffset = { x: 0, y: 0 };
let minimapCurrentMap = null;
let minimapNameElement = null;
let gameLoop = null;
let lastTime = 0;
let deltaTime = 0;

// ========================================
// CONFIGURATION DES ARMES
// ========================================

const WEAPONS = {
    classic: {
        name: 'Classic',
        type: 'pistol',
        damage: 26,
        fireRate: 400,
        ammo: 12,
        maxAmmo: 12,
        totalAmmo: 100,
        reloadTime: 1.5,
        bulletSpeed: 20,
        spread: 0.05,
        cameraRecoil: 0.35,
        recoilStep: 0.05,
        recoilRecovery: 3.2,
        maxRecoil: 0.5,
        penetration: 0,
        bulletSize: 3
    },
    phantom: {
        name: 'Phantom',
        type: 'rifle',
        damage: 39,
        fireRate: 100,
        ammo: 30,
        maxAmmo: 30,
        totalAmmo: 120,
        reloadTime: 2.5,
        bulletSpeed: 25,
        spread: 0.03,
        cameraRecoil: 0.55,
        recoilStep: 0.07,
        recoilRecovery: 2.6,
        maxRecoil: 0.9,
        penetration: 1,
        bulletSize: 4
    },
    vandal: {
        name: 'Vandal',
        type: 'rifle',
        damage: 40,
        fireRate: 96,
        ammo: 25,
        maxAmmo: 25,
        totalAmmo: 100,
        reloadTime: 2.5,
        bulletSpeed: 30,
        spread: 0.04,
        cameraRecoil: 0.6,
        recoilStep: 0.08,
        recoilRecovery: 2.4,
        maxRecoil: 1,
        penetration: 1,
        bulletSize: 4
    },
    operator: {
        name: 'Operator',
        type: 'sniper',
        damage: 150,
        fireRate: 600,
        ammo: 5,
        maxAmmo: 5,
        totalAmmo: 25,
        reloadTime: 3.7,
        bulletSpeed: 40,
        spread: 0,
        cameraRecoil: 0.75,
        recoilStep: 0.02,
        recoilRecovery: 3.6,
        maxRecoil: 0.4,
        penetration: 3,
        bulletSize: 5
    },
    spectre: {
        name: 'Spectre',
        type: 'smg',
        damage: 26,
        fireRate: 75,
        ammo: 30,
        maxAmmo: 30,
        totalAmmo: 150,
        reloadTime: 2.25,
        bulletSpeed: 18,
        spread: 0.06,
        cameraRecoil: 0.5,
        recoilStep: 0.06,
        recoilRecovery: 2.8,
        maxRecoil: 0.8,
        penetration: 0,
        bulletSize: 3
    },
    sheriff: {
        name: 'Sheriff',
        type: 'pistol',
        damage: 55,
        fireRate: 266,
        ammo: 6,
        maxAmmo: 6,
        totalAmmo: 36,
        reloadTime: 2.25,
        bulletSpeed: 25,
        spread: 0.02,
        cameraRecoil: 0.45,
        recoilStep: 0.04,
        recoilRecovery: 3,
        maxRecoil: 0.6,
        penetration: 2,
        bulletSize: 4
    }
};

const BOMB_SETTINGS = {
    plantTime: 3.5,
    defuseTime: 7,
    detonationTime: 40,
    pickupRadius: 45
};

const BOMB_MODES = new Set(['competitive', 'unrated', 'attack_defense']);

const MINIMAP_SETTINGS = {
    background: '#11161f',
    border: 'rgba(255, 255, 255, 0.15)',
    wall: 'rgba(255, 255, 255, 0.15)',
    bombSiteActive: 'rgba(255, 70, 85, 0.35)',
    bombSite: 'rgba(255, 70, 85, 0.2)',
    player: '#00d4ff',
    ally: '#4ade80',
    enemy: '#ff4655',
    bomb: '#ffd166'
};

const HUD_DEFAULT_ABILITY_ICON = (typeof window !== 'undefined' && window.DEFAULT_ABILITY_ICON)
    ? window.DEFAULT_ABILITY_ICON
    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' ry='12' fill='%23242a3a'/%3E%3Ctext x='32' y='36' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='30' fill='%23ffffff'%3E%3F%3C/text%3E%3C/svg%3E";

// ========================================
// TYPES D'OBJETS DESTRUCTIBLES
// ========================================

const SPRITE_PATHS = {
    wood_crate: 'assets/crate_wood.svg',
    light_cover: 'assets/crate_light.svg'
};

const objectSprites = {};
let objectSpritesLoaded = false;

const OBJECT_TYPES = {
    wood_crate: {
        name: 'Caisse en bois',
        health: 80,
        maxHealth: 80,
        penetrable: true,
        damageReduction: 0.4,
        destructible: true,
        color: '#8B4513',
        width: 40,
        height: 40
    },
    light_cover: {
        name: 'Caisse légère',
        health: 60,
        maxHealth: 60,
        penetrable: true,
        damageReduction: 0.45,
        destructible: true,
        color: '#a26c45',
        width: 55,
        height: 30
    },
    metal_crate: {
        name: 'Caisse métallique',
        health: 200,
        maxHealth: 200,
        penetrable: false,
        damageReduction: 0,
        destructible: true,
        color: '#555555',
        width: 40,
        height: 40
    },
    concrete_wall: {
        name: 'Mur en béton',
        health: Infinity,
        maxHealth: Infinity,
        penetrable: false,
        damageReduction: 0,
        destructible: false,
        color: '#333333',
        width: 20,
        height: 100
    },
    wood_door: {
        name: 'Porte en bois',
        health: 100,
        maxHealth: 100,
        penetrable: true,
        damageReduction: 0.3,
        destructible: true,
        color: '#654321',
        width: 20,
        height: 80,
        canOpen: true,
        isOpen: false
    },
    barrel: {
        name: 'Baril explosif',
        health: 50,
        maxHealth: 50,
        penetrable: true,
        damageReduction: 0.2,
        destructible: true,
        explosive: true,
        explosionRadius: 100,
        explosionDamage: 80,
        color: '#8B0000',
        width: 35,
        height: 35
    },
    spawn_barrier: {
        name: 'Barrière de spawn',
        health: Infinity,
        maxHealth: Infinity,
        penetrable: false,
        damageReduction: 0,
        destructible: false,
        color: '#00ff00',
        width: 30,
        height: 100,
        isSpawnBarrier: true,
        team: null // Sera défini par la map
    }
};

// ========================================
// ÉTAT DU JOUEUR
// ========================================

window.player = {
    x: 400,
    y: 300,
    width: 30,
    height: 30,
    speed: 4,
    sprintSpeed: 6,
    angle: 0,
    health: 100,
    maxHealth: 100,
    armor: 0,
    maxArmor: 50,
    baseMaxArmor: 50,
    alive: true,
    team: 'attackers',
    money: 800,
    startingMoney: 800,
    sprinting: false,
    crouching: false,
    reloading: false,
    lastShot: 0,
    recoilKick: 0,
    isPlanting: false,
    isDefusing: false,
    actionProgress: 0,
    actionType: null,
    weapon: null,
    inventory: [],
    reloadMultiplier: 1,
    baseSpeedMultiplier: 1,
    speedBoostMultiplier: 1,
    damageMultiplier: 1,
    extraPenetration: 0,
    effects: [],
    abilities: {
        ability1: { cooldown: 0, maxCooldown: 25, ready: true },
        ability2: { cooldown: 0, maxCooldown: 35, ready: true },
        ultimate: { points: 0, maxPoints: 7, ready: false }
    },
    kills: 0,
    deaths: 0,
    assists: 0,
    soulOrbs: 0,
    maxSoulOrbs: 4,
    throwAnimation: {
        timer: 0,
        duration: 0,
        style: null
    }
};

// ========================================
// ÉTAT DU JEU
// ========================================

window.game = {
    gameStarted: false,
    gamePaused: false,
    mode: 'deathmatch',
    currentMap: 'haven',
    round: 1,
    half: 1,
    maxRounds: 13,
    winCondition: 13,
    roundTime: 100,
    buyTime: 30,
    defaultRoundTime: 100,
    defaultBuyTime: 30,
    swapRounds: 12,
    modeSettings: {},
    matchFinished: false,
    phase: 'buy',
    attackersScore: 0,
    defendersScore: 0,
    bomb: {
        planted: false,
        carrier: null,
        timer: BOMB_SETTINGS.detonationTime,
        x: null,
        y: null,
        site: null,
        dropped: false,
        planting: false,
        plantProgress: 0,
        defusing: false,
        defuseProgress: 0
    },
    camera: {
        x: 0,
        y: 0,
        shake: 0,
        shakeIntensity: 0
    },
    revealPulseTimer: 0
};

function getLocalPlayerId() {
    return window.currentUser?.uid || window.player?.id || 'player';
}

function isLocalBombCarrier(carrier) {
    if (!carrier) return false;
    const identifiers = new Set(['player', getLocalPlayerId()]);
    if (window.player?.uid) identifiers.add(window.player.uid);
    if (window.player?.id) identifiers.add(window.player.id);
    if (window.currentUser?.uid) identifiers.add(window.currentUser.uid);
    return identifiers.has(carrier);
}

function assignBombToLocalPlayer() {
    game.bomb.carrier = getLocalPlayerId();
}

window.getLocalPlayerId = getLocalPlayerId;
window.isLocalBombCarrier = isLocalBombCarrier;

// ========================================
// AUTRES ENTITÉS
// ========================================

window.otherPlayers = {};
let bullets = [];
let particles = [];
let tacticalDevices = [];
let damageNumbers = [];
let gameObjects = [];
let smokeGrenades = [];
let flashbangs = [];
let revealBeacons = [];
let slowFields = [];
let sentryTurrets = [];
let armorRegenEffects = [];
let droppedWeapons = []; // Armes tombées au sol

const DEFAULT_TRAINING_SETTINGS = {
    botCount: 5,
    movingBots: true,
    respawnBots: true,
    respawnDelay: 1.5,
    movementRadius: 280,
    movementSpeed: 2.2
};

const trainingState = {
    active: false,
    bots: [],
    settings: { ...DEFAULT_TRAINING_SETTINGS },
    stats: { kills: 0, shots: 0, hits: 0 },
    awaitingBinding: null
};

let trainingBotIdCounter = 0;
let pendingKeyBinding = null;

const DEFAULT_KEY_BINDINGS = {
    pause: 'escape',
    buyMenu: 'b',
    reload: 'r',
    sprint: 'shift',
    plant: 'e',
    pickup: 'f',
    ability1: 'c',
    ability2: 'a',
    ultimate: 'x',
    weaponPrimary: '1',
    weaponSecondary: '2',
    weaponMelee: '3'
};

const keyBindings = loadKeyBindings();

const storedTrainingSettings = loadTrainingSettings();
if (storedTrainingSettings) {
    trainingState.settings = { ...DEFAULT_TRAINING_SETTINGS, ...storedTrainingSettings };
}

const DEFAULT_TACTICAL_DEVICE_STYLE = {
    size: 7,
    fill: '#7dd3fc',
    glow: 'rgba(125, 211, 252, 0.45)',
    trail: 'rgba(125, 211, 252, 0.25)',
    accent: '#ffffff'
};

const TACTICAL_DEVICE_STYLES = {
    smoke: {
        size: 8,
        fill: '#69c3ff',
        glow: 'rgba(105, 195, 255, 0.45)',
        trail: 'rgba(105, 195, 255, 0.25)',
        accent: '#e0f2ff'
    },
    reveal: {
        size: 7,
        fill: '#3ddad7',
        glow: 'rgba(61, 218, 215, 0.45)',
        trail: 'rgba(61, 218, 215, 0.25)',
        accent: '#faffff'
    },
    slow: {
        size: 7,
        fill: '#80d0ff',
        glow: 'rgba(128, 208, 255, 0.45)',
        trail: 'rgba(128, 208, 255, 0.25)',
        accent: '#ffffff'
    },
    barrier: {
        size: 8,
        fill: '#6c5ce7',
        glow: 'rgba(108, 92, 231, 0.45)',
        trail: 'rgba(108, 92, 231, 0.25)',
        accent: '#dcd6ff'
    },
    sentry: {
        size: 8,
        fill: '#f97316',
        glow: 'rgba(249, 115, 22, 0.5)',
        trail: 'rgba(249, 115, 22, 0.3)',
        accent: '#fff7ed'
    }
};

// ========================================
// CARTE COMPLÈTE AVEC OBJETS
// ========================================

const MAPS = {
    haven: {
        name: 'Haven',
        width: 3000,
        height: 2000,
        backgroundColor: '#1a1f2e',
        walls: [
            // === BORDURES DE LA MAP ===
            { x: 0, y: 0, width: 3000, height: 30, type: 'concrete_wall' },
            { x: 0, y: 0, width: 30, height: 2000, type: 'concrete_wall' },
            { x: 0, y: 1970, width: 3000, height: 30, type: 'concrete_wall' },
            { x: 2970, y: 0, width: 30, height: 2000, type: 'concrete_wall' },

            // === SPAWN ATTAQUANTS (Gauche) - Barrière de spawn ===
            { x: 450, y: 30, width: 30, height: 400, type: 'spawn_barrier', team: 'attackers' },
            { x: 450, y: 1570, width: 30, height: 400, type: 'spawn_barrier', team: 'attackers' },

            // === SPAWN DÉFENSEURS (Droite) - Barrière de spawn ===
            { x: 2520, y: 30, width: 30, height: 400, type: 'spawn_barrier', team: 'defenders' },
            { x: 2520, y: 1570, width: 30, height: 400, type: 'spawn_barrier', team: 'defenders' },

            // === SITE A (Haut gauche) - Structure ===
            { x: 600, y: 200, width: 400, height: 30, type: 'concrete_wall' },
            { x: 600, y: 200, width: 30, height: 300, type: 'concrete_wall' },
            { x: 970, y: 200, width: 30, height: 150, type: 'concrete_wall' },

            // === COULOIR CENTRAL ===
            { x: 1300, y: 500, width: 30, height: 400, type: 'concrete_wall' },
            { x: 1670, y: 500, width: 30, height: 400, type: 'concrete_wall' },
            { x: 1300, y: 870, width: 400, height: 30, type: 'concrete_wall' },

            // === SITE B (Centre droit) - Structure ===
            { x: 2000, y: 800, width: 400, height: 30, type: 'concrete_wall' },
            { x: 2370, y: 830, width: 30, height: 300, type: 'concrete_wall' },
            { x: 2000, y: 1100, width: 30, height: 200, type: 'concrete_wall' },

            // === SITE C (Bas gauche) - Structure ===
            { x: 600, y: 1500, width: 400, height: 30, type: 'concrete_wall' },
            { x: 600, y: 1530, width: 30, height: 300, type: 'concrete_wall' },
            { x: 970, y: 1700, width: 30, height: 130, type: 'concrete_wall' },

            // === MURS DE SÉPARATION ===
            { x: 1100, y: 100, width: 30, height: 300, type: 'concrete_wall' },
            { x: 1100, y: 1600, width: 30, height: 300, type: 'concrete_wall' },
            { x: 1850, y: 400, width: 30, height: 300, type: 'concrete_wall' },
            { x: 1850, y: 1300, width: 30, height: 300, type: 'concrete_wall' }
        ],
        objects: [
            // === SITE A - Cover ===
            { x: 700, y: 300, type: 'wood_crate' },
            { x: 760, y: 300, type: 'wood_crate' },
            { x: 820, y: 350, type: 'metal_crate' },
            { x: 880, y: 280, type: 'wood_crate' },
            { x: 750, y: 400, type: 'light_cover' },

            // === COULOIR CENTRAL - Cover ===
            { x: 1400, y: 650, type: 'metal_crate' },
            { x: 1500, y: 700, type: 'wood_crate' },
            { x: 1400, y: 750, type: 'barrel' },

            // === SITE B - Cover ===
            { x: 2100, y: 900, type: 'wood_crate' },
            { x: 2160, y: 900, type: 'wood_crate' },
            { x: 2220, y: 950, type: 'metal_crate' },
            { x: 2100, y: 1000, type: 'light_cover' },
            { x: 2280, y: 920, type: 'barrel' },

            // === SITE C - Cover ===
            { x: 700, y: 1600, type: 'wood_crate' },
            { x: 760, y: 1600, type: 'wood_crate' },
            { x: 820, y: 1650, type: 'metal_crate' },
            { x: 750, y: 1720, type: 'light_cover' },

            // === COUVERTS ADDITIONNELS ===
            { x: 1200, y: 300, type: 'wood_crate' },
            { x: 1950, y: 600, type: 'metal_crate' },
            { x: 1200, y: 1700, type: 'wood_crate' },
            { x: 900, y: 1000, type: 'barrel' }
        ],
        spawnPoints: {
            attackers: [
                { x: 100, y: 900 }, { x: 150, y: 950 }, { x: 100, y: 1000 },
                { x: 200, y: 900 }, { x: 250, y: 1050 }
            ],
            defenders: [
                { x: 2800, y: 900 }, { x: 2750, y: 950 }, { x: 2800, y: 1000 },
                { x: 2700, y: 900 }, { x: 2650, y: 1050 }
            ]
        },
        bombSites: [
            { x: 700, y: 250, width: 250, height: 200, name: 'A' },
            { x: 2100, y: 850, width: 250, height: 200, name: 'B' },
            { x: 700, y: 1550, width: 250, height: 200, name: 'C' }
        ]
    },

    ascent: {
        name: 'Ascent',
        width: 2800,
        height: 1800,
        backgroundColor: '#2d3a2e',
        walls: [
            // === BORDURES DE LA MAP ===
            { x: 0, y: 0, width: 2800, height: 30, type: 'concrete_wall' },
            { x: 0, y: 0, width: 30, height: 1800, type: 'concrete_wall' },
            { x: 0, y: 1770, width: 2800, height: 30, type: 'concrete_wall' },
            { x: 2770, y: 0, width: 30, height: 1800, type: 'concrete_wall' },

            // === SPAWN ATTAQUANTS (Gauche) - Barrière de spawn ===
            { x: 400, y: 30, width: 30, height: 300, type: 'spawn_barrier', team: 'attackers' },
            { x: 400, y: 1470, width: 30, height: 300, type: 'spawn_barrier', team: 'attackers' },

            // === SPAWN DÉFENSEURS (Droite) - Barrière de spawn ===
            { x: 2370, y: 30, width: 30, height: 300, type: 'spawn_barrier', team: 'defenders' },
            { x: 2370, y: 1470, width: 30, height: 300, type: 'spawn_barrier', team: 'defenders' },

            // === SITE A (Haut) - Structure en U ===
            { x: 700, y: 200, width: 500, height: 30, type: 'concrete_wall' },
            { x: 700, y: 200, width: 30, height: 250, type: 'concrete_wall' },
            { x: 1170, y: 200, width: 30, height: 250, type: 'concrete_wall' },
            { x: 850, y: 350, width: 200, height: 30, type: 'concrete_wall' },

            // === MID (Centre) - Couloir long ===
            { x: 1250, y: 700, width: 30, height: 400, type: 'concrete_wall' },
            { x: 1520, y: 700, width: 30, height: 400, type: 'concrete_wall' },
            { x: 1280, y: 850, width: 240, height: 30, type: 'concrete_wall' },
            { x: 1280, y: 1020, width: 240, height: 30, type: 'concrete_wall' },

            // === SITE B (Bas) - Structure en L ===
            { x: 700, y: 1350, width: 500, height: 30, type: 'concrete_wall' },
            { x: 700, y: 1380, width: 30, height: 250, type: 'concrete_wall' },
            { x: 1170, y: 1450, width: 30, height: 180, type: 'concrete_wall' },

            // === CONNEXIONS ET PASSAGES ===
            { x: 600, y: 600, width: 30, height: 200, type: 'concrete_wall' },
            { x: 600, y: 1000, width: 30, height: 200, type: 'concrete_wall' },
            { x: 2170, y: 600, width: 30, height: 200, type: 'concrete_wall' },
            { x: 2170, y: 1000, width: 30, height: 200, type: 'concrete_wall' },

            // === PORTES (destructibles) ===
            { x: 1000, y: 550, width: 80, height: 30, type: 'wood_door' },
            { x: 1000, y: 1220, width: 80, height: 30, type: 'wood_door' },
            { x: 1720, y: 550, width: 80, height: 30, type: 'wood_door' },
            { x: 1720, y: 1220, width: 80, height: 30, type: 'wood_door' }
        ],
        objects: [
            // === SITE A - Cover stratégique ===
            { x: 800, y: 280, type: 'metal_crate' },
            { x: 900, y: 250, type: 'wood_crate' },
            { x: 1000, y: 280, type: 'wood_crate' },
            { x: 1060, y: 280, type: 'metal_crate' },
            { x: 850, y: 400, type: 'light_cover' },
            { x: 950, y: 420, type: 'light_cover' },

            // === MID - Cover central ===
            { x: 1350, y: 800, type: 'metal_crate' },
            { x: 1350, y: 900, type: 'wood_crate' },
            { x: 1420, y: 950, type: 'barrel' },
            { x: 1380, y: 1050, type: 'light_cover' },

            // === SITE B - Cover défensif ===
            { x: 800, y: 1430, type: 'metal_crate' },
            { x: 900, y: 1460, type: 'wood_crate' },
            { x: 1000, y: 1430, type: 'wood_crate' },
            { x: 1060, y: 1500, type: 'metal_crate' },
            { x: 850, y: 1550, type: 'light_cover' },

            // === COVER ADDITIONNELS ===
            { x: 700, y: 900, type: 'metal_crate' },
            { x: 2100, y: 900, type: 'metal_crate' },
            { x: 1400, y: 450, type: 'barrel' },
            { x: 1400, y: 1350, type: 'barrel' },
            { x: 500, y: 700, type: 'wood_crate' },
            { x: 2300, y: 700, type: 'wood_crate' }
        ],
        spawnPoints: {
            attackers: [
                { x: 100, y: 850 }, { x: 150, y: 900 }, { x: 100, y: 950 },
                { x: 200, y: 850 }, { x: 250, y: 900 }
            ],
            defenders: [
                { x: 2600, y: 850 }, { x: 2550, y: 900 }, { x: 2600, y: 950 },
                { x: 2500, y: 850 }, { x: 2650, y: 900 }
            ]
        },
        bombSites: [
            { x: 800, y: 250, width: 300, height: 180, name: 'A' },
            { x: 800, y: 1400, width: 300, height: 180, name: 'B' }
        ]
    },

    bind: {
        name: 'Bind',
        width: 2600,
        height: 1800,
        backgroundColor: '#2a1f1a',
        walls: [
            // === BORDURES DE LA MAP ===
            { x: 0, y: 0, width: 2600, height: 30, type: 'concrete_wall' },
            { x: 0, y: 0, width: 30, height: 1800, type: 'concrete_wall' },
            { x: 0, y: 1770, width: 2600, height: 30, type: 'concrete_wall' },
            { x: 2570, y: 0, width: 30, height: 1800, type: 'concrete_wall' },

            // === SPAWN ATTAQUANTS (Gauche) - Barrière de spawn ===
            { x: 380, y: 30, width: 30, height: 350, type: 'spawn_barrier', team: 'attackers' },
            { x: 380, y: 1420, width: 30, height: 350, type: 'spawn_barrier', team: 'attackers' },

            // === SPAWN DÉFENSEURS (Droite) - Barrière de spawn ===
            { x: 2190, y: 30, width: 30, height: 350, type: 'spawn_barrier', team: 'defenders' },
            { x: 2190, y: 1420, width: 30, height: 350, type: 'spawn_barrier', team: 'defenders' },

            // === SITE A (Haut gauche) - Forme en arc ===
            { x: 600, y: 250, width: 400, height: 30, type: 'concrete_wall' },
            { x: 600, y: 280, width: 30, height: 200, type: 'concrete_wall' },
            { x: 970, y: 280, width: 30, height: 100, type: 'concrete_wall' },
            { x: 750, y: 380, width: 150, height: 30, type: 'concrete_wall' },

            // === HOOKAH (Couloir vers A) ===
            { x: 1100, y: 400, width: 30, height: 300, type: 'concrete_wall' },
            { x: 1130, y: 550, width: 200, height: 30, type: 'concrete_wall' },

            // === MID (Téléporteurs) - Zone centrale ===
            { x: 1200, y: 800, width: 200, height: 30, type: 'concrete_wall' },
            { x: 1200, y: 970, width: 200, height: 30, type: 'concrete_wall' },
            { x: 1200, y: 800, width: 30, height: 200, type: 'concrete_wall' },
            { x: 1370, y: 800, width: 30, height: 200, type: 'concrete_wall' },

            // === SITE B (Bas droit) - Structure rectangulaire ===
            { x: 1800, y: 1350, width: 400, height: 30, type: 'concrete_wall' },
            { x: 1800, y: 1380, width: 30, height: 200, type: 'concrete_wall' },
            { x: 2170, y: 1380, width: 30, height: 100, type: 'concrete_wall' },
            { x: 1900, y: 1480, width: 200, height: 30, type: 'concrete_wall' },

            // === LONG B (Couloir long vers B) ===
            { x: 1600, y: 1200, width: 30, height: 300, type: 'concrete_wall' },
            { x: 1630, y: 1350, width: 150, height: 30, type: 'concrete_wall' },

            // === CONNEXIONS ===
            { x: 900, y: 700, width: 30, height: 200, type: 'concrete_wall' },
            { x: 1700, y: 700, width: 30, height: 200, type: 'concrete_wall' }
        ],
        objects: [
            // === SITE A - Cover ===
            { x: 700, y: 330, type: 'metal_crate' },
            { x: 770, y: 310, type: 'wood_crate' },
            { x: 840, y: 330, type: 'wood_crate' },
            { x: 900, y: 300, type: 'metal_crate' },
            { x: 750, y: 430, type: 'light_cover' },
            { x: 850, y: 450, type: 'light_cover' },

            // === HOOKAH - Cover ===
            { x: 1150, y: 500, type: 'wood_crate' },
            { x: 1220, y: 480, type: 'barrel' },

            // === MID - Cover stratégique ===
            { x: 1250, y: 850, type: 'metal_crate' },
            { x: 1320, y: 900, type: 'wood_crate' },

            // === LONG B - Cover ===
            { x: 1650, y: 1280, type: 'metal_crate' },
            { x: 1650, y: 1420, type: 'wood_crate' },

            // === SITE B - Cover ===
            { x: 1900, y: 1420, type: 'metal_crate' },
            { x: 1970, y: 1440, type: 'wood_crate' },
            { x: 2040, y: 1420, type: 'wood_crate' },
            { x: 2100, y: 1450, type: 'metal_crate' },
            { x: 1950, y: 1530, type: 'light_cover' },

            // === COVER ADDITIONNELS ===
            { x: 500, y: 900, type: 'barrel' },
            { x: 2100, y: 900, type: 'barrel' },
            { x: 1300, y: 600, type: 'wood_crate' },
            { x: 1300, y: 1200, type: 'wood_crate' }
        ],
        spawnPoints: {
            attackers: [
                { x: 100, y: 850 }, { x: 150, y: 900 }, { x: 100, y: 950 },
                { x: 200, y: 850 }, { x: 250, y: 900 }
            ],
            defenders: [
                { x: 2400, y: 850 }, { x: 2350, y: 900 }, { x: 2400, y: 950 },
                { x: 2300, y: 850 }, { x: 2450, y: 900 }
            ]
        },
        bombSites: [
            { x: 700, y: 300, width: 280, height: 160, name: 'A' },
            { x: 1900, y: 1400, width: 280, height: 160, name: 'B' }
        ]
    }
};

// ========================================
// INITIALISATION
// ========================================

function initializeGame() {
    gameCanvas = document.getElementById('game-canvas');
    if (!gameCanvas) {
        return false;
    }

    gameContext = gameCanvas.getContext('2d');
    gameCanvas.width = 1200;
    gameCanvas.height = 800;
    game.gamePaused = false;
    game.gameStarted = false;

    // CORRECTION : Initialiser le timestamp de démarrage du jeu
    gameStartTimestamp = Date.now();

    // Assurer qu'on a une map valide
    if (!game.currentMap || !MAPS[game.currentMap]) {
        game.currentMap = 'haven';
    }

    applyModeSettings();
    setupControls();
    loadObjectSprites();
    initializeMap();
    initializeMinimap();
    equipWeapon('classic');
    resetGameState(true);
    if (game.mode === 'training' || trainingState.active) {
        setupTrainingBots(true);
    } else {
        setupMultiplayerSync();
    }
    startGameLoop();

    game.gameStarted = true;
    return true;
}

function applyModeSettings() {
    const modeConfig = window.gameModes?.[game.mode] || window.game.modeSettings || {};
    game.modeSettings = modeConfig;
    game.maxRounds = typeof modeConfig.maxRounds === 'number' ? modeConfig.maxRounds : game.maxRounds;
    game.winCondition = typeof modeConfig.winCondition === 'number' ? modeConfig.winCondition : game.winCondition;
    game.defaultRoundTime = typeof modeConfig.roundDuration === 'number' ? modeConfig.roundDuration : game.defaultRoundTime;
    game.defaultBuyTime = typeof modeConfig.buyPhaseDuration === 'number' ? modeConfig.buyPhaseDuration : game.defaultBuyTime;
    if (modeConfig.swapRounds) {
        game.swapRounds = modeConfig.swapRounds;
    } else if (game.maxRounds) {
        game.swapRounds = Math.floor(game.maxRounds / 2);
    }
}

function initializeMinimap() {
    minimapCanvas = document.getElementById('minimap-canvas');
    minimapNameElement = document.getElementById('minimap-map-name');
    if (!minimapCanvas) {
        minimapContext = null;
        return;
    }
    minimapContext = minimapCanvas.getContext('2d');
    minimapCurrentMap = null;
    updateMinimapLayout();
    updateMinimap(true);
}

function updateMinimapLayout() {
    if (!minimapContext) return;
    const map = MAPS[game.currentMap];
    if (!map) return;
    const scaleX = minimapCanvas.width / map.width;
    const scaleY = minimapCanvas.height / map.height;
    minimapScale = Math.min(scaleX, scaleY);
    minimapOffset = {
        x: (minimapCanvas.width - map.width * minimapScale) / 2,
        y: (minimapCanvas.height - map.height * minimapScale) / 2
    };
    minimapCurrentMap = game.currentMap;
}

function initializeMap() {
    const map = MAPS[game.currentMap];
    if (!map) return;
    
    gameObjects = [];
    
    // Créer les murs
    map.walls.forEach(wall => {
        const objType = OBJECT_TYPES[wall.type];
        gameObjects.push({
            ...wall,
            ...objType,
            health: objType.health,
            destroyed: false,
            hitTimer: 0
        });
    });
    
    // Créer les objets
    map.objects.forEach(obj => {
        const objType = OBJECT_TYPES[obj.type];
        gameObjects.push({
            x: obj.x,
            y: obj.y,
            width: objType.width,
            height: objType.height,
            type: obj.type,
            ...objType,
            health: objType.health,
            destroyed: false,
            hitTimer: 0
        });
    });
}

function resetGameState(isNewMatch = false) {
    // Assurer qu'on a une map valide
    if (!game.currentMap || !MAPS[game.currentMap]) {
        game.currentMap = 'haven';
    }
    const map = MAPS[game.currentMap];
    if (!map) {
        return;
    }
    const spawnPoints = map.spawnPoints?.[player.team] || map.spawnPoints?.attackers || [{ x: 0, y: 0 }];
    const spawn = spawnPoints[0];
    if (isNewMatch) {
        game.round = 1;
        game.half = 1;
        game.attackersScore = 0;
        game.defendersScore = 0;
        game.phase = 'buy';
        game.revealPulseTimer = 0;
        game.matchFinished = false;
        if (typeof player.startingMoney === 'number') {
            player.money = player.startingMoney;
        }
    }
    
    player.x = spawn.x;
    player.y = spawn.y;
    player.health = player.maxHealth;
    player.maxArmor = player.baseMaxArmor || player.maxArmor;
    player.armor = 0;
    player.alive = true;
    player.reloading = false;
    player.recoilKick = 0;
    player.effects = [];
    player.speedBoostMultiplier = 1;
    player.damageMultiplier = 1;
    player.extraPenetration = 0;
    player.reloadMultiplier = 1;
    player.sprinting = false;
    player.crouching = false;
    player.isPlanting = false;
    player.isDefusing = false;
    player.actionType = null;
    player.actionProgress = 0;

    // Réinitialiser le mode Impératrice de Reyna à chaque round
    if (player.empressModeActive && player.weapon) {
        // Trouver l'effet empress pour récupérer le fireRate original
        const empressEffect = player.effects.find(e => e.type === 'empress');
        if (empressEffect && empressEffect.originalFireRate) {
            player.weapon.fireRate = empressEffect.originalFireRate;
        }
        player.empressModeActive = false;
    }

    // Réinitialiser les orbes d'âmes de Reyna à chaque round
    if (player.agentId === 'reyna') {
        player.soulOrbs = 0;
    }

    game.roundTime = game.defaultRoundTime;
    game.buyTime = game.defaultBuyTime;
    game.phase = 'buy';

    resetBombState();
    
    bullets = [];
    particles = [];
    tacticalDevices = [];
    damageNumbers = [];
    smokeGrenades = [];
    flashbangs = [];
    revealBeacons = [];
    slowFields = [];
    sentryTurrets = [];
    armorRegenEffects = [];
    droppedWeapons = []; // Nettoyer les armes au sol
    if (player.throwAnimation) {
        player.throwAnimation.timer = 0;
        player.throwAnimation.duration = 0;
        player.throwAnimation.style = null;
    }
    
    game.camera.x = player.x;
    game.camera.y = player.y;
    minimapCurrentMap = null;
    updateMinimapLayout();
    updateMinimap(true);

    if (window.SpectatorSystem && typeof window.SpectatorSystem.disable === 'function') {
        window.SpectatorSystem.disable(true);
    }
    window.SpectatorSystem?.refreshAvailability?.(player);

    if (window.AgentSystem && typeof window.AgentSystem.applyAgentModifiers === 'function') {
        window.AgentSystem.applyAgentModifiers(true);
    }

    updateUI();
}

function resetBombState() {
    game.bomb.planted = false;
    game.bomb.planting = false;
    game.bomb.defusing = false;
    game.bomb.plantProgress = 0;
    game.bomb.defuseProgress = 0;
    game.bomb.timer = BOMB_SETTINGS.detonationTime;
    game.bomb.site = null;
    game.bomb.x = null;
    game.bomb.y = null;
    game.bomb.dropped = false;
    game.bomb.carrier = null;
    if (isBombMode() && player.team === 'attackers') {
        assignBombToLocalPlayer();
    }
}

function equipWeapon(weaponName) {
    if (WEAPONS[weaponName]) {
        player.weapon = {
            ...WEAPONS[weaponName],
            ammo: WEAPONS[weaponName].maxAmmo,
            totalAmmo: WEAPONS[weaponName].totalAmmo
        };
        player.recoilKick = 0;
        refreshWeaponUI();
    }
}

function pickupNearbyWeapon() {
    if (!player.alive) return;

    const pickupRadius = 50; // Rayon de ramassage
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    // Trouver l'arme la plus proche
    let closestWeapon = null;
    let closestDistance = pickupRadius;

    for (let i = 0; i < droppedWeapons.length; i++) {
        const weapon = droppedWeapons[i];
        const dx = weapon.x - playerCenterX;
        const dy = weapon.y - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestWeapon = { ...weapon, index: i };
        }
    }

    if (closestWeapon) {
        // Équiper l'arme ramassée
        player.weapon = { ...closestWeapon.weapon };
        player.weaponSkin = closestWeapon.skin;
        player.recoilKick = 0;
        refreshWeaponUI();

        // Supprimer l'arme du sol
        droppedWeapons.splice(closestWeapon.index, 1);

        if (window.NotificationSystem) {
            const skinText = closestWeapon.skin ? ` (${closestWeapon.skin})` : '';
            window.NotificationSystem.show(
                'Arme ramassée',
                `${closestWeapon.weapon.name}${skinText}`,
                'info',
                2000
            );
        }
    }
}

function setupControls() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('wheel', handleMouseWheel);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleMouseWheel);
    
}

// ========================================
// BOUCLE DE JEU
// ========================================

function startGameLoop() {
    if (gameLoop) cancelAnimationFrame(gameLoop);
    lastTime = performance.now();
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

function gameLoopFunction(currentTime) {
    if (!game.gameStarted) {
        gameLoop = requestAnimationFrame(gameLoopFunction);
        return;
    }
    
    deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;
    
    if (!game.gamePaused) {
        update(deltaTime);
    }
    
    render();
    
    gameLoop = requestAnimationFrame(gameLoopFunction);
}

// ========================================
// MISE À JOUR
// ========================================

function update(dt) {
    const spectatorActive = window.SpectatorSystem?.isEnabled?.() || false;
    if (!spectatorActive && player.alive) {
        updatePlayer(dt);
    } else if (spectatorActive) {
        window.SpectatorSystem.update(dt);
    }

    updateCamera(dt);
    updateAbilityCooldowns(dt);
    updateStatusEffects(dt);
    updateRecoil(dt);
    updatePlayerThrowAnimation(dt);
    updateRevealBeacons(dt);
    updateSlowFields(dt);
    updateArmorRegenEffects(dt);
    updateSentryTurrets(dt);
    updateObjectAnimations(dt);
    updateBullets(dt);
    updateParticles(dt);
    updateTacticalDevices(dt);
    updateDamageNumbers(dt);
    updateSmokeGrenades(dt);
    updateFlashbangs(dt);
    if (isBombMode()) {
        updateAttackDefenseMode(dt);
    }
    updateOtherPlayers(dt);
    updateTrainingBots(dt);
    updateGameTimers(dt);
    checkTeamElimination(); // Vérifier si une équipe est éliminée
    updateUI();

    if (mouse.pressed && player.alive && !player.reloading && !player.isPlanting && !player.isDefusing) {
        shoot();
    }
}

function updatePlayer(dt) {
    if (player.isPlanting || player.isDefusing) {
        player.sprinting = false;
        return;
    }

    let dirX = 0;
    let dirY = 0;
    
    // Déplacement ZQSD + flèches directionnelles
    if (keys['w'] || keys['z'] || keys['arrowup']) dirY -= 1;
    if (keys['s'] || keys['arrowdown']) dirY += 1;
    if (keys['a'] || keys['q'] || keys['arrowleft']) dirX -= 1;
    if (keys['d'] || keys['arrowright']) dirX += 1;
    
    if (dirX !== 0 && dirY !== 0) {
        dirX *= Math.SQRT1_2;
        dirY *= Math.SQRT1_2;
    }

    const baseMove = (player.sprinting ? player.sprintSpeed : player.speed) * (player.baseSpeedMultiplier || 1);
    const moveSpeed = baseMove * (player.speedBoostMultiplier || 1) * dt * 60;
    const deltaX = dirX * moveSpeed;
    const deltaY = dirY * moveSpeed;
    
    const newX = player.x + deltaX;
    const newY = player.y + deltaY;
    
    if (!checkCollision(newX, player.y, player.width, player.height)) {
        player.x = newX;
    }
    if (!checkCollision(player.x, newY, player.width, player.height)) {
        player.y = newY;
    }

    const currentMap = MAPS[game.currentMap];
    if (currentMap) {
        const maxX = currentMap.width - player.width;
        const maxY = currentMap.height - player.height;
        player.x = Math.min(Math.max(player.x, 0), Math.max(0, maxX));
        player.y = Math.min(Math.max(player.y, 0), Math.max(0, maxY));
    }
    
    // Recalculer la position de la souris dans le monde avec la caméra actuelle
    // pour éviter le décalage causé par le lissage de la caméra
    const currentMouseWorldX = mouse.x - gameCanvas.width / 2 + game.camera.x;
    const currentMouseWorldY = mouse.y - gameCanvas.height / 2 + game.camera.y;

    // Angle vers la souris (centré sur le joueur)
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dx_mouse = currentMouseWorldX - playerCenterX;
    const dy_mouse = currentMouseWorldY - playerCenterY;
    player.angle = Math.atan2(dy_mouse, dx_mouse);
}

function updateCamera(dt) {
    const smoothness = 0.1;
    let targetX = player.x;
    let targetY = player.y;

    if (window.SpectatorSystem?.isEnabled?.()) {
        const camTarget = window.SpectatorSystem.getCameraTarget();
        if (camTarget) {
            targetX = camTarget.x;
            targetY = camTarget.y;
        }
    }
    
    game.camera.x += (targetX - game.camera.x) * smoothness;
    game.camera.y += (targetY - game.camera.y) * smoothness;
    
    // Shake de caméra
    if (game.camera.shake > 0) {
        game.camera.shake = Math.max(0, game.camera.shake - dt * 6);
        game.camera.shakeIntensity = game.camera.shake * 6;
    } else {
        game.camera.shakeIntensity = 0;
    }
}

function updateAbilityCooldowns(dt) {
    for (const key in player.abilities) {
        const ability = player.abilities[key];
        if (ability.cooldown > 0) {
            ability.cooldown -= dt;
            if (ability.cooldown <= 0) {
                ability.cooldown = 0;
                if (!ability.maxPoints || ability.maxPoints === 0 || key !== 'ultimate') {
                    ability.ready = true;
                }
            }
        }
    }
}

function updateStatusEffects(dt) {
    if (!player.effects) return;

    for (let i = player.effects.length - 1; i >= 0; i--) {
        const effect = player.effects[i];
        effect.duration -= dt;
        if (effect.duration <= 0) {
            player.effects.splice(i, 1);
        }
    }

    let speedMultiplier = 1;
    let damageMultiplier = 1;
    let extraPenetration = 0;

    player.effects.forEach(effect => {
        switch (effect.type) {
            case 'speedBoost':
                speedMultiplier = Math.max(speedMultiplier, effect.value || 1);
                break;
            case 'damageBoost':
                damageMultiplier = Math.max(damageMultiplier, effect.value || 1);
                extraPenetration = Math.max(extraPenetration, effect.penetration || 0);
                break;
        }
    });

    player.speedBoostMultiplier = speedMultiplier;
    player.damageMultiplier = Math.max(1, damageMultiplier);
    player.extraPenetration = Math.max(0, extraPenetration);
}

function updateRecoil(dt) {
    if (!player.weapon) {
        player.recoilKick = 0;
        return;
    }
    const recovery = player.weapon.recoilRecovery || 2.5;
    player.recoilKick = Math.max(0, (player.recoilKick || 0) - dt * recovery);
    if (player.recoilKick < 0.01) {
        player.recoilKick = 0;
    }
}

function updateRevealBeacons(dt) {
    for (let i = revealBeacons.length - 1; i >= 0; i--) {
        const beacon = revealBeacons[i];
        beacon.duration -= dt;
        beacon.pulse += dt * (beacon.pulseSpeed || 4);
        if (beacon.duration <= 0) {
            revealBeacons.splice(i, 1);
        }
    }
}

function updateSlowFields(dt) {
    for (let i = slowFields.length - 1; i >= 0; i--) {
        const field = slowFields[i];
        field.duration -= dt;
        field.pulse += dt;
        if (field.duration <= 0) {
            slowFields.splice(i, 1);
        }
    }
}

function updateArmorRegenEffects(dt) {
    for (let i = armorRegenEffects.length - 1; i >= 0; i--) {
        const effect = armorRegenEffects[i];
        effect.duration -= dt;
        const regenRate = (effect.totalArmor || 0) / Math.max(effect.initialDuration || 1, 0.0001);
        const amount = Math.min(regenRate * dt, effect.remaining || 0);
        const space = Math.max(0, player.maxArmor - player.armor);
        const applied = Math.min(amount, space);
        player.armor += applied;
        effect.remaining = Math.max(0, (effect.remaining || 0) - applied);

        if (effect.duration <= 0 || effect.remaining <= 0 || player.armor >= player.maxArmor) {
            armorRegenEffects.splice(i, 1);
        }
    }
}

function updateSentryTurrets(dt) {
    for (let i = sentryTurrets.length - 1; i >= 0; i--) {
        const turret = sentryTurrets[i];
        turret.duration -= dt;
        turret.angle += dt * 2;
        turret.cooldown -= dt;

        if (turret.cooldown <= 0) {
            // Effet visuel de tir
            const muzzleX = turret.x + Math.cos(turret.angle) * 18;
            const muzzleY = turret.y + Math.sin(turret.angle) * 18;
            particles.push({
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(turret.angle) * 8,
                vy: Math.sin(turret.angle) * 8,
                life: 0.2,
                maxLife: 0.2,
                color: '#ffd166',
                size: 3
            });
            turret.cooldown = turret.fireRate || 0.4;
        }

        if (turret.duration <= 0) {
            sentryTurrets.splice(i, 1);
        }
    }
}

function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        const prevX = bullet.x;
        const prevY = bullet.y;
        
        bullet.x += bullet.vx * dt * 60;
        bullet.y += bullet.vy * dt * 60;
        bullet.lifetime -= dt;
        bullet.distance += Math.hypot(bullet.vx * dt * 60, bullet.vy * dt * 60);
        
        if (bullet.lifetime <= 0) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Collision avec objets
        let hitObject = false;
        for (const obj of gameObjects) {
            if (obj.destroyed) continue;
            
            if (checkBulletObjectCollision(bullet, obj)) {
                handleBulletObjectCollision(bullet, obj, i);
                hitObject = true;
                break;
            }
        }
        
        if (hitObject) continue;
        
        // Collision avec joueurs
        for (const playerId in otherPlayers) {
            const other = otherPlayers[playerId];
            if (other.alive && checkBulletPlayerCollision(bullet, other)) {
                hitPlayer(other, bullet.damage, bullet.owner);
                createBloodEffect(bullet.x, bullet.y);
                bullets.splice(i, 1);
                break;
            }
        }

        if (trainingState.active && bullets[i]) {
            let botHit = false;
            for (const bot of trainingState.bots) {
                if (!bot.alive) continue;
                if (checkBulletPlayerCollision(bullet, bot)) {
                    hitTrainingBot(bot, bullet.damage, bullet.owner);
                    createBloodEffect(bullet.x, bullet.y);
                    bullets.splice(i, 1);
                    botHit = true;
                    break;
                }
            }
            if (botHit) continue;
        }
    }
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= dt;
        
        if (p.gravity) {
            p.vy += 0.3;
        }
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateDamageNumbers(dt) {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const dmg = damageNumbers[i];
        dmg.y -= 30 * dt;
        dmg.life -= dt;
        
        if (dmg.life <= 0) {
            damageNumbers.splice(i, 1);
        }
    }
}

function updateObjectAnimations(dt) {
    const now = performance.now();
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        const obj = gameObjects[i];
        if (obj.expiresAt && now >= obj.expiresAt) {
            gameObjects.splice(i, 1);
            continue;
        }
        if (obj.hitTimer) {
            obj.hitTimer -= dt;
            if (obj.hitTimer < 0) {
                obj.hitTimer = 0;
            }
        }
    }
}

function updateSmokeGrenades(dt) {
    for (let i = smokeGrenades.length - 1; i >= 0; i--) {
        const smoke = smokeGrenades[i];
        smoke.lifetime -= dt;
        
        if (smoke.lifetime <= 0) {
            smokeGrenades.splice(i, 1);
        } else if (smoke.radius < smoke.maxRadius) {
            smoke.radius += dt * 50;
        }
    }
}

function updateFlashbangs(dt) {
    for (let i = flashbangs.length - 1; i >= 0; i--) {
        const flash = flashbangs[i];
        flash.lifetime -= dt;
        
        if (flash.lifetime <= 0) {
            flashbangs.splice(i, 1);
        }
    }
}

function updateOtherPlayers(dt) {
    for (const playerId in otherPlayers) {
        const other = otherPlayers[playerId];

        // Mise à jour basique
        if (other.health <= 0) {
            other.alive = false;
        }

        // Interpolation de position pour un mouvement fluide (réduction du lag visuel)
        if (other.targetX !== undefined && other.targetY !== undefined) {
            const lerpSpeed = 0.3; // Vitesse d'interpolation
            other.x += (other.targetX - other.x) * lerpSpeed;
            other.y += (other.targetY - other.y) * lerpSpeed;

            // Interpolation de l'angle
            if (other.targetAngle !== undefined) {
                // Gérer la rotation la plus courte
                let angleDiff = other.targetAngle - other.angle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                other.angle += angleDiff * lerpSpeed;
            }
        }
    }

    // Envoyer la position du joueur local toutes les 50ms
    sendPlayerPosition();
}

// Variables pour la synchronisation
let lastPositionUpdate = 0;
const POSITION_UPDATE_INTERVAL = 50; // Envoyer la position toutes les 50ms

// Variables pour optimiser l'envoi des données
let lastPlayerData = {};

function sendPlayerPosition() {
    if (!game.gameStarted || !player.alive) return;
    if (!window.matchmakingState?.currentMatchId) return;
    if (!window.database) return;

    const now = Date.now();
    if (now - lastPositionUpdate < POSITION_UPDATE_INTERVAL) return;

    lastPositionUpdate = now;

    try {
        const currentData = {
            x: Math.round(player.x * 10) / 10, // Arrondir pour réduire les mises à jour
            y: Math.round(player.y * 10) / 10,
            angle: Math.round(player.angle * 100) / 100,
            health: player.health,
            armor: player.armor,
            alive: player.alive,
            team: player.team,
            weapon: player.weapon?.name || 'classic',
            sprinting: player.sprinting,
            crouching: player.crouching,
            username: window.currentUser.displayName || window.currentUser.email?.split('@')[0] || 'Joueur',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        // N'envoyer que les données qui ont changé pour optimiser la bande passante
        const updates = {};
        let hasChanges = false;

        for (const key in currentData) {
            if (currentData[key] !== lastPlayerData[key]) {
                updates[key] = currentData[key];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            const gameRef = window.database.ref(`game_sessions/${window.matchmakingState.currentMatchId}/players/${window.currentUser.uid}`);
            gameRef.update(updates);
            lastPlayerData = { ...currentData };
        }
    } catch (error) {
        // Ignorer les erreurs
    }
}

// Configuration du système de synchronisation multijoueur
let multiplayerListener = null;

function setupMultiplayerSync() {
    if (!window.matchmakingState?.currentMatchId) {
        return;
    }
    if (!window.database) {
        return;
    }

    const matchId = window.matchmakingState.currentMatchId;
    const playersRef = window.database.ref(`game_sessions/${matchId}/players`);


    // Écouter les changements sur tous les joueurs
    multiplayerListener = playersRef.on('child_changed', (snapshot) => {
        const playerId = snapshot.key;
        const playerData = snapshot.val();

        // Ne pas mettre à jour notre propre joueur
        if (playerId === window.currentUser?.uid) return;

        window.updateOtherPlayerPosition(playerId, playerData);
    });

    // Écouter les nouveaux joueurs qui rejoignent
    playersRef.on('child_added', (snapshot) => {
        const playerId = snapshot.key;
        const playerData = snapshot.val();

        // Ne pas ajouter notre propre joueur
        if (playerId === window.currentUser?.uid) return;

        window.updateOtherPlayerPosition(playerId, playerData);
    });

    // Écouter les joueurs qui partent
    playersRef.on('child_removed', (snapshot) => {
        const playerId = snapshot.key;

        // Ne pas supprimer notre propre joueur
        if (playerId === window.currentUser?.uid) return;

        if (otherPlayers[playerId]) {
            delete otherPlayers[playerId];
        }

        // Vérifier si toute une équipe s'est déconnectée
        checkTeamDisconnection();
    });

}

// Fonction pour arrêter la synchronisation (quand on quitte le match)
function stopMultiplayerSync() {
    if (!window.matchmakingState?.currentMatchId || !window.database) return;

    const matchId = window.matchmakingState.currentMatchId;
    const playersRef = window.database.ref(`game_sessions/${matchId}/players`);

    // Arrêter tous les listeners
    playersRef.off();
    multiplayerListener = null;

}

// Fonction pour recevoir les positions des autres joueurs
window.updateOtherPlayerPosition = function(playerId, playerData) {
    if (!playerData) return;

    // Créer ou mettre à jour le joueur
    if (!otherPlayers[playerId]) {
        otherPlayers[playerId] = {
            x: playerData.x || 0,
            y: playerData.y || 0,
            targetX: playerData.x || 0,
            targetY: playerData.y || 0,
            width: 30,
            height: 30,
            angle: playerData.angle || 0,
            targetAngle: playerData.angle || 0,
            health: playerData.health || 100,
            armor: playerData.armor || 0,
            alive: playerData.alive !== false,
            team: playerData.team || 'defenders',
            weapon: playerData.weapon || 'classic',
            sprinting: playerData.sprinting || false,
            crouching: playerData.crouching || false,
            username: playerData.username || 'Joueur'
        };
    } else {
        // Utiliser l'interpolation pour les positions et angles
        if (playerData.x !== undefined) {
            otherPlayers[playerId].targetX = playerData.x;
        }
        if (playerData.y !== undefined) {
            otherPlayers[playerId].targetY = playerData.y;
        }
        if (playerData.angle !== undefined) {
            otherPlayers[playerId].targetAngle = playerData.angle;
        }

        // Ne mettre à jour la santé que si elle est définie (pour éviter la réinitialisation)
        if (playerData.health !== undefined) {
            otherPlayers[playerId].health = playerData.health;
        }

        if (playerData.armor !== undefined) {
            otherPlayers[playerId].armor = playerData.armor;
        }

        otherPlayers[playerId].alive = playerData.alive !== false;
        otherPlayers[playerId].team = playerData.team || otherPlayers[playerId].team;
        otherPlayers[playerId].weapon = playerData.weapon || otherPlayers[playerId].weapon;
        otherPlayers[playerId].sprinting = playerData.sprinting || false;
        otherPlayers[playerId].crouching = playerData.crouching || false;
        otherPlayers[playerId].username = playerData.username || otherPlayers[playerId].username;
    }
};

function updateGameTimers(dt) {
    if (trainingState.active || game.mode === 'training') {
        game.phase = 'training';
        game.buyTime = 0;
        game.roundTime = 0;
        if (game.revealPulseTimer && game.revealPulseTimer > 0) {
            game.revealPulseTimer = Math.max(0, game.revealPulseTimer - dt);
        }
        return;
    }

    // En deathmatch, pas de phase d'achat ni de timer de round
    if (game.mode === 'deathmatch') {
        game.phase = 'active';
        game.buyTime = 0;
        game.roundTime = 999; // Temps illimité en deathmatch

        if (game.revealPulseTimer && game.revealPulseTimer > 0) {
            game.revealPulseTimer = Math.max(0, game.revealPulseTimer - dt);
        }
        return;
    }

    // Phase d'achat pour les modes compétitifs
    if (game.phase === 'buy' && game.buyTime > 0) {
        game.buyTime -= dt;

        // Mettre à jour l'affichage du temps d'achat
        const buyTimeDisplay = document.getElementById('buy-time-remaining');
        if (buyTimeDisplay) {
            buyTimeDisplay.textContent = Math.ceil(game.buyTime);
        }

        if (game.buyTime <= 0) {
            game.phase = 'active';
            game.buyTime = 0;

            // Fermer automatiquement le menu d'achat
            closeBuyMenu();

            // Notification de fin de phase d'achat
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Phase d\'achat terminée',
                    'La partie commence !',
                    'info',
                    3000
                );
            }

            // Donner la bombe à un attaquant si nécessaire
            if (isBombMode() && player.team === 'attackers' && !game.bomb.carrier && !game.bomb.dropped) {
                assignBombToLocalPlayer();
            }
        }
    } else if (game.phase === 'active' && game.roundTime > 0) {
        game.roundTime = Math.max(0, game.roundTime - dt);
        if (game.roundTime <= 0) {
            if (isBombMode()) {
                if (game.bomb.planted) {
                    endRound('bomb_exploded');
                } else {
                    endRound('time_up');
                }
            } else {
                endRound('time_up');
            }
        }
    }

    if (game.revealPulseTimer && game.revealPulseTimer > 0) {
        game.revealPulseTimer = Math.max(0, game.revealPulseTimer - dt);
    }
}

// ========================================
// SYSTÈME DE TIR AVANCÉ
// ========================================

function shoot() {
    if (window.SpectatorSystem?.isEnabled?.()) return;
    if (!player.weapon || player.reloading) return;
    if (player.isPlanting || player.isDefusing) return;
    
    const now = Date.now();
    if (now - player.lastShot < player.weapon.fireRate) return;
    
    if (player.weapon.ammo <= 0) {
        if (player.weapon.totalAmmo > 0) {
            reload();
        }
        return;
    }
    
    player.lastShot = now;
    player.weapon.ammo--;
    
    // Recul progressif
    const recoilStep = player.weapon.recoilStep || 0;
    const maxRecoil = player.weapon.maxRecoil || 0.8;
    player.recoilKick = Math.min((player.recoilKick || 0) + recoilStep, maxRecoil);

    // Spread
    const movementSpread = player.weapon.spread * (player.sprinting ? 2 : 1);
    const spread = movementSpread * (1 + (player.recoilKick || 0));
    const angle = player.angle + (Math.random() - 0.5) * spread;
    
    createBullet(angle);
    createMuzzleFlash();
    addCameraShake(player.weapon.cameraRecoil || 0.45);
    
    updateAmmoDisplay();
}

function createBullet(angle) {
    const startX = player.x + player.width / 2 + Math.cos(angle) * 20;
    const startY = player.y + player.height / 2 + Math.sin(angle) * 20;
    
    bullets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * player.weapon.bulletSpeed,
        vy: Math.sin(angle) * player.weapon.bulletSpeed,
        damage: player.weapon.damage * (player.damageMultiplier || 1),
        penetration: (player.weapon.penetration || 0) + (player.extraPenetration || 0),
        size: player.weapon.bulletSize,
        owner: 'player',
        team: player.team,
        lifetime: 3,
        distance: 0,
        penetrationCount: 0
    });

    if (trainingState.active) {
        trainingState.stats.shots += 1;
    }
}

function checkBulletObjectCollision(bullet, obj) {
    return bullet.x > obj.x &&
           bullet.x < obj.x + obj.width &&
           bullet.y > obj.y &&
           bullet.y < obj.y + obj.height;
}

function handleBulletObjectCollision(bullet, obj, bulletIndex) {
    // Dégâts à l'objet
    if (obj.destructible) {
        const damage = bullet.damage * (1 - obj.damageReduction);
        obj.health -= damage;
        
        createImpactEffect(bullet.x, bullet.y, obj.color);
        showDamageNumber(bullet.x, bullet.y, Math.floor(damage));
        
        if (obj.health <= 0) {
            destroyObject(obj);
        }
    }

    obj.hitTimer = Math.max(obj.hitTimer || 0, 0.25);
    
    // Pénétration
    if (obj.penetrable && bullet.penetration > bullet.penetrationCount) {
        bullet.penetrationCount++;
        bullet.damage *= (1 - obj.damageReduction);
        createPenetrationEffect(bullet.x, bullet.y);
    } else {
        bullets.splice(bulletIndex, 1);
        createImpactEffect(bullet.x, bullet.y, obj.color);
    }
}

function destroyObject(obj) {
    obj.destroyed = true;
    
    // Explosion si baril
    if (obj.explosive) {
        createExplosion(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.explosionRadius, obj.explosionDamage);
    }
    
    // Particules de destruction
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particles.push({
            x: obj.x + obj.width / 2,
            y: obj.y + obj.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1 + Math.random(),
            maxLife: 1,
            color: obj.color,
            size: 3 + Math.random() * 5,
            gravity: true
        });
    }
    
    addCameraShake(0.5); // Réduit de 5 à 0.5 pour moins de secousses
}

function createExplosion(x, y, radius, damage) {
    // Particules d'explosion
    for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            color: ['#ff6600', '#ff9900', '#ffcc00'][Math.floor(Math.random() * 3)],
            size: 5 + Math.random() * 10
        });
    }
    
    // Dégâts aux joueurs dans le rayon
    const dist = Math.hypot(player.x - x, player.y - y);
    if (dist < radius) {
        const dmg = damage * (1 - dist / radius);
        player.health -= dmg;
        if (player.health < 0) player.health = 0;
        showDamageNumber(player.x, player.y, Math.floor(dmg));
    }
    
    // Dégâts aux autres objets
    for (const obj of gameObjects) {
        if (obj.destroyed || !obj.destructible) continue;
        const objDist = Math.hypot((obj.x + obj.width / 2) - x, (obj.y + obj.height / 2) - y);
        if (objDist < radius) {
            const dmg = damage * (1 - objDist / radius);
            obj.health -= dmg;
            if (obj.health <= 0) {
                destroyObject(obj);
            }
        }
    }
    
    addCameraShake(1.5); // Réduit de 10 à 1.5 pour moins de secousses
}

function checkBulletPlayerCollision(bullet, targetPlayer) {
    if (!targetPlayer.alive || bullet.team === targetPlayer.team) return false;
    
    return bullet.x > targetPlayer.x &&
           bullet.x < targetPlayer.x + 30 &&
           bullet.y > targetPlayer.y &&
           bullet.y < targetPlayer.y + 30;
}

function hitPlayer(targetPlayer, damage, ownerId) {
    // Dégâts avec armure
    let finalDamage = damage;
    if (targetPlayer.armor > 0) {
        const armorAbsorb = Math.min(damage * 0.5, targetPlayer.armor);
        targetPlayer.armor -= armorAbsorb;
        finalDamage -= armorAbsorb;
    }
    
    targetPlayer.health -= finalDamage;
    showDamageNumber(targetPlayer.x, targetPlayer.y, Math.floor(finalDamage), true);
    
    if (targetPlayer.health <= 0) {
        targetPlayer.health = 0;
        targetPlayer.alive = false;

        // Dropper l'arme du joueur tué
        if (targetPlayer.weapon && targetPlayer !== player) {
            droppedWeapons.push({
                x: targetPlayer.x + targetPlayer.width / 2,
                y: targetPlayer.y + targetPlayer.height / 2,
                weapon: { ...targetPlayer.weapon },
                skin: targetPlayer.weaponSkin || null,
                ownerId: targetPlayer.id || 'unknown'
            });
        }

        if (ownerId === 'player') {
            player.kills++;
            player.abilities.ultimate.points = Math.min(
                player.abilities.ultimate.points + 1,
                player.abilities.ultimate.maxPoints
            );
            if (player.abilities.ultimate.points >= player.abilities.ultimate.maxPoints) {
                player.abilities.ultimate.ready = true;
            }

            // Ajouter une orbe d'âme pour Reyna
            if (player.agentId === 'reyna') {
                player.soulOrbs = Math.min(
                    (player.soulOrbs || 0) + 1,
                    player.maxSoulOrbs || 4
                );
                if (window.NotificationSystem) {
                    window.NotificationSystem.show(
                        'Orbe d\'âme',
                        `+1 Orbe (${player.soulOrbs}/${player.maxSoulOrbs})`,
                        'achievement',
                        2000
                    );
                }
            }
        }
    }
}

function reload() {
    if (window.SpectatorSystem?.isEnabled?.()) return;
    if (player.reloading || player.weapon.ammo === player.weapon.maxAmmo) return;
    if (player.weapon.totalAmmo <= 0) return;
    
    player.reloading = true;
    
    const reloadDuration = player.weapon.reloadTime * (player.reloadMultiplier || 1);
    
    setTimeout(() => {
        const ammoNeeded = player.weapon.maxAmmo - player.weapon.ammo;
        const ammoToReload = Math.min(ammoNeeded, player.weapon.totalAmmo);
        
        player.weapon.ammo += ammoToReload;
        player.weapon.totalAmmo -= ammoToReload;
        player.reloading = false;
        
        updateAmmoDisplay();
    }, reloadDuration * 1000);
}

// ========================================
// EFFETS VISUELS
// ========================================

function createMuzzleFlash() {
    const flashX = player.x + player.width / 2 + Math.cos(player.angle) * 25;
    const flashY = player.y + player.height / 2 + Math.sin(player.angle) * 25;
    
    for (let i = 0; i < 8; i++) {
        const angle = player.angle + (Math.random() - 0.5) * 0.8;
        particles.push({
            x: flashX,
            y: flashY,
            vx: Math.cos(angle) * (3 + Math.random() * 3),
            vy: Math.sin(angle) * (3 + Math.random() * 3),
            life: 0.15,
            maxLife: 0.15,
            color: ['#ffff00', '#ffaa00', '#ff8800'][Math.floor(Math.random() * 3)],
            size: 3 + Math.random() * 4
        });
    }
}

function createImpactEffect(x, y, color = '#888888') {
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * (2 + Math.random() * 2),
            vy: Math.sin(angle) * (2 + Math.random() * 2),
            life: 0.5 + Math.random() * 0.3,
            maxLife: 0.5,
            color: color,
            size: 2 + Math.random() * 3
        });
    }
}

function createPenetrationEffect(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0.3,
            maxLife: 0.3,
            color: '#ffff00',
            size: 2
        });
    }
}

function createBloodEffect(x, y) {
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * (1 + Math.random() * 3),
            vy: Math.sin(angle) * (1 + Math.random() * 3),
            life: 0.8 + Math.random() * 0.4,
            maxLife: 1,
            color: ['#8B0000', '#A00000', '#B00000'][Math.floor(Math.random() * 3)],
            size: 2 + Math.random() * 4,
            gravity: true
        });
    }
}

function showDamageNumber(x, y, damage, isPlayer = false) {
    damageNumbers.push({
        x: x,
        y: y - 20,
        damage: damage,
        life: 1.5,
        isPlayer: isPlayer
    });
}

function addCameraShake(intensity) {
    if (intensity <= 0) return;
    game.camera.shake = Math.min((game.camera.shake || 0) + intensity, 8);
}

// ========================================
// COMPÉTENCES (ABILITIES)
// ========================================

function useAbility(abilityKey) {
    if (window.SpectatorSystem?.isEnabled?.()) return;
    const ability = player.abilities?.[abilityKey];
    if (!ability) return;

    const isUltimate = abilityKey === 'ultimate';

    if (ability.cooldown > 0) return;
    if (!isUltimate && ability.ready === false) return;

    if (isUltimate) {
        if (ability.maxPoints && ability.points < ability.maxPoints) return;
    }

    let executed = false;
    if (typeof ability.execute === 'function') {
        try {
            ability.execute();
            executed = true;
        } catch (error) {
        }
    }

    if (!executed) {
        // Fallback vers les anciennes mécaniques
        switch (abilityKey) {
            case 'ability1':
                throwSmokeGrenade();
                break;
            case 'ability2':
                throwFlashbang();
                break;
            case 'ultimate':
                activateUltimate();
                break;
            default:
                return;
        }
    }

    if (ability.maxCooldown && ability.maxCooldown > 0) {
        ability.cooldown = ability.maxCooldown;
        ability.ready = false;
    } else if (!isUltimate) {
        ability.cooldown = 0;
        ability.ready = true;
    }

    if (isUltimate) {
        ability.points = 0;
        ability.ready = false;
    }
}

function throwSmokeGrenade(options = {}) {
    const throwDistance = options.distance || 300;
    const target = {
        x: player.x + Math.cos(player.angle) * throwDistance,
        y: player.y + Math.sin(player.angle) * throwDistance
    };

    const spawnSmoke = () => {
        smokeGrenades.push({
            x: target.x,
            y: target.y,
            radius: 0,
            maxRadius: options.radius || 150,
            lifetime: options.duration || 15,
            opacity: options.opacity || 0.7,
            color: options.color || 'rgba(200, 200, 200, 1)'
        });
        createImpactEffect(target.x, target.y, options.impactColor || '#999999');
    };

    const device = launchTacticalDevice({
        type: 'smoke',
        target,
        travelTime: options.travelTime || 0.5,
        arcHeight: options.arcHeight !== undefined ? options.arcHeight : 120,
        spinSpeed: options.spinSpeed ?? 10,
        onImpact: spawnSmoke
    });

    if (!device) {
        spawnSmoke();
    }
}

function throwFlashbang() {
    const throwDistance = 250;
    const targetX = player.x + Math.cos(player.angle) * throwDistance;
    const targetY = player.y + Math.sin(player.angle) * throwDistance;
    
    flashbangs.push({
        x: targetX,
        y: targetY,
        radius: 200,
        lifetime: 0.3,
        intensity: 1
    });
    
    // Flash du joueur si dans le rayon
    const dist = Math.hypot(player.x - targetX, player.y - targetY);
    if (dist < 200) {
        // Effet de flash (à implémenter dans le rendu)
    }
}

function activateUltimate() {
    // Ultimate: Révèle les ennemis pendant 5 secondes
    
    // Effet visuel
    for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 100;
        particles.push({
            x: player.x + Math.cos(angle) * dist,
            y: player.y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            life: 2,
            maxLife: 2,
            color: '#00ffff',
            size: 4
        });
    }
}

function getAbilityTarget(distance = 260) {
    return {
        x: player.x + Math.cos(player.angle) * distance,
        y: player.y + Math.sin(player.angle) * distance
    };
}

// ========================================
// PROJECTILES TACTIQUES (CAPACITÉS)
// ========================================

function easeInOutSine(t) {
    const clamped = Math.max(0, Math.min(1, t));
    return 0.5 * (1 - Math.cos(Math.PI * clamped));
}

function triggerThrowAnimation(duration = 0.4, style = null) {
    if (!player) return;
    if (!player.throwAnimation) {
        player.throwAnimation = { timer: 0, duration: 0, style: null };
    }
    player.throwAnimation.timer = duration;
    player.throwAnimation.duration = duration;
    player.throwAnimation.style = style;
}

function launchTacticalDevice(config = {}) {
    if (!player || !player.alive) return null;

    const target = config.target;
    if (!target) return null;

    const startOffset = config.startOffset !== undefined ? config.startOffset : 22;
    const startX = player.x + player.width / 2 + Math.cos(player.angle) * startOffset;
    const startY = player.y + player.height / 2 + Math.sin(player.angle) * startOffset;

    const style = {
        ...DEFAULT_TACTICAL_DEVICE_STYLE,
        ...(config.type ? (TACTICAL_DEVICE_STYLES[config.type] || {}) : {}),
        ...(config.style || {})
    };

    const travelTime = Math.max(0.1, config.travelTime || 0.45);
    const arcHeight = config.arcHeight !== undefined ? config.arcHeight : 120;
    const directionAngle = Math.atan2(target.y - startY, target.x - startX);

    const device = {
        type: config.type || 'generic',
        startX,
        startY,
        x: startX,
        y: startY,
        targetX: target.x,
        targetY: target.y,
        travelTime,
        arcHeight,
        elapsed: 0,
        rotation: 0,
        spinSpeed: config.spinSpeed ?? 12,
        style,
        shadowX: startX,
        shadowY: startY,
        directionAngle,
        progress: 0,
        easedProgress: 0,
        onImpact: typeof config.onImpact === 'function' ? config.onImpact : null
    };

    tacticalDevices.push(device);
    triggerThrowAnimation(Math.min(travelTime, 0.55), style);
    return device;
}

function updateTacticalDevices(dt) {
    for (let i = tacticalDevices.length - 1; i >= 0; i--) {
        const device = tacticalDevices[i];
        device.elapsed += dt;

        const progress = Math.min(device.elapsed / device.travelTime, 1);
        const eased = easeInOutSine(progress);
        const groundX = device.startX + (device.targetX - device.startX) * eased;
        const groundY = device.startY + (device.targetY - device.startY) * eased;

        device.shadowX = groundX;
        device.shadowY = groundY;
        const arc = Math.sin(Math.PI * eased) * device.arcHeight;
        device.x = groundX;
        device.y = groundY - arc;
        device.progress = progress;
        device.easedProgress = eased;

        if (device.spinSpeed) {
            device.rotation += device.spinSpeed * dt;
        }

        if (progress >= 1) {
            if (device.onImpact) {
                try {
                    device.onImpact(device);
                } catch (error) {
                }
            }
            tacticalDevices.splice(i, 1);
        }
    }
}

function updatePlayerThrowAnimation(dt) {
    if (!player.throwAnimation) return;
    if (player.throwAnimation.timer > 0) {
        player.throwAnimation.timer = Math.max(0, player.throwAnimation.timer - dt);
        if (player.throwAnimation.timer === 0) {
            player.throwAnimation.style = null;
        }
    }
}

function drawTacticalDevices() {
    for (const device of tacticalDevices) {
        const style = device.style || DEFAULT_TACTICAL_DEVICE_STYLE;
        const size = style.size || DEFAULT_TACTICAL_DEVICE_STYLE.size;

        // Ombre au sol
        gameContext.save();
        gameContext.translate(device.shadowX, device.shadowY);
        gameContext.scale(1, 0.45);
        gameContext.fillStyle = 'rgba(0, 0, 0, 0.25)';
        gameContext.beginPath();
        gameContext.arc(0, 0, size * 1.1, 0, Math.PI * 2);
        gameContext.fill();
        gameContext.restore();

        // Traînée lumineuse
        if (style.trail) {
            const tailLength = 12 + size * 0.8;
            const tailX = device.x - Math.cos(device.directionAngle) * tailLength * (1 - device.easedProgress * 0.35);
            const tailY = device.y - Math.sin(device.directionAngle) * tailLength * (1 - device.easedProgress * 0.35);
            gameContext.strokeStyle = style.trail;
            gameContext.lineWidth = 2;
            gameContext.beginPath();
            gameContext.moveTo(tailX, tailY);
            gameContext.lineTo(device.x, device.y);
            gameContext.stroke();
        }

        gameContext.save();
        gameContext.translate(device.x, device.y);
        if (device.rotation) {
            gameContext.rotate(device.rotation);
        }

        if (style.glow) {
            gameContext.fillStyle = style.glow;
            gameContext.beginPath();
            gameContext.arc(0, 0, size + 4, 0, Math.PI * 2);
            gameContext.fill();
        }

        gameContext.fillStyle = style.fill || DEFAULT_TACTICAL_DEVICE_STYLE.fill;
        gameContext.beginPath();
        gameContext.arc(0, 0, size, 0, Math.PI * 2);
        gameContext.fill();

        if (style.accent) {
            gameContext.fillStyle = style.accent;
            gameContext.beginPath();
            gameContext.arc(size * 0.3, -size * 0.3, size * 0.35, 0, Math.PI * 2);
            gameContext.fill();
        }

        gameContext.restore();
    }
}

function spawnRevealBeacon(options = {}) {
    const target = getAbilityTarget(options.distance || 260);
    const deployBeacon = () => {
        revealBeacons.push({
            x: target.x,
            y: target.y,
            radius: options.radius || 220,
            duration: options.duration || 6,
            pulse: 0,
            pulseSpeed: options.pulseSpeed || 4
        });
        createImpactEffect(target.x, target.y, '#00d4ff');
    };

    const device = launchTacticalDevice({
        type: 'reveal',
        target,
        travelTime: options.travelTime || 0.45,
        arcHeight: options.arcHeight !== undefined ? options.arcHeight : 100,
        spinSpeed: options.spinSpeed ?? 9,
        onImpact: deployBeacon
    });

    if (!device) {
        deployBeacon();
    }
}

function activateRevealPulse(options = {}) {
    const duration = options.duration || 6;
    game.revealPulseTimer = Math.max(game.revealPulseTimer || 0, duration);
}

function applySpeedBoost(options = {}) {
    const duration = options.duration || 2;
    const multiplier = options.speedMultiplier || 1.5;
    player.effects.push({
        type: 'speedBoost',
        duration,
        value: multiplier
    });
    updateStatusEffects(0);
}

function spawnSlowField(options = {}) {
    const target = getAbilityTarget(options.distance || 220);
    const createField = () => {
        slowFields.push({
            x: target.x,
            y: target.y,
            radius: options.radius || 200,
            duration: options.duration || 8,
            slowMultiplier: options.slowMultiplier || 0.6,
            pulse: 0
        });
        createImpactEffect(target.x, target.y, '#7dd3fc');
    };

    const device = launchTacticalDevice({
        type: 'slow',
        target,
        travelTime: options.travelTime || 0.5,
        arcHeight: options.arcHeight !== undefined ? options.arcHeight : 110,
        spinSpeed: options.spinSpeed ?? 8,
        onImpact: createField
    });

    if (!device) {
        createField();
    }
}

function enableOverchargeMode(options = {}) {
    const duration = options.duration || 8;
    const multiplier = options.damageMultiplier || 1.4;
    const penetration = options.penetration || 1;
    player.effects.push({
        type: 'damageBoost',
        duration,
        value: multiplier,
        penetration
    });
    updateStatusEffects(0);
}

function deployTemporaryBarrier(options = {}) {
    const width = options.width || 220;
    const height = options.height || 40;
    const duration = options.duration || 8;
    const health = options.health || 250;
    const target = getAbilityTarget(options.distance || 180);

    const placeBarrier = () => {
        const barrier = {
            x: target.x - width / 2,
            y: target.y - height / 2,
            width,
            height,
            type: 'temp_barrier',
            name: 'Barrière',
            health,
            maxHealth: health,
            penetrable: false,
            destructible: true,
            damageReduction: 0.1,
            color: '#3AA7FF',
            expiresAt: performance.now() + duration * 1000
        };

        gameObjects.push(barrier);
        createImpactEffect(target.x, target.y, '#60a5fa');
    };

    const device = launchTacticalDevice({
        type: 'barrier',
        target,
        travelTime: options.travelTime || 0.55,
        arcHeight: options.arcHeight !== undefined ? options.arcHeight : 90,
        spinSpeed: options.spinSpeed ?? 6,
        onImpact: placeBarrier
    });

    if (!device) {
        placeBarrier();
    }
}

function applyArmorRegenEffect(options = {}) {
    const duration = options.duration || 6;
    const amount = options.totalArmor || 30;
    armorRegenEffects.push({
        totalArmor: amount,
        remaining: amount,
        duration,
        initialDuration: duration
    });
}

function deploySentryTurret(options = {}) {
    const target = getAbilityTarget(options.distance || 180);
    const spawnTurret = () => {
        sentryTurrets.push({
            x: target.x,
            y: target.y,
            duration: options.duration || 15,
            damage: options.damage || 18,
            fireRate: options.fireRate || 0.4,
            range: options.range || 360,
            cooldown: 0,
            angle: 0
        });
        createImpactEffect(target.x, target.y, '#ffd166');
    };

    const device = launchTacticalDevice({
        type: 'sentry',
        target,
        travelTime: options.travelTime || 0.6,
        arcHeight: options.arcHeight !== undefined ? options.arcHeight : 105,
        spinSpeed: options.spinSpeed ?? 7,
        onImpact: spawnTurret
    });

    if (!device) {
        spawnTurret();
    }
}

// ========================================
// COLLISIONS
// ========================================

function checkCollision(x, y, width, height) {
    for (const obj of gameObjects) {
        if (obj.destroyed) continue;

        // Les barrières de spawn disparaissent après la phase d'achat
        if (obj.isSpawnBarrier && game.phase !== 'buy') continue;

        // Les barrières de spawn ne bloquent que l'équipe adverse
        if (obj.isSpawnBarrier && obj.team && obj.team !== player.team) continue;

        if (x + width > obj.x &&
            x < obj.x + obj.width &&
            y + height > obj.y &&
            y < obj.y + obj.height) {
            return true;
        }
    }
    return false;
}

// ========================================
// INTERFACE UTILISATEUR
// ========================================

function updateUI() {
    // Timer
    const timerElement = document.getElementById('round-timer');
    if (timerElement) {
        const time = game.phase === 'buy' ? game.buyTime : game.roundTime;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Afficher/masquer le hint d'achat selon la phase
    const buyHint = document.getElementById('buy-hint');
    if (buyHint) {
        const canBuy = game.mode === 'deathmatch' || (game.phase === 'buy' && game.buyTime > 0);
        if (canBuy) {
            buyHint.classList.remove('hidden');
        } else {
            buyHint.classList.add('hidden');
        }
    }

    const mapData = MAPS[game.currentMap];
    
    // Score
    const attackersScore = document.getElementById('attackers-score');
    const defendersScore = document.getElementById('defenders-score');
    if (attackersScore) attackersScore.textContent = game.attackersScore;
    if (defendersScore) defendersScore.textContent = game.defendersScore;
    
    // Round
    const roundNumber = document.getElementById('round-number');
    if (roundNumber) roundNumber.textContent = `Round ${game.round}`;
    
    const healthValue = document.getElementById('player-health');
    if (healthValue) {
        healthValue.textContent = Math.max(0, Math.floor(player.health));
    }
    
    const armorValue = document.getElementById('player-armor');
    if (armorValue) {
        armorValue.textContent = Math.max(0, Math.floor(player.armor));
    }
    
    const moneyValue = document.getElementById('player-money');
    if (moneyValue) {
        moneyValue.textContent = Math.max(0, Math.floor(player.money));
    }
    
    const scoreboardAttackers = document.getElementById('scoreboard-attackers-score');
    if (scoreboardAttackers) {
        scoreboardAttackers.textContent = game.attackersScore;
    }
    const scoreboardDefenders = document.getElementById('scoreboard-defenders-score');
    if (scoreboardDefenders) {
        scoreboardDefenders.textContent = game.defendersScore;
    }
    
    const scoreboardMode = document.getElementById('scoreboard-mode');
    if (scoreboardMode) {
        scoreboardMode.textContent = window.gameModes?.[game.mode]?.name || game.mode;
    }
    
    const scoreboardMap = document.getElementById('scoreboard-map');
    if (scoreboardMap) {
        scoreboardMap.textContent = mapData?.name || game.currentMap;
    }
    
    const weaponNameElement = document.getElementById('current-weapon');
    if (weaponNameElement && player.weapon) {
        weaponNameElement.textContent = player.weapon.name;
    }
    
    if (minimapNameElement && mapData) {
        minimapNameElement.textContent = mapData.name;
    }

    updateAmmoDisplay();
    updateMinimap();
    updateBombHint();
    updateAbilitiesDisplay();
}

function updateAbilitiesDisplay() {
    // Récupérer l'agent actuel du joueur
    const currentAgentId = window.currentAgentId || 'reyna';
    const agentData = window.AgentsRegistry?.[currentAgentId];

    if (!agentData) return;

    // Ability 1 (C)
    const ability1 = player.abilities.ability1;
    const ability1Slot = document.getElementById('ability-c');
    const ability1Icon = ability1Slot?.querySelector('.ability-icon img');
    const ability1Cooldown = document.getElementById('ability-c-cooldown');

    if (ability1Slot && agentData.abilities.ability1) {
        if (ability1Icon) {
            ability1Icon.src = agentData.abilities.ability1.icon || HUD_DEFAULT_ABILITY_ICON;
            ability1Icon.alt = agentData.abilities.ability1.name || 'Capacité';
        }

        // Pour Reyna, afficher le nombre d'orbes au lieu du cooldown
        if (player.agentId === 'reyna' && agentData.abilities.ability1.requiresSoulOrb) {
            const orbs = player.soulOrbs || 0;
            if (ability1Cooldown) {
                ability1Cooldown.textContent = orbs;
                ability1Cooldown.style.display = 'block';
            }
            if (orbs > 0) {
                ability1Slot.classList.remove('on-cooldown');
                ability1Slot.classList.add('ready');
            } else {
                ability1Slot.classList.add('on-cooldown');
                ability1Slot.classList.remove('ready');
            }
        } else if (ability1.cooldown > 0) {
            ability1Slot.classList.add('on-cooldown');
            ability1Slot.classList.remove('ready');
            if (ability1Cooldown) {
                ability1Cooldown.textContent = Math.ceil(ability1.cooldown);
                ability1Cooldown.style.display = 'block';
            }
        } else {
            ability1Slot.classList.remove('on-cooldown');
            ability1Slot.classList.add('ready');
            if (ability1Cooldown) {
                ability1Cooldown.style.display = 'none';
            }
        }
    } else {
        if (ability1Icon) {
            ability1Icon.src = HUD_DEFAULT_ABILITY_ICON;
            ability1Icon.alt = 'Capacité';
        }
    }

    // Ability 2 (A)
    const ability2 = player.abilities.ability2;
    const ability2Slot = document.getElementById('ability-a');
    const ability2Icon = ability2Slot?.querySelector('.ability-icon img');
    const ability2Cooldown = document.getElementById('ability-a-cooldown');

    if (ability2Slot && agentData.abilities.ability2) {
        if (ability2Icon) {
            ability2Icon.src = agentData.abilities.ability2.icon || HUD_DEFAULT_ABILITY_ICON;
            ability2Icon.alt = agentData.abilities.ability2.name || 'Capacité';
        }

        // Pour Reyna, afficher le nombre d'orbes au lieu du cooldown
        if (player.agentId === 'reyna' && agentData.abilities.ability2.requiresSoulOrb) {
            const orbs = player.soulOrbs || 0;
            if (ability2Cooldown) {
                ability2Cooldown.textContent = orbs;
                ability2Cooldown.style.display = 'block';
            }
            if (orbs > 0) {
                ability2Slot.classList.remove('on-cooldown');
                ability2Slot.classList.add('ready');
            } else {
                ability2Slot.classList.add('on-cooldown');
                ability2Slot.classList.remove('ready');
            }
        } else if (ability2.cooldown > 0) {
            ability2Slot.classList.add('on-cooldown');
            ability2Slot.classList.remove('ready');
            if (ability2Cooldown) {
                ability2Cooldown.textContent = Math.ceil(ability2.cooldown);
                ability2Cooldown.style.display = 'block';
            }
        } else {
            ability2Slot.classList.remove('on-cooldown');
            ability2Slot.classList.add('ready');
            if (ability2Cooldown) {
                ability2Cooldown.style.display = 'none';
            }
        }
    } else {
        if (ability2Icon) {
            ability2Icon.src = HUD_DEFAULT_ABILITY_ICON;
            ability2Icon.alt = 'Capacité';
        }
    }

    // Ultimate (X)
    const ultimate = player.abilities.ultimate;
    const ultimateSlot = document.getElementById('ability-x');
    const ultimateIcon = ultimateSlot?.querySelector('.ability-icon img');
    const ultimatePoints = document.getElementById('ability-x-points');

    if (ultimateSlot && agentData.abilities.ultimate) {
        if (ultimateIcon) {
            ultimateIcon.src = agentData.abilities.ultimate.icon || HUD_DEFAULT_ABILITY_ICON;
            ultimateIcon.alt = agentData.abilities.ultimate.name || 'Capacité';
        }

        if (ultimatePoints) {
            ultimatePoints.textContent = `${ultimate.points}/${ultimate.maxPoints}`;
        }

        if (ultimate.ready || ultimate.points >= ultimate.maxPoints) {
            ultimateSlot.classList.add('ready');
        } else {
            ultimateSlot.classList.remove('ready');
        }
    } else if (ultimateIcon) {
        ultimateIcon.src = HUD_DEFAULT_ABILITY_ICON;
        ultimateIcon.alt = 'Capacité';
    }
}

function updateBombHint() {
    const bombHint = document.getElementById('bomb-hint');
    const bombHintText = document.getElementById('bomb-hint-text');
    if (!bombHint || !isBombMode() || !player.alive || game.phase !== 'active') {
        if (bombHint) bombHint.classList.add('hidden');
        return;
    }

    const center = getPlayerCenter();
    let shouldShow = false;
    let hintText = '';

    // Attaquant avec la bombe dans un site - vérifier si on est dans un site ET si on est en train de planter ou peut planter
    if (player.team === 'attackers' && playerHasBomb() && !game.bomb.planted) {
        const site = getBombSiteAt(center.x, center.y);
        if (site && !player.isPlanting) {
            shouldShow = true;
            hintText = `Appuyez sur <kbd>E</kbd> pour planter la spike (Site ${site.name})`;
        } else if (player.isPlanting) {
            shouldShow = true;
            const progress = Math.floor((player.actionProgress || 0) * 100);
            hintText = `Plantation en cours... ${progress}%`;
        }
    }
    // Attaquant récupérant la bombe tombée
    else if (player.team === 'attackers' && game.bomb.dropped && game.bomb.x !== null && game.bomb.y !== null) {
        const distance = Math.hypot(center.x - game.bomb.x, center.y - game.bomb.y);
        if (distance <= 100) {
            shouldShow = true;
            hintText = 'Appuyez sur <kbd>E</kbd> pour récupérer la spike';
        }
    }
    // Défenseur désamorçant - montrer seulement si la bombe est plantée
    else if (player.team === 'defenders' && game.bomb.planted && game.bomb.x !== null && game.bomb.y !== null) {
        const distance = Math.hypot(center.x - game.bomb.x, center.y - game.bomb.y);
        if (distance <= 100) {
            if (!player.isDefusing) {
                shouldShow = true;
                hintText = 'Appuyez sur <kbd>E</kbd> pour désamorcer la spike';
            } else {
                shouldShow = true;
                const progress = Math.floor((player.actionProgress || 0) * 100);
                hintText = `Désamorçage en cours... ${progress}%`;
            }
        }
    }

    if (shouldShow && bombHintText) {
        bombHint.classList.remove('hidden');
        bombHintText.innerHTML = hintText;
    } else {
        bombHint.classList.add('hidden');
    }
}

function updateAmmoDisplay() {
    if (!player.weapon) return;
    
    const currentAmmoElement = document.getElementById('current-ammo');
    if (currentAmmoElement) {
        currentAmmoElement.textContent = Math.max(0, Math.floor(player.weapon.ammo));
    }
    
    const totalAmmoElement = document.getElementById('total-ammo');
    if (totalAmmoElement) {
        totalAmmoElement.textContent = Math.max(0, Math.floor(player.weapon.totalAmmo));
    }
}

function refreshWeaponUI() {
    const weaponNameElement = document.getElementById('current-weapon');
    if (weaponNameElement && player.weapon) {
        weaponNameElement.textContent = player.weapon.name;
    }
    updateAmmoDisplay();
}

function updateMinimap(forceLayout = false) {
    if (!minimapContext || !minimapCanvas) return;
    const map = MAPS[game.currentMap];
    if (!map) return;
    if (forceLayout || minimapCurrentMap !== game.currentMap) {
        updateMinimapLayout();
    }

    minimapContext.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    drawMinimapBackground(map);
    drawMinimapWalls(map);
    drawMinimapBombSites(map);
    drawMinimapPlayers();
    drawMinimapBomb();
}

function drawMinimapBackground(map) {
    minimapContext.fillStyle = MINIMAP_SETTINGS.background;
    minimapContext.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    minimapContext.strokeStyle = MINIMAP_SETTINGS.border;
    minimapContext.lineWidth = 2;
    minimapContext.strokeRect(
        minimapOffset.x,
        minimapOffset.y,
        map.width * minimapScale,
        map.height * minimapScale
    );
}

function drawMinimapWalls(map) {
    minimapContext.fillStyle = MINIMAP_SETTINGS.wall;
    map.walls?.forEach(wall => {
        const projected = projectToMinimap(wall.x, wall.y);
        minimapContext.fillRect(
            projected.x,
            projected.y,
            wall.width * minimapScale,
            wall.height * minimapScale
        );
    });
}

function drawMinimapBombSites(map) {
    if (!map.bombSites) return;
    map.bombSites.forEach(site => {
        const projected = projectToMinimap(site.x, site.y);
        const width = site.width * minimapScale;
        const height = site.height * minimapScale;
        minimapContext.fillStyle = game.bomb.site === site.name ? MINIMAP_SETTINGS.bombSiteActive : MINIMAP_SETTINGS.bombSite;
        minimapContext.fillRect(projected.x, projected.y, width, height);
        minimapContext.strokeStyle = MINIMAP_SETTINGS.border;
        minimapContext.lineWidth = 1;
        minimapContext.strokeRect(projected.x, projected.y, width, height);
        minimapContext.fillStyle = '#ffffff';
        minimapContext.font = '10px Arial';
        minimapContext.textAlign = 'center';
        minimapContext.fillText(`Site ${site.name}`, projected.x + width / 2, projected.y + height / 2 + 3);
    });
}

function drawMinimapPlayers() {
    const playerRadius = Math.max(3, 5 * minimapScale);
    const playerCenter = getPlayerCenter();
    const playerPos = projectToMinimap(playerCenter.x, playerCenter.y);

    drawMinimapPlayerDot(playerPos.x, playerPos.y, playerRadius, MINIMAP_SETTINGS.player, player.angle, playerHasBomb());
    Object.values(otherPlayers).forEach(other => {
        if (!other) return;
        if (other.team && other.team === player.team) {
            if (other.alive === false) return;
        }
        const centerX = other.x + (other.width || 0) / 2;
        const centerY = other.y + (other.height || 0) / 2;
        const projected = projectToMinimap(centerX, centerY);
        const isAlly = other.team && other.team === player.team;
        const color = isAlly ? MINIMAP_SETTINGS.ally : MINIMAP_SETTINGS.enemy;
        const otherAngle = typeof other.angle === 'number' ? other.angle : 0;
        drawMinimapPlayerDot(projected.x, projected.y, playerRadius * 0.9, color, otherAngle, false);
    });
}

function drawMinimapPlayerDot(x, y, radius, color, angle = 0, highlight = false) {
    minimapContext.fillStyle = color;
    minimapContext.beginPath();
    minimapContext.arc(x, y, radius, 0, Math.PI * 2);
    minimapContext.fill();

    if (highlight) {
        minimapContext.strokeStyle = MINIMAP_SETTINGS.bomb;
        minimapContext.lineWidth = 2;
        minimapContext.beginPath();
        minimapContext.arc(x, y, radius + 2, 0, Math.PI * 2);
        minimapContext.stroke();
    }

    const directionLength = radius * 1.6;
    minimapContext.strokeStyle = '#ffffff';
    minimapContext.lineWidth = 1;
    minimapContext.beginPath();
    minimapContext.moveTo(x, y);
    minimapContext.lineTo(
        x + Math.cos(angle) * directionLength,
        y + Math.sin(angle) * directionLength
    );
    minimapContext.stroke();
}

function drawMinimapBomb() {
    if (game.bomb.planted || game.bomb.dropped) {
        if (typeof game.bomb.x === 'number' && typeof game.bomb.y === 'number') {
            const pos = projectToMinimap(game.bomb.x, game.bomb.y);
            minimapContext.fillStyle = MINIMAP_SETTINGS.bomb;
            minimapContext.beginPath();
            minimapContext.arc(pos.x, pos.y, Math.max(3, 4 * minimapScale), 0, Math.PI * 2);
            minimapContext.fill();
        }
    }
}

function projectToMinimap(x, y) {
    return {
        x: minimapOffset.x + x * minimapScale,
        y: minimapOffset.y + y * minimapScale
    };
}

function loadObjectSprites() {
    if (objectSpritesLoaded) return;
    objectSpritesLoaded = true;

    Object.entries(SPRITE_PATHS).forEach(([type, path]) => {
        const img = new Image();
        objectSprites[type] = {
            image: img,
            loaded: false
        };
        img.onload = () => {
            objectSprites[type].loaded = true;
        };
        img.onerror = () => {
        };
        img.src = path;
    });
}

function endRound(reason) {
    if (game.phase === 'ended' || game.phase === 'match_over') return;

    cancelBombInteraction();

    let winner = null;
    let title = 'Fin du round';
    let message = '';

    switch (reason) {
        case 'bomb_exploded':
        case 'defenders_eliminated':
            winner = 'attackers';
            message = reason === 'bomb_exploded' ? 'La spike a explosé.' : 'Les attaquants remportent le round.';
            break;
        case 'bomb_defused':
        case 'time_up':
        case 'attackers_eliminated':
            winner = 'defenders';
            message = reason === 'bomb_defused' ? 'La spike a été désamorcée.' : 'Les défenseurs remportent le round.';
            break;
        default:
            message = 'Round terminé.';
            break;
    }

    if (winner === 'attackers') {
        game.attackersScore++;
        title = 'Victoire attaquants';
        if (!message) message = 'Les attaquants remportent le round.';
    } else if (winner === 'defenders') {
        game.defendersScore++;
        title = 'Victoire défenseurs';
        if (!message) message = 'Les défenseurs remportent le round.';
    }

    if (window.NotificationSystem) {
        window.NotificationSystem.show(title, message, 'round', 4000);
    }

    resetBombState();
    player.isPlanting = false;
    player.isDefusing = false;
    player.actionType = null;
    player.actionProgress = 0;

    game.roundTime = 0;
    game.buyTime = 0;
    game.phase = 'ended';

    const matchEnded = handleRoundTransition(winner, reason);

    if (!matchEnded) {
        setTimeout(() => {
            game.round++;
            resetGameState();
        }, 4000);
    }
}

function handleRoundTransition(winner, reason) {
    updateUI();
    const roundsPlayed = game.attackersScore + game.defendersScore;
    const matchEnded = checkMatchConclusion(roundsPlayed, winner, reason);
    if (matchEnded) {
        return true;
    }
    if (shouldSwapSides(roundsPlayed)) {
        swapTeamSides();
    }
    window.SpectatorSystem?.refreshAvailability?.(player);
    return false;
}

function checkTeamElimination() {
    // Ne vérifier que si le round est actif et en mode compétitif
    if (game.phase !== 'active' || game.mode === 'deathmatch') return;
    if (game.mode === 'training' || trainingState.active) return;
    if (!window.matchmakingState?.currentMatchId && Object.keys(otherPlayers).length === 0) return;

    // Compter les joueurs vivants dans chaque équipe
    let attackersAlive = player.team === 'attackers' && player.alive ? 1 : 0;
    let defendersAlive = player.team === 'defenders' && player.alive ? 1 : 0;

    for (const playerId in otherPlayers) {
        const other = otherPlayers[playerId];
        if (!other || !other.alive) continue;

        if (other.team === 'attackers') {
            attackersAlive++;
        } else if (other.team === 'defenders') {
            defendersAlive++;
        }
    }

    // Terminer le round si une équipe est entièrement éliminée
    if (attackersAlive === 0 && defendersAlive > 0) {
        endRound('attackers_eliminated');
    } else if (defendersAlive === 0 && attackersAlive > 0) {
        endRound('defenders_eliminated');
    }
}

// CORRECTION : Variable pour suivre le temps de démarrage du jeu
let gameStartTimestamp = 0;

function checkTeamDisconnection() {
    // Ne vérifier que si le jeu est en cours
    if (game.matchFinished || game.phase === 'match_over') return;
    if (game.mode === 'training' || trainingState.active) return;
    if (!window.matchmakingState?.currentMatchId) return;

    // CORRECTION : Attendre au moins 10 secondes après le démarrage du jeu
    // pour laisser le temps aux autres joueurs de se connecter
    if (Date.now() - gameStartTimestamp < 10000) {
        return;
    }

    // Compter les joueurs connectés par équipe (vivants ou morts)
    let attackersCount = player.team === 'attackers' ? 1 : 0;
    let defendersCount = player.team === 'defenders' ? 1 : 0;

    for (const playerId in otherPlayers) {
        const other = otherPlayers[playerId];
        if (!other) continue;

        if (other.team === 'attackers') {
            attackersCount++;
        } else if (other.team === 'defenders') {
            defendersCount++;
        }
    }

    // Si toute une équipe s'est déconnectée, l'autre équipe gagne
    if (attackersCount === 0 && defendersCount > 0) {
        finishMatch('defenders', 'forfeit');
        handleMatchEnd('defenders', 'forfeit');
    } else if (defendersCount === 0 && attackersCount > 0) {
        finishMatch('attackers', 'forfeit');
        handleMatchEnd('attackers', 'forfeit');
    }
}

function shouldSwapSides(roundsPlayed) {
    if (!isBombMode()) return false;
    if ((game.half || 1) > 1) return false;
    const swapRound = game.swapRounds || Math.floor((game.maxRounds || 0) / 2);
    return swapRound > 0 && roundsPlayed === swapRound;
}

function swapTeamSides() {
    player.team = player.team === 'attackers' ? 'defenders' : 'attackers';
    Object.values(otherPlayers).forEach(other => {
        if (!other || !other.team) return;
        other.team = other.team === 'attackers' ? 'defenders' : 'attackers';
    });
    game.half = (game.half || 1) + 1;
    resetBombState();
    if (window.NotificationSystem) {
        window.NotificationSystem.show('Changement de camp', 'Les équipes échangent leurs positions.', 'info', 4000);
    }
}

function checkMatchConclusion(roundsPlayed, winner, reason) {
    if (game.matchFinished) return true;
    const winCondition = game.winCondition || 13;
    const attackersReached = game.attackersScore >= winCondition;
    const defendersReached = game.defendersScore >= winCondition;

    if (attackersReached || defendersReached) {
        const winningTeam = attackersReached && defendersReached ? (winner || 'draw') : (attackersReached ? 'attackers' : 'defenders');
        finishMatch(winningTeam, 'win_condition');
        return true;
    }

    const maxRounds = game.maxRounds || 0;
    if (maxRounds && roundsPlayed >= maxRounds) {
        let finalWinner = 'draw';
        if (game.attackersScore !== game.defendersScore) {
            finalWinner = game.attackersScore > game.defendersScore ? 'attackers' : 'defenders';
        }
        finishMatch(finalWinner, reason || 'max_rounds');
        return true;
    }

    return false;
}

function finishMatch(winner, reason = 'completed') {
    if (game.matchFinished) return;
    game.matchFinished = true;
    game.phase = 'match_over';
    game.gamePaused = true;
    updateUI();
    window.SpectatorSystem?.disable?.(true);

    let title = 'Fin de partie';
    let message = 'La partie est terminée.';

    if (winner === 'attackers') {
        title = 'Victoire des attaquants';
    } else if (winner === 'defenders') {
        title = 'Victoire des défenseurs';
    } else if (winner === 'draw') {
        title = 'Match nul';
    }

    if (reason === 'forfeit') {
        message = 'La partie s\'est terminée par abandon.';
    }

    if (window.NotificationSystem) {
        window.NotificationSystem.show(title, message, 'round', 6000);
    }

    const scoreboard = document.getElementById('scoreboard');
    if (scoreboard) {
        scoreboard.classList.remove('hidden');
    }

    if (window.MatchmakingSystem && typeof window.MatchmakingSystem.finishCurrentMatch === 'function') {
        window.MatchmakingSystem.finishCurrentMatch({
            winner,
            reason,
            attackersScore: game.attackersScore,
            defendersScore: game.defendersScore
        });
    }

    // Gérer la fin du match (MMR, suppression session)
    handleMatchEnd(winner, reason);
}

function handleMatchEnd(winner, reason = 'completed') {
    // Calculer et mettre à jour le MMR pour le mode de jeu actuel
    if (game.mode && game.mode !== 'deathmatch' && window.currentUser) {
        const isWinner = (player.team === winner);
        const mmrChange = calculateMMRChange(isWinner, reason);

        // Mettre à jour le MMR dans Firebase
        const modeKey = game.mode === 'competitive' ? 'competitive' : game.mode;
        const userRef = window.database?.ref(`users/${window.currentUser.uid}/mmr/${modeKey}`);

        if (userRef) {
            userRef.transaction((currentMMR) => {
                const current = currentMMR || 1000; // MMR par défaut
                return Math.max(0, current + mmrChange); // Ne pas descendre en dessous de 0
            });
        }

        // Afficher le changement de MMR
        if (window.NotificationSystem) {
            const sign = mmrChange >= 0 ? '+' : '';
            window.NotificationSystem.show(
                'MMR mis à jour',
                `${sign}${mmrChange} MMR`,
                mmrChange >= 0 ? 'success' : 'error',
                4000
            );
        }
    }

    // Supprimer la session de jeu après un délai
    setTimeout(() => {
        if (window.matchmakingState?.currentMatchId && window.database) {
            const matchRef = window.database.ref(`game_sessions/${window.matchmakingState.currentMatchId}`);
            matchRef.remove().catch(() => {
                // Ignorer les erreurs de suppression
            });
        }
    }, 10000); // Supprimer après 10 secondes
}

function calculateMMRChange(isWinner, reason) {
    // Calcul du changement de MMR
    let baseChange = isWinner ? 25 : -20;

    // Modifier selon la raison
    if (reason === 'forfeit') {
        baseChange = isWinner ? 15 : -30; // Moins de points pour victoire par forfait, plus de perte si on quitte
    }

    return baseChange;
}

// ========================================
// RENDU
// ========================================

function render() {
    if (!gameContext) return;

    const map = MAPS[game.currentMap] || MAPS['haven'];
    if (!map) {
        return;
    }

    // Fond
    gameContext.fillStyle = map.backgroundColor;
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gameContext.save();
    
    // Caméra avec shake
    const shakeX = (Math.random() - 0.5) * game.camera.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * game.camera.shakeIntensity;
    
    gameContext.translate(
        gameCanvas.width / 2 - game.camera.x + shakeX,
        gameCanvas.height / 2 - game.camera.y + shakeY
    );
    
    // Dessiner la carte
    drawMap();
    drawBombSites(); // Dessiner les sites de bombe
    drawSlowFields();
    drawRevealBeacons();
    drawTacticalDevices();
    
    // Fumée & structures
    drawSmokeGrenades();
    drawSentryTurrets();

    // Armes au sol
    drawDroppedWeapons();

    // Autres joueurs
    drawOtherPlayers();
    drawTrainingBots();

    // Joueur
    drawPlayer();
    
    // Projectiles
    drawBullets();
    
    // Particules
    drawParticles();
    
    // Flashbangs
    drawFlashbangs();
    
    // Nombres de dégâts
    drawDamageNumbers();
    
    gameContext.restore();
    
    // HUD
    drawRevealPulseOverlay();
    drawHUD();
}

function drawMap() {
    const time = performance.now();
    for (const obj of gameObjects) {
        if (obj.destroyed) continue;

        let offsetX = 0;
        let offsetY = 0;
        if (obj.hitTimer > 0) {
            const intensity = obj.hitTimer * 10;
            offsetX = Math.sin(time * 0.05 + obj.x) * intensity;
            offsetY = Math.cos(time * 0.045 + obj.y) * intensity;
        }

        gameContext.save();
        gameContext.translate(offsetX, offsetY);

        const sprite = objectSprites[obj.type];
        if (sprite && sprite.loaded) {
            gameContext.drawImage(sprite.image, obj.x, obj.y, obj.width, obj.height);
        } else {
            gameContext.fillStyle = obj.color;
            gameContext.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
        
        // Barre de vie pour objets destructibles
        if (obj.destructible && obj.health < obj.maxHealth) {
            const healthPercent = obj.health / obj.maxHealth;
            gameContext.fillStyle = '#ff0000';
            gameContext.fillRect(obj.x, obj.y - 8, obj.width, 4);
            gameContext.fillStyle = '#00ff00';
            gameContext.fillRect(obj.x, obj.y - 8, obj.width * healthPercent, 4);
        }

        // Rendre les barrières de spawn semi-transparentes et vertes
        if (obj.isSpawnBarrier && game.phase === 'buy') {
            gameContext.globalAlpha = 0.5;
            gameContext.fillStyle = obj.team === player.team ? '#00ff00' : '#ff0000';
            gameContext.fillRect(obj.x, obj.y, obj.width, obj.height);
            gameContext.globalAlpha = 1;
        }

        gameContext.restore();
    }
}

function drawBombSites() {
    if (!isBombMode()) return;

    const map = MAPS[game.currentMap];
    if (!map || !map.bombSites) return;

    map.bombSites.forEach(site => {
        // Dessiner le contour du site
        gameContext.strokeStyle = 'rgba(255, 200, 50, 0.6)';
        gameContext.lineWidth = 3;
        gameContext.setLineDash([10, 5]);
        gameContext.strokeRect(site.x, site.y, site.width, site.height);
        gameContext.setLineDash([]);

        // Fond semi-transparent
        gameContext.fillStyle = 'rgba(255, 200, 50, 0.1)';
        gameContext.fillRect(site.x, site.y, site.width, site.height);

        // Nom du site au centre
        gameContext.save();
        gameContext.font = 'bold 48px Arial';
        gameContext.fillStyle = 'rgba(255, 200, 50, 0.4)';
        gameContext.textAlign = 'center';
        gameContext.textBaseline = 'middle';
        gameContext.fillText(
            site.name,
            site.x + site.width / 2,
            site.y + site.height / 2
        );
        gameContext.restore();

        // Indicateur si la bombe est plantée sur ce site
        if (game.bomb.planted && game.bomb.site === site.name) {
            gameContext.fillStyle = 'rgba(255, 0, 0, 0.3)';
            gameContext.fillRect(site.x, site.y, site.width, site.height);
        }
    });
}

function drawPlayer() {
    if (!player.alive) return;

    const throwAnim = player.throwAnimation || { timer: 0, duration: 0, style: null };
    const throwActive = throwAnim.timer > 0 && throwAnim.duration > 0;
    const throwProgress = throwActive ? 1 - (throwAnim.timer / throwAnim.duration) : 0;
    const throwStrength = throwActive ? Math.sin(Math.PI * throwProgress) : 0;
    
    gameContext.save();
    gameContext.translate(player.x + player.width / 2, player.y + player.height / 2);
    gameContext.rotate(player.angle);
    
    // Corps
    gameContext.fillStyle = player.team === 'attackers' ? '#ff4655' : '#00d4ff';
    gameContext.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Arme
    gameContext.fillStyle = '#333333';
    const weaponLength = 25 + throwStrength * 12;
    const weaponOffsetY = -3 - throwStrength * 4;
    gameContext.fillRect(0, weaponOffsetY, weaponLength, 6);

    if (throwActive) {
        const deviceStyle = throwAnim.style || DEFAULT_TACTICAL_DEVICE_STYLE;
        const deviceRadius = Math.max(3, (deviceStyle.size || DEFAULT_TACTICAL_DEVICE_STYLE.size) * 0.6);
        const deviceCenterX = weaponLength + 4;
        const deviceCenterY = weaponOffsetY + 3 - throwStrength * 2;

        if (deviceStyle.glow) {
            gameContext.fillStyle = deviceStyle.glow;
            gameContext.beginPath();
            gameContext.arc(deviceCenterX, deviceCenterY, deviceRadius + 2, 0, Math.PI * 2);
            gameContext.fill();
        }

        gameContext.fillStyle = deviceStyle.fill || DEFAULT_TACTICAL_DEVICE_STYLE.fill;
        gameContext.beginPath();
        gameContext.arc(deviceCenterX, deviceCenterY, deviceRadius, 0, Math.PI * 2);
        gameContext.fill();

        if (deviceStyle.accent) {
            gameContext.fillStyle = deviceStyle.accent;
            gameContext.beginPath();
            gameContext.arc(deviceCenterX + deviceRadius * 0.3, deviceCenterY - deviceRadius * 0.3, deviceRadius * 0.35, 0, Math.PI * 2);
            gameContext.fill();
        }
    }
    
    gameContext.restore();
    
    // Nom
    gameContext.fillStyle = '#ffffff';
    gameContext.font = '12px Arial';
    gameContext.textAlign = 'center';
    gameContext.fillText('Vous', player.x + player.width / 2, player.y - 15);
    
    // Santé
    const healthPercent = player.health / player.maxHealth;
    gameContext.fillStyle = '#ff0000';
    gameContext.fillRect(player.x, player.y - 10, player.width, 4);
    gameContext.fillStyle = '#00ff00';
    gameContext.fillRect(player.x, player.y - 10, player.width * healthPercent, 4);
}

function drawOtherPlayers() {
    for (const playerId in otherPlayers) {
        const other = otherPlayers[playerId];
        if (!other.alive) continue;

        // Couleur selon l'équipe
        const color = other.team === 'attackers' ? '#ff6655' : '#44d4ff';

        // Corps du joueur
        gameContext.save();
        gameContext.translate(other.x + 15, other.y + 15);
        gameContext.rotate(other.angle || 0);
        gameContext.fillStyle = color;
        gameContext.fillRect(-15, -15, 30, 30);

        // Direction (petite flèche)
        gameContext.fillStyle = '#ffffff';
        gameContext.beginPath();
        gameContext.moveTo(10, 0);
        gameContext.lineTo(-5, -5);
        gameContext.lineTo(-5, 5);
        gameContext.closePath();
        gameContext.fill();
        gameContext.restore();

        // Barre de vie
        const healthPercent = Math.max(0, Math.min(1, other.health / 100));
        gameContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        gameContext.fillRect(other.x, other.y - 10, 30, 4);
        gameContext.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffaa00' : '#ff0000');
        gameContext.fillRect(other.x, other.y - 10, 30 * healthPercent, 4);

        // Nom du joueur
        gameContext.fillStyle = '#ffffff';
        gameContext.strokeStyle = '#000000';
        gameContext.lineWidth = 3;
        gameContext.font = 'bold 12px Arial';
        gameContext.textAlign = 'center';
        gameContext.strokeText(other.username || 'Joueur', other.x + 15, other.y - 15);
        gameContext.fillText(other.username || 'Joueur', other.x + 15, other.y - 15);
    }
}

function drawTrainingBots() {
    if (!trainingState.active) return;
    trainingState.bots.forEach(bot => {
        if (!bot.alive) return;

        gameContext.save();
        gameContext.translate(bot.x + bot.width / 2, bot.y + bot.height / 2);
        gameContext.rotate(bot.angle || 0);
        gameContext.fillStyle = '#ffc857';
        gameContext.fillRect(-bot.width / 2, -bot.height / 2, bot.width, bot.height);

        // Indicateur de direction
        gameContext.fillStyle = '#2b2d42';
        gameContext.beginPath();
        gameContext.moveTo(bot.width / 2 - 5, 0);
        gameContext.lineTo(-bot.width / 2 + 5, -5);
        gameContext.lineTo(-bot.width / 2 + 5, 5);
        gameContext.closePath();
        gameContext.fill();
        gameContext.restore();

        // Barre de vie
        const lifePercent = Math.max(0, Math.min(1, bot.health / bot.maxHealth));
        gameContext.fillStyle = 'rgba(0, 0, 0, 0.4)';
        gameContext.fillRect(bot.x, bot.y - 10, bot.width, 4);
        gameContext.fillStyle = lifePercent > 0.5 ? '#00ff7f' : (lifePercent > 0.25 ? '#ffb347' : '#ff4d4d');
        gameContext.fillRect(bot.x, bot.y - 10, bot.width * lifePercent, 4);

        // Nom
        if (bot.label) {
            gameContext.fillStyle = '#ffffff';
            gameContext.strokeStyle = '#000000';
            gameContext.lineWidth = 3;
            gameContext.font = 'bold 12px Arial';
            gameContext.textAlign = 'center';
            gameContext.strokeText(bot.label, bot.x + bot.width / 2, bot.y - 16);
            gameContext.fillText(bot.label, bot.x + bot.width / 2, bot.y - 16);
        }
    });
}

function setupTrainingBots(resetStats = false) {
    if (!trainingState.active) return;
    const stored = loadTrainingSettings();
    if (stored) {
        trainingState.settings = { ...DEFAULT_TRAINING_SETTINGS, ...stored };
    }
    if (resetStats) {
        trainingState.stats = { kills: 0, shots: 0, hits: 0 };
    }
    trainingState.bots = [];
    trainingBotIdCounter = 0;
    const count = Math.max(1, Math.min(20, Math.floor(trainingState.settings.botCount || DEFAULT_TRAINING_SETTINGS.botCount)));
    for (let i = 0; i < count; i++) {
        trainingState.bots.push(spawnTrainingBot());
    }
    refreshPauseMenuUI();
}

function spawnTrainingBot(existingBot = null) {
    const map = MAPS[game.currentMap] || MAPS['haven'];
    const spawn = getRandomTrainingSpawn(map);
    const bot = existingBot || {};
    bot.id = existingBot?.id || `bot_${++trainingBotIdCounter}`;
    bot.width = 30;
    bot.height = 30;
    bot.maxHealth = 100;
    bot.health = bot.maxHealth;
    bot.alive = true;
    bot.x = spawn.x - bot.width / 2;
    bot.y = spawn.y - bot.height / 2;
    bot.spawnOrigin = { x: spawn.x, y: spawn.y };
    bot.targetX = null;
    bot.targetY = null;
    bot.moveCooldown = 0;
    bot.respawnTimer = 0;
    bot.angle = 0;
    bot.label = existingBot?.label || `BOT ${trainingBotIdCounter}`;
    chooseTrainingBotTarget(bot, true);
    return bot;
}

function getRandomTrainingSpawn(map) {
    const points = [];
    if (map?.spawnPoints) {
        if (map.spawnPoints.attackers) points.push(...map.spawnPoints.attackers);
        if (map.spawnPoints.defenders) points.push(...map.spawnPoints.defenders);
    }
    if (!points.length) {
        return {
            x: (map?.width || 2000) / 2,
            y: (map?.height || 2000) / 2
        };
    }
    const point = points[Math.floor(Math.random() * points.length)];
    const jitter = () => (Math.random() - 0.5) * 120;
    return {
        x: point.x + jitter(),
        y: point.y + jitter()
    };
}

function chooseTrainingBotTarget(bot, force = false) {
    if (!trainingState.settings.movingBots) {
        bot.targetX = bot.spawnOrigin.x;
        bot.targetY = bot.spawnOrigin.y;
        return;
    }
    if (!force && bot.moveCooldown > 0) return;
    const map = MAPS[game.currentMap] || MAPS['haven'];
    const angle = Math.random() * Math.PI * 2;
    const radius = trainingState.settings.movementRadius;
    const targetX = bot.spawnOrigin.x + Math.cos(angle) * radius;
    const targetY = bot.spawnOrigin.y + Math.sin(angle) * radius;
    bot.targetX = Math.max(bot.width / 2, Math.min(targetX, (map?.width || 0) - bot.width / 2));
    bot.targetY = Math.max(bot.height / 2, Math.min(targetY, (map?.height || 0) - bot.height / 2));
    bot.moveCooldown = 1 + Math.random() * 1.5;
}

function updateTrainingBots(dt) {
    if (!trainingState.active) return;
    const map = MAPS[game.currentMap] || MAPS['haven'];
    trainingState.bots.forEach(bot => {
        if (bot.alive) {
            bot.moveCooldown = Math.max(0, bot.moveCooldown - dt);
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const botCenterX = bot.x + bot.width / 2;
            const botCenterY = bot.y + bot.height / 2;
            bot.angle = Math.atan2(playerCenterY - botCenterY, playerCenterX - botCenterX);

            if (trainingState.settings.movingBots) {
                const speed = trainingState.settings.movementSpeed * 60 * dt;
                if (!bot.targetX || !bot.targetY || Math.hypot(bot.targetX - botCenterX, bot.targetY - botCenterY) < 10) {
                    chooseTrainingBotTarget(bot, true);
                }
                const dirX = bot.targetX - botCenterX;
                const dirY = bot.targetY - botCenterY;
                const distance = Math.hypot(dirX, dirY);
                if (distance > 1) {
                    const normX = dirX / distance;
                    const normY = dirY / distance;
                    bot.x += normX * speed;
                    bot.y += normY * speed;
                    clampBotPosition(bot, map);
                }
            } else {
                bot.targetX = bot.spawnOrigin.x;
                bot.targetY = bot.spawnOrigin.y;
                bot.x += (bot.targetX - botCenterX) * 0.02;
                bot.y += (bot.targetY - botCenterY) * 0.02;
                clampBotPosition(bot, map);
            }
        } else if (trainingState.settings.respawnBots) {
            bot.respawnTimer -= dt;
            if (bot.respawnTimer <= 0) {
                spawnTrainingBot(bot);
            }
        }
    });
}

function clampBotPosition(bot, map) {
    const maxX = (map?.width || 0) - bot.width;
    const maxY = (map?.height || 0) - bot.height;
    bot.x = Math.max(0, Math.min(bot.x, maxX));
    bot.y = Math.max(0, Math.min(bot.y, maxY));
}

function hitTrainingBot(bot, damage, ownerId) {
    if (!bot.alive) return;
    const appliedDamage = damage;
    bot.health -= appliedDamage;
    trainingState.stats.hits += 1;
    showDamageNumber(bot.x + bot.width / 2, bot.y, Math.floor(appliedDamage), true);

    if (bot.health <= 0) {
        bot.alive = false;
        bot.health = 0;
        trainingState.stats.kills += 1;
        bot.respawnTimer = trainingState.settings.respawnBots ? trainingState.settings.respawnDelay : 0;
        particles.push({
            x: bot.x + bot.width / 2,
            y: bot.y + bot.height / 2,
            vx: 0,
            vy: 0,
            life: 0.3,
            maxLife: 0.3,
            color: '#ff4d4d',
            size: 16
        });
        if (!trainingState.settings.respawnBots) {
            bot.label = 'HS';
        }
        refreshPauseMenuUI();
    }
}

function resetTrainingBots() {
    setupTrainingBots(true);
}

function drawDroppedWeapons() {
    for (const weapon of droppedWeapons) {
        // Dessiner un rectangle pour représenter l'arme
        gameContext.save();

        // Ombre
        gameContext.fillStyle = 'rgba(0, 0, 0, 0.3)';
        gameContext.fillRect(weapon.x - 15, weapon.y + 3, 30, 10);

        // Arme
        gameContext.fillStyle = weapon.skin ? '#00d4ff' : '#888888';
        gameContext.strokeStyle = weapon.skin ? '#00ffff' : '#ffffff';
        gameContext.lineWidth = 2;

        // Rectangle de l'arme
        gameContext.fillRect(weapon.x - 15, weapon.y - 5, 30, 10);
        gameContext.strokeRect(weapon.x - 15, weapon.y - 5, 30, 10);

        // Icône si skin
        if (weapon.skin) {
            gameContext.fillStyle = '#ffffff';
            gameContext.font = '10px Arial';
            gameContext.textAlign = 'center';
            gameContext.fillText('✨', weapon.x, weapon.y + 2);
        }

        // Nom de l'arme au-dessus
        gameContext.fillStyle = '#ffffff';
        gameContext.font = 'bold 10px Arial';
        gameContext.textAlign = 'center';
        gameContext.strokeStyle = '#000000';
        gameContext.lineWidth = 3;
        gameContext.strokeText(weapon.weapon.name, weapon.x, weapon.y - 12);
        gameContext.fillText(weapon.weapon.name, weapon.x, weapon.y - 12);

        gameContext.restore();
    }
}

function drawBullets() {
    gameContext.fillStyle = '#ffff00';
    for (const bullet of bullets) {
        gameContext.beginPath();
        gameContext.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
        gameContext.fill();

        // Traînée
        gameContext.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        gameContext.lineWidth = bullet.size;
        gameContext.beginPath();
        gameContext.moveTo(bullet.x, bullet.y);
        gameContext.lineTo(bullet.x - bullet.vx * 2, bullet.y - bullet.vy * 2);
        gameContext.stroke();
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        gameContext.fillStyle = p.color;
        gameContext.globalAlpha = alpha;
        gameContext.beginPath();
        gameContext.arc(p.x, p.y, p.size || 2, 0, Math.PI * 2);
        gameContext.fill();
    }
    gameContext.globalAlpha = 1;
}

function drawSlowFields() {
    for (const field of slowFields) {
        const gradient = gameContext.createRadialGradient(
            field.x,
            field.y,
            0,
            field.x,
            field.y,
            field.radius
        );
        gradient.addColorStop(0, 'rgba(125, 211, 252, 0.35)');
        gradient.addColorStop(1, 'rgba(125, 211, 252, 0)');
        gameContext.fillStyle = gradient;
        gameContext.beginPath();
        gameContext.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
        gameContext.fill();

        gameContext.strokeStyle = `rgba(125, 211, 252, 0.45)`;
        gameContext.lineWidth = 2;
        gameContext.beginPath();
        gameContext.arc(field.x, field.y, field.radius * (0.6 + 0.1 * Math.sin(field.pulse * 3)), 0, Math.PI * 2);
        gameContext.stroke();
    }
}

function drawRevealBeacons() {
    for (const beacon of revealBeacons) {
        const intensity = 0.25 + 0.1 * Math.sin(beacon.pulse * 2);
        const gradient = gameContext.createRadialGradient(
            beacon.x,
            beacon.y,
            0,
            beacon.x,
            beacon.y,
            beacon.radius
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, ${intensity})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        gameContext.fillStyle = gradient;
        gameContext.beginPath();
        gameContext.arc(beacon.x, beacon.y, beacon.radius, 0, Math.PI * 2);
        gameContext.fill();

        gameContext.strokeStyle = `rgba(0, 212, 255, 0.6)`;
        gameContext.lineWidth = 2;
        gameContext.beginPath();
        const ringRadius = beacon.radius * (0.4 + 0.2 * Math.sin(beacon.pulse * 4));
        gameContext.arc(beacon.x, beacon.y, ringRadius, 0, Math.PI * 2);
        gameContext.stroke();
    }
}

function drawSentryTurrets() {
    for (const turret of sentryTurrets) {
        gameContext.fillStyle = 'rgba(255, 209, 102, 0.8)';
        gameContext.beginPath();
        gameContext.arc(turret.x, turret.y, 14, 0, Math.PI * 2);
        gameContext.fill();

        gameContext.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        gameContext.lineWidth = 3;
        gameContext.beginPath();
        gameContext.moveTo(turret.x, turret.y);
        const beamX = turret.x + Math.cos(turret.angle) * 30;
        const beamY = turret.y + Math.sin(turret.angle) * 30;
        gameContext.lineTo(beamX, beamY);
        gameContext.stroke();
    }
}

function drawSmokeGrenades() {
    for (const smoke of smokeGrenades) {
        const gradient = gameContext.createRadialGradient(
            smoke.x, smoke.y, 0,
            smoke.x, smoke.y, smoke.radius
        );
        const innerColor = smoke.color || 'rgba(200, 200, 200, 1)';
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
        
        gameContext.fillStyle = gradient;
        gameContext.beginPath();
        gameContext.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
        gameContext.fill();
    }
}

function drawFlashbangs() {
    for (const flash of flashbangs) {
        const alpha = flash.lifetime / 0.3;
        gameContext.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        gameContext.beginPath();
        gameContext.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        gameContext.fill();
    }
}

function drawDamageNumbers() {
    gameContext.font = 'bold 20px Arial';
    gameContext.textAlign = 'center';
    
    for (const dmg of damageNumbers) {
        const alpha = dmg.life / 1.5;
        gameContext.fillStyle = dmg.isPlayer ? 
            `rgba(255, 0, 0, ${alpha})` : 
            `rgba(255, 255, 255, ${alpha})`;
        gameContext.fillText(dmg.damage, dmg.x, dmg.y);
    }
}

function drawHUD() {
    // Crosshair désactivé - on vise avec la souris
    // const centerX = gameCanvas.width / 2;
    // const centerY = gameCanvas.height / 2;
    //
    // gameContext.strokeStyle = '#00ff00';
    // gameContext.lineWidth = 2;
    // gameContext.beginPath();
    // gameContext.moveTo(centerX - 10, centerY);
    // gameContext.lineTo(centerX - 3, centerY);
    // gameContext.moveTo(centerX + 3, centerY);
    // gameContext.lineTo(centerX + 10, centerY);
    // gameContext.moveTo(centerX, centerY - 10);
    // gameContext.lineTo(centerX, centerY - 3);
    // gameContext.moveTo(centerX, centerY + 3);
    // gameContext.lineTo(centerX, centerY + 10);
    // gameContext.stroke();

    // Cooldowns des abilities
    drawAbilityCooldowns();

    window.SpectatorSystem?.drawHUD?.(gameContext);
}

function drawRevealPulseOverlay() {
    if (!game.revealPulseTimer || game.revealPulseTimer <= 0) return;
    const intensity = Math.min(0.35, 0.15 + 0.1 * Math.sin(game.revealPulseTimer * 6));
    gameContext.fillStyle = `rgba(0, 212, 255, ${intensity})`;
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameContext.globalAlpha = 1;
}

function drawAbilityCooldowns() {
    const abilities = [
        { key: 'ability1', x: 50, y: gameCanvas.height - 100, name: 'Q' },
        { key: 'ability2', x: 120, y: gameCanvas.height - 100, name: 'E' },
        { key: 'ultimate', x: 190, y: gameCanvas.height - 100, name: 'X' }
    ];
    
    for (const ab of abilities) {
        const ability = player.abilities[ab.key];
        
        gameContext.fillStyle = 'rgba(0, 0, 0, 0.7)';
        gameContext.fillRect(ab.x, ab.y, 50, 50);
        
        // Cooldown
        if (ability.cooldown > 0) {
            const percent = 1 - (ability.cooldown / ability.maxCooldown);
            gameContext.fillStyle = 'rgba(0, 200, 0, 0.5)';
            gameContext.fillRect(ab.x, ab.y + 50 * (1 - percent), 50, 50 * percent);
        }
        
        // Points ultimate
        if (ab.key === 'ultimate') {
            gameContext.fillStyle = '#ffffff';
            gameContext.font = '12px Arial';
            gameContext.textAlign = 'center';
            gameContext.fillText(
                `${ability.points}/${ability.maxPoints}`,
                ab.x + 25,
                ab.y + 30
            );
        }
        
        // Touche
        gameContext.fillStyle = '#ffffff';
        gameContext.font = 'bold 16px Arial';
        gameContext.textAlign = 'center';
        gameContext.fillText(ab.name, ab.x + 25, ab.y + 20);
    }
}

// ========================================
// ÉVÉNEMENTS
// ========================================

// ========================================
// MODE ATTAQUE/D�FENSE
// ========================================

function isBombMode() {
    // Vérifier si le mode a explicitement la propriété hasBomb
    const modeConfig = window.gameModes?.[game.mode];
    if (modeConfig && typeof modeConfig.hasBomb === 'boolean') {
        return modeConfig.hasBomb;
    }
    // Fallback pour les modes legacy
    return BOMB_MODES.has(game.mode);
}

function getPlayerCenter() {
    return {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2
    };
}

function getBombSiteAt(x, y) {
    const map = MAPS[game.currentMap];
    if (!map?.bombSites) return null;
    return map.bombSites.find(site =>
        x >= site.x && x <= site.x + site.width &&
        y >= site.y && y <= site.y + site.height
    ) || null;
}

function playerHasBomb() {
    return isLocalBombCarrier(game.bomb.carrier);
}

function attemptBombInteraction() {
    if (!isBombMode() || !player.alive || game.phase !== 'active') return;
    if (player.isPlanting || player.isDefusing) return;

    const center = getPlayerCenter();

    if (player.team === 'attackers') {
        if (playerHasBomb()) {
            const site = getBombSiteAt(center.x, center.y);
            if (site) {
                startBombPlant(site);
                return;
            }
        } else if (game.bomb.dropped && game.bomb.x !== null && game.bomb.y !== null) {
            const distance = Math.hypot(center.x - game.bomb.x, center.y - game.bomb.y);
            if (distance <= BOMB_SETTINGS.pickupRadius) {
                pickUpBomb();
            }
        }
    } else if (player.team === 'defenders' && game.bomb.planted) {
        const distance = Math.hypot(center.x - game.bomb.x, center.y - game.bomb.y);
        if (distance <= BOMB_SETTINGS.pickupRadius) {
            startBombDefuse();
        }
    }
}

function pickUpBomb() {
    assignBombToLocalPlayer();
    game.bomb.dropped = false;
    game.bomb.x = null;
    game.bomb.y = null;
    game.bomb.site = null;
    if (window.NotificationSystem) {
        window.NotificationSystem.show('Spike récupérée', 'Vous portez la spike', 'info', 3000);
    }
}

function startBombPlant(site) {
    if (!playerHasBomb() || game.bomb.planted || game.bomb.planting) return;
    game.bomb.planting = true;
    game.bomb.plantProgress = 0;
    game.bomb.site = site?.name || null;

    player.isPlanting = true;
    player.actionType = 'plant';
    player.actionProgress = 0;
    player.sprinting = false;
}

function startBombDefuse() {
    if (!game.bomb.planted || game.bomb.defusing) return;
    game.bomb.defusing = true;
    game.bomb.defuseProgress = 0;

    player.isDefusing = true;
    player.actionType = 'defuse';
    player.actionProgress = 0;
    player.sprinting = false;
}

function cancelBombInteraction(type = null) {
    if (!type || type === 'plant') {
        game.bomb.planting = false;
        game.bomb.plantProgress = 0;
        if (player.isPlanting) {
            player.isPlanting = false;
            if (player.actionType === 'plant') {
                player.actionType = null;
                player.actionProgress = 0;
            }
        }
    }

    if (!type || type === 'defuse') {
        game.bomb.defusing = false;
        game.bomb.defuseProgress = 0;
        if (player.isDefusing) {
            player.isDefusing = false;
            if (player.actionType === 'defuse') {
                player.actionType = null;
                player.actionProgress = 0;
            }
        }
    }
}

function completeBombPlant(site, position) {
    game.bomb.planted = true;
    game.bomb.planting = false;
    game.bomb.plantProgress = 0;
    game.bomb.carrier = null;
    game.bomb.dropped = false;
    game.bomb.x = position.x;
    game.bomb.y = position.y;
    game.bomb.site = site?.name || null;
    game.roundTime = BOMB_SETTINGS.detonationTime;
    game.bomb.timer = game.roundTime;

    player.isPlanting = false;
    player.actionType = null;
    player.actionProgress = 0;

    if (window.NotificationSystem) {
        const siteLabel = site?.name ? `site ${site.name}` : 'site';

        // Notification différente selon l'équipe
        if (player.team === 'attackers') {
            window.NotificationSystem.show('Spike posée', `La spike est armée sur le ${siteLabel}`, 'round', 3500);
        } else {
            window.NotificationSystem.show('⚠️ SPIKE PLANTÉE!', `Les attaquants ont planté la spike sur le ${siteLabel}! Désamorcez-la!`, 'warning', 5000);
        }
    }
}

function completeBombDefuse() {
    cancelBombInteraction('defuse');
    game.bomb.planted = false;
    game.bomb.timer = 0;
    game.roundTime = 0;
    endRound('bomb_defused');
}

function updateAttackDefenseMode(dt) {
    const bomb = game.bomb;
    if (!bomb) return;

    if (game.phase === 'buy') {
        bomb.planted = false;
        bomb.planting = false;
        bomb.defusing = false;
        bomb.plantProgress = 0;
        bomb.defuseProgress = 0;
        bomb.timer = BOMB_SETTINGS.detonationTime;
        if (player.team === 'attackers' && !bomb.carrier && !bomb.dropped) {
            assignBombToLocalPlayer();
        }
        return;
    }

    const center = getPlayerCenter();

    if (bomb.planting) {
        const site = getBombSiteAt(center.x, center.y);
        if (!isActionKeyPressed('plant') || !playerHasBomb() || !player.alive || !site) {
            cancelBombInteraction('plant');
        } else {
            bomb.plantProgress += dt;
            player.actionProgress = Math.min(1, bomb.plantProgress / BOMB_SETTINGS.plantTime);
            if (bomb.plantProgress >= BOMB_SETTINGS.plantTime) {
                completeBombPlant(site, center);
            }
        }
    }

    if (bomb.defusing) {
        const distance = Math.hypot(center.x - bomb.x, center.y - bomb.y);
        if (!isActionKeyPressed('plant') || player.team !== 'defenders' || !player.alive || distance > BOMB_SETTINGS.pickupRadius) {
            cancelBombInteraction('defuse');
        } else {
            bomb.defuseProgress += dt;
            player.actionProgress = Math.min(1, bomb.defuseProgress / BOMB_SETTINGS.defuseTime);
            if (bomb.defuseProgress >= BOMB_SETTINGS.defuseTime) {
                completeBombDefuse();
            }
        }
    }

    if (!bomb.planting && !bomb.defusing && player.actionProgress > 0) {
        player.actionProgress = 0;
        player.actionType = null;
    }

    if (bomb.planted) {
        bomb.timer = game.roundTime;
    }
}

// ========================================
// �%V�%NEMENTS
// ========================================

function handleKeyDown(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();

    if (pendingKeyBinding) {
        e.preventDefault();
        assignKeyBinding(pendingKeyBinding, key);
        return;
    }

    keys[key] = true;

    const action = getActionFromKey(key);

    const activeElement = document.activeElement;
    if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) && activeElement !== document.body && action !== 'pause') {
        return;
    }

    if (game.gamePaused && action && action !== 'pause' && action !== 'buyMenu') {
        return;
    }

    if (game.gamePaused && action && action !== 'pause' && action !== 'buyMenu') {
        if (action === 'sprint') {
            player.sprinting = false;
        }
        return;
    }

    switch (action) {
        case 'reload':
            if (!player.reloading) {
                reload();
            }
            break;
        case 'sprint':
            player.sprinting = true;
            break;
        case 'pause':
            e.preventDefault();
            togglePauseMenu();
            keys[key] = false;
            break;
        case 'buyMenu':
            e.preventDefault();
            toggleBuyMenu();
            break;
        case 'ability1':
            useAbility('ability1');
            break;
        case 'ability2':
            useAbility('ability2');
            break;
        case 'ultimate':
            useAbility('ultimate');
            break;
        case 'plant':
            e.preventDefault();
            attemptBombInteraction();
            break;
        case 'pickup':
            e.preventDefault();
            pickupNearbyWeapon();
            break;
        case 'weaponPrimary':
            equipWeapon('phantom');
            break;
        case 'weaponSecondary':
            equipWeapon('sheriff');
            break;
        case 'weaponMelee':
            equipWeapon('operator');
            break;
        default:
            break;
    }
}

function handleKeyUp(e) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    keys[key] = false;

    const action = getActionFromKey(key);

    const activeElement = document.activeElement;
    if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) && activeElement !== document.body && action !== 'pause') {
        return;
    }

    switch (action) {
        case 'sprint':
            player.sprinting = false;
            break;
        case 'plant':
            e.preventDefault();
            cancelBombInteraction(player.actionType);
            break;
        default:
            break;
    }
}

function handleMouseDown(e) {
    if (window.SpectatorSystem?.isEnabled?.()) return;
    if (e.button === 0) {
        mouse.pressed = true;
    }
}

function handleMouseUp(e) {
    if (window.SpectatorSystem?.isEnabled?.()) return;
    if (e.button === 0) {
        mouse.pressed = false;
    }
}

function handleMouseMove(e) {
    if (!gameCanvas) return;
    
    const rect = gameCanvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    // Position dans le monde
    mouse.worldX = mouse.x - gameCanvas.width / 2 + game.camera.x;
    mouse.worldY = mouse.y - gameCanvas.height / 2 + game.camera.y;
}

function handleMouseWheel(e) {
    // Changement d'arme avec la molette
    e.preventDefault();
}

// ========================================
// SYSTÈME D'ACHAT
// ========================================

function toggleBuyMenu() {
    const buyMenuOverlay = document.getElementById('buy-menu-overlay');
    if (!buyMenuOverlay) return;

    if (game.mode === 'training') {
        if (buyMenuOverlay.classList.contains('hidden')) {
            openBuyMenu();
        } else {
            closeBuyMenu();
        }
        return;
    }

    // Vérifier si on est en phase d'achat ou en deathmatch
    if (game.mode === 'deathmatch') {
        // En deathmatch, toujours permettre l'achat
        if (buyMenuOverlay.classList.contains('hidden')) {
            openBuyMenu();
        } else {
            closeBuyMenu();
        }
    } else if (game.phase === 'buy' && game.buyTime > 0) {
        // Dans les autres modes, seulement pendant la phase d'achat
        if (buyMenuOverlay.classList.contains('hidden')) {
            openBuyMenu();
        } else {
            closeBuyMenu();
        }
    } else {
        // Hors phase d'achat
        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Boutique fermée',
                'La phase d\'achat est terminée',
                'warning',
                2000
            );
        }
    }
}

function openBuyMenu() {
    const buyMenuOverlay = document.getElementById('buy-menu-overlay');
    if (!buyMenuOverlay) return;

    buyMenuOverlay.classList.remove('hidden');
    updateBuyMenuMoney();
    updateBuyMenuAbilities();
    game.gamePaused = true;
}

function updateBuyMenuAbilities() {
    // Pour Reyna, griser les capacités qui nécessitent des orbes
    if (player.agentId === 'reyna') {
        const ability1Btn = document.getElementById('buy-ability1');
        const ability2Btn = document.getElementById('buy-ability2');

        if (ability1Btn) {
            ability1Btn.style.opacity = '0.5';
            ability1Btn.style.cursor = 'not-allowed';
            ability1Btn.title = 'Nécessite des orbes d\'âme (obtenues par élimination)';
        }

        if (ability2Btn) {
            ability2Btn.style.opacity = '0.5';
            ability2Btn.style.cursor = 'not-allowed';
            ability2Btn.title = 'Nécessite des orbes d\'âme (obtenues par élimination)';
        }
    } else {
        // Pour les autres agents, rétablir l'apparence normale
        const ability1Btn = document.getElementById('buy-ability1');
        const ability2Btn = document.getElementById('buy-ability2');

        if (ability1Btn) {
            ability1Btn.style.opacity = '1';
            ability1Btn.style.cursor = 'pointer';
            ability1Btn.title = '';
        }

        if (ability2Btn) {
            ability2Btn.style.opacity = '1';
            ability2Btn.style.cursor = 'pointer';
            ability2Btn.title = '';
        }
    }
}

function closeBuyMenu() {
    const buyMenuOverlay = document.getElementById('buy-menu-overlay');
    if (!buyMenuOverlay) return;

    buyMenuOverlay.classList.add('hidden');
    game.gamePaused = false;
}

function updateBuyMenuMoney() {
    // Mettre à jour l'argent dans le menu d'achat
    const moneyDisplay = document.getElementById('buy-menu-money');
    if (moneyDisplay) {
        moneyDisplay.textContent = Math.max(0, Math.floor(player.money || 0));
    }
}

function updateMoneyDisplay() {
    // Mettre à jour l'argent dans l'HUD principal
    const moneyValue = document.getElementById('player-money');
    if (moneyValue) {
        moneyValue.textContent = Math.max(0, Math.floor(player.money || 0));
    }

    // Mettre à jour aussi dans le menu d'achat s'il est ouvert
    updateBuyMenuMoney();
}

function togglePauseMenu(forceState = null) {
    const pauseMenu = document.getElementById('pause-menu');
    if (!pauseMenu) {
        game.gamePaused = forceState ?? !game.gamePaused;
        return;
    }

    const shouldOpen = forceState !== null ? forceState : pauseMenu.classList.contains('hidden');

    if (shouldOpen) {
        game.gamePaused = true;
        pauseMenu.classList.remove('hidden');
        const buyMenu = document.getElementById('buy-menu-overlay');
        if (buyMenu && !buyMenu.classList.contains('hidden')) {
            buyMenu.classList.add('hidden');
        }
        if (!pauseMenu.dataset.initialized) {
            setupPauseMenuControls();
            pauseMenu.dataset.initialized = '1';
        }
        refreshPauseMenuUI();
    } else {
        pauseMenu.classList.add('hidden');
        game.gamePaused = false;
        pendingKeyBinding = null;
        trainingState.awaitingBinding = null;
        pauseMenu.querySelectorAll('.binding-btn.waiting').forEach(btn => btn.classList.remove('waiting'));
    }
}

function refreshPauseMenuUI() {
    const pauseMenu = document.getElementById('pause-menu');
    if (!pauseMenu) return;

    const trainingSection = pauseMenu.querySelector('.training-options');
    if (trainingSection) {
        if (trainingState.active) {
            trainingSection.classList.remove('hidden');
            const movingCheckbox = pauseMenu.querySelector('#training-bots-moving');
            const respawnCheckbox = pauseMenu.querySelector('#training-bots-respawn');
            const countInput = pauseMenu.querySelector('#training-bots-count');
            if (movingCheckbox) movingCheckbox.checked = !!trainingState.settings.movingBots;
            if (respawnCheckbox) respawnCheckbox.checked = !!trainingState.settings.respawnBots;
            if (countInput) countInput.value = trainingState.settings.botCount;

            const statsKills = pauseMenu.querySelector('#training-stats-kills');
            const statsShots = pauseMenu.querySelector('#training-stats-shots');
            const statsAccuracy = pauseMenu.querySelector('#training-stats-accuracy');
            if (statsKills) statsKills.textContent = trainingState.stats.kills;
            if (statsShots) statsShots.textContent = trainingState.stats.shots;
            if (statsAccuracy) {
                const accuracy = trainingState.stats.shots > 0
                    ? Math.round((trainingState.stats.hits / trainingState.stats.shots) * 100)
                    : 0;
                statsAccuracy.textContent = `${accuracy}%`;
            }
        } else {
            trainingSection.classList.add('hidden');
        }
    }

    updateBindingButtons();
}

function getActionFromKey(key) {
    for (const action in keyBindings) {
        if (keyBindings[action] === key) {
            return action;
        }
    }
    return null;
}

function isActionKeyPressed(action) {
    const key = keyBindings[action];
    if (!key) return false;
    return !!keys[key];
}

function loadKeyBindings() {
    try {
        const stored = localStorage.getItem('sio_shooter_keybindings');
        if (stored) {
            const parsed = JSON.parse(stored);
            return { ...DEFAULT_KEY_BINDINGS, ...parsed };
        }
    } catch (error) {
    }
    return { ...DEFAULT_KEY_BINDINGS };
}

function saveKeyBindings() {
    try {
        localStorage.setItem('sio_shooter_keybindings', JSON.stringify(keyBindings));
    } catch (error) {
    }
}

function assignKeyBinding(action, key) {
    if (!action || !key) return;
    const normalizedKey = key.toLowerCase();
    if (Object.values(keyBindings).includes(normalizedKey)) {
        for (const existingAction in keyBindings) {
            if (keyBindings[existingAction] === normalizedKey) {
                keyBindings[existingAction] = null;
            }
        }
    }

    keyBindings[action] = normalizedKey;
    saveKeyBindings();
    pendingKeyBinding = null;
    trainingState.awaitingBinding = null;
    updateBindingButtons();

    if (window.NotificationSystem) {
        window.NotificationSystem.show(
            'Raccourci mis à jour',
            `${formatActionLabel(action)} ➜ ${formatKeyName(normalizedKey)}`,
            'success',
            2000
        );
    }
}

function updateBindingButtons() {
    const buttons = document.querySelectorAll('.binding-btn');
    buttons.forEach(btn => {
        const action = btn.dataset.action;
        if (!action) return;
        const binding = keyBindings[action];
        btn.textContent = formatKeyName(binding || '—');
        btn.classList.toggle('waiting', trainingState.awaitingBinding === action);
    });
}

function formatKeyName(key) {
    if (!key) return '—';
    if (key === ' ') return 'ESPACE';
    if (key === 'escape') return 'ECHAP';
    if (key === 'shift') return 'SHIFT';
    if (key === 'control') return 'CTRL';
    if (key === 'alt') return 'ALT';
    if (key.startsWith('arrow')) return key.replace('arrow', 'Flèche ').toUpperCase();
    return key.length === 1 ? key.toUpperCase() : key.toUpperCase();
}

function formatActionLabel(action) {
    const labels = {
        pause: 'Pause',
        buyMenu: 'Ouvrir boutique',
        reload: 'Recharger',
        sprint: 'Sprinter',
        plant: 'Planter / Désamorcer',
        pickup: 'Ramasser',
        ability1: 'Capacité 1',
        ability2: 'Capacité 2',
        ultimate: 'Ultimate',
        weaponPrimary: 'Arme principale',
        weaponSecondary: 'Arme secondaire',
        weaponMelee: 'Arme spéciale'
    };
    return labels[action] || action;
}

function loadTrainingSettings() {
    try {
        const stored = localStorage.getItem('sio_training_settings');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        return null;
    }
}

function saveTrainingSettings() {
    try {
        localStorage.setItem('sio_training_settings', JSON.stringify(trainingState.settings));
    } catch (error) {
    }
}

function setupPauseMenuControls() {
    const pauseMenu = document.getElementById('pause-menu');
    if (!pauseMenu) return;

    const applyBtn = pauseMenu.querySelector('#training-apply-settings');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => applyTrainingSettingsFromMenu(pauseMenu));
    }

    const resetBtn = pauseMenu.querySelector('#training-reset-bots');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => resetTrainingBotsFromMenu());
    }

    pauseMenu.querySelectorAll('.binding-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (!action) return;
            trainingState.awaitingBinding = action;
            pendingKeyBinding = action;
            updateBindingButtons();
        });
    });

    const resumeBtn = pauseMenu.querySelector('#pause-resume');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => togglePauseMenu(false));
    }
}

function applyTrainingSettingsFromMenu(container = document.getElementById('pause-menu')) {
    if (!container) return;
    const movingCheckbox = container.querySelector('#training-bots-moving');
    const respawnCheckbox = container.querySelector('#training-bots-respawn');
    const countInput = container.querySelector('#training-bots-count');

    trainingState.settings.movingBots = movingCheckbox ? movingCheckbox.checked : true;
    trainingState.settings.respawnBots = respawnCheckbox ? respawnCheckbox.checked : true;
    const count = countInput ? parseInt(countInput.value, 10) : DEFAULT_TRAINING_SETTINGS.botCount;
    trainingState.settings.botCount = Math.max(1, Math.min(20, isNaN(count) ? DEFAULT_TRAINING_SETTINGS.botCount : count));
    saveTrainingSettings();
    setupTrainingBots(true);

    if (window.NotificationSystem) {
        window.NotificationSystem.show('Paramètres appliqués', 'Les bots ont été mis à jour.', 'success', 2000);
    }
}

function resetTrainingBotsFromMenu() {
    resetTrainingBots();
    if (window.NotificationSystem) {
        window.NotificationSystem.show('Réinitialisation', 'Les bots ont été repositionnés.', 'info', 2000);
    }
    refreshPauseMenuUI();
}

function buyWeapon(weaponName, price) {
    if (!player.alive) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Erreur', 'Vous devez être vivant pour acheter', 'error', 2000);
        }
        return;
    }

    if (player.money < price) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Fonds insuffisants', `Il vous faut ${price - player.money} crédits de plus`, 'error', 2000);
        }
        return;
    }

    player.money -= price;
    equipWeapon(weaponName);
    updateMoneyDisplay(); // Mise à jour immédiate de l'affichage
    updateUI();

    if (window.NotificationSystem) {
        window.NotificationSystem.show('Achat réussi', `${WEAPONS[weaponName]?.name || weaponName} acheté`, 'success', 2000);
    }
}

function buyArmor(type, price) {
    if (!player.alive) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Erreur', 'Vous devez être vivant pour acheter', 'error', 2000);
        }
        return;
    }

    if (player.money < price) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Fonds insuffisants', `Il vous faut ${price - player.money} crédits de plus`, 'error', 2000);
        }
        return;
    }

    player.money -= price;

    if (type === 'light') {
        player.armor = 25;
        player.maxArmor = 25;
    } else if (type === 'heavy') {
        player.armor = 50;
        player.maxArmor = 50;
    }

    updateMoneyDisplay(); // Mise à jour immédiate de l'affichage
    updateUI();

    if (window.NotificationSystem) {
        window.NotificationSystem.show('Achat réussi', `Armure ${type === 'light' ? 'légère' : 'lourde'} achetée`, 'success', 2000);
    }
}

function buyAbility(abilityKey, price) {
    if (!player.alive) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Erreur', 'Vous devez être vivant pour acheter', 'error', 2000);
        }
        return;
    }

    // Pour Reyna, les capacités ne peuvent pas être achetées (nécessitent des orbes)
    if (player.agentId === 'reyna') {
        const agentData = window.AgentsRegistry?.['reyna'];
        const abilityData = agentData?.abilities?.[abilityKey];

        if (abilityData?.requiresSoulOrb) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Capacité Reyna',
                    'Les capacités de Reyna nécessitent des orbes d\'âme obtenues en éliminant des ennemis',
                    'info',
                    3000
                );
            }
            return;
        }
    }

    const ability = player.abilities?.[abilityKey];
    if (!ability) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Erreur', 'Capacité non disponible', 'error', 2000);
        }
        return;
    }

    // Vérifier si la capacité est déjà prête
    if (ability.ready && ability.cooldown === 0) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Info', 'Capacité déjà disponible', 'info', 2000);
        }
        return;
    }

    if (player.money < price) {
        if (window.NotificationSystem) {
            window.NotificationSystem.show('Fonds insuffisants', `Il vous faut ${price - player.money} crédits de plus`, 'error', 2000);
        }
        return;
    }

    player.money -= price;
    updateMoneyDisplay();

    // Activer la capacité
    ability.ready = true;
    ability.cooldown = 0;

    const abilityNames = {
        ability1: 'Capacité 1 (C)',
        ability2: 'Capacité 2 (A)'
    };

    if (window.NotificationSystem) {
        window.NotificationSystem.show(
            'Achat réussi',
            `${abilityNames[abilityKey] || 'Capacité'} achetée`,
            'success',
            2000
        );
    }

    updateUI();
}

// ========================================
// UTILITAIRES
// ========================================

function stopGame() {
    game.gameStarted = false;
    game.gamePaused = true;
    window.SpectatorSystem?.disable?.(true);

    closeBuyMenu();

    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.add('hidden');
    }

    trainingState.active = false;
    trainingState.bots = [];
    trainingState.awaitingBinding = null;
    pendingKeyBinding = null;
    trainingState.stats = { kills: 0, shots: 0, hits: 0 };

    // Nettoyer la position du joueur dans Firebase
    if (window.matchmakingState?.currentMatchId && window.database && window.currentUser) {
        try {
            const playerRef = window.database.ref(`game_sessions/${window.matchmakingState.currentMatchId}/players/${window.currentUser.uid}`);
        } catch (error) {
        }
    }

    // Nettoyer les autres joueurs
    window.otherPlayers = {};

    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
}

async function leaveGame() {
    const activeMatch = game.gameStarted && !game.matchFinished;
    if (activeMatch) {
        const confirmed = window.confirm('Voulez-vous abandonner la partie en cours ?');
        if (!confirmed) {
            return;
        }
    }

    if (window.MatchmakingSystem) {
        try {
            if (activeMatch && typeof window.MatchmakingSystem.forfeitCurrentMatch === 'function') {
                await window.MatchmakingSystem.forfeitCurrentMatch({ reason: 'forfeit' });
            } else if (!activeMatch && game.matchFinished && typeof window.MatchmakingSystem.clearCurrentMatchState === 'function') {
                window.MatchmakingSystem.clearCurrentMatchState();
                if (typeof window.MatchmakingSystem.handlePostMatchCleanup === 'function') {
                    window.MatchmakingSystem.handlePostMatchCleanup();
                }
            }
        } catch (error) {
        }
    }

    stopGame();
    if (window.showMainMenu) {
        window.showMainMenu();
    }
}

// ========================================
// EXPORTS
// ========================================

window.initializeGame = initializeGame;
window.stopGame = stopGame;
window.leaveGame = leaveGame;
window.equipWeapon = equipWeapon;
window.throwSmokeGrenade = throwSmokeGrenade;
window.spawnRevealBeacon = spawnRevealBeacon;
window.activateRevealPulse = activateRevealPulse;
window.applySpeedBoost = applySpeedBoost;
window.spawnSlowField = spawnSlowField;
window.enableOverchargeMode = enableOverchargeMode;
window.deployTemporaryBarrier = deployTemporaryBarrier;
window.applyArmorRegenEffect = applyArmorRegenEffect;
window.deploySentryTurret = deploySentryTurret;
window.toggleBuyMenu = toggleBuyMenu;
window.openBuyMenu = openBuyMenu;
window.closeBuyMenu = closeBuyMenu;
window.buyWeapon = buyWeapon;
window.buyArmor = buyArmor;
window.buyAbility = buyAbility;
window.trainingState = trainingState;
window.TrainingControls = {
    resume: () => togglePauseMenu(false),
    applySettings: () => applyTrainingSettingsFromMenu(),
    resetBots: () => resetTrainingBotsFromMenu(),
    beginRebind: (action) => {
        if (!action) return;
        trainingState.awaitingBinding = action;
        pendingKeyBinding = action;
        updateBindingButtons();
    }
};
window.togglePauseMenu = togglePauseMenu;

window.initializeTrainingSession = function initializeTrainingSession(options = {}) {
    const map = options.map || window.selectedMap || game.currentMap || 'haven';

    window.matchmakingState.currentMatchId = null;
    window.matchmakingState.inQueue = false;

    game.mode = 'training';
    game.phase = 'training';
    game.currentMap = map;
    game.matchFinished = false;
    player.team = 'attackers';

    stopGame();

    trainingState.active = true;
    trainingState.settings = { ...DEFAULT_TRAINING_SETTINGS, ...trainingState.settings, ...(options.settings || {}) };
    trainingState.stats = { kills: 0, shots: 0, hits: 0 };
    saveTrainingSettings();

    if (window.showGameScreen) {
        window.showGameScreen();
    }

    setTimeout(() => {
        initializeGame();
    }, 50);
};

document.addEventListener('DOMContentLoaded', () => {
    updateBindingButtons();
});

