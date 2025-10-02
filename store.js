// Store System - Weapon Skins, Cases, and Inventory
// Similar to CS:GO system with cases and rarities

// Rarity definitions with colors and probabilities
const RARITIES = {
    consumer: {
        name: 'Qualité Consumer',
        color: '#b0c3d9',
        probability: 0.7992, // 79.92%
        gradient: 'linear-gradient(45deg, #b0c3d9, #94a3b8)'
    },
    industrial: {
        name: 'Qualité Industrielle',
        color: '#5e98d9',
        probability: 0.1598, // 15.98%
        gradient: 'linear-gradient(45deg, #5e98d9, #4f7db8)'
    },
    milspec: {
        name: 'Qualité Militaire',
        color: '#4b69ff',
        probability: 0.032, // 3.2%
        gradient: 'linear-gradient(45deg, #4b69ff, #3b59db)'
    },
    restricted: {
        name: 'Classifié',
        color: '#8847ff',
        probability: 0.0064, // 0.64%
        gradient: 'linear-gradient(45deg, #8847ff, #7c3aed)'
    },
    classified: {
        name: 'Secret',
        color: '#d32ce6',
        probability: 0.0013, // 0.13%
        gradient: 'linear-gradient(45deg, #d32ce6, #c026d3)'
    },
    covert: {
        name: 'Très Secret',
        color: '#eb4b4b',
        probability: 0.0003, // 0.03%
        gradient: 'linear-gradient(45deg, #eb4b4b, #dc2626)'
    },
    knife: {
        name: 'Couteau',
        color: '#ffd700',
        probability: 0.0001, // 0.01%
        gradient: 'linear-gradient(45deg, #ffd700, #f59e0b)'
    }
};

