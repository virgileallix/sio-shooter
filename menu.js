// Système de navigation des menus COMPLET avec toutes les fonctionnalités - VERSION CORRIGÉE

// Variables globales pour les menus
let currentMenuSection = 'play';
let selectedGameMode = 'competitive';
let selectedMap = 'dust2_complex';
let selectedWeaponCategory = 'rifles';
let searchResults = [];
let currentSearchQuery = '';

// Initialisation des menus
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeMenus();
    }, 1500);
});

function initializeMenus() {
    try {
        loadWeapons();
        loadFriends();
        setupMenuEventListeners();
        setupSettingsListeners();
        setupSearchFunctionality();
        initializeAnimations();
        console.log('✅ Menus complets initialisés');
    } catch (error) {
        console.error('❌ Erreur initialisation menus:', error);
    }
}

// Configuration des écouteurs d'événements
function setupMenuEventListeners() {
    // Navigation du menu principal
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const onclickAttr = e.target.closest('.nav-btn').getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/'(.+)'/);
                if (match && match[1]) {
                    showMenuSection(match[1]);
                }
            }
        });
    });

    // Sliders de paramètres
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.addEventListener('input', updateSliderDisplay);
    });

    // Raccourcis clavier pour navigation rapide
    document.addEventListener('keydown', (e) => {
        if (AppState.currentScreen === 'menu') {
            handleMenuKeyboard(e);
        }
    });

    console.log('🎛️ Event listeners configurés');
}

function handleMenuKeyboard(e) {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                showMenuSection('play');
                break;
            case '2':
                showMenuSection('friends');
                break;
            case '3':
                showMenuSection('leaderboard');
                break;
            case '4':
                showMenuSection('arsenal');
                break;
            case '5':
                showMenuSection('settings');
                break;
        }
    }
    
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        focusSearch();
    }
}

// Affichage des sections de menu avec animations
function showMenuSection(section) {
    try {
        // Mémoriser la section précédente pour l'animation
        const previousSection = currentMenuSection;
        
        // Cacher toutes les sections avec animation
        document.querySelectorAll('.menu-section').forEach(sec => {
            sec.classList.add('section-exit');
            setTimeout(() => {
                sec.classList.add('hidden');
                sec.classList.remove('section-exit');
            }, 200);
        });
        
        // Retirer la classe active de tous les boutons de navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Afficher la section sélectionnée avec animation
        setTimeout(() => {
            const sectionElement = document.getElementById(`${section}-section`);
            if (sectionElement) {
                sectionElement.classList.remove('hidden');
                sectionElement.classList.add('section-enter');
                
                setTimeout(() => {
                    sectionElement.classList.remove('section-enter');
                }, 300);
            } else {
                console.warn(`Section ${section} non trouvée`);
                return;
            }
            
            // Activer le bouton correspondant
            const navButton = document.querySelector(`.nav-btn[onclick*="${section}"]`);
            if (navButton) {
                navButton.classList.add('active');
            }
            
            currentMenuSection = section;
            
            // Actions spécifiques selon la section
            switch(section) {
                case 'play':
                    initializePlaySection();
                    break;
                case 'friends':
                    loadFriends();
                    break;
                case 'arsenal':
                    loadWeapons();
                    break;
                case 'leaderboard':
                    switchLeaderboardTab('competitive');
                    break;
                case 'settings':
                    loadCurrentSettings();
                    break;
            }

            // Analytics
            trackSectionVisit(section, previousSection);
            
        }, 200);
        
        console.log(`📍 Section changée: ${previousSection} → ${section}`);
    } catch (error) {
        console.error('Erreur changement section:', error);
    }
}

function initializePlaySection() {
    // Mettre à jour les statistiques de file d'attente
    updateQueueStats();
    
    // Vérifier les matchs en cours
    checkActiveMatches();
    
    // Mettre à jour les cartes disponibles
    updateAvailableMaps();
}

async function updateQueueStats() {
    try {
        if (!database || !database.ref) return;
        
        const queueRef = database.ref('matchmaking_queue');
        const snapshot = await queueRef.once('value');
        
        if (snapshot.exists()) {
            const queue = snapshot.val();
            const queueCount = Object.keys(queue).length;
            
            // Afficher le nombre de joueurs en file
            const queueIndicator = document.getElementById('queue-indicator');
            if (queueIndicator) {
                queueIndicator.textContent = `${queueCount} joueur${queueCount > 1 ? 's' : ''} en recherche`;
                queueIndicator.style.color = queueCount > 0 ? '#4ade80' : '#ef4444';
            }
        }
    } catch (error) {
        console.error('Erreur mise à jour stats file:', error);
    }
}

async function checkActiveMatches() {
    try {
        if (!currentUser || !database || !database.ref) return;
        
        const matchesRef = database.ref('active_matches');
        const snapshot = await matchesRef.orderByChild(`players/${currentUser.uid}/connected`).equalTo(true).once('value');
        
        if (snapshot.exists()) {
            const matches = snapshot.val();
            const activeMatch = Object.values(matches)[0];
            
            if (activeMatch && activeMatch.status !== 'ended') {
                showReconnectOption(activeMatch);
            }
        }
    } catch (error) {
        console.error('Erreur vérification matchs actifs:', error);
    }
}

