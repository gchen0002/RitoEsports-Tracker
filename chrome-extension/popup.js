"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("Rito Esports Tracker popup script loaded!");
// The URL for our deployed backend API
const API_URL = 'https://k1174cudqb.execute-api.us-east-1.amazonaws.com/schedule';
// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const CACHE_KEY = 'ritoesports_cache';
// Check cache before API call
function getCachedData() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const cacheData = JSON.parse(cached);
        const now = Date.now();
        if (now - cacheData.timestamp < CACHE_DURATION) {
            return cacheData.data;
        }
    }
    return null;
}
// Save data to cache
function setCachedData(data) {
    const cacheData = {
        data: data,
        timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}
// --- DOM Elements ---
const container = document.getElementById("schedule-container");
const valorantBtn = document.getElementById("valorant-btn");
const lolBtn = document.getElementById("lol-btn");
const valorantFilters = document.getElementById("valorant-filters");
const lolFilters = document.getElementById("lol-filters");
const valorantFilterBtns = document.querySelectorAll("#valorant-filters .filter-btn");
const lolFilterBtns = document.querySelectorAll("#lol-filters .filter-btn");
const liveBtn = document.getElementById("live-btn");
const upcomingBtn = document.getElementById("upcoming-btn");
const pastBtn = document.getElementById("past-btn");
// --- State ---
let allMatches = [];
let selectedGame = 'Valorant';
let selectedValorantFilter = 'all';
let selectedLolFilter = 'all';
let selectedTimePeriod = 'upcoming';
// Keep track of current active tab and filter
let currentTab = 'lol';
let currentFilter = 'all';
const API_BASE_URL = 'https://k1174cudqb.execute-api.us-east-1.amazonaws.com';
/**
 * Fetches the match schedule from the backend API.
 * @returns A promise that resolves to an array of Match objects.
 */
function fetchSchedule() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            return data;
        }
        catch (error) {
            console.error("Failed to fetch schedule:", error);
            return []; // Return an empty array on error
        }
    });
}
/**
 * Renders the provided matches into the container element, filtering by the selected game.
 */
