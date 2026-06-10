const sampleProjects = [
  { id: 'p001', name: 'City Road Rehabilitation', barangay: 'Maningning', type: 'Road', percent: 72, status: 'Ongoing', targetDate: 'Dec 2026' },
  { id: 'p002', name: 'Barangay Bridge Upgrade', barangay: 'Dumoy', type: 'Bridge', percent: 100, status: 'Completed', targetDate: 'Aug 2025' },
  { id: 'p003', name: 'Drainage Improvement Phase 2', barangay: 'Sta. Maria', type: 'Drainage', percent: 45, status: 'Ongoing', targetDate: 'Apr 2026' },
  { id: 'p004', name: 'Community Health Center', barangay: 'Poblacion', type: 'Facility', percent: 85, status: 'Ongoing', targetDate: 'Sep 2026' },
  { id: 'p005', name: 'Barangay Access Road', barangay: 'Muricay', type: 'Road', percent: 38, status: 'Delayed', targetDate: 'Jan 2027' },
  { id: 'p006', name: 'Pedestrian Bridge Safety Works', barangay: 'Canigao', type: 'Bridge', percent: 100, status: 'Completed', targetDate: 'Jul 2025' }
];

const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const projectGrid = document.getElementById('projectGrid');
const projectCount = document.getElementById('projectCount');
const ongoingCount = document.getElementById('ongoingCount');
const completedCount = document.getElementById('completedCount');

function getStatusClass(status) {
  if (status === 'Completed') return 'status-pill--completed';
  if (status === 'Delayed') return 'status-pill--delayed';
  return 'status-pill--ongoing';
}

function renderSummary(projects) {
  const ongoing = projects.filter(project => project.status === 'Ongoing').length;
  const completed = projects.filter(project => project.status === 'Completed').length;
  projectCount.textContent = `${projects.length} project${projects.length === 1 ? '' : 's'}`;
  ongoingCount.textContent = ongoing;
  completedCount.textContent = completed;
}

function renderProjects(projects) {
  if (!projects.length) {
    projectGrid.innerHTML = '<div class="empty-state">No projects match your filter. Try a broader search.</div>';
    renderSummary(projects);
    return;
  }

  projectGrid.innerHTML = projects.map(project => `
    <article class="project-card">
      <div class="project-card__header">
        <div>
          <h3 class="project-card__title">${project.name}</h3>
          <p class="project-card__meta">${project.barangay} · ${project.type}</p>
        </div>
        <span class="status-pill ${getStatusClass(project.status)}">${project.status}</span>
      </div>

      <div>
        <div class="progress-bar"><div class="progress-bar__fill" style="width: ${project.percent}%;"></div></div>
        <p class="project-card__meta" style="margin-top: 0.75rem;">${project.percent}% complete</p>
      </div>

      <div class="project-card__footer">
        <span>Target completion</span>
        <span>${project.targetDate}</span>
      </div>
    </article>
  `).join('');

  renderSummary(projects);
}

function filterProjects() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const selectedStatus = statusFilter.value;

  const results = sampleProjects.filter(project => {
    const matchesSearch = query === '' || project.name.toLowerCase().includes(query) || project.barangay.toLowerCase().includes(query);
    const matchesType = selectedType === '' || project.type === selectedType;
    const matchesStatus = selectedStatus === '' || project.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  renderProjects(results);
}

searchInput.addEventListener('input', filterProjects);
typeFilter.addEventListener('change', filterProjects);
statusFilter.addEventListener('change', filterProjects);
window.addEventListener('DOMContentLoaded', () => renderProjects(sampleProjects));