function showReconnectOption(match) {
    const reconnectBanner = document.createElement('div');
    reconnectBanner.id = 'reconnect-banner';
    reconnectBanner.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #ff4655, #ff6b7a);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(255, 70, 85, 0.4);
        z-index: 500;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideDown 0.5s ease;
    `;
    
    reconnectBanner.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="font-size: 20px;"></i>
        <div>
            <div style="font-weight: bold;">Match en cours détecté</div>
            <div style="font-size: 12px; opacity: 0.9;">${match.mode} sur ${match.map}</div>
        </div>
        <button onclick="reconnectToMatch('${match.id}')" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid white;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
        ">
            RECONNECTER
        </button>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(reconnectBanner);
}

async function reconnectToMatch(matchId) {
    try {
        // Supprimer le banner
        const banner = document.getElementById('reconnect-banner');
        if (banner) banner.remove();
        
        // Reconnecter au match
        window.matchmakingState.currentMatchId = matchId;
        window.MatchmakingSystem.setupMatchListeners(matchId);
        
        NotificationSystem.show(
            'Reconnexion...',
            'Reconnexion au match en cours',
            'info',
            3000
        );
        
    } catch (error) {
        console.error('Erreur reconnexion:', error);
        NotificationSystem.show(
            'Erreur de reconnexion',
            'Impossible de se reconnecter au match',
            'error'
        );
    }
}

// Sélection du mode de jeu avec validation
function selectGameMode(mode) {
    try {
        // Vérifier que le mode existe
        if (!window.gameModes || !window.gameModes[mode]) {
            console.error('Mode de jeu non disponible:', mode);
            showMessage('Mode de jeu non disponible', 'error');
            return;
        }

        // Animation de désélection
        document.querySelectorAll('.game-mode').forEach(modeEl => {
            modeEl.classList.remove('selected');
            modeEl.style.transform = 'scale(1)';
        });
        
        // Animation de sélection
        if (event && event.target) {
            const gameMode = event.target.closest('.game-mode');
            if (gameMode) {
                gameMode.classList.add('selected');
                gameMode.style.transform = 'scale(1.02)';
                
                // Effet visuel de sélection
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(0, 212, 255, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                gameMode.style.position = 'relative';
                gameMode.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            }
        }
        
        selectedGameMode = mode;
        
        // Mettre à jour l'interface selon le mode
        updateModeSpecificUI(mode);
        
        // Sauvegarder la préférence
        saveGameModePreference(mode);
        
        console.log('🎮 Mode de jeu sélectionné:', mode);
        
        // Analytics
        trackModeSelection(mode);
        
    } catch (error) {
        console.error('Erreur sélection mode:', error);
    }
}

// Mise à jour de l'interface selon le mode
function updateModeSpecificUI(mode) {
    try {
        const modeData = window.gameModes[mode];
        if (!modeData) return;
        
        const mapSelection = document.querySelector('.map-selection');
        const playSettings = document.querySelector('.play-settings');
        
        // Afficher/masquer les options selon le mode
        if (mode === 'deathmatch') {
            if (playSettings) {
                playSettings.style.opacity = '0.7';
            }
            // En deathmatch, moins d'options de cartes
            updateMapSelectionForMode(mode);
        } else {
            if (playSettings) {
                playSettings.style.opacity = '1';
            }
            updateMapSelectionForMode(mode);
        }
        
        // Mettre à jour le texte du bouton avec animation
        const launchBtn = document.querySelector('.launch-game-btn');
        if (launchBtn) {
            const newText = `<i class="fas fa-rocket"></i> RECHERCHER ${modeData.name.toUpperCase()}`;
            
            // Animation de changement de texte
            launchBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                launchBtn.innerHTML = newText;
                launchBtn.style.transform = 'scale(1)';
            }, 100);
        }
        
        // Mettre à jour les informations du mode
        updateModeInfo(mode, modeData);
        
    } catch (error) {
        console.error('Erreur mise à jour UI mode:', error);
    }
}

function updateMapSelectionForMode(mode) {
    const mapsGrid = document.querySelector('.maps-grid');
    if (!mapsGrid) return;
    
    // Cartes disponibles selon le mode
    const availableMaps = {
        'deathmatch': ['dust2_complex', 'haven_complex'],
        'competitive': ['dust2_complex', 'haven_complex'],
        'duel': ['dust2_complex'],
        'unrated': ['dust2_complex', 'haven_complex']
    };
    
    const maps = availableMaps[mode] || ['dust2_complex'];
    
    // Réorganiser les cartes
    maps.forEach(mapName => {
        const mapCard = mapsGrid.querySelector(`[onclick*="${mapName}"]`);
        if (mapCard) {
            mapCard.style.display = 'block';
            mapCard.style.order = maps.indexOf(mapName);
        }
    });
}

function updateModeInfo(mode, modeData) {
    const modeInfoElement = document.querySelector('.mode-selected-info');
    if (!modeInfoElement) {
        // Créer l'élément d'information
        const infoDiv = document.createElement('div');
        infoDiv.className = 'mode-selected-info';
        infoDiv.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 10px;
            text-align: center;
        `;
        
        const gameModesContainer = document.querySelector('.game-modes');
        if (gameModesContainer) {
            gameModesContainer.parentNode.insertBefore(infoDiv, gameModesContainer.nextSibling);
        }
    }
    
    const infoElement = document.querySelector('.mode-selected-info');
    if (infoElement) {
        infoElement.innerHTML = `
            <h4 style="color: #00d4ff; margin-bottom: 10px;">${modeData.name}</h4>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 10px;">${modeData.description}</p>
            <div style="display: flex; justify-content: center; gap: 20px; font-size: 14px;">
                <span><i class="fas fa-users"></i> ${modeData.maxPlayers} joueurs</span>
                <span><i class="fas fa-clock"></i> ${modeData.maxRounds} rounds max</span>
                ${modeData.ranked ? '<span><i class="fas fa-trophy"></i> Classé</span>' : ''}
                ${modeData.economy ? '<span><i class="fas fa-coins"></i> Économie</span>' : ''}
            </div>
        `;
    }
}

