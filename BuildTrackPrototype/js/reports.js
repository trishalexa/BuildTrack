// Reports page behavior: populate project list, handle report selection, generate preview and charts
const reportTypesEl = document.getElementById('reportTypes');
const selectProjects = document.getElementById('selectProjects');
const allProjectsCheckbox = document.getElementById('allProjects');
const generateBtn = document.getElementById('generateReport');
const downloadPdfBtn = document.getElementById('downloadPdf');
const printBtn = document.getElementById('printReport');
const reportPreview = document.getElementById('reportPreview');
const reportTableHead = document.getElementById('reportTableHead');
const reportTableBody = document.getElementById('reportTableBody');
const selectedReportTitle = document.getElementById('selectedReportTitle');

let activeReportType = 'mar';

// Comprehensive sample project data with contractor information
const sampleProjects = [
  // JRC Builders - Mixed Performance
  { id:'BT-001', title:'Brgy. Dao Road Concreting Phase 2', type:'road', contractor:'JRC Builders', physical:62, financial:58, status:'At Risk', delay:12, budget:'₱8,500,000', target:'2026-08-15' },
  { id:'BT-006', title:'Bañadero Coastal Road Improvement', type:'road', contractor:'JRC Builders', physical:24, financial:20, status:'Delayed', delay:18, budget:'₱6,200,000', target:'2026-11-15' },
  { id:'BT-018', title:'Purok 1 Access Road', type:'road', contractor:'JRC Builders', physical:45, financial:42, status:'At Risk', delay:8, budget:'₱4,800,000', target:'2026-09-30' },

  // Metro Construction Corp - Problematic
  { id:'BT-002', title:'Tuburan Bridge Structural Repair', type:'bridge', contractor:'Metro Const. Corp', physical:38, financial:30, status:'Delayed', delay:22, budget:'₱12,000,000', target:'2026-09-30' },
  { id:'BT-019', title:'Crossing Bridge Reinforcement', type:'bridge', contractor:'Metro Const. Corp', physical:28, financial:22, status:'Delayed', delay:28, budget:'₱9,800,000', target:'2026-08-20' },

  // GreenBuild OPC - Strong Performance
  { id:'BT-003', title:'Sta. Maria Barangay Health Center', type:'building', contractor:'GreenBuild OPC', physical:81, financial:78, status:'On-Track', delay:0, budget:'₱7,200,000', target:'2026-07-20' },
  { id:'BT-005', title:'Dao Elementary School 2-Room Building', type:'building', contractor:'GreenBuild OPC', physical:90, financial:88, status:'On-Track', delay:0, budget:'₱5,800,000', target:'2026-06-30' },
  { id:'BT-008', title:'Brgy. Office Building Renovation', type:'building', contractor:'GreenBuild OPC', physical:85, financial:83, status:'On-Track', delay:0, budget:'₱3,400,000', target:'2026-07-10' },
  { id:'BT-020', title:'Purok 3 Multi-Purpose Hall', type:'building', contractor:'GreenBuild OPC', physical:72, financial:70, status:'On-Track', delay:2, budget:'₱4,500,000', target:'2026-08-25' },

  // Hydrex Infrastructure - Good Performance
  { id:'BT-004', title:'Crossing Tuburan Flood Control Structure', type:'flood', contractor:'Hydrex Infra', physical:55, financial:50, status:'At Risk', delay:8, budget:'₱8,000,000', target:'2026-10-10' },
  { id:'BT-021', title:'Dao Drainage Improvement Project', type:'drainage', contractor:'Hydrex Infra', physical:68, financial:65, status:'On-Track', delay:0, budget:'₱4,200,000', target:'2026-08-15' },
  { id:'BT-022', title:'Watershed Management Program', type:'flood', contractor:'Hydrex Infra', physical:52, financial:50, status:'At Risk', delay:5, budget:'₱6,500,000', target:'2026-09-20' },

  // Prime Engineers - Strong Performance
  { id:'BT-009', title:'Sta. Maria Irrigation System', type:'drainage', contractor:'Prime Engineers', physical:78, financial:76, status:'On-Track', delay:0, budget:'₱5,600,000', target:'2026-07-15' },
  { id:'BT-010', title:'Brgy. Water Supply Extension', type:'building', contractor:'Prime Engineers', physical:88, financial:85, status:'On-Track', delay:0, budget:'₱4,800,000', target:'2026-06-20' },
  { id:'BT-023', title:'Purok 2 Potable Water Project', type:'building', contractor:'Prime Engineers', physical:92, financial:90, status:'On-Track', delay:0, budget:'₱3,900,000', target:'2026-06-10' },

  // BuildRight Construction - Mixed
  { id:'BT-011', title:'Bañadero Fish Port Facility', type:'building', contractor:'BuildRight Construction', physical:35, financial:32, status:'Delayed', delay:15, budget:'₱9,200,000', target:'2026-10-05' },
  { id:'BT-024', title:'Community Market Building', type:'building', contractor:'BuildRight Construction', physical:48, financial:45, status:'At Risk', delay:10, budget:'₱6,800,000', target:'2026-09-15' },

  // Summit Infrastructure - Strong
  { id:'BT-012', title:'Dao Port Road Extension', type:'road', contractor:'Summit Infrastructure', physical:75, financial:72, status:'On-Track', delay:0, budget:'₱7,500,000', target:'2026-07-30' },
  { id:'BT-013', title:'Brgy. Tuburan Road Widening', type:'road', contractor:'Summit Infrastructure', physical:82, financial:80, status:'On-Track', delay:0, budget:'₱6,200,000', target:'2026-07-05' },

  // Pinnacle Builders - Problematic
  { id:'BT-014', title:'Bañadero Sports Complex', type:'building', contractor:'Pinnacle Builders', physical:22, financial:18, status:'Delayed', delay:25, budget:'₱11,500,000', target:'2026-09-10' },

  // Coastal Construction - Mixed
  { id:'BT-015', title:'Coastline Protection Project Phase 1', type:'flood', contractor:'Coastal Construction', physical:58, financial:55, status:'At Risk', delay:6, budget:'₱10,200,000', target:'2026-10-20' },

  // Excellence Contractors - Strong
  { id:'BT-016', title:'Recycling Center Construction', type:'building', contractor:'Excellence Contractors', physical:86, financial:84, status:'On-Track', delay:0, budget:'₱5,100,000', target:'2026-07-25' },

  // General Infrastructure - Mixed
  { id:'BT-017', title:'Downtown Area Road Rehabilitation', type:'road', contractor:'General Infrastructure', physical:42, financial:40, status:'At Risk', delay:12, budget:'₱9,500,000', target:'2026-09-05' },
];

