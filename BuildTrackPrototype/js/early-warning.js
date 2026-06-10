const alertsTableBody = document.getElementById('alertsTableBody');
const alertSearch = document.getElementById('alertSearch');
const filterSeverity = document.getElementById('filterSeverity');
const filterStatus = document.getElementById('filterStatus');
const clearAlertFilters = document.getElementById('clearAlertFilters');
const alertDetailTitle = document.getElementById('alertDetailTitle');
const alertDetailStatus = document.getElementById('alertDetailStatus');
const alertDetailVars = document.getElementById('alertDetailVars');
const alertDetailAction = document.getElementById('alertDetailAction');
const alertAssignee = document.getElementById('alertAssignee');
const assignNote = document.getElementById('assignNote');
const alertActionLog = document.getElementById('alertActionLog');
const alertReviewNote = document.getElementById('alertReviewNote');
const acknowledgeAlertBtn = document.getElementById('acknowledgeAlertBtn');
const actionTakenBtn = document.getElementById('actionTakenBtn');
const markReviewBtn = document.getElementById('markReviewBtn');
const verifyResolveBtn = document.getElementById('verifyResolveBtn');
const endorseExecBtn = document.getElementById('endorseExecBtn');
const noteItBtn = document.getElementById('noteItBtn');
const directActionBtn = document.getElementById('directActionBtn');
const executiveDirectionNote = document.getElementById('executiveDirectionNote');
const alertTotal = document.getElementById('alertTotal');
const alertCritical = document.getElementById('alertCritical');
const alertWarning = document.getElementById('alertWarning');
const alertResolved = document.getElementById('alertResolved');

const alertData = [
  {
    id: 'A-101',
    project: 'East Bridge Overhaul',
    type: 'Delay Risk',
    severity: 'Critical',
    date: '2026-06-08',
    impactDays: 7,
    status: 'Generated',
    trigger: 'Material delivery delayed by 7 days, contractor performance score: 62%',
    recommendation: 'Confirm alternative suppliers and escalate logistics coordination.',
    actionLog: '',
    reviewNote: ''
  },
  {
    id: 'A-102',
    project: 'South Drainage Upgrade',
    type: 'Budget Overrun',
    severity: 'Warning',
    date: '2026-06-09',
    impactDays: 14,
    status: 'Acknowledged',
    trigger: 'Projected cost growth of 12% due to steel price increases.',
    recommendation: 'Review budget realignment and negotiate additional cost controls.',
    actionLog: 'Notified procurement team of updated price forecast.',
    reviewNote: ''
  },
  {
    id: 'A-103',
    project: 'City Road Resurfacing',
    type: 'Weather Impact',
    severity: 'Monitor',
    date: '2026-06-07',
    impactDays: 5,
    status: 'Generated',
    trigger: 'Monsoon advisory issued for the work zone in 5 days.',
    recommendation: 'Schedule protective covering and adjust the work plan.',
    actionLog: '',
    reviewNote: ''
  },
  {
    id: 'A-104',
    project: 'Health Center Expansion',
    type: 'Procurement Issue',
    severity: 'Critical',
    date: '2026-06-01',
    impactDays: 9,
    status: 'Generated',
    trigger: 'Long lead time for medical equipment procurement detected.',
    recommendation: 'Engage procurement team to expedite orders and source alternatives.',
    actionLog: '',
    reviewNote: ''
  },
  {
    id: 'A-105',
    project: 'Flood Control Retaining Wall',
    type: 'Delay Risk',
    severity: 'Warning',
    date: '2026-06-05',
    impactDays: 12,
    status: 'Action Taken',
    trigger: 'Excavation permit approval delayed by 4 days.',
    recommendation: 'Follow up with permitting office and adjust schedule buffers.',
    actionLog: 'Spoke with permitting office and prepared extension request.',
    reviewNote: ''
  },
  {
    id: 'A-106',
    project: 'Community Center Renovation',
    type: 'Budget Overrun',
    severity: 'Monitor',
    date: '2026-05-29',
    impactDays: 21,
    status: 'Generated',
    trigger: 'Subcontractor cost quote exceeds budget forecast by 8%.',
    recommendation: 'Validate quotes and consider scope adjustments for cost savings.',
    actionLog: '',
    reviewNote: ''
  },
  {
    id: 'A-107',
    project: 'North Floodway Repair',
    type: 'Weather Impact',
    severity: 'Warning',
    date: '2026-06-10',
    impactDays: 3,
    status: 'Generated',
    trigger: 'Heavy rains predicted during scheduled earthworks.',
    recommendation: 'Confirm temporary drainage and hold safety briefing.',
    actionLog: '',
    reviewNote: ''
  },
  {
    id: 'A-108',
    project: 'Barangay Road Lighting',
    type: 'Procurement Issue',
    severity: 'Monitor',
    date: '2026-05-26',
    impactDays: 17,
    status: 'Resolved',
    trigger: 'Cable conductor shipment delayed then rerouted successfully.',
    recommendation: 'Monitor remaining material deliveries and close notification.',
    actionLog: 'Confirmed rerouting and updated logistics team.',
    reviewNote: 'Verified closure and logged final supplier status.',
  }
];

