console.log("Rito Esports Tracker popup script loaded!");

// The URL for our deployed backend API
const API_URL = 'https://k1174cudqb.execute-api.us-east-1.amazonaws.com/schedule';

// Define the structure of a Match object for TypeScript
interface Match {
    id: number;
    league: 'Valorant' | 'LoL'; // The table's partition key
    game: 'Valorant' | 'LoL';
    leagueName: string; // e.g., "LEC", "VCT Americas"
    series: string; // e.g., "Summer Split 2024", "Stage 2"
    teamA: string;
    teamB: string;
    time: string;
    teamA_logo: string | null;
    teamB_logo: string | null;
    status: 'not_started' | 'running' | 'finished' | 'canceled';
}

// --- DOM Elements ---
const container = document.getElementById("schedule-container");
const valorantBtn = document.getElementById("valorant-btn");
const lolBtn = document.getElementById("lol-btn");
const valorantFilters = document.getElementById("valorant-filters");
const lolFilters = document.getElementById("lol-filters");
const valorantFilterBtns = document.querySelectorAll("#valorant-filters .filter-btn");
const lolFilterBtns = document.querySelectorAll("#lol-filters .filter-btn");
const upcomingBtn = document.getElementById("upcoming-btn");
const pastBtn = document.getElementById("past-btn");

