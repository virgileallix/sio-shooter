// Gestion de la page de profil

document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const saveBtn = document.getElementById('profile-page-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveProfilePage);
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            initializeProfilePage();
            loadProfileStats();
            document.getElementById('profile-name').textContent =
                user.displayName || user.email.split('@')[0];
        } else {
            window.location.href = 'index.html';
        }
    });
});

function initializeProfilePage() {
    if (!currentUser) return;
    const usernameInput = document.getElementById('profile-page-username');
    const emailInput = document.getElementById('profile-page-email');
    const passwordInput = document.getElementById('profile-page-password');
    const saveBtn = document.getElementById('profile-page-save-btn');
    if (!usernameInput || !emailInput || !passwordInput || !saveBtn) return;

    usernameInput.value = currentUser.displayName || '';
    emailInput.value = currentUser.email || '';

    const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
    [usernameInput, emailInput, passwordInput, saveBtn].forEach(el => {
        el.disabled = isGoogle;
    });
}

async function saveProfilePage() {
    if (!currentUser) return;

    const username = document.getElementById('profile-page-username').value.trim();
    const email = document.getElementById('profile-page-email').value.trim();
    const password = document.getElementById('profile-page-password').value;

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
            document.getElementById('profile-page-password').value = '';
        }
        document.getElementById('profile-name').textContent =
            currentUser.displayName || currentUser.email.split('@')[0];
        showMessage('Profil mis à jour', 'success');
    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        showMessage('Erreur lors de la mise à jour du profil', 'error');
    }
}

async function loadProfileStats() {
    if (!currentUser) return;
    try {
        const statsRef = database.ref(`users/${currentUser.uid}/stats`);
        const snapshot = await statsRef.once('value');
        const stats = snapshot.val() || {};
        document.getElementById('stat-kills').textContent = stats.kills || 0;
        document.getElementById('stat-deaths').textContent = stats.deaths || 0;
        document.getElementById('stat-games').textContent = stats.gamesPlayed || 0;
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

console.log('Page de profil chargée');