let selectedAlert = null;

function summarizeAlerts(items) {
  alertTotal.textContent = items.length;
  alertCritical.textContent = items.filter(item => item.severity === 'Critical').length;
  alertWarning.textContent = items.filter(item => item.severity === 'Warning').length;
  alertResolved.textContent = items.filter(item => ['Resolved', 'Endorsed to Executive'].includes(item.status)).length;
}

function renderAlerts(items) {
  const currentUser = window.getCurrentUser?.();
  const role = currentUser?.role;

  alertsTableBody.innerHTML = items.map(alert => {
    const severityClass = alert.severity === 'Critical' ? 'badge--danger' : alert.severity === 'Warning' ? 'badge--warning' : 'badge--info';
    const statusClass = {
      Generated: 'badge--neutral',
      Acknowledged: 'badge--info',
      'Action Taken': 'badge--warning',
      'For Review': 'badge--warning',
      Resolved: 'badge--success',
      'Endorsed to Executive': 'badge--success'
    }[alert.status] || 'badge--neutral';

    const buttons = [];
    if (role === 'engineer') {
      buttons.push('<button class="btn btn--ghost btn--sm" data-action="acknowledge">Acknowledge</button>');
      buttons.push('<button class="btn btn--ghost btn--sm" data-action="actionTaken">Action Taken</button>');
      buttons.push('<button class="btn btn--ghost btn--sm" data-action="markReview">Mark for Review</button>');
    } else if (role === 'planning' || role === 'admin') {
      if (['Action Taken', 'For Review'].includes(alert.status)) {
        buttons.push('<button class="btn btn--ghost btn--sm" data-action="verifyResolve">Verify & Resolve</button>');
      }
      if (['Resolved', 'For Review'].includes(alert.status)) {
        buttons.push('<button class="btn btn--ghost btn--sm" data-action="endorseExec">Endorse</button>');
      }
    } else if (role === 'executive') {
      buttons.push('<button class="btn btn--ghost btn--sm" data-action="summary">View Summary</button>');
    }
    buttons.push('<button class="btn btn--secondary btn--sm" data-action="view">View Project</button>');

    return `
      <tr data-alert-id="${alert.id}" class="alert-row">
        <td>${alert.id}</td>
        <td>${alert.project}</td>
        <td>${alert.type}</td>
        <td><span class="badge ${severityClass}">${alert.severity}</span></td>
        <td>${alert.date}</td>
        <td>${alert.impactDays} days</td>
        <td><span class="badge ${statusClass}">${alert.status}</span></td>
        <td>${buttons.join(' ')}</td>
      </tr>
    `;
  }).join('');
}

function findAlertById(id) {
  return alertData.find(alert => alert.id === id);
}

function showAlertDetails(alert) {
  if (!alert) return;
  selectedAlert = alert;
  alertDetailTitle.textContent = `${alert.id} - ${alert.project}`;
  alertDetailStatus.textContent = alert.status;
  alertDetailVars.textContent = alert.trigger;
  alertDetailAction.textContent = alert.recommendation;
  if (alertActionLog) alertActionLog.value = alert.actionLog || '';
  if (alertReviewNote) alertReviewNote.value = alert.reviewNote || '';
  if (alertAssignee) alertAssignee.value = '';
}

