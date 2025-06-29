console.log("Rito Esports Tracker popup script loaded!");

// The URL for our deployed backend API
const API_URL = 'https://k1174cudqb.execute-api.us-east-1.amazonaws.com/schedule';

// Define the structure of a Match object for TypeScript
interface Match {
    id: number;
    league: 'Valorant' | 'LoL';
    teamA: string;
    teamB: string;
    time: string;
    teamA_logo: string | null;
    teamB_logo: string | null;
}

// --- DOM Elements ---
const container = document.getElementById("schedule-container");
const valorantBtn = document.getElementById("valorant-btn");
const lolBtn = document.getElementById("lol-btn");

// --- State ---
let allMatches: Match[] = [];
let selectedGame: 'Valorant' | 'LoL' = 'Valorant';

/**
 * Fetches the match schedule from the backend API.
 * @returns A promise that resolves to an array of Match objects.
 */
async function fetchSchedule(): Promise<Match[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as Match[];
    } catch (error) {
        console.error("Failed to fetch schedule:", error);
        return []; // Return an empty array on error
    }
}

/**
 * Renders the provided matches into the container element, filtering by the selected game.
 */
function renderMatches(): void {
    if (!container) return;

    // Filter matches based on the selected game
    const filteredMatches = allMatches.filter(match => match.league === selectedGame);

    // Clear any previous content
    container.innerHTML = "";

    if (filteredMatches.length === 0) {
        container.innerHTML = `<p>No upcoming ${selectedGame} matches found.</p>`;
        return;
    }

    // Create and append an element for each match
    filteredMatches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        
        const time = new Date(match.time).toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });

        // Use a placeholder for missing logos, or just an empty string.
        const teamALogo = match.teamA_logo || '';
        const teamBLogo = match.teamB_logo || '';

        matchElement.innerHTML = `
            <div class="league">${match.league}</div>
            <div class="teams">
                <div class="team">
                    <img src="${teamALogo}" class="logo" style="display: ${teamALogo ? 'block' : 'none'};">
                    <span>${match.teamA}</span>
                </div>
                <span class="vs">vs</span>
                <div class="team">
                    <img src="${teamBLogo}" class="logo" style="display: ${teamBLogo ? 'block' : 'none'};">
                    <span>${match.teamB}</span>
                </div>
            </div>
            <div class="time">${time}</div>
        `;
        container.appendChild(matchElement);
    });
}

/**
 * Main function that runs when the popup is opened.
 */
async function main() {
    // Setup button listeners
    valorantBtn?.addEventListener('click', () => selectGame('Valorant'));
    lolBtn?.addEventListener('click', () => selectGame('LoL'));

    if (container) {
        container.innerHTML = "<p>Loading schedule...</p>";
        allMatches = await fetchSchedule();
        renderMatches();
    }
}

/**
 * Handles the logic for selecting a game.
 * @param game The game to select ('Valorant' or 'LoL')
 */
function selectGame(game: 'Valorant' | 'LoL') {
    selectedGame = game;
    // Update button styles
    if (game === 'Valorant') {
        valorantBtn?.classList.add('active');
        lolBtn?.classList.remove('active');
    } else {
        lolBtn?.classList.add('active');
        valorantBtn?.classList.remove('active');
    }
    // Re-render the match list
    renderMatches();
}

// Run the main function
main(); 