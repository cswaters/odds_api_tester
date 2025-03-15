/**
 * Main JavaScript file for the Odds API Tester
 * Initializes the application and handles global functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Odds API Tester initialized');
    
    // Check for API key in localStorage
    const savedApiKey = localStorage.getItem('oddsApiKey');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
        
        // Trigger sports loading after setting the API key
        setTimeout(() => {
            if (typeof window.loadSports === 'function') {
                console.log('Loading sports with saved API key');
                window.loadSports();
            }
        }, 500);
    }
    
    // Save API key to localStorage when changed
    document.getElementById('apiKey').addEventListener('change', function() {
        const apiKey = this.value.trim();
        if (apiKey) {
            localStorage.setItem('oddsApiKey', apiKey);
            
            // Reload sports data when API key changes
            if (typeof window.loadSports === 'function') {
                console.log('Reloading sports with new API key');
                window.loadSports();
            }
        } else {
            localStorage.removeItem('oddsApiKey');
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
    
    // Initialize components
    initializeAccordions();
    initializeFormHandlers();
    initializeJsonViewer();
    
    // Set up endpoint change handler
    const endpointSelect = document.getElementById('endpoint');
    endpointSelect.addEventListener('change', handleEndpointChange);
    
    // Set up API key toggle
    const apiKeyInput = document.getElementById('apiKey');
    const toggleApiKeyButton = document.getElementById('toggleApiKey');
    toggleApiKeyButton.addEventListener('click', function() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyButton.textContent = 'Hide';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyButton.textContent = 'Show';
        }
    });

    // Ensure API key field accepts paste
    apiKeyInput.addEventListener('paste', function(e) {
        console.log('Paste event detected on API key field');
    });
    
    // Set up send request button
    const sendRequestButton = document.getElementById('sendRequest');
    sendRequestButton.addEventListener('click', sendApiRequest);
    
    // Set up copy URL button
    const copyUrlButton = document.getElementById('copyUrlButton');
    copyUrlButton.addEventListener('click', function() {
        const url = document.getElementById('resultsUrl').textContent;
        if (url) {
            navigator.clipboard.writeText(url)
                .then(() => alert('URL copied to clipboard'))
                .catch(err => console.error('Failed to copy URL:', err));
        }
    });
    
    // Set up market search
    const marketSearch = document.getElementById('marketSearch');
    if (marketSearch) {
        marketSearch.addEventListener('input', handleMarketSearch);
    }

    // Main tab switching functionality
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    const mainTabContents = document.querySelectorAll('.main-tab-content');
    
    mainTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and contents
            mainTabButtons.forEach(btn => btn.classList.remove('active'));
            mainTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Auto-select default region for historical endpoints
    endpointSelect.addEventListener('change', function() {
        const selectedEndpoint = this.value;
        
        if (selectedEndpoint && selectedEndpoint.startsWith('historical_')) {
            // Check if any region is already selected
            const regionCheckboxes = document.querySelectorAll('#regionContainer input[type="checkbox"]');
            const anyRegionSelected = Array.from(regionCheckboxes).some(cb => cb.checked);
            
            // If no region is selected, select the US region by default
            if (!anyRegionSelected) {
                const usRegionCheckbox = document.getElementById('region-us');
                if (usRegionCheckbox) {
                    usRegionCheckbox.checked = true;
                }
            }
        }
    });
});

/**
 * Reference Tables Functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Bookmaker search functionality
    const bookmakerSearch = document.getElementById('bookmakerSearch');
    if (bookmakerSearch) {
        bookmakerSearch.addEventListener('input', function() {
            filterTable('bookmakersTable', this.value);
        });
    }
    
    // Market search functionality
    const marketSearchRef = document.getElementById('marketSearch');
    if (marketSearchRef) {
        marketSearchRef.addEventListener('input', function() {
            filterTable('marketsTable', this.value);
        });
    }
    
    /**
     * Filter table rows based on search input
     * @param {string} tableId - The ID of the table to filter
     * @param {string} query - The search query
     */
    function filterTable(tableId, query) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = table.querySelectorAll('tbody tr');
        const lowerQuery = query.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(lowerQuery)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Add click-to-copy functionality for bookmaker and market codes
    const referenceTables = document.querySelectorAll('.reference-table');
    referenceTables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const codeCell = row.querySelector('td:first-child');
            if (codeCell) {
                codeCell.style.cursor = 'pointer';
                codeCell.title = 'Click to copy';
                codeCell.addEventListener('click', function() {
                    const code = this.textContent;
                    navigator.clipboard.writeText(code)
                        .then(() => {
                            // Visual feedback
                            const originalBg = this.style.backgroundColor;
                            this.style.backgroundColor = '#d4edda';
                            setTimeout(() => {
                                this.style.backgroundColor = originalBg;
                            }, 500);
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                        });
                });
            }
        });
    });
    
    // Add warning for historical endpoints
    const endpointSelect = document.getElementById('endpoint');
    if (endpointSelect) {
        endpointSelect.addEventListener('change', function() {
            const selectedEndpoint = this.value;
            const referenceNote = document.querySelector('.reference-note');
            
            if (selectedEndpoint && selectedEndpoint.startsWith('historical_')) {
                referenceNote.style.display = 'block';
                
                // Auto-select a region if none is selected
                const regionCheckboxes = document.querySelectorAll('#regionContainer input[type="checkbox"]');
                const anyRegionSelected = Array.from(regionCheckboxes).some(cb => cb.checked);
                
                if (!anyRegionSelected) {
                    // Show a reminder to select a region
                    alert('Historical endpoints require at least one region or bookmaker. Please select at least one region or specify bookmakers.');
                    
                    // Scroll to regions section
                    document.getElementById('regionsContainer').scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                referenceNote.style.display = 'none';
            }
        });
    }

    // Sports search functionality
    const sportsSearch = document.getElementById('sportsSearch');
    if (sportsSearch) {
        sportsSearch.addEventListener('input', function() {
            filterTable('sportsTable', this.value);
        });
    }
    
    // Add click-to-copy functionality for sport keys
    const sportsTable = document.getElementById('sportsTable');
    if (sportsTable) {
        const rows = sportsTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const keyCell = row.querySelector('td:nth-child(3)'); // Sport Key column
            if (keyCell) {
                keyCell.style.cursor = 'pointer';
                keyCell.title = 'Click to copy sport key';
                keyCell.addEventListener('click', function() {
                    const code = this.textContent;
                    navigator.clipboard.writeText(code)
                        .then(() => {
                            // Visual feedback
                            const originalBg = this.style.backgroundColor;
                            this.style.backgroundColor = '#d4edda';
                            setTimeout(() => {
                                this.style.backgroundColor = originalBg;
                            }, 500);
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                        });
                });
            }
        });
    }
});

