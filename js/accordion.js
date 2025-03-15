/**
 * Accordion functionality for collapsible sections
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize accordions
    const accordions = document.getElementsByClassName('accordion');
    
    for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener('click', function() {
            this.classList.toggle('active');
            
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
        
        // Open the first accordion by default
        if (i === 0) {
            accordions[i].classList.add('active');
            const panel = accordions[i].nextElementSibling;
            panel.style.maxHeight = panel.scrollHeight + 'px';
        }
    }
    
    /**
     * Updates the max height of all open accordion panels
     * Useful when content inside panels changes dynamically
     */
    window.updateAccordions = function() {
        const activeAccordions = document.querySelectorAll('.accordion.active');
        activeAccordions.forEach(accordion => {
            const panel = accordion.nextElementSibling;
            panel.style.maxHeight = panel.scrollHeight + 'px';
        });
    };
    
    /**
     * Opens an accordion panel by its index
     * @param {number} index - The index of the accordion to open
     */
    window.openAccordion = function(index) {
        if (index >= 0 && index < accordions.length) {
            if (!accordions[index].classList.contains('active')) {
                accordions[index].click();
            }
        }
    };
    
    /**
     * Opens an accordion panel containing a specific element
     * @param {HTMLElement} element - The element to find within accordion panels
     */
    window.openAccordionContaining = function(element) {
        if (!element) return;
        
        // Find the parent panel
        let panel = element.closest('.panel');
        if (panel) {
            const accordion = panel.previousElementSibling;
            if (accordion && accordion.classList.contains('accordion') && !accordion.classList.contains('active')) {
                accordion.click();
            }
        }
    };
}); 