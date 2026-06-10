const viewTableBtn = document.getElementById('viewTable');
const viewCardsBtn = document.getElementById('viewCards');
const tableView = document.getElementById('tableView');
const cardView = document.getElementById('cardView');
const projectsTableBody = document.getElementById('projectsTableBody');
const projectCardsGrid = document.getElementById('projectCardsGrid');
const resultsCount = document.getElementById('resultsCount');
const projectSearch = document.getElementById('projectSearch');
const filterStatus = document.getElementById('filterStatus');
const filterType = document.getElementById('filterType');
const filterSort = document.getElementById('filterSort');
const clearFiltersBtn = document.getElementById('clearFilters');

const projectData = [
  {
    id: '001',
    title: 'East Bridge Overhaul Project',
    type: 'Bridge',
    contractor: 'BuildCorp Solutions',
    budget: '₱2,500,000',
    lat: 7.8250,
    lng: 123.4370,
    physical: 65,
    financial: 58,
    target: 'Dec 31, 2024',
    status: 'On-Track',
    badge: 'badge--success',
    description: 'Major bridge rehabilitation located in Downtown District with targeted year-end completion.'
  },
  {
    id: '002',
    title: 'South Drainage Upgrade',
    type: 'Drainage',
    contractor: 'RiverFlow Contractors',
    budget: '₱1,250,000',
    lat: 7.8180,
    lng: 123.4320,
    physical: 48,
    financial: 42,
    target: 'Jan 15, 2025',
    status: 'At Risk',
    badge: 'badge--warning',
    description: 'Improving drainage capacity to reduce flooding and improve neighborhood resiliency.'
  },
  {
    id: '003',
    title: 'City Road Resurfacing',
    type: 'Road',
    contractor: 'Civic Paving Ltd.',
    budget: '₱980,000',
    lat: 7.8300,
    lng: 123.4400,
    physical: 72,
    financial: 70,
    target: 'Nov 20, 2024',
    status: 'On-Track',
    badge: 'badge--success',
    description: 'Resurfacing and safety upgrades across main city corridors.'
  },
  {
    id: '004',
    title: 'Health Center Expansion',
    type: 'Building',
    contractor: 'Sunrise Builders',
    budget: '₱3,300,000',
    lat: 7.8280,
    lng: 123.4450,
    physical: 55,
    financial: 50,
    target: 'Feb 10, 2025',
    status: 'At Risk',
    badge: 'badge--warning',
    description: 'Expanding community health center capacity with a modern facility upgrade.'
  },
  {
    id: '005',
    title: 'Flood Control Retaining Wall',
    type: 'Flood Control',
    contractor: 'SafeGuard Infrastructure',
    budget: '₱1,800,000',
    lat: 7.8150,
    lng: 123.4250,
    physical: 38,
    financial: 30,
    target: 'Mar 05, 2025',
    status: 'Delayed',
    badge: 'badge--danger',
    description: 'Structural wall upgrade to protect barangay communities from river overflow.'
  },
  {
    id: '006',
    title: 'Community Center Renovation',
    type: 'Building',
    contractor: 'UrbanWorks',
    budget: '₱1,100,000',
    lat: 7.8320,
    lng: 123.4380,
    physical: 88,
    financial: 90,
    target: 'Oct 05, 2024',
    status: 'On-Track',
    badge: 'badge--success',
    description: 'Renovating the community center for public events and health programs.'
  },
  {
    id: '007',
    title: 'North Floodway Repair',
    type: 'Flood Control',
    contractor: 'EcoRail Solutions',
    budget: '₱2,050,000',
    lat: 7.8270,
    lng: 123.4200,
    physical: 40,
    financial: 35,
    target: 'Dec 12, 2024',
    status: 'At Risk',
    badge: 'badge--warning',
    description: 'Repairing and reinforcing the northern floodway to protect public infrastructure.'
  },
  {
    id: '008',
    title: 'Barangay Road Lighting',
    type: 'Road',
    contractor: 'BrightLine Electrical',
    budget: '₱620,000',
    lat: 7.8200,
    lng: 123.4350,
    physical: 100,
    financial: 100,
    target: 'Aug 30, 2024',
    status: 'Completed',
    badge: 'badge--info',
    description: 'Public lighting installation for barangay pathways and intersections.'
  }
];

