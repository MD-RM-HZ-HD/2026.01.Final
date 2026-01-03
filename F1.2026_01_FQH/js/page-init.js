// js/page-init.js

document.addEventListener('alpine:init', () => {
    
    // === 1. Accordion Component ===
    Alpine.data('accordionItem', (defaultOpen = false) => ({
        open: defaultOpen,
        iconText: defaultOpen ? '−' : '+',
        
        init() {
            // Listen for the "Expand All" signal from the navbar
            window.addEventListener('expand-all', () => {
                this.open = true;
                this.iconText = '−';
            });

            // Listen for the "Collapse All" signal from the navbar
            window.addEventListener('collapse-all', () => {
                this.open = false;
                this.iconText = '+';
            });
        },

        toggle() {
            this.open = !this.open;
            this.iconText = this.open ? '−' : '+';
        }
    }));

    // === 2. Page Settings Component (Font, Theme, Modal) ===
    Alpine.data('pageSettings', () => ({
        darkMode: localStorage.getItem('darkMode') === 'true',
        fontSize: parseInt(localStorage.getItem('fontSize')) || 18,
        showIntroModal: !localStorage.getItem('introModalSeen'),
        
        init() {
            document.documentElement.style.setProperty('--content-font-size', this.fontSize + 'px');
            // Watch for storage changes (if user changes settings in another tab)
            window.addEventListener('storage', () => {
                this.darkMode = localStorage.getItem('darkMode') === 'true';
                this.fontSize = parseInt(localStorage.getItem('fontSize')) || 18;
            });

            // Listen for font changes from the Navbar Tools
            window.addEventListener('font-change', (e) => {
                this.fontSize += e.detail;
                // Constraints: Min 14px, Max 32px
                if(this.fontSize > 32) this.fontSize = 32;
                if(this.fontSize < 14) this.fontSize = 14;
                
                // Save and Apply
                localStorage.setItem('fontSize', this.fontSize);
                document.documentElement.style.setProperty('--content-font-size', this.fontSize + 'px');
            });

            // Listen for font reset
            window.addEventListener('font-reset', () => {
                this.fontSize = 18;
                localStorage.setItem('fontSize', 18);
                document.documentElement.style.setProperty('--content-font-size', '18px');
            });

            // Listen for theme toggle
            window.addEventListener('theme-toggle', () => {
                this.darkMode = !this.darkMode;
                localStorage.setItem('darkMode', this.darkMode);
            });
        },
        
        closeModal() {
            this.showIntroModal = false;
            localStorage.setItem('introModalSeen', 'true');
        }
    }));
});