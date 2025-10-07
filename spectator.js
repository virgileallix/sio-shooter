// ========================================
// SPECTATOR.JS - MODE SPECTATEUR & CAMÉRAS
// ========================================

const SpectatorSystem = {
    state: {
        enabled: false,
        mode: 'free',
        camera: {
            x: 0,
            y: 0,
            speed: 12
        }
    },

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.button = document.getElementById('spectator-toggle-btn');
        this.overlay = document.getElementById('spectator-overlay');

        this.button?.addEventListener('click', () => this.toggle());
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'f3') {
                this.toggle();
            }
        });
    },

    toggle(forceValue) {
        const newState = typeof forceValue === 'boolean' ? forceValue : !this.state.enabled;
        if (newState === this.state.enabled) return;

        this.state.enabled = newState;
        if (this.state.enabled) {
            this.enterSpectator();
        } else {
            this.leaveSpectator();
        }
    },

    enterSpectator() {
        this.state.mode = 'free';
        if (window.game && window.game.camera) {
            this.state.camera.x = window.game.camera.x;
            this.state.camera.y = window.game.camera.y;
        }
        this.button?.classList.add('active');
        this.overlay?.classList.remove('hidden');
        NotificationSystem?.show?.('Spectateur', 'Mode spectateur activé.', 'info', 2000);
    },

    leaveSpectator() {
        this.button?.classList.remove('active');
        this.overlay?.classList.add('hidden');
        NotificationSystem?.show?.('Spectateur', 'Retour en vue joueur.', 'info', 2000);
    },

    disable(silent = false) {
        if (!this.state.enabled) return;
        this.state.enabled = false;
        this.button?.classList.remove('active');
        this.overlay?.classList.add('hidden');
        if (!silent) {
            NotificationSystem?.show?.('Spectateur', 'Mode spectateur désactivé.', 'info', 2000);
        }
    },

    update(dt) {
        if (!this.state.enabled || this.state.mode !== 'free') return;
        const moveSpeed = this.state.camera.speed * (window.keys?.shift ? 90 : 60) * dt;
        const map = MAPS?.[window.game?.currentMap];

        if (map) {
            if (window.keys?.w || window.keys?.z || window.keys?.arrowup) {
                this.state.camera.y -= moveSpeed;
            }
            if (window.keys?.s || window.keys?.arrowdown) {
                this.state.camera.y += moveSpeed;
            }
            if (window.keys?.a || window.keys?.q || window.keys?.arrowleft) {
                this.state.camera.x -= moveSpeed;
            }
            if (window.keys?.d || window.keys?.arrowright) {
                this.state.camera.x += moveSpeed;
            }

            this.state.camera.x = Math.max(0, Math.min(map.width, this.state.camera.x));
            this.state.camera.y = Math.max(0, Math.min(map.height, this.state.camera.y));
        }
    },

    isEnabled() {
        return this.state.enabled;
    },

    getCameraTarget() {
        return this.state.enabled ? this.state.camera : null;
    },

    drawHUD(ctx) {
        if (!this.state.enabled || !ctx) return;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(20, 20, 200, 60);
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('MODE SPECTATEUR', 32, 44);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText('ZQSD ou flèches : déplacer la caméra', 32, 64);
        ctx.restore();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            SpectatorSystem.init();
        } catch (error) {
            console.error('Erreur initialisation SpectatorSystem:', error);
        }
    }, 1500);
});

window.SpectatorSystem = SpectatorSystem;
