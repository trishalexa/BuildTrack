/* ============================================================
   BUILDTRACK — dashboard.js
   Role-aware dashboard: charts, KPIs, alerts, project tables
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const user = getCurrentUser();
  const role = user?.role || 'engineer';

  // ── Date in topnav ────────────────────────────────────────
  const dateEl = document.getElementById('topnavDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-PH', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  // ── Role badge in topnav ──────────────────────────────────
  const roleBadgeMap = {
    engineer:  { cls: 'role-badge--engineer',  label: '👷 Engineer'   },
    executive: { cls: 'role-badge--executive', label: '👔 Executive'  },
    planning:  { cls: 'role-badge--planning',  label: '📐 Planning'   },
    admin:     { cls: 'role-badge--admin',     label: '⚙️ Admin'      },
  };
  const rb = document.getElementById('topnavRoleBadge');
  if (rb && roleBadgeMap[role]) {
    rb.className = `role-badge ${roleBadgeMap[role].cls}`;
    rb.textContent = roleBadgeMap[role].label;
  }

  // ── Personalise page title for executive ─────────────────
  if (isExecutive()) {
    const t = document.getElementById('dashPageTitle');
    const s = document.getElementById('dashPageSub');
    if (t) t.textContent = 'Executive Dashboard';
    if (s) s.textContent = 'High-level summary — Pagadian City Infrastructure Portfolio';
  }

  // ── Refresh button ────────────────────────────────────────
  document.getElementById('refreshBtn')?.addEventListener('click', () => {
    showToast({ message: 'Dashboard data refreshed.', type: 'success' });
  });

  document.getElementById('notifBell')?.addEventListener('click', () => {
    window.location.href = '../pages/early-warning.html';
  });

  // ══════════════════════════════════════════
  // MOCK DATA
  // ══════════════════════════════════════════

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const allAlerts = [
    { title:'Brgy. Dao Road Concreting',   sub:'Material delivery delayed 8 days',   severity:'critical', time:'2h ago'  },
    { title:'Tuburan Bridge Repair',        sub:'Contractor performance score: 58%',  severity:'critical', time:'5h ago'  },
    { title:'Sta. Maria Health Center',     sub:'Budget overrun risk: +12%',           severity:'warning',  time:'1d ago'  },
    { title:'Crossing Tuburan Flood Ctrl',  sub:'Weather delay: 4 days projected',    severity:'warning',  time:'1d ago'  },
    { title:'Purok 5 Drainage Canal',       sub:'Schedule deviation: 6%',             severity:'monitor',  time:'2d ago'  },
    { title:'Dao Elementary School Bldg',   sub:'Procurement delay flagged',          severity:'warning',  time:'3d ago'  },
    { title:'Bañadero Coastal Road',        sub:'Site access issue reported',         severity:'monitor',  time:'3d ago'  },
  ];

  const recentProjects = [
    { id:'BT-001', title:'Brgy. Dao Road Concreting Phase 2',       type:'road',     contractor:'JRC Builders',      physical:62, financial:58, location:'Brgy. Dao',      target:'2026-08-15', delay:12, status:'At Risk'  },
    { id:'BT-002', title:'Tuburan Bridge Structural Repair',         type:'bridge',   contractor:'Metro Const. Corp', physical:38, financial:30, location:'Brgy. Tuburan',  target:'2026-09-30', delay:22, status:'Delayed'  },
    { id:'BT-003', title:'Sta. Maria Barangay Health Center',        type:'building', contractor:'GreenBuild OPC',    physical:81, financial:78, location:'Brgy. Sta. Maria',target:'2026-07-20', delay:0,  status:'On-Track' },
    { id:'BT-004', title:'Crossing Tuburan Flood Control Structure', type:'flood',    contractor:'Hydrex Infra',      physical:55, financial:50, location:'Crossing Tuburan',target:'2026-10-10', delay:8,  status:'At Risk'  },
    { id:'BT-005', title:'Dao Elementary School 2-Room Building',    type:'building', contractor:'GreenBuild OPC',    physical:90, financial:88, location:'Brgy. Dao',      target:'2026-06-30', delay:0,  status:'On-Track' },
    { id:'BT-006', title:'Bañadero Coastal Road Improvement',        type:'road',     contractor:'JRC Builders',      physical:24, financial:20, location:'Bañadero',       target:'2026-11-15', delay:18, status:'Delayed'  },
  ];

  // Engineer's assigned projects (subset)
  const myProjects = recentProjects.filter((_, i) => [0, 2, 4].includes(i));

  // At-risk / delayed for executive view
  const atRiskProjects = recentProjects.filter(p => p.status !== 'On-Track');

  // ══════════════════════════════════════════
  // EXEC BANNER STATS
  // ══════════════════════════════════════════
  const execStats = document.getElementById('execBannerStats');
  if (execStats) {
    execStats.innerHTML = `
      <div class="exec-banner__stat">
        <span class="exec-banner__stat-val"></span>
        <span class="exec-banner__stat-label"></span>
      </div>
      <div class="exec-banner__stat">
        <span class="exec-banner__stat-val" style="color:var(--color-danger)"></span>
        <span class="exec-banner__stat-label"></span>
      </div>
      <div class="exec-banner__stat">
        <span class="exec-banner__stat-val" style="color:var(--color-success)"></span>
        <span class="exec-banner__stat-label"></span>
      </div>
    `;
  }

  // ══════════════════════════════════════════
  // ALERTS FEED
  // Executive sees only critical alerts
  // ══════════════════════════════════════════
  const alertsList = document.getElementById('alertsList');
  if (alertsList) {
    const visibleAlerts = isExecutive()
      ? allAlerts.filter(a => a.severity === 'critical')
      : allAlerts;

    if (visibleAlerts.length === 0) {
      alertsList.innerHTML = `<div class="alerts-empty">✅ No active alerts</div>`;
    } else {
      alertsList.innerHTML = visibleAlerts.map(a => `
        <div class="alert-item" onclick="window.location.href='../pages/early-warning.html'">
          <span class="alert-item__dot alert-item__dot--${a.severity}"></span>
          <div class="alert-item__body">
            <div class="alert-item__title">${a.title}</div>
            <div class="alert-item__sub">${a.sub}</div>
          </div>
          <span class="alert-item__time">${a.time}</span>
        </div>
      `).join('');
    }
  }

  // ══════════════════════════════════════════
  // RECENT PROJECTS TABLE (engineer/planning/admin)
  // ══════════════════════════════════════════
  const tbody = document.getElementById('recentProjectsBody');
  if (tbody) {
    tbody.innerHTML = recentProjects.map(p => `
      <tr>
        <td>
          <div class="project-name-cell">
            <span class="project-name-cell__title">${p.title}</span>
            <span class="project-name-cell__id">${p.id}</span>
          </div>
        </td>
        <td>${getTypePill(p.type)}</td>
        <td><span class="text-sm">${p.contractor}</span></td>
        <td>${makeProgressBar(p.physical)}</td>
        <td><span class="text-sm">${formatDate(p.target)}</span></td>
        <td>${getStatusBadge(p.status)}</td>
        <td>
          <a href="project-detail.html?id=${p.id}" class="btn btn--ghost btn--sm">View</a>
        </td>
      </tr>
    `).join('');
  }

  // ══════════════════════════════════════════
  // EXECUTIVE: AT-RISK PROJECTS TABLE
  // ══════════════════════════════════════════
  const execBody = document.getElementById('execAtRiskBody');
  if (execBody) {
    execBody.innerHTML = atRiskProjects.map(p => `
      <tr>
        <td>
          <div class="project-name-cell">
            <span class="project-name-cell__title">${p.title}</span>
            <span class="project-name-cell__id">${p.id}</span>
          </div>
        </td>
        <td><span class="text-sm text-muted">${p.location}</span></td>
        <td>${makeProgressBar(p.physical)}</td>
        <td>
          <span class="text-sm font-semibold" style="color:${p.delay > 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
            ${p.delay > 0 ? `+${p.delay} days` : 'On schedule'}
          </span>
        </td>
        <td>${getStatusBadge(p.status)}</td>
      </tr>
    `).join('');
  }

  // ══════════════════════════════════════════
  // ENGINEER: MY PROJECTS TABLE
  // ══════════════════════════════════════════
  const engBody = document.getElementById('engineerProjectsBody');
  if (engBody) {
    engBody.innerHTML = myProjects.map(p => `
      <tr>
        <td>
          <div class="project-name-cell">
            <span class="project-name-cell__title">${p.title}</span>
            <span class="project-name-cell__id">${p.id}</span>
          </div>
        </td>
        <td>${makeProgressBar(p.physical)}</td>
        <td>${makeProgressBar(p.financial)}</td>
        <td><span class="text-sm">${formatDate(p.target)}</span></td>
        <td>${getStatusBadge(p.status)}</td>
        <td>
          <a href="project-detail.html?id=${p.id}" class="btn btn--primary btn--sm action-btn-edit">Update</a>
        </td>
      </tr>
    `).join('');
  }

  // ══════════════════════════════════════════
  // CHART: S-CURVE
  // ══════════════════════════════════════════
  const scurveCtx = document.getElementById('scurveChart');
  if (scurveCtx) {
    new Chart(scurveCtx, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: 'Physical Accomplishment (%)',
            data: [5,12,22,33,47,58,67,74,80,86,91,95],
            borderColor: '#2a5298', backgroundColor: 'rgba(42,82,152,0.08)',
            tension: 0.4, fill: true, pointBackgroundColor: '#2a5298',
            pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5,
          },
          {
            label: 'Financial Accomplishment (%)',
            data: [4,10,18,28,41,52,61,69,76,82,88,93],
            borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,0.06)',
            tension: 0.4, fill: true, pointBackgroundColor: '#f0a500',
            pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5,
          },
          {
            label: 'Planned Target (%)',
            data: [8,17,25,38,50,62,72,80,87,92,96,100],
            borderColor: '#94a3b8', backgroundColor: 'transparent',
            tension: 0.4, fill: false, pointRadius: 0,
            borderWidth: 1.5, borderDash: [4,4],
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { font: { family:'Inter', size:11 }, padding:16, usePointStyle:true } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
        },
        scales: {
          x: { grid: { color:'rgba(0,0,0,0.04)' }, ticks: { font:{family:'Inter',size:11}, color:'#64748b' } },
          y: { min:0, max:100, grid:{color:'rgba(0,0,0,0.04)'}, ticks: { font:{family:'Inter',size:11}, color:'#64748b', callback: v => v+'%' } }
        }
      }
    });
  }

  // ══════════════════════════════════════════
  // CHART: STATUS DONUT
  // ══════════════════════════════════════════
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    const d = { labels:['On-Track','At Risk','Delayed'], values:[14,6,4], colors:['#16a34a','#d97706','#dc2626'] };
    new Chart(statusCtx, {
      type: 'doughnut',
      data: { labels: d.labels, datasets: [{ data:d.values, backgroundColor:d.colors, borderWidth:3, borderColor:'#fff', hoverOffset:6 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} projects` } }
        }
      }
    });
    const legend = document.getElementById('donutLegend');
    if (legend) {
      legend.innerHTML = d.labels.map((l,i) => `
        <div class="donut-legend-item">
          <span class="donut-legend-dot" style="background:${d.colors[i]}"></span>
          ${l} (${d.values[i]})
        </div>`).join('');
    }
  }

  // ══════════════════════════════════════════
  // CHART: BUDGET BAR
  // ══════════════════════════════════════════
  const budgetCtx = document.getElementById('budgetChart');
  if (budgetCtx) {
    new Chart(budgetCtx, {
      type: 'bar',
      data: {
        labels: ['Road','Bridge','Building','Flood Control','Drainage','Other'],
        datasets: [
          { label:'Allocated (₱M)', data:[18.5,12.0,14.2,8.0,4.5,3.25], backgroundColor:'rgba(42,82,152,0.2)', borderColor:'#2a5298', borderWidth:1.5, borderRadius:4 },
          { label:'Utilized (₱M)',  data:[13.2,7.5,11.8,5.2,2.9,1.7],   backgroundColor:'rgba(240,165,0,0.85)', borderColor:'#d97706', borderWidth:1.5, borderRadius:4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode:'index', intersect:false },
        plugins: {
          legend: { position:'bottom', labels:{ font:{family:'Inter',size:11}, padding:14, usePointStyle:true } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ₱${ctx.parsed.y}M` } }
        },
        scales: {
          x: { grid:{display:false}, ticks:{ font:{family:'Inter',size:11}, color:'#64748b' } },
          y: { grid:{color:'rgba(0,0,0,0.04)'}, ticks:{ font:{family:'Inter',size:11}, color:'#64748b', callback: v => '₱'+v+'M' } }
        }
      }
    });
  }

});