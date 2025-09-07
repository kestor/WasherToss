// Washer Toss App - Main Application Logic
class WasherTossApp {
    constructor() {
        this.players = [];
        this.savedPlayers = [];
        this.teams = [];
        this.matches = [];
        this.currentRound = 1;
        this.winner = null;
        this.currentMatch = null;
        
        this.initializeEventListeners();
        this.loadFromStorage();
        this.displaySavedPlayers();
    }

    initializeEventListeners() {
        // Player Registration
        document.getElementById('add-player').addEventListener('click', () => this.addNewPlayer());
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewPlayer();
        });
        document.getElementById('start-tournament').addEventListener('click', () => this.startTournament());

        // Team Formation
        document.getElementById('confirm-teams').addEventListener('click', () => this.confirmTeams());
        document.getElementById('shuffle-teams').addEventListener('click', () => this.shuffleTeams());

        // Tournament Controls
        document.getElementById('new-tournament').addEventListener('click', () => this.resetTournament());
        document.getElementById('start-new-tournament').addEventListener('click', () => this.resetTournament());

        // Score Modal
        document.getElementById('submit-scores').addEventListener('click', () => this.submitScores());
        document.getElementById('cancel-scores').addEventListener('click', () => this.closeScoreModal());
    }

    loadFromStorage() {
        // Load saved players
        const savedPlayersData = localStorage.getItem('washerTossSavedPlayers');
        if (savedPlayersData) {
            this.savedPlayers = JSON.parse(savedPlayersData);
        }

        // Load current tournament state
        const tournamentData = localStorage.getItem('washerTossTournament');
        if (tournamentData) {
            const data = JSON.parse(tournamentData);
            this.players = data.players || [];
            this.teams = data.teams || [];
            this.matches = data.matches || [];
            this.currentRound = data.currentRound || 1;
            this.winner = data.winner || null;
            
            this.updatePlayersDisplay();
            this.updateStartButton();
            
            // Determine which screen to show
            if (this.winner) {
                this.showWinner();
            } else if (this.matches.length > 0) {
                this.displayBracket();
                this.showScreen('tournament-bracket');
            } else if (this.teams.length > 0) {
                this.displayTeams();
                this.showScreen('team-formation');
            }
        }
    }

    saveToStorage() {
        // Save current tournament state
        const tournamentData = {
            players: this.players,
            teams: this.teams,
            matches: this.matches,
            currentRound: this.currentRound,
            winner: this.winner
        };
        localStorage.setItem('washerTossTournament', JSON.stringify(tournamentData));

        // Save players list
        localStorage.setItem('washerTossSavedPlayers', JSON.stringify(this.savedPlayers));
    }

    displaySavedPlayers() {
        const savedPlayersList = document.getElementById('saved-players-list');
        savedPlayersList.innerHTML = '';
        
        if (this.savedPlayers.length === 0) {
            savedPlayersList.innerHTML = '<p style="color: #666; font-style: italic;">No saved players yet</p>';
            return;
        }

        this.savedPlayers.forEach(playerName => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'saved-player-item';
            playerDiv.innerHTML = `
                <input type="checkbox" class="saved-player-checkbox" id="saved-${playerName}" 
                       onchange="app.toggleSavedPlayer('${playerName}', this.checked)">
                <label for="saved-${playerName}">${playerName}</label>
            `;
            savedPlayersList.appendChild(playerDiv);
        });
    }

    toggleSavedPlayer(playerName, isSelected) {
        if (isSelected) {
            // Add to tournament players if not already added
            if (!this.players.find(p => p.name === playerName)) {
                const player = {
                    id: Date.now().toString() + Math.random(),
                    name: playerName,
                    teamId: null
                };
                this.players.push(player);
            }
        } else {
            // Remove from tournament players
            this.players = this.players.filter(p => p.name !== playerName);
        }
        
        this.updatePlayersDisplay();
        this.updateStartButton();
        this.saveToStorage();
    }

    addNewPlayer() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a player name');
            return;
        }
        
        if (this.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Player already selected for this tournament');
            return;
        }
        
        // Add to saved players if not already there
        if (!this.savedPlayers.includes(name)) {
            this.savedPlayers.push(name);
            this.displaySavedPlayers();
        }
        
        // Add to current tournament
        const player = {
            id: Date.now().toString() + Math.random(),
            name: name,
            teamId: null
        };
        
        this.players.push(player);
        nameInput.value = '';
        
        // Check the corresponding saved player checkbox
        const checkbox = document.getElementById(`saved-${name}`);
        if (checkbox) {
            checkbox.checked = true;
        }
        
        this.updatePlayersDisplay();
        this.updateStartButton();
        this.saveToStorage();
    }

    removePlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            // Uncheck the saved player checkbox
            const checkbox = document.getElementById(`saved-${player.name}`);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
        
        this.players = this.players.filter(p => p.id !== playerId);
        this.updatePlayersDisplay();
        this.updateStartButton();
        this.saveToStorage();
    }

    updatePlayersDisplay() {
        const playersList = document.getElementById('players-ul');
        const playerCount = document.getElementById('player-count');
        
        playerCount.textContent = this.players.length;
        playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `
                <span>${player.name}</span>
                <button class="remove-player" onclick="app.removePlayer('${player.id}')">Remove</button>
            `;
            playersList.appendChild(li);
        });
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-tournament');
        const canStart = this.players.length >= 4 && this.players.length % 2 === 0;
        startBtn.disabled = !canStart;
        
        if (this.players.length < 4) {
            startBtn.textContent = `Need ${4 - this.players.length} more players (min 4)`;
        } else if (this.players.length % 2 !== 0) {
            startBtn.textContent = 'Need even number of players';
        } else {
            startBtn.textContent = `Start Tournament (${this.players.length} players)`;
        }
    }

    startTournament() {
        if (this.players.length < 4 || this.players.length % 2 !== 0) {
            alert('Need at least 4 players and an even number of players');
            return;
        }
        
        this.createTeams();
        this.showScreen('team-formation');
    }

    createTeams() {
        // Shuffle players randomly
        const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
        this.teams = [];
        
        // Create teams of 2
        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            const team = {
                id: `team-${i/2 + 1}`,
                player1: shuffledPlayers[i],
                player2: shuffledPlayers[i + 1],
                eliminated: false
            };
            this.teams.push(team);
        }
        
        this.displayTeams();
    }

    shuffleTeams() {
        this.createTeams();
    }

    displayTeams() {
        const teamsDisplay = document.getElementById('teams-display');
        teamsDisplay.innerHTML = '';
        
        this.teams.forEach((team, index) => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team-card';
            teamDiv.innerHTML = `
                <h4>Team ${index + 1}</h4>
                <div class="team-players">
                    <span class="team-player">${team.player1.name}</span>
                    <span class="vs">&</span>
                    <span class="team-player">${team.player2.name}</span>
                </div>
            `;
            teamsDisplay.appendChild(teamDiv);
        });
    }

    confirmTeams() {
        this.generateBracket();
        this.showScreen('tournament-bracket');
    }

    generateBracket() {
        this.matches = [];
        this.currentRound = 1;
        
        // Create first round matches
        const activeTeams = [...this.teams];
        this.createRoundMatches(activeTeams, 1);
        this.displayBracket();
    }

    createRoundMatches(teams, round) {
        const roundMatches = [];
        
        for (let i = 0; i < teams.length; i += 2) {
            const match = {
                id: `match-${round}-${i/2 + 1}`,
                round: round,
                team1: teams[i],
                team2: teams[i + 1],
                team1Score: null,
                team2Score: null,
                winner: null,
                completed: false
            };
            roundMatches.push(match);
        }
        
        this.matches.push(...roundMatches);
        return roundMatches;
    }

    displayBracket() {
        const bracketContainer = document.getElementById('bracket-container');
        bracketContainer.innerHTML = '';
        
        const rounds = this.groupMatchesByRound();
        
        Object.keys(rounds).forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'bracket-round';
            
            const roundTitle = document.createElement('h3');
            roundTitle.textContent = this.getRoundName(parseInt(round), this.teams.length);
            roundDiv.appendChild(roundTitle);
            
            rounds[round].forEach(match => {
                const matchDiv = this.createMatchElement(match);
                roundDiv.appendChild(matchDiv);
            });
            
            bracketContainer.appendChild(roundDiv);
        });
    }

    groupMatchesByRound() {
        const rounds = {};
        this.matches.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = [];
            }
            rounds[match.round].push(match);
        });
        return rounds;
    }

    getRoundName(round, totalTeams) {
        const totalRounds = Math.log2(totalTeams);
        if (round === totalRounds) return 'Final';
        if (round === totalRounds - 1) return 'Semi-Final';
        if (round === totalRounds - 2) return 'Quarter-Final';
        return `Round ${round}`;
    }

    createMatchElement(match) {
        const matchDiv = document.createElement('div');
        matchDiv.className = `match ${match.completed ? 'completed' : ''}`;
        
        const team1ScoreDisplay = match.team1Score !== null ? ` (${match.team1Score})` : '';
        const team2ScoreDisplay = match.team2Score !== null ? ` (${match.team2Score})` : '';
        
        matchDiv.innerHTML = `
            <div class="match-teams">
                <div class="match-team ${match.winner === match.team1 ? 'winner' : match.completed ? 'eliminated' : ''}" 
                     onclick="app.openScoreModal('${match.id}')">
                    <span class="team-name">${match.team1.player1.name} & ${match.team1.player2.name}${team1ScoreDisplay}</span>
                    ${!match.completed ? '<button class="enter-score">Enter Score</button>' : ''}
                </div>
                <div class="match-team ${match.winner === match.team2 ? 'winner' : match.completed ? 'eliminated' : ''}" 
                     onclick="app.openScoreModal('${match.id}')">
                    <span class="team-name">${match.team2.player1.name} & ${match.team2.player2.name}${team2ScoreDisplay}</span>
                    ${!match.completed ? '<button class="enter-score">Enter Score</button>' : ''}
                </div>
            </div>
        `;
        return matchDiv;
    }

    openScoreModal(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match || match.completed) return;
        
        this.currentMatch = match;
        
        // Set team labels
        document.getElementById('team1-label').textContent = `${match.team1.player1.name} & ${match.team1.player2.name}`;
        document.getElementById('team2-label').textContent = `${match.team2.player1.name} & ${match.team2.player2.name}`;
        
        // Clear previous scores
        document.getElementById('team1-score').value = '';
        document.getElementById('team2-score').value = '';
        
        // Show modal
        document.getElementById('score-modal').classList.add('active');
    }

    closeScoreModal() {
        document.getElementById('score-modal').classList.remove('active');
        this.currentMatch = null;
    }

    submitScores() {
        if (!this.currentMatch) return;
        
        const team1Score = parseInt(document.getElementById('team1-score').value);
        const team2Score = parseInt(document.getElementById('team2-score').value);
        
        if (isNaN(team1Score) || isNaN(team2Score)) {
            alert('Please enter valid scores for both teams');
            return;
        }
        
        if (team1Score === team2Score) {
            alert('Scores cannot be tied. Please enter different scores.');
            return;
        }
        
        // Update match with scores
        this.currentMatch.team1Score = team1Score;
        this.currentMatch.team2Score = team2Score;
        this.currentMatch.winner = team1Score > team2Score ? this.currentMatch.team1 : this.currentMatch.team2;
        this.currentMatch.completed = true;
        
        // Mark losing team as eliminated
        const losingTeam = team1Score > team2Score ? this.currentMatch.team2 : this.currentMatch.team1;
        losingTeam.eliminated = true;
        
        this.closeScoreModal();
        this.checkRoundComplete();
        this.displayBracket();
        this.saveToStorage();
    }

    checkRoundComplete() {
        const currentRoundMatches = this.matches.filter(m => m.round === this.currentRound);
        const allCompleted = currentRoundMatches.every(m => m.completed);
        
        if (allCompleted) {
            const winners = currentRoundMatches.map(m => m.winner);
            
            if (winners.length === 1) {
                // Tournament complete
                this.winner = winners[0];
                this.showWinner();
            } else {
                // Create next round
                this.currentRound++;
                this.createRoundMatches(winners, this.currentRound);
            }
        }
    }

    showWinner() {
        const winnerDisplay = document.getElementById('winner-display');
        winnerDisplay.innerHTML = `
            <h3>🏆 Champions! 🏆</h3>
            <div class="winner-team">
                ${this.winner.player1.name} & ${this.winner.player2.name}
            </div>
        `;
        this.showScreen('winner-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    resetTournament() {
        this.players = [];
        this.teams = [];
        this.matches = [];
        this.currentRound = 1;
        this.winner = null;
        this.currentMatch = null;
        
        // Uncheck all saved player checkboxes
        document.querySelectorAll('.saved-player-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.updatePlayersDisplay();
        this.updateStartButton();
        this.showScreen('player-registration');
        this.saveToStorage();
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WasherTossApp();
});