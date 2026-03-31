// Theme Toggle — Dark / Light / Nature
const THEMES = ['dark', 'light', 'nature'];
const STORAGE_KEY = 'lanco-theme';

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');

    applyTheme(initial);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.body.getAttribute('data-theme') || 'dark';
            const idx = THEMES.indexOf(current);
            const next = THEMES[(idx + 1) % THEMES.length];
            applyTheme(next);
            localStorage.setItem(STORAGE_KEY, next);
        });
    }
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
}

export function getCurrentTheme() {
    return document.body.getAttribute('data-theme') || 'dark';
}

/** Returns the scene background color for current theme */
export function getSceneBgColor(theme) {
    const map = {
        dark: 0x0a0a0a,
        light: 0xf0f0f0,
        nature: 0x1a1d16,
    };
    return map[theme] ?? map.dark;
}

/** Returns the accent color for current theme */
export function getAccentColor(theme) {
    const map = {
        dark: 0x00d4ff,
        light: 0x0066cc,
        nature: 0x7ab648,
    };
    return map[theme] ?? map.dark;
}
