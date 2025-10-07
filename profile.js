// Système de profils et statistiques avec Firebase

// Variables globales pour les profils
let currentProfileId = null;
let selectedAvatar = 'user';
let currentProfileLeaderboardType = 'kills';

// Définition des succès disponibles
const achievements = {
    first_kill: {
        name: 'Premier sang',
        description: 'Éliminer votre premier ennemi',
        icon: 'crosshairs',
        requirement: { stat: 'kills', value: 1 }
    },
    kill_spree: {
        name: 'Machine de guerre',
        description: 'Faire 10 éliminations en une partie',
        icon: 'fire',
        requirement: { stat: 'killsInMatch', value: 10 }
    },
    headshot_master: {
        name: 'Maître du headshot',
        description: 'Réaliser 100 headshots',
        icon: 'bullseye',
        requirement: { stat: 'headshots', value: 100 }
    },
    ace: {
        name: 'ACE!',
        description: 'Éliminer toute l\'équipe adverse en un round',
        icon: 'crown',
        requirement: { stat: 'aces', value: 1 }
    },
    sharpshooter: {
        name: 'Tireur d\'élite',
        description: 'Atteindre 80% de précision sur 100 tirs',
        icon: 'target',
        requirement: { stat: 'accuracy', value: 80 }
    },
    win_streak: {
        name: 'Série de victoires',
        description: 'Gagner 5 parties consécutives',
        icon: 'trophy',
        requirement: { stat: 'winStreak', value: 5 }
    },
    veteran: {
        name: 'Vétéran',
        description: 'Jouer 100 parties',
        icon: 'medal',
        requirement: { stat: 'gamesPlayed', value: 100 }
    },
    sniper: {
        name: 'Sniper d\'élite',
        description: 'Faire 50 éliminations avec l\'AWP',
        icon: 'crosshairs',
        requirement: { stat: 'awpKills', value: 50 }
    },
    rampage: {
        name: 'Rampage',
        description: 'Faire 1000 éliminations au total',
        icon: 'skull',
        requirement: { stat: 'kills', value: 1000 }
    },
    champion: {
        name: 'Champion',
        description: 'Atteindre le rang Immortel',
        icon: 'gem',
        requirement: { stat: 'rank', value: 'Immortel' }
    }
};

// Système de rangs et niveaux
const ranks = [
    { name: 'Fer I', xpRequired: 0 },
    { name: 'Fer II', xpRequired: 1000 },
    { name: 'Fer III', xpRequired: 2500 },
    { name: 'Bronze I', xpRequired: 4500 },
    { name: 'Bronze II', xpRequired: 7000 },
    { name: 'Bronze III', xpRequired: 10000 },
    { name: 'Argent I', xpRequired: 14000 },
    { name: 'Argent II', xpRequired: 19000 },
    { name: 'Argent III', xpRequired: 25000 },
    { name: 'Or I', xpRequired: 32000 },
    { name: 'Or II', xpRequired: 40000 },
    { name: 'Or III', xpRequired: 50000 },
    { name: 'Platine I', xpRequired: 62000 },
    { name: 'Platine II', xpRequired: 76000 },
    { name: 'Platine III', xpRequired: 92000 },
    { name: 'Diamant I', xpRequired: 110000 },
    { name: 'Diamant II', xpRequired: 130000 },
    { name: 'Diamant III', xpRequired: 152000 },
    { name: 'Immortel', xpRequired: 200000 },
    { name: 'Radiant', xpRequired: 300000 }
];

// Ouverture du profil du joueur connecté
function openPlayerProfile() {
    if (currentUser) {
        openProfileModal(currentUser.uid);
    }
}

// Ouverture du modal de profil
async function openProfileModal(userId) {
    currentProfileId = userId;
    
    try {
        // Afficher le modal
        document.getElementById('profile-modal').classList.remove('hidden');
        
        // Charger les données du profil
        const profileData = await loadProfileData(userId);
        
        if (!profileData) {
            showMessage('Profil introuvable', 'error');
            closeProfileModal();
            return;
        }
        
        // Mettre à jour l'affichage
        updateProfileDisplay(profileData, userId);
        
        // Charger les différentes sections
        await Promise.all([
            loadProfileStats(profileData.stats || {}),
            loadAchievements(userId, profileData.stats || {}),
            loadMatchHistory(userId)
        ]);
        
        // Montrer/cacher l'onglet paramètres selon si c'est le profil du joueur connecté
        const settingsTab = document.getElementById('profile-settings-tab');
        if (userId === currentUser?.uid) {
            settingsTab.style.display = 'block';
            // Charger les paramètres de confidentialité
            loadPrivacySettings();
        } else {
            settingsTab.style.display = 'none';
        }
        
        // Activer l'onglet statistiques par défaut
        switchProfileTab('stats');
        
    } catch (error) {
        console.error('Erreur chargement profil:', error);
        showMessage('Erreur lors du chargement du profil', 'error');
    }
}

