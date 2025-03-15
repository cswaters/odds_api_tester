/**
 * JSON Tree Viewer functionality
 * Provides interactive JSON visualization with search, expand/collapse, and copy features
 */

// Search state variables
let currentSearchResults = [];
let currentSearchIndex = -1;

/**
 * Initializes the JSON viewer controls
 */
function initializeJsonViewer() {
    // DOM Elements
    const expandAllButton = document.getElementById('expandAllButton');
    const collapseAllButton = document.getElementById('collapseAllButton');
    const copyJsonButton = document.getElementById('copyJsonButton');
    const rawJsonButton = document.getElementById('rawJsonButton');
    const jsonSearch = document.getElementById('jsonSearch');
    const searchNextButton = document.getElementById('searchNextButton');
    const searchPrevButton = document.getElementById('searchPrevButton');
    const jsonTreeViewer = document.getElementById('jsonTreeViewer');
    const resultsData = document.getElementById('resultsData');
    
    // Add event listeners
    expandAllButton.addEventListener('click', () => {
        const collapsibles = jsonTreeViewer.querySelectorAll('.collapsible');
        collapsibles.forEach(item => {
            if (item.classList.contains('collapsed')) {
                item.classList.remove('collapsed');
            }
        });
    });
    
    collapseAllButton.addEventListener('click', () => {
        const collapsibles = jsonTreeViewer.querySelectorAll('.collapsible');
        collapsibles.forEach(item => {
            if (!item.classList.contains('collapsed')) {
                item.classList.add('collapsed');
            }
        });
    });
    
    copyJsonButton.addEventListener('click', () => {
        const jsonText = resultsData.textContent;
        navigator.clipboard.writeText(jsonText)
            .then(() => {
                const originalText = copyJsonButton.textContent;
                copyJsonButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyJsonButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy JSON:', err);
                alert('Failed to copy JSON');
            });
    });
    
    rawJsonButton.addEventListener('click', () => {
        if (resultsData.classList.contains('hidden')) {
            // Switch to raw view
            resultsData.classList.remove('hidden');
            jsonTreeViewer.classList.add('hidden');
            rawJsonButton.textContent = 'Tree View';
        } else {
            // Switch to tree view
            resultsData.classList.add('hidden');
            jsonTreeViewer.classList.remove('hidden');
            rawJsonButton.textContent = 'Raw View';
        }
    });
    
    // Initialize with tree view
    resultsData.classList.add('hidden');
    jsonTreeViewer.classList.remove('hidden');
    
    // Search functionality
    jsonSearch.addEventListener('input', performSearch);
    searchNextButton.addEventListener('click', highlightNextResult);
    searchPrevButton.addEventListener('click', highlightPrevResult);
}

/**
 * Creates a JSON tree view from a JSON object
 * @param {Object|Array} jsonData - The JSON data to display
 * @param {HTMLElement} container - The container element for the tree view
 */
function createJsonTreeView(jsonData, container) {
    container.innerHTML = '';
    
    if (!jsonData) {
        container.textContent = 'No data to display';
        return;
    }
    
    const rootList = document.createElement('ul');
    container.appendChild(rootList);
    
    if (Array.isArray(jsonData)) {
        createArrayView(jsonData, rootList, '');
    } else {
        createObjectView(jsonData, rootList, '');
    }
    
    // Add click handlers for collapsible elements
    const collapsibles = container.querySelectorAll('.collapsible');
    collapsibles.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.toggle('collapsed');
        });
    });
}

/**
 * Creates a view for an object
 * @param {Object} obj - The object to display
 * @param {HTMLElement} parentElement - The parent element
 * @param {string} path - The current path in the JSON structure
 */
function createObjectView(obj, parentElement, path) {
    const keys = Object.keys(obj);
    
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        
        const listItem = document.createElement('li');
        parentElement.appendChild(listItem);
        
        const keySpan = document.createElement('span');
        keySpan.className = 'property-key';
        keySpan.textContent = `"${key}"`;
        
        const colonSpan = document.createElement('span');
        colonSpan.className = 'property-colon';
        colonSpan.textContent = ': ';
        
        listItem.appendChild(keySpan);
        listItem.appendChild(colonSpan);
        
        if (typeof value === 'object' && value !== null) {
            const collapsible = document.createElement('span');
            collapsible.className = 'collapsible';
            
            if (Array.isArray(value)) {
                collapsible.textContent = `Array(${value.length})`;
            } else {
                collapsible.textContent = 'Object';
            }
            
            listItem.appendChild(collapsible);
            
            const childList = document.createElement('ul');
            listItem.appendChild(childList);
            
            if (Array.isArray(value)) {
                createArrayView(value, childList, currentPath);
            } else {
                createObjectView(value, childList, currentPath);
            }
        } else {
            createPrimitiveView(value, listItem, currentPath);
        }
    }
}

/**
 * Creates a view for an array
 * @param {Array} arr - The array to display
 * @param {HTMLElement} parentElement - The parent element
 * @param {string} path - The current path in the JSON structure
 */
