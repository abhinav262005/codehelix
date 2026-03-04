// ===================================================
// CodeHelix — Sidebar Component v2 (Premium)
// ===================================================

import { getUser, getProfile, signOut } from './auth.js';
import { palette } from './palette.js';

export async function initSidebar(activePage = '') {
  const user = await getUser();
  if (!user) return;

  const profile = await getProfile(user.id);
  const isAdmin = profile?.role === 'admin';
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const initial = (profile?.username || 'U')[0].toUpperCase();
  const username = esc(profile?.username || 'Member');
  const accent = profile?.accent_color || '#00ffa3';

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <div class="sidebar-logo-mark">CH</div>
      <div class="sidebar-logo-text">Code<span>Helix</span></div>
    </div>

    <nav class="sidebar-nav">
      <span class="nav-section-label">Workspace</span>

      <a href="/dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="nav-icon">⬡</span>
        <span>Dashboard</span>
      </a>
      <a href="/problems.html" class="nav-item ${activePage === 'problems' ? 'active' : ''}">
        <span class="nav-icon">⊞</span>
        <span>Problem Lab</span>
      </a>
      <a href="/solutions.html" class="nav-item ${activePage === 'solutions' ? 'active' : ''}">
        <span class="nav-icon" style="color:var(--accent-purple);">◈</span>
        <span>Solutions</span>
      </a>
      <a href="/insights.html" class="nav-item ${activePage === 'insights' ? 'active' : ''}">
        <span class="nav-icon">◉</span>
        <span>Insights</span>
      </a>

      <span class="nav-section-label" style="margin-top:8px">Account</span>

      <a href="/settings.html" class="nav-item ${activePage === 'settings' ? 'active' : ''}">
        <span class="nav-icon">◎</span>
        <span>Settings</span>
      </a>
      ${isAdmin ? `
      <a href="/settings.html#admin" class="nav-item ${activePage === 'admin' ? 'active' : ''}">
        <span class="nav-icon">👑</span>
        <span>Admin Panel</span>
        <span class="badge badge-admin" style="margin-left:auto;font-size:0.58rem;padding:2px 7px;letter-spacing:0.04em;">ADMIN</span>
      </a>` : ''}

      <span class="nav-section-label" style="margin-top:8px">Quick Create</span>
      <a href="/manage-problem.html" target="_blank" class="nav-item">
        <span class="nav-icon" style="color:var(--accent-green)">＋</span>
        <span>New Problem</span>
      </a>
    </nav>

    <div class="sidebar-user">
      <div class="user-avatar" style="background: ${accent}; box-shadow: 0 0 15px ${accent}66; border: 1.5px solid rgba(255,255,255,0.2); overflow: hidden;">
        ${profile?.avatar_url ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;">` : initial}
      </div>
      <div class="user-info">
        <div class="user-name">${username}</div>
        <div class="user-role">${isAdmin ? '👑 Admin' : '◉ Member'}</div>
      </div>
      <button class="btn btn-icon btn-ghost" id="sidebar-logout" title="Sign out" style="margin-left:auto;flex-shrink:0;font-size:1rem;">
        ⏻
      </button>
    </div>
  `;

  document.getElementById('sidebar-logout')?.addEventListener('click', async () => {
    await signOut();
  });

  // Mobile Header & Overlay Injection
  if (!document.getElementById('mobile-header')) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      const mobileHeader = document.createElement('div');
      mobileHeader.id = 'mobile-header';
      mobileHeader.className = 'mobile-header';
      mobileHeader.innerHTML = `
        <div class="mobile-logo">
          <div class="sidebar-logo-mark" style="width:32px;height:32px;font-size:0.75rem;">CH</div>
          <div class="sidebar-logo-text" style="font-size:1.05rem;font-weight:800;letter-spacing:-0.04em;">Code<span style="color:var(--accent-green);">Helix</span></div>
        </div>
        <button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>
      `;
      mainContent.insertBefore(mobileHeader, mainContent.firstChild);

      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);

      document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        sidebar.classList.add('sidebar-open');
        overlay.classList.add('overlay-active');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('overlay-active');
      });

      sidebar.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          sidebar.classList.remove('sidebar-open');
          overlay.classList.remove('overlay-active');
        }
      });
    }
  }
}

function esc(str) {
  return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