// Sélection de la carte avec animation
function selectMap(map) {
    try {
        // Animation de désélection
        document.querySelectorAll('.map-card').forEach(mapEl => {
            mapEl.classList.remove('active');
            mapEl.style.transform = 'scale(1)';
        });
        
        // Animation de sélection
        if (event && event.target) {
            const mapCard = event.target.closest('.map-card');
            if (mapCard) {
                mapCard.classList.add('active');
                mapCard.style.transform = 'scale(1.05)';
                
                // Effet de pulsation
                mapCard.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
                setTimeout(() => {
                    mapCard.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
                }, 200);
            }
        }
        
        selectedMap = map;
        
        // Mettre à jour l'aperçu de la carte
        updateMapPreview(map);
        
        console.log('🗺️ Carte sélectionnée:', map);
        
        // Analytics
        trackMapSelection(map);
        
    } catch (error) {
        console.error('Erreur sélection carte:', error);
    }
}

function updateMapPreview(map) {
    const previewElement = document.querySelector('.map-preview-info');
    if (!previewElement) {
        // Créer l'aperçu si il n'existe pas
        const preview = document.createElement('div');
        preview.className = 'map-preview-info';
        preview.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            text-align: center;
        `;
        
        const mapSelection = document.querySelector('.map-selection');
        if (mapSelection) {
            mapSelection.appendChild(preview);
        }
    }
    
    const mapInfo = getMapInfo(map);
    const preview = document.querySelector('.map-preview-info');
    
    if (preview && mapInfo) {
        preview.innerHTML = `
            <h4 style="color: #ffd700; margin-bottom: 10px;">${mapInfo.name}</h4>
            <div style="display: flex; justify-content: center; gap: 15px; font-size: 14px; color: rgba(255,255,255,0.8);">
                <span><i class="fas fa-map"></i> ${mapInfo.sites} sites</span>
                <span><i class="fas fa-expand"></i> ${mapInfo.size}</span>
                <span><i class="fas fa-star"></i> ${mapInfo.difficulty}</span>
            </div>
        `;
    }
}

function getMapInfo(map) {
    const mapInfos = {
        'dust2_complex': {
            name: 'Dust2 Complex',
            sites: '2',
            size: 'Grande',
            difficulty: 'Moyen'
        },
        'haven_complex': {
            name: 'Haven Complex',
            sites: '3',
            size: 'Très grande',
            difficulty: 'Difficile'
        },
        'auto': {
            name: 'Aléatoire',
            sites: 'Varié',
            size: 'Variable',
            difficulty: 'Surprise'
        }
    };
    
    return mapInfos[map] || mapInfos['auto'];
}

function updateAvailableMaps() {
    // Mettre à jour la liste des cartes disponibles
    console.log('🗺️ Cartes disponibles mises à jour');
}

// Lancement du jeu avec validation et feedback
async function launchGame() {
    const launchBtn = document.querySelector('.launch-game-btn');
    
    if (!currentUser) {
        showMessage('Vous devez être connecté pour jouer', 'error');
        return;
    }
    
    // Vérifications préalables
    if (!window.MatchmakingSystem) {
        showMessage('Système de matchmaking non disponible. Rechargez la page.', 'error');
        return;
    }

    if (!window.gameModes || !window.gameModes[selectedGameMode]) {
        showMessage('Mode de jeu non disponible. Rechargez la page.', 'error');
        return;
    }
    
    // Vérifier la connexion
    if (!navigator.onLine) {
        showMessage('Aucune connexion Internet détectée', 'error');
        return;
    }
    
    try {
        // Animation du bouton avec étapes
        const originalHTML = launchBtn.innerHTML;
        const loadingSteps = [
            '<i class="fas fa-search"></i> RECHERCHE...',
            '<i class="fas fa-spinner fa-spin"></i> CONNEXION...',
            '<i class="fas fa-users"></i> RECHERCHE JOUEURS...'
        ];
        
        let stepIndex = 0;
        launchBtn.innerHTML = loadingSteps[stepIndex];
        launchBtn.disabled = true;
        launchBtn.classList.add('loading');
        
        const stepInterval = setInterval(() => {
            stepIndex = (stepIndex + 1) % loadingSteps.length;
            launchBtn.innerHTML = loadingSteps[stepIndex];
        }, 1000);
        
        // Récupérer les préférences avec validation
        const region = document.getElementById('region-select')?.value || 'EU';
        const maxPing = parseInt(document.getElementById('ping-select')?.value) || 100;
        
        const options = {
            region: region,
            maxPing: maxPing,
            allowCrossPlatform: true,
            preferredLanguage: 'fr'
        };
        
        console.log('🚀 Lancement du matchmaking RÉEL:', {
            mode: selectedGameMode,
            map: selectedMap === 'auto' ? null : selectedMap,
            options: options
        });
        
        // Utiliser le système de matchmaking RÉEL
        const queueId = await window.MatchmakingSystem.findMatch(
            selectedGameMode, 
            selectedMap === 'auto' ? null : selectedMap, 
            options
        );
        
        // Arrêter l'animation de chargement
        clearInterval(stepInterval);
        
        if (queueId) {
            console.log('✅ Rejoint la file d\'attente RÉELLE:', queueId);
            
            // Bouton de statut
            launchBtn.innerHTML = '<i class="fas fa-clock"></i> EN FILE D\'ATTENTE';
            launchBtn.classList.remove('loading');
            
            // Notification de succès
            NotificationSystem.show(
                'Recherche lancée',
                `Recherche de ${window.gameModes[selectedGameMode].name} en cours`,
                'success',
                3000
            );
            
            // Analytics
            trackMatchmakingStart(selectedGameMode, selectedMap, options);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du lancement:', error);
        
        // Restaurer le bouton avec animation d'erreur
        if (launchBtn) {
            launchBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ERREUR';
            launchBtn.disabled = false;
            launchBtn.classList.remove('loading');
            launchBtn.classList.add('error');
            
            showMessage(error.message || 'Impossible de lancer la partie', 'error');
            
            // Restaurer le bouton après 3 secondes
            setTimeout(() => {
                try {
                    launchBtn.classList.remove('error');
                    if (window.gameModes && window.gameModes[selectedGameMode]) {
                        const modeData = window.gameModes[selectedGameMode];
                        launchBtn.innerHTML = `<i class="fas fa-rocket"></i> RECHERCHER ${modeData.name.toUpperCase()}`;
                    } else {
                        launchBtn.innerHTML = '<i class="fas fa-rocket"></i> RECHERCHER UNE PARTIE';
                    }
                } catch (restoreError) {
                    console.error('Erreur restauration bouton:', restoreError);
                    launchBtn.innerHTML = '<i class="fas fa-rocket"></i> RECHERCHER UNE PARTIE';
                }
            }, 3000);
        }
    }
}

// Chargement des armes pour l'arsenal
function loadWeapons() {
    try {
        const weaponsGrid = document.getElementById('weapons-grid');
        if (!weaponsGrid) {
            console.warn('Grid d\'armes non trouvé');
            return;
        }

        // Utiliser les armes depuis gameState ou une source par défaut
        const weapons = window.gameState?.weapons || window.completeWeapons || getDefaultWeapons();
        const category = selectedWeaponCategory || 'rifles';
        
        weaponsGrid.innerHTML = '';
        
        if (!weapons[category]) {
            console.warn(`Catégorie d'armes ${category} non trouvée`);
            return;
        }

        weapons[category].forEach(weapon => {
            const weaponCard = createWeaponCard(weapon);
            weaponsGrid.appendChild(weaponCard);
        });

        console.log(`🔫 ${weapons[category].length} armes chargées pour ${category}`);
    } catch (error) {
        console.error('Erreur chargement armes:', error);
    }
}

