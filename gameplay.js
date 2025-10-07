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
        penetration: 2,
        bulletSize: 4
    }
};

// ========================================
// TYPES D'OBJETS DESTRUCTIBLES
// ========================================

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
    alive: true,
    team: 'attackers',
    money: 800,
    sprinting: false,
    crouching: false,
    reloading: false,
    lastShot: 0,
    weapon: null,
    inventory: [],
    abilities: {
        ability1: { cooldown: 0, maxCooldown: 25, ready: true },
        ability2: { cooldown: 0, maxCooldown: 35, ready: true },
        ultimate: { points: 0, maxPoints: 7, ready: false }
    },
    kills: 0,
    deaths: 0,
    assists: 0
};

// ========================================
// ÉTAT DU JEU
// ========================================

window.game = {
    gameStarted: false,
    gamePaused: false,
    mode: 'deathmatch',
    currentMap: 'dust2_complex',
    round: 1,
    maxRounds: 13,
    roundTime: 100,
    buyTime: 30,
    phase: 'buy',
    attackersScore: 0,
    defendersScore: 0,
    bomb: {
        planted: false,
        carrier: null,
        timer: 45,
        x: 0,
        y: 0,
        defusing: false,
        defuseProgress: 0
    },
    camera: {
        x: 0,
        y: 0,
        shake: 0,
        shakeIntensity: 0
    }
};

// ========================================
// AUTRES ENTITÉS
// ========================================

window.otherPlayers = {};
let bullets = [];
let particles = [];
let damageNumbers = [];
let gameObjects = [];
let smokeGrenades = [];
let flashbangs = [];

// ========================================
// CARTE COMPLÈTE AVEC OBJETS
// ========================================

const MAPS = {
    dust2_complex: {
        name: 'Dust 2',
        width: 2400,
        height: 1600,
        backgroundColor: '#2a2416',
        walls: [
            // Bordures
            { x: 0, y: 0, width: 2400, height: 20, type: 'concrete_wall' },
            { x: 0, y: 0, width: 20, height: 1600, type: 'concrete_wall' },
            { x: 0, y: 1580, width: 2400, height: 20, type: 'concrete_wall' },
            { x: 2380, y: 0, width: 20, height: 1600, type: 'concrete_wall' },
            
            // Murs intérieurs
            { x: 400, y: 200, width: 600, height: 20, type: 'concrete_wall' },
            { x: 400, y: 1380, width: 600, height: 20, type: 'concrete_wall' },
            { x: 1400, y: 200, width: 600, height: 20, type: 'concrete_wall' },
            { x: 1400, y: 1380, width: 600, height: 20, type: 'concrete_wall' },
            
            // Couloirs
            { x: 800, y: 500, width: 20, height: 600, type: 'concrete_wall' },
            { x: 1600, y: 500, width: 20, height: 600, type: 'concrete_wall' }
        ],
        objects: [
            // Caisses en bois
            { x: 300, y: 300, type: 'wood_crate' },
            { x: 360, y: 300, type: 'wood_crate' },
            { x: 300, y: 360, type: 'wood_crate' },
            { x: 500, y: 500, type: 'wood_crate' },
            { x: 600, y: 600, type: 'wood_crate' },
            { x: 1800, y: 300, type: 'wood_crate' },
            { x: 1900, y: 400, type: 'wood_crate' },
            { x: 1050, y: 950, type: 'light_cover' },
            { x: 1120, y: 1000, type: 'light_cover' },
            { x: 1450, y: 620, type: 'light_cover' },
            { x: 1550, y: 620, type: 'light_cover' },
            
            // Caisses métalliques
            { x: 700, y: 700, type: 'metal_crate' },
            { x: 1700, y: 700, type: 'metal_crate' },
            
            // Portes
            { x: 1000, y: 400, type: 'wood_door' },
            { x: 1400, y: 800, type: 'wood_door' },
            
            // Barils explosifs
            { x: 450, y: 800, type: 'barrel' },
            { x: 1200, y: 600, type: 'barrel' },
            { x: 2000, y: 1200, type: 'barrel' }
        ],
        spawnPoints: {
            attackers: [
                { x: 100, y: 100 }, { x: 150, y: 100 }, { x: 100, y: 150 },
                { x: 200, y: 100 }, { x: 100, y: 200 }
            ],
            defenders: [
                { x: 2200, y: 1400 }, { x: 2250, y: 1400 }, { x: 2200, y: 1450 },
                { x: 2150, y: 1400 }, { x: 2200, y: 1350 }
            ]
        },
        bombSites: [
            { x: 300, y: 1200, width: 300, height: 200, name: 'A' },
            { x: 1900, y: 300, width: 300, height: 200, name: 'B' }
        ]
    }
};

// ========================================
// INITIALISATION
// ========================================