// Populate project selector from `projectData` (loaded from project-list.js)
function populateProjects(){
  if(!window.projectData) return;
  selectProjects.innerHTML = '';
  window.projectData.forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = `${p.id} — ${p.title}`;
    selectProjects.appendChild(opt);
  });
}

// Render summary statistics at the top
function renderSummaryCards() {
  const projects = window.projectData || sampleProjects;

  // Calculate statistics
  const totalProjects = projects.length;
  const onTrackProjects = projects.filter(p => p.status === 'On-Track').length;
  const atRiskProjects = projects.filter(p => p.status === 'At Risk').length;
  const delayedProjects = projects.filter(p => p.status === 'Delayed').length;

  // Portfolio health: weighted calculation (on-track full points, at-risk half, delayed zero)
  const portfolioHealth = Math.round(((onTrackProjects * 100) + (atRiskProjects * 50)) / totalProjects);

  // Update cards
  const totalCard = document.getElementById('totalProjectsCard');
  if (totalCard) totalCard.textContent = totalProjects;

  const onTrackCard = document.getElementById('onTrackCard');
  if (onTrackCard) onTrackCard.textContent = onTrackProjects;

  const healthCard = document.getElementById('portfolioHealthCard');
  if (healthCard) {
    healthCard.textContent = portfolioHealth + '%';
    const healthColor = portfolioHealth >= 75 ? 'var(--color-success)' : portfolioHealth >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    healthCard.style.color = healthColor;
  }
}

