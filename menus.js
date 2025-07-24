// Système de navigation des menus avec intégration profils

// Variables globales pour les menus
let currentMenuSection = 'play';
let selectedGameMode = 'deathmatch';
let selectedMap = 'dust2';
let selectedWeaponCategory = 'rifles';

// Initialisation des menus
document.addEventListener('DOMContentLoaded', () => {
    loadWeapons();
    setupMenuEventListeners();
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
        case 'leaderboard':
            // Charger le classement par défaut (kills)
            switchLeaderboardTab('kills');
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

// Gestion du système d'amis amélioré
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
        
        // Vérifier les paramètres de confidentialité de l'ami
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
        
        // Ajouter l'ami
        await currentUserRef.set({
            displayName: userData.displayName,
            email: userData.email,
            avatar: userData.avatar || 'user',
            status: userData.status || 'offline',
            addedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Ajouter réciproquement
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).set({
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            avatar: 'user', // Récupérer l'avatar de l'utilisateur actuel
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

// Chargement de la liste d'amis amélioré
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
        
        // Récupérer le statut en temps réel des amis
        for (const friendId of Object.keys(friends)) {
            const friend = friends[friendId];
            
            // Écouter les changements de statut
            database.ref(`users/${friendId}/status`).on('value', (statusSnapshot) => {
                const status = statusSnapshot.val() || 'offline';
                updateFriendStatus(friendId, status);
            });
            
            createFriendCard(friendId, friend);
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des amis:', error);
        friendsList.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement des amis</p>';
    }
}

// Création d'une carte d'ami améliorée
function createFriendCard(friendId, friendData) {
    const friendsList = document.getElementById('friends-list');
    
    const friendCard = document.createElement('div');
    friendCard.className = 'friend-card';
    friendCard.id = `friend-${friendId}`;
    
    // Faire que la carte soit cliquable pour ouvrir le profil
    friendCard.style.cursor = 'pointer';
    friendCard.addEventListener('click', (e) => {
        // Éviter d'ouvrir le profil si on clique sur les boutons d'action
        if (!e.target.closest('.friend-actions')) {
            openProfileModal(friendId);
        }
    });
    
    friendCard.innerHTML = `
        <div class="friend-avatar">
            <i class="fas fa-${friendData.avatar || 'user'}"></i>
        </div>
        <div class="friend-info">
            <div class="friend-name">${friendData.displayName}</div>
            <div class="friend-status ${friendData.status || 'offline'}" id="status-${friendId}">
                <i class="fas fa-circle"></i> ${getStatusText(friendData.status || 'offline')}
            </div>
        </div>
        <div class="friend-actions">
            <button onclick="openProfileModal('${friendId}')" class="profile-btn" title="Voir le profil">
                <i class="fas fa-user"></i>
            </button>
            <button onclick="inviteFriend('${friendId}')" class="invite-btn" ${(friendData.status || 'offline') !== 'online' ? 'disabled' : ''} title="Inviter en partie">
                <i class="fas fa-gamepad"></i>
            </button>
            <button onclick="removeFriend('${friendId}')" class="remove-btn" title="Supprimer ami">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    friendsList.appendChild(friendCard);
}

// Mise à jour du statut d'un ami
function updateFriendStatus(friendId, status) {
    const statusElement = document.getElementById(`status-${friendId}`);
    if (statusElement) {
        statusElement.className = `friend-status ${status}`;
        statusElement.innerHTML = `<i class="fas fa-circle"></i> ${getStatusText(status)}`;
    }
    
    // Activer/désactiver le bouton d'invitation
    const inviteButton = document.querySelector(`#friend-${friendId} .invite-btn`);
    if (inviteButton) {
        inviteButton.disabled = status !== 'online';
    }
}

// Obtenir le texte du statut
function getStatusText(status) {
    switch(status) {
        case 'online': return 'En ligne';
        case 'playing': return 'En partie';
        case 'away': return 'Absent';
        default: return 'Hors ligne';
    }
}

// Invitation d'un ami
async function inviteFriend(friendId) {
    if (!currentUser) return;
    
    try {
        // Vérifier si l'utilisateur est en ligne
        const friendRef = database.ref(`users/${friendId}/status`);
        const statusSnapshot = await friendRef.once('value');
        const status = statusSnapshot.val();
        
        if (status !== 'online') {
            showMessage('Cet ami n\'est pas en ligne', 'error');
            return;
        }
        
        // Créer une invitation de partie
        const invitationRef = database.ref(`users/${friendId}/invitations`).push();
        await invitationRef.set({
            from: currentUser.uid,
            fromName: currentUser.displayName || currentUser.email.split('@')[0],
            type: 'game_invite',
            gameMode: selectedGameMode,
            map: selectedMap,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        showMessage('Invitation envoyée !', 'success');
        
    } catch (error) {
        console.error('Erreur invitation ami:', error);
        showMessage('Erreur lors de l\'envoi de l\'invitation', 'error');
    }
}

// Suppression d'un ami
async function removeFriend(friendId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) return;
    
    try {
        // Supprimer de ma liste
        await database.ref(`users/${currentUser.uid}/friends/${friendId}`).remove();
        
        // Supprimer de sa liste
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).remove();
        
        // Arrêter d'écouter les changements de statut
        database.ref(`users/${friendId}/status`).off();
        
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
                <div class="weapon-stat">
                    <span class="stat-label">DMG</span>
                    <span class="stat-value">${weapon.damage}</span>
                </div>
                <div class="weapon-stat">
                    <span class="stat-label">ACC</span>
                    <span class="stat-value">${weapon.accuracy}%</span>
                </div>
                <div class="weapon-stat">
                    <span class="stat-label">Prix</span>
                    <span class="stat-value">$${weapon.price}</span>
                </div>
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

// Mise à jour du statut en ligne amélioré
function updateOnlineStatus() {
    if (!currentUser) return;
    
    const statusRef = database.ref(`users/${currentUser.uid}/status`);
    
    // Marquer comme en ligne
    statusRef.set('online');
    
    // Marquer comme hors ligne lors de la déconnexion
    statusRef.onDisconnect().set('offline');
    
    // Mettre à jour le statut quand l'utilisateur change d'onglet
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            statusRef.set('away');
        } else {
            statusRef.set('online');
        }
    });
}

// Recherche d'amis par nom
async function searchFriends(searchTerm) {
    if (!searchTerm.trim()) {
        loadFriends();
        return;
    }
    
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('displayName')
            .startAt(searchTerm)
            .endAt(searchTerm + '\uf8ff')
            .once('value');
        
        const users = snapshot.val() || {};
        const friendsList = document.getElementById('friends-list');
        friendsList.innerHTML = '';
        
        Object.entries(users).forEach(([userId, userData]) => {
            if (userId !== currentUser.uid) {
                const userCard = document.createElement('div');
                userCard.className = 'friend-card search-result';
                userCard.innerHTML = `
                    <div class="friend-avatar">
                        <i class="fas fa-${userData.avatar || 'user'}"></i>
                    </div>
                    <div class="friend-info">
                        <div class="friend-name">${userData.displayName}</div>
                        <div class="friend-status ${userData.status || 'offline'}">
                            <i class="fas fa-circle"></i> ${getStatusText(userData.status || 'offline')}
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button onclick="openProfileModal('${userId}')" class="profile-btn">
                            <i class="fas fa-user"></i>
                        </button>
                        <button onclick="addSpecificFriend('${userId}')" class="add-btn">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    </div>
                `;
                friendsList.appendChild(userCard);
            }
        });
        
        if (Object.keys(users).length <= 1) {
            friendsList.innerHTML = '<div class="no-results">Aucun utilisateur trouvé</div>';
        }
        
    } catch (error) {
        console.error('Erreur recherche amis:', error);
    }
}

// Ajouter un ami spécifique trouvé par la recherche
async function addSpecificFriend(friendId) {
    try {
        const friendRef = database.ref(`users/${friendId}`);
        const snapshot = await friendRef.once('value');
        const friendData = snapshot.val();
        
        if (!friendData) {
            showMessage('Utilisateur introuvable', 'error');
            return;
        }
        
        // Vérifier si pas déjà ami
        const currentUserFriendsRef = database.ref(`users/${currentUser.uid}/friends/${friendId}`);
        const existingFriend = await currentUserFriendsRef.once('value');
        
        if (existingFriend.exists()) {
            showMessage('Cet utilisateur est déjà votre ami', 'error');
            return;
        }
        
        // Ajouter l'ami
        await currentUserFriendsRef.set({
            displayName: friendData.displayName,
            email: friendData.email,
            avatar: friendData.avatar || 'user',
            status: friendData.status || 'offline',
            addedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Ajouter réciproquement
        await database.ref(`users/${friendId}/friends/${currentUser.uid}`).set({
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            email: currentUser.email,
            avatar: 'user',
            status: 'online',
            addedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        showMessage('Ami ajouté avec succès !', 'success');
        loadFriends();
        
    } catch (error) {
        console.error('Erreur ajout ami:', error);
        showMessage('Erreur lors de l\'ajout', 'error');
    }
}

// CSS supplémentaire pour les nouvelles fonctionnalités
const additionalMenuStyles = document.createElement('style');
additionalMenuStyles.textContent = `
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
    
    .weapon-stats {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }
    
    .weapon-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
    }
    
    .stat-label {
        color: rgba(255, 255, 255, 0.7);
        font-size: 10px;
        margin-bottom: 2px;
    }
    
    .stat-value {
        color: #00d4ff;
        font-weight: bold;
    }
    
    .no-friends {
        text-align: center;
        padding: 60px 20px;
        grid-column: 1 / -1;
    }
    
    .friend-actions {
        display: flex;
        gap: 8px;
    }
    
    .profile-btn, .invite-btn, .remove-btn, .add-btn {
        width: 35px;
        height: 35px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }
    
    .profile-btn {
        background: rgba(0, 212, 255, 0.2);
        color: #00d4ff;
        border: 1px solid #00d4ff;
    }
    
    .profile-btn:hover {
        background: #00d4ff;
        color: white;
    }
    
    .invite-btn {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid #22c55e;
    }
    
    .invite-btn:hover:not(:disabled) {
        background: #22c55e;
        color: white;
    }
    
    .invite-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .add-btn {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
        border: 1px solid #22c55e;
    }
    
    .add-btn:hover {
        background: #22c55e;
        color: white;
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
    
    .friend-status.playing {
        color: #f59e0b;
    }
    
    .friend-status.away {
        color: #f97316;
    }
    
    .friend-status.offline {
        color: rgba(255, 255, 255, 0.5);
    }
    
    .friend-status i {
        font-size: 8px;
    }
    
    .search-result {
        border-left: 3px solid #00d4ff;
    }
    
    .no-results {
        text-align: center;
        padding: 40px 20px;
        color: rgba(255, 255, 255, 0.7);
        grid-column: 1 / -1;
    }
    
    @keyframes buttonSuccess {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .launch-game-btn:not(:disabled):active {
        animation: buttonSuccess 0.3s ease;
    }
`;
document.head.appendChild(additionalMenuStyles);

// Initialiser le statut en ligne quand l'utilisateur se connecte
auth.onAuthStateChanged((user) => {
    if (user) {
        updateOnlineStatus();
    }
});