function renderTable(items) {
  projectsTableBody.innerHTML = items.map(project => `
    <tr>
      <td>${project.id}</td>
      <td>${project.title}</td>
      <td>${project.type}</td>
      <td>${project.contractor}</td>
      <td>${project.budget}</td>
      <td>${project.physical}%</td>
      <td>${project.financial}%</td>
      <td>${project.target}</td>
      <td><span class="badge ${project.badge}">${project.status}</span></td>
      <td><button class="btn btn--ghost btn--sm view-project-btn" data-project-id="${project.id}">View</button></td>
    </tr>
  `).join('');
  
  attachViewButtonHandlers();
}

function renderCards(items) {
  projectCardsGrid.innerHTML = items.map(project => `
    <article class="project-card">
      <div class="project-card__header">
        <div>
          <h3>${project.title}</h3>
          <p class="project-card__meta">${project.type} • ${project.contractor}</p>
        </div>
        <span class="badge ${project.badge}">${project.status}</span>
      </div>
      <p class="project-card__description">${project.description}</p>
      <div class="project-card__stats">
        <span>Physical ${project.physical}%</span>
        <span>Financial ${project.financial}%</span>
      </div>
      <div class="project-card__footer">
        <span>Target: ${project.target}</span>
        <span>${project.budget}</span>
      </div>
      <button class="btn btn--primary view-project-btn" data-project-id="${project.id}" style="width: 100%; margin-top: var(--space-4);">View Details</button>
    </article>
  `).join('');
  
  attachViewButtonHandlers();
}

function compareItems(a, b, sortKey) {
  if (sortKey === 'budget' || sortKey === 'physical' || sortKey === 'financial') {
    const aValue = typeof a[sortKey] === 'number' ? a[sortKey] : Number(a[sortKey].toString().replace(/[^0-9]/g, ''));
    const bValue = typeof b[sortKey] === 'number' ? b[sortKey] : Number(b[sortKey].toString().replace(/[^0-9]/g, ''));
    return aValue - bValue;
  }

  if (sortKey === 'target') {
    return new Date(a.target) - new Date(b.target);
  }

  return a[sortKey].localeCompare(b[sortKey]);
}

function applySort(items) {
  const value = filterSort.value;
  const [key, direction] = value.split('-');
  const sorted = [...items].sort((a, b) => compareItems(a, b, key));
  return direction === 'desc' ? sorted.reverse() : sorted;
}

function applyFilters() {
  const search = projectSearch.value.trim().toLowerCase();
  const status = filterStatus.value;
  const type = filterType.value;

  let filtered = projectData.filter(project => {
    const matchesSearch = [project.title, project.contractor, project.type].some(field => field.toLowerCase().includes(search));
    const matchesStatus = !status || project.status === status;
    const matchesType = !type || project.type.toLowerCase() === type.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  filtered = applySort(filtered);
  renderTable(filtered);
  renderCards(filtered);
  resultsCount.textContent = `Showing ${filtered.length} project${filtered.length === 1 ? '' : 's'}`;
}

function resetFilters() {
  projectSearch.value = '';
  filterStatus.selectedIndex = 0;
  filterType.selectedIndex = 0;
  filterSort.selectedIndex = 0;
  applyFilters();
}

function setView(view) {
  if (view === 'cards') {
    cardView.classList.remove('hidden');
    tableView.classList.add('hidden');
    viewCardsBtn.classList.add('is-active');
    viewTableBtn.classList.remove('is-active');
  } else {
    cardView.classList.add('hidden');
    tableView.classList.remove('hidden');
    viewTableBtn.classList.add('is-active');
    viewCardsBtn.classList.remove('is-active');
  }
}

function attachViewButtonHandlers() {
  const viewButtons = document.querySelectorAll('.view-project-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const projectId = e.target.dataset.projectId;
      const project = projectData.find(p => p.id === projectId);
      if (project) {
        // Store project data in sessionStorage for the detail page
        sessionStorage.setItem('currentProject', JSON.stringify(project));
        window.location.href = 'project-detail.html';
      }
    });
  });
}

viewTableBtn.addEventListener('click', () => setView('table'));
viewCardsBtn.addEventListener('click', () => setView('cards'));
projectSearch.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterType.addEventListener('change', applyFilters);
filterSort.addEventListener('change', applyFilters);
clearFiltersBtn.addEventListener('click', resetFilters);

window.addEventListener('DOMContentLoaded', () => {
  renderTable(projectData);
  renderCards(projectData);
  setView('table');
});
