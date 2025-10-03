// ========================================
// STORE.JS - BOUTIQUE ET INVENTAIRE CORRIGÉS
// ========================================

// Système de rarités
const RARITIES = {
    consumer: {
        name: 'Consumer',
        color: '#b0c3d9',
        gradient: 'linear-gradient(135deg, #b0c3d9, #899eb5)',
        probability: 0.7992
    },
    industrial: {
        name: 'Industrial',
        color: '#5e98d9',
        gradient: 'linear-gradient(135deg, #5e98d9, #4a7db5)',
        probability: 0.1598
    },
    milspec: {
        name: 'Mil-Spec',
        color: '#4b69ff',
        gradient: 'linear-gradient(135deg, #4b69ff, #3a54cc)',
        probability: 0.0320
    },
    restricted: {
        name: 'Restricted',
        color: '#8847ff',
        gradient: 'linear-gradient(135deg, #8847ff, #6d39cc)',
        probability: 0.0064
    },
    classified: {
        name: 'Classified',
        color: '#d32ce6',
        gradient: 'linear-gradient(135deg, #d32ce6, #a923b8)',
        probability: 0.0013
    },
    covert: {
        name: 'Covert',
        color: '#eb4b4b',
        gradient: 'linear-gradient(135deg, #eb4b4b, #bc3c3c)',
        probability: 0.0003
    },
    knife: {
        name: 'Knife',
        color: '#ffd700',
        gradient: 'linear-gradient(135deg, #ffd700, #ccac00)',
        probability: 0.0001
    }
};

// Base de données des skins d'armes
const WEAPON_SKINS = {
    rifles: [
        {
            id: 'ak47_redline',
            weapon: 'AK-47',
            name: 'Redline',
            rarity: 'classified',
            pattern: 'geometric',
            price: 2500,
            description: 'Lignes rouges élégantes sur fond noir.'
        },
        {
            id: 'ak47_vulcan',
            weapon: 'AK-47',
            name: 'Vulcan',
            rarity: 'covert',
            pattern: 'tech',
            price: 8000,
            description: 'Design futuriste high-tech.'
        },
        {
            id: 'ak47_case_hardened',
            weapon: 'AK-47',
            name: 'Case Hardened',
            rarity: 'milspec',
            pattern: 'metal',
            price: 800,
            description: 'Finition métallique bleue unique.'
        },
        {
            id: 'ak47_jungle_spray',
            weapon: 'AK-47',
            name: 'Jungle Spray',
            rarity: 'consumer',
            pattern: 'spray',
            price: 25,
            description: 'Camouflage jungle classique.'
        },
        {
            id: 'm4a4_asiimov',
            weapon: 'M4A4',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 9000,
            description: 'Design blanc et orange iconique.'
        },
        {
            id: 'm4a4_dragon_king',
            weapon: 'M4A4',
            name: 'Dragon King',
            rarity: 'classified',
            pattern: 'dragon',
            price: 3000,
            description: 'Dragon gravé avec détails dorés.'
        },
        {
            id: 'm4a4_howl',
            weapon: 'M4A4',
            name: 'Howl',
            rarity: 'covert',
            pattern: 'creature',
            price: 15000,
            description: 'Loup hurlant rare et recherché.'
        },
        {
            id: 'm4a4_tornado',
            weapon: 'M4A4',
            name: 'Tornado',
            rarity: 'industrial',
            pattern: 'spray',
            price: 150,
            description: 'Motif tourbillon gris.'
        }
    ],
    pistols: [
        {
            id: 'deagle_blaze',
            weapon: 'Desert Eagle',
            name: 'Blaze',
            rarity: 'restricted',
            pattern: 'flame',
            price: 1200,
            description: 'Flammes orange vif.'
        },
        {
            id: 'glock_fade',
            weapon: 'Glock-18',
            name: 'Fade',
            rarity: 'restricted',
            pattern: 'fade',
            price: 1100,
            description: 'Dégradé arc-en-ciel vibrant.'
        },
        {
            id: 'usp_orion',
            weapon: 'USP-S',
            name: 'Orion',
            rarity: 'milspec',
            pattern: 'geometric',
            price: 600,
            description: 'Motif géométrique bleu et blanc.'
        },
        {
            id: 'p250_sand_dune',
            weapon: 'P250',
            name: 'Sand Dune',
            rarity: 'consumer',
            pattern: 'solid',
            price: 10,
            description: 'Finition sable basique.'
        }
    ],
    smgs: [
        {
            id: 'p90_asiimov',
            weapon: 'P90',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 7500,
            description: 'Version P90 du célèbre Asiimov.'
        },
        {
            id: 'mp9_bulldozer',
            weapon: 'MP9',
            name: 'Bulldozer',
            rarity: 'milspec',
            pattern: 'industrial',
            price: 400,
            description: 'Style construction jaune et noir.'
        }
    ],
    snipers: [
        {
            id: 'awp_dragon_lore',
            weapon: 'AWP',
            name: 'Dragon Lore',
            rarity: 'covert',
            pattern: 'dragon',
            price: 20000,
            description: 'Le skin le plus rare et recherché.'
        },
        {
            id: 'awp_asiimov',
            weapon: 'AWP',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 12000,
            description: 'Design Asiimov emblématique.'
        },
        {
            id: 'ssg08_blood_in_water',
            weapon: 'Scout SSG 08',
            name: 'Blood in the Water',
            rarity: 'classified',
            pattern: 'animal',
            price: 2800,
            description: 'Requin sanglant stylisé.'
        },
        {
            id: 'awp_safari_mesh',
            weapon: 'AWP',
            name: 'Safari Mesh',
            rarity: 'industrial',
            pattern: 'camo',
            price: 80,
            description: 'Camouflage maillé simple.'
        }
    ],
    knives: [
        {
            id: 'karambit_fade',
            weapon: 'Karambit',
            name: 'Fade',
            rarity: 'knife',
            pattern: 'fade',
            price: 50000,
            description: 'Karambit avec un dégradé parfait.'
        },
        {
            id: 'butterfly_crimson_web',
            weapon: 'Butterfly Knife',
            name: 'Crimson Web',
            rarity: 'knife',
            pattern: 'spider_web',
            price: 45000,
            description: 'Toile d\'araignée rouge sur manche noir.'
        }
    ]
};

