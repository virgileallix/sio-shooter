// Système d'authentification

// Variables pour l'interface d'authentification
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Écouteurs d'événements pour les formulaires
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire de connexion
    loginForm.addEventListener('submit', handleLogin);
    
    // Formulaire d'inscription
    registerForm.addEventListener('submit', handleRegister);
    
    // Vérifier la compatibilité de l'authentification Google
    checkGoogleAuthSupport();
    
    // Vérifier si un utilisateur est déjà connecté
    // Wait for Firebase to initialize first
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('User already logged in:', user.email);
            }
        });
    }
});

// Vérifier si l'authentification Google est supportée
function checkGoogleAuthSupport() {
    const googleBtn = document.querySelector('.google-btn');
    
    if (location.protocol === 'file:' || !window.location.hostname || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        if (googleBtn) {
            googleBtn.style.opacity = '0.5';
            googleBtn.title = 'Connexion Google non disponible en local. Déployez sur un serveur HTTPS.';
        }
    }
}

// Gestion de la connexion
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Connexion réussie:', userCredential.user.email);
        showMessage('Connexion réussie !', 'success');
        
        // L'utilisateur sera automatiquement redirigé par onAuthStateChanged
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showMessage(getAuthErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

// Gestion de l'inscription
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Mettre à jour le profil avec le nom d'utilisateur
        await userCredential.user.updateProfile({
            displayName: username
        });
        
        console.log('Inscription réussie:', userCredential.user.email);
        showMessage('Inscription réussie ! Bienvenue !', 'success');
        
        // L'utilisateur sera automatiquement redirigé par onAuthStateChanged
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        showMessage(getAuthErrorMessage(error.code), 'error');
    } finally {
        showLoading(false);
    }
}

// Connexion avec Google
async function signInWithGoogle() {
    try {
        showLoading(true);
        
        // Vérifier si l'environnement supporte l'authentification Google
        if (location.protocol === 'file:' || !window.location.hostname) {
            throw new Error('AUTH_ENV_NOT_SUPPORTED');
        }
        
        const result = await auth.signInWithPopup(googleProvider);
        console.log('Connexion Google réussie:', result.user.email);
        showMessage('Connexion Google réussie !', 'success');
        
        // L'utilisateur sera automatiquement redirigé par onAuthStateChanged
    } catch (error) {
        console.error('Erreur connexion Google:', error);
        
        if (error.message === 'AUTH_ENV_NOT_SUPPORTED' || 
            error.code === 'auth/operation-not-supported-in-this-environment') {
            showMessage('Connexion Google non disponible dans cet environnement. Utilisez l\'authentification par email.', 'error');
            
            // Masquer le bouton Google pour éviter la confusion
            const googleBtn = document.querySelector('.google-btn');
            if (googleBtn) {
                googleBtn.style.display = 'none';
            }
        } else {
            showMessage(getAuthErrorMessage(error.code), 'error');
        }
    } finally {
        showLoading(false);
    }
}

// Déconnexion
async function logout() {
    try {
        await auth.signOut();
        console.log('Déconnexion réussie');
        showMessage('Déconnexion réussie', 'success');
        
        // Nettoyer les données locales
        gameState.friends = [];
        cleanupRealtimeListeners();
        
        // L'utilisateur sera automatiquement redirigé par onAuthStateChanged
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        showMessage('Erreur lors de la déconnexion', 'error');
    }
}

// Basculer entre les onglets de connexion/inscription
function switchAuthTab(tab) {
    const loginTab = document.querySelector('.auth-tab:first-child');
    const registerTab = document.querySelector('.auth-tab:last-child');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

// Affichage des messages
function showMessage(message, type) {
    // Supprimer les anciens messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = message;
    
    // Styles pour le message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(45deg, #4ade80, #22c55e);' : 'background: linear-gradient(45deg, #ef4444, #dc2626);'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Supprimer le message après 3 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => messageDiv.remove(), 300);
        }
    }, 3000);
}

// Affichage du loading
function showLoading(show) {
    const buttons = document.querySelectorAll('.auth-btn, .google-btn');
    
    buttons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.style.opacity = '0.6';
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            
            // Restaurer le texte original
            if (button.classList.contains('google-btn')) {
                button.innerHTML = '<i class="fab fa-google"></i> Continuer avec Google';
            } else {
                const isLogin = button.closest('#login-form');
                button.innerHTML = isLogin 
                    ? '<i class="fas fa-sign-in-alt"></i> Se connecter'
                    : '<i class="fas fa-user-plus"></i> S\'inscrire';
            }
        }
    });
}

// Traduction des messages d'erreur Firebase
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
        'auth/weak-password': 'Le mot de passe est trop faible',
        'auth/invalid-email': 'Adresse email invalide',
        'auth/user-disabled': 'Ce compte a été désactivé',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
        'auth/network-request-failed': 'Erreur de connexion réseau',
        'auth/popup-closed-by-user': 'Connexion annulée par l\'utilisateur',
        'auth/popup-blocked': 'Popup bloquée par le navigateur',
        'auth/operation-not-supported-in-this-environment': 'Connexion Google non supportée dans cet environnement',
        default: 'Une erreur inattendue s\'est produite'
    };
    
    return errorMessages[errorCode] || errorMessages.default;
}

// Validation des champs en temps réel
function setupFieldValidation() {
    const emailFields = document.querySelectorAll('input[type="email"]');
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    emailFields.forEach(field => {
        field.addEventListener('blur', validateEmail);
    });
    
    passwordFields.forEach(field => {
        field.addEventListener('input', validatePassword);
    });
}

function validateEmail(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        e.target.style.borderColor = '#ef4444';
        showFieldError(e.target, 'Adresse email invalide');
    } else {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        hideFieldError(e.target);
    }
}

function validatePassword(e) {
    const password = e.target.value;
    
    if (password && password.length < 6) {
        e.target.style.borderColor = '#ef4444';
        showFieldError(e.target, 'Au moins 6 caractères requis');
    } else {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        hideFieldError(e.target);
    }
}

function showFieldError(field, message) {
    hideFieldError(field); // Supprimer l'erreur existante
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 12px;
        margin-top: 5px;
        animation: fadeIn 0.3s ease;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function hideFieldError(field) {
    const error = field.parentNode.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

// Animations CSS supplémentaires
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialiser la validation des champs
document.addEventListener('DOMContentLoaded', setupFieldValidation);

console.log('Système d\'authentification initialisé');