function createArrayView(arr, parentElement, path) {
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        const currentPath = `${path}[${i}]`;
        
        const listItem = document.createElement('li');
        parentElement.appendChild(listItem);
        
        const keySpan = document.createElement('span');
        keySpan.className = 'property-key';
        keySpan.textContent = i;
        
        const colonSpan = document.createElement('span');
        colonSpan.className = 'property-colon';
        colonSpan.textContent = ': ';
        
        listItem.appendChild(keySpan);
        listItem.appendChild(colonSpan);
        
        if (typeof value === 'object' && value !== null) {
            const collapsible = document.createElement('span');
            collapsible.className = 'collapsible';
            
            if (Array.isArray(value)) {
                collapsible.textContent = `Array(${value.length})`;
            } else {
                collapsible.textContent = 'Object';
            }
            
            listItem.appendChild(collapsible);
            
            const childList = document.createElement('ul');
            listItem.appendChild(childList);
            
            if (Array.isArray(value)) {
                createArrayView(value, childList, currentPath);
            } else {
                createObjectView(value, childList, currentPath);
            }
        } else {
            createPrimitiveView(value, listItem, currentPath);
        }
    }
}

/**
 * Creates a view for a primitive value
 * @param {*} value - The primitive value to display
 * @param {HTMLElement} parentElement - The parent element
 * @param {string} path - The current path in the JSON structure
 */
function createPrimitiveView(value, parentElement, path) {
    const valueContainer = document.createElement('span');
    valueContainer.className = 'property-value';
    
    const valueSpan = document.createElement('span');
    
    if (typeof value === 'string') {
        valueSpan.className = 'string-value';
        valueSpan.textContent = `"${value}"`;
    } else if (typeof value === 'number') {
        valueSpan.className = 'number-value';
        valueSpan.textContent = value;
    } else if (typeof value === 'boolean') {
        valueSpan.className = 'boolean-value';
        valueSpan.textContent = value;
    } else if (value === null) {
        valueSpan.className = 'null-value';
        valueSpan.textContent = 'null';
    } else {
        valueSpan.textContent = value;
    }
    
    valueContainer.appendChild(valueSpan);
    
    // Add copy buttons
    const copyPathButton = document.createElement('button');
    copyPathButton.className = 'copy-path';
    copyPathButton.textContent = 'Copy Path';
    copyPathButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(path)
            .then(() => {
                copyPathButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyPathButton.textContent = 'Copy Path';
                }, 2000);
            })
            .catch(err => console.error('Failed to copy path:', err));
    });
    
    const copyValueButton = document.createElement('button');
    copyValueButton.className = 'copy-value';
    copyValueButton.textContent = 'Copy Value';
    copyValueButton.addEventListener('click', (e) => {
        e.stopPropagation();
        let textToCopy = value;
        if (typeof value === 'object') {
            textToCopy = JSON.stringify(value);
        }
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyValueButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyValueButton.textContent = 'Copy Value';
                }, 2000);
            })
            .catch(err => console.error('Failed to copy value:', err));
    });
    
    valueContainer.appendChild(copyPathButton);
    valueContainer.appendChild(copyValueButton);
    
    parentElement.appendChild(valueContainer);
}

/**
 * Performs a search in the JSON tree view
 */
function performSearch() {
    const searchTerm = document.getElementById('jsonSearch').value.toLowerCase();
    const jsonTreeViewer = document.getElementById('jsonTreeViewer');
    
    // Reset previous search
    const previousHighlights = jsonTreeViewer.querySelectorAll('.search-highlight, .search-current');
    previousHighlights.forEach(el => {
        el.classList.remove('search-highlight', 'search-current');
    });
    
    currentSearchResults = [];
    currentSearchIndex = -1;
    
    if (!searchTerm) return;
    
    // Find all matching elements
    const allElements = jsonTreeViewer.querySelectorAll('.property-key, .property-value span:first-child');
    
    allElements.forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            currentSearchResults.push(el);
            el.classList.add('search-highlight');
            
            // Expand all parent collapsibles
            let parent = el.parentElement;
            while (parent && parent !== jsonTreeViewer) {
                if (parent.previousElementSibling && parent.previousElementSibling.classList.contains('collapsible')) {
                    parent.previousElementSibling.classList.remove('collapsed');
                }
                parent = parent.parentElement;
            }
        }
    });
    
    // Highlight the first result if any
    if (currentSearchResults.length > 0) {
        highlightNextResult();
    }
}

/**
 * Highlights the next search result
 */
function highlightNextResult() {
    if (currentSearchResults.length === 0) return;
    
    // Remove current highlight
    if (currentSearchIndex >= 0 && currentSearchIndex < currentSearchResults.length) {
        currentSearchResults[currentSearchIndex].classList.remove('search-current');
    }
    
    // Move to next result
    currentSearchIndex = (currentSearchIndex + 1) % currentSearchResults.length;
    
    // Add highlight to current result
    const currentElement = currentSearchResults[currentSearchIndex];
    currentElement.classList.add('search-current');
    
    // Scroll to the element
    currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Highlights the previous search result
 */
function highlightPrevResult() {
    if (currentSearchResults.length === 0) return;
    
    // Remove current highlight
    if (currentSearchIndex >= 0 && currentSearchIndex < currentSearchResults.length) {
        currentSearchResults[currentSearchIndex].classList.remove('search-current');
    }
    
    // Move to previous result
    currentSearchIndex = (currentSearchIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
    
    // Add highlight to current result
    const currentElement = currentSearchResults[currentSearchIndex];
    currentElement.classList.add('search-current');
    
    // Scroll to the element
    currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
} 