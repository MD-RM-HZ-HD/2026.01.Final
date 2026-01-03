/**
 * Advanced Nav Loader - All Fixes Included
 */

(function () {
    // === 1. Configuration ===
    const NAV_CONFIG = {
        subjectLinks: [
            { href: 'main-index.html', label: 'الرئيسية (القائمة)' },
            { href: 'F1.2026_01_AKD/index.html', label: 'العقيدة' },
            { href: 'F1.2026_01_FQH/index.html', label: 'الفقه' },
            { href: 'F1.2026_01_QRN/index.html', label: 'القرآن' }
        ],
        extraLinks: [
            { href: 'pages/mindmap.html', label: 'خريطة ذهنية' },
            { href: 'pages/mindmap_interactive.html', label: 'خريطة تفاعلية' },
        ],
        examLinks: [
            { href: 'pages/qz-true-false.html', label: 'صواب/خطأ' },
            { href: 'pages/qz-mc-in.html', label: 'اختيار تفاعلي' },
            { href: 'pages/qz-fill-blank.html', label: 'املأ الفراغ' },
            { href: 'pages/card-flip.html', label: 'بطاقات مراجعة' },
            { href: 'pages/qz-comparison.html', label: 'جدول مقارنة' }
        ]
    };

    // === 2. Path Utilities ===
    function detectPageDepth() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        if (filename === 'main-index.html' || path.endsWith('/')) return 'root';
        if (path.includes('/pages/')) return 'deep-page';
        if (path.includes('/F1.') && !path.includes('/pages/')) return 'subject-root';
        return 'root';
    }

    function buildPath(targetHref, depth) {
        let cleanHref = targetHref;
        if (cleanHref === 'main-index.html') {
            if (depth === 'root') return './main-index.html';
            if (depth === 'subject-root') return '../main-index.html';
            if (depth === 'deep-page') return '../../main-index.html';
        }
        if (cleanHref.startsWith('F1')) {
            if (depth === 'root') return `./${cleanHref}`;
            if (depth === 'subject-root') return `../${cleanHref}`;
            if (depth === 'deep-page') return `../../${cleanHref}`;
        }
        if (cleanHref.startsWith('pages/')) {
            if (depth === 'root') return '#';
            if (depth === 'subject-root') return `./${cleanHref}`;
            if (depth === 'deep-page') return `./${cleanHref.replace('pages/', '')}`;
        }
        return cleanHref;
    }

    // === 3. Load CSS ===
    function loadExternalCSS() {
        const depth = detectPageDepth();
        let cssPath = '';
        if (depth === 'root') cssPath = './css/layout/header.css';
        else if (depth === 'subject-root') cssPath = '../css/layout/header.css';
        else if (depth === 'deep-page') cssPath = '../../css/layout/header.css';

        if (!document.querySelector(`link[href^="${cssPath}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath + '?v=' + new Date().getTime(); 
            document.head.appendChild(link);
        }
    }

    // === 4. Theme & Tools Logic ===
    function initThemeLogic() {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const applyTheme = (isDark) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
            }
        };
        if (savedTheme === 'dark' || (!savedTheme && systemDark)) applyTheme(true);
        else applyTheme(false);

        window.addEventListener('theme-toggle', () => {
            const isDarkNow = document.documentElement.classList.contains('dark');
            applyTheme(!isDarkNow);
            localStorage.setItem('theme', !isDarkNow ? 'dark' : 'light');
        });
    }

    // --- تعديل جوهري: استهداف عناصر النصوص فقط للتكبير ---
    function initToolsListeners() {
        // هذه الدالة تبحث عن العناصر القابلة للتكبير فقط وتتجاهل النافبار
        const getTargetElements = () => {
            // نحاول استهداف المحتوى بدقة
            const mainContainers = document.querySelectorAll('.content-area, main, #content, article, .container');
            
            if (mainContainers.length > 0) {
                return mainContainers;
            } else {
                // إذا لم توجد حاوية، نستهدف الفقرات والعناوين والقوائم مباشرة
                // هذا يضمن عدم تكبير النافبار لأنه ليس p ولا h1
                return document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, span:not(.mobile-nav-item span)');
            }
        };

        window.addEventListener('font-change', (e) => {
            const delta = e.detail;
            const targets = getTargetElements();

            targets.forEach(target => {
                // فحص إضافي للتأكد أن العنصر ليس داخل النافبار
                if (target.closest('#mobile-bottom-nav') || target.closest('.main-nav-container')) return;

                const currentSize = parseFloat(window.getComputedStyle(target).fontSize);
                const newSize = Math.max(14, Math.min(32, currentSize + delta));
                target.style.fontSize = newSize + 'px';
            });
        });

        window.addEventListener('font-reset', () => {
            const targets = getTargetElements();
            targets.forEach(target => {
                target.style.fontSize = ''; 
            });
        });
    }

    // === 5. HTML Templates ===
    function getThemeSwitchHtml() {
        return `<div class="theme-switch-container" onclick="window.dispatchEvent(new CustomEvent('theme-toggle')); event.stopPropagation();"><div class="theme-switch-slider"><svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg><svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9.37 5.51c-.18.64-.27 1.31-.27 1.99 0 4.08 3.32 7.4 7.4 7.4.68 0 1.35-.09 1.99-.27C17.45 18.55 13.77 22 9.25 22 4.14 22 0 17.86 0 12.75c0-4.52 3.45-8.2 7.99-9.24h.01c.45 1.1.91 2.1 1.37 3z"/></svg></div></div>`;
    }

    function getToolsContent() {
        return `<div class="tools-row" style="justify-content: center;"><button onclick="window.dispatchEvent(new CustomEvent('font-change', {detail: 2})); event.stopPropagation();" class="tool-btn-circle">A+</button><button onclick="window.dispatchEvent(new CustomEvent('font-reset')); event.stopPropagation();" class="tool-btn-circle">↺</button><button onclick="window.dispatchEvent(new CustomEvent('font-change', {detail: -2})); event.stopPropagation();" class="tool-btn-circle">A-</button></div><div style="height:1px; background:rgba(255,255,255,0.2); margin:8px 0;"></div><div class="tools-row"><button onclick="window.dispatchEvent(new CustomEvent('expand-all')); event.stopPropagation();" class="tool-btn-rect">توسيع</button>${getThemeSwitchHtml()}<button onclick="window.dispatchEvent(new CustomEvent('collapse-all')); event.stopPropagation();" class="tool-btn-rect">طي</button></div>`;
    }

    // === 6. Render Navbar ===
    function renderNavbar() {
        const placeholder = document.getElementById('navbar-placeholder');
        if (!placeholder) return;

        const depth = detectPageDepth();
        const isMobile = window.innerWidth < 768;
        
        // Icons
        const icons = {
            home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`,
            exam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>`,
            map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>`,
            settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
        };

        if (isMobile) {
            // === LOGIC ===
            const currentPath = window.location.pathname;
            const isHomeActive = currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.includes('/F1.');
            const isMapActive = currentPath.includes('mindmap');
            const isQuizActive = currentPath.includes('qz-') || currentPath.includes('card-flip');
            
            // --- تم حذف شرط showPageTools، سيتم عرض الأزرار دائماً ---
            
            const popupsHtml = `
                <div id="popup-subjects" class="mobile-popup-sheet">${NAV_CONFIG.subjectLinks.map(l => `<a href="${buildPath(l.href, depth)}" class="mobile-popup-link">${l.label}</a>`).join('')}</div>
                <div id="popup-exams" class="mobile-popup-sheet">${NAV_CONFIG.examLinks.map(l => `<a href="${buildPath(l.href, depth)}" class="mobile-popup-link">${l.label}</a>`).join('')}</div>
                <div id="popup-maps" class="mobile-popup-sheet">${NAV_CONFIG.extraLinks.map(l => `<a href="${buildPath(l.href, depth)}" class="mobile-popup-link">${l.label}</a>`).join('')}</div>
                <div id="popup-tools" class="mobile-popup-sheet">${getToolsContent()}</div>
            `;
            
            const navHtml = `
                <nav id="mobile-bottom-nav">
                    <button class="mobile-nav-item ${isHomeActive && !isMapActive && !isQuizActive ? 'active-tab' : ''}" data-target="popup-subjects">${icons.home}<span>الرئيسية</span></button>
                    <button class="mobile-nav-item ${isQuizActive ? 'active-tab' : ''}" data-target="popup-exams">${icons.exam}<span>اختبارات</span></button>
                    <button class="mobile-nav-item ${isMapActive ? 'active-tab' : ''}" data-target="popup-maps">${icons.map}<span>خرائط</span></button>
                    <button class="mobile-nav-item" data-target="popup-tools">${icons.settings}<span>إعدادات</span></button>
                </nav>
            `;
            placeholder.innerHTML = popupsHtml + navHtml;
            setupMobileInteractions();

        } else {
            // Desktop Logic
            const createDropdown = (id, title, links) => {
                if (depth === 'root' && id !== 'subj-d') return '';
                const items = links.map(l => `<a href="${buildPath(l.href, depth)}" class="nav-dropdown-item">${l.label}</a>`).join('');
                return `<div class="relative group"><button id="btn-${id}" class="nav-btn-main">${title}<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button><div id="menu-${id}" class="desktop-dropdown-menu hidden">${items}</div></div>`;
            };
            const desktopExtra = (depth !== 'root') ? NAV_CONFIG.extraLinks.map(l => `<a href="${buildPath(l.href, depth)}" class="nav-btn-main">${l.label}</a>`).join('') : '';
            
            placeholder.innerHTML = `
            <nav class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[900px] z-50 p-2">
                <div class="main-nav-container">
                    <div class="flex items-center space-x-2 space-x-reverse">
                        ${createDropdown('subj-d', 'الرئيسية', NAV_CONFIG.subjectLinks)}
                        ${desktopExtra}
                        ${createDropdown('exam-d', 'امتحانات', NAV_CONFIG.examLinks)}
                    </div>
                    <div class="relative">
                        <button id="btn-dt-tools" class="nav-btn-icon">${icons.settings}</button>
                        <div id="menu-dt-tools" class="desktop-dropdown-menu tools-menu hidden">${getToolsContent()}</div>
                    </div>
                </div>
            </nav>`;
            setupDesktopInteractions();
        }
    }

    // === 7. Interactions ===
    function setupMobileInteractions() {
        const navItems = document.querySelectorAll('.mobile-nav-item');
        navItems.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = btn.getAttribute('data-target');
                const targetPopup = document.getElementById(targetId);
                const isActive = targetPopup.classList.contains('active');
                document.querySelectorAll('.mobile-popup-sheet').forEach(el => el.classList.remove('active'));
                if (!isActive) { targetPopup.classList.add('active'); }
            });
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-popup-sheet') && !e.target.closest('#mobile-bottom-nav')) {
                document.querySelectorAll('.mobile-popup-sheet').forEach(el => el.classList.remove('active'));
            }
        });
    }

    function setupDesktopInteractions() {
        const toggleMenu = (btnId, menuId) => {
            const btn = document.getElementById(btnId);
            const menu = document.getElementById(menuId);
            if(!btn || !menu) return;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = menu.classList.contains('hidden');
                document.querySelectorAll('.desktop-dropdown-menu').forEach(el => { el.classList.add('hidden'); el.classList.remove('show'); });
                if (isHidden) { menu.classList.remove('hidden'); setTimeout(() => menu.classList.add('show'), 10); }
            });
        };
        toggleMenu('btn-subj-d', 'menu-subj-d');
        toggleMenu('btn-exam-d', 'menu-exam-d');
        toggleMenu('btn-dt-tools', 'menu-dt-tools');
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.desktop-dropdown-menu') && !e.target.closest('button')) {
                document.querySelectorAll('.desktop-dropdown-menu').forEach(el => { el.classList.remove('show'); setTimeout(() => el.classList.add('hidden'), 200); });
            }
        });
    }

    function injectPageInit() {
        const depth = detectPageDepth();
        let scriptPath;
        if (depth === 'root') scriptPath = './js/page-init.js';
        else if (depth === 'subject-root') scriptPath = '../js/page-init.js';
        else if (depth === 'deep-page') scriptPath = '../../js/page-init.js';
        if (scriptPath && !document.querySelector(`script[src="${scriptPath}"]`)) {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    function init() {
        loadExternalCSS();
        injectPageInit();
        initThemeLogic();
        initToolsListeners();
        renderNavbar();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(renderNavbar, 200);
        });
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();