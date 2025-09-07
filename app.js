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
        
        // Default set of names
        this.defaultNames = [
            'Briggs', 'Justin', 'Jen', 'Matt', 'Chanie', 'Joy',
            'Dale', 'Jean', 'Mitch', 'Curtis', 'Sheryl', 'Brent',
            'Kyle', 'Anik', 'Adam', 'Hannah'
        ];
        
        this.initializeEventListeners();
        this.loadFromStorage();
        this.initializeDefaultNames();
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

    initializeDefaultNames() {
        // Add default names to saved players if they don't already exist
        this.defaultNames.forEach(name => {
            if (!this.savedPlayers.includes(name)) {
                this.savedPlayers.push(name);
            }
        });
        
        // Auto-select all default players for the tournament
        this.defaultNames.forEach(name => {
            if (!this.players.find(p => p.name === name)) {
                const player = {
                    id: Date.now().toString() + Math.random(),
                    name: name,
                    teamId: null
                };
                this.players.push(player);
            }
        });
        
        // Update the display after auto-selecting players
        this.updatePlayersDisplay();
        this.updateStartButton();
        
        // Save the updated saved players list
        this.saveToStorage();
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
            const isSelected = this.players.find(p => p.name === playerName) !== undefined;
            playerDiv.innerHTML = `
                <input type="checkbox" class="saved-player-checkbox" id="saved-${playerName}"
                       ${isSelected ? 'checked' : ''}
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
                eliminated: false,
                losses: 0,
                bracket: 'winners', // 'winners' or 'losers'
                totalScore: 0,
                totalOpponentScore: 0,
                scoreDifferential: 0,
                matchesPlayed: 0
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
        this.winnersRound = 1;
        this.losersRound = 1;
        
        // Create first round matches in winners bracket
        const activeTeams = [...this.teams];
        this.createRoundMatches(activeTeams, 1, 'winners');
        this.displayBracket();
    }

    createRoundMatches(teams, round, bracket = 'winners') {
        const roundMatches = [];
        
        // Sort teams by score differential for better matchmaking (except first round)
        let sortedTeams = [...teams];
        if (round > 1) {
            sortedTeams.sort((a, b) => b.scoreDifferential - a.scoreDifferential);
        }
        
        for (let i = 0; i < sortedTeams.length; i += 2) {
            // Skip if we don't have a pair
            if (i + 1 >= sortedTeams.length) break;
            
            const match = {
                id: `match-${bracket}-${round}-${i/2 + 1}`,
                round: round,
                bracket: bracket,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a8e69be (Add default set of names)
                team1: teams[i],
                team2: teams[i + 1],
=======
                team1: sortedTeams[i],
                team2: sortedTeams[i + 1],
>>>>>>> 5fb158c (Add default set of names)
                team1Score: null,
                team2Score: null,
                winner: null,
                loser: null,
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
        
        // Group matches by bracket and round
        const winnersBracket = this.matches.filter(m => m.bracket === 'winners');
        const losersBracket = this.matches.filter(m => m.bracket === 'losers');
        const grandFinal = this.matches.filter(m => m.bracket === 'grand-final');
        
        // Display Winners Bracket
        if (winnersBracket.length > 0) {
            const winnersSection = document.createElement('div');
            winnersSection.className = 'bracket-section winners-bracket';
            winnersSection.innerHTML = '<h2>Winners Bracket</h2>';
            
            const winnersRounds = this.groupMatchesByRound(winnersBracket);
            Object.keys(winnersRounds).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'bracket-round';
                
                const roundTitle = document.createElement('h3');
                roundTitle.textContent = this.getWinnersRoundName(parseInt(round), this.teams.length);
                roundDiv.appendChild(roundTitle);
                
                winnersRounds[round].forEach(match => {
                    const matchDiv = this.createMatchElement(match);
                    roundDiv.appendChild(matchDiv);
                });
                
                winnersSection.appendChild(roundDiv);
            });
            
            bracketContainer.appendChild(winnersSection);
        }
        
        // Display Losers Bracket
        if (losersBracket.length > 0) {
            const losersSection = document.createElement('div');
            losersSection.className = 'bracket-section losers-bracket';
            losersSection.innerHTML = '<h2>Losers Bracket</h2>';
            
            const losersRounds = this.groupMatchesByRound(losersBracket);
            Object.keys(losersRounds).sort((a, b) => parseInt(a) - parseInt(b)).forEach(round => {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'bracket-round';
                
                const roundTitle = document.createElement('h3');
                roundTitle.textContent = `Losers Round ${round}`;
                roundDiv.appendChild(roundTitle);
                
                losersRounds[round].forEach(match => {
                    const matchDiv = this.createMatchElement(match);
                    roundDiv.appendChild(matchDiv);
                });
                
                losersSection.appendChild(roundDiv);
            });
            
            bracketContainer.appendChild(losersSection);
        }
        
        // Display Grand Final
        if (grandFinal.length > 0) {
            const grandFinalSection = document.createElement('div');
            grandFinalSection.className = 'bracket-section grand-final';
            grandFinalSection.innerHTML = '<h2>Grand Final</h2>';
            
            grandFinal.forEach(match => {
                const matchDiv = this.createMatchElement(match);
                grandFinalSection.appendChild(matchDiv);
            });
            
            bracketContainer.appendChild(grandFinalSection);
        }
    }

    groupMatchesByRound(matches = this.matches) {
        const rounds = {};
        matches.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = [];
            }
            rounds[match.round].push(match);
        });
        return rounds;
    }

    getWinnersRoundName(round, totalTeams) {
        const totalRounds = Math.log2(totalTeams);
        if (round === totalRounds) return 'Winners Final';
        if (round === totalRounds - 1) return 'Winners Semi-Final';
        if (round === totalRounds - 2) return 'Winners Quarter-Final';
        return `Winners Round ${round}`;
    }

    createMatchElement(match) {
        const matchDiv = document.createElement('div');
        matchDiv.className = `match ${match.completed ? 'completed' : ''} ${match.bracket}`;
        
        const team1ScoreDisplay = match.team1Score !== null ? ` (${match.team1Score})` : '';
        const team2ScoreDisplay = match.team2Score !== null ? ` (${match.team2Score})` : '';
        
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a8e69be (Add default set of names)
        // Show loss count for teams
        const team1LossDisplay = match.team1.losses > 0 ? ` [${match.team1.losses} loss${match.team1.losses > 1 ? 'es' : ''}]` : '';
        const team2LossDisplay = match.team2.losses > 0 ? ` [${match.team2.losses} loss${match.team2.losses > 1 ? 'es' : ''}]` : '';
        
<<<<<<< HEAD
=======
=======
        // Show loss count and score differential for teams
        const team1LossDisplay = match.team1.losses > 0 ? ` [${match.team1.losses} loss${match.team1.losses > 1 ? 'es' : ''}]` : '';
        const team2LossDisplay = match.team2.losses > 0 ? ` [${match.team2.losses} loss${match.team2.losses > 1 ? 'es' : ''}]` : '';
        
        const team1DiffDisplay = match.team1.matchesPlayed > 0 ? ` (Diff: ${match.team1.scoreDifferential > 0 ? '+' : ''}${match.team1.scoreDifferential})` : '';
        const team2DiffDisplay = match.team2.matchesPlayed > 0 ? ` (Diff: ${match.team2.scoreDifferential > 0 ? '+' : ''}${match.team2.scoreDifferential})` : '';
        
>>>>>>> 5fb158c (Add default set of names)
>>>>>>> a8e69be (Add default set of names)
        matchDiv.innerHTML = `
            <div class="match-teams">
                <div class="match-team ${match.winner === match.team1 ? 'winner' : match.completed && match.loser === match.team1 ? 'loser' : ''}"
                     onclick="app.openScoreModal('${match.id}')">
<<<<<<< HEAD
                    <span class="team-name">${match.team1.player1.name} & ${match.team1.player2.name}${team1ScoreDisplay}${team1LossDisplay}</span>
=======
<<<<<<< HEAD
                    <span class="team-name">${match.team1.player1.name} & ${match.team1.player2.name}${team1ScoreDisplay}${team1LossDisplay}</span>
=======
                    <span class="team-name">${match.team1.player1.name} & ${match.team1.player2.name}${team1ScoreDisplay}${team1LossDisplay}${team1DiffDisplay}</span>
>>>>>>> 5fb158c (Add default set of names)
>>>>>>> a8e69be (Add default set of names)
                    ${!match.completed ? '<button class="enter-score">Enter Score</button>' : ''}
                </div>
                <div class="match-team ${match.winner === match.team2 ? 'winner' : match.completed && match.loser === match.team2 ? 'loser' : ''}"
                     onclick="app.openScoreModal('${match.id}')">
<<<<<<< HEAD
                    <span class="team-name">${match.team2.player1.name} & ${match.team2.player2.name}${team2ScoreDisplay}${team2LossDisplay}</span>
=======
<<<<<<< HEAD
                    <span class="team-name">${match.team2.player1.name} & ${match.team2.player2.name}${team2ScoreDisplay}${team2LossDisplay}</span>
=======
                    <span class="team-name">${match.team2.player1.name} & ${match.team2.player2.name}${team2ScoreDisplay}${team2LossDisplay}${team2DiffDisplay}</span>
>>>>>>> 5fb158c (Add default set of names)
>>>>>>> a8e69be (Add default set of names)
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
        this.currentMatch.loser = team1Score > team2Score ? this.currentMatch.team2 : this.currentMatch.team1;
        this.currentMatch.completed = true;
        
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
        // Update team statistics
        const team1 = this.currentMatch.team1;
        const team2 = this.currentMatch.team2;
        
        // Update score tracking for both teams
        team1.totalScore += team1Score;
        team1.totalOpponentScore += team2Score;
        team1.scoreDifferential = team1.totalScore - team1.totalOpponentScore;
        team1.matchesPlayed++;
        
        team2.totalScore += team2Score;
        team2.totalOpponentScore += team1Score;
        team2.scoreDifferential = team2.totalScore - team2.totalOpponentScore;
        team2.matchesPlayed++;
        
>>>>>>> 5fb158c (Add default set of names)
>>>>>>> a8e69be (Add default set of names)
        // Handle double elimination logic
        const losingTeam = this.currentMatch.loser;
        const winningTeam = this.currentMatch.winner;
        
        if (this.currentMatch.bracket === 'grand-final') {
            // Special grand final logic
            losingTeam.losses++;
            
            if (losingTeam.bracket === 'winners' && losingTeam.losses === 1) {
                // Winners bracket champion lost their first game - create bracket reset
                this.createBracketReset(winningTeam, losingTeam);
            } else {
                // Tournament is over
                this.winner = winningTeam;
                this.showWinner();
            }
        } else {
            // Regular match logic
            losingTeam.losses++;
            
            if (losingTeam.losses >= 2) {
                // Team is eliminated after 2 losses
                losingTeam.eliminated = true;
            } else if (losingTeam.bracket === 'winners') {
                // Move team from winners to losers bracket
                losingTeam.bracket = 'losers';
            }
        }
        
        this.closeScoreModal();
        this.checkRoundComplete();
        this.displayBracket();
        this.saveToStorage();
    }

    checkRoundComplete() {
        // Check if current winners bracket round is complete
        const winnersMatches = this.matches.filter(m =>
            m.bracket === 'winners' && m.round === this.winnersRound
        );
        const winnersComplete = winnersMatches.length > 0 && winnersMatches.every(m => m.completed);
        
        // Check if current losers bracket round is complete
        const losersMatches = this.matches.filter(m =>
            m.bracket === 'losers' && m.round === this.losersRound
        );
        const losersComplete = losersMatches.length === 0 || losersMatches.every(m => m.completed);
        
        if (winnersComplete) {
            const winnersAdvancing = winnersMatches.map(m => m.winner);
            const losersFromWinners = winnersMatches.map(m => m.loser).filter(team => !team.eliminated);
            
            // Check if we have a winners bracket champion
            if (winnersAdvancing.length === 1) {
                const winnersChampion = winnersAdvancing[0];
                
                // Check if there's a losers bracket champion
                const losersChampion = this.getLosersChampion();
                
                // Check if there are any teams that lost from winners bracket but aren't eliminated
                const teamsInLosers = losersFromWinners.filter(team => !team.eliminated);
                
                if (losersChampion && !losersChampion.eliminated) {
                    // Create grand final between winners champion and losers champion
                    this.createGrandFinal(winnersChampion, losersChampion);
                } else if (teamsInLosers.length > 0) {
                    // There are teams in losers bracket but no champion yet
                    // The team that just lost becomes the losers champion (since it's the only one)
                    if (teamsInLosers.length === 1) {
                        this.createGrandFinal(winnersChampion, teamsInLosers[0]);
                    } else {
                        // Multiple teams in losers bracket, need to play them off
                        this.addToLosersBracket(teamsInLosers);
                    }
                } else {
                    // No teams left in losers bracket, winners champion wins
                    this.winner = winnersChampion;
                    this.showWinner();
                }
            } else {
                // Create next winners round
                this.winnersRound++;
                this.createRoundMatches(winnersAdvancing, this.winnersRound, 'winners');
                
                // Add losers from winners bracket to losers bracket
                if (losersFromWinners.length > 0) {
                    this.addToLosersBracket(losersFromWinners);
                }
            }
        }
        
        if (losersComplete && losersMatches.length > 0) {
            const losersAdvancing = losersMatches.map(m => m.winner).filter(team => !team.eliminated);
            
            if (losersAdvancing.length > 1) {
                // Create next losers round
                this.losersRound++;
                this.createRoundMatches(losersAdvancing, this.losersRound, 'losers');
            }
        }
        
        this.currentRound = Math.max(this.winnersRound, this.losersRound);
    }
    
    getLosersChampion() {
        const losersMatches = this.matches.filter(m => m.bracket === 'losers');
        if (losersMatches.length === 0) return null;
        
        const lastRound = Math.max(...losersMatches.map(m => m.round));
        const finalLosersMatches = losersMatches.filter(m => m.round === lastRound && m.completed);
        
        if (finalLosersMatches.length === 1) {
            return finalLosersMatches[0].winner;
        }
        return null;
    }
    
    addToLosersBracket(teams) {
        if (teams.length === 0) return;
        
        // Get existing teams waiting in losers bracket for this round
        const waitingLosersTeams = this.teams.filter(team =>
            team.bracket === 'losers' && !team.eliminated &&
            !this.matches.some(m => m.bracket === 'losers' &&
                (m.team1 === team || m.team2 === team) && !m.completed)
        );
        
        // Combine new losers with waiting teams
        const allLosersTeams = [...waitingLosersTeams, ...teams];
        
        // Create matches if we have enough teams
        if (allLosersTeams.length >= 2) {
            // If odd number, one team gets a bye to next round
            const teamsToMatch = allLosersTeams.length % 2 === 0 ?
                allLosersTeams : allLosersTeams.slice(0, -1);
            
            if (teamsToMatch.length >= 2) {
                this.createRoundMatches(teamsToMatch, this.losersRound, 'losers');
            }
        }
    }
    
    createGrandFinal(winnersChampion, losersChampion) {
        const grandFinal = {
            id: `match-grand-final-1`,
            round: this.currentRound + 1,
            bracket: 'grand-final',
            team1: winnersChampion,
            team2: losersChampion,
            team1Score: null,
            team2Score: null,
            winner: null,
            loser: null,
            completed: false
        };
        
        this.matches.push(grandFinal);
        this.currentRound++;
    }
    
    createBracketReset(losersChampion, winnersChampion) {
        const bracketReset = {
            id: `match-grand-final-2`,
            round: this.currentRound + 1,
            bracket: 'grand-final',
            team1: losersChampion,
            team2: winnersChampion,
            team1Score: null,
            team2Score: null,
            winner: null,
            loser: null,
            completed: false
        };
        
        this.matches.push(bracketReset);
        this.currentRound++;
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