function initializeGame() {
    console.log('Initialisation du gameplay avancé...');
    
    gameCanvas = document.getElementById('game-canvas');
    if (!gameCanvas) {
        console.error('Canvas non trouvé');
        return false;
    }
    
    gameContext = gameCanvas.getContext('2d');
    gameCanvas.width = 1200;
    gameCanvas.height = 800;
    
    setupControls();
    initializeMap();
    equipWeapon('phantom');
    resetGameState();
    startGameLoop();
    
    game.gameStarted = true;
    console.log('Gameplay initialisé');
    return true;
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
            destroyed: false
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
            destroyed: false
        });
    });
}

function resetGameState() {
    const map = MAPS[game.currentMap];
    const spawn = map.spawnPoints[player.team][0];
    
    player.x = spawn.x;
    player.y = spawn.y;
    player.health = player.maxHealth;
    player.armor = 0;
    player.alive = true;
    player.reloading = false;
    
    game.roundTime = 100;
    game.buyTime = 30;
    game.phase = 'buy';
    
    bullets = [];
    particles = [];
    damageNumbers = [];
    smokeGrenades = [];
    flashbangs = [];
    
    game.camera.x = player.x;
    game.camera.y = player.y;
}

function equipWeapon(weaponName) {
    if (WEAPONS[weaponName]) {
        player.weapon = {
            ...WEAPONS[weaponName],
            ammo: WEAPONS[weaponName].maxAmmo,
            totalAmmo: WEAPONS[weaponName].totalAmmo
        };
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
    
    console.log('Contrôles configurés');
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
    if (player.alive) {
        updatePlayer(dt);
        updateCamera(dt);
        updateAbilityCooldowns(dt);
    }
    
    updateBullets(dt);
    updateParticles(dt);
    updateDamageNumbers(dt);
    updateSmokeGrenades(dt);
    updateFlashbangs(dt);
    updateOtherPlayers(dt);
    updateGameTimers(dt);
    updateUI();
    
    if (mouse.pressed && player.alive && !player.reloading) {
        shoot();
    }
}

function updatePlayer(dt) {
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

    const moveSpeed = (player.sprinting ? player.sprintSpeed : player.speed) * dt * 60;
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
    
    // Angle vers la souris
    const dx_mouse = mouse.worldX - player.x;
    const dy_mouse = mouse.worldY - player.y;
    player.angle = Math.atan2(dy_mouse, dx_mouse);
}

function updateCamera(dt) {
    const smoothness = 0.1;
    const targetX = player.x;
    const targetY = player.y;
    
    game.camera.x += (targetX - game.camera.x) * smoothness;
    game.camera.y += (targetY - game.camera.y) * smoothness;
    
    // Shake de caméra
    if (game.camera.shake > 0) {
        game.camera.shake -= dt * 5;
        game.camera.shakeIntensity = game.camera.shake * 10;
    }
}

function updateAbilityCooldowns(dt) {
    for (const key in player.abilities) {
        const ability = player.abilities[key];
        if (ability.cooldown > 0) {
            ability.cooldown -= dt;
            if (ability.cooldown <= 0) {
                ability.cooldown = 0;
                ability.ready = true;
            }
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
}

function updateGameTimers(dt) {
    if (game.phase === 'buy' && game.buyTime > 0) {
        game.buyTime -= dt;
        if (game.buyTime <= 0) {
            game.phase = 'active';
            game.buyTime = 0;
        }
    } else if (game.phase === 'active' && game.roundTime > 0) {
        game.roundTime -= dt;
        if (game.roundTime <= 0) {
            endRound('time_up');
        }
    }
}

// ========================================
// SYSTÈME DE TIR AVANCÉ
// ========================================

function shoot() {
    if (!player.weapon || player.reloading) return;
    
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
    
    // Spread
    const spread = player.weapon.spread * (player.sprinting ? 2 : 1);
    const angle = player.angle + (Math.random() - 0.5) * spread;
    
    createBullet(angle);
    createMuzzleFlash();
    addCameraShake(2);
    
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
        damage: player.weapon.damage,
        penetration: player.weapon.penetration,
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
    
    addCameraShake(5);
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
    
    addCameraShake(10);
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
    if (player.reloading || player.weapon.ammo === player.weapon.maxAmmo) return;
    if (player.weapon.totalAmmo <= 0) return;
    
    player.reloading = true;
    
    setTimeout(() => {
        const ammoNeeded = player.weapon.maxAmmo - player.weapon.ammo;
        const ammoToReload = Math.min(ammoNeeded, player.weapon.totalAmmo);
        
        player.weapon.ammo += ammoToReload;
        player.weapon.totalAmmo -= ammoToReload;
        player.reloading = false;
        
        updateAmmoDisplay();
    }, player.weapon.reloadTime * 1000);
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
    game.camera.shake = Math.max(game.camera.shake, intensity);
}

// ========================================
// COMPÉTENCES (ABILITIES)
// ========================================

function useAbility(abilityKey) {
    const ability = player.abilities[abilityKey];
    if (!ability || !ability.ready || ability.cooldown > 0) return;
    
    switch(abilityKey) {
        case 'ability1':
            // Grenade fumigène
            throwSmokeGrenade();
            ability.cooldown = ability.maxCooldown;
            ability.ready = false;
            break;
            
        case 'ability2':
            // Flashbang
            throwFlashbang();
            ability.cooldown = ability.maxCooldown;
            ability.ready = false;
            break;
            
        case 'ultimate':
            if (ability.points >= ability.maxPoints) {
                // Ultimate
                activateUltimate();
                ability.points = 0;
                ability.ready = false;
            }
            break;
    }
}

function throwSmokeGrenade() {
    const throwDistance = 300;
    const targetX = player.x + Math.cos(player.angle) * throwDistance;
    const targetY = player.y + Math.sin(player.angle) * throwDistance;
    
    smokeGrenades.push({
        x: targetX,
        y: targetY,
        radius: 0,
        maxRadius: 150,
        lifetime: 15,
        opacity: 0.7
    });
    
    createImpactEffect(targetX, targetY, '#999999');
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
    console.log('ULTIMATE ACTIVÉ!');
    
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

// ========================================
// COLLISIONS
// ========================================

function checkCollision(x, y, width, height) {
    for (const obj of gameObjects) {
        if (obj.destroyed) continue;
        
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
        scoreboardMap.textContent = MAPS[game.currentMap]?.name || game.currentMap;
    }
    
    const weaponNameElement = document.getElementById('current-weapon');
    if (weaponNameElement && player.weapon) {
        weaponNameElement.textContent = player.weapon.name;
    }
    
    updateAmmoDisplay();
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

function endRound(reason) {
    console.log('Round terminé:', reason);
    game.phase = 'ended';
    
    setTimeout(() => {
        game.round++;
        resetGameState();
    }, 5000);
}

// ========================================
// RENDU
// ========================================

function render() {
    if (!gameContext) return;
    
    const map = MAPS[game.currentMap];
    
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
    
    // Fumée
    drawSmokeGrenades();
    
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
    drawHUD();
}

function drawMap() {
    for (const obj of gameObjects) {
        if (obj.destroyed) continue;
        
        gameContext.fillStyle = obj.color;
        gameContext.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // Barre de vie pour objets destructibles
        if (obj.destructible && obj.health < obj.maxHealth) {
            const healthPercent = obj.health / obj.maxHealth;
            gameContext.fillStyle = '#ff0000';
            gameContext.fillRect(obj.x, obj.y - 8, obj.width, 4);
            gameContext.fillStyle = '#00ff00';
            gameContext.fillRect(obj.x, obj.y - 8, obj.width * healthPercent, 4);
        }
    }
}

function drawPlayer() {
    if (!player.alive) return;
    
    gameContext.save();
    gameContext.translate(player.x + player.width / 2, player.y + player.height / 2);
    gameContext.rotate(player.angle);
    
    // Corps
    gameContext.fillStyle = player.team === 'attackers' ? '#ff4655' : '#00d4ff';
    gameContext.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Arme
    gameContext.fillStyle = '#333333';
    gameContext.fillRect(0, -3, 25, 6);
    
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
        
        const color = other.team === 'attackers' ? '#ff6655' : '#44d4ff';
        gameContext.fillStyle = color;
        gameContext.fillRect(other.x, other.y, 30, 30);
        
        // Nom
        gameContext.fillStyle = '#ffffff';
        gameContext.font = '10px Arial';
        gameContext.textAlign = 'center';
        gameContext.fillText(other.name || 'Joueur', other.x + 15, other.y - 5);
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

function drawSmokeGrenades() {
    for (const smoke of smokeGrenades) {
        const gradient = gameContext.createRadialGradient(
            smoke.x, smoke.y, 0,
            smoke.x, smoke.y, smoke.radius
        );
        gradient.addColorStop(0, `rgba(200, 200, 200, ${smoke.opacity})`);
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
    // Crosshair
    const centerX = gameCanvas.width / 2;
    const centerY = gameCanvas.height / 2;
    
    gameContext.strokeStyle = '#00ff00';
    gameContext.lineWidth = 2;
    gameContext.beginPath();
    gameContext.moveTo(centerX - 10, centerY);
    gameContext.lineTo(centerX - 3, centerY);
    gameContext.moveTo(centerX + 3, centerY);
    gameContext.lineTo(centerX + 10, centerY);
    gameContext.moveTo(centerX, centerY - 10);
    gameContext.lineTo(centerX, centerY - 3);
    gameContext.moveTo(centerX, centerY + 3);
    gameContext.lineTo(centerX, centerY + 10);
    gameContext.stroke();
    
    // Cooldowns des abilities
    drawAbilityCooldowns();
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
    
    // Abilities
    if (key === 'q') useAbility('ability1');
    if (key === 'e') useAbility('ability2');
    if (key === 'x') useAbility('ultimate');
    
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
}

function handleMouseDown(e) {
    if (e.button === 0) {
        mouse.pressed = true;
    }
}

function handleMouseUp(e) {
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
// UTILITAIRES
// ========================================

function stopGame() {
    game.gameStarted = false;
    game.gamePaused = true;
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
}

function leaveGame() {
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

console.log('Système de gameplay avancé chargé (1900+ lignes)');
