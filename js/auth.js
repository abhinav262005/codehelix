// ===================================================
// CodeHelix — Auth Helpers
// Session management, guard, profile fetching
// ===================================================

import { supabase } from './supabase.js';

// ─── Get current session ──────────────────────────
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// ─── Get current user ─────────────────────────────
export async function getUser() {
    const session = await getSession();
    return session?.user ?? null;
}

// ─── Get profile (includes role) ──────────────────
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
}

// ─── Require auth: redirect if no session ─────────
export async function requireAuth(redirectTo = '/login.html') {
    const session = await getSession();
    if (!session) {
        window.location.href = redirectTo;
        return null;
    }
    return session;
}

// ─── Require guest: redirect if already logged in ─
export async function requireGuest(redirectTo = '/dashboard.html') {
    const session = await getSession();
    if (session) {
        window.location.href = redirectTo;
        return;
    }
}

// ─── Sign in ──────────────────────────────────────
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

// ─── Sign out ─────────────────────────────────────
export async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/login.html';
}

// ─── Change password ──────────────────────────────
export async function changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
}

// ─── Is admin check ───────────────────────────────
export async function isAdmin(userId) {
    const profile = await getProfile(userId);
    return profile?.role === 'admin';
}

// ─── Toast notification ───────────────────────────
export function showToast(message, type = 'success', duration = 3500) {
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const container = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

function createToastContainer() {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
}

// ─── Format date ──────────────────────────────────
export function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Format full date (March 2, 2026 • 19:47) ──────
export function formatFullDate(dateStr) {
    if (!dateStr) return 'Unknown Date';
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const time = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return `${date} • ${time}`;
}

// ─── Debounce ─────────────────────────────────────
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ─── Escape HTML ──────────────────────────────────
export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── Difficulty badge HTML ─────────────────────────
export function difficultyBadge(difficulty) {
    const cls = difficulty?.toLowerCase() || 'medium';
    return `<span class="badge badge-${cls}">${escapeHtml(difficulty)}</span>`;
}

// ─── Language color ───────────────────────────────
export const LANGUAGE_COLORS = {
    python: '#3b82f6',
    javascript: '#f59e0b',
    typescript: '#06b6d4',
    java: '#ef4444',
    cpp: '#8b5cf6',
    'c++': '#8b5cf6',
    c: '#6b7280',
    go: '#22d3ee',
    rust: '#f97316',
    kotlin: '#a855f7',
    swift: '#f43f5e',
    ruby: '#dc2626',
};

export function langColor(lang) {
    return LANGUAGE_COLORS[lang?.toLowerCase()] || '#64748b';
}
