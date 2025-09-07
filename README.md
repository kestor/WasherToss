# Tournament App

A Progressive Web App (PWA) for managing single elimination tournaments with teams of 2 players.

## Features

- **Player Registration**: Add players with validation
- **Automatic Team Formation**: Players are randomly paired into teams of 2
- **Single Elimination Bracket**: Visual tournament bracket
- **Match Result Entry**: Click to select winners and advance bracket
- **Data Persistence**: Tournament state is saved locally
- **Mobile Optimized**: Responsive design for iPhone/mobile devices
- **Installable**: Can be installed as an app on iPhone

## How to Use

### 1. Player Registration
- Enter player names one by one
- Minimum 4 players required
- Must have even number of players
- Click "Start Tournament" when ready

### 2. Team Formation
- Players are automatically paired into teams of 2
- Click "Shuffle Teams" to re-randomize pairings
- Click "Confirm Teams" to proceed

### 3. Tournament Bracket
- Visual bracket shows all matches
- Click on a team to select them as the winner
- Tournament progresses automatically
- Winner is announced at the end

## Installation on iPhone

### Method 1: Direct File Access
1. Open Safari on your iPhone
2. Navigate to the `index.html` file location
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name the app "Tournament" and tap "Add"

### Method 2: Local Server (Recommended)
1. Serve the files using a local web server
2. Open Safari and navigate to the server URL
3. Tap Share → "Add to Home Screen"
4. The app will install with full PWA features

### Method 3: File Hosting
1. Upload all files to a web hosting service
2. Access the URL in Safari on your iPhone
3. Add to Home Screen as above

## Technical Details

- **Technology**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: localStorage for data persistence
- **Responsive**: Mobile-first design
- **PWA**: Manifest file for app installation
- **Compatibility**: Works on all modern browsers

## File Structure

```
TournamentApp/
├── index.html          # Main app interface
├── app.js             # Tournament logic
├── styles.css         # Mobile-optimized styles
├── manifest.json      # PWA configuration
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
├── create-icons.html  # Icon generator utility
└── README.md          # This file
```

## Tournament Rules

- Single elimination format
- Teams of exactly 2 players
- Minimum 4 players (2 teams) required
- Maximum depends on device performance
- Winners advance, losers are eliminated
- Final winner is crowned champion

## Browser Support

- Safari (iOS) - Primary target
- Chrome (Android/Desktop)
- Firefox (Desktop/Mobile)
- Edge (Desktop/Mobile)

Enjoy your tournaments! 🏆