// Définition des cases
const WEAPON_CASES = [
    {
        id: 'chroma_case',
        name: 'Chroma Case',
        price: 250,
        description: 'Contient des skins colorés avec finitions vibrantes',
        contents: [
            'ak47_case_hardened',
            'm4a4_dragon_king',
            'glock_fade',
            'usp_orion',
            'mp9_bulldozer',
            'ssg08_blood_in_water',
            'deagle_blaze',
            'ak47_jungle_spray',
            'm4a4_tornado',
            'p250_sand_dune'
        ]
    },
    {
        id: 'spectrum_case',
        name: 'Spectrum Case',
        price: 300,
        description: 'Collection de skins avec un large spectre de couleurs',
        contents: [
            'ak47_redline',
            'm4a4_asiimov',
            'p90_asiimov',
            'awp_asiimov',
            'awp_safari_mesh',
            'karambit_fade'
        ]
    },
    {
        id: 'phoenix_case',
        name: 'Phoenix Case',
        price: 200,
        description: 'Skins légendaires du monde de Phoenix',
        contents: [
            'ak47_vulcan',
            'm4a4_howl',
            'awp_dragon_lore',
            'butterfly_crimson_web'
        ]
    }
];

// État global de l'inventaire
let playerInventory = {
    skins: [],
    cases: [],
    equippedSkins: {
        rifles: {},
        pistols: {},
        smgs: {},
        snipers: {},
        knives: {}
    },
    currency: {
        coins: 1000,
        vp: 0
    }
};

