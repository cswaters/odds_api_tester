/**
 * Form handling functionality for the Odds API Tester
 */

// Cache for sports data
let sportsCache = null;
let eventsCache = {};

// DOM Elements
let sportContainer;
let sportSelect;
let eventIdContainer;
let eventIdInput;
let fetchEventsButton;
let regionsContainer;
let marketsContainer;
let dateContainer;
let formatOptionsContainer;
let additionalParamsContainer;
let endpointDescription;
let loadingIndicator;

// Endpoint descriptions
const endpointDescriptions = {
    'sports': 'Returns a list of in-season sports objects. Doesn\'t count against quota.',
    'odds': 'Returns a list of upcoming and live games with odds for a sport, region and market.',
    'scores': 'Returns a list of upcoming, live and recently completed games with scores.',
    'events': 'Returns a list of in-play and pre-match events without odds. Doesn\'t count against quota.',
    'event_odds': 'Returns odds for a single event, including specialized markets.',
    'participants': 'Returns a list of participants (teams or individuals) for a sport.',
    'historical_odds': 'Returns a snapshot of historical odds. Paid plans only.',
    'historical_events': 'Returns a list of historical events. Paid plans only.',
    'historical_event_odds': 'Returns historical odds for a single event. Paid plans only.'
};

/**
 * Initialize form handlers
 */
function initializeFormHandlers() {
    // Cache DOM elements
    sportContainer = document.getElementById('sportContainer');
    sportSelect = document.getElementById('sport');
    eventIdContainer = document.getElementById('eventIdContainer');
    eventIdInput = document.getElementById('eventId');
    fetchEventsButton = document.getElementById('fetchEvents');
    regionsContainer = document.getElementById('regionsContainer');
    marketsContainer = document.getElementById('marketsContainer');
    dateContainer = document.getElementById('dateContainer');
    formatOptionsContainer = document.getElementById('formatOptionsContainer');
    additionalParamsContainer = document.getElementById('additionalParamsContainer');
    endpointDescription = document.getElementById('endpoint-description');
    loadingIndicator = document.getElementById('loadingIndicator');
    
    // Set up fetch events button
    fetchEventsButton.addEventListener('click', fetchEvents);
    
    // Set up add parameter button
    document.getElementById('addParam').addEventListener('click', addParameter);
    
    // Add event listener for existing remove parameter buttons
    document.querySelectorAll('.remove-param-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.parameter-row').remove();
        });
    });
}

/**
 * Check for duplicate market IDs
 */
function checkDuplicateMarketIds() {
    const marketIds = {};
    const marketCheckboxes = document.querySelectorAll('#marketContainer input[type="checkbox"]');
    
    marketCheckboxes.forEach(checkbox => {
        const id = checkbox.id;
        const value = checkbox.value;
        
        if (marketIds[value]) {
            console.warn(`Duplicate market value found: ${value} (IDs: ${marketIds[value]}, ${id})`);
            // Remove the duplicate
            checkbox.closest('.market-checkbox').remove();
        } else {
            marketIds[value] = id;
        }
    });
}

/**
 * Handles the endpoint change event
 */
