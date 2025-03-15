# Odds API Tester

A comprehensive web-based tool for testing and exploring the [Odds API](https://the-odds-api.com/) endpoints. This application allows you to easily construct API requests, view responses, and explore the data returned by the API.

## Features

- Support for all Odds API endpoints
- Interactive form for building API requests
- Comprehensive market selection organized by categories
- Region and bookmaker selection
- JSON tree viewer with search, expand/collapse, and copy functionality
- Event selection modal for finding event IDs
- Local storage for API key persistence
- Mobile-responsive design

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Enter your Odds API key
4. Select an endpoint and configure the parameters
5. Click "Send Request" to see the results

## Supported Endpoints

- GET sports - List all available sports
- GET odds - Get odds for a specific sport
- GET scores - Get scores for a specific sport
- GET events - Get events for a specific sport
- GET event odds - Get odds for a specific event
- GET participants - Get participants for a specific sport
- GET historical odds - Get historical odds for a specific sport
- GET historical events - Get historical events for a specific sport
- GET historical event odds - Get historical odds for a specific event

## Market Categories

The application organizes markets into logical categories:

- Featured Markets (h2h, spreads, totals, etc.)
- Additional Markets (alternate spreads, team totals, etc.)
- Period Markets (quarters, halves, periods)
- Baseball Innings Markets
- Player Props by sport (NFL, NBA, MLB, NHL, Soccer)

## JSON Viewer

The JSON viewer provides an interactive way to explore API responses:

- Expand/collapse nested objects and arrays
- Search within the JSON data
- Copy specific values or paths
- Toggle between tree view and raw JSON

## Bookmakers

The application includes reference lists of bookmakers by region:

- US Bookmakers
- US2 Bookmakers
- UK Bookmakers
- EU Bookmakers
- AU Bookmakers

You can also specify bookmakers directly using the comma-separated input field.

## Browser Compatibility

This application works in all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

## License

MIT

## Acknowledgements

- [The Odds API](https://the-odds-api.com/) for providing the sports betting data API
- Icons and styling inspiration from various open-source projects