// Créer une carte d'arme
function createWeaponCard(weapon) {
    const card = document.createElement('div');
    card.className = 'weapon-card';
    card.onclick = () => selectWeapon(weapon);

    const iconClass = getWeaponIcon(weapon.name);
    
    card.innerHTML = `
        <div class="weapon-icon">
            <i class="fas fa-${iconClass}"></i>
        </div>
        <h3 class="weapon-name">${weapon.name}</h3>
        <div class="weapon-price">${weapon.price ? '$' + weapon.price : 'Gratuit'}</div>
        <div class="weapon-stats">
            <div class="weapon-stat">
                <span class="stat-label">Dégâts</span>
                <span class="stat-value">${weapon.damage}</span>
            </div>
            <div class="weapon-stat">
                <span class="stat-label">Cadence</span>
                <span class="stat-value">${weapon.fireRate}</span>
            </div>
            <div class="weapon-stat">
                <span class="stat-label">Précision</span>
                <span class="stat-value">${weapon.accuracy}%</span>
            </div>
            <div class="weapon-stat">
                <span class="stat-label">Munitions</span>
                <span class="stat-value">${weapon.ammo}/${weapon.totalAmmo}</span>
            </div>
        </div>
    `;

    return card;
}

// Obtenir l'icône d'une arme
function getWeaponIcon(weaponName) {
    const icons = {
        'AK-47': 'bahai',
        'M4A4': 'crosshairs',
        'M4A1-S': 'crosshairs',
        'AWP': 'bullseye',
        'Glock-18': 'dot-circle',
        'USP-S': 'dot-circle',
        'Desert Eagle': 'circle',
        'Classic': 'dot-circle',
        'Phantom': 'crosshairs',
        'Vandal': 'crosshairs',
        'Operator': 'bullseye',
        'Sheriff': 'circle',
        'Ghost': 'dot-circle'
    };
    return icons[weaponName] || 'crosshairs';
}

