// Système de navigation des menus

// Variables globales pour les menus
let currentMenuSection = 'play';
let selectedGameMode = 'deathmatch';
let selectedMap = 'dust2';
let selectedWeaponCategory = 'rifles';

// Initialisation des menus
document.addEventListener('DOMContentLoaded', () => {
    loadWeapons();
    loadFriends();
    setupMenuEventListeners();

    // Ajout rapide d'amis avec la touche Entrée
    const friendInput = document.getElementById('friend-username');
    if (friendInput) {
        friendInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                addFriend();
            }
        });
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
});

// Configuration des écouteurs d'événements
function setupMenuEventListeners() {
    // Navigation du menu principal
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.closest('.nav-btn').getAttribute('onclick').match(/'(.+)'/)[1];
            showMenuSection(section);
        });
    });
}

// Affichage des sections de menu
function showMenuSection(section) {
    // Cacher toutes les sections
    document.querySelectorAll('.menu-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Retirer la classe active de tous les boutons de navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Activer le bouton correspondant
    document.querySelector(`.nav-btn[onclick*="${section}"]`).classList.add('active');
    
    currentMenuSection = section;
    
    // Actions spécifiques selon la section
    switch(section) {
        case 'friends':
            loadFriends();
            break;
        case 'arsenal':
            loadWeapons();
            break;
    }
}

// Sélection du mode de jeu
function selectGameMode(mode) {
    // Retirer la sélection précédente
    document.querySelectorAll('.game-mode').forEach(modeEl => {
        modeEl.classList.remove('selected');
    });
    
    // Sélectionner le nouveau mode
    event.target.closest('.game-mode').classList.add('selected');
    selectedGameMode = mode;
    
    console.log('Mode de jeu sélectionné:', mode);
}

// Sélection de la carte
function selectMap(map) {
    // Retirer la sélection précédente
    document.querySelectorAll('.map-card').forEach(mapEl => {
        mapEl.classList.remove('active');
    });
    
    // Sélectionner la nouvelle carte
    event.target.closest('.map-card').classList.add('active');
    selectedMap = map;
    
    console.log('Carte sélectionnée:', map);
}

// Lancement du jeu
async function launchGame() {
    const launchBtn = document.querySelector('.launch-game-btn');
    
    try {
        // Animation du bouton
        launchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> RECHERCHE DE PARTIE...';
        launchBtn.disabled = true;
        
        // Simulation de recherche de partie
        console.log('Lancement du jeu:', {
            mode: selectedGameMode,
            map: selectedMap
        });
        
        // Rechercher une partie
        const matchId = await findMatch(selectedGameMode, selectedMap);
        
        if (matchId) {
            launchBtn.innerHTML = '<i class="fas fa-gamepad"></i> PARTIE TROUVÉE !';
            
            // Attendre un moment avant de démarrer
            setTimeout(() => {
                initializeGame();
                showGameScreen();
            }, 2000);
        } else {
            throw new Error('Impossible de trouver une partie');
        }
        
    } catch (error) {
        console.error('Erreur lors du lancement:', error);
        launchBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ERREUR';
        showMessage('Impossible de lancer la partie', 'error');
        
        // Restaurer le bouton après 3 secondes
        setTimeout(() => {
            launchBtn.innerHTML = '<i class="fas fa-rocket"></i> LANCER LA PARTIE';
            launchBtn.disabled = false;
        }, 3000);
    }
}

// Gestion du système d'amis
async function addFriend() {
    const usernameInput = document.getElementById('friend-username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        showMessage('Veuillez entrer un nom d\'utilisateur', 'error');
        return;
    }
    
    if (!currentUser) {
        showMessage('Vous devez être connecté', 'error');
        return;
    }
    
    try {
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
        
        // Vérifier si l'ami n'est pas déjà ajouté
        const currentUserRef = database.ref(`users/${currentUser.uid}/friends/${friendId}`);
        const existingFriend = await currentUserRef.once('value');
        
        if (existingFriend.exists()) {
            showMessage('Cet utilisateur est déjà dans votre liste d\'amis', 'error');
            return;
        }
        
        // Ajouter l'ami
        await currentUserRef.set({
            displayName: userData.displayName,
            email: userData.email,
            status: 'offline',
            addedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Ajouter réciproquement
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).set({
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            status: 'online',
            addedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        showMessage('Ami ajouté avec succès !', 'success');
        usernameInput.value = '';
        loadFriends();
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout d\'ami:', error);
        showMessage('Erreur lors de l\'ajout de l\'ami', 'error');
    }
}

// Chargement de la liste d'amis
async function loadFriends() {
    if (!currentUser) return;
    
    const friendsList = document.getElementById('friends-list');
    
    try {
        const friendsRef = database.ref(`users/${currentUser.uid}/friends`);
        const snapshot = await friendsRef.once('value');
        
        friendsList.innerHTML = '';
        
        if (!snapshot.exists()) {
            friendsList.innerHTML = `
                <div class="no-friends">
                    <i class="fas fa-user-friends" style="font-size: 48px; color: rgba(255,255,255,0.3); margin-bottom: 20px;"></i>
                    <p style="color: rgba(255,255,255,0.7);">Aucun ami pour le moment</p>
                    <p style="color: rgba(255,255,255,0.5); font-size: 14px;">Ajoutez des amis pour jouer ensemble !</p>
                </div>
            `;
            return;
        }
        
        const friends = snapshot.val();
        Object.keys(friends).forEach(friendId => {
            const friend = friends[friendId];
            createFriendCard(friendId, friend);
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des amis:', error);
        friendsList.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement des amis</p>';
    }
}

// Création d'une carte d'ami
function createFriendCard(friendId, friendData) {
    const friendsList = document.getElementById('friends-list');
    
    const friendCard = document.createElement('div');
    friendCard.className = 'friend-card';
    friendCard.innerHTML = `
        <div class="friend-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="friend-info">
            <div class="friend-name">${friendData.displayName}</div>
            <div class="friend-status ${friendData.status || 'offline'}">
                <i class="fas fa-circle"></i> ${friendData.status === 'online' ? 'En ligne' : 'Hors ligne'}
            </div>
        </div>
        <div class="friend-actions">
            <button onclick="inviteFriend('${friendId}')" class="invite-btn" ${friendData.status !== 'online' ? 'disabled' : ''}>
                <i class="fas fa-gamepad"></i>
            </button>
            <button onclick="removeFriend('${friendId}')" class="remove-btn">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    friendsList.appendChild(friendCard);
}

// Invitation d'un ami
async function inviteFriend(friendId) {
    // TODO: Implémenter le système d'invitation
    showMessage('Invitation envoyée !', 'success');
}

// Suppression d'un ami
async function removeFriend(friendId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) return;
    
    try {
        // Supprimer de ma liste
        await database.ref(`users/${currentUser.uid}/friends/${friendId}`).remove();
        
        // Supprimer de sa liste
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).remove();
        
        showMessage('Ami supprimé', 'success');
        loadFriends();
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showMessage('Erreur lors de la suppression', 'error');
    }
}

// Gestion de l'arsenal
function showWeaponCategory(category) {
    // Retirer la sélection précédente
    document.querySelectorAll('.weapon-cat').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Sélectionner la nouvelle catégorie
    event.target.classList.add('active');
    selectedWeaponCategory = category;
    
    loadWeapons();
}

// Chargement des armes
function loadWeapons() {
    const weaponsGrid = document.getElementById('weapons-grid');
    const weapons = gameState.weapons[selectedWeaponCategory] || [];
    
    weaponsGrid.innerHTML = '';
    
    weapons.forEach(weapon => {
        const weaponCard = document.createElement('div');
        weaponCard.className = 'weapon-card';
        weaponCard.innerHTML = `
            <div class="weapon-icon">
                <i class="fas fa-crosshairs"></i>
            </div>
            <div class="weapon-name">${weapon.name}</div>
            <div class="weapon-stats">
                <div>DMG: ${weapon.damage}</div>
                <div>ACC: ${weapon.accuracy}%</div>
                <div>$${weapon.price}</div>
            </div>
        `;
        
        weaponCard.addEventListener('click', () => selectWeapon(weapon));
        weaponsGrid.appendChild(weaponCard);
    });
}

// Sélection d'une arme
function selectWeapon(weapon) {
    console.log('Arme sélectionnée:', weapon);
    showMessage(`${weapon.name} sélectionné`, 'success');
    
    // Retirer la sélection précédente
    document.querySelectorAll('.weapon-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Sélectionner la nouvelle arme
    event.target.closest('.weapon-card').classList.add('selected');
}

// Mise à jour du statut en ligne
function updateOnlineStatus() {
    if (!currentUser) return;
    
    const statusRef = database.ref(`users/${currentUser.uid}/status`);
    
    // Marquer comme en ligne
    statusRef.set('online');
    
    // Marquer comme hors ligne lors de la déconnexion
    statusRef.onDisconnect().set('offline');
}

function initializeProfileSettings() {
    if (!currentUser) return;

    const usernameInput = document.getElementById('profile-username');
    const emailInput = document.getElementById('profile-email');
    const passwordInput = document.getElementById('profile-password');
    const saveBtn = document.getElementById('save-profile-btn');

    if (!usernameInput || !emailInput || !passwordInput || !saveBtn) return;

    usernameInput.value = currentUser.displayName || '';
    emailInput.value = currentUser.email || '';

    const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');

    [usernameInput, emailInput, passwordInput, saveBtn].forEach(el => {
        el.disabled = isGoogle;
    });
}

async function saveProfile() {
    if (!currentUser) return;

    const username = document.getElementById('profile-username').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    const password = document.getElementById('profile-password').value;

    const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
    if (isGoogle) {
        showMessage('Modification désactivée pour les comptes Google', 'error');
        return;
    }

    try {
        if (username && username !== currentUser.displayName) {
            await currentUser.updateProfile({ displayName: username });
            await saveUserData({ displayName: username });
        }

        if (email && email !== currentUser.email) {
            await currentUser.updateEmail(email);
            await saveUserData({ email: email });
        }

        if (password) {
            await currentUser.updatePassword(password);
            document.getElementById('profile-password').value = '';
        }

        document.getElementById('current-username').textContent =
            currentUser.displayName || currentUser.email.split('@')[0];

        showMessage('Profil mis à jour', 'success');
    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        showMessage('Erreur lors de la mise à jour du profil', 'error');
    }
}

// CSS supplémentaire pour les nouvelles fonctionnalités
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .game-mode.selected {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    
    .weapon-card.selected {
        background: rgba(0, 212, 255, 0.2);
        border-color: #00d4ff;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    
    .no-friends {
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
    }
    
    .friend-actions {
        display: flex;
        gap: 10px;
    }
    
    .invite-btn, .remove-btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .invite-btn {
        background: rgba(0, 212, 255, 0.2);
        color: #00d4ff;
        border: 1px solid #00d4ff;
    }
    
    .invite-btn:hover:not(:disabled) {
        background: #00d4ff;
        color: white;
    }
    
    .invite-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .remove-btn {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border: 1px solid #ef4444;
    }
    
    .remove-btn:hover {
        background: #ef4444;
        color: white;
    }
    
    .friend-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
    }
    
    .friend-status.online {
        color: #4ade80;
    }
    
    .friend-status.offline {
        color: rgba(255, 255, 255, 0.5);
    }
    
    .friend-status i {
        font-size: 8px;
    }
    
    @keyframes buttonSuccess {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .launch-game-btn:not(:disabled):active {
        animation: buttonSuccess 0.3s ease;
    }
`;
document.head.appendChild(additionalStyles);

// Initialiser le statut en ligne quand l'utilisateur se connecte
auth.onAuthStateChanged((user) => {
    if (user) {
        updateOnlineStatus();
        initializeProfileSettings();
    }
});

console.log('Système de menus initialisé');