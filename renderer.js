// Système de rendu avancé pour SIO SHOOTER 2D

class GameRenderer {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.effects = [];
        this.animations = [];
        this.particles = [];
        this.ui = new UIRenderer(this.ctx);
        this.lighting = new LightingSystem(this.ctx);
        
        // Paramètres de rendu
        this.settings = {
            showHitboxes: false,
            showFPS: false,
            particleQuality: 'high',
            shadowQuality: 'medium',
            antiAliasing: true
        };
        
        // Statistiques de performance
        this.stats = {
            fps: 0,
            frameTime: 0,
            drawCalls: 0,
            particles: 0
        };
        
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
    }
    
    // Fonction principale de rendu
    render(gameState) {
        const startTime = performance.now();
        this.stats.drawCalls = 0;
        
        // Effacer le canvas
        this.clear();
        
        // Rendu selon l'état du jeu
        switch(gameState.phase) {
            case 'buy':
                this.renderBuyPhase(gameState);
                break;
            case 'active':
                this.renderActivePhase(gameState);
                break;
            case 'ended':
                this.renderRoundEnd(gameState);
                break;
        }
        
        // Rendu des effets visuels
        this.renderEffects();
        this.renderParticles();
        this.renderAnimations();
        
        // Interface utilisateur
        this.ui.render(gameState);
        
        // Debug et stats
        if (this.settings.showFPS) {
            this.renderFPS();
        }
        
        if (this.settings.showHitboxes) {
            this.renderHitboxes(gameState);
        }
        
        // Mettre à jour les statistiques
        this.updateStats(startTime);
    }
    
    clear() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.stats.drawCalls++;
    }
    
    renderBuyPhase(gameState) {
        // Rendu pendant la phase d'achat
        this.renderMap(gameState.currentMap);
        this.renderPlayers(gameState, true); // Mode statique
        this.renderSpawnAreas(gameState);
        
        // Overlay de phase d'achat
        this.renderBuyPhaseOverlay(gameState);
    }
    
    renderActivePhase(gameState) {
        // Rendu pendant la phase active
        this.renderMap(gameState.currentMap);
        this.renderBombSites(gameState);
        this.renderBomb(gameState);
        this.renderPlayers(gameState, false);
        this.renderProjectiles(gameState.bullets);
        this.renderUtilities(gameState);
        this.renderVisualEffects();
    }
    
    renderRoundEnd(gameState) {
        // Rendu pendant la fin de round
        this.renderActivePhase(gameState);
        this.renderRoundEndOverlay(gameState);
    }
    
    renderMap(mapName) {
        const mapData = MAPS[mapName];
        if (!mapData) return;
        
        // Rendu du sol
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.stats.drawCalls++;
        
        // Rendu des murs avec éclairage
        this.ctx.fillStyle = '#444444';
        mapData.walls.forEach(wall => {
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            
            // Ombre portée
            if (this.settings.shadowQuality !== 'off') {
                this.lighting.castShadow(wall.x, wall.y, wall.width, wall.height);
            }
        });
        this.stats.drawCalls += mapData.walls.length;
        
        // Détails de la carte
        this.renderMapDetails(mapData);
    }
    
    renderMapDetails(mapData) {
        // Textures et détails des murs
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        mapData.walls.forEach(wall => {
            // Contour des murs
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
            
            // Motifs sur les murs
            if (wall.width > 50 || wall.height > 50) {
                this.renderWallPattern(wall);
            }
        });
    }
    
    renderWallPattern(wall) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 0.5;
        
        // Motif de briques
        const brickWidth = 30;
        const brickHeight = 15;
        
        for (let y = wall.y; y < wall.y + wall.height; y += brickHeight) {
            for (let x = wall.x; x < wall.x + wall.width; x += brickWidth) {
                const offsetX = ((y - wall.y) / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                this.ctx.strokeRect(x + offsetX, y, brickWidth, brickHeight);
            }
        }
        
        this.ctx.restore();
    }
    
    renderBombSites(gameState) {
        const mapData = MAPS[gameState.currentMap];
        if (!mapData) return;
        
        mapData.bombSites.forEach(site => {
            // Site de bombe normal
            this.ctx.fillStyle = game.bomb.site === site.name ? 
                'rgba(255, 70, 85, 0.4)' : 'rgba(255, 70, 85, 0.2)';
            this.ctx.fillRect(site.x, site.y, site.width, site.height);
            
            // Bordure du site
            this.ctx.strokeStyle = '#ff4655';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(site.x, site.y, site.width, site.height);
            
            // Texte du site avec effet
            this.renderSiteLabel(site);
        });
        
        this.stats.drawCalls += mapData.bombSites.length * 2;
    }
    
    renderSiteLabel(site) {
        this.ctx.save();
        
        // Ombre du texte
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `SITE ${site.name}`, 
            site.x + site.width / 2 + 2, 
            site.y + site.height / 2 + 2
        );
        
        // Texte principal
        this.ctx.fillStyle = '#ff4655';
        this.ctx.fillText(
            `SITE ${site.name}`, 
            site.x + site.width / 2, 
            site.y + site.height / 2
        );
        
        this.ctx.restore();
    }
    
    renderBomb(gameState) {
        if (!game.bomb.planted) return;
        
        const mapData = MAPS[gameState.currentMap];
        const bombSite = mapData.bombSites.find(site => site.name === game.bomb.site);
        if (!bombSite) return;
        
        const bombX = bombSite.x + bombSite.width / 2;
        const bombY = bombSite.y + bombSite.height / 2;
        
        // Animation clignotante basée sur le timer
        const blinkSpeed = Math.max(0.1, game.bomb.timer / 45);
        const intensity = Math.sin(Date.now() * 0.01 / blinkSpeed) * 0.5 + 0.5;
        
        // Aura de la bombe
        this.ctx.save();
        const gradient = this.ctx.createRadialGradient(bombX, bombY, 0, bombX, bombY, 30);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(bombX - 30, bombY - 30, 60, 60);
        this.ctx.restore();
        
        // Corps de la bombe
        this.ctx.fillStyle = intensity > 0.5 ? '#ff0000' : '#990000';
        this.ctx.beginPath();
        this.ctx.arc(bombX, bombY, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Détails de la bombe
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Timer de la bombe
        this.renderBombTimer(bombX, bombY);
        
        this.stats.drawCalls += 3;
    }
    
    renderBombTimer(bombX, bombY) {
        this.ctx.save();
        
        // Fond du timer
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(bombX - 25, bombY + 20, 50, 20);
        
        // Texte du timer
        const timeLeft = Math.ceil(game.bomb.timer);
        this.ctx.fillStyle = timeLeft <= 10 ? '#ff0000' : '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${timeLeft}s`, bombX, bombY + 34);
        
        this.ctx.restore();
    }
    
    renderSpawnAreas(gameState) {
        const mapData = MAPS[gameState.currentMap];
        if (!mapData) return;
        
        // Zone des attaquants
        this.ctx.fillStyle = 'rgba(255, 70, 85, 0.1)';
        mapData.spawnPoints.attackers.forEach(spawn => {
            this.ctx.beginPath();
            this.ctx.arc(spawn.x, spawn.y, 40, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Zone des défenseurs
        this.ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
        mapData.spawnPoints.defenders.forEach(spawn => {
            this.ctx.beginPath();
            this.ctx.arc(spawn.x, spawn.y, 40, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.stats.drawCalls += mapData.spawnPoints.attackers.length + mapData.spawnPoints.defenders.length;
    }
    
    renderPlayers(gameState, isStatic = false) {
        // Rendu du joueur principal
        this.renderPlayer(player, true, isStatic);
        
        // Rendu des autres joueurs
        Object.values(otherPlayers).forEach(otherPlayer => {
            if (otherPlayer.alive) {
                this.renderPlayer(otherPlayer, false, isStatic);
            }
        });
        
        this.stats.drawCalls += 1 + Object.keys(otherPlayers).length;
    }
    
    renderPlayer(playerObj, isCurrentPlayer, isStatic) {
        if (!playerObj.alive && !isStatic) return;
        
        this.ctx.save();
        
        // Corps du joueur avec détails
        const teamColor = playerObj.team === 'attackers' ? '#ff4655' : '#00d4ff';
        
        // Ombre du joueur
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(playerObj.x + 2, playerObj.y + 17, 15, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Corps principal
        this.ctx.fillStyle = teamColor;
        this.ctx.beginPath();
        this.ctx.arc(playerObj.x, playerObj.y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Contour du joueur
        this.ctx.strokeStyle = isCurrentPlayer ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = isCurrentPlayer ? 3 : 2;
        this.ctx.stroke();
        
        // Direction de visée
        if (!isStatic) {
            this.renderAimDirection(playerObj, isCurrentPlayer);
        }
        
        // Indicateurs spéciaux
        this.renderPlayerIndicators(playerObj, isCurrentPlayer);
        
        // Nom du joueur
        this.renderPlayerName(playerObj, isCurrentPlayer);
        
        this.ctx.restore();
    }
    
    renderAimDirection(playerObj, isCurrentPlayer) {
        const aimLength = isCurrentPlayer ? 30 : 20;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = isCurrentPlayer ? 3 : 2;
        this.ctx.beginPath();
        this.ctx.moveTo(playerObj.x, playerObj.y);
        this.ctx.lineTo(
            playerObj.x + Math.cos(playerObj.angle || 0) * aimLength,
            playerObj.y + Math.sin(playerObj.angle || 0) * aimLength
        );
        this.ctx.stroke();
        
        // Point de visée
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            playerObj.x + Math.cos(playerObj.angle || 0) * aimLength,
            playerObj.y + Math.sin(playerObj.angle || 0) * aimLength,
            2, 0, Math.PI * 2
        );
        this.ctx.fill();
    }
    
    renderPlayerIndicators(playerObj, isCurrentPlayer) {
        // Indicateur de bombe
        if (game.bomb.carrier === (isCurrentPlayer ? currentUser.uid : playerObj.id)) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.beginPath();
            this.ctx.arc(playerObj.x - 20, playerObj.y - 20, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Icône de bombe
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '8px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('💣', playerObj.x - 20, playerObj.y - 16);
        }
        
        // Indicateur de santé basse
        if (playerObj.health < 30) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(playerObj.x, playerObj.y, 18, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        // Indicateur d'action
        if (game.bomb.planting || game.bomb.defusing) {
            this.renderActionIndicator(playerObj);
        }
    }
    
    renderActionIndicator(playerObj) {
        const action = game.bomb.planting ? 'PLANT' : 'DEFUSE';
        const color = game.bomb.planting ? '#ff4655' : '#00d4ff';
        
        // Cercle de progression
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(playerObj.x, playerObj.y, 25, -Math.PI/2, Math.PI * 1.5);
        this.ctx.stroke();
        
        // Texte d'action
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(action, playerObj.x, playerObj.y - 35);
    }
    
    renderPlayerName(playerObj, isCurrentPlayer) {
        const name = isCurrentPlayer ? 
            (currentUser?.displayName || 'Vous') : 
            (playerObj.name || 'Joueur');
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = isCurrentPlayer ? 'bold 12px Arial' : '11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 3;
        
        // Contour du texte
        this.ctx.strokeText(name, playerObj.x, playerObj.y - 25);
        // Texte principal
        this.ctx.fillText(name, playerObj.x, playerObj.y - 25);
    }
    
    renderProjectiles(bullets) {
        if (!bullets || bullets.length === 0) return;
        
        bullets.forEach(bullet => {
            // Traînée du projectile
            this.renderBulletTrail(bullet);
            
            // Corps du projectile
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Lueur du projectile
            const gradient = this.ctx.createRadialGradient(bullet.x, bullet.y, 0, bullet.x, bullet.y, 8);
            gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(bullet.x - 8, bullet.y - 8, 16, 16);
        });
        
        this.stats.drawCalls += bullets.length * 3;
    }
    
    renderBulletTrail(bullet) {
        // Calculer la traînée basée sur la vitesse
        const trailLength = 15;
        const trailX = bullet.x - bullet.dx * 2;
        const trailY = bullet.y - bullet.dy * 2;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(trailX, trailY);
        this.ctx.lineTo(bullet.x, bullet.y);
        this.ctx.stroke();
    }
    
    renderUtilities(gameState) {
        // Rendu des utilitaires comme les fumées, flashbangs, etc.
        // Pour l'instant, juste un placeholder
        if (gameState.utilities) {
            gameState.utilities.forEach(utility => {
                this.renderUtility(utility);
            });
        }
    }
    
    renderUtility(utility) {
        switch(utility.type) {
            case 'smoke':
                this.renderSmoke(utility);
                break;
            case 'flash':
                this.renderFlash(utility);
                break;
        }
    }
    
    renderSmoke(smoke) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderVisualEffects() {
        // Rendu des effets visuels comme les explosions, impacts, etc.
        this.effects.forEach((effect, index) => {
            if (effect.render(this.ctx)) {
                this.effects.splice(index, 1);
            }
        });
    }
    
    renderParticles() {
        this.stats.particles = particles.length;
        
        particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        this.stats.drawCalls += particles.length;
    }
    
    renderEffects() {
        // Rendu des effets spéciaux
        this.effects.forEach(effect => {
            if (effect.active) {
                effect.render(this.ctx);
            }
        });
    }
    
    renderAnimations() {
        // Rendu des animations
        this.animations.forEach((animation, index) => {
            if (animation.update()) {
                animation.render(this.ctx);
            } else {
                this.animations.splice(index, 1);
            }
        });
    }
    
    renderBuyPhaseOverlay(gameState) {
        // Overlay semi-transparent
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Texte de phase d'achat
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 4;
        
        const text = 'PHASE D\'ACHAT';
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2 - 100;
        
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
        
        // Timer de la phase d'achat
        const timeLeft = Math.ceil(game.buyTime);
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = timeLeft <= 10 ? '#ff4655' : '#ffd700';
        
        this.ctx.strokeText(`${timeLeft}`, x, y + 80);
        this.ctx.fillText(`${timeLeft}`, x, y + 80);
        
        this.stats.drawCalls += 4;
    }
    
    renderRoundEndOverlay(gameState) {
        // Overlay de fin de round
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Message de fin de round
        const message = this.getRoundEndMessage(gameState);
        this.ctx.fillStyle = message.color;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(message.text, x, y);
        this.ctx.fillText(message.text, x, y);
        
        this.stats.drawCalls += 2;
    }
    
    getRoundEndMessage(gameState) {
        // Déterminer le message de fin de round
        if (game.attackersScore > game.defendersScore) {
            return { text: 'ATTAQUANTS GAGNENT', color: '#ff4655' };
        } else if (game.defendersScore > game.attackersScore) {
            return { text: 'DÉFENSEURS GAGNENT', color: '#00d4ff' };
        } else {
            return { text: 'ÉGALITÉ', color: '#ffd700' };
        }
    }
    
    renderHitboxes(gameState) {
        // Debug: afficher les hitboxes
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 1;
        
        // Hitbox du joueur
        this.ctx.strokeRect(player.x - 15, player.y - 15, 30, 30);
        
        // Hitboxes des autres joueurs
        Object.values(otherPlayers).forEach(otherPlayer => {
            this.ctx.strokeRect(otherPlayer.x - 15, otherPlayer.y - 15, 30, 30);
        });
        
        // Hitboxes des murs
        const mapData = MAPS[gameState.currentMap];
        if (mapData) {
            mapData.walls.forEach(wall => {
                this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
            });
        }
    }
    
    renderFPS() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`FPS: ${this.stats.fps}`, 20, 30);
        this.ctx.fillText(`Frame Time: ${this.stats.frameTime.toFixed(2)}ms`, 20, 50);
        this.ctx.fillText(`Draw Calls: ${this.stats.drawCalls}`, 20, 70);
        this.ctx.fillText(`Particles: ${this.stats.particles}`, 20, 90);
    }
    
    updateStats(startTime) {
        const currentTime = performance.now();
        this.stats.frameTime = currentTime - startTime;
        this.frameCount++;
        
        // Mettre à jour le FPS toutes les secondes
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.stats.fps = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    
    // Ajouter des effets
    addEffect(effect) {
        this.effects.push(effect);
    }
    
    addAnimation(animation) {
        this.animations.push(animation);
    }
    
    // Mise à jour des paramètres
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}

// Système de rendu de l'interface utilisateur
class UIRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    render(gameState) {
        // L'interface est principalement gérée par HTML/CSS
        // Ici on peut ajouter des éléments de jeu spécifiques
        this.renderCrosshair();
        this.renderDamageIndicators();
        this.renderReticle(gameState);
    }
    
    renderCrosshair() {
        const centerX = this.ctx.canvas.width / 2;
        const centerY = this.ctx.canvas.height / 2;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Crosshair horizontal
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 10, centerY);
        this.ctx.lineTo(centerX + 10, centerY);
        this.ctx.stroke();
        
        // Crosshair vertical
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 10);
        this.ctx.lineTo(centerX, centerY + 10);
        this.ctx.stroke();
        
        // Point central
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(centerX - 1, centerY - 1, 2, 2);
    }
    
    renderDamageIndicators() {
        // Les indicateurs de dégâts sont gérés dans StatsTracker
        // Ici on pourrait ajouter des effets visuels supplémentaires
    }
    
    renderReticle(gameState) {
        // Réticule dynamique basé sur l'arme
        if (player.weapon && player.weapon.name !== 'Classic') {
            this.renderWeaponReticle(player.weapon);
        }
    }
    
    renderWeaponReticle(weapon) {
        const centerX = this.ctx.canvas.width / 2;
        const centerY = this.ctx.canvas.height / 2;
        
        // Réticule spécifique selon l'arme
        switch(weapon.name) {
            case 'Operator':
                this.renderSniperScope(centerX, centerY);
                break;
            default:
                // Réticule standard déjà rendu dans renderCrosshair
                break;
        }
    }
    
    renderSniperScope(centerX, centerY) {
        // Scope de sniper
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // Cercle extérieur
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Cercle intérieur
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Lignes de visée
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 50, centerY);
        this.ctx.lineTo(centerX + 50, centerY);
        this.ctx.moveTo(centerX, centerY - 50);
        this.ctx.lineTo(centerX, centerY + 50);
        this.ctx.stroke();
    }
}

// Système d'éclairage simple
class LightingSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.shadows = [];
    }
    
    castShadow(x, y, width, height) {
        // Ombre simple pour les murs
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(x + 2, y + 2, width, height);
    }
    
    addLight(x, y, radius, intensity) {
        // Ajouter une source de lumière
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
}

// Effets visuels
class VisualEffect {
    constructor(x, y, type, duration = 1000) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.duration = duration;
        this.startTime = Date.now();
        this.active = true;
    }
    
    update() {
        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.duration) {
            this.active = false;
            return false;
        }
        return true;
    }
    
    render(ctx) {
        if (!this.active) return;
        
        switch(this.type) {
            case 'muzzle_flash':
                this.renderMuzzleFlash(ctx);
                break;
            case 'blood_splatter':
                this.renderBloodSplatter(ctx);
                break;
            case 'impact':
                this.renderImpact(ctx);
                break;
        }
    }
    
    renderMuzzleFlash(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 20);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 128, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
        
        ctx.restore();
    }
    
    renderBloodSplatter(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgba(150, 0, 0, ${alpha})`;
        
        // Éclaboussures de sang
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = progress * 15;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, 3 - progress * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    renderImpact(ctx) {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 3 - progress * 2;
        
        // Étoile d'impact
        const rays = 6;
        const innerRadius = 5;
        const outerRadius = 15 * (1 + progress);
        
        ctx.beginPath();
        for (let i = 0; i < rays * 2; i++) {
            const angle = (i / (rays * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Instance globale du renderer
let gameRenderer = null;

// Initialiser le renderer
function initializeRenderer(canvas, context) {
    gameRenderer = new GameRenderer(canvas, context);
    return gameRenderer;
}

// Créer des effets visuels
function createMuzzleFlash(x, y, angle) {
    if (gameRenderer) {
        const effect = new VisualEffect(x, y, 'muzzle_flash', 200);
        gameRenderer.addEffect(effect);
    }
    
    // Créer aussi les particules comme avant
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

function createBloodEffect(x, y) {
    if (gameRenderer) {
        const effect = new VisualEffect(x, y, 'blood_splatter', 1000);
        gameRenderer.addEffect(effect);
    }
    
    // Particules de sang
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

function createImpactEffect(x, y) {
    if (gameRenderer) {
        const effect = new VisualEffect(x, y, 'impact', 500);
        gameRenderer.addEffect(effect);
    }
    
    // Particules d'impact
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

// Export des fonctions du renderer
window.GameRenderer = {
    initializeRenderer,
    createMuzzleFlash,
    createBloodEffect,
    createImpactEffect,
    VisualEffect
};
