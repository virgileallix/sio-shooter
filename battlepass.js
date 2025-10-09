// ========================================
// BATTLEPASS.JS - SYSTÈME DE BATTLE PASS SAISONNIER
// ========================================

const BattlePassConfig = {
    seasonId: 'season-1',
    title: 'Frontière Néon',
    subtitle: 'Prenez l’avantage tactique et débloquez des récompenses exclusives.',
    totalLevels: 10,
    levels: [
        { level: 1, xpRequired: 0, rewards: { free: { type: 'currency', icon: 'coins', amount: 200, currencyType: 'coins' }, premium: { type: 'skin', icon: 'gun', name: 'Spectre | Néon Pulse', skinId: 'spectre_neon_pulse' } } },
        { level: 2, xpRequired: 900, rewards: { free: { type: 'spray', icon: 'spray-can', name: 'Tag Holo' }, premium: { type: 'currency', icon: 'gem', amount: 50, currencyType: 'vp' } } },
        { level: 3, xpRequired: 2100, rewards: { free: { type: 'boost', icon: 'chart-line', duration: '30 min', name: 'Boost XP' }, premium: { type: 'weapon-charm', icon: 'star', name: 'Pendentif Pixel' } } },
        { level: 4, xpRequired: 3600, rewards: { free: { type: 'currency', icon: 'coins', amount: 400, currencyType: 'coins' }, premium: { type: 'skin', icon: 'gun', name: 'Phantom | HoloCore', skinId: 'phantom_holocore' } } },
        { level: 5, xpRequired: 5400, rewards: { free: { type: 'spray', icon: 'spray-can', name: 'Spray Stratégie' }, premium: { type: 'title', icon: 'id-badge', name: 'Titre « Stratège »' } } },
        { level: 6, xpRequired: 7500, rewards: { free: { type: 'currency', icon: 'coins', amount: 600, currencyType: 'coins' }, premium: { type: 'skin', icon: 'knife', name: 'Couteau | Flux', skinId: 'knife_flux' } } },
        { level: 7, xpRequired: 9900, rewards: { free: { type: 'card', icon: 'image', name: 'Carte Joueur - Horizon' }, premium: { type: 'currency', icon: 'gem', amount: 120, currencyType: 'vp' } } },
        { level: 8, xpRequired: 12600, rewards: { free: { type: 'boost', icon: 'chart-line', duration: '1 h', name: 'Boost XP +' }, premium: { type: 'spray', icon: 'spray-can', name: 'Spray Premium' } } },
        { level: 9, xpRequired: 15600, rewards: { free: { type: 'currency', icon: 'coins', amount: 900, currencyType: 'coins' }, premium: { type: 'skin', icon: 'gun', name: 'Vandal | Fulgurance', skinId: 'vandal_fulgurance' } } },
        { level: 10, xpRequired: 19000, rewards: { free: { type: 'title', icon: 'medal', name: 'Titre « Pionnier »' }, premium: { type: 'skin', icon: 'crown', name: 'Operator | Nexus (Mythique)', skinId: 'operator_nexus_mythique' } } }
    ]
};

