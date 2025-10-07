// ========================================
// TOURNAMENT.JS - SYSTÈME DE TOURNOIS & BRACKETS
// ========================================

const TournamentSystem = {
    state: {
        tournaments: {},
        activeTournamentId: null,
        initialized: false
    },

    init() {
        if (this.state.initialized) return;
        this.state.initialized = true;
        this.bindUI();
        this.attachListeners();
    },

    bindUI() {
        const createBtn = document.getElementById('create-tournament-btn');
        const card = document.getElementById('tournament-create-card');
        const cancelBtn = document.getElementById('cancel-tournament-create');
        const confirmBtn = document.getElementById('confirm-tournament-create');

        if (createBtn && card) {
            createBtn.addEventListener('click', () => {
                card.classList.toggle('hidden');
            });
        }

        cancelBtn?.addEventListener('click', () => {
            card?.classList.add('hidden');
        });

        confirmBtn?.addEventListener('click', () => this.handleCreateTournament());
    },

    attachListeners() {
        if (!window.database) {
            this.renderTournamentList();
            return;
        }

        const tournamentsRef = window.database.ref('tournaments');
        tournamentsRef.on('value', (snapshot) => {
            const data = snapshot.val() || {};
            this.state.tournaments = data;
            this.renderTournamentList();
            if (this.state.activeTournamentId && !data[this.state.activeTournamentId]) {
                this.state.activeTournamentId = null;
                this.renderTournamentDetails();
            }
        });
    },

    handleCreateTournament() {
        if (!window.currentUser || !window.database) {
            NotificationSystem?.show?.('Tournoi', 'Connectez-vous pour créer un tournoi.', 'warning');
            return;
        }

        const nameInput = document.getElementById('tournament-name');
        const sizeSelect = document.getElementById('tournament-size');
        const modeSelect = document.getElementById('tournament-mode');
        const card = document.getElementById('tournament-create-card');

        const name = (nameInput?.value || '').trim();
        const size = parseInt(sizeSelect?.value || '8', 10);
        const mode = modeSelect?.value || 'duel';

        if (!name) {
            NotificationSystem?.show?.('Tournoi', 'Veuillez saisir un nom valide.', 'warning');
            return;
        }

        const tournamentsRef = window.database.ref('tournaments');
        const newRef = tournamentsRef.push();
        const tournament = {
            id: newRef.key,
            name,
            size,
            mode,
            status: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            host: {
                uid: window.currentUser.uid,
                name: window.currentUser.displayName || window.currentUser.email.split('@')[0]
            },
            participants: {},
            bracket: []
        };

        tournament.participants[window.currentUser.uid] = {
            uid: window.currentUser.uid,
            name: tournament.host.name,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        };

        newRef.set(tournament).then(() => {
            card?.classList.add('hidden');
            nameInput.value = '';
            NotificationSystem?.show?.('Tournoi créé', `${name} est prêt à accueillir des joueurs !`, 'success');
        }).catch(error => {
            console.error('Erreur création tournoi:', error);
            NotificationSystem?.show?.('Tournoi', 'Impossible de créer le tournoi.', 'error');
        });
    },

    renderTournamentList() {
        const list = document.getElementById('tournament-list');
        if (!list) return;
        list.innerHTML = '';

        const tournaments = Object.values(this.state.tournaments);
        if (tournaments.length === 0) {
            list.innerHTML = `
                <div class="tournament-placeholder">
                    <i class="fas fa-flag-checkered"></i>
                    <p>Aucun tournoi programmé pour le moment.</p>
                </div>
            `;
            return;
        }

        tournaments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        tournaments.forEach(tournament => {
            const card = document.createElement('div');
            card.className = 'tournament-card' + (this.state.activeTournamentId === tournament.id ? ' active' : '');
            const participantCount = Object.keys(tournament.participants || {}).length;
            card.innerHTML = `
                <div class="status ${tournament.status}">
                    Statut : <span>${this.getStatusLabel(tournament.status)}</span>
                </div>
                <h4>${tournament.name}</h4>
                <p>${participantCount}/${tournament.size} joueurs • Mode ${this.getModeLabel(tournament.mode)}</p>
                <div class="tournament-actions">
                    <button class="btn-secondary" data-open="${tournament.id}"><i class="fas fa-eye"></i> Voir</button>
                    <button class="btn-primary" data-join="${tournament.id}"><i class="fas fa-sign-in-alt"></i> Rejoindre</button>
                </div>
            `;

            card.querySelector('[data-open]')?.addEventListener('click', () => {
                this.state.activeTournamentId = tournament.id;
                this.renderTournamentList();
                this.renderTournamentDetails();
            });

            card.querySelector('[data-join]')?.addEventListener('click', () => {
                this.joinTournament(tournament.id);
            });

            list.appendChild(card);
        });

        this.renderTournamentDetails();
    },

    renderTournamentDetails() {
        const container = document.getElementById('tournament-details');
        if (!container) return;

        if (!this.state.activeTournamentId || !this.state.tournaments[this.state.activeTournamentId]) {
            container.innerHTML = `
                <div class="tournament-placeholder">
                    <i class="fas fa-trophy"></i>
                    <p>Sélectionnez un tournoi pour afficher les détails.</p>
                </div>
            `;
            return;
        }

        const tournament = this.state.tournaments[this.state.activeTournamentId];
        const participants = Object.values(tournament.participants || {});
        const participantCount = participants.length;

        container.innerHTML = `
            <div class="tournament-details-header">
                <h3>${tournament.name}</h3>
                <p>${this.getStatusLabel(tournament.status)} • ${participantCount}/${tournament.size} participants</p>
            </div>
            <div class="participant-section">
                <h4>Participants</h4>
                <div class="participant-list" id="participant-list"></div>
            </div>
            <div class="bracket-section">
                <h4>Arbre du tournoi</h4>
                <div class="bracket-container" id="bracket-container"></div>
            </div>
        `;

        const participantList = container.querySelector('#participant-list');
        participants.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            item.innerHTML = `
                <span>${participant.name}</span>
                ${participant.uid === tournament.host?.uid ? '<span class="badge">Organisateur</span>' : ''}
            `;
            participantList.appendChild(item);
        });

        this.renderBracket(tournament);
    },

    joinTournament(tournamentId) {
        if (!window.currentUser || !window.database) {
            NotificationSystem?.show?.('Tournoi', 'Connectez-vous pour rejoindre un tournoi.', 'warning');
            return;
        }

        const tournament = this.state.tournaments[tournamentId];
        if (!tournament) return;

        const participantCount = Object.keys(tournament.participants || {}).length;
        if (participantCount >= tournament.size) {
            NotificationSystem?.show?.('Tournoi', 'Le tournoi est complet.', 'warning');
            return;
        }

        if (tournament.participants && tournament.participants[window.currentUser.uid]) {
            NotificationSystem?.show?.('Tournoi', 'Vous êtes déjà inscrit.', 'info');
            return;
        }

        const participantData = {
            uid: window.currentUser.uid,
            name: window.currentUser.displayName || window.currentUser.email.split('@')[0],
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        };

        const updates = {};
        updates[`participants/${window.currentUser.uid}`] = participantData;

        // Si le tournoi est maintenant complet, générer l'arbre
        if (participantCount + 1 === tournament.size) {
            updates['status'] = 'ready';
            const bracket = this.generateBracket({
                ...tournament,
                participants: {
                    ...tournament.participants,
                    [window.currentUser.uid]: participantData
                }
            });
            updates['bracket'] = bracket;
        }

        window.database.ref(`tournaments/${tournamentId}`).update(updates)
            .then(() => {
                NotificationSystem?.show?.('Tournoi', 'Inscription confirmée !', 'success');
            })
            .catch(error => {
                console.error('Erreur inscription tournoi:', error);
                NotificationSystem?.show?.('Tournoi', 'Impossible de rejoindre le tournoi.', 'error');
            });
    },

    generateBracket(tournament) {
        const participants = Object.values(tournament.participants || {});
        const shuffled = participants.sort(() => Math.random() - 0.5);
        const bracket = [];
        let roundMatches = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            roundMatches.push({
                playerA: shuffled[i],
                playerB: shuffled[i + 1] || null,
                winner: null
            });
        }

        bracket.push(roundMatches);

        let teamsInRound = roundMatches.length;
        while (teamsInRound > 1) {
            teamsInRound = Math.ceil(teamsInRound / 2);
            bracket.push(Array.from({ length: teamsInRound }, () => ({ playerA: null, playerB: null, winner: null })));
        }

        return bracket;
    },

    renderBracket(tournament) {
        const container = document.getElementById('bracket-container');
        if (!container) return;
        container.innerHTML = '';

        if (!tournament.bracket || tournament.bracket.length === 0) {
            container.innerHTML = '<p>Aucun bracket généré pour le moment.</p>';
            return;
        }

        tournament.bracket.forEach((round, roundIndex) => {
            const roundColumn = document.createElement('div');
            roundColumn.className = 'bracket-round';
            roundColumn.innerHTML = `<h4>${this.getRoundLabel(roundIndex)}</h4>`;

            round.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'bracket-match';
                matchCard.innerHTML = `
                    <div class="bracket-player ${match.winner === match.playerA?.uid ? 'winner' : ''}">
                        ${match.playerA ? match.playerA.name : 'À venir'}
                    </div>
                    <div class="bracket-player ${match.winner === match.playerB?.uid ? 'winner' : ''}">
                        ${match.playerB ? match.playerB.name : 'À venir'}
                    </div>
                `;
                roundColumn.appendChild(matchCard);
            });

            container.appendChild(roundColumn);
        });
    },

    getStatusLabel(status) {
        switch (status) {
            case 'waiting':
                return 'En attente';
            case 'ready':
                return 'Prêt à démarrer';
            case 'in_progress':
                return 'En cours';
            case 'completed':
                return 'Terminé';
            default:
                return 'Inconnu';
        }
    },

    getModeLabel(mode) {
        switch (mode) {
            case 'duel':
                return '1v1';
            case 'competitive':
                return '5v5';
            default:
                return mode;
        }
    },

    getRoundLabel(index) {
        switch (index) {
            case 0:
                return 'Quart/Qualification';
            case 1:
                return 'Demi-finales';
            case 2:
                return 'Finale';
            default:
                return `Round ${index + 1}`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            TournamentSystem.init();
        } catch (error) {
            console.error('Erreur initialisation TournamentSystem:', error);
        }
    }, 1400);
});

window.TournamentSystem = TournamentSystem;