// --- State ---
let allMatches: Match[] = [];
let selectedGame: 'Valorant' | 'LoL' = 'Valorant';
let selectedValorantFilter: string = 'all';
let selectedLolFilter: string = 'all';
let selectedTimePeriod: 'upcoming' | 'past' = 'upcoming';

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

    // 1. Filter by time period (Upcoming vs. Past)
    let timeFilteredMatches = allMatches.filter(match => {
        if (selectedTimePeriod === 'upcoming') {
            return match.status === 'not_started' || match.status === 'running';
        } else { // 'past'
            return match.status === 'finished' || match.status === 'canceled';
        }
    });

    // 2. Filter by selected game (Valorant or LoL)
    let gameFilteredMatches = timeFilteredMatches.filter(match => match.game === selectedGame);

    // 3. Apply game-specific filters
    let fullyFilteredMatches = gameFilteredMatches;
    if (selectedGame === 'Valorant') {
        fullyFilteredMatches = gameFilteredMatches.filter(match => {
            // Defensive check for data consistency
            if (!match.series && !match.leagueName) return false;
            const seriesName = (match.series || '').toLowerCase();
            const leagueName = (match.leagueName || '').toLowerCase();
            const combinedName = `${seriesName} ${leagueName}`;

            switch (selectedValorantFilter) {
                case 'all':
                    return true;
                case 'vct':
                    return combinedName.includes('vct');
                case 'challengers-gc':
                    return combinedName.includes('challengers') || combinedName.includes('game changers');
                case 'other':
                    return !combinedName.includes('vct') && !combinedName.includes('challengers') && !combinedName.includes('game changers');
                default:
                    return true;
            }
        });
    } else if (selectedGame === 'LoL') {
        fullyFilteredMatches = gameFilteredMatches.filter(match => {
            if (!match.series && !match.leagueName) return false;
            const seriesName = (match.series || '').toLowerCase();
            const leagueName = (match.leagueName || '').toLowerCase();

            switch (selectedLolFilter) {
                case 'all':
                    return true;
                case 'lck':
                    return seriesName.includes('lck') || leagueName.includes('lck');
                case 'lec':
                    return seriesName.includes('lec') || leagueName.includes('lec');
                case 'lta':
                    // LTA is Liga Latinoamérica, which is 'LLA' in the API
                    return seriesName.includes('lla') || leagueName.includes('lla');
                case 'tournaments':
                    return seriesName.includes('worlds') || seriesName.includes('mid-season invitational') || seriesName.includes('msi') ||
                           leagueName.includes('worlds') || leagueName.includes('mid-season invitational') || leagueName.includes('msi');
                case 'other':
                    return !seriesName.includes('lck') && !seriesName.includes('lec') && !seriesName.includes('lla') && !seriesName.includes('lpl') && !seriesName.includes('lcs') && !seriesName.includes('worlds') && !seriesName.includes('mid-season invitational') && !seriesName.includes('msi') &&
                           !leagueName.includes('lck') && !leagueName.includes('lec') && !leagueName.includes('lla') && !leagueName.includes('lpl') && !leagueName.includes('lcs') && !leagueName.includes('worlds') && !leagueName.includes('mid-season invitational') && !leagueName.includes('msi');
                default:
                    return true;
            }
        });
    }

    // Clear any previous content
    container.innerHTML = "";

    if (fullyFilteredMatches.length === 0) {
        container.innerHTML = `<p>No ${selectedTimePeriod} ${selectedGame} matches found.</p>`;
        return;
    }

    // Create and append an element for each match
    fullyFilteredMatches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        
        // Choose the best title: prefer series, fallback to leagueName, then to game
        const title = (match.series && match.series.length > 4) 
                      ? match.series 
                      : (match.leagueName || match.game);
        
        const time = match.time ? new Date(match.time).toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }) : 'Date TBD';

        // Use a placeholder for missing logos, or just an empty string.
        const teamALogo = match.teamA_logo || '';
        const teamBLogo = match.teamB_logo || '';

        matchElement.innerHTML = `
            <div class="league">${title}</div>
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

    valorantFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            if (filter) {
                selectValorantFilter(filter);
            }
        });
    });

    lolFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            if (filter) {
                selectLolFilter(filter);
            }
        });
    });

    upcomingBtn?.addEventListener('click', () => selectTimePeriod('upcoming'));
    pastBtn?.addEventListener('click', () => selectTimePeriod('past'));

    if (container) {
        container.innerHTML = "<p>Loading schedule...</p>";
        allMatches = await fetchSchedule();
        // --- START DEBUG LOG ---
        // console.log("--- RAW DATA FROM BACKEND ---");
        // console.log(JSON.stringify(allMatches, null, 2));
        // console.log("--- END RAW DATA ---");
        // --- END DEBUG LOG ---
        renderMatches();
    }
}

/**
 * Handles the logic for selecting a game.
 * @param game The game to select ('Valorant' or 'LoL')
 */
function selectGame(game: 'Valorant' | 'LoL') {
    selectedGame = game;
    // Update button styles and visibility of filters
    if (game === 'Valorant') {
        valorantBtn?.classList.add('active');
        lolBtn?.classList.remove('active');
        valorantFilters?.style.setProperty('display', 'flex');
        lolFilters?.style.setProperty('display', 'none');
    } else {
        lolBtn?.classList.add('active');
        valorantBtn?.classList.remove('active');
        valorantFilters?.style.setProperty('display', 'none');
        lolFilters?.style.setProperty('display', 'flex'); // Show LoL filters
    }
    // Re-render the match list
    renderMatches();
}

/**
 * Handles the logic for selecting a Valorant filter.
 * @param filter The filter to select.
 */
function selectValorantFilter(filter: string) {
    selectedValorantFilter = filter;
    // Update button styles
    valorantFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Re-render with the new filter
    renderMatches();
}

/**
 * Handles the logic for selecting a LoL filter.
 * @param filter The filter to select.
 */
function selectLolFilter(filter: string) {
    selectedLolFilter = filter;
    // Update button styles
    lolFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    // Re-render with the new filter
    renderMatches();
}

/**
 * Handles the logic for selecting a time period.
 * @param period The time period to select ('upcoming' or 'past')
 */
function selectTimePeriod(period: 'upcoming' | 'past') {
    selectedTimePeriod = period;

    if (period === 'upcoming') {
        upcomingBtn?.classList.add('active');
        pastBtn?.classList.remove('active');
    } else {
        pastBtn?.classList.add('active');
        upcomingBtn?.classList.remove('active');
    }

    renderMatches();
}

// Run the main function
main(); 