const BattlePassSystem = {
    state: {
        loading: false,
        initialized: false,
        xp: 0,
        level: 1,
        premium: false,
        premiumVerified: false,
        claimedRewards: {},
        lastSync: null
    },

    init() {
        if (this.state.initialized) return;
        this.state.initialized = true;
        this.loadFromLocal();
        this.render();
    },

    syncFromProfile(profileData) {
        if (!profileData) {
            this.state.xp = 0;
            this.state.level = 1;
            this.state.premium = false;
            this.state.premiumVerified = false;
            this.state.claimedRewards = {};
        } else {
            this.state.xp = profileData.xp || 0;
            this.state.level = profileData.level || this.computeLevelFromXP(this.state.xp);
            const premiumFromProfile = profileData.premium === true || profileData.premiumVerified === true;
            this.state.premium = premiumFromProfile;
            this.state.premiumVerified = profileData.premiumVerified === true || profileData.premium === true;
            this.state.claimedRewards = profileData.claimedRewards || {};
        }
        this.saveToLocal();
        this.render();
    },

    addBattlePassXP(amount, source = 'match') {
        if (!amount || amount <= 0) return;
        this.state.xp += amount;
        const previousLevel = this.state.level;
        this.state.level = this.computeLevelFromXP(this.state.xp);
        this.saveProgress();
        this.renderProgressBar();

        if (this.state.level > previousLevel) {
            NotificationSystem?.show?.(
                'Battle Pass',
                `Niveau ${this.state.level} atteint ! De nouvelles récompenses sont disponibles.`,
                'achievement',
                4000
            );
        } else {
            NotificationSystem?.show?.(
                'Battle Pass',
                `+${amount} XP ${source === 'match' ? 'de match' : ''}`,
                'info',
                2500
            );
        }
    },

    computeLevelFromXP(xp) {
        let currentLevel = 1;
        for (const entry of BattlePassConfig.levels) {
            if (xp >= entry.xpRequired) {
                currentLevel = entry.level;
            } else {
                break;
            }
        }
        return Math.min(currentLevel, BattlePassConfig.totalLevels);
    },

    getLevelProgress(level) {
        const currentLevelEntry = BattlePassConfig.levels.find(l => l.level === level);
        const nextLevelEntry = BattlePassConfig.levels.find(l => l.level === level + 1);
        if (!currentLevelEntry) return 0;
        const currentXP = this.state.xp - currentLevelEntry.xpRequired;
        const neededXP = nextLevelEntry ? nextLevelEntry.xpRequired - currentLevelEntry.xpRequired : 1;
        return Math.max(0, Math.min(1, currentXP / neededXP));
    },

    isRewardClaimed(level, track) {
        const claimed = this.state.claimedRewards[track];
        return claimed ? claimed.includes(level) : false;
    },

    canClaim(level, track) {
        const levelEntry = BattlePassConfig.levels.find(l => l.level === level);
        if (!levelEntry) return false;
        // Peut claim si le niveau actuel est >= au niveau de la récompense
        if (this.state.level < level) return false;
        if (track === 'premium' && !this.state.premium) return false;
        return !this.isRewardClaimed(level, track);
    },

    claimReward(level, track) {
        if (!this.canClaim(level, track)) return;
        const levelEntry = BattlePassConfig.levels.find(l => l.level === level);
        if (!levelEntry) return;

        const result = this.grantReward(levelEntry, track);
        if (!result?.success) {
            NotificationSystem?.show?.(
                'Récompense indisponible',
                'Impossible de récupérer la récompense pour le moment. Veuillez réessayer plus tard.',
                'error',
                3500
            );
            return;
        }

        if (!this.state.claimedRewards[track]) {
            this.state.claimedRewards[track] = [];
        }
        this.state.claimedRewards[track].push(level);
        this.saveProgress();
        this.renderTracks();

        const baseMessage = `Vous avez récupéré la récompense ${track === 'premium' ? 'Premium' : 'Gratuite'} du niveau ${level}.`;
        const message = result.alreadyOwned ? `${baseMessage} (déjà possédée)` : baseMessage;

        NotificationSystem?.show?.(
            'Récompense obtenue',
            message,
            'success',
            3500
        );
    },

    grantReward(levelEntry, track) {
        if (!levelEntry?.rewards?.[track]) {
            return { success: false };
        }

        const reward = levelEntry.rewards[track];
        try {
            switch (reward.type) {
                case 'currency':
                    return this.grantCurrencyReward(reward);
                case 'skin':
                    return this.grantSkinReward(reward);
                default:
                    return { success: true };
            }
        } catch (error) {
            return { success: false };
        }
    },

    grantCurrencyReward(reward) {
        const amount = Number(reward.amount) || 0;
        if (!amount) {
            return { success: false };
        }

        const currencyType = reward.currencyType === 'vp' ? 'vp' : 'coins';

        if (window.StoreSystem?.ensureInventoryStructure) {
            window.StoreSystem.ensureInventoryStructure();
        }

        const inventory = window.playerInventory;
        if (!inventory) {
            return { success: false };
        }

        if (!inventory.currency) {
            inventory.currency = { coins: 0, vp: 0 };
        }
        if (typeof inventory.currency[currencyType] !== 'number') {
            inventory.currency[currencyType] = 0;
        }

        inventory.currency[currencyType] += amount;

        window.StoreSystem?.savePlayerData?.();
        window.StoreSystem?.updateCurrencyDisplay?.();

        return { success: true };
    },

    grantSkinReward(reward) {
        const skinId = reward.skinId;
        if (!skinId) {
            return { success: false };
        }

        if (window.StoreSystem?.ensureInventoryStructure) {
            window.StoreSystem.ensureInventoryStructure();
        }

        const inventory = window.playerInventory;
        if (!inventory) {
            return { success: false };
        }

        if (!Array.isArray(inventory.skins)) {
            inventory.skins = [];
        }

        const alreadyOwned = inventory.skins.some(skin => skin.id === skinId);
        if (!alreadyOwned) {
            inventory.skins.push({
                id: skinId,
                acquiredAt: Date.now(),
                equipped: false
            });

            window.StoreSystem?.savePlayerData?.();
            window.StoreSystem?.loadInventorySkins?.();
            window.StoreSystem?.updateInventoryStats?.();
            window.StoreSystem?.loadStoreSkins?.();
        }

        return { success: true, alreadyOwned };
    },

    render() {
        this.renderSummary();
        this.renderProgressBar();
        this.renderTracks();
    },

    renderSummary() {
        const summaryCard = document.getElementById('battlepass-summary');
        if (!summaryCard) return;

        const nextLevelEntry = BattlePassConfig.levels.find(l => l.level === this.state.level + 1);
        const xpToNext = nextLevelEntry ? Math.max(0, nextLevelEntry.xpRequired - this.state.xp) : 0;

        summaryCard.innerHTML = `
            <div class="bp-header">
                <div>
                    <h3>${BattlePassConfig.title}</h3>
                    <p>${BattlePassConfig.subtitle}</p>
                </div>
                <div class="bp-season-tag">Saison 1</div>
            </div>
            <div class="bp-level-info">
                <div class="bp-level-current">
                    <span>Niveau actuel</span>
                    <strong>${this.state.level}</strong>
                </div>
                <div class="bp-level-next">
                    <span>XP total</span>
                    <strong>${this.state.xp}</strong>
                </div>
                <div class="bp-level-next">
                    <span>Étapes restantes</span>
                    <strong>${nextLevelEntry ? `${xpToNext} XP` : 'Max'}</strong>
                </div>
            </div>
            <div class="bp-premium-toggle ${this.state.premium ? 'active' : ''}">
                <span class="status-label">${this.state.premium ? 'Premium actif' : 'Premium verrouillé'}</span>
                <p class="bp-premium-note">${this.state.premium ? 'Merci pour votre soutien !' : 'Disponible via la boutique premium officielle.'}</p>
            </div>
        `;
    },

    renderProgressBar() {
        const progressBar = document.getElementById('battlepass-progress');
        if (!progressBar) return;

        const currentLevelEntry = BattlePassConfig.levels.find(l => l.level === this.state.level) || BattlePassConfig.levels[0];
        const nextLevelEntry = BattlePassConfig.levels.find(l => l.level === this.state.level + 1);
        const progress = this.getLevelProgress(this.state.level);

        progressBar.innerHTML = `
            <div class="bp-progress-track">
                <div class="bp-progress-fill" style="width: ${Math.round(progress * 100)}%"></div>
            </div>
            <div class="bp-progress-text">
                <span>Niveau ${this.state.level}</span>
                <span>${nextLevelEntry ? `${Math.max(0, nextLevelEntry.xpRequired - this.state.xp)} XP avant le niveau ${this.state.level + 1}` : 'Niveau maximum atteint'}</span>
            </div>
        `;
    },

    renderTracks() {
        const freeTrack = document.getElementById('battlepass-free-track');
        const premiumTrack = document.getElementById('battlepass-premium-track');
        if (!freeTrack || !premiumTrack) return;

        freeTrack.innerHTML = '';
        premiumTrack.innerHTML = '';

        BattlePassConfig.levels.forEach(entry => {
            freeTrack.appendChild(this.createRewardCard(entry, 'free'));
            premiumTrack.appendChild(this.createRewardCard(entry, 'premium'));
        });
    },

    createRewardCard(levelEntry, track) {
        const reward = levelEntry.rewards[track];
        const unlocked = this.state.xp >= levelEntry.xpRequired;
        const claimed = this.isRewardClaimed(levelEntry.level, track);
        const claimable = this.canClaim(levelEntry.level, track);
        const card = document.createElement('div');
        card.className = `bp-reward-card ${unlocked ? 'unlocked' : 'locked'} ${claimed ? 'claimed' : ''}`;

        card.innerHTML = `
            <div class="bp-reward-header">
                <span class="bp-level">Niv. ${levelEntry.level}</span>
                <span class="bp-track ${track}">${track === 'premium' ? 'Premium' : 'Gratuit'}</span>
            </div>
            <div class="bp-reward-body">
                <div class="bp-reward-icon">
                    <i class="fas fa-${reward.icon || 'gift'}"></i>
                </div>
                <div class="bp-reward-info">
                    <strong>${this.getRewardTitle(reward)}</strong>
                    <p>${this.getRewardDescription(reward)}</p>
                </div>
            </div>
            <button class="btn-claim ${claimable ? '' : 'disabled'}" data-level="${levelEntry.level}" data-track="${track}">
                ${claimed ? '<i class="fas fa-check"></i> Réclamé' : '<i class="fas fa-gift"></i> Récupérer'}
            </button>
        `;

        const claimBtn = card.querySelector('.btn-claim');
        if (claimBtn && claimable) {
            claimBtn.addEventListener('click', () => this.claimReward(levelEntry.level, track));
        }

        return card;
    },

    getRewardTitle(reward) {
        switch (reward.type) {
            case 'currency':
                {
                    const label = reward.currencyType === 'vp' ? 'SIO Gems' : 'SIO Coins';
                    return `${reward.amount} ${label}`;
                }
            case 'skin':
                return reward.name;
            case 'boost':
                return reward.name || 'Boost';
            case 'weapon-charm':
            case 'spray':
            case 'title':
            case 'card':
                return reward.name;
            default:
                return 'Récompense';
        }
    },

    getRewardDescription(reward) {
        switch (reward.type) {
            case 'currency':
                return reward.currencyType === 'vp'
                    ? 'Monnaie premium à dépenser dans la boutique.'
                    : 'Monnaie en jeu à dépenser dans la boutique.';
            case 'skin':
                return 'Apparence exclusive pour vos armes.';
            case 'boost':
                return `Bonus d’expérience pendant ${reward.duration || 'une durée limitée'}.`;
            case 'weapon-charm':
                return 'Porte-bonheur cosmétique à attacher à vos armes.';
            case 'spray':
                return 'Spray mural pour personnaliser la carte.';
            case 'title':
                return 'Titre à afficher dans votre profil.';
            case 'card':
                return 'Carte de joueur à collectionner.';
            default:
                return 'Objet spécial du Battle Pass.';
        }
    },

    saveProgress() {
        this.state.level = this.computeLevelFromXP(this.state.xp);
        this.saveToLocal();
        this.saveToFirebase();
    },

    saveToLocal() {
        try {
            localStorage.setItem('sio_shooter_battlepass', JSON.stringify({
                xp: this.state.xp,
                level: this.state.level,
                premium: this.state.premium,
                premiumVerified: this.state.premiumVerified,
                claimedRewards: this.state.claimedRewards
            }));
        } catch (error) {
            // Impossible de sauvegarder le Battle Pass en local
        }
    },

    loadFromLocal() {
        try {
            const data = localStorage.getItem('sio_shooter_battlepass');
            if (!data) return;
            const parsed = JSON.parse(data);
            this.state.xp = parsed.xp || 0;
            this.state.level = parsed.level || this.computeLevelFromXP(this.state.xp);
            this.state.premium = false;
            this.state.premiumVerified = false;
            if (parsed.premium && parsed.premiumVerified) {
                this.state.premium = true;
                this.state.premiumVerified = true;
            }
            this.state.claimedRewards = parsed.claimedRewards || {};
        } catch (error) {
            // Impossible de charger le Battle Pass local
        }
    },

    async saveToFirebase() {
        if (!window.currentUser || !window.database) return;
        try {
            await window.database.ref(`users/${window.currentUser.uid}/battlepass`).set({
                seasonId: BattlePassConfig.seasonId,
                xp: this.state.xp,
                level: this.state.level,
                premium: this.state.premium,
                premiumVerified: this.state.premiumVerified,
                claimedRewards: this.state.claimedRewards
            });
        } catch (error) {
            // Impossible de sauvegarder le Battle Pass sur Firebase
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            BattlePassSystem.init();
        } catch (error) {
            // Erreur initialisation BattlePassSystem
        }
    }, 1300);
});

window.BattlePassSystem = BattlePassSystem;
window.BattlePassConfig = BattlePassConfig;
