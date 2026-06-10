const usersTableBody = document.getElementById('usersTableBody');
const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const modalTitle = document.getElementById('modalTitle');
const userForm = document.getElementById('userForm');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const userRoleSelect = document.getElementById('userRole');
const userOfficeInput = document.getElementById('userOffice');
const userIdInput = document.getElementById('userId');
const saveUserBtn = document.getElementById('saveUserBtn');
const closeButtons = document.querySelectorAll('[data-close-modal]');

let users = [
  { id: 'u001', name: 'Maria Lopez', role: 'Admin', office: 'Municipal Engineering Office', email: 'maria.lopez@example.com', status: 'Active' },
  { id: 'u002', name: 'Carlos Ramos', role: 'Engineer', office: 'Project Monitoring Unit', email: 'carlos.ramos@example.com', status: 'Active' },
  { id: 'u003', name: 'Janice Cruz', role: 'Planning Officer', office: 'Planning Office', email: 'janice.cruz@example.com', status: 'Inactive' },
  { id: 'u004', name: 'Leo Bautista', role: 'Executive', office: 'Office of the Mayor', email: 'leo.bautista@example.com', status: 'Active' },
  { id: 'u005', name: 'Rhea Santos', role: 'Read-Only', office: 'Budget Office', email: 'rhea.santos@example.com', status: 'Active' }
];

function renderUsers() {
  usersTableBody.innerHTML = users.map(user => `
    <tr data-id="${user.id}">
      <td>${user.name}</td>
      <td>${user.role}</td>
      <td>${user.office}</td>
      <td>${user.email}</td>
      <td><span class="user-badge ${user.status === 'Active' ? 'user-badge--active' : 'user-badge--inactive'}">${user.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn--ghost btn--sm action-button" data-action="edit">Edit</button>
          <button class="btn btn--danger btn--sm action-button" data-action="toggle-status">${user.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openModal(mode, user = null) {
  userModal.classList.add('is-open');
  if (mode === 'edit' && user) {
    modalTitle.textContent = 'Edit User';
    userNameInput.value = user.name;
    userEmailInput.value = user.email;
    userRoleSelect.value = user.role;
    userOfficeInput.value = user.office;
    userIdInput.value = user.id;
    const statusInput = document.querySelector(`input[name='userStatus'][value='${user.status}']`);
    if (statusInput) statusInput.checked = true;
  } else {
    modalTitle.textContent = 'Add New User';
    userForm.reset();
    userIdInput.value = '';
  }
}

function closeModal() {
  userModal.classList.remove('is-open');
}

function saveUser() {
  const name = userNameInput.value.trim();
  const email = userEmailInput.value.trim();
  const role = userRoleSelect.value;
  const office = userOfficeInput.value.trim();
  const status = document.querySelector('input[name="userStatus"]:checked')?.value || 'Active';
  const id = userIdInput.value;

  if (!name || !email || !role || !office) {
    alert('Please complete all fields.');
    return;
  }

  if (id) {
    const existing = users.find(u => u.id === id);
    if (existing) {
      existing.name = name;
      existing.email = email;
      existing.role = role;
      existing.office = office;
      existing.status = status;
    }
  } else {
    users.push({ id: `u${Date.now()}`, name, email, role, office, status });
  }

  renderUsers();
  closeModal();
}

addUserBtn.addEventListener('click', () => openModal('add'));
closeButtons.forEach(button => button.addEventListener('click', closeModal));

usersTableBody.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const row = button.closest('tr');
  const id = row.dataset.id;
  const user = users.find(u => u.id === id);
  if (!user) return;

  const action = button.dataset.action;
  if (action === 'edit') {
    openModal('edit', user);
  } else if (action === 'toggle-status') {
    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    renderUsers();
  }
});

saveUserBtn.addEventListener('click', saveUser);
window.addEventListener('click', event => {
  if (event.target === userModal) closeModal();
});
window.addEventListener('DOMContentLoaded', renderUsers);