// Système de boutique
const StoreSystem = {
    currentRevealedSkin: null,
    currentOpeningAnimation: null,

    init() {
        console.log('🛒 Initialisation du système de boutique...');
        this.loadPlayerData();
        this.setupEventListeners();
        console.log('✅ Store system initialized');
    },

    async loadPlayerData() {
        try {
            // Charger depuis Firebase si connecté
            if (window.currentUser && window.database) {
                const userRef = window.database.ref(`users/${window.currentUser.uid}/inventory`);
                const snapshot = await userRef.once('value');
                const firebaseData = snapshot.val();
                
                if (firebaseData) {
                    playerInventory = { ...playerInventory, ...firebaseData };
                    this.updateCurrencyDisplay();
                    console.log('📦 Données chargées depuis Firebase');
                    return;
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement Firebase:', error);
        }
        
        // Fallback vers localStorage
        try {
            const savedData = localStorage.getItem('sio_shooter_inventory');
            if (savedData) {
                playerInventory = { ...playerInventory, ...JSON.parse(savedData) };
                console.log('📦 Données chargées depuis localStorage');
            } else {
                // Skins de départ
                playerInventory.skins = [
                    { id: 'ak47_jungle_spray', acquiredAt: Date.now(), equipped: false },
                    { id: 'p250_sand_dune', acquiredAt: Date.now(), equipped: false }
                ];
                this.savePlayerData();
            }
        } catch (error) {
            console.error('❌ Erreur chargement localStorage:', error);
        }

        this.updateCurrencyDisplay();
    },

    savePlayerData() {
        try {
            // Sauvegarder dans localStorage
            localStorage.setItem('sio_shooter_inventory', JSON.stringify(playerInventory));
            
            // Sauvegarder dans Firebase si connecté
            if (window.currentUser && window.database) {
                window.database.ref(`users/${window.currentUser.uid}/inventory`).set(playerInventory)
                    .catch(err => console.error('Erreur sauvegarde Firebase:', err));
            }
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
        }
    },

    updateCurrencyDisplay() {
        const elementsToUpdate = [
            { id: 'user-coins', value: playerInventory.currency.coins },
            { id: 'header-coins', value: playerInventory.currency.coins },
            { id: 'user-vp', value: playerInventory.currency.vp },
            { id: 'header-vp', value: playerInventory.currency.vp }
        ];

        elementsToUpdate.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.value;
            }
        });
    },

    setupEventListeners() {
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (window.showMenuSection) window.showMenuSection('store');
            }
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                if (window.showMenuSection) window.showMenuSection('inventory');
            }
        });
    },

    checkDailyReward() {
        const lastReward = localStorage.getItem('sio_shooter_last_daily_reward');
        const today = new Date().toDateString();

        if (lastReward !== today) {
            const reward = 100 + Math.floor(Math.random() * 50);
            playerInventory.currency.coins += reward;
            
            localStorage.setItem('sio_shooter_last_daily_reward', today);
            this.savePlayerData();
            this.updateCurrencyDisplay();

            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Récompense quotidienne',
                    `Vous avez reçu ${reward} SIO Coins!`,
                    'success'
                );
            }
        }
    },

    // ========================================
    // GESTION DES CASES
    // ========================================

    loadCases() {
        const casesGrid = document.getElementById('cases-grid');
        if (!casesGrid) return;

        casesGrid.innerHTML = '';

        WEAPON_CASES.forEach(weaponCase => {
            const caseCard = document.createElement('div');
            caseCard.className = 'case-card';
            caseCard.innerHTML = `
                <div class="case-image">
                    <div class="case-icon">📦</div>
                </div>
                <div class="case-info">
                    <h3>${weaponCase.name}</h3>
                    <p>${weaponCase.description}</p>
                    <div class="case-price">
                        <i class="fas fa-coins"></i> ${weaponCase.price}
                    </div>
                </div>
                <div class="case-actions">
                    <button class="btn-primary" onclick="StoreSystem.purchaseCase('${weaponCase.id}')">
                        Acheter
                    </button>
                    <button class="btn-secondary" onclick="StoreSystem.previewCase('${weaponCase.id}')">
                        Aperçu
                    </button>
                </div>
            `;
            casesGrid.appendChild(caseCard);
        });
    },

    purchaseCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        if (playerInventory.currency.coins < weaponCase.price) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Fonds insuffisants',
                    'Vous n\'avez pas assez de SIO Coins.',
                    'error'
                );
            }
            return;
        }

        // Déduire les pièces
        playerInventory.currency.coins -= weaponCase.price;

        // Ajouter la case à l'inventaire
        playerInventory.cases.push({
            id: caseId,
            acquiredAt: Date.now()
        });

        this.updateCurrencyDisplay();
        this.savePlayerData();

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Case achetée',
                `${weaponCase.name} ajoutée à votre inventaire!`,
                'success',
                5000,
                [
                    {
                        text: 'Ouvrir',
                        primary: true,
                        callback: `StoreSystem.openCase('${caseId}')`
                    }
                ]
            );
        }
    },

    openCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) {
            console.error('Case non trouvée:', caseId);
            return;
        }

        // Vérifier que la case existe dans l'inventaire
        const caseIndex = playerInventory.cases.findIndex(c => c.id === caseId);
        if (caseIndex === -1) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Erreur',
                    'Case non trouvée dans l\'inventaire.',
                    'error'
                );
            }
            return;
        }

        // Retirer la case de l'inventaire
        playerInventory.cases.splice(caseIndex, 1);
        this.savePlayerData();

        // Afficher la modal d'ouverture
        this.showCaseOpeningModal(weaponCase);
    },

    showCaseOpeningModal(weaponCase) {
        const modal = document.getElementById('case-opening-modal');
        const title = document.getElementById('case-opening-title');
        const caseImage = document.getElementById('case-image');
        const skinReveal = document.getElementById('skin-reveal');
        const openingActions = document.getElementById('opening-actions');
        const progressBar = document.getElementById('opening-progress');

        if (!modal || !title || !caseImage) {
            console.error('Éléments de modal manquants');
            return;
        }

        // Réinitialiser
        title.textContent = `Ouverture: ${weaponCase.name}`;
        caseImage.innerHTML = '<div class="case-icon">📦</div>';
        if (skinReveal) skinReveal.classList.add('hidden');
        if (openingActions) openingActions.classList.add('hidden');
        if (progressBar) progressBar.style.width = '0%';

        modal.classList.remove('hidden');

        // Démarrer l'animation après un délai
        setTimeout(() => {
            this.startCaseOpeningAnimation(weaponCase);
        }, 1000);
    },

    startCaseOpeningAnimation(weaponCase) {
        const progressBar = document.getElementById('opening-progress');
        if (!progressBar) return;

        let progress = 0;
        
        // Nettoyer l'ancienne animation
        if (this.currentOpeningAnimation) {
            clearInterval(this.currentOpeningAnimation);
        }

        this.currentOpeningAnimation = setInterval(() => {
            progress += 2;
            progressBar.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(this.currentOpeningAnimation);
                this.currentOpeningAnimation = null;
                
                setTimeout(() => {
                    this.revealSkin(weaponCase);
                }, 500);
            }
        }, 30);
    },

    revealSkin(weaponCase) {
        // Sélectionner un skin aléatoire basé sur les probabilités
        const wonSkin = this.selectRandomSkinFromCase(weaponCase);
        if (!wonSkin) {
            console.error('Impossible de sélectionner un skin');
            this.closeCaseOpeningModal();
            return;
        }

        // Ajouter le skin à l'inventaire
        playerInventory.skins.push({
            id: wonSkin.id,
            acquiredAt: Date.now(),
            equipped: false
        });

        this.savePlayerData();

        // Afficher le skin révélé
        const skinReveal = document.getElementById('skin-reveal');
        const skinImage = document.getElementById('revealed-skin-image');
        const skinName = document.getElementById('revealed-skin-name');
        const skinWeapon = document.getElementById('revealed-skin-weapon');
        const skinRarity = document.getElementById('revealed-skin-rarity');
        const openingActions = document.getElementById('opening-actions');

        if (!skinReveal) return;

        skinImage.innerHTML = this.getWeaponIcon(wonSkin.weapon);
        skinName.textContent = wonSkin.name;
        skinWeapon.textContent = wonSkin.weapon;
        skinRarity.textContent = RARITIES[wonSkin.rarity].name;
        skinRarity.style.color = RARITIES[wonSkin.rarity].color;

        // Appliquer le gradient de rareté
        const skinCard = skinReveal.querySelector('.skin-card');
        if (skinCard) {
            skinCard.style.background = RARITIES[wonSkin.rarity].gradient;
        }

        skinReveal.classList.remove('hidden');
        if (openingActions) openingActions.classList.remove('hidden');

        this.currentRevealedSkin = wonSkin;

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Nouveau skin!',
                `${wonSkin.weapon} | ${wonSkin.name}`,
                'achievement'
            );
        }
    },

    selectRandomSkinFromCase(weaponCase) {
        // Obtenir tous les skins de la case
        const caseSkins = weaponCase.contents.map(skinId => 
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        if (caseSkins.length === 0) {
            console.error('Aucun skin trouvé dans la case');
            return null;
        }

        // Créer un tableau pondéré basé sur les probabilités de rareté
        const weightedSkins = [];
        caseSkins.forEach(skin => {
            const weight = Math.floor(RARITIES[skin.rarity].probability * 10000);
            for (let i = 0; i < weight; i++) {
                weightedSkins.push(skin);
            }
        });

        // Sélectionner un skin aléatoire
        const randomIndex = Math.floor(Math.random() * weightedSkins.length);
        return weightedSkins[randomIndex];
    },

    closeCaseOpeningModal() {
        const modal = document.getElementById('case-opening-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Nettoyer l'animation
        if (this.currentOpeningAnimation) {
            clearInterval(this.currentOpeningAnimation);
            this.currentOpeningAnimation = null;
        }

        this.currentRevealedSkin = null;

        // Recharger l'inventaire si on est sur la page inventaire
        if (window.location.hash === '#inventory' || document.getElementById('inventory-section')?.classList.contains('active')) {
            this.loadInventory();
        }
    },

    previewCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        const caseContents = weaponCase.contents.map(skinId => 
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        let previewHTML = `
            <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                <h3 style="margin-bottom: 20px; color: #00d4ff; text-align: center;">Contenu possible:</h3>
                <div style="display: grid; gap: 10px; max-height: 400px; overflow-y: auto;">
        `;

        caseContents.forEach(skin => {
            const rarity = RARITIES[skin.rarity];
            previewHTML += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${rarity.color};">
                    <div style="font-size: 24px;">${this.getWeaponIcon(skin.weapon)}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: white;">${skin.weapon} | ${skin.name}</div>
                        <div style="font-size: 12px; color: ${rarity.color}; font-weight: bold;">${rarity.name}</div>
                    </div>
                    <div style="font-size: 12px; opacity: 0.7;">${(rarity.probability * 100).toFixed(2)}%</div>
                </div>
            `;
        });

        previewHTML += `
                </div>
            </div>
        `;

        if (window.NotificationSystem) {
            // Créer une notification personnalisée avec le contenu
            const notification = document.createElement('div');
            notification.className = 'game-notification notification-info';
            notification.innerHTML = previewHTML;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(15, 20, 25, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                z-index: 10000;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 5px 10px;
            `;
            closeBtn.onclick = () => notification.remove();
            notification.appendChild(closeBtn);

            document.body.appendChild(notification);
        }
    },

    // ========================================
    // GESTION DES SKINS
    // ========================================

    loadStoreSkins() {
        const skinsGrid = document.getElementById('skins-grid');
        if (!skinsGrid) return;

        const allSkins = Object.values(WEAPON_SKINS).flat();
        const sortedSkins = allSkins.sort((a, b) => {
            return RARITIES[b.rarity].probability - RARITIES[a.rarity].probability;
        });

        skinsGrid.innerHTML = '';

        sortedSkins.forEach(skin => {
            const skinCard = this.createSkinCard(skin, 'store');
            skinsGrid.appendChild(skinCard);
        });
    },

    createSkinCard(skin, type = 'store') {
        const skinCard = document.createElement('div');
        skinCard.className = 'skin-card';
        skinCard.style.background = RARITIES[skin.rarity].gradient;

        const isOwned = playerInventory.skins.some(s => s.id === skin.id);
        const isEquipped = this.isSkinEquipped(skin);

        let actionButton = '';
        if (type === 'store') {
            if (isOwned) {
                actionButton = '<button class="btn-disabled" disabled>Possédé</button>';
            } else {
                actionButton = `<button class="btn-primary" onclick="StoreSystem.purchaseSkin('${skin.id}')">
                    <i class="fas fa-coins"></i> ${skin.price}
                </button>`;
            }
        } else if (type === 'inventory') {
            if (isEquipped) {
                actionButton = '<button class="btn-equipped" disabled>Équipé</button>';
            } else {
                actionButton = `<button class="btn-secondary" onclick="StoreSystem.equipSkin('${skin.id}')">Équiper</button>`;
            }
        }

        skinCard.innerHTML = `
            <div class="skin-image">
                <div class="weapon-icon">${this.getWeaponIcon(skin.weapon)}</div>
            </div>
            <div class="skin-info">
                <div class="skin-weapon">${skin.weapon}</div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-rarity" style="color: ${RARITIES[skin.rarity].color}">
                    ${RARITIES[skin.rarity].name}
                </div>
                <p class="skin-description">${skin.description}</p>
            </div>
            <div class="skin-actions">
                ${actionButton}
            </div>
        `;

        return skinCard;
    },

    purchaseSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) return;

        if (playerInventory.currency.coins < skin.price) {
            if (window.NotificationSystem) {
                window.NotificationSystem.show(
                    'Fonds insuffisants',
                    'Vous n\'avez pas assez de SIO Coins.',
                    'error'
                );
            }
            return;
        }

        // Déduire les pièces
        playerInventory.currency.coins -= skin.price;

        // Ajouter le skin à l'inventaire
        playerInventory.skins.push({
            id: skinId,
            acquiredAt: Date.now(),
            equipped: false
        });

        this.updateCurrencyDisplay();
        this.savePlayerData();
        this.loadStoreSkins();

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Skin acheté',
                `${skin.weapon} | ${skin.name} ajouté à votre inventaire!`,
                'success'
            );
        }
    },

    equipSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) return;

        const weaponCategory = this.getWeaponCategory(skin.weapon);
        
        // Déséquiper le skin actuel pour cette arme
        if (playerInventory.equippedSkins[weaponCategory]) {
            playerInventory.equippedSkins[weaponCategory][skin.weapon] = skinId;
        }

        this.savePlayerData();
        this.loadInventory();

        if (window.NotificationSystem) {
            window.NotificationSystem.show(
                'Skin équipé',
                `${skin.weapon} | ${skin.name} est maintenant équipé!`,
                'success'
            );
        }

        // Fermer la modal si ouverte
        if (this.currentRevealedSkin && this.currentRevealedSkin.id === skinId) {
            this.closeCaseOpeningModal();
        }
    },

    isSkinEquipped(skin) {
        const weaponCategory = this.getWeaponCategory(skin.weapon);
        return playerInventory.equippedSkins[weaponCategory]?.[skin.weapon] === skin.id;
    },

    getWeaponCategory(weaponName) {
        for (const [category, skins] of Object.entries(WEAPON_SKINS)) {
            if (skins.some(s => s.weapon === weaponName)) {
                return category;
            }
        }
        return 'rifles';
    },

    getWeaponIcon(weaponName) {
        const icons = {
            'AK-47': '🔫',
            'M4A4': '🔫',
            'M4A1-S': '🔫',
            'Glock-18': '🔫',
            'USP-S': '🔫',
            'Desert Eagle': '🔫',
            'P250': '🔫',
            'P90': '🔫',
            'MP9': '🔫',
            'AWP': '🎯',
            'Scout SSG 08': '🎯',
            'Karambit': '🔪',
            'Butterfly Knife': '🔪'
        };
        return icons[weaponName] || '🔫';
    },

    // ========================================
    // GESTION DE L'INVENTAIRE
    // ========================================

    loadInventory() {
        this.loadInventorySkins();
        this.loadInventoryCases();
        this.updateInventoryStats();
    },

    loadInventorySkins() {
        const weaponsGrid = document.getElementById('inventory-weapons-grid');
        if (!weaponsGrid) return;

        const ownedSkins = playerInventory.skins.map(skinData => {
            const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
            return skin ? { ...skin, acquiredAt: skinData.acquiredAt } : null;
        }).filter(Boolean);

        weaponsGrid.innerHTML = '';

        if (ownedSkins.length === 0) {
            weaponsGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun skin dans votre inventaire</p>
                    <button class="btn-primary" onclick="showMenuSection('store'); StoreSystem.switchStoreTab('skins')">Acheter des skins</button>
                </div>
            `;
            return;
        }

        ownedSkins.forEach(skin => {
            const skinCard = this.createSkinCard(skin, 'inventory');
            weaponsGrid.appendChild(skinCard);
        });
    },

    loadInventoryCases() {
        const casesGrid = document.getElementById('inventory-cases-grid');
        if (!casesGrid) return;

        casesGrid.innerHTML = '';

        if (playerInventory.cases.length === 0) {
            casesGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-box"></i>
                    <p>Aucune case dans votre inventaire</p>
                    <button class="btn-primary" onclick="showMenuSection('store'); StoreSystem.switchStoreTab('cases')">Acheter des cases</button>
                </div>
            `;
            return;
        }

        playerInventory.cases.forEach(caseData => {
            const weaponCase = WEAPON_CASES.find(c => c.id === caseData.id);
            if (!weaponCase) return;

            const caseCard = document.createElement('div');
            caseCard.className = 'case-card inventory-case';
            caseCard.innerHTML = `
                <div class="case-image">
                    <div class="case-icon">📦</div>
                </div>
                <div class="case-info">
                    <h3>${weaponCase.name}</h3>
                    <p>Acquise le ${new Date(caseData.acquiredAt).toLocaleDateString()}</p>
                </div>
                <div class="case-actions">
                    <button class="btn-primary" onclick="StoreSystem.openCase('${weaponCase.id}')">
                        Ouvrir
                    </button>
                </div>
            `;
            casesGrid.appendChild(caseCard);
        });
    },

    updateInventoryStats() {
        const totalSkinsElement = document.getElementById('total-skins');
        const totalValueElement = document.getElementById('total-value');

        if (totalSkinsElement) {
            totalSkinsElement.textContent = playerInventory.skins.length;
        }

        if (totalValueElement) {
            const totalValue = playerInventory.skins.reduce((sum, skinData) => {
                const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
                return sum + (skin ? skin.price : 0);
            }, 0);
            totalValueElement.textContent = totalValue;
        }
    },

    // ========================================
    // NAVIGATION BOUTIQUE
    // ========================================

    switchStoreTab(tab) {
        // Masquer tous les contenus
        document.querySelectorAll('.store-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Retirer la classe active de tous les onglets
        document.querySelectorAll('.store-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
        });

        // Afficher le contenu sélectionné
        const selectedContent = document.getElementById(`store-${tab}`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
        }

        // Activer l'onglet
        const selectedTab = event?.target || document.querySelector(`[onclick*="switchStoreTab('${tab}')"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Charger le contenu selon l'onglet
        switch(tab) {
            case 'cases':
                this.loadCases();
                break;
            case 'skins':
                this.loadStoreSkins();
                break;
            case 'agents':
                this.loadAgents();
                break;
        }
    },

    loadAgents() {
        const agentsGrid = document.getElementById('agents-grid');
        if (!agentsGrid) return;

        agentsGrid.innerHTML = `
            <div class="empty-inventory">
                <i class="fas fa-user-ninja"></i>
                <p>Agents bientôt disponibles!</p>
                <p style="font-size: 14px; opacity: 0.7;">Cette fonctionnalité sera ajoutée dans une future mise à jour.</p>
            </div>
        `;
    }
};

// ========================================
// FONCTIONS GLOBALES POUR HTML
// ========================================

function closeCaseOpeningModal() {
    StoreSystem.closeCaseOpeningModal();
}

function equipSkin() {
    if (StoreSystem.currentRevealedSkin) {
        StoreSystem.equipSkin(StoreSystem.currentRevealedSkin.id);
    }
}

function switchStoreTab(tab) {
    StoreSystem.switchStoreTab(tab);
}

function showInventoryCategory(category) {
    const ownedSkins = playerInventory.skins.map(skinData => {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
        return skin ? { ...skin, acquiredAt: skinData.acquiredAt } : null;
    }).filter(Boolean).filter(skin => {
        return StoreSystem.getWeaponCategory(skin.weapon) === category;
    });

    const weaponsGrid = document.getElementById('inventory-weapons-grid');
    if (!weaponsGrid) return;

    weaponsGrid.innerHTML = '';

    if (ownedSkins.length === 0) {
        weaponsGrid.innerHTML = `
            <div class="empty-category">
                <p>Aucun skin de ${category} dans votre inventaire</p>
            </div>
        `;
        return;
    }

    ownedSkins.forEach(skin => {
        const skinCard = StoreSystem.createSkinCard(skin, 'inventory');
        weaponsGrid.appendChild(skinCard);
    });

    // Mettre à jour le bouton actif
    document.querySelectorAll('#inventory-weapons .weapon-cat').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[onclick="showInventoryCategory('${category}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            StoreSystem.init();
            StoreSystem.checkDailyReward();
        } catch (error) {
            console.error('❌ Erreur initialisation store:', error);
        }
    }, 2000);
});

// Export global
window.StoreSystem = StoreSystem;
window.playerInventory = playerInventory;
window.WEAPON_SKINS = WEAPON_SKINS;
window.WEAPON_CASES = WEAPON_CASES;
window.RARITIES = RARITIES;

console.log('✅ Store.js chargé avec succès');