// Fermeture du modal de profil
function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
    currentProfileId = null;
}

// Chargement des données de profil depuis Firebase
async function loadProfileData(userId) {
    try {
        const userRef = database.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        return snapshot.val();
    } catch (error) {
        console.error('Erreur chargement données profil:', error);
        return null;
    }
}

// Mise à jour de l'affichage du profil
function updateProfileDisplay(profileData, userId) {
    // Informations de base
    document.getElementById('profile-username').textContent = profileData.displayName || 'Joueur';
    
    // Calcul du rang et niveau
    const experience = profileData.experience || 0;
    const rank = calculateRank(experience);
    const level = calculateLevel(experience);
    const nextLevelXP = getXPForNextLevel(experience);
    
    document.getElementById('profile-rank').textContent = `Rang: ${rank}`;
    document.getElementById('profile-level').textContent = `Niveau ${level} (${experience}/${nextLevelXP} XP)`;
    
    // Avatar
    const avatarIcon = document.getElementById('profile-avatar-icon');
    avatarIcon.className = `fas fa-${profileData.avatar || 'user'}`;
    
    // Statut en ligne
    const statusElement = document.getElementById('profile-status');
    const status = profileData.status || 'offline';
    
    if (status === 'online' && userId !== currentUser?.uid) {
        statusElement.innerHTML = '<i class="fas fa-circle"></i> En ligne';
        statusElement.className = 'profile-status online';
    } else if (userId === currentUser?.uid) {
        statusElement.innerHTML = '<i class="fas fa-circle"></i> Vous';
        statusElement.className = 'profile-status you';
    } else {
        statusElement.innerHTML = '<i class="fas fa-circle"></i> Hors ligne';
        statusElement.className = 'profile-status offline';
    }
}

// Calcul du rang basé sur l'expérience
function calculateRank(xp) {
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].xpRequired) {
            return ranks[i].name;
        }
    }
    return ranks[0].name;
}

// Calcul du niveau basé sur l'expérience
function calculateLevel(xp) {
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (xp >= ranks[i].xpRequired) {
            return i + 1;
        }
    }
    return 1;
}

// XP nécessaire pour le niveau suivant
function getXPForNextLevel(currentXP) {
    const currentLevel = calculateLevel(currentXP);
    if (currentLevel >= ranks.length) {
        return ranks[ranks.length - 1].xpRequired;
    }
    return ranks[currentLevel] ? ranks[currentLevel].xpRequired : ranks[ranks.length - 1].xpRequired;
}

// Chargement des statistiques
function loadProfileStats(stats) {
    // Statistiques principales
    document.getElementById('stat-kills').textContent = stats.kills || 0;
    document.getElementById('stat-deaths').textContent = stats.deaths || 0;
    document.getElementById('stat-wins').textContent = stats.wins || 0;
    document.getElementById('stat-losses').textContent = stats.losses || 0;
    document.getElementById('stat-games-played').textContent = stats.gamesPlayed || 0;
    document.getElementById('stat-shots-fired').textContent = stats.shotsFired || 0;
    document.getElementById('stat-shots-hit').textContent = stats.shotsHit || 0;
    document.getElementById('stat-headshots').textContent = stats.headshots || 0;
    
    // Calculs des ratios
    const kills = stats.kills || 0;
    const deaths = stats.deaths || 0;
    const wins = stats.wins || 0;
    const losses = stats.losses || 0;
    const gamesPlayed = stats.gamesPlayed || 0;
    const shotsFired = stats.shotsFired || 0;
    const shotsHit = stats.shotsHit || 0;
    const playtimeMinutes = stats.playtime || 0;
    
    // Ratio K/D
    const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
    document.getElementById('stat-kd-ratio').textContent = kdRatio;
    
    // Précision
    const accuracy = shotsFired > 0 ? ((shotsHit / shotsFired) * 100).toFixed(1) : '0.0';
    document.getElementById('stat-accuracy').textContent = accuracy + '%';
    
    // Ratio de victoires
    const winRatio = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';
    document.getElementById('stat-win-ratio').textContent = winRatio + '%';
    
    // Temps de jeu
    const hours = Math.floor(playtimeMinutes / 60);
    const minutes = playtimeMinutes % 60;
    document.getElementById('stat-playtime').textContent = `${hours}h ${minutes}m`;
}