// Sélectionner une arme
function selectWeapon(weapon) {
    try {
        // Désélectionner toutes les armes
        document.querySelectorAll('.weapon-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Sélectionner l'arme actuelle
        event.target.closest('.weapon-card').classList.add('selected');
        
        console.log('🔫 Arme sélectionnée:', weapon.name);
        
        // Afficher les détails de l'arme
        showWeaponDetails(weapon);
        
    } catch (error) {
        console.error('Erreur sélection arme:', error);
    }
}

// Afficher les détails d'une arme
function showWeaponDetails(weapon) {
    const detailsContainer = document.querySelector('.weapon-details');
    if (!detailsContainer) {
        // Créer le conteneur de détails
        const details = document.createElement('div');
        details.className = 'weapon-details';
        details.style.cssText = `
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        const weaponsGrid = document.getElementById('weapons-grid');
        if (weaponsGrid) {
            weaponsGrid.parentNode.appendChild(details);
        }
    }
    
    const details = document.querySelector('.weapon-details');
    if (details) {
        details.innerHTML = `
            <h3 style="color: #00d4ff; margin-bottom: 15px;">${weapon.name}</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class="stat-detailed">
                    <span class="stat-label">Dégâts:</span>
                    <span class="stat-value">${weapon.damage}</span>
                </div>
                <div class="stat-detailed">
                    <span class="stat-label">Cadence de tir:</span>
                    <span class="stat-value">${weapon.fireRate} RPM</span>
                </div>
                <div class="stat-detailed">
                    <span class="stat-label">Précision:</span>
                    <span class="stat-value">${weapon.accuracy}%</span>
                </div>
                <div class="stat-detailed">
                    <span class="stat-label">Prix:</span>
                    <span class="stat-value">${weapon.price ? '$' + weapon.price : 'Gratuit'}</span>
                </div>
            </div>
        `;
    }
}

// Changer de catégorie d'armes
function showWeaponCategory(category) {
    selectedWeaponCategory = category;
    
    // Mettre à jour l'interface
    document.querySelectorAll('.weapon-cat').forEach(cat => {
        cat.classList.remove('active');
    });
    
    document.querySelector(`[onclick*="${category}"]`).classList.add('active');
    
    // Recharger les armes
    loadWeapons();
}

// Obtenir les armes par défaut si aucune source n'est disponible
function getDefaultWeapons() {
    return {
        rifles: [
            { name: 'AK-47', damage: 36, fireRate: 600, accuracy: 73, price: 2700, ammo: 30, totalAmmo: 90 },
            { name: 'M4A4', damage: 33, fireRate: 666, accuracy: 75, price: 3100, ammo: 30, totalAmmo: 90 },
            { name: 'M4A1-S', damage: 38, fireRate: 600, accuracy: 78, price: 2900, ammo: 25, totalAmmo: 75 }
        ],
        pistols: [
            { name: 'Glock-18', damage: 28, fireRate: 400, accuracy: 56, price: 200, ammo: 20, totalAmmo: 120 },
            { name: 'USP-S', damage: 35, fireRate: 400, accuracy: 67, price: 200, ammo: 12, totalAmmo: 24 },
            { name: 'Desert Eagle', damage: 63, fireRate: 267, accuracy: 51, price: 700, ammo: 7, totalAmmo: 35 }
        ],
        smgs: [
            { name: 'MP9', damage: 26, fireRate: 857, accuracy: 62, price: 1250, ammo: 30, totalAmmo: 120 },
            { name: 'UMP-45', damage: 35, fireRate: 666, accuracy: 51, price: 1200, ammo: 25, totalAmmo: 100 }
        ],
        snipers: [
            { name: 'AWP', damage: 115, fireRate: 41, accuracy: 79, price: 4750, ammo: 10, totalAmmo: 30 },
            { name: 'Scout SSG 08', damage: 88, fireRate: 48, accuracy: 81, price: 1700, ammo: 10, totalAmmo: 90 }
        ],
        shotguns: [
            { name: 'Nova', damage: 26, fireRate: 68, accuracy: 51, price: 1050, ammo: 8, totalAmmo: 32 },
            { name: 'XM1014', damage: 20, fireRate: 240, accuracy: 79, price: 2000, ammo: 7, totalAmmo: 32 }
        ]
    };
}

// Chargement des amis
async function loadFriends() {
    try {
        const friendsList = document.getElementById('friends-list');
        if (!friendsList) {
            console.warn('Liste d\'amis non trouvée');
            return;
        }

        friendsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement des amis...</div>';

        if (!currentUser || !database || !database.ref) {
            friendsList.innerHTML = '<div class="no-friends">Connectez-vous pour voir vos amis</div>';
            return;
        }

        const friendsRef = database.ref(`users/${currentUser.uid}/friends`);
        const snapshot = await friendsRef.once('value');
        const friends = snapshot.val();

        friendsList.innerHTML = '';

        if (!friends || Object.keys(friends).length === 0) {
            friendsList.innerHTML = '<div class="no-friends">Aucun ami ajouté. Utilisez le champ ci-dessus pour ajouter des amis !</div>';
            return;
        }

        // Créer les cartes d'amis
        Object.entries(friends).forEach(([friendId, friendData]) => {
            const friendCard = createFriendCard(friendId, friendData);
            friendsList.appendChild(friendCard);
        });

        console.log(`👥 ${Object.keys(friends).length} amis chargés`);

    } catch (error) {
        console.error('Erreur chargement amis:', error);
        const friendsList = document.getElementById('friends-list');
        if (friendsList) {
            friendsList.innerHTML = '<div class="error">Erreur lors du chargement des amis</div>';
        }
    }
}

// Créer une carte d'ami
function createFriendCard(friendId, friendData) {
    const card = document.createElement('div');
    card.className = 'friend-card';
    
    const statusClass = friendData.status === 'online' ? 'online' : 
                       friendData.status === 'playing' ? 'playing' : 'offline';
    
    card.innerHTML = `
        <div class="friend-avatar">
            <i class="fas fa-${friendData.avatar || 'user'}"></i>
        </div>
        <div class="friend-info">
            <div class="friend-name">${friendData.displayName || 'Ami'}</div>
            <div class="friend-status ${statusClass}">
                <i class="fas fa-circle"></i>
                ${friendData.status === 'online' ? 'En ligne' : 
                  friendData.status === 'playing' ? 'En jeu' : 'Hors ligne'}
            </div>
            <div class="friend-rank">${friendData.rank || 'Fer I'} - Niv. ${friendData.level || 1}</div>
        </div>
        <div class="friend-actions">
            <button class="profile-btn" onclick="openProfileModal('${friendId}')" title="Voir le profil">
                <i class="fas fa-user"></i>
            </button>
            <button class="invite-btn" onclick="inviteFriend('${friendId}')" 
                    ${friendData.status !== 'online' ? 'disabled' : ''} title="Inviter en partie">
                <i class="fas fa-gamepad"></i>
            </button>
            <button class="remove-btn" onclick="removeFriend('${friendId}')" title="Retirer des amis">
                <i class="fas fa-user-times"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Inviter un ami en partie
async function inviteFriend(friendId) {
    try {
        if (!database || !database.ref) {
            showMessage('Service non disponible', 'error');
            return;
        }

        const invitation = {
            fromId: currentUser.uid,
            fromName: currentUser.displayName || currentUser.email.split('@')[0],
            gameMode: selectedGameMode,
            map: selectedMap,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        await database.ref(`users/${friendId}/invitations`).push(invitation);
        
        showMessage('Invitation envoyée !', 'success');
        
    } catch (error) {
        console.error('Erreur envoi invitation:', error);
        showMessage('Erreur lors de l\'envoi de l\'invitation', 'error');
    }
}

// Supprimer un ami
async function removeFriend(friendId) {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette personne de vos amis ?')) {
        return;
    }

    try {
        if (!database || !database.ref) {
            showMessage('Service non disponible', 'error');
            return;
        }

        // Supprimer de sa liste d'amis
        await database.ref(`users/${currentUser.uid}/friends/${friendId}`).remove();
        
        // Supprimer réciproquement
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).remove();
        
        showMessage('Ami supprimé', 'info');
        loadFriends(); // Recharger la liste
        
    } catch (error) {
        console.error('Erreur suppression ami:', error);
        showMessage('Erreur lors de la suppression', 'error');
    }
}

// Gestion du système d'amis avec recherche avancée
async function addFriend() {
    const usernameInput = document.getElementById('friend-username');
    if (!usernameInput) {
        console.error('Input ami non trouvé');
        return;
    }

    const username = usernameInput.value.trim();
    
    // Validation renforcée
    if (!username) {
        showMessage('Veuillez entrer un nom d\'utilisateur', 'error');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        showMessage('Le nom doit contenir entre 3 et 20 caractères', 'error');
        return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showMessage('Le nom ne peut contenir que des lettres, chiffres, _ et -', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Vous devez être connecté', 'error');
        return;
    }
    
    if (!database || !database.ref) {
        showMessage('Service non disponible', 'error');
        return;
    }
    
    try {
        // Animation de recherche
        const addButton = document.querySelector('.add-friend button');
        const originalHTML = addButton.innerHTML;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        addButton.disabled = true;
        
        // Rechercher l'utilisateur dans la base de données
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('displayName').equalTo(username).once('value');
        
        if (!snapshot.exists()) {
            showMessage('Utilisateur introuvable', 'error');
            return;
        }
        
        const userData = Object.values(snapshot.val())[0];
        const friendId = Object.keys(snapshot.val())[0];
        
        if (friendId === currentUser.uid) {
            showMessage('Vous ne pouvez pas vous ajouter vous-même', 'error');
            return;
        }
        
        // Vérifier les paramètres de confidentialité
        const privacy = userData.privacy || {};
        if (privacy.allowFriendRequests === false) {
            showMessage('Cet utilisateur n\'accepte pas les demandes d\'amis', 'error');
            return;
        }
        
        // Vérifier si l'ami n'est pas déjà ajouté
        const currentUserRef = database.ref(`users/${currentUser.uid}/friends/${friendId}`);
        const existingFriend = await currentUserRef.once('value');
        
        if (existingFriend.exists()) {
            showMessage('Cet utilisateur est déjà dans votre liste d\'amis', 'error');
            return;
        }
        
        // Ajouter l'ami avec informations complètes
        const friendPayload = {
            displayName: userData.displayName,
            avatar: userData.avatar || 'user',
            status: userData.status || 'offline',
            level: userData.level || 1,
            rank: userData.rank || 'Fer I',
            addedAt: firebase.database.ServerValue.TIMESTAMP,
            lastInteraction: firebase.database.ServerValue.TIMESTAMP
        };

        await currentUserRef.set(friendPayload);
        
        // Ajouter réciproquement
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).set({
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            avatar: 'user',
            status: 'online',
            level: 1,
            rank: 'Fer I',
            addedAt: firebase.database.ServerValue.TIMESTAMP,
            lastInteraction: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Envoyer une notification à l'ami
        await database.ref(`users/${friendId}/notifications`).push({
            type: 'friend_request_accepted',
            from: currentUser.uid,
            fromName: currentUser.displayName || currentUser.email.split('@')[0],
            message: 'Vous êtes maintenant amis !',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Animation de succès
        addButton.innerHTML = '<i class="fas fa-check"></i>';
        addButton.style.background = '#4ade80';
        
        showMessage('Ami ajouté avec succès !', 'success');
        usernameInput.value = '';
        
        setTimeout(() => {
            addButton.innerHTML = originalHTML;
            addButton.style.background = '';
            addButton.disabled = false;
        }, 2000);
        
        loadFriends();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'ami:', error);
        showMessage('Erreur lors de l\'ajout de l\'ami', 'error');
        
        // Restaurer le bouton
        const addButton = document.querySelector('.add-friend button');
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-user-plus"></i>';
            addButton.disabled = false;
        }
    }
}

// Recherche d'amis avec filtres
function searchFriends(searchTerm) {
    try {
        const friendCards = document.querySelectorAll('.friend-card');
        const results = [];
        
        friendCards.forEach(card => {
            const friendNameEl = card.querySelector('.friend-name');
            const friendStatusEl = card.querySelector('.friend-status');
            
            if (friendNameEl) {
                const friendName = friendNameEl.textContent.toLowerCase();
                const friendStatus = friendStatusEl ? friendStatusEl.textContent.toLowerCase() : '';
                
                const searchLower = searchTerm.toLowerCase();
                const nameMatch = friendName.includes(searchLower);
                const statusMatch = friendStatus.includes(searchLower);
                
                const shouldShow = nameMatch || statusMatch;
                
                card.style.display = shouldShow ? 'flex' : 'none';
                
                if (shouldShow) {
                    results.push(card);
                    
                    // Surligner les résultats
                    if (searchTerm.length > 0) {
                        highlightSearchTerm(friendNameEl, searchTerm);
                    } else {
                        removeHighlight(friendNameEl);
                    }
                }
            }
        });
        
        // Afficher le nombre de résultats
        updateSearchResults(results.length, searchTerm);
        
    } catch (error) {
        console.error('Erreur recherche amis:', error);
    }
}

function highlightSearchTerm(element, searchTerm) {
    const originalText = element.textContent;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = originalText.replace(regex, '<mark style="background: rgba(0,212,255,0.3); color: #00d4ff;">$1</mark>');
    element.innerHTML = highlightedText;
}

function removeHighlight(element) {
    element.innerHTML = element.textContent;
}

function updateSearchResults(count, searchTerm) {
    let resultsElement = document.getElementById('search-results-info');
    
    if (!resultsElement) {
        resultsElement = document.createElement('div');
        resultsElement.id = 'search-results-info';
        resultsElement.style.cssText = `
            padding: 10px;
            text-align: center;
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        
        const friendsList = document.getElementById('friends-list');
        if (friendsList) {
            friendsList.parentNode.insertBefore(resultsElement, friendsList);
        }
    }
    
    if (searchTerm.length > 0) {
        resultsElement.textContent = `${count} résultat${count > 1 ? 's' : ''} pour "${searchTerm}"`;
        resultsElement.style.display = 'block';
    } else {
        resultsElement.style.display = 'none';
    }
}

// Système de classements
function switchLeaderboardTab(type) {
    currentLeaderboardType = type;
    
    // Mettre à jour l'interface
    document.querySelectorAll('.leaderboard-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[onclick*="${type}"]`).classList.add('active');
    
    // Charger les données
    loadLeaderboard(type);
}

// Chargement du classement
async function loadLeaderboard(type) {
    const content = document.getElementById('leaderboard-content');
    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement du classement...</div>';
    
    try {
        if (!database || !database.ref) {
            content.innerHTML = '<div class="error">Service non disponible</div>';
            return;
        }

        // Récupérer tous les utilisateurs avec leurs statistiques
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};
        
        // Filtrer et trier selon le type de classement
        const sortedUsers = Object.entries(users)
            .filter(([id, data]) => {
                // Exclure les utilisateurs sans statistiques ou avec confidentialité privée
                const privacy = data.privacy || {};
                return (privacy.publicStats !== false) && data.stats;
            })
            .map(([id, data]) => ({
                id,
                name: data.displayName || 'Joueur',
                avatar: data.avatar || 'user',
                rank: data.rank || 'Fer I',
                level: data.level || 1,
                value: getLeaderboardValue(data.stats || {}, type),
                status: data.status || 'offline'
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100); // Top 100
        
        // Afficher le classement
        content.innerHTML = '';
        
        if (sortedUsers.length === 0) {
            content.innerHTML = '<div class="no-data">Aucune donnée disponible pour ce classement</div>';
            return;
        }
        
        sortedUsers.forEach((user, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = `leaderboard-entry ${user.id === currentUser?.uid ? 'current-user' : ''}`;
            playerElement.onclick = () => openProfileModal(user.id);
            
            // Icône spéciale pour le podium
            let rankDisplay;
            if (index === 0) {
                rankDisplay = '<i class="fas fa-crown rank-1"></i>';
            } else if (index === 1) {
                rankDisplay = '<i class="fas fa-medal rank-2"></i>';
            } else if (index === 2) {
                rankDisplay = '<i class="fas fa-medal rank-3"></i>';
            } else {
                rankDisplay = `#${index + 1}`;
            }
            
            playerElement.innerHTML = `
                <div class="rank-position">${rankDisplay}</div>
                <div class="player-avatar">
                    <i class="fas fa-${user.avatar}"></i>
                    <div class="player-status ${user.status}"></div>
                </div>
                <div class="player-info">
                    <div class="player-name">${user.name}</div>
                    <div class="player-rank">${user.rank} (Niv. ${user.level})</div>
                </div>
                <div class="player-value">${formatLeaderboardValue(user.value, type)}</div>
            `;
            
            content.appendChild(playerElement);
        });
        
    } catch (error) {
        console.error('Erreur chargement classement:', error);
        content.innerHTML = '<div class="error">Erreur lors du chargement du classement</div>';
    }
}

// Obtenir la valeur pour le classement selon le type
function getLeaderboardValue(stats, type) {
    switch (type) {
        case 'competitive':
        case 'kills':
            return stats.kills || 0;
        case 'wins':
            return stats.wins || 0;
        case 'kd':
            const kills = stats.kills || 0;
            const deaths = stats.deaths || 0;
            return deaths > 0 ? kills / deaths : kills;
        case 'level':
            return stats.level || 1;
        default:
            return 0;
    }
}

// Formater la valeur pour l'affichage du classement
function formatLeaderboardValue(value, type) {
    switch (type) {
        case 'kd':
            return value.toFixed(2);
        case 'level':
            return `Niv. ${value}`;
        default:
            return value.toString();
    }
}

// Charger les paramètres actuels
function loadCurrentSettings() {
    if (window.AppState && window.AppState.gameSettings) {
        const settings = window.AppState.gameSettings;
        
        // Mettre à jour les sliders
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const setting = slider.getAttribute('data-setting');
            if (settings[setting] !== undefined) {
                slider.value = settings[setting] * (setting.includes('Volume') ? 100 : 1);
                updateSliderDisplay({ target: slider });
            }
        });
        
        // Mettre à jour les selects
        document.querySelectorAll('select[data-setting]').forEach(select => {
            const setting = select.getAttribute('data-setting');
            if (settings[setting] !== undefined) {
                select.value = settings[setting];
            }
        });
        
        // Mettre à jour les checkboxes
        document.querySelectorAll('input[type="checkbox"][data-setting]').forEach(checkbox => {
            const setting = checkbox.getAttribute('data-setting');
            if (settings[setting] !== undefined) {
                checkbox.checked = settings[setting];
            }
        });
    }
}

// Mise à jour de l'affichage des sliders
function updateSliderDisplay(e) {
    const slider = e.target;
    const setting = slider.getAttribute('data-setting');
    let displayValue = slider.value;
    
    if (setting && setting.includes('Volume')) {
        displayValue += '%';
        const valueSpan = slider.parentNode.querySelector('.volume-value');
        if (valueSpan) valueSpan.textContent = displayValue;
        
        // Mettre à jour les paramètres
        if (window.AppState && window.AppState.gameSettings) {
            window.AppState.gameSettings[setting] = slider.value / 100;
            if (window.applySettings) window.applySettings();
        }
    } else if (setting === 'mouseSensitivity') {
        const valueSpan = slider.parentNode.querySelector('.sensitivity-value');
        if (valueSpan) valueSpan.textContent = displayValue;
        
        // Mettre à jour les paramètres
        if (window.AppState && window.AppState.gameSettings) {
            window.AppState.gameSettings[setting] = parseInt(slider.value);
            if (window.applySettings) window.applySettings();
        }
    }
}

// Configuration des listeners de paramètres
function setupSettingsListeners() {
    // Sliders
    document.querySelectorAll('input[type="range"][data-setting]').forEach(slider => {
        slider.addEventListener('input', updateSliderDisplay);
        slider.addEventListener('change', saveSettings);
    });
    
    // Selects
    document.querySelectorAll('select[data-setting]').forEach(select => {
        select.addEventListener('change', (e) => {
            const setting = e.target.getAttribute('data-setting');
            if (window.AppState && window.AppState.gameSettings) {
                window.AppState.gameSettings[setting] = e.target.value;
                if (window.applySettings) window.applySettings();
                saveSettings();
            }
        });
    });
    
    // Checkboxes
    document.querySelectorAll('input[type="checkbox"][data-setting]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const setting = e.target.getAttribute('data-setting');
            if (window.AppState && window.AppState.gameSettings) {
                window.AppState.gameSettings[setting] = e.target.checked;
                if (window.applySettings) window.applySettings();
                saveSettings();
            }
        });
    });
}

