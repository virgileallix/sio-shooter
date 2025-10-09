// ========================================
// AGENTS.JS - SYSTÈME D'AGENTS VALORANT
// ========================================

const DEFAULT_AGENT_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' ry='12' fill='%23242a3a'/%3E%3Ctext x='32' y='36' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='30' fill='%23ffffff'%3EA%3C/text%3E%3C/svg%3E";
const DEFAULT_ABILITY_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' ry='12' fill='%23242a3a'/%3E%3Ctext x='32' y='36' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='30' fill='%23ffffff'%3E%3F%3C/text%3E%3C/svg%3E";

if (typeof window !== 'undefined') {
    window.DEFAULT_AGENT_ICON = DEFAULT_AGENT_ICON;
    window.DEFAULT_ABILITY_ICON = DEFAULT_ABILITY_ICON;
}

const AgentsRegistry = {
    reyna: {
        id: 'reyna',
        name: 'Reyna',
        codename: 'Impératrice',
        role: 'Duelliste',
        description: 'Reyna se nourrit des éliminations pour régénérer sa santé et devenir invincible.',
        difficulty: 'Moyen',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/reyna_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/reyna_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Dévorer',
                icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability1/displayicon.png',
                maxCooldown: 0,
                description: 'Consomme une âme pour régénérer rapidement toute la santé en 2 secondes',
                execute: (ctx) => {
                    // Heal progressif jusqu'à 100 HP en 2 secondes
                    const healDuration = 2000; // 2 secondes
                    const healInterval = 50; // Update toutes les 50ms
                    const startHealth = ctx.player.health;
                    const targetHealth = ctx.player.maxHealth || 100;
                    const totalHeal = targetHealth - startHealth;
                    const healPerTick = totalHeal / (healDuration / healInterval);

                    if (window.NotificationSystem) {
                        window.NotificationSystem.show('Dévorer', 'Régénération en cours...', 'success', 2000);
                    }

                    const healTimer = setInterval(() => {
                        if (ctx.player && ctx.player.health < targetHealth) {
                            ctx.player.health = Math.min(ctx.player.health + healPerTick, targetHealth);
                        } else {
                            clearInterval(healTimer);
                        }
                    }, healInterval);

                    // Arrêter le heal après 2 secondes
                    setTimeout(() => {
                        clearInterval(healTimer);
                        if (ctx.player) {
                            ctx.player.health = targetHealth;
                        }
                    }, healDuration);
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Rejeter',
                icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability2/displayicon.png',
                maxCooldown: 0,
                description: 'Devient invincible pendant 2 secondes',
                execute: (ctx) => {
                    ctx.applyInvincibility({ duration: 2 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Impératrice',
                icon: 'https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ultimate/displayicon.png',
                maxPoints: 6,
                description: 'Augmente la cadence de tir pour tout le round',
                execute: (ctx) => {
                    if (!ctx.player || !ctx.player.weapon) return;

                    // Stocker le multiplicateur pour tout le round
                    ctx.player.empressModeActive = true;
                    const originalFireRate = ctx.player.weapon.fireRate;
                    ctx.player.weapon.fireRate *= 0.5; // 50% plus rapide

                    if (window.NotificationSystem) {
                        window.NotificationSystem.show('Impératrice', 'Mode Impératrice activé pour tout le round!', 'ultimate', 3000);
                    }

                    // Créer un effet visuel permanent pendant le round
                    if (ctx.player.effects) {
                        ctx.player.effects.push({
                            type: 'empress',
                            permanent: true, // Dure tout le round
                            originalFireRate: originalFireRate
                        });
                    }
                }
            }
        },
        passive: {
            name: 'Âme Vorce',
            description: 'Les éliminations génèrent des âmes qui peuvent être consommées.',
            apply: (ctx) => {}
        }
    },
    jett: {
        id: 'jett',
        name: 'Jett',
        codename: 'Tempête',
        role: 'Duelliste',
        description: 'Agent agile capable de se déplacer rapidement et de planer dans les airs.',
        difficulty: 'Difficile',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/jett_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/jett_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Updraft',
                icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability1/displayicon.png',
                maxCooldown: 35,
                description: 'Propulse vers le haut',
                execute: (ctx) => {
                    ctx.applyDash({ direction: 'up', distance: 100, duration: 0.5 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Tailwind',
                icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability2/displayicon.png',
                maxCooldown: 30,
                description: 'Dash rapide dans la direction du mouvement',
                execute: (ctx) => {
                    ctx.applySpeedBoost({ speedMultiplier: 2.5, duration: 0.8 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Lames Tourbillonnantes',
                icon: 'https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ultimate/displayicon.png',
                maxPoints: 7,
                description: 'Équipe des couteaux de lancer ultra-précis',
                execute: (ctx) => {
                    ctx.enableKnives({ damage: 50, count: 5, precision: 0, duration: 12 });
                }
            }
        },
        passive: {
            name: 'Vol Plané',
            description: 'Peut planer en l\'air en maintenant saut.',
            apply: (ctx) => ctx.applyModifier('baseSpeed', 1.05)
        }
    },
    sage: {
        id: 'sage',
        name: 'Sage',
        codename: 'Guérisseuse',
        role: 'Sentinelle',
        description: 'Guérisseuse et protectrice, capable de créer des barrières et de ressusciter.',
        difficulty: 'Facile',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/sage_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/sage_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Orbe de Soin',
                icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability2/displayicon.png',
                maxCooldown: 45,
                description: 'Soigne soi-même de 60 HP',
                execute: (ctx) => {
                    const healAmount = 60;
                    ctx.player.health = Math.min(ctx.player.health + healAmount, ctx.player.maxHealth);
                    if (window.NotificationSystem) {
                        window.NotificationSystem.show('Soin', `+${healAmount} HP`, 'success', 2000);
                    }
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Orbe de Ralentissement',
                icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability1/displayicon.png',
                maxCooldown: 30,
                description: 'Crée une zone qui ralentit les ennemis',
                execute: (ctx) => {
                    ctx.spawnSlowField({ radius: 200, duration: 7, slowMultiplier: 0.4 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Barrière',
                icon: 'https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/grenade/displayicon.png',
                maxPoints: 8,
                description: 'Crée un mur indestructible pendant 30 secondes',
                execute: (ctx) => {
                    ctx.deployBarrier({ width: 300, height: 60, duration: 30, health: 99999 });
                }
            }
        },
        passive: {
            name: 'Fortitude',
            description: 'Augmente la santé maximale de 20 HP.',
            apply: (ctx) => {
                ctx.player.maxHealth = (ctx.player.maxHealth || 100) + 20;
                ctx.player.health = ctx.player.maxHealth;
            }
        }
    },
    phoenix: {
        id: 'phoenix',
        name: 'Phoenix',
        codename: 'Phénix',
        role: 'Duelliste',
        description: 'Maître du feu capable de se soigner et de renaître de ses cendres.',
        difficulty: 'Facile',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/pheonix_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/pheonix_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Mains Brûlantes',
                icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ability1/displayicon.png',
                maxCooldown: 25,
                description: 'Lance une boule de feu qui inflige des dégâts et soigne Phoenix',
                execute: (ctx) => {
                    ctx.throwFireball({ damage: 40, healSelf: 15, radius: 80 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Mur de Feu',
                icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/grenade/displayicon.png',
                maxCooldown: 30,
                description: 'Crée un mur de feu qui bloque la vision et inflige des dégâts',
                execute: (ctx) => {
                    ctx.deployFireWall({ width: 250, height: 50, duration: 8, damagePerSecond: 15 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Renaissance',
                icon: 'https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ultimate/displayicon.png',
                maxPoints: 6,
                description: 'Place un marqueur. Si vous mourez, vous renaissez au marqueur avec toute votre santé',
                execute: (ctx) => {
                    ctx.placeRespawnMarker({ duration: 10 });
                }
            }
        },
        passive: {
            name: 'Réchauffement',
            description: 'Se soigne de 1 HP/seconde dans son propre feu.',
            apply: (ctx) => {}
        }
    },
    omen: {
        id: 'omen',
        name: 'Omen',
        codename: 'Fantôme',
        role: 'Contrôleur',
        description: 'Manipulateur des ombres, capable de se téléporter et d\'aveugler.',
        difficulty: 'Moyen',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/omen_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/omen_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Linceul Ténébreux',
                icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ability1/displayicon.png',
                maxCooldown: 25,
                description: 'Lance un projectile qui aveugle les ennemis touchés',
                execute: (ctx) => {
                    ctx.throwFlashbang({ radius: 150, duration: 3 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Foulée Ténébreuse',
                icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/grenade/displayicon.png',
                maxCooldown: 35,
                description: 'Téléportation courte distance (15 mètres)',
                execute: (ctx) => {
                    ctx.teleportShort({ maxDistance: 250 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Depuis l\'Ombre',
                icon: 'https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ultimate/displayicon.png',
                maxPoints: 7,
                description: 'Téléportation n\'importe où sur la map',
                execute: (ctx) => {
                    ctx.teleportAnywhere({ duration: 15 });
                }
            }
        },
        passive: {
            name: 'Ombre',
            description: 'Génère des fumées gratuites.',
            apply: (ctx) => {}
        }
    },
    brimstone: {
        id: 'brimstone',
        name: 'Brimstone',
        codename: 'Commandant',
        role: 'Contrôleur',
        description: 'Tacticien orbital capable de fournir un support de fumées et de frappes.',
        difficulty: 'Facile',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/brimstone_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/brimstone_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Fumée Incendiaire',
                icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ability2/displayicon.png',
                maxCooldown: 20,
                description: 'Lance un projectile de fumée',
                execute: (ctx) => {
                    ctx.throwSmoke({ radius: 180, duration: 15, color: 'rgba(80, 80, 80, 0.85)' });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Beacon Stim',
                icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/grenade/displayicon.png',
                maxCooldown: 30,
                description: 'Déploie une balise qui augmente la vitesse de tir',
                execute: (ctx) => {
                    ctx.deployStimBeacon({ radius: 180, fireRateBonus: 0.15, duration: 10 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Frappe Orbitale',
                icon: 'https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ultimate/displayicon.png',
                maxPoints: 7,
                description: 'Lance une frappe laser dévastatrice',
                execute: (ctx) => {
                    ctx.orbitalStrike({ radius: 250, damagePerSecond: 50, duration: 4 });
                }
            }
        },
        passive: {
            name: 'Tactique Militaire',
            description: 'Voit les fumées alliées en transparence.',
            apply: (ctx) => {}
        }
    },
    sova: {
        id: 'sova',
        name: 'Sova',
        codename: 'Chasseur',
        role: 'Initiateur',
        description: 'Maître de la reconnaissance, capable de repérer les ennemis.',
        difficulty: 'Difficile',
        icon: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/sova_image.png',
        portrait: 'https://raw.githubusercontent.com/roboaleks/vast/main/agent_images/sova_image.png',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Drone Hibou',
                icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/grenade/displayicon.png',
                maxCooldown: 40,
                description: 'Révèle les ennemis dans une zone',
                execute: (ctx) => {
                    ctx.deployRevealer({ radius: 300, duration: 5 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Flèche de Choc',
                icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability1/displayicon.png',
                maxCooldown: 20,
                description: 'Tire une flèche explosive',
                execute: (ctx) => {
                    ctx.fireShockDart({ damage: 75, radius: 100 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Fureur du Chasseur',
                icon: 'https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ultimate/displayicon.png',
                maxPoints: 8,
                description: 'Tire 3 traits d\'énergie à travers les murs',
                execute: (ctx) => {
                    ctx.enableHunterFury({ shots: 3, damage: 80, wallPenetration: true });
                }
            }
        },
        passive: {
            name: 'Reconnaissance',
            description: 'Voit les traces des ennemis plus longtemps.',
            apply: (ctx) => {}
        }
    }
};

const AgentSystem = {
    state: {
        agents: AgentsRegistry,
        selectedAgentId: 'reyna',
        modifiers: {}
    },

    init() {
        this.state.selectedAgentId = this.getPersistedAgent() || 'reyna';
        this.applyAgentModifiers();
        this.renderAgentSelection();
        this.updateUISelection();
    },

    getAgentsList() {
        return Object.values(this.state.agents);
    },

    getSelectedAgent() {
        return this.state.agents[this.state.selectedAgentId];
    },

    selectAgent(agentId) {
        if (!this.state.agents[agentId]) return;
        this.state.selectedAgentId = agentId;
        this.persistAgent(agentId);
        this.applyAgentModifiers(true);
        this.updateUISelection();
        NotificationSystem?.show?.(
            'Agent sélectionné',
            `${this.state.agents[agentId].name} est prêt à l'action.`,
            'success',
            2500
        );
    },

    applyAgentModifiers(refreshPlayer = false) {
        const agent = this.getSelectedAgent();
        if (!agent) return;

        if (refreshPlayer && window.player) {
            this.resetModifiers();
        }

        const abilityFactory = this.createAbilityFactory();
        const abilities = {};
        ['ability1', 'ability2', 'ultimate'].forEach(key => {
            const abilityDef = agent.abilities[key];
            abilities[key] = abilityFactory(abilityDef);
        });

        if (window.player) {
            window.player.agentId = agent.id;
            window.player.abilities = abilities;
            if (agent.passive) {
                const ctx = this.createContext();
                agent.passive.apply(ctx);
            }
        }
        if (window.gameState) {
            window.gameState.selectedAgent = agent.id;
        }

        // Stocker l'ID de l'agent pour l'affichage des capacités
        window.currentAgentId = agent.id;
    },

    renderAgentSelection() {
        const container = document.getElementById('agent-selection-grid');
        if (!container) return;
        container.innerHTML = '';

        this.getAgentsList().forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            card.dataset.agentId = agent.id;
            card.innerHTML = `
                <div class="agent-portrait" style="background-image:url('${agent.portrait}')"></div>
                <div class="agent-info">
                    <div class="agent-header">
                        <h3>${agent.name}</h3>
                        <span class="agent-role">${agent.role}</span>
                    </div>
                    <p class="agent-description">${agent.description}</p>
                    <div class="agent-abilities">
                        ${Object.values(agent.abilities).map(ability => `
                            <div class="agent-ability" title="${ability.description}">
                                <img src="${ability.icon || DEFAULT_ABILITY_ICON}" alt="${ability.name}" />
                                <span>${ability.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn-secondary agent-select-btn" data-agent="${agent.id}">
                        <i class="fas fa-user-check"></i> Sélectionner
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.agent-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectAgent(e.target.closest('.agent-select-btn').dataset.agent);
            });
        });
    },

    createAbilityFactory() {
        return (abilityDef) => ({
            key: abilityDef.key,
            name: abilityDef.name,
            icon: abilityDef.icon,
            cooldown: 0,
            maxCooldown: abilityDef.maxCooldown || 0,
            ready: true,
            points: 0,
            maxPoints: abilityDef.maxPoints || 0,
            execute: () => {
                const ctx = this.createContext();
                abilityDef.execute(ctx);
            }
        });
    },

    createContext() {
        return {
            player: window.player,
            game: window.game,
            applyModifier: (key, value) => {
                if (window.player && key in window.player) {
                    window.player[key] = value;
                }
            },
            applySpeedBoost: (options) => {
                if (!window.player || !window.player.effects) return;
                window.player.effects.push({
                    type: 'speedBoost',
                    value: options.speedMultiplier,
                    duration: options.duration
                });
            },
            applyFireRateBoost: (options) => {
                if (!window.player || !window.weapon) return;
                const originalFireRate = window.player.weapon.fireRate;
                window.player.weapon.fireRate *= options.fireRateMultiplier;
                setTimeout(() => {
                    if (window.player && window.player.weapon) {
                        window.player.weapon.fireRate = originalFireRate;
                    }
                }, options.duration * 1000);
            },
            applyInvincibility: (options) => {
                if (!window.player) return;
                window.player.invincible = true;
                if (window.NotificationSystem) {
                    window.NotificationSystem.show('Rejeter', 'Invincible!', 'info', 2000);
                }
                setTimeout(() => {
                    if (window.player) {
                        window.player.invincible = false;
                    }
                }, options.duration * 1000);
            },
            throwSmoke: window.throwSmoke,
            throwFlashbang: window.throwFlashbang,
            deployRevealer: window.deployRevealer,
            spawnSlowField: window.spawnSlowField,
            deployBarrier: window.deployBarrier,
            throwFireball: window.throwFireball || function() {},
            deployFireWall: window.deployFireWall || function() {},
            placeRespawnMarker: window.placeRespawnMarker || function() {},
            teleportShort: window.teleportShort || function() {},
            teleportAnywhere: window.teleportAnywhere || function() {},
            deployStimBeacon: window.deployStimBeacon || function() {},
            orbitalStrike: window.orbitalStrike || function() {},
            fireShockDart: window.fireShockDart || function() {},
            enableHunterFury: window.enableHunterFury || function() {},
            enableKnives: window.enableKnives || function() {},
            applyDash: window.applyDash || function() {}
        };
    },

    resetModifiers() {
        this.state.modifiers = {};
    },

    updateUISelection() {
        const agent = this.getSelectedAgent();
        if (!agent) return;

        const displayEl = document.getElementById('current-agent-display');
        if (displayEl) {
            displayEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; justify-content: center;">
                    <img class="agent-icon-img" src="${agent.icon || DEFAULT_AGENT_ICON}" alt="${agent.name}">
                    <div style="text-align: left;">
                        <div style="font-size: 18px; font-weight: bold; color: #00d4ff;">${agent.name}</div>
                        <div style="font-size: 14px; color: rgba(255,255,255,0.7);">${agent.role}</div>
                    </div>
                </div>
            `;
        }

        document.querySelectorAll('.agent-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.agentId === agent.id);
        });
    },

    getPersistedAgent() {
        return localStorage.getItem('selectedAgent');
    },

    persistAgent(agentId) {
        localStorage.setItem('selectedAgent', agentId);
    }
};

if (typeof window !== 'undefined') {
    window.AgentSystem = AgentSystem;
    window.AgentsRegistry = AgentsRegistry;
}