function handleEndpointChange() {
    const selectedEndpoint = this.value;
    
    // Reset all containers to hidden
    document.getElementById('sportContainer').classList.add('hidden');
    document.getElementById('eventIdContainer').classList.add('hidden');
    document.getElementById('regionsContainer').classList.add('hidden');
    document.getElementById('marketsContainer').classList.add('hidden');
    document.getElementById('dateContainer').classList.add('hidden');
    document.getElementById('formatOptionsContainer').classList.add('hidden');
    document.getElementById('additionalParamsContainer').classList.add('hidden');
    
    // Hide historical note by default
    const historicalNote = document.getElementById('historical-regions-note');
    if (historicalNote) {
        historicalNote.style.display = 'none';
    }
    
    // Show relevant containers based on the selected endpoint
    if (selectedEndpoint) {
        if (selectedEndpoint !== 'sports') {
            document.getElementById('sportContainer').classList.remove('hidden');
        }
        
        if (selectedEndpoint === 'event_odds' || selectedEndpoint === 'historical_event_odds') {
            document.getElementById('eventIdContainer').classList.remove('hidden');
        }
        
        if (selectedEndpoint === 'odds' || selectedEndpoint === 'event_odds' || 
            selectedEndpoint.startsWith('historical_')) {
            document.getElementById('regionsContainer').classList.remove('hidden');
            document.getElementById('marketsContainer').classList.remove('hidden');
            document.getElementById('formatOptionsContainer').classList.remove('hidden');
            
            // For historical endpoints, auto-select US region if no region is selected
            // and show a note about region requirement
            if (selectedEndpoint.startsWith('historical_')) {
                const regionCheckboxes = document.querySelectorAll('#regionContainer input[type="checkbox"]');
                const anyRegionSelected = Array.from(regionCheckboxes).some(cb => cb.checked);
                
                if (!anyRegionSelected) {
                    document.getElementById('region-us').checked = true;
                }
                
                // Show date container for historical endpoints
                document.getElementById('dateContainer').classList.remove('hidden');
                
                // Show note about region requirement for historical endpoints
                if (historicalNote) {
                    historicalNote.style.display = 'block';
                } else {
                    // Create note if it doesn't exist
                    const note = document.createElement('div');
                    note.id = 'historical-regions-note';
                    note.className = 'historical-note';
                    note.innerHTML = '<strong>Note:</strong> Historical endpoints require at least one region or specific bookmakers. US region is selected by default.';
                    
                    // Insert after the region container
                    const regionsContainer = document.getElementById('regionsContainer');
                    regionsContainer.parentNode.insertBefore(note, regionsContainer.nextSibling);
                }
                
                // Scroll to regions section to make it visible
                document.getElementById('regionsContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        
        document.getElementById('additionalParamsContainer').classList.remove('hidden');
    }
}

/**
 * Add a new parameter row
 */
function addParameter() {
    const paramRow = document.createElement('div');
    paramRow.className = 'parameter-row';
    paramRow.innerHTML = `
        <select class="param-name">
            <option value="">-- Select Parameter --</option>
            <option value="daysFrom">daysFrom</option>
            <option value="eventIds">eventIds</option>
            <option value="bookmakers">bookmakers</option>
            <option value="commenceTimeFrom">commenceTimeFrom</option>
            <option value="commenceTimeTo">commenceTimeTo</option>
            <option value="all">all</option>
            <option value="includeLinks">includeLinks</option>
            <option value="includeSids">includeSids</option>
            <option value="includeBetLimits">includeBetLimits</option>
        </select>
        <input type="text" class="param-value" placeholder="Parameter value">
        <button class="remove-param-btn">Remove</button>
    `;
    
    // Add event listener to the remove button
    paramRow.querySelector('.remove-param-btn').addEventListener('click', function() {
        paramRow.remove();
    });
    
    document.getElementById('additionalParams').appendChild(paramRow);
}

/**
 * Handle market search
 */
function handleMarketSearch() {
    const searchText = this.value.toLowerCase();
    const marketCheckboxes = document.querySelectorAll('#marketContainer .market-checkbox');
    const accordions = document.querySelectorAll('#marketContainer .accordion');
    
    // Reset all accordions and checkboxes
    marketCheckboxes.forEach(checkbox => {
        checkbox.style.display = 'none';
    });
    
    accordions.forEach(accordion => {
        accordion.style.display = 'none';
        const panel = accordion.nextElementSibling;
        panel.style.display = 'none';
    });
    
    if (searchText.trim() === '') {
        // If search is empty, restore original view
        marketCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'flex';
        });
        
        accordions.forEach(accordion => {
            accordion.style.display = 'block';
            const panel = accordion.nextElementSibling;
            panel.style.display = 'block';
            
            if (accordion.classList.contains('active')) {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.style.maxHeight = null;
            }
        });
    } else {
        // Search mode - show matching checkboxes and their containers
        let matchFound = false;
        
        marketCheckboxes.forEach(checkbox => {
            const checkboxText = checkbox.textContent.toLowerCase();
            const checkboxValue = checkbox.querySelector('input').value.toLowerCase();
            
            if (checkboxText.includes(searchText) || checkboxValue.includes(searchText)) {
                checkbox.style.display = 'flex';
                matchFound = true;
                
                // Find parent panel and accordion
                let parent = checkbox.parentElement;
                while (parent && !parent.classList.contains('panel')) {
                    parent = parent.parentElement;
                }
                
                if (parent) {
                    parent.style.display = 'block';
                    parent.style.maxHeight = '1000px'; // Set a large max height
                    
                    const accordion = parent.previousElementSibling;
                    if (accordion && accordion.classList.contains('accordion')) {
                        accordion.style.display = 'block';
                    }
                }
            }
        });
        
        if (!matchFound) {
            // Show a message if no matches found
            const firstAccordion = document.querySelector('#marketContainer .accordion');
            if (firstAccordion) {
                firstAccordion.style.display = 'block';
                firstAccordion.textContent = 'No markets found matching your search';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const apiKeyInput = document.getElementById('apiKey');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const endpointSelect = document.getElementById('endpoint');
    const endpointDescription = document.getElementById('endpoint-description');
    const sportContainer = document.getElementById('sportContainer');
    const sportSelect = document.getElementById('sport');
    const eventIdContainer = document.getElementById('eventIdContainer');
    const eventIdInput = document.getElementById('eventId');
    const fetchEventsBtn = document.getElementById('fetchEvents');
    const regionsContainer = document.getElementById('regionsContainer');
    const marketsContainer = document.getElementById('marketsContainer');
    const dateContainer = document.getElementById('dateContainer');
    const formatOptionsContainer = document.getElementById('formatOptionsContainer');
    const additionalParamsContainer = document.getElementById('additionalParamsContainer');
    const addParamBtn = document.getElementById('addParam');
    const marketSearch = document.getElementById('marketSearch');
    
    // Endpoint descriptions
    const endpointDescriptions = {
        'sports': 'Get a list of all available sports.',
        'odds': 'Get odds for a specific sport.',
        'scores': 'Get scores for a specific sport.',
        'events': 'Get events for a specific sport.',
        'event_odds': 'Get odds for a specific event.',
        'participants': 'Get participants for a specific sport.',
        'historical_odds': 'Get historical odds for a specific sport.',
        'historical_events': 'Get historical events for a specific sport.',
        'historical_event_odds': 'Get historical odds for a specific event.'
    };
    
    // Toggle API key visibility
    toggleApiKeyBtn.addEventListener('click', function() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyBtn.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.textContent = 'Show';
        }
    });
    
    // Handle endpoint selection
    endpointSelect.addEventListener('change', function() {
        const selectedEndpoint = this.value;
        
        // Reset all containers to hidden
        sportContainer.classList.add('hidden');
        eventIdContainer.classList.add('hidden');
        regionsContainer.classList.add('hidden');
        marketsContainer.classList.add('hidden');
        dateContainer.classList.add('hidden');
        formatOptionsContainer.classList.add('hidden');
        additionalParamsContainer.classList.add('hidden');
        fetchEventsBtn.classList.add('hidden');
        
        // Show endpoint description
        endpointDescription.textContent = endpointDescriptions[selectedEndpoint] || '';
        
        // Show relevant containers based on endpoint
        if (selectedEndpoint) {
            formatOptionsContainer.classList.remove('hidden');
            additionalParamsContainer.classList.remove('hidden');
            
            if (selectedEndpoint !== 'sports') {
                sportContainer.classList.remove('hidden');
                
                // Load sports data if available
                if (typeof window.loadSports === 'function') {
                    console.log('Triggering sports load from form handler');
                    window.loadSports();
                }
            }
            
            if (selectedEndpoint === 'event_odds' || selectedEndpoint === 'historical_event_odds') {
                eventIdContainer.classList.remove('hidden');
                fetchEventsBtn.classList.remove('hidden');
            }
            
            if (selectedEndpoint === 'odds' || selectedEndpoint === 'event_odds') {
                regionsContainer.classList.remove('hidden');
                marketsContainer.classList.remove('hidden');
            }
            
            if (selectedEndpoint.startsWith('historical_')) {
                dateContainer.classList.remove('hidden');
            }
        }
    });
    
    // Handle add parameter button
    addParamBtn.addEventListener('click', function() {
        const paramRow = document.createElement('div');
        paramRow.className = 'parameter-row';
        paramRow.innerHTML = `
            <select class="param-name">
                <option value="">-- Select Parameter --</option>
                <option value="daysFrom">daysFrom</option>
                <option value="eventIds">eventIds</option>
                <option value="bookmakers">bookmakers</option>
                <option value="commenceTimeFrom">commenceTimeFrom</option>
                <option value="commenceTimeTo">commenceTimeTo</option>
                <option value="all">all</option>
                <option value="includeLinks">includeLinks</option>
                <option value="includeSids">includeSids</option>
                <option value="includeBetLimits">includeBetLimits</option>
            </select>
            <input type="text" class="param-value" placeholder="Parameter value">
            <button class="remove-param-btn">Remove</button>
        `;
        
        document.getElementById('additionalParams').appendChild(paramRow);
        
        // Add event listener to the remove button
        paramRow.querySelector('.remove-param-btn').addEventListener('click', function() {
            paramRow.remove();
        });
    });
    
    // Handle market search
    marketSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const marketCheckboxes = document.querySelectorAll('.market-checkbox');
        const accordions = document.querySelectorAll('.accordion');
        
        // Reset all accordions and checkboxes
        marketCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'none';
        });
        
        accordions.forEach(accordion => {
            accordion.style.display = 'none';
            accordion.classList.remove('active');
            accordion.nextElementSibling.style.maxHeight = null;
        });
        
        if (searchTerm === '') {
            // Show all checkboxes and accordions if search is empty
            marketCheckboxes.forEach(checkbox => {
                checkbox.style.display = '';
            });
            
            accordions.forEach(accordion => {
                accordion.style.display = '';
            });
            
            // Open the first accordion
            if (accordions.length > 0) {
                accordions[0].classList.add('active');
                accordions[0].nextElementSibling.style.maxHeight = 
                    accordions[0].nextElementSibling.scrollHeight + 'px';
            }
        } else {
            // Filter checkboxes based on search term
            let foundResults = false;
            
            marketCheckboxes.forEach(checkbox => {
                const label = checkbox.querySelector('label');
                const checkboxId = checkbox.querySelector('input').id;
                const marketValue = checkbox.querySelector('input').value;
                
                if (label.textContent.toLowerCase().includes(searchTerm) || 
                    checkboxId.toLowerCase().includes(searchTerm) || 
                    marketValue.toLowerCase().includes(searchTerm)) {
                    checkbox.style.display = '';
                    
                    // Show parent accordion
                    const panel = checkbox.closest('.panel');
                    if (panel) {
                        const accordion = panel.previousElementSibling;
                        accordion.style.display = '';
                        accordion.classList.add('active');
                        panel.style.maxHeight = panel.scrollHeight + 'px';
                        foundResults = true;
                    }
                }
            });
            
            // Show message if no results found
            if (!foundResults) {
                const noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'noSearchResults';
                noResultsMsg.textContent = 'No markets found matching your search.';
                noResultsMsg.style.padding = '10px';
                noResultsMsg.style.fontStyle = 'italic';
                noResultsMsg.style.color = '#666';
                
                // Remove any existing no results message
                const existingMsg = document.getElementById('noSearchResults');
                if (existingMsg) {
                    existingMsg.remove();
                }
                
                document.getElementById('marketContainer').appendChild(noResultsMsg);
            } else {
                // Remove any existing no results message
                const existingMsg = document.getElementById('noSearchResults');
                if (existingMsg) {
                    existingMsg.remove();
                }
            }
        }
    });
    
    // Check for duplicate market IDs
    function checkDuplicateMarketIds() {
        const marketCheckboxes = document.querySelectorAll('#marketContainer input[type="checkbox"]');
        const marketIds = {};
        
        marketCheckboxes.forEach(checkbox => {
            const id = checkbox.id;
            const value = checkbox.value;
            
            if (marketIds[value]) {
                console.warn(`Duplicate market ID found: ${value}`);
                console.warn(`First element: ${marketIds[value]}, Second element: ${id}`);
                
                // Remove the duplicate checkbox
                checkbox.parentElement.remove();
            } else {
                marketIds[value] = id;
            }
        });
    }
    
    // Run duplicate check on page load
    checkDuplicateMarketIds();
}); 