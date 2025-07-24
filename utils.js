// Fonctions utilitaires pour SIO SHOOTER 2D

// Utilitaires de validation
const Validation = {
    // Validation email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validation nom d'utilisateur
    isValidUsername(username) {
        if (!username || typeof username !== 'string') return false;
        if (username.length < 3 || username.length > 20) return false;
        
        // Caractères autorisés : lettres, chiffres, underscore, tiret
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        return usernameRegex.test(username);
    },
    
    // Validation mot de passe
    isValidPassword(password) {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 6;
    },
    
    // Nettoyage des entrées utilisateur
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }
};

// Utilitaires de formatage
const Format = {
    // Formater le temps de jeu
    formatPlaytime(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours < 24) {
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
        
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}j ${remainingHours}h`;
    },
    
    // Formater les nombres avec des séparateurs
    formatNumber(number) {
        return new Intl.NumberFormat('fr-FR').format(number);
    },
    
    // Formater les pourcentages
    formatPercentage(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    },
    
    // Formater les ratios
    formatRatio(numerator, denominator) {
        if (denominator === 0) return numerator.toFixed(2);
        return (numerator / denominator).toFixed(2);
    },
    
    // Formater les dates
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        // Moins d'une minute
        if (diff < 60000) {
            return 'À l\'instant';
        }
        
        // Moins d'une heure
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        
        // Moins d'un jour
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        }
        
        // Plus d'un jour
        const days = Math.floor(diff / 86400000);
        if (days < 7) {
            return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        }
        
        // Date complète
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    },
    
    // Formater la durée d'une partie
    formatMatchDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// Utilitaires de couleurs et thème
const Theme = {
    // Couleurs du thème
    colors: {
        primary: '#00d4ff',
        secondary: '#ff4655',
        success: '#4ade80',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        background: '#0f1419',
        surface: '#1a252f',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.7)'
    },
    
    // Obtenir la couleur pour un rang
    getRankColor(rank) {
        const rankColors = {
            'Fer I': '#8B4513',
            'Fer II': '#8B4513',
            'Fer III': '#8B4513',
            'Bronze I': '#CD7F32',
            'Bronze II': '#CD7F32',
            'Bronze III': '#CD7F32',
            'Argent I': '#C0C0C0',
            'Argent II': '#C0C0C0',
            'Argent III': '#C0C0C0',
            'Or I': '#FFD700',
            'Or II': '#FFD700',
            'Or III': '#FFD700',
            'Platine I': '#E5E4E2',
            'Platine II': '#E5E4E2',
            'Platine III': '#E5E4E2',
            'Diamant I': '#B9F2FF',
            'Diamant II': '#B9F2FF',
            'Diamant III': '#B9F2FF',
            'Immortel': '#FF6B35',
            'Radiant': '#FFD700'
        };
        return rankColors[rank] || this.colors.text;
    },
    
    // Obtenir la couleur pour un type de statistique
    getStatColor(statType) {
        const statColors = {
            kills: this.colors.success,
            deaths: this.colors.error,
            assists: this.colors.warning,
            wins: this.colors.primary,
            losses: this.colors.error,
            accuracy: this.colors.info,
            headshots: this.colors.secondary
        };
        return statColors[statType] || this.colors.text;
    }
};

// Utilitaires de stockage local
const Storage = {
    // Sauvegarder des données avec expiration
    setWithExpiry(key, value, ttl) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    },
    
    // Récupérer des données avec vérification d'expiration
    getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            const now = new Date();
            
            if (now.getTime() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            localStorage.removeItem(key);
            return null;
        }
    },
    
    // Sauvegarder les paramètres utilisateur
    saveSettings(settings) {
        localStorage.setItem('sioshooter_settings', JSON.stringify(settings));
    },
    
    // Charger les paramètres utilisateur
    loadSettings() {
        try {
            const settings = localStorage.getItem('sioshooter_settings');
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            return null;
        }
    },
    
    // Nettoyer le stockage
    cleanup() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('sioshooter_temp_')) {
                this.getWithExpiry(key); // Cela supprimera les éléments expirés
            }
        });
    }
};

// Utilitaires de performance
const Performance = {
    // Debounce pour limiter les appels de fonction
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle pour limiter la fréquence d'exécution
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Mesurer le temps d'exécution
    measureTime(name, func) {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`${name} took ${(end - start).toFixed(2)} milliseconds`);
        return result;
    },
    
    // Optimiser les images
    optimizeImage(canvas, quality = 0.8) {
        return canvas.toDataURL('image/jpeg', quality);
    }
};

// Utilitaires de réseau
const Network = {
    // Vérifier la connexion
    isOnline() {
        return navigator.onLine;
    },
    
    // Attendre la reconnexion
    waitForConnection() {
        return new Promise((resolve) => {
            if (this.isOnline()) {
                resolve();
                return;
            }
            
            const handleOnline = () => {
                window.removeEventListener('online', handleOnline);
                resolve();
            };
            
            window.addEventListener('online', handleOnline);
        });
    },
    
    // Retry avec backoff exponentiel
    async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                const delay = baseDelay * Math.pow(2, i);
                await this.delay(delay);
            }
        }
    },
    
    // Délai
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Utilitaires de jeu
const GameUtils = {
    // Calculer la distance entre deux points
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    
    // Calculer l'angle entre deux points
    angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    // Générer un ID unique
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Mélanger un tableau
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Nombre aléatoire dans une plage
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Interpolation linéaire
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },
    
    // Collision cercle-rectangle
    circleRectCollision(circleX, circleY, radius, rectX, rectY, rectWidth, rectHeight) {
        const distX = Math.abs(circleX - rectX - rectWidth / 2);
        const distY = Math.abs(circleY - rectY - rectHeight / 2);
        
        if (distX > (rectWidth / 2 + radius) || distY > (rectHeight / 2 + radius)) {
            return false;
        }
        
        if (distX <= rectWidth / 2 || distY <= rectHeight / 2) {
            return true;
        }
        
        const dx = distX - rectWidth / 2;
        const dy = distY - rectHeight / 2;
        return (dx * dx + dy * dy <= radius * radius);
    }
};

// Utilitaires d'animation
const Animation = {
    // Easing functions
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },
    
    // Animation simple
    animate(duration, easingFunction, callback) {
        const start = performance.now();
        
        function frame(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunction(progress);
            
            callback(easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }
        
        requestAnimationFrame(frame);
    },
    
    // Fade in element
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        this.animate(duration, this.easing.easeOutQuad, (progress) => {
            element.style.opacity = progress.toString();
        });
    },
    
    // Fade out element
    fadeOut(element, duration = 300) {
        this.animate(duration, this.easing.easeInQuad, (progress) => {
            element.style.opacity = (1 - progress).toString();
            
            if (progress === 1) {
                element.style.display = 'none';
            }
        });
    },
    
    // Slide in element
    slideIn(element, direction = 'up', duration = 300) {
        const transform = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.opacity = '0';
        element.style.transform = transform[direction];
        element.style.display = 'block';
        
        this.animate(duration, this.easing.easeOutCubic, (progress) => {
            element.style.opacity = progress.toString();
            element.style.transform = `${direction === 'up' || direction === 'down' ? 'translateY' : 'translateX'}(${(1 - progress) * 20 * (direction === 'up' || direction === 'left' ? 1 : -1)}px)`;
        });
    }
};

// Utilitaires de sons
const AudioUtils = {
    // Créer un son avec l'API Web Audio
    createTone(frequency, duration, volume = 0.1, type = 'sine') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        return oscillator;
    },
    
    // Son de notification
    playNotificationSound() {
        this.createTone(800, 0.2, 0.1);
        setTimeout(() => this.createTone(600, 0.2, 0.1), 100);
    },
    
    // Son de succès
    playSuccessSound() {
        this.createTone(523.25, 0.15, 0.1); // Do
        setTimeout(() => this.createTone(659.25, 0.15, 0.1), 150); // Mi
        setTimeout(() => this.createTone(783.99, 0.3, 0.1), 300); // Sol
    },
    
    // Son d'erreur
    playErrorSound() {
        this.createTone(300, 0.5, 0.1, 'sawtooth');
    }
};

// Utilitaires de sécurité
const Security = {
    // Échapper les caractères HTML
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Générer un token aléatoire
    generateToken(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Vérifier la force d'un mot de passe
    checkPasswordStrength(password) {
        const score = {
            length: password.length >= 8 ? 1 : 0,
            lowercase: /[a-z]/.test(password) ? 1 : 0,
            uppercase: /[A-Z]/.test(password) ? 1 : 0,
            numbers: /\d/.test(password) ? 1 : 0,
            symbols: /[^A-Za-z0-9]/.test(password) ? 1 : 0
        };
        
        const total = Object.values(score).reduce((a, b) => a + b, 0);
        
        if (total <= 2) return 'faible';
        if (total <= 3) return 'moyen';
        if (total <= 4) return 'fort';
        return 'très fort';
    }
};

// Utilitaires d'accessibilité
const Accessibility = {
    // Vérifier si les animations sont réduites
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    // Gérer le focus clavier
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },
    
    // Annoncer aux lecteurs d'écran
    announce(message, priority = 'polite') {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.textContent = message;
        
        document.body.appendChild(announcer);
        
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }
};

// Export des utilitaires
window.Utils = {
    Validation,
    Format,
    Theme,
    Storage,
    Performance,
    Network,
    GameUtils,
    Animation,
    AudioUtils,
    Security,
    Accessibility
};

// Initialisation des utilitaires
document.addEventListener('DOMContentLoaded', () => {
    // Nettoyer le stockage local
    Storage.cleanup();
    
    // Configurer la navigation clavier
    Accessibility.setupKeyboardNavigation();
    
    // Ajouter les styles pour l'accessibilité
    const accessibilityStyles = document.createElement('style');
    accessibilityStyles.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        .keyboard-navigation *:focus {
            outline: 2px solid #00d4ff;
            outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(accessibilityStyles);
    
});
