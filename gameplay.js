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
    setupMultiplayerSync();
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
    game.bomb.carrier = isBombMode() && player.team === 'attackers' ? 'player' : null;
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
    updateGameTimers(dt);
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
    
    if (keys['w'] || keys['z']) dirY -= 1;
    if (keys['s']) dirY += 1;
    if (keys['a'] || keys['q']) dirX -= 1;
    if (keys['d']) dirX += 1;
    
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
    
    // Angle vers la souris (centré sur le joueur)
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const dx_mouse = mouse.worldX - playerCenterX;
    const dy_mouse = mouse.worldY - playerCenterY;
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
    }

    // Envoyer la position du joueur local toutes les 50ms
    sendPlayerPosition();
}

// Variables pour la synchronisation
let lastPositionUpdate = 0;
const POSITION_UPDATE_INTERVAL = 50; // Envoyer la position toutes les 50ms

function sendPlayerPosition() {
    if (!game.gameStarted || !player.alive) return;
    if (!window.matchmakingState?.currentMatchId) return;
    if (!window.database) return;

    const now = Date.now();
    if (now - lastPositionUpdate < POSITION_UPDATE_INTERVAL) return;

    lastPositionUpdate = now;

    try {
        const gameRef = window.database.ref(`game_sessions/${window.matchmakingState.currentMatchId}/players/${window.currentUser.uid}`);
        gameRef.set({
            x: player.x,
            y: player.y,
            angle: player.angle,
            health: player.health,
            armor: player.armor,
            alive: player.alive,
            team: player.team,
            weapon: player.weapon?.name || 'classic',
            sprinting: player.sprinting,
            crouching: player.crouching,
            username: window.currentUser.displayName || window.currentUser.email?.split('@')[0] || 'Joueur',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    } catch (error) {
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
            width: 30,
            height: 30,
            angle: playerData.angle || 0,
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
        // Mettre à jour les données existantes
        otherPlayers[playerId].x = playerData.x || otherPlayers[playerId].x;
        otherPlayers[playerId].y = playerData.y || otherPlayers[playerId].y;
        otherPlayers[playerId].angle = playerData.angle || otherPlayers[playerId].angle;
        otherPlayers[playerId].health = playerData.health !== undefined ? playerData.health : otherPlayers[playerId].health;
        otherPlayers[playerId].armor = playerData.armor !== undefined ? playerData.armor : otherPlayers[playerId].armor;
        otherPlayers[playerId].alive = playerData.alive !== false;
        otherPlayers[playerId].team = playerData.team || otherPlayers[playerId].team;
        otherPlayers[playerId].weapon = playerData.weapon || otherPlayers[playerId].weapon;
        otherPlayers[playerId].sprinting = playerData.sprinting || false;
        otherPlayers[playerId].crouching = playerData.crouching || false;
        otherPlayers[playerId].username = playerData.username || otherPlayers[playerId].username;
    }
};

function updateGameTimers(dt) {
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
                game.bomb.carrier = 'player';
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
        
        if (ownerId === 'player') {
            player.kills++;
            player.abilities.ultimate.points = Math.min(
                player.abilities.ultimate.points + 1,
                player.abilities.ultimate.maxPoints
            );
            if (player.abilities.ultimate.points >= player.abilities.ultimate.maxPoints) {
                player.abilities.ultimate.ready = true;
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
    
    // Autres joueurs
    drawOtherPlayers();
    
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
    return game.bomb.carrier === 'player';
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
    game.bomb.carrier = 'player';
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
        window.NotificationSystem.show('Spike posée', `La spike est armée sur le ${siteLabel}`, 'round', 3500);
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
            bomb.carrier = 'player';
        }
        return;
    }

    const center = getPlayerCenter();

    if (bomb.planting) {
        const site = getBombSiteAt(center.x, center.y);
        if (!keys['f'] || !playerHasBomb() || !player.alive || !site) {
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
        if (!keys['f'] || player.team !== 'defenders' || !player.alive || distance > BOMB_SETTINGS.pickupRadius) {
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
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (key === 'r' && !player.reloading) {
        reload();
    }

    if (key === 'shift') {
        player.sprinting = true;
    }

    if (key === 'escape') {
        game.gamePaused = !game.gamePaused;
    }

    // Boutique - touche B
    if (key === 'b') {
        e.preventDefault();
        toggleBuyMenu();
    }

    // Abilities
    if (key === 'q') useAbility('ability1');
    if (key === 'e') useAbility('ability2');
    if (key === 'x') useAbility('ultimate');
    if (key === 'f') {
        e.preventDefault();
        attemptBombInteraction();
    }

    // Changement d'arme
    if (key === '1') equipWeapon('phantom');
    if (key === '2') equipWeapon('sheriff');
    if (key === '3') equipWeapon('operator');
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    keys[key] = false;
    
    if (key === 'shift') {
        player.sprinting = false;
    }
    
    if (key === 'f') {
        e.preventDefault();
        cancelBombInteraction(player.actionType);
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
    game.gamePaused = true;
}

function closeBuyMenu() {
    const buyMenuOverlay = document.getElementById('buy-menu-overlay');
    if (!buyMenuOverlay) return;

    buyMenuOverlay.classList.add('hidden');
    game.gamePaused = false;
}

function updateBuyMenuMoney() {
    const moneyDisplay = document.getElementById('buy-menu-money');
    if (moneyDisplay) {
        moneyDisplay.textContent = player.money || 800;
    }
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
    updateBuyMenuMoney();
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

    updateBuyMenuMoney();
    updateUI();

    if (window.NotificationSystem) {
        window.NotificationSystem.show('Achat réussi', `Armure ${type === 'light' ? 'légère' : 'lourde'} achetée`, 'success', 2000);
    }
}

// ========================================
// UTILITAIRES
// ========================================

function stopGame() {
    game.gameStarted = false;
    game.gamePaused = true;
    window.SpectatorSystem?.disable?.(true);

    closeBuyMenu();

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