// Sauvegarder les paramètres
function saveSettings() {
    if (window.AppState && window.AppState.gameSettings) {
        localStorage.setItem('sioshooter_settings', JSON.stringify(window.AppState.gameSettings));
        
        // Sauvegarder dans Firebase si connecté
        if (currentUser && database && database.ref) {
            database.ref(`users/${currentUser.uid}/settings`).set(window.AppState.gameSettings);
        }
    }
}

// Analytics et suivi
function trackSectionVisit(section, previousSection) {
    console.log(`📊 Navigation: ${previousSection} → ${section}`);
    // Ici on pourrait envoyer les données à un service d'analytics
}

function trackModeSelection(mode) {
    console.log(`📊 Mode sélectionné: ${mode}`);
}

function trackMapSelection(map) {
    console.log(`📊 Carte sélectionnée: ${map}`);
}

function trackMatchmakingStart(mode, map, options) {
    console.log(`📊 Matchmaking lancé:`, { mode, map, options });
}

// Fonctions utilitaires
function saveGameModePreference(mode) {
    localStorage.setItem('preferred_game_mode', mode);
}

function loadGameModePreference() {
    return localStorage.getItem('preferred_game_mode') || 'competitive';
}

function focusSearch() {
    const searchInput = document.getElementById('friend-search');
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('friend-search');
    if (searchInput) {
        // Recherche en temps réel avec debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchFriends(e.target.value);
            }, 300);
        });
        
        // Raccourci Ctrl+F pour focus
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                searchFriends('');
                e.target.blur();
            }
        });
    }
}

