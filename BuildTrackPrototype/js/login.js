/* ============================================================
   BUILDTRACK — login.js
   Login form validation and auth simulation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form          = document.getElementById('loginForm');
  const usernameEl    = document.getElementById('username');
  const passwordEl    = document.getElementById('password');
  const submitBtn     = document.getElementById('submitBtn');
  const submitText    = document.getElementById('submitText');
  const submitSpinner = document.getElementById('submitSpinner');
  const loginAlert    = document.getElementById('loginAlert');
  const loginAlertMsg = document.getElementById('loginAlertMsg');
  const togglePwdBtn  = document.getElementById('togglePassword');

  // ── Toggle password visibility ──────────────────────────
  togglePwdBtn?.addEventListener('click', () => {
    const isPassword = passwordEl.type === 'password';
    passwordEl.type = isPassword ? 'text' : 'password';
    togglePwdBtn.textContent = isPassword ? '🙈' : '👁️';
  });

  // ── Clear errors on input ───────────────────────────────
  usernameEl?.addEventListener('input', () => clearFieldError('usernameError'));
  passwordEl?.addEventListener('input', () => clearFieldError('passwordError'));

  // ── Form submission ─────────────────────────────────────
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginAlert.classList.add('hidden');

    // Validate fields
    let isValid = true;

    if (!usernameEl.value.trim()) {
      showFieldError('usernameError', 'Username is required.');
      isValid = false;
    }

    if (!passwordEl.value) {
      showFieldError('passwordError', 'Password is required.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    await delay(900);

    const username = usernameEl.value.trim().toLowerCase();
    const password = passwordEl.value;

    // All valid accounts — role is set by credentials, not the dropdown
    const accounts = [
      { username: 'demo',     password: 'demo123',  role: 'engineer',  name: 'Demo User'            },
      { username: 'engr01',   password: 'lgu2026',  role: 'engineer',  name: 'Engr. Juan Reyes'     },
      { username: 'mayor',    password: 'lgu2026',  role: 'executive', name: 'Mayor Maria Santos'   },
      { username: 'planning', password: 'lgu2026',  role: 'planning',  name: 'Arch. Liza Cordero'   },
      { username: 'admin',    password: 'admin123', role: 'admin',     name: 'System Administrator' },
    ];

    const matched = accounts.find(a => a.username === username && a.password === password);

    setLoading(false);

    if (matched) {
      // Save session
      sessionStorage.setItem('bt_user', JSON.stringify({
        name:     matched.name,
        role:     matched.role,
        username: matched.username,
      }));

      // Redirect to the dashboard using the correct relative path from buildtrack/index.html
      window.location.href = '../pages/dashboard.html';

    } else {
      setLoading(false);
      loginAlert.classList.remove('hidden');
      loginAlertMsg.textContent = 'Invalid username or password. Please try again.';
      passwordEl.value = '';
      passwordEl.focus();
    }
  });

  // ── Helpers ─────────────────────────────────────────────

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function clearFieldError(id) {
    document.getElementById(id)?.classList.add('hidden');
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitText.textContent = on ? 'Signing in…' : 'Sign In';
    if (submitSpinner) submitSpinner.classList.toggle('hidden', !on);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});