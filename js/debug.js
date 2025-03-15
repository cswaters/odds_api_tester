/**
 * Debug script for the Odds API Tester
 * This script will help identify issues with the sports dropdown
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Debug script loaded');
    
    // Monitor API key changes
    const apiKeyInput = document.getElementById('apiKey');
    apiKeyInput.addEventListener('change', function() {
        console.log('API key changed, value length:', this.value.length);
    });
    
    // Monitor endpoint selection
    const endpointSelect = document.getElementById('endpoint');
    endpointSelect.addEventListener('change', function() {
        console.log('Endpoint changed to:', this.value);
    });
    
    // Override the loadSports function to add debugging
    const originalLoadSports = window.loadSports;
    if (typeof originalLoadSports === 'function') {
        window.loadSports = function() {
            console.log('loadSports called');
            return originalLoadSports.apply(this, arguments);
        };
    } else {
        console.warn('Could not find loadSports function to override');
    }
    
    // Debug button removed as it's no longer needed
}); 