// Weapon skins database
const WEAPON_SKINS = {
    rifles: [
        // AK-47 Skins
        {
            id: 'ak47_redline',
            weapon: 'AK-47',
            name: 'Redline',
            rarity: 'classified',
            pattern: 'redline',
            price: 2500,
            description: 'Cet AK-47 arbore un design rouge et noir distinctif.'
        },
        {
            id: 'ak47_vulcan',
            weapon: 'AK-47',
            name: 'Vulcan',
            rarity: 'covert',
            pattern: 'vulcan',
            price: 8500,
            description: 'Skin futuriste avec des détails orange et gris.'
        },
        {
            id: 'ak47_case_hardened',
            weapon: 'AK-47',
            name: 'Case Hardened',
            rarity: 'milspec',
            pattern: 'case_hardened',
            price: 800,
            description: 'Finition bleu acier avec des reflets dorés.'
        },
        {
            id: 'ak47_jungle_spray',
            weapon: 'AK-47',
            name: 'Jungle Spray',
            rarity: 'consumer',
            pattern: 'jungle',
            price: 50,
            description: 'Camouflage jungle classique.'
        },
        // M4A4 Skins
        {
            id: 'm4a4_howl',
            weapon: 'M4A4',
            name: 'Howl',
            rarity: 'covert',
            pattern: 'howl',
            price: 12000,
            description: 'Design iconique avec un loup hurlant.'
        },
        {
            id: 'm4a4_asiimov',
            weapon: 'M4A4',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 9500,
            description: 'Design futuriste blanc et orange.'
        },
        {
            id: 'm4a4_dragon_king',
            weapon: 'M4A4',
            name: 'Dragon King',
            rarity: 'classified',
            pattern: 'dragon',
            price: 3200,
            description: 'Dragon asiatique gravé sur l\'arme.'
        },
        {
            id: 'm4a4_tornado',
            weapon: 'M4A4',
            name: 'Tornado',
            rarity: 'industrial',
            pattern: 'tornado',
            price: 120,
            description: 'Motif de tornade gris et noir.'
        }
    ],
    pistols: [
        {
            id: 'deagle_blaze',
            weapon: 'Desert Eagle',
            name: 'Blaze',
            rarity: 'restricted',
            pattern: 'fire',
            price: 1800,
            description: 'Finition flamboyante avec des flammes réalistes.'
        },
        {
            id: 'glock_fade',
            weapon: 'Glock-18',
            name: 'Fade',
            rarity: 'restricted',
            pattern: 'fade',
            price: 1200,
            description: 'Dégradé de couleurs arc-en-ciel.'
        },
        {
            id: 'usp_orion',
            weapon: 'USP-S',
            name: 'Orion',
            rarity: 'classified',
            pattern: 'space',
            price: 2800,
            description: 'Thème spatial avec des étoiles.'
        },
        {
            id: 'p250_sand_dune',
            weapon: 'P250',
            name: 'Sand Dune',
            rarity: 'consumer',
            pattern: 'desert',
            price: 25,
            description: 'Camouflage désertique simple.'
        }
    ],
    smgs: [
        {
            id: 'p90_asiimov',
            weapon: 'P90',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 6500,
            description: 'Version P90 du célèbre skin Asiimov.'
        },
        {
            id: 'mp9_bulldozer',
            weapon: 'MP9',
            name: 'Bulldozer',
            rarity: 'milspec',
            pattern: 'industrial',
            price: 400,
            description: 'Design industriel avec des rayures jaunes.'
        }
    ],
    snipers: [
        {
            id: 'awp_dragon_lore',
            weapon: 'AWP',
            name: 'Dragon Lore',
            rarity: 'covert',
            pattern: 'dragon_lore',
            price: 25000,
            description: 'Le skin AWP le plus iconique et recherché.'
        },
        {
            id: 'awp_asiimov',
            weapon: 'AWP',
            name: 'Asiimov',
            rarity: 'covert',
            pattern: 'asiimov',
            price: 15000,
            description: 'Design futuriste blanc et orange pour AWP.'
        },
        {
            id: 'ssg08_blood_in_water',
            weapon: 'Scout SSG 08',
            name: 'Blood in Water',
            rarity: 'classified',
            pattern: 'shark',
            price: 1500,
            description: 'Requin menaçant dans des eaux sanglantes.'
        },
        {
            id: 'awp_safari_mesh',
            weapon: 'AWP',
            name: 'Safari Mesh',
            rarity: 'consumer',
            pattern: 'safari',
            price: 80,
            description: 'Camouflage safari basique.'
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

// Cases définition
const WEAPON_CASES = [
    {
        id: 'chroma_case',
        name: 'Chroma Case',
        price: 250,
        image: 'chroma_case.png',
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
        image: 'spectrum_case.png',
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
        image: 'phoenix_case.png',
        description: 'Skins légendaires du monde de Phoenix',
        contents: [
            'ak47_vulcan',
            'm4a4_howl',
            'awp_dragon_lore',
            'butterfly_crimson_web'
        ]
    }
];

// Global store state
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

// Store system functions
const StoreSystem = {
    
    init() {
        this.loadPlayerData();
        this.setupEventListeners();
        console.log('🛒 Store system initialized');
    },

    async loadPlayerData() {
        // Load from Firebase first if user is logged in
        if (currentUser && database) {
            try {
                const userRef = database.ref(`users/${currentUser.uid}/inventory`);
                const snapshot = await userRef.once('value');
                const firebaseData = snapshot.val();
                
                if (firebaseData) {
                    playerInventory = { ...playerInventory, ...firebaseData };
                    this.updateCurrencyDisplay();
                    return;
                }
            } catch (error) {
                console.error('Error loading from Firebase:', error);
            }
        }
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('sio_shooter_inventory');
        if (savedData) {
            playerInventory = { ...playerInventory, ...JSON.parse(savedData) };
        }
        
        // Add some starting skins for demo (only if no data exists)
        if (playerInventory.skins.length === 0) {
            playerInventory.skins = [
                {
                    id: 'ak47_jungle_spray',
                    acquiredAt: Date.now(),
                    equipped: false
                },
                {
                    id: 'p250_sand_dune', 
                    acquiredAt: Date.now(),
                    equipped: false
                }
            ];
            this.savePlayerData(); // Save the starter skins
        }

        this.updateCurrencyDisplay();
    },

    savePlayerData() {
        localStorage.setItem('sio_shooter_inventory', JSON.stringify(playerInventory));
        
        // Also save to Firebase if user is logged in
        if (currentUser && database) {
            try {
                database.ref(`users/${currentUser.uid}/inventory`).set(playerInventory);
            } catch (error) {
                console.error('Error saving to Firebase:', error);
            }
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

    // Store tab switching
    switchStoreTab(tab) {
        // Hide all store contents
        document.querySelectorAll('.store-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.store-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
        });

        // Show selected content and activate tab
        const selectedContent = document.getElementById(`store-${tab}`);
        const selectedTab = document.querySelector(`[onclick="switchStoreTab('${tab}')"]`);
        
        if (selectedContent) selectedContent.classList.remove('hidden');
        if (selectedTab) selectedTab.classList.add('active');

        // Load content based on tab
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

    loadStoreSkins() {
        const skinsGrid = document.getElementById('skins-grid');
        if (!skinsGrid) return;

        // Get all skins and sort by rarity
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

    purchaseCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        if (playerInventory.currency.coins < weaponCase.price) {
            NotificationSystem.show(
                'Fonds insuffisants',
                'Vous n\'avez pas assez de SIO Coins pour acheter cette case.',
                'error'
            );
            return;
        }

        // Deduct coins
        playerInventory.currency.coins -= weaponCase.price;

        // Add case to inventory
        playerInventory.cases.push({
            id: caseId,
            acquiredAt: Date.now()
        });

        this.updateCurrencyDisplay();
        this.savePlayerData();

        NotificationSystem.show(
            'Case achetée',
            `${weaponCase.name} ajoutée à votre inventaire!`,
            'success'
        );

        // Ask if user wants to open it
        this.askToOpenCase(caseId);
    },

    purchaseSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) return;

        if (playerInventory.currency.coins < skin.price) {
            NotificationSystem.show(
                'Fonds insuffisants',
                'Vous n\'avez pas assez de SIO Coins pour acheter ce skin.',
                'error'
            );
            return;
        }

        // Deduct coins
        playerInventory.currency.coins -= skin.price;

        // Add skin to inventory
        playerInventory.skins.push({
            id: skinId,
            acquiredAt: Date.now(),
            equipped: false
        });

        this.updateCurrencyDisplay();
        this.savePlayerData();
        this.loadStoreSkins(); // Refresh the display

        NotificationSystem.show(
            'Skin acheté',
            `${skin.weapon} | ${skin.name} ajouté à votre inventaire!`,
            'success'
        );
    },

    askToOpenCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        NotificationSystem.show(
            'Case achetée',
            'Voulez-vous ouvrir cette case maintenant?',
            'info',
            10000,
            [
                {
                    text: 'Ouvrir',
                    primary: true,
                    callback: `StoreSystem.openCase('${caseId}')`
                },
                {
                    text: 'Plus tard',
                    callback: `document.querySelector('.game-notification').remove()`
                }
            ]
        );
    },

    openCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        // Remove case from inventory
        const caseIndex = playerInventory.cases.findIndex(c => c.id === caseId);
        if (caseIndex === -1) {
            NotificationSystem.show('Erreur', 'Case non trouvée dans l\'inventaire.', 'error');
            return;
        }

        playerInventory.cases.splice(caseIndex, 1);

        // Show case opening modal
        this.showCaseOpeningModal(weaponCase);
    },

    showCaseOpeningModal(weaponCase) {
        const modal = document.getElementById('case-opening-modal');
        const title = document.getElementById('case-opening-title');
        const caseImage = document.getElementById('case-image');

        title.textContent = `Ouverture: ${weaponCase.name}`;
        caseImage.innerHTML = '<div class="case-icon">📦</div>';

        modal.classList.remove('hidden');

        // Start opening animation
        setTimeout(() => {
            this.startCaseOpeningAnimation(weaponCase);
        }, 1000);
    },

    startCaseOpeningAnimation(weaponCase) {
        const progressBar = document.getElementById('opening-progress');
        const skinReveal = document.getElementById('skin-reveal');

        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            progressBar.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.revealSkin(weaponCase);
                }, 500);
            }
        }, 50);
    },

    revealSkin(weaponCase) {
        // Select a random skin from the case based on rarity probabilities
        const wonSkin = this.selectRandomSkinFromCase(weaponCase);
        
        // Add skin to player inventory
        playerInventory.skins.push({
            id: wonSkin.id,
            acquiredAt: Date.now(),
            equipped: false
        });

        // Show the revealed skin
        const skinReveal = document.getElementById('skin-reveal');
        const skinImage = document.getElementById('revealed-skin-image');
        const skinName = document.getElementById('revealed-skin-name');
        const skinWeapon = document.getElementById('revealed-skin-weapon');
        const skinRarity = document.getElementById('revealed-skin-rarity');

        skinImage.innerHTML = this.getWeaponIcon(wonSkin.weapon);
        skinName.textContent = wonSkin.name;
        skinWeapon.textContent = wonSkin.weapon;
        skinRarity.textContent = RARITIES[wonSkin.rarity].name;
        skinRarity.style.color = RARITIES[wonSkin.rarity].color;

        // Apply rarity gradient to the card
        skinReveal.querySelector('.skin-card').style.background = RARITIES[wonSkin.rarity].gradient;

        skinReveal.classList.remove('hidden');
        document.getElementById('opening-actions').classList.remove('hidden');

        this.savePlayerData();

        // Store the currently revealed skin for potential equipping
        this.currentRevealedSkin = wonSkin;

        NotificationSystem.show(
            'Nouveau skin!',
            `Vous avez obtenu: ${wonSkin.weapon} | ${wonSkin.name}`,
            'achievement'
        );
    },

    selectRandomSkinFromCase(weaponCase) {
        // Get all skins that are in this case
        const caseSkins = weaponCase.contents.map(skinId => 
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        // Create weighted array based on rarity probabilities
        const weightedSkins = [];
        caseSkins.forEach(skin => {
            const weight = Math.floor(RARITIES[skin.rarity].probability * 10000);
            for (let i = 0; i < weight; i++) {
                weightedSkins.push(skin);
            }
        });

        // Select random skin
        const randomIndex = Math.floor(Math.random() * weightedSkins.length);
        return weightedSkins[randomIndex];
    },

    equipSkin(skinId) {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinId);
        if (!skin) return;

        const weaponCategory = this.getWeaponCategory(skin.weapon);
        
        // Unequip current skin for this weapon
        Object.keys(playerInventory.equippedSkins[weaponCategory]).forEach(weapon => {
            if (weapon === skin.weapon) {
                delete playerInventory.equippedSkins[weaponCategory][weapon];
            }
        });

        // Equip new skin
        playerInventory.equippedSkins[weaponCategory][skin.weapon] = skinId;

        this.savePlayerData();
        this.loadInventory(); // Refresh inventory display

        NotificationSystem.show(
            'Skin équipé',
            `${skin.weapon} | ${skin.name} est maintenant équipé!`,
            'success'
        );

        // Close case opening modal if it's open
        if (this.currentRevealedSkin && this.currentRevealedSkin.id === skinId) {
            this.closeCaseOpeningModal();
        }
    },

    isSkinEquipped(skin) {
        const weaponCategory = this.getWeaponCategory(skin.weapon);
        return playerInventory.equippedSkins[weaponCategory][skin.weapon] === skin.id;
    },

    getWeaponCategory(weaponName) {
        const categories = {
            'AK-47': 'rifles',
            'M4A4': 'rifles',
            'M4A1-S': 'rifles',
            'Glock-18': 'pistols',
            'USP-S': 'pistols',
            'Desert Eagle': 'pistols',
            'P250': 'pistols',
            'P90': 'smgs',
            'MP9': 'smgs',
            'AWP': 'snipers',
            'Scout SSG 08': 'snipers',
            'Karambit': 'knives',
            'Butterfly Knife': 'knives'
        };
        return categories[weaponName] || 'rifles';
    },

    // Function to get equipped skin data for a weapon (for use in game)
    getEquippedSkin(weaponName) {
        const category = this.getWeaponCategory(weaponName);
        const equippedSkinId = playerInventory.equippedSkins[category][weaponName];
        
        if (!equippedSkinId) return null;
        
        return Object.values(WEAPON_SKINS).flat().find(skin => skin.id === equippedSkinId);
    },

    // Function to get weapon display info with skin
    getWeaponDisplayInfo(weaponName) {
        const equippedSkin = this.getEquippedSkin(weaponName);
        
        if (equippedSkin) {
            return {
                name: `${weaponName} | ${equippedSkin.name}`,
                rarity: equippedSkin.rarity,
                pattern: equippedSkin.pattern,
                skinName: equippedSkin.name
            };
        }
        
        return {
            name: weaponName,
            rarity: null,
            pattern: null,
            skinName: null
        };
    },

    closeCaseOpeningModal() {
        document.getElementById('case-opening-modal').classList.add('hidden');
        
        // Reset modal state
        document.getElementById('opening-progress').style.width = '0%';
        document.getElementById('skin-reveal').classList.add('hidden');
        document.getElementById('opening-actions').classList.add('hidden');
        
        this.currentRevealedSkin = null;
    },

    // Inventory functions
    switchInventoryTab(tab) {
        // Hide all inventory contents
        document.querySelectorAll('.inventory-content').forEach(content => {
            content.classList.add('hidden');
        });

        // Remove active class from all tabs
        document.querySelectorAll('.inventory-tab').forEach(tabBtn => {
            tabBtn.classList.remove('active');
        });

        // Show selected content and activate tab
        const selectedContent = document.getElementById(`inventory-${tab}`);
        const selectedTab = document.querySelector(`[onclick="switchInventoryTab('${tab}')"]`);
        
        if (selectedContent) selectedContent.classList.remove('hidden');
        if (selectedTab) selectedTab.classList.add('active');

        // Load content based on tab
        switch(tab) {
            case 'weapons':
                this.loadInventoryWeapons();
                break;
            case 'agents':
                this.loadInventoryAgents();
                break;
            case 'cases':
                this.loadInventoryCases();
                break;
        }
    },

    loadInventory() {
        this.loadInventoryWeapons();
        this.updateInventoryStats();
    },

    loadInventoryWeapons() {
        const weaponsGrid = document.getElementById('inventory-weapons-grid');
        if (!weaponsGrid) return;

        weaponsGrid.innerHTML = '';

        // Get owned skins
        const ownedSkins = playerInventory.skins.map(skinData => {
            const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
            return { ...skin, acquiredAt: skinData.acquiredAt };
        }).filter(Boolean);

        if (ownedSkins.length === 0) {
            weaponsGrid.innerHTML = `
                <div class="empty-inventory">
                    <i class="fas fa-box-open"></i>
                    <p>Aucun skin d'arme dans votre inventaire</p>
                    <button class="btn-primary" onclick="showMenuSection('store')">Visiter la boutique</button>
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

    setupEventListeners() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                showMenuSection('store');
            }
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                showMenuSection('inventory');
            }
        });
    },

    // Daily rewards system
    checkDailyReward() {
        const lastReward = localStorage.getItem('sio_shooter_last_daily_reward');
        const today = new Date().toDateString();

        if (lastReward !== today) {
            const reward = 100 + Math.floor(Math.random() * 50); // 100-150 coins
            playerInventory.currency.coins += reward;
            
            localStorage.setItem('sio_shooter_last_daily_reward', today);
            this.savePlayerData();
            this.updateCurrencyDisplay();

            NotificationSystem.show(
                'Récompense quotidienne',
                `Vous avez reçu ${reward} SIO Coins!`,
                'success'
            );
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
    },

    loadInventoryAgents() {
        const agentsGrid = document.getElementById('inventory-agents-grid');
        if (!agentsGrid) return;

        agentsGrid.innerHTML = `
            <div class="empty-inventory">
                <i class="fas fa-user-ninja"></i>
                <p>Aucun agent dans votre inventaire</p>
                <p style="font-size: 14px; opacity: 0.7;">Les agents seront disponibles prochainement.</p>
            </div>
        `;
    },

    previewCase(caseId) {
        const weaponCase = WEAPON_CASES.find(c => c.id === caseId);
        if (!weaponCase) return;

        // Get case contents
        const caseContents = weaponCase.contents.map(skinId => 
            Object.values(WEAPON_SKINS).flat().find(skin => skin.id === skinId)
        ).filter(Boolean);

        // Create preview modal content
        let previewContent = `
            <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
                <h3 style="margin-bottom: 20px; color: #00d4ff;">Contenu possible:</h3>
                <div style="display: grid; gap: 15px;">
        `;

        caseContents.forEach(skin => {
            previewContent += `
                <div style="display: flex; align-items: center; gap: 15px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 4px solid ${RARITIES[skin.rarity].color};">
                    <div style="font-size: 24px;">${this.getWeaponIcon(skin.weapon)}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: white;">${skin.weapon} | ${skin.name}</div>
                        <div style="font-size: 12px; color: ${RARITIES[skin.rarity].color}; font-weight: bold;">${RARITIES[skin.rarity].name}</div>
                    </div>
                    <div style="font-size: 12px; opacity: 0.7;">${(RARITIES[skin.rarity].probability * 100).toFixed(2)}%</div>
                </div>
            `;
        });

        previewContent += `
                </div>
            </div>
        `;

        NotificationSystem.show(
            `Aperçu: ${weaponCase.name}`,
            previewContent,
            'info',
            15000,
            [
                {
                    text: 'Acheter',
                    primary: true,
                    callback: `StoreSystem.purchaseCase('${caseId}'); document.querySelector('.game-notification').remove();`
                },
                {
                    text: 'Fermer',
                    callback: `document.querySelector('.game-notification').remove()`
                }
            ]
        );
    }
};

// Global functions for HTML onclick handlers
function switchStoreTab(tab) {
    StoreSystem.switchStoreTab(tab);
}

function switchInventoryTab(tab) {
    StoreSystem.switchInventoryTab(tab);
}

function showSkinCategory(category) {
    // Implementation for filtering skins by category in store
    const allSkins = WEAPON_SKINS[category] || [];
    const skinsGrid = document.getElementById('skins-grid');
    
    if (!skinsGrid) return;
    
    skinsGrid.innerHTML = '';
    allSkins.forEach(skin => {
        const skinCard = StoreSystem.createSkinCard(skin, 'store');
        skinsGrid.appendChild(skinCard);
    });

    // Update active category button
    document.querySelectorAll('.skin-cat').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showSkinCategory('${category}')"]`).classList.add('active');
}

function showInventoryCategory(category) {
    // Implementation for filtering inventory by category
    const ownedSkins = playerInventory.skins.map(skinData => {
        const skin = Object.values(WEAPON_SKINS).flat().find(s => s.id === skinData.id);
        return { ...skin, acquiredAt: skinData.acquiredAt };
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

    // Update active category button
    document.querySelectorAll('#inventory-weapons .weapon-cat').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="showInventoryCategory('${category}')"]`).classList.add('active');
}

function closeCaseOpeningModal() {
    StoreSystem.closeCaseOpeningModal();
}

function equipSkin() {
    if (StoreSystem.currentRevealedSkin) {
        StoreSystem.equipSkin(StoreSystem.currentRevealedSkin.id);
    }
}

// Initialize store system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            StoreSystem.init();
            StoreSystem.checkDailyReward();
        } catch (error) {
            console.error('Error initializing store system:', error);
        }
    }, 2000);
});

// Export for use in other files
window.StoreSystem = StoreSystem;
window.playerInventory = playerInventory;
window.WEAPON_SKINS = WEAPON_SKINS;
window.RARITIES = RARITIES;