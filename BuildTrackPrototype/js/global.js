/* ============================================================
   BUILDTRACK — global.js
   Sidebar toggle, active nav, role system, shared utilities
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════
  // ROLE SYSTEM — runs first on every page
  // ══════════════════════════════════════════

  const ROLES = {
    engineer:  { label: 'LGU Project Engineer',         avatar: '👷' },
    executive: { label: 'Local Chief Executive',         avatar: '👔' },
    planning:  { label: 'Planning & Dev. Officer',       avatar: '📐' },
    admin:     { label: 'System Administrator',          avatar: '⚙️'  },
  };

  // Read session — redirect to login if missing
  const user = JSON.parse(sessionStorage.getItem('bt_user') || 'null');
  const currentPath = window.location.pathname;
  const isPublicPage = currentPath.includes('public-portal');
  const isLoginPage  = currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '';

  if (!user && !isPublicPage && !isLoginPage) {
    window.location.href = '../buildtrack/index.html';
    return;
  }

  // Apply role as data attribute on <body> — CSS uses this for show/hide
  if (user?.role) {
    document.body.setAttribute('data-role', user.role);
  }

  // Populate sidebar user info on every internal page
  if (user) {
    const nameEl   = document.getElementById('sidebarUserName');
    const roleEl   = document.getElementById('sidebarUserRole');
    const avatarEl = document.getElementById('sidebarAvatar');

    if (nameEl)   nameEl.textContent   = user.name;
    if (roleEl)   roleEl.textContent   = ROLES[user.role]?.label || user.role;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  }

  // Hide sidebar admin section for non-admins
  const adminSection = document.getElementById('sidebarAdminSection');
  if (adminSection && user?.role !== 'admin') {
    adminSection.style.display = 'none';
  }

  // Expose role check helpers globally
  window.getCurrentUser = () => user;
  window.hasRole        = (role) => user?.role === role;
  window.canEdit        = () => ['engineer','planning','admin'].includes(user?.role);
window.canAddProject  = () => ['planning','admin'].includes(user?.role);
window.canResolveAlert= () => ['planning','admin'].includes(user?.role);
window.canDirectAlert = () => user?.role === 'executive';
  window.canDelete      = () => ['planning','admin'].includes(user?.role);
  window.canReport      = () => ['executive','planning','admin'].includes(user?.role);
  window.isAdmin        = () => user?.role === 'admin';
  window.isExecutive    = () => user?.role === 'executive';

  // ══════════════════════════════════════════
  // SIDEBAR TOGGLE (mobile)
  // ══════════════════════════════════════════

  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const menuBtn        = document.getElementById('menuBtn');

  function openSidebar() {
    sidebar?.classList.add('is-open');
    sidebarOverlay?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('is-open');
    sidebarOverlay?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  menuBtn?.addEventListener('click', openSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });

  // ══════════════════════════════════════════
  // ACTIVE NAV HIGHLIGHTING
  // ══════════════════════════════════════════

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar__item[data-page]').forEach(link => {
    link.classList.remove('is-active');
    if (link.dataset.page === currentPage) link.classList.add('is-active');
  });

  // ══════════════════════════════════════════
  // MODAL UTILITY
  // ══════════════════════════════════════════

  window.openModal = function(modalId) {
    document.getElementById(modalId)?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function(modalId) {
    document.getElementById(modalId)?.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  // ══════════════════════════════════════════
  // TOAST UTILITY
  // ══════════════════════════════════════════

  window.showToast = function({ message, type = 'info', duration = 3500 }) {
    const icons = { success:'✅', warning:'⚠️', danger:'❌', info:'ℹ️' };

    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ══════════════════════════════════════════
  // FORMATTING HELPERS
  // ══════════════════════════════════════════

  window.formatCurrency = (amount) =>
    '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  window.formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' });
  };

  window.formatPercent = (value) => Number(value).toFixed(1) + '%';

  window.capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  // ══════════════════════════════════════════
  // BADGE / UI HELPERS
  // ══════════════════════════════════════════

  window.getStatusBadge = (status) => {
    const map = {
      'On-Track':  'badge--success',
      'At Risk':   'badge--warning',
      'Delayed':   'badge--danger',
      'Completed': 'badge--info',
    };
    return `<span class="badge ${map[status] || 'badge--neutral'}">${status}</span>`;
  };

  window.getSeverityBadge = (severity) => {
    const map = { 'Critical':'badge--danger', 'Warning':'badge--warning', 'Monitor':'badge--info', 'Resolved':'badge--success' };
    return `<span class="badge ${map[severity] || 'badge--neutral'}">${severity}</span>`;
  };

  window.makeProgressBar = (percent) => {
    const p = Math.min(Math.max(Number(percent), 0), 100);
    let cls = 'progress-bar__fill';
    if      (p >= 80) cls += ' progress-bar__fill--success';
    else if (p >= 20) cls += ' progress-bar__fill--warning';
    else              cls += ' progress-bar__fill--danger';
    return `
      <div class="flex items-center gap-2">
        <div class="progress-bar" style="min-width:80px;">
          <div class="${cls}" style="width:${p}%"></div>
        </div>
        <span class="text-sm font-medium" style="min-width:36px;">${p.toFixed(0)}%</span>
      </div>`;
  };

  window.getTypePill = (type) => {
    const map = {
      road:     { cls: 'type-pill--road',     label: 'Road'          },
      bridge:   { cls: 'type-pill--bridge',   label: 'Bridge'        },
      building: { cls: 'type-pill--building', label: 'Building'      },
      flood:    { cls: 'type-pill--flood',    label: 'Flood Control' },
      drainage: { cls: 'type-pill--drainage', label: 'Drainage'      },
      other:    { cls: 'type-pill--other',    label: 'Other'         },
    };
    const t = map[type] || map.other;
    return `<span class="type-pill ${t.cls}">${t.label}</span>`;
  };

  window.confirmAction = (message, onConfirm) => { if (window.confirm(message)) onConfirm(); };

  // ══════════════════════════════════════════
  // ROLE-BASED UI ENFORCEMENT
  // Runs after DOM is ready — disables/hides
  // any element the current role can't access
  // ══════════════════════════════════════════

  function enforceRoleUI() {
    if (!user) return;

    // Elements tagged role-hide-* get display:none for that role
    // Elements tagged role-only-* are hidden for everyone except that role
    // We handle these purely via CSS (data-role on body), but
    // also enforce disabled state on action buttons for safety

    if (isExecutive()) {
      // Disable all edit/delete/add action buttons
      document.querySelectorAll('.action-btn-edit, .action-btn-delete, #addProjectBtn').forEach(el => {
        el.setAttribute('disabled', 'disabled');
        el.setAttribute('title', 'Read-only access for executives');
        el.style.opacity = '0.4';
        el.style.cursor  = 'not-allowed';
        el.style.pointerEvents = 'none';
      });
    }

    if (!isAdmin()) {
      // Hide user management links for non-admins
      document.querySelectorAll('[data-page="user-management.html"]').forEach(el => {
        el.closest('li, a')?.remove?.() || el.remove?.();
      });
    }
  }

  // Small delay so page-specific JS can render buttons first
  setTimeout(enforceRoleUI, 50);

});