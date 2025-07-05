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
const API_URL = 'https://p4w4yuvikkpnvjvnbsmkybd7de0cgqqn.lambda-url.us-east-1.on.aws/';
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
    // Helper function to generate watch links HTML
    function generateWatchLinksHTML(streams, matchStatus) {
        // Only show watch links for live and upcoming matches
        if (matchStatus !== 'running' && matchStatus !== 'not_started') {
            return '';
        }
        // If we have stream data from PandaScore, use it
        if (streams && streams.length > 0) {
            // Prioritize official streams and main streams
            const sortedStreams = streams
                .filter(stream => stream.raw_url) // Only streams with valid URLs
                .sort((a, b) => {
                // Prioritize official streams first
                if (a.official && !b.official)
                    return -1;
                if (!a.official && b.official)
                    return 1;
                // Then prioritize main streams
                if (a.main && !b.main)
                    return -1;
                if (!a.main && b.main)
                    return 1;
                return 0;
            });
            if (sortedStreams.length === 1) {
                // Single stream - direct link
                const platform = detectStreamingPlatform(sortedStreams[0].raw_url);
                return `<a href="${sortedStreams[0].raw_url}" target="_blank" class="watch-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    Watch
                </a>`;
            }
            else if (sortedStreams.length > 1) {
                // Multiple streams - dropdown
                const streamOptions = sortedStreams.map(stream => {
                    const platform = detectStreamingPlatform(stream.raw_url);
                    const language = stream.language ? stream.language.toUpperCase() : 'EN';
                    const label = `${platform}`;
                    const className = stream.official ? 'official' : '';
                    return `<a href="${stream.raw_url}" target="_blank" class="${className}">${label}</a>`;
                }).join('');
                return `<div class="watch-dropdown">
                    <div class="watch-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Watch
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
                    <div class="dropdown-content">
                        ${streamOptions}
                    </div>
                </div>`;
            }
        }
        // Fallback: "Find Stream" button for matches without direct stream URLs
        return `<button class="watch-btn find-stream">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            Find Stream
        </button>`;
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
                ${generateWatchLinksHTML(match.streams, match.status)}
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
        try {
            console.log('RitoEsports Tracker: Starting main function');
            // Setup button listeners first
            valorantBtn === null || valorantBtn === void 0 ? void 0 : valorantBtn.addEventListener('click', () => selectGame('Valorant'));
            lolBtn === null || lolBtn === void 0 ? void 0 : lolBtn.addEventListener('click', () => selectGame('LoL'));
            // Add event delegation for Find Stream buttons
            container === null || container === void 0 ? void 0 : container.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('find-stream') || target.closest('.find-stream')) {
                    const button = target.closest('.find-stream') || target;
                    handleFindStream(button);
                }
            });
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
            // Show loading state
            if (container) {
                container.innerHTML = '<div class="loading">Loading matches...</div>';
            }
            // Fetch schedule data with improved error handling
            allMatches = yield fetchScheduleData();
            // If no data available, show appropriate message
            if (!allMatches || allMatches.length === 0) {
                if (container) {
                    container.innerHTML = `
                    <div class="error-message">
                        <p>No matches available</p>
                        <p>Check your internet connection and try refreshing</p>
                    </div>
                `;
                }
                return;
            }
            console.log(`RitoEsports Tracker: Loaded ${allMatches.length} matches successfully`);
            // Continue with normal rendering
            renderMatches();
        }
        catch (error) {
            console.error('RitoEsports Tracker: Fatal error in main function:', error);
            if (container) {
                container.innerHTML = `
                <div class="error-message">
                    <p>Unable to load matches</p>
                    <p>Please try again later</p>
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
        const cacheKey = 'schedule-cache';
        const cacheTimeKey = 'schedule-cache-time';
        const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
        try {
            // Check cache first
            const cachedData = localStorage.getItem(cacheKey);
            const cachedTime = localStorage.getItem(cacheTimeKey);
            if (cachedData && cachedTime) {
                const timeElapsed = Date.now() - parseInt(cachedTime);
                if (timeElapsed < CACHE_DURATION) {
                    console.log('RitoEsports Tracker: Using cached data');
                    return JSON.parse(cachedData);
                }
            }
            console.log('RitoEsports Tracker: Fetching fresh data from API');
            // Fetch fresh data with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            // Lambda Function URL
            const response = yield fetch(API_URL, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = yield response.json();
            // Cache the successful response
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
            console.log('RitoEsports Tracker: Fresh data cached successfully');
            return data;
        }
        catch (error) {
            console.warn('RitoEsports Tracker: API fetch failed, checking for fallback data:', error);
            // Try to use any cached data as fallback, even if expired
            const fallbackData = localStorage.getItem(cacheKey);
            if (fallbackData) {
                console.log('RitoEsports Tracker: Using expired cache as fallback');
                return JSON.parse(fallbackData);
            }
            // If no cached data available, return empty array instead of throwing
            console.warn('RitoEsports Tracker: No cached data available, returning empty results');
            return [];
        }
    });
}
// Function to handle "Find Stream" button clicks
function handleFindStream(button) {
    var _a, _b, _c;
    try {
        console.log('Find Stream button clicked');
        // Get the match element and extract team names
        const matchElement = button.closest('.match');
        if (!matchElement) {
            console.log('No match element found');
            return;
        }
        const teamElements = matchElement.querySelectorAll('.team span');
        if (teamElements.length >= 2) {
            const teamA = ((_a = teamElements[0].textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            const teamB = ((_b = teamElements[1].textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
            // Get league name from the header
            const leagueElement = matchElement.querySelector('.league');
            const leagueName = ((_c = leagueElement === null || leagueElement === void 0 ? void 0 : leagueElement.textContent) === null || _c === void 0 ? void 0 : _c.trim()) || '';
            // Create search query
            const searchQuery = `"${teamA}" vs "${teamB}" ${leagueName} live stream valorant`;
            const twitchSearchUrl = `https://www.twitch.tv/search?term=${encodeURIComponent(searchQuery)}`;
            console.log('Opening Twitch search for:', searchQuery);
            // Try chrome.tabs API first, fallback to window.open
            if (chrome && chrome.tabs) {
                chrome.tabs.create({ url: twitchSearchUrl });
            }
            else {
                window.open(twitchSearchUrl, '_blank');
            }
        }
    }
    catch (error) {
        console.error('Error in findStream:', error);
        // Fallback: open general Twitch search
        const fallbackUrl = 'https://www.twitch.tv/directory/category/valorant';
        if (chrome && chrome.tabs) {
            chrome.tabs.create({ url: fallbackUrl });
        }
        else {
            window.open(fallbackUrl, '_blank');
        }
    }
}
// Function to detect streaming platform from URL
function detectStreamingPlatform(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('twitch.tv')) {
        return 'Twitch';
    }
    else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        return 'YouTube';
    }
    else if (lowerUrl.includes('facebook.com')) {
        return 'Facebook';
    }
    else if (lowerUrl.includes('kick.com')) {
        return 'Kick';
    }
    else if (lowerUrl.includes('douyu.com')) {
        return 'Douyu';
    }
    else if (lowerUrl.includes('huya.com')) {
        return 'Huya';
    }
    else if (lowerUrl.includes('bilibili.com')) {
        return 'Bilibili';
    }
    else {
        return 'Stream';
    }
}
// Run the main function
main();