function renderMatches() {
    if (!container)
        return;
    console.log(`RitoEsports Tracker: Rendering matches. Total matches: ${allMatches.length}, Selected game: ${selectedGame}, Time period: ${selectedTimePeriod}`);
    // 1. Filter by time period (Live, Upcoming, Past)
    let timeFilteredMatches = allMatches.filter(match => {
        if (selectedTimePeriod === 'live') {
            return match.status === 'running';
        }
        else if (selectedTimePeriod === 'upcoming') {
            return match.status === 'not_started';
        }
        else { // 'past'
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
            if (!match.series && !match.leagueName)
                return false;
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
    }
    else if (selectedGame === 'LoL') {
        fullyFilteredMatches = gameFilteredMatches.filter(match => {
            if (!match.series && !match.leagueName)
                return false;
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
    // 4. Sort matches by time based on the selected period
    fullyFilteredMatches.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        if (selectedTimePeriod === 'live') {
            // For live matches: sort by start time (earliest first)
            return timeA - timeB;
        }
        else if (selectedTimePeriod === 'upcoming') {
            // For upcoming matches: sort ascending (earliest first)
            return timeA - timeB;
        }
        else {
            // For past matches: sort descending (most recent completed first)
            return timeB - timeA;
        }
    });
    // Clear any previous content
    container.innerHTML = "";
    if (fullyFilteredMatches.length === 0) {
        const periodText = selectedTimePeriod === 'live' ? 'live' : selectedTimePeriod;
        container.innerHTML = `<p>No ${periodText} ${selectedGame} matches found.</p>`;
        return;
    }
    // Create and append an element for each match
    fullyFilteredMatches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        // Add live styling for running matches
        if (match.status === 'running') {
            matchElement.classList.add('live');
        }
        // Build title: league (series)
        let title = match.leagueName || 'Unknown League';
        if (match.series) {
            title += ` (${match.series})`;
        }
        // Format the time differently for live, past vs upcoming matches
        const matchTime = new Date(match.time);
        let timeDisplay;
        if (match.status === 'running') {
            // For live matches, show LIVE indicator
            timeDisplay = `<div class="live-indicator"><div class="live-dot"></div>LIVE</div>`;
        }
        else if (match.status === 'finished' || match.status === 'canceled') {
            // For past matches, show just the date
            timeDisplay = matchTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
        else {
            // For upcoming matches, show date and time
            timeDisplay = matchTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }) + ', ' + matchTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
        // Determine if this is a finished or live match with scores
        const isFinished = match.status === 'finished';
        const isLive = match.status === 'running';
        const hasScores = (isFinished || isLive) && match.teamA_score !== null && match.teamB_score !== null;
        // Determine winner styling
        const teamAIsWinner = hasScores && match.winner_id === match.teamA_id;
        const teamBIsWinner = hasScores && match.winner_id === match.teamB_id;
        // Build score display for finished matches
        let scoreDisplay = '';
        if (hasScores) {
            scoreDisplay = `
                <div class="score-container">
                    <span class="score ${teamAIsWinner ? 'winner' : ''}">${match.teamA_score}</span>
                    <span class="score-separator">-</span>
                    <span class="score ${teamBIsWinner ? 'winner' : ''}">${match.teamB_score}</span>
                </div>
            `;
        }
        // Build match summary
        let matchSummary = '';
        if (hasScores && isFinished) {
            const winnerName = teamAIsWinner ? match.teamA : teamBIsWinner ? match.teamB : 'No winner';
            matchSummary = `
                <div class="match-summary">
                    <span class="winner-indicator">${winnerName} wins</span>
                    ${match.number_of_games ? `<span class="series-info">Best of ${match.number_of_games}</span>` : ''}
                </div>
            `;
        }
        else if (hasScores && isLive) {
            matchSummary = `
                <div class="match-summary">
                    <span class="live-indicator">Match in progress</span>
                    ${match.number_of_games ? `<span class="series-info">Best of ${match.number_of_games}</span>` : ''}
                </div>
            `;
        }
        else if (match.status === 'canceled') {
            matchSummary = `
                <div class="match-summary">
                    <span class="status-indicator canceled">Canceled</span>
                </div>
            `;
        }
        matchElement.innerHTML = `
            <div class="match-header">
                <div class="league">${title}</div>
            </div>
            <div class="teams">
                <div class="team ${teamAIsWinner ? 'winner' : ''}">
                    ${match.teamA_logo ? `<img src="${match.teamA_logo}" alt="${match.teamA}" class="logo">` : ''}
                    <span>${match.teamA}</span>
                </div>
                ${scoreDisplay || '<div class="vs">vs</div>'}
                <div class="team ${teamBIsWinner ? 'winner' : ''}">
                    ${match.teamB_logo ? `<img src="${match.teamB_logo}" alt="${match.teamB}" class="logo">` : ''}
                    <span>${match.teamB}</span>
                </div>
            </div>
            <div class="match-time">${timeDisplay}</div>
            ${matchSummary}
        `;
        container.appendChild(matchElement);
    });
}
/**
 * Main function that runs when the popup is opened.
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('RitoEsports Tracker: Starting main function');
        // Setup button listeners
        valorantBtn === null || valorantBtn === void 0 ? void 0 : valorantBtn.addEventListener('click', () => selectGame('Valorant'));
        lolBtn === null || lolBtn === void 0 ? void 0 : lolBtn.addEventListener('click', () => selectGame('LoL'));
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
        liveBtn === null || liveBtn === void 0 ? void 0 : liveBtn.addEventListener('click', () => selectTimePeriod('live'));
        upcomingBtn === null || upcomingBtn === void 0 ? void 0 : upcomingBtn.addEventListener('click', () => selectTimePeriod('upcoming'));
        pastBtn === null || pastBtn === void 0 ? void 0 : pastBtn.addEventListener('click', () => selectTimePeriod('past'));
        if (container) {
            container.innerHTML = "<p>Loading schedule...</p>";
            try {
                allMatches = yield fetchScheduleData();
                renderMatches();
            }
            catch (error) {
                console.error('Failed to load schedule data:', error);
                container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc3545;">
                    <p><strong>Unable to load matches</strong></p>
                    <p style="font-size: 14px; margin: 10px 0;">Check your internet connection and try again.</p>
                    <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                        Retry
                    </button>
                </div>
            `;
            }
        }
    });
}
/**
 * Handles the logic for selecting a game.
 * @param game The game to select ('Valorant' or 'LoL')
 */
function selectGame(game) {
    selectedGame = game;
    // Update button styles and visibility of filters
    if (game === 'Valorant') {
        valorantBtn === null || valorantBtn === void 0 ? void 0 : valorantBtn.classList.add('active');
        lolBtn === null || lolBtn === void 0 ? void 0 : lolBtn.classList.remove('active');
        valorantFilters === null || valorantFilters === void 0 ? void 0 : valorantFilters.style.setProperty('display', 'flex');
        lolFilters === null || lolFilters === void 0 ? void 0 : lolFilters.style.setProperty('display', 'none');
    }
    else {
        lolBtn === null || lolBtn === void 0 ? void 0 : lolBtn.classList.add('active');
        valorantBtn === null || valorantBtn === void 0 ? void 0 : valorantBtn.classList.remove('active');
        valorantFilters === null || valorantFilters === void 0 ? void 0 : valorantFilters.style.setProperty('display', 'none');
        lolFilters === null || lolFilters === void 0 ? void 0 : lolFilters.style.setProperty('display', 'flex'); // Show LoL filters
    }
    // Re-render the match list
    renderMatches();
}
/**
 * Handles the logic for selecting a Valorant filter.
 * @param filter The filter to select.
 */
function selectValorantFilter(filter) {
    selectedValorantFilter = filter;
    // Update button styles
    valorantFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
        else {
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
function selectLolFilter(filter) {
    selectedLolFilter = filter;
    // Update button styles
    lolFilterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
        else {
            btn.classList.remove('active');
        }
    });
    // Re-render with the new filter
    renderMatches();
}
/**
 * Handles the logic for selecting a time period.
 * @param period The time period to select ('live', 'upcoming' or 'past')
 */
function selectTimePeriod(period) {
    selectedTimePeriod = period;
    // Clear all active states
    liveBtn === null || liveBtn === void 0 ? void 0 : liveBtn.classList.remove('active');
    upcomingBtn === null || upcomingBtn === void 0 ? void 0 : upcomingBtn.classList.remove('active');
    pastBtn === null || pastBtn === void 0 ? void 0 : pastBtn.classList.remove('active');
    // Set the active state for the selected period
    if (period === 'live') {
        liveBtn === null || liveBtn === void 0 ? void 0 : liveBtn.classList.add('active');
    }
    else if (period === 'upcoming') {
        upcomingBtn === null || upcomingBtn === void 0 ? void 0 : upcomingBtn.classList.add('active');
    }
    else {
        pastBtn === null || pastBtn === void 0 ? void 0 : pastBtn.classList.add('active');
    }
    renderMatches();
}
function fetchScheduleData() {
    return __awaiter(this, void 0, void 0, function* () {
        const showSpinner = () => {
            if (container) {
                container.innerHTML = '<div class="spinner">Loading schedule...</div>';
            }
        };
        const hideSpinner = () => {
            if (container) {
                const spinner = container.querySelector('.spinner');
                if (spinner) {
                    spinner.remove();
                }
            }
        };
        // Check cache first
        const cachedData = getCachedData();
        if (cachedData) {
            return cachedData;
        }
        showSpinner();
        try {
            console.log('Fetching data from API...');
            const response = yield fetch('https://k1174cudqb.execute-api.us-east-1.amazonaws.com/schedule');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = yield response.json();
            console.log(`Successfully fetched ${data.length} matches from API`);
            // Cache the successful response
            setCachedData(data);
            hideSpinner();
            return data;
        }
        catch (error) {
            hideSpinner();
            console.error('Error fetching schedule:', error);
            throw error;
        }
    });
}
// Run the main function
main();