function initializeAnimations() {
    // CSS pour les animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .section-enter {
            animation: sectionSlideIn 0.3s ease;
        }
        
        .section-exit {
            animation: sectionSlideOut 0.2s ease;
        }
        
        @keyframes sectionSlideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes sectionSlideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-20px);
            }
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes ripple {
            to {
                width: 100px;
                height: 100px;
                opacity: 0;
            }
        }
        
        .launch-game-btn.loading {
            background: linear-gradient(45deg, #4ade80, #22c55e);
            cursor: not-allowed;
        }
        
        .launch-game-btn.error {
            background: linear-gradient(45deg, #ef4444, #dc2626);
            animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 20%, 40%, 60%, 80%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        }
        
        .debug-mode .menu-section {
            border: 2px dashed #ff0000;
            position: relative;
        }
        
        .debug-mode .menu-section::before {
            content: attr(id);
            position: absolute;
            top: -10px;
            left: 10px;
            background: #ff0000;
            color: white;
            padding: 2px 8px;
            font-size: 10px;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(animationStyles);
}

// Message amélioré avec animations
function showMessage(message, type = 'info', duration = 3000) {
    // Utiliser le système de notifications global
    if (window.NotificationSystem) {
        window.NotificationSystem.show('Menu', message, type, duration);
    } else {
        // Fallback
        console.log(`${type.toUpperCase()}: ${message}`);
        alert(message);
    }
}

// Rendre les fonctions globales accessibles
window.showMenuSection = showMenuSection;
window.selectGameMode = selectGameMode;
window.selectMap = selectMap;
window.launchGame = launchGame;
window.addFriend = addFriend;
window.searchFriends = searchFriends;
window.inviteFriend = inviteFriend;
window.removeFriend = removeFriend;
window.showWeaponCategory = showWeaponCategory;
window.switchLeaderboardTab = switchLeaderboardTab;
window.reconnectToMatch = reconnectToMatch;

console.log('✅ Menu système COMPLET chargé avec toutes les fonctionnalités corrigées !');