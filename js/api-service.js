/**
 * API Service for the Odds API Tester
 * Handles API requests and responses
 */

// Make loadSports function globally accessible
window.loadSports = null;

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sendRequestBtn = document.getElementById('sendRequest');
    const copyUrlButton = document.getElementById('copyUrlButton');
    const sportSelect = document.getElementById('sport');
    const fetchEventsBtn = document.getElementById('fetchEvents');
    const endpointSelect = document.getElementById('endpoint');
    
    // Cache for events data
    const eventsCache = {};
    
    // Initialize event listeners
    sendRequestBtn.addEventListener('click', sendApiRequest);
    copyUrlButton.addEventListener('click', copyRequestUrl);
    fetchEventsBtn.addEventListener('click', fetchEvents);
    
    // Add event listener for endpoint change to trigger sports loading
    endpointSelect.addEventListener('change', function() {
        const selectedEndpoint = this.value;
        if (selectedEndpoint && selectedEndpoint !== 'sports') {
            // Load sports data when selecting an endpoint that needs it
            loadSports();
        }
    });
    
    // Load sports on page load
    loadSports();
    
    /**
     * Loads sports data from the API
     */
    function loadSports() {
        console.log('Loading sports data...');
        const apiKey = document.getElementById('apiKey').value;
        
        if (!apiKey) {
            console.warn('No API key provided for loading sports');
            return;
        }
        
        const url = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;
        
        fetch(url)
            .then(response => {
                console.log('Sports API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Sports data received, count:', data.length);
                
                // Clear existing options except the first two
                while (sportSelect.options.length > 2) {
                    sportSelect.remove(2);
                }
                
                // Add sports to the dropdown
                data.forEach(sport => {
                    const option = document.createElement('option');
                    option.value = sport.key;
                    option.textContent = `${sport.title} (${sport.key})`;
                    sportSelect.appendChild(option);
                });
            })
            .catch(error => {
                if (error.message.includes('401')) {
                    console.error('Invalid API key for sports request');
                    alert('Invalid API key. Please check your API key and try again.');
                } else {
                    console.error('Error loading sports:', error);
                    alert(`Error loading sports: ${error.message}`);
                }
            });
    }
    
    // Make loadSports globally accessible
    window.loadSports = loadSports;
    
    /**
     * Loads events for a specific sport
     * @param {string} sport - The sport key
     * @returns {Promise<Array>} - Promise resolving to an array of events
     */
    function loadEvents(sport) {
        return new Promise((resolve, reject) => {
            // Check cache first
            if (eventsCache[sport]) {
                resolve(eventsCache[sport]);
                return;
            }
            
            const apiKey = document.getElementById('apiKey').value;
            
            if (!apiKey) {
                reject(new Error('Please enter your API key'));
                return;
            }
            
            const url = `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${apiKey}`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Cache the results
                    eventsCache[sport] = data;
                    resolve(data);
                })
                .catch(error => {
                    console.error('Error loading events:', error);
                    reject(error);
                });
        });
    }
    
    /**
     * Fetches events for the selected sport and displays them in a modal
     */
    function fetchEvents() {
        const sport = document.getElementById('sport').value;
        
        if (!sport) {
            alert('Please select a sport first');
            return;
        }
        
        // Show loading state
        document.getElementById('loadingIndicator').classList.remove('hidden');
        
        loadEvents(sport)
            .then(events => {
                // Hide loading state
                document.getElementById('loadingIndicator').classList.add('hidden');
                
                // Create modal if it doesn't exist
                let modal = document.getElementById('eventsModal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'eventsModal';
                    modal.className = 'modal';
                    
                    const modalContent = document.createElement('div');
                    modalContent.className = 'modal-content';
                    
                    modalContent.innerHTML = `
                        <div class="modal-header">
                            <h3>Select an Event</h3>
                            <span class="close">&times;</span>
                        </div>
                        <div class="event-search">
                            <input type="text" id="eventSearchInput" placeholder="Search events...">
                        </div>
                        <div class="event-list" id="eventList"></div>
                    `;
                    
                    modal.appendChild(modalContent);
                    document.body.appendChild(modal);
                    
                    // Close button functionality
                    const closeBtn = modal.querySelector('.close');
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                    
                    // Close when clicking outside the modal
                    window.addEventListener('click', (event) => {
                        if (event.target === modal) {
                            modal.style.display = 'none';
                        }
                    });
                }
                
                // Populate event list
                const eventList = document.getElementById('eventList');
                eventList.innerHTML = '';
                
                if (events.length === 0) {
                    eventList.innerHTML = '<div class="no-results">No events found for this sport</div>';
                } else {
                    events.forEach(event => {
                        const eventItem = document.createElement('div');
                        eventItem.className = 'event-item';
                        eventItem.dataset.id = event.id;
                        
                        const homeTeam = event.home_team || 'Unknown';
                        const awayTeam = event.away_team || 'Unknown';
                        const commenceTime = new Date(event.commence_time).toLocaleString();
                        
                        eventItem.innerHTML = `
                            <div><strong>${homeTeam} vs ${awayTeam}</strong></div>
                            <div>Time: ${commenceTime}</div>
                            <div>ID: ${event.id}</div>
                        `;
                        
                        eventItem.addEventListener('click', () => {
                            document.getElementById('eventId').value = event.id;
                            modal.style.display = 'none';
                        });
                        
                        eventList.appendChild(eventItem);
                    });
                    
                    // Add search functionality
                    const searchInput = document.getElementById('eventSearchInput');
                    searchInput.value = '';
                    
                    searchInput.addEventListener('input', () => {
                        const searchTerm = searchInput.value.toLowerCase();
                        const eventItems = eventList.querySelectorAll('.event-item');
                        
                        eventItems.forEach(item => {
                            const text = item.textContent.toLowerCase();
                            if (text.includes(searchTerm)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                        
                        // Show no results message if needed
                        const visibleItems = Array.from(eventItems).filter(item => item.style.display !== 'none');
                        
                        if (visibleItems.length === 0) {
                            const noResults = document.createElement('div');
                            noResults.className = 'no-results';
                            noResults.id = 'noEventsResults';
                            noResults.textContent = 'No events found matching your search.';
                            
                            const existingNoResults = document.getElementById('noEventsResults');
                            if (existingNoResults) {
                                existingNoResults.remove();
                            }
                            
                            eventList.appendChild(noResults);
                        } else {
                            const existingNoResults = document.getElementById('noEventsResults');
                            if (existingNoResults) {
                                existingNoResults.remove();
                            }
                        }
                    });
                }
                
                // Show the modal
                modal.style.display = 'block';
            })
            .catch(error => {
                // Hide loading state
                document.getElementById('loadingIndicator').classList.add('hidden');
                
                if (error.message.includes('401')) {
                    alert('Invalid API key. Please check your API key and try again.');
                } else {
                    alert(`Error fetching events: ${error.message}`);
                }
            });
    }
    
    /**
     * Sends an API request based on the form inputs
     */
    function sendApiRequest() {
        const apiKey = document.getElementById('apiKey').value;
        
        if (!apiKey) {
            alert('Please enter your API key');
            return;
        }
        
        const endpoint = document.getElementById('endpoint').value;
        
        if (!endpoint) {
            alert('Please select an endpoint');
            return;
        }
        
        // Show loading state
        document.getElementById('loadingIndicator').classList.remove('hidden');
        
        // Clear previous results
        document.getElementById('resultsUrl').textContent = '';
        document.getElementById('resultsData').textContent = '';
        document.getElementById('jsonTreeViewer').innerHTML = '';
        
        // Build the API URL
        let url = '';
        let useEventSpecificEndpoint = false;
        
        // Check if we need to use the event-specific endpoint for period markets
        const selectedMarkets = [];
        document.querySelectorAll('#marketContainer input[type="checkbox"]:checked').forEach(checkbox => {
            selectedMarkets.push(checkbox.value);
        });
        
        // Period markets that require the event-specific endpoint
        const periodMarkets = ['h2h_q1', 'h2h_q2', 'h2h_q3', 'h2h_q4', 'h2h_h1', 'h2h_h2', 
                              'spreads_q1', 'spreads_q2', 'spreads_q3', 'spreads_q4', 'spreads_h1', 'spreads_h2',
                              'totals_q1', 'totals_q2', 'totals_q3', 'totals_q4', 'totals_h1', 'totals_h2'];
        
        // Check if any selected market is a period market
        const hasPeriodMarket = selectedMarkets.some(market => periodMarkets.includes(market));
        
        // Check if this is a historical endpoint
        const isHistorical = endpoint.startsWith('historical_');
        
        if (endpoint === 'sports') {
            // Sports endpoint doesn't need a sport parameter
            url = `https://api.the-odds-api.com/v4/sports`;
        } else if (endpoint === 'odds' && hasPeriodMarket) {
            // If using odds endpoint with period markets, we need to use the event-specific endpoint
            const eventId = document.getElementById('eventId').value;
            
            if (!eventId) {
                alert('Period markets (quarter/half) require an event ID. Please fetch and select an event first.');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            const sport = document.getElementById('sport').value;
            
            if (!sport) {
                alert('Please select a sport');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            url = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds`;
            useEventSpecificEndpoint = true;
        } else if (endpoint === 'event_odds') {
            // For event_odds endpoint, use the correct format: /v4/sports/{sport}/events/{eventId}/odds
            const sport = document.getElementById('sport').value;
            
            if (!sport) {
                alert('Please select a sport');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            const eventId = document.getElementById('eventId').value;
            
            if (!eventId) {
                alert('Please enter an event ID');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            url = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds`;
        } else if (isHistorical) {
            // For historical endpoints, use the correct format: /v4/historical/sports/{sport}/{endpoint without 'historical_' prefix}
            const sport = document.getElementById('sport').value;
            
            if (!sport) {
                alert('Please select a sport');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            // Remove 'historical_' prefix from endpoint
            const actualEndpoint = endpoint.replace('historical_', '');
            
            url = `https://api.the-odds-api.com/v4/historical/sports/${sport}/${actualEndpoint}`;
            
            // Add event ID parameter if needed for historical_event_odds
            if (endpoint === 'historical_event_odds') {
                const eventId = document.getElementById('eventId').value;
                
                if (!eventId) {
                    alert('Please enter an event ID');
                    document.getElementById('loadingIndicator').classList.add('hidden');
                    return;
                }
                
                url = `https://api.the-odds-api.com/v4/historical/sports/${sport}/events/${eventId}/odds`;
            }
        } else {
            // All other endpoints need the sport parameter
            const sport = document.getElementById('sport').value;
            
            if (!sport) {
                alert('Please select a sport');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
            
            // Use the correct format /v4/sports/{sport}/{endpoint}
            url = `https://api.the-odds-api.com/v4/sports/${sport}`;
            
            // Add endpoint after sport
            if (endpoint !== 'sports') {
                url += `/${endpoint}`;
            }
        }
        
        // Add query parameters
        const queryParams = new URLSearchParams();
        
        // Add API key
        queryParams.append('apiKey', apiKey);
        
        // Add regions if selected
        if (endpoint === 'odds' || endpoint === 'event_odds' || useEventSpecificEndpoint || 
            endpoint === 'historical_odds' || endpoint === 'historical_event_odds') {
            const selectedRegions = [];
            document.querySelectorAll('#regionContainer input[type="checkbox"]:checked').forEach(checkbox => {
                selectedRegions.push(checkbox.value);
            });
            
            if (selectedRegions.length > 0) {
                queryParams.append('regions', selectedRegions.join(','));
            }
            
            // Add markets if selected
            if (selectedMarkets.length > 0) {
                queryParams.append('markets', selectedMarkets.join(','));
            }
            
            // Add bookmakers if specified
            const bookmakers = document.getElementById('bookmakers').value;
            if (bookmakers) {
                queryParams.append('bookmakers', bookmakers);
            }
            
            // For historical endpoints, ensure either regions or bookmakers are specified
            if (isHistorical && selectedRegions.length === 0 && !bookmakers) {
                alert('Historical endpoints require at least one region or bookmaker. Please select at least one region or specify bookmakers.');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
        }
        
        // Add date format
        const dateFormat = document.getElementById('dateFormat').value;
        if (dateFormat) {
            queryParams.append('dateFormat', dateFormat);
        }
        
        // Add odds format
        const oddsFormat = document.getElementById('oddsFormat').value;
        if (oddsFormat) {
            queryParams.append('oddsFormat', oddsFormat);
        }
        
        // Add date for historical endpoints
        if (isHistorical) {
            const date = document.getElementById('date').value;
            if (date) {
                queryParams.append('date', date);
            } else {
                alert('Please enter a date for historical data');
                document.getElementById('loadingIndicator').classList.add('hidden');
                return;
            }
        }
        
        // Add additional parameters
        document.querySelectorAll('#additionalParams .parameter-row').forEach(row => {
            const paramName = row.querySelector('.param-name').value;
            const paramValue = row.querySelector('.param-value').value;
            
            if (paramName && paramValue) {
                queryParams.append(paramName, paramValue);
            }
        });
        
        // Complete the URL
        const fullUrl = `${url}?${queryParams.toString()}`;
        
        // Display the URL
        document.getElementById('resultsUrl').textContent = fullUrl;
        
        // Make the API request
        fetch(fullUrl)
            .then(response => {
                // Check for rate limit headers
                const remainingRequests = response.headers.get('x-requests-remaining');
                const usedRequests = response.headers.get('x-requests-used');
                
                if (remainingRequests && usedRequests) {
                    console.log(`Remaining requests: ${remainingRequests}`);
                    console.log(`Used requests: ${usedRequests}`);
                }
                
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${text}`);
                    });
                }
                
                return response.json();
            })
            .then(data => {
                // Hide loading state
                document.getElementById('loadingIndicator').classList.add('hidden');
                
                // Display the results
                document.getElementById('resultsData').textContent = JSON.stringify(data, null, 2);
                
                // Create JSON tree view
                createJsonTreeView(data, document.getElementById('jsonTreeViewer'));
                
                // Initialize JSON viewer controls
                initializeJsonViewer();
            })
            .catch(error => {
                // Hide loading state
                document.getElementById('loadingIndicator').classList.add('hidden');
                
                console.error('API request error:', error);
                
                // Display error in results
                document.getElementById('resultsData').textContent = `Error: ${error.message}`;
                document.getElementById('resultsData').classList.remove('hidden');
                
                // Create simple error object for JSON viewer
                const errorObj = { error: error.message };
                createJsonTreeView(errorObj, document.getElementById('jsonTreeViewer'));
                
                // Initialize JSON viewer controls
                initializeJsonViewer();
            });
    }
    
    /**
     * Copies the request URL to clipboard
     */
    function copyRequestUrl() {
        const urlText = document.getElementById('resultsUrl').textContent;
        
        if (!urlText) {
            alert('No URL to copy');
            return;
        }
        
        navigator.clipboard.writeText(urlText)
            .then(() => {
                const originalText = copyUrlButton.textContent;
                copyUrlButton.textContent = 'Copied!';
                
                setTimeout(() => {
                    copyUrlButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy URL:', err);
                alert('Failed to copy URL');
            });
    }
}); 