// Render contractor rankings on page load
function renderContractorRankings() {
  const projects = window.projectData || sampleProjects;

  // Aggregate contractor performance
  const contractorStats = {};
  projects.forEach(p => {
    if (!contractorStats[p.contractor]) {
      contractorStats[p.contractor] = {
        projects: [],
        onTrack: 0,
        atRisk: 0,
        delayed: 0,
        avgPhysical: 0,
        totalPhysical: 0
      };
    }
    contractorStats[p.contractor].projects.push(p);
    contractorStats[p.contractor].totalPhysical += p.physical;

    if (p.status === 'On-Track') contractorStats[p.contractor].onTrack++;
    else if (p.status === 'At Risk') contractorStats[p.contractor].atRisk++;
    else if (p.status === 'Delayed') contractorStats[p.contractor].delayed++;
  });

  // Calculate averages and classify
  Object.keys(contractorStats).forEach(contractor => {
    const stats = contractorStats[contractor];
    stats.avgPhysical = Math.round(stats.totalPhysical / stats.projects.length);
    stats.isProblematic = stats.delayed > 0 || stats.atRisk > stats.onTrack;
  });

  // Sort by average physical progress
  const sorted = Object.entries(contractorStats).sort((a, b) => b[1].avgPhysical - a[1].avgPhysical);

  // Separate on-track and problematic
  const onTrack = sorted.filter(([_, stats]) => !stats.isProblematic);
  const problematic = sorted.filter(([_, stats]) => stats.isProblematic);

  // Render on-track contractors
  const onTrackEl = document.getElementById('onTrackContractors');
  if (onTrackEl) {
    if (onTrack.length === 0) {
      onTrackEl.innerHTML = '<div class="text-muted">No contractors</div>';
    } else {
      onTrackEl.innerHTML = onTrack.map(([name, stats]) => `
        <div class="contractor-item">
          <div>
            <div class="contractor-item__name">${name}</div>
            <div class="contractor-item__meta">${stats.projects.length} project${stats.projects.length !== 1 ? 's' : ''} • ${stats.onTrack} on-track</div>
          </div>
          <div class="contractor-item__score">
            <div class="contractor-item__score-value" style="color:var(--color-success)">${stats.avgPhysical}%</div>
            <div class="contractor-item__score-label">Avg Progress</div>
          </div>
        </div>
      `).join('');
    }
  }

  // Render problematic contractors
  const problematicEl = document.getElementById('problematicContractors');
  if (problematicEl) {
    if (problematic.length === 0) {
      problematicEl.innerHTML = '<div class="text-muted">No contractors</div>';
    } else {
      problematicEl.innerHTML = problematic.map(([name, stats]) => `
        <div class="contractor-item">
          <div>
            <div class="contractor-item__name">${name}</div>
            <div class="contractor-item__meta">${stats.projects.length} project${stats.projects.length !== 1 ? 's' : ''} • ${stats.delayed} delayed</div>
          </div>
          <div class="contractor-item__score">
            <div class="contractor-item__score-value" style="color:var(--color-warning)">${stats.avgPhysical}%</div>
            <div class="contractor-item__score-label">Avg Progress</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// Store chart instances to prevent re-initialization
let chartsInitialized = false;
const chartInstances = {
  scurve: null,
  status: null,
  budget: null
};

// Render analytics charts on page load
function renderAnalyticsCharts() {
  // Prevent re-initialization
  if (chartsInitialized) return;
  chartsInitialized = true;

  const projects = window.projectData || sampleProjects;
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Calculate project status counts
  const onTrackCount = projects.filter(p => p.status === 'On-Track').length;
  const atRiskCount = projects.filter(p => p.status === 'At Risk').length;
  const delayedCount = projects.filter(p => p.status === 'Delayed').length;

  // Calculate budget by type
  const budgetByType = {
    'Road': { allocated: 18.5, utilized: 13.2 },
    'Bridge': { allocated: 12.0, utilized: 7.5 },
    'Building': { allocated: 14.2, utilized: 11.8 },
    'Flood Control': { allocated: 8.0, utilized: 5.2 },
    'Drainage': { allocated: 4.5, utilized: 2.9 },
    'Other': { allocated: 3.25, utilized: 1.7 }
  };

  // ── S-CURVE CHART ──
  const scurveCtx = document.getElementById('analyticsSCurveChart');
  if (scurveCtx && scurveCtx.getContext && !chartInstances.scurve) {
    try {
      chartInstances.scurve = new Chart(scurveCtx.getContext('2d'), {
        type: 'line',
        data: {
          labels: MONTHS,
          datasets: [
            {
              label: 'Physical Accomplishment (%)',
              data: [8,15,25,38,48,58,68,75,82,88,93,97],
              borderColor: '#2a5298', backgroundColor: 'rgba(42,82,152,0.08)',
              tension: 0.4, fill: true, pointBackgroundColor: '#2a5298',
              pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5,
            },
            {
              label: 'Financial Accomplishment (%)',
              data: [6,12,22,35,45,55,65,72,79,85,90,96],
              borderColor: '#f0a500', backgroundColor: 'rgba(240,165,0,0.06)',
              tension: 0.4, fill: true, pointBackgroundColor: '#f0a500',
              pointRadius: 4, pointHoverRadius: 6, borderWidth: 2.5,
            },
            {
              label: 'Planned Target (%)',
              data: [10,20,30,42,55,65,75,82,88,93,97,100],
              borderColor: '#94a3b8', backgroundColor: 'transparent',
              tension: 0.4, fill: false, pointRadius: 0,
              borderWidth: 2, borderDash: [5,5],
            }
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          animation: { duration: 0 },
          plugins: {
            legend: { position: 'bottom', labels: { font: { family:'Inter', size:11 }, padding:12, usePointStyle:true } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
          },
          scales: {
            x: { grid: { color:'rgba(0,0,0,0.04)' }, ticks: { font:{family:'Inter',size:10}, color:'#64748b' } },
            y: { min:0, max:100, grid:{color:'rgba(0,0,0,0.04)'}, ticks: { font:{family:'Inter',size:10}, color:'#64748b', callback: v => v+'%' } }
          }
        }
      });
    } catch(e) { console.error('S-Curve chart error:', e); }
  }

  // ── STATUS DONUT CHART ──
  const statusCtx = document.getElementById('analyticsStatusChart');
  if (statusCtx && statusCtx.getContext && !chartInstances.status) {
    try {
      const d = {
        labels:['On-Track','At Risk','Delayed'],
        values: [onTrackCount, atRiskCount, delayedCount],
        colors:['#16a34a','#d97706','#dc2626']
      };
      chartInstances.status = new Chart(statusCtx.getContext('2d'), {
        type: 'doughnut',
        data: { labels: d.labels, datasets: [{ data:d.values, backgroundColor:d.colors, borderWidth:3, borderColor:'#fff', hoverOffset:6 }] },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          cutout: '68%',
          animation: { duration: 0 },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} projects` } }
          }
        }
      });
      const legend = document.getElementById('analyticsDonutLegend');
      if (legend) {
        legend.innerHTML = d.labels.map((l,i) => `
          <div class="donut-legend-item">
            <span class="donut-legend-dot" style="background:${d.colors[i]}"></span>
            ${l} (${d.values[i]})
          </div>`).join('');
      }
    } catch(e) { console.error('Status chart error:', e); }
  }

  // ── BUDGET CHART ──
  const budgetCtx = document.getElementById('analyticsBudgetChart');
  if (budgetCtx && budgetCtx.getContext && !chartInstances.budget) {
    try {
      const typeLabels = Object.keys(budgetByType);
      const allocatedData = typeLabels.map(t => budgetByType[t].allocated);
      const utilizedData = typeLabels.map(t => budgetByType[t].utilized);

      chartInstances.budget = new Chart(budgetCtx.getContext('2d'), {
        type: 'bar',
        data: {
          labels: typeLabels,
          datasets: [
            { label:'Allocated (₱M)', data:allocatedData, backgroundColor:'rgba(42,82,152,0.2)', borderColor:'#2a5298', borderWidth:1.5, borderRadius:4 },
            { label:'Utilized (₱M)',  data:utilizedData,   backgroundColor:'rgba(240,165,0,0.85)', borderColor:'#d97706', borderWidth:1.5, borderRadius:4 },
          ]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          interaction: { mode:'index', intersect:false },
          animation: { duration: 0 },
          plugins: {
            legend: { position:'bottom', labels:{ font:{family:'Inter',size:11}, padding:12, usePointStyle:true } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ₱${ctx.parsed.y}M` } }
          },
          scales: {
            x: { grid:{display:false}, ticks:{ font:{family:'Inter',size:10}, color:'#64748b' } },
            y: { grid:{color:'rgba(0,0,0,0.04)'}, ticks:{ font:{family:'Inter',size:10}, color:'#64748b', callback: v => '₱'+v+'M' } }
          }
        }
      });
    } catch(e) { console.error('Budget chart error:', e); }
  }
}

// handle report type click
reportTypesEl.addEventListener('click', e=>{
  const li = e.target.closest('li[data-type]');
  if(!li) return;
  [...reportTypesEl.querySelectorAll('li')].forEach(i=>i.classList.remove('is-active'));
  li.classList.add('is-active');
  activeReportType = li.dataset.type;
  selectedReportTitle.textContent = li.textContent;
});

allProjectsCheckbox.addEventListener('change', ()=>{
  selectProjects.disabled = allProjectsCheckbox.checked;
});

function generatePreview(){
  // simple preview: show a table of selected projects and basic columns depending on report
  const projectsData = window.projectData || sampleProjects;
  const selectedIds = allProjectsCheckbox.checked ? projectsData.map(p=>p.id) : Array.from(selectProjects.selectedOptions).map(o=>o.value);
  const rows = projectsData.filter(p=> selectedIds.includes(p.id));

  reportTableHead.innerHTML = '';
  reportTableBody.innerHTML = '';
  // define columns per report type
  let cols = [];
  if(activeReportType === 'mar' || activeReportType === 'swa'){
    cols = ['ID','Project Title','Contractor','Type','Physical %','Financial %','Target Date','Status'];
  } else if(activeReportType === 'pds'){
    cols = ['ID','Project Title','Delay Reason','Predicted Days','Status'];
  } else if(activeReportType === 'cpr'){
    cols = ['Contractor','Avg Performance %','# Projects'];
  } else if(activeReportType === 'bur'){
    cols = ['ID','Project','Budget','Spend','% Utilized'];
  }

  reportTableHead.innerHTML = '<tr>' + cols.map(c=>`<th>${c}</th>`).join('') + '</tr>';

  if(activeReportType === 'cpr'){
    // aggregate by contractor
    const byContractor = {};
    rows.forEach(r=>{
      const perf = r.physical; if(!byContractor[r.contractor]) byContractor[r.contractor] = {sum:0,count:0};
      byContractor[r.contractor].sum += perf; byContractor[r.contractor].count +=1;
    });
    Object.keys(byContractor).forEach(c=>{
      const avg = Math.round(byContractor[c].sum / byContractor[c].count);
      const tr = `<tr><td>${c}</td><td>${avg}%</td><td>${byContractor[c].count}</td></tr>`;
      reportTableBody.innerHTML += tr;
    });
  } else {
    rows.forEach(r=>{
      if(activeReportType === 'pds'){
        const tr = `<tr><td>${r.id}</td><td>${r.title}</td><td>Schedule slippage</td><td>12</td><td>${r.status}</td></tr>`;
        reportTableBody.innerHTML += tr;
      } else if(activeReportType === 'bur'){
        const spend = Math.round((r.physical/100) * Number(r.budget.toString().replace(/[^0-9]/g,'')) / 1000);
        const util = Math.round((r.physical));
        const tr = `<tr><td>${r.id}</td><td>${r.title}</td><td>${r.budget}</td><td>₱${spend.toLocaleString()}k</td><td>${util}%</td></tr>`;
        reportTableBody.innerHTML += tr;
      } else {
        const tr = `<tr><td>${r.id}</td><td>${r.title}</td><td>${r.contractor}</td><td>${r.type}</td><td>${r.physical}%</td><td>${r.financial}%</td><td>${r.target}</td><td>${r.status}</td></tr>`;
        reportTableBody.innerHTML += tr;
      }
    });
  }

  reportPreview.classList.remove('hidden');
  renderCharts(rows);
}

function renderCharts(rows){
  // Trend: simulate delays over last 6 months based on status counts
  const months = [];
  const now = new Date();
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i,1);
    months.push(d.toLocaleString('default',{month:'short',year:'numeric'}));
  }
  const trendCounts = months.map((m,i)=> Math.max(0, rows.filter(r=> r.status === 'Delayed' || r.status === 'At Risk').length - i));

  // top delayed projects (pick those with lowest physical)
  const sortedDelayed = rows.slice().sort((a,b)=> a.physical - b.physical).slice(0,5);

  // contractor performance (avg physical per contractor)
  const contractorMap = {};
  rows.forEach(r=>{ if(!contractorMap[r.contractor]) contractorMap[r.contractor] = {sum:0,count:0}; contractorMap[r.contractor].sum += r.physical; contractorMap[r.contractor].count++; });
  const contractorLabels = Object.keys(contractorMap);
  const contractorValues = contractorLabels.map(c=> Math.round(contractorMap[c].sum/contractorMap[c].count));

  // create or update charts
  if(window.trendChart) { window.trendChart.data.labels = months; window.trendChart.data.datasets[0].data = trendCounts; window.trendChart.update(); }
  else {
    const ctx = document.getElementById('trendChart').getContext('2d');
    window.trendChart = new Chart(ctx, { type:'line', data:{ labels: months, datasets:[{ label:'Delays', data:trendCounts, borderColor:'#dc2626', backgroundColor:'rgba(220,38,38,0.08)', fill:true }] }, options:{} });
  }

  const topLabels = sortedDelayed.map(s=> s.title);
  const topValues = sortedDelayed.map(s=> 100 - s.physical);
  if(window.topDelayedChart){ window.topDelayedChart.data.labels = topLabels; window.topDelayedChart.data.datasets[0].data = topValues; window.topDelayedChart.update(); }
  else { const ctx2 = document.getElementById('topDelayedChart').getContext('2d'); window.topDelayedChart = new Chart(ctx2,{ type:'bar', data:{ labels:topLabels, datasets:[{ label:'Delay Score', data:topValues, backgroundColor:'#f59e0b' }] }, options:{ indexAxis:'y' } }); }

  if(window.contractorChart){ window.contractorChart.data.labels = contractorLabels; window.contractorChart.data.datasets[0].data = contractorValues; window.contractorChart.update(); }
  else { const ctx3 = document.getElementById('contractorChart').getContext('2d'); window.contractorChart = new Chart(ctx3,{ type:'bar', data:{ labels:contractorLabels, datasets:[{ label:'Performance %', data: contractorValues, backgroundColor:'#10b981' }] }, options:{} }); }
}

generateBtn.addEventListener('click', generatePreview);
printBtn.addEventListener('click', ()=>{ window.print(); });
downloadPdfBtn.addEventListener('click', ()=>{ window.print(); });

window.addEventListener('DOMContentLoaded', ()=>{
  populateProjects();
  renderSummaryCards();
  renderContractorRankings();
  // Add small delay to ensure DOM is fully rendered before chart initialization
  setTimeout(renderAnalyticsCharts, 100);
});