// Basculement entre les onglets du profil
function switchProfileTab(tab) {
    // Désactiver tous les onglets
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.add('hidden'));
    
    // Activer l'onglet sélectionné
    document.querySelector(`.profile-tab[onclick*="${tab}"]`).classList.add('active');
    document.getElementById(`profile-${tab}-content`).classList.remove('hidden');
}

// Chargement des succès
async function loadAchievements(userId, stats) {
    try {
        // Récupérer les succès débloqués depuis Firebase
        const achievementsRef = database.ref(`users/${userId}/achievements`);
        const snapshot = await achievementsRef.once('value');
        const userAchievements = snapshot.val() || {};
        
        const grid = document.getElementById('achievements-grid');
        grid.innerHTML = '';
        
        let unlockedCount = 0;
        
        // Vérifier quels succès devraient être débloqués
        Object.keys(achievements).forEach(achievementId => {
            const achievement = achievements[achievementId];
            const isUnlocked = userAchievements[achievementId] || checkAchievementUnlocked(achievement, stats);
            
            if (isUnlocked && !userAchievements[achievementId]) {
                // Débloquer le succès dans Firebase
                unlockAchievement(userId, achievementId);
                userAchievements[achievementId] = Date.now();
            }
            
            if (isUnlocked) unlockedCount++;
            
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${isUnlocked ? '<div class="achievement-date">Débloqué</div>' : '<div class="achievement-progress">Non débloqué</div>'}
                </div>
                <div class="achievement-status">
                    <i class="fas fa-${isUnlocked ? 'check' : 'lock'}"></i>
                </div>
            `;
            grid.appendChild(achievementElement);
        });
        
        // Mettre à jour le compteur
        document.getElementById('achievements-count').textContent = `${unlockedCount}/${Object.keys(achievements).length}`;
        
    } catch (error) {
        console.error('Erreur chargement succès:', error);
        document.getElementById('achievements-grid').innerHTML = '<div class="error">Erreur lors du chargement des succès</div>';
    }
}

// Vérifier si un succès doit être débloqué
function checkAchievementUnlocked(achievement, stats) {
    const requirement = achievement.requirement;
    const statValue = stats[requirement.stat] || 0;
    
    if (requirement.stat === 'accuracy') {
        const shotsFired = stats.shotsFired || 0;
        const shotsHit = stats.shotsHit || 0;
        if (shotsFired < 100) return false; // Minimum 100 tirs pour le succès de précision
        const accuracy = (shotsHit / shotsFired) * 100;
        return accuracy >= requirement.value;
    }
    
    return statValue >= requirement.value;
}

// Débloquer un succès
async function unlockAchievement(userId, achievementId) {
    try {
        await database.ref(`users/${userId}/achievements/${achievementId}`).set(Date.now());
        console.log(`Succès débloqué: ${achievements[achievementId].name}`);
    } catch (error) {
        console.error('Erreur débloquage succès:', error);
    }
}

// Chargement de l'historique des parties
async function loadMatchHistory(userId) {
    const matchesList = document.getElementById('matches-list');
    matchesList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement de l\'historique...</div>';
    
    try {
        // Récupérer l'historique des parties depuis Firebase
        const historyRef = database.ref(`users/${userId}/matchHistory`);
        const snapshot = await historyRef.once('value');
        const matches = snapshot.val();
        
        matchesList.innerHTML = '';
        
        if (!matches || Object.keys(matches).length === 0) {
            matchesList.innerHTML = '<div class="no-matches">Aucune partie jouée</div>';
            return;
        }
        
        // Convertir en tableau et trier par date
        const matchesArray = Object.entries(matches)
            .map(([id, match]) => ({ id, ...match }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20); // Limiter aux 20 dernières parties
        
        matchesArray.forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.className = `match-card ${match.result ? match.result.toLowerCase() : 'unknown'}`;
            
            const date = new Date(match.timestamp).toLocaleString();
            
            matchElement.innerHTML = `
                <div class="match-header">
                    <div class="match-map">${match.map || 'Carte inconnue'}</div>
                    <div class="match-result ${match.result ? match.result.toLowerCase() : 'unknown'}">
                        ${match.result || 'Résultat inconnu'}
                    </div>
                </div>
                <div class="match-info">
                    <div class="match-mode">${match.mode || 'Mode inconnu'}</div>
                    <div class="match-score">${match.score || 'N/A'}</div>
                </div>
                <div class="match-stats">
                    <span>${match.kills || 0}K</span>
                    <span>${match.deaths || 0}D</span>
                    <span>${match.assists || 0}A</span>
                </div>
                <div class="match-date">${date}</div>
            `;
            matchesList.appendChild(matchElement);
        });
        
    } catch (error) {
        console.error('Erreur chargement historique:', error);
        matchesList.innerHTML = '<div class="error">Erreur lors du chargement de l\'historique</div>';
    }
}

// Mise à jour du nom d'utilisateur
async function updateUsername() {
    const newUsername = document.getElementById('edit-username').value.trim();
    
    if (!newUsername) {
        showMessage('Veuillez entrer un nom d\'utilisateur', 'error');
        return;
    }
    
    if (newUsername.length < 3) {
        showMessage('Le nom doit contenir au moins 3 caractères', 'error');
        return;
    }
    
    if (newUsername.length > 20) {
        showMessage('Le nom ne peut pas dépasser 20 caractères', 'error');
        return;
    }
    
    try {
        // Vérifier la disponibilité
        const isAvailable = await checkUsernameAvailability(newUsername);
        if (!isAvailable) {
            showMessage('Ce nom d\'utilisateur est déjà pris', 'error');
            return;
        }
        
        // Mettre à jour dans Firebase
        await database.ref(`users/${currentUser.uid}/displayName`).set(newUsername);
        
        // Mettre à jour le profil Firebase Auth
        await currentUser.updateProfile({ displayName: newUsername });
        
        // Mettre à jour l'affichage
        document.getElementById('profile-username').textContent = newUsername;
        document.getElementById('current-username').textContent = newUsername;
        document.getElementById('edit-username').value = '';
        
        showMessage('Nom d\'utilisateur mis à jour !', 'success');
        
    } catch (error) {
        console.error('Erreur mise à jour nom:', error);
        showMessage('Erreur lors de la mise à jour', 'error');
    }
}

// Vérification de la disponibilité du nom d'utilisateur
async function checkUsernameAvailability(username) {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.orderByChild('displayName').equalTo(username).once('value');
        return !snapshot.exists();
    } catch (error) {
        console.error('Erreur vérification nom:', error);
        return false;
    }
}

// Sélection d'avatar
function selectAvatar(avatar) {
    selectedAvatar = avatar;
    
    // Mettre à jour la sélection visuelle
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-avatar="${avatar}"]`).classList.add('active');
    
    // Sauvegarder immédiatement
    saveAvatarSelection(avatar);
}

// Sauvegarde de la sélection d'avatar
async function saveAvatarSelection(avatar) {
    try {
        await database.ref(`users/${currentUser.uid}/avatar`).set(avatar);
        
        // Mettre à jour l'affichage
        document.getElementById('profile-avatar-icon').className = `fas fa-${avatar}`;
        document.getElementById('user-avatar-icon').className = `fas fa-${avatar}`;
        
        showMessage('Avatar mis à jour !', 'success');
        
    } catch (error) {
        console.error('Erreur sauvegarde avatar:', error);
        showMessage('Erreur lors de la sauvegarde', 'error');
    }
}

// Chargement des paramètres de confidentialité
async function loadPrivacySettings() {
    try {
        const settingsRef = database.ref(`users/${currentUser.uid}/privacy`);
        const snapshot = await settingsRef.once('value');
        const privacy = snapshot.val() || {};
        
        document.getElementById('public-stats').checked = privacy.publicStats !== false;
        document.getElementById('show-online').checked = privacy.showOnline !== false;
        document.getElementById('allow-friend-requests').checked = privacy.allowFriendRequests !== false;
        
    } catch (error) {
        console.error('Erreur chargement paramètres:', error);
    }
}

// Sauvegarde des paramètres de confidentialité
async function savePrivacySettings() {
    try {
        const privacy = {
            publicStats: document.getElementById('public-stats').checked,
            showOnline: document.getElementById('show-online').checked,
            allowFriendRequests: document.getElementById('allow-friend-requests').checked
        };
        
        await database.ref(`users/${currentUser.uid}/privacy`).set(privacy);
        showMessage('Paramètres de confidentialité sauvegardés', 'success');
        
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        showMessage('Erreur lors de la sauvegarde', 'error');
    }
}

// Réinitialisation des statistiques
async function resetStats() {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos statistiques ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        const defaultStats = {
            kills: 0,
            deaths: 0,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            playtime: 0,
            experience: 0,
            aces: 0,
            winStreak: 0,
            awpKills: 0
        };
        
        // Réinitialiser les statistiques
        await database.ref(`users/${currentUser.uid}/stats`).set(defaultStats);
        
        // Réinitialiser les succès
        await database.ref(`users/${currentUser.uid}/achievements`).remove();
        
        // Réinitialiser l'historique
        await database.ref(`users/${currentUser.uid}/matchHistory`).remove();
        
        // Recharger l'affichage
        loadProfileStats(defaultStats);
        loadAchievements(currentUser.uid, defaultStats);
        loadMatchHistory(currentUser.uid);
        
        showMessage('Statistiques réinitialisées', 'success');
        
    } catch (error) {
        console.error('Erreur réinitialisation stats:', error);
        showMessage('Erreur lors de la réinitialisation', 'error');
    }
}

// Système de classements
function switchLeaderboardTab(type) {
    currentProfileLeaderboardType = type;
    
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
                rank: calculateRank(data.experience || 0),
                level: calculateLevel(data.experience || 0),
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
        case 'kills':
            return stats.kills || 0;
        case 'wins':
            return stats.wins || 0;
        case 'kd':
            const kills = stats.kills || 0;
            const deaths = stats.deaths || 0;
            return deaths > 0 ? kills / deaths : kills;
        case 'level':
            return calculateLevel(stats.experience || 0);
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

// Fonctions utilitaires pour les statistiques de jeu
async function updatePlayerStats(statUpdates) {
    if (!currentUser) return;
    
    try {
        const statsRef = database.ref(`users/${currentUser.uid}/stats`);
        const snapshot = await statsRef.once('value');
        const currentStats = snapshot.val() || {};
        
        // Fusionner les nouvelles statistiques
        const updatedStats = { ...currentStats };
        Object.keys(statUpdates).forEach(stat => {
            if (typeof statUpdates[stat] === 'number') {
                updatedStats[stat] = (updatedStats[stat] || 0) + statUpdates[stat];
            } else {
                updatedStats[stat] = statUpdates[stat];
            }
        });
        
        // Sauvegarder
        await statsRef.set(updatedStats);
        
        // Vérifier les nouveaux succès
        await checkAndUnlockAchievements(updatedStats);
        
    } catch (error) {
        console.error('Erreur mise à jour stats:', error);
    }
}

// Vérifier et débloquer les nouveaux succès
async function checkAndUnlockAchievements(stats) {
    try {
        const achievementsRef = database.ref(`users/${currentUser.uid}/achievements`);
        const snapshot = await achievementsRef.once('value');
        const unlockedAchievements = snapshot.val() || {};
        
        Object.keys(achievements).forEach(async (achievementId) => {
            if (!unlockedAchievements[achievementId]) {
                const achievement = achievements[achievementId];
                if (checkAchievementUnlocked(achievement, stats)) {
                    await unlockAchievement(currentUser.uid, achievementId);
                    showMessage(`🏆 Succès débloqué: ${achievement.name}`, 'success');
                }
            }
        });
        
    } catch (error) {
        console.error('Erreur vérification succès:', error);
    }
}

// Ajouter une partie à l'historique
async function addMatchToHistory(matchData) {
    if (!currentUser) return;
    
    try {
        const historyRef = database.ref(`users/${currentUser.uid}/matchHistory`);
        const newMatchRef = historyRef.push();
        
        const matchEntry = {
            ...matchData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        await newMatchRef.set(matchEntry);
        
    } catch (error) {
        console.error('Erreur ajout historique:', error);
    }
}

// Événements pour les paramètres de confidentialité
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les événements pour les checkboxes de confidentialité
    ['public-stats', 'show-online', 'allow-friend-requests'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', savePrivacySettings);
        }
    });
});

// Initialiser le système de profils quand un utilisateur se connecte
auth.onAuthStateChanged((user) => {
    if (user) {
        // Charger l'avatar de l'utilisateur
        loadUserAvatar();
        // Mettre à jour le rang affiché
        updateUserRankDisplay();
    }
});

// Charger l'avatar de l'utilisateur
async function loadUserAvatar() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}/avatar`);
        const snapshot = await userRef.once('value');
        const avatar = snapshot.val() || 'user';
        
        const avatarIcon = document.getElementById('user-avatar-icon');
        if (avatarIcon) {
            avatarIcon.className = `fas fa-${avatar}`;
        }
        
    } catch (error) {
        console.error('Erreur chargement avatar:', error);
    }
}

// Mettre à jour l'affichage du rang de l'utilisateur
async function updateUserRankDisplay() {
    if (!currentUser) return;
    
    try {
        const userRef = database.ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        
        if (userData) {
            const rank = calculateRank(userData.experience || 0);
            const rankElement = document.getElementById('current-user-rank');
            if (rankElement) {
                rankElement.textContent = `Rang: ${rank}`;
            }
        }
        
    } catch (error) {
        console.error('Erreur chargement rang:', error);
    }
}
