/**
 * CodeHelix — Global Command Palette v1.0
 * Enabling keyboard-driven hyperspeed navigation.
 */

import { supabase } from '/js/supabase.js';

class CommandPalette {
    constructor() {
        this.isOpen = false;
        this.commands = [
            { id: 'nav-dash', title: 'Go to Dashboard', subtitle: 'Overview & Recent Activity', icon: '⬡', action: () => location.href = '/dashboard.html', shortcut: 'G D' },
            { id: 'nav-lab', title: 'Open Problem Lab', subtitle: 'Browse all challenges', icon: '⊞', action: () => location.href = '/problems.html', shortcut: 'G P' },
            { id: 'nav-sols', title: 'View All Solutions', subtitle: 'Peer submissions & code', icon: '◈', action: () => location.href = '/solutions.html', shortcut: 'G S' },
            { id: 'nav-insights', title: 'System Insights', subtitle: 'Analytics & coverage', icon: '◉', action: () => location.href = '/insights.html', shortcut: 'G I' },
            { id: 'nav-settings', title: 'Settings', subtitle: 'Profile & Preferences', icon: '◎', action: () => location.href = '/settings.html', shortcut: 'G ,' },
            { id: 'cmd-new', title: 'Create New Problem', subtitle: 'Open workspace', icon: '＋', action: () => window.open('/manage-problem.html', '_blank') },
        ];
        this.results = [];
        this.selectedIndex = 0;
        this.init();
    }

    init() {
        this.renderOverlay();
        this.setupListeners();
    }

    renderOverlay() {
        const html = `
            <div id="palette-overlay" class="palette-overlay">
                <div class="palette-modal">
                    <div class="palette-search-wrap">
                        <span class="palette-icon">🔍</span>
                        <input type="text" id="palette-input" placeholder="Search problems, members, or commands..." autocomplete="off">
                    </div>
                    <div id="palette-results" class="palette-results"></div>
                    <div class="palette-footer">
                        <div class="palette-hint"><kbd>↑↓</kbd> to navigate</div>
                        <div class="palette-hint"><kbd>↵</kbd> to select</div>
                        <div class="palette-hint"><kbd>esc</kbd> to close</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.overlay = document.getElementById('palette-overlay');
        this.input = document.getElementById('palette-input');
        this.resultsList = document.getElementById('palette-results');
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        this.input.addEventListener('input', () => this.search());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
                this.renderResults();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
                this.renderResults();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = this.results[this.selectedIndex];
                if (selected) this.execute(selected);
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        this.input.value = '';
        this.input.focus();
        this.search(); // Show default commands
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        this.input.blur();
    }

    async search() {
        const query = this.input.value.toLowerCase().trim();
        this.results = [];

        // 1. Match static commands
        const matchedCommands = this.commands.filter(c =>
            c.title.toLowerCase().includes(query) ||
            c.subtitle.toLowerCase().includes(query)
        );
        this.results.push(...matchedCommands);

        // 2. Fetch problems from Supabase if query > 2 chars
        if (query.length > 2) {
            try {
                const { data: problems } = await supabase
                    .from('problems')
                    .select('id, title, difficulty')
                    .ilike('title', `%${query}%`)
                    .limit(5);

                if (problems) {
                    problems.forEach(p => {
                        this.results.push({
                            id: `prob-${p.id}`,
                            title: p.title,
                            subtitle: `Problem — ${p.difficulty}`,
                            icon: '🧩',
                            action: () => location.href = `/problem-detail.html?id=${p.id}`
                        });
                    });
                }
            } catch (err) {
                console.error('Palette search error:', err);
            }
        }

        this.selectedIndex = 0;
        this.renderResults();
    }

    renderResults() {
        this.resultsList.innerHTML = this.results.map((res, index) => `
            <div class="palette-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
                <div class="palette-item-main">
                    <div class="palette-item-title">${res.icon} ${res.title}</div>
                    <div class="palette-item-subtitle">${res.subtitle}</div>
                </div>
                ${res.shortcut ? `<div class="palette-shortcut">${res.shortcut}</div>` : ''}
            </div>
        `).join('');

        // Scroll into view
        const selected = this.resultsList.querySelector('.selected');
        if (selected) selected.scrollIntoView({ block: 'nearest' });

        // Add click listeners
        this.resultsList.querySelectorAll('.palette-item').forEach(item => {
            item.onclick = () => {
                const idx = parseInt(item.dataset.index);
                this.execute(this.results[idx]);
            };
        });
    }

    execute(item) {
        if (item.action) {
            item.action();
            this.close();
        }
    }
}

// Auto-initialize
export const palette = new CommandPalette();