// Add this to your existing code
document.addEventListener('DOMContentLoaded', function() {
    // Function to handle endpoint changes
    function handleEndpointChange() {
        const selectedEndpoint = endpointSelect.value;
        
        // Reset all containers to hidden
        document.getElementById('sportContainer').classList.add('hidden');
        document.getElementById('eventIdContainer').classList.add('hidden');
        document.getElementById('regionsContainer').classList.add('hidden');
        document.getElementById('marketsContainer').classList.add('hidden');
        document.getElementById('dateContainer').classList.add('hidden');
        document.getElementById('formatOptionsContainer').classList.add('hidden');
        document.getElementById('additionalParamsContainer').classList.add('hidden');
        
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
                if (selectedEndpoint.startsWith('historical_')) {
                    const regionCheckboxes = document.querySelectorAll('#regionContainer input[type="checkbox"]');
                    const anyRegionSelected = Array.from(regionCheckboxes).some(cb => cb.checked);
                    
                    if (!anyRegionSelected) {
                        document.getElementById('region-us').checked = true;
                    }
                    
                    // Show date container for historical endpoints
                    document.getElementById('dateContainer').classList.remove('hidden');
                }
            }
            
            document.getElementById('additionalParamsContainer').classList.remove('hidden');
        }
    }
}); 