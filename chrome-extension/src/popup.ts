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
}

// Get the container element from the DOM
const container = document.getElementById("schedule-container");

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
 * Renders the provided matches into the container element.
 * @param matches An array of Match objects to render.
 */
function renderMatches(matches: Match[]): void {
    if (!container) return;

    // Clear any previous content (like the "Loading..." message)
    container.innerHTML = "";

    if (matches.length === 0) {
        container.innerHTML = "<p>No upcoming matches found.</p>";
        return;
    }

    // Create and append an element for each match
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        
        const time = new Date(match.time).toLocaleString();

        matchElement.innerHTML = `
            <div class="league">${match.league}</div>
            <div class="teams">${match.teamA} vs ${match.teamB}</div>
            <div class="time">${time}</div>
        `;
        container.appendChild(matchElement);
    });
}

/**
 * Main function that runs when the popup is opened.
 */
async function main() {
    if (container) {
        container.innerHTML = "<p>Loading schedule...</p>";
        const matches = await fetchSchedule();
        renderMatches(matches);
    }
}

// Run the main function
main(); 