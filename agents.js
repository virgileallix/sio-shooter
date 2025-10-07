// ========================================
// AGENTS.JS - SYSTÈME D'AGENTS ET CAPACITÉS
// ========================================

const AgentsRegistry = {
    vanguard: {
        id: 'vanguard',
        name: 'Vanguard',
        codename: 'Initié',
        role: 'Initiateur',
        description: 'Déploie des rideaux de fumée et ouvre la voie à son équipe.',
        difficulty: 'Facile',
        portrait: 'https://images.unsplash.com/photo-1589621316388-ff1d6f1ee0f1?auto=format&fit=crop&w=300&q=80',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Rideau Spectral',
                icon: 'cloud',
                maxCooldown: 18,
                description: 'Projette un large nuage de fumée qui bloque la vision ennemie.',
                execute: (ctx) => {
                    ctx.throwSmoke({ radius: 180, duration: 18, color: 'rgba(105, 195, 255, 0.75)' });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Balise Photon',
                icon: 'lightbulb',
                maxCooldown: 24,
                description: 'Déploie une balise qui révèle brièvement les ennemis proches.',
                execute: (ctx) => {
                    ctx.deployRevealer({ radius: 220, duration: 7 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Vision Totale',
                icon: 'eye',
                maxPoints: 7,
                description: 'Révèle tous les adversaires pendant quelques secondes.',
                execute: (ctx) => {
                    ctx.revealEnemies({ duration: 6 });
                }
            }
        },
        passive: {
            name: 'Préparation',
            description: 'Tempo de rechargement réduit de 10%.',
            apply: (ctx) => ctx.applyModifier('reloadSpeed', 0.9)
        }
    },
    tempest: {
        id: 'tempest',
        name: 'Tempest',
        codename: 'Contrôleur',
        role: 'Controleur',
        description: 'Manipule le climat pour ralentir ou accélérer le rythme du combat.',
        difficulty: 'Moyen',
        portrait: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=80',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Bourrasque',
                icon: 'wind',
                maxCooldown: 20,
                description: 'Propulse le joueur vers l’avant avec un bonus de vitesse temporaire.',
                execute: (ctx) => {
                    ctx.applySpeedBoost({ speedMultiplier: 1.65, duration: 2.5 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Gel météorologique',
                icon: 'snowflake',
                maxCooldown: 26,
                description: 'Crée un champ de ralentissement qui réduit la vitesse ennemie.',
                execute: (ctx) => {
                    ctx.spawnSlowField({ radius: 210, duration: 8, slowMultiplier: 0.55 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Orage Ionique',
                icon: 'bolt',
                maxPoints: 6,
                description: 'Les tirs infligent des dégâts amplifiés et percent les obstacles pendant quelques secondes.',
                execute: (ctx) => {
                    ctx.enableOvercharge({ damageMultiplier: 1.4, penetration: 2, duration: 8 });
                }
            }
        },
        passive: {
            name: 'Dynamique',
            description: 'La vitesse de déplacement de base est augmentée de 5%.',
            apply: (ctx) => ctx.applyModifier('baseSpeed', 1.05)
        }
    },
    bastion: {
        id: 'bastion',
        name: 'Bastion',
        codename: 'Gardien',
        role: 'Sentinelle',
        description: 'Fortifie ses positions et protège ses alliés.',
        difficulty: 'Facile',
        portrait: 'https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=300&q=80',
        abilities: {
            ability1: {
                key: 'ability1',
                name: 'Mur cinétique',
                icon: 'shield-alt',
                maxCooldown: 22,
                description: 'Déploie un mur temporaire qui bloque les tirs.',
                execute: (ctx) => {
                    ctx.deployBarrier({ width: 220, height: 40, duration: 9, health: 260 });
                }
            },
            ability2: {
                key: 'ability2',
                name: 'Renfort',
                icon: 'plus-square',
                maxCooldown: 28,
                description: 'Octroie un bonus d’armure régénérant au fil du temps.',
                execute: (ctx) => {
                    ctx.applyArmorRegen({ totalArmor: 35, duration: 6 });
                }
            },
            ultimate: {
                key: 'ultimate',
                name: 'Forteresse',
                icon: 'chess-rook',
                maxPoints: 8,
                description: 'Place une tourelle automatisée qui couvre une zone.',
                execute: (ctx) => {
                    ctx.deploySentry({ duration: 15, damage: 18, fireRate: 0.4, range: 380 });
                }
            }
        },
        passive: {
            name: 'Carapace',
            description: 'Augmente la réserve d’armure maximum de 20.',
            apply: (ctx) => ctx.applyModifier('maxArmor', player.maxArmor + 20)
        }
    }
};

const AgentSystem = {
    state: {
        agents: AgentsRegistry,
        selectedAgentId: 'vanguard',
        modifiers: {}
    },

    init() {
        this.state.selectedAgentId = this.getPersistedAgent() || 'vanguard';
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
            `${this.state.agents[agentId].name} est prêt à l’action.`,
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
                                <i class="fas fa-${ability.icon}"></i>
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

        container.querySelectorAll('.agent-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const agentId = btn.dataset.agent;
                this.selectAgent(agentId);
            });
        });
    },

    updateUISelection() {
        const activeId = this.state.selectedAgentId;
        document.querySelectorAll('.agent-card').forEach(card => {
            if (card.dataset.agentId === activeId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });

        const display = document.getElementById('selected-agent-display');
        if (display) {
            const agent = this.getSelectedAgent();
            display.innerHTML = `
                <div class="selected-agent-card">
                    <div class="agent-portrait small" style="background-image:url('${agent.portrait}')"></div>
                    <div>
                        <strong>${agent.name}</strong>
                        <p>${agent.role} • ${agent.description}</p>
                    </div>
                </div>
            `;
        }
    },

    createAbilityFactory() {
        const context = this.createContext();
        return (abilityDef) => ({
            key: abilityDef.key,
            name: abilityDef.name,
            icon: abilityDef.icon,
            description: abilityDef.description,
            cooldown: 0,
            maxCooldown: abilityDef.maxCooldown ?? 0,
            ready: abilityDef.key === 'ultimate' ? false : true,
            points: 0,
            maxPoints: abilityDef.maxPoints ?? 0,
            execute: () => abilityDef.execute(context)
        });
    },

    createContext() {
        return {
            throwSmoke: (options) => window.throwSmokeGrenade?.(options),
            deployRevealer: (options) => window.spawnRevealBeacon?.(options),
            revealEnemies: (options) => window.activateRevealPulse?.(options),
            applySpeedBoost: (options) => window.applySpeedBoost?.(options),
            spawnSlowField: (options) => window.spawnSlowField?.(options),
            enableOvercharge: (options) => window.enableOverchargeMode?.(options),
            deployBarrier: (options) => window.deployTemporaryBarrier?.(options),
            applyArmorRegen: (options) => window.applyArmorRegenEffect?.(options),
            deploySentry: (options) => window.deploySentryTurret?.(options),
            applyModifier: (modifier, value) => this.applyModifier(modifier, value)
        };
    },

    applyModifier(modifier, value) {
        this.state.modifiers[modifier] = value;
        if (!window.player) return;

        switch (modifier) {
            case 'reloadSpeed':
                window.player.reloadMultiplier = value;
                break;
            case 'baseSpeed':
                window.player.baseSpeedMultiplier = value;
                break;
            case 'maxArmor':
                window.player.maxArmor = value;
                break;
        }
    },

    resetModifiers() {
        this.state.modifiers = {};
        if (!window.player) return;
        window.player.reloadMultiplier = 1;
        window.player.baseSpeedMultiplier = 1;
        window.player.maxArmor = window.player.baseMaxArmor || window.player.maxArmor;
    },

    persistAgent(agentId) {
        try {
            if (window.currentUser && window.database) {
                window.database.ref(`users/${window.currentUser.uid}/profile/selectedAgent`).set(agentId);
            }
        } catch (err) {
            console.warn('Impossible de sauvegarder l’agent sur Firebase:', err);
        }

        localStorage.setItem('sio_shooter_selected_agent', agentId);
    },

    getPersistedAgent() {
        try {
            if (window.currentUser && window.database) {
                // On pourrait charger depuis Firebase, mais pour l’instant on utilise localStorage comme fallback rapide
            }
        } catch {
            // ignore
        }
        return localStorage.getItem('sio_shooter_selected_agent');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            AgentSystem.init();
        } catch (error) {
            console.error('Erreur initialisation AgentSystem:', error);
        }
    }, 1200);
});

window.AgentSystem = AgentSystem;
window.AgentsRegistry = AgentsRegistry;
