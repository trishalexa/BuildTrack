/* Map integration using Leaflet and `projectData` from project-list.js */
const projectListEl = document.getElementById('projectList');

let map, markers = {};

function pinColorByStatus(status){
  if(status === 'On-Track') return '#16a34a';
  if(status === 'At Risk') return '#d97706';
  return '#dc2626';
}

function createMarker(p) {
  if (!p.lat || !p.lng) return null;
  const color = pinColorByStatus(p.status);
  const marker = L.circleMarker([p.lat, p.lng], {
    radius: 9,
    fillColor: color,
    color: '#fff',
    weight: 1,
    opacity: 1,
    fillOpacity: 1
  }).addTo(map);

  const popupHtml = `
    <div style="min-width:180px;">
      <h3 style="margin:0 0 6px 0; font-size:14px;">${p.title}</h3>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><div>Status</div><div><span class="badge ${p.badge}">${p.status}</span></div></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;"><div>Complete</div><div>${p.physical}%</div></div>
      <div style="margin-top:8px; text-align:right;"><button class="btn btn--secondary btn--sm" onclick="window.location='project-detail.html?id=${p.id}'">View Full Project</button></div>
    </div>
  `;

  marker.bindPopup(popupHtml);
  marker.on('click', ()=>{
    // highlight corresponding card
    document.querySelectorAll('.project-mini').forEach(c=>c.classList.remove('is-active'));
    const card = document.querySelector(`.project-mini[data-id="${p.id}"]`);
    if(card) card.classList.add('is-active');
  });

  markers[p.id] = marker;
  return marker;
}

function createCard(p){
  const card = document.createElement('div');
  card.className = 'project-mini';
  card.setAttribute('data-id', p.id);
  card.innerHTML = `
    <div class="project-thumb">${p.id}</div>
    <div class="project-meta">
      <div class="project-title">${p.title}</div>
      <div class="project-sub">${p.status} • ${p.physical}%</div>
    </div>
    <div class="project-progress">${p.physical}%</div>
  `;

  card.addEventListener('click', ()=>{
    document.querySelectorAll('.project-mini').forEach(c=>c.classList.remove('is-active'));
    card.classList.add('is-active');
    const m = markers[p.id];
    if(m){
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 14), {animate:true});
      m.openPopup();
    }
  });

  projectListEl.appendChild(card);
}

window.addEventListener('DOMContentLoaded', ()=>{
  // initialize map
  map = L.map('map', { scrollWheelZoom: true }).setView([7.8250, 123.4370], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // use projectData if available
  const list = window.projectData && Array.isArray(window.projectData) ? window.projectData : [];
  list.forEach(p=>{
    createCard(p);
    createMarker(p);
  });

  // fit bounds if markers exist
  const ids = Object.keys(markers);
  if(ids.length){
    const group = L.featureGroup(ids.map(id=>markers[id]));
    map.fitBounds(group.getBounds().pad(0.25));
  }
});