function applyFilters() {
  const searchValue = alertSearch.value.trim().toLowerCase();
  const severity = filterSeverity.value;
  const status = filterStatus.value;

  const filtered = alertData.filter(alert => {
    const matchesSearch = [alert.id, alert.project, alert.type].some(field => field.toLowerCase().includes(searchValue));
    const matchesSeverity = !severity || alert.severity === severity;
    const matchesStatus = !status || alert.status === status;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  summarizeAlerts(alertData);
  renderAlerts(filtered);
}

function resetFilterValues() {
  alertSearch.value = '';
  filterSeverity.selectedIndex = 0;
  filterStatus.selectedIndex = 0;
  applyFilters();
}

function applyAssignmentRules() {
  const currentUser = window.getCurrentUser?.();
  if (!alertAssignee) return;
  if (currentUser?.role === 'engineer') {
    alertAssignee.disabled = true;
    alertAssignee.value = '';
    if (assignNote) {
      assignNote.textContent = 'You are an engineer; alerts should be acknowledged, documented, and marked for review.';
    }
  } else {
    alertAssignee.disabled = false;
    if (assignNote) {
      assignNote.textContent = 'Select an engineer to handle this alert.';
    }
  }
}

alertsTableBody.addEventListener('click', event => {
  const actionButton = event.target.closest('button[data-action]');
  const row = event.target.closest('tr[data-alert-id]');
  if (!row) return;

  const alert = findAlertById(row.dataset.alertId);
  if (!alert) return;

  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === 'acknowledge') {
      alert.status = 'Acknowledged';
      showAlertDetails(alert);
      applyFilters();
      return;
    }
    if (action === 'actionTaken') {
      alert.status = 'Action Taken';
      alert.actionLog = alert.actionLog || 'Action taken and logged by engineer.';
      showAlertDetails(alert);
      applyFilters();
      return;
    }
    if (action === 'markReview') {
      alert.status = 'For Review';
      alert.actionLog = alertActionLog?.value || alert.actionLog || 'Action taken and ready for review.';
      showAlertDetails(alert);
      applyFilters();
      return;
    }
    if (action === 'verifyResolve') {
      alert.status = 'Resolved';
      alert.reviewNote = alertReviewNote?.value || alert.reviewNote || 'Verified by Planning Officer.';
      showAlertDetails(alert);
      applyFilters();
      return;
    }
    if (action === 'endorseExec') {
      alert.status = 'Endorsed to Executive';
      alert.reviewNote = alertReviewNote?.value || alert.reviewNote || 'Endorsed to executive for awareness.';
      showAlertDetails(alert);
      applyFilters();
      return;
    }
    if (action === 'summary') {
      showAlertDetails(alert);
      return;
    }
    if (action === 'view') {
      alertDetailTitle.textContent = `${alert.id} - ${alert.project}`;
      return;
    }
  }

  showAlertDetails(alert);
});

acknowledgeAlertBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  selectedAlert.status = 'Acknowledged';
  showAlertDetails(selectedAlert);
  applyFilters();
});

actionTakenBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  selectedAlert.status = 'Action Taken';
  selectedAlert.actionLog = alertActionLog?.value || selectedAlert.actionLog || 'Action logged by engineer.';
  showAlertDetails(selectedAlert);
  applyFilters();
});

markReviewBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  if (alertActionLog?.value) {
    selectedAlert.actionLog = alertActionLog.value;
  }
  selectedAlert.status = 'For Review';
  showAlertDetails(selectedAlert);
  applyFilters();
});

verifyResolveBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  selectedAlert.status = 'Resolved';
  if (alertReviewNote?.value) {
    selectedAlert.reviewNote = alertReviewNote.value;
  }
  showAlertDetails(selectedAlert);
  applyFilters();
});

endorseExecBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  selectedAlert.status = 'Endorsed to Executive';
  if (alertReviewNote?.value) {
    selectedAlert.reviewNote = alertReviewNote.value;
  }
  showAlertDetails(selectedAlert);
  applyFilters();
});

noteItBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  selectedAlert.status = 'Acknowledged';
  selectedAlert.reviewNote = 'Executive noted and informed of this issue.';
  if (executiveDirectionNote?.value) {
    executiveDirectionNote.value = '';
  }
  showAlertDetails(selectedAlert);
  applyFilters();
  showToast({ message: '✓ Alert noted at executive level', type: 'success' });
});

directActionBtn?.addEventListener('click', () => {
  if (!selectedAlert) return;
  if (!executiveDirectionNote?.value?.trim()) {
    showToast({ message: 'Please enter a directive before sending', type: 'warning' });
    return;
  }
  selectedAlert.status = 'Action Taken';
  selectedAlert.reviewNote = `Executive Directive: ${executiveDirectionNote.value}`;
  selectedAlert.actionLog = `Escalated to field team with directive: ${executiveDirectionNote.value}`;
  executiveDirectionNote.value = '';
  showAlertDetails(selectedAlert);
  applyFilters();
  showToast({ message: '✓ Directive sent to field teams', type: 'success' });
});

clearAlertFilters.addEventListener('click', resetFilterValues);
alertSearch.addEventListener('input', applyFilters);
filterSeverity.addEventListener('change', applyFilters);
filterStatus.addEventListener('change', applyFilters);

window.addEventListener('DOMContentLoaded', () => {
  summarizeAlerts(alertData);
  renderAlerts(alertData);
  applyAssignmentRules();
});
