/* ============================================================
   PROJECT DETAIL — project-detail.js
   Tab switching, data population, chart rendering
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ════════════════════════════════════════════
  // 0. LOAD PROJECT DATA FROM STORAGE
  // ════════════════════════════════════════════
  let currentProjectData = null;
  try {
    const stored = sessionStorage.getItem('currentProject');
    if (stored) {
      currentProjectData = JSON.parse(stored);
    }
  } catch (e) {
    console.log('No project data in sessionStorage');
  }

  // ════════════════════════════════════════════
  // 1. TAB SWITCHING FUNCTIONALITY
  // ════════════════════════════════════════════
  const tabButtons = document.querySelectorAll('.tab-nav__button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('is-active'));
      tabContents.forEach(content => content.classList.remove('is-active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');

      const targetPanel = document.getElementById(`panel-${tabId}`);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }

      // Update other buttons' aria-selected
      tabButtons.forEach(btn => {
        if (btn !== button) {
          btn.setAttribute('aria-selected', 'false');
        }
      });

      // Initialize chart when Financial tab is opened
      if (tabId === 'financial' && !window.spendingChartInitialized) {
        initializeSpendingChart();
        window.spendingChartInitialized = true;
      }
    });
  });

  // ════════════════════════════════════════════
  // 2. PROJECT DATA
  // ════════════════════════════════════════════
  const projectData = {
    title: 'East Bridge Overhaul Project',
    status: 'On Track',
    location: 'Downtown District',
    office: 'Ministry of Infrastructure',
    contractor: 'BuildCorp Solutions',
    contractAmount: '$2,500,000',
    startDate: 'Jan 15, 2024',
    targetDate: 'Dec 31, 2024',
    physicalProgress: 65,
    financialProgress: 58,
    delayDays: -3, // negative = ahead of schedule
  };

  const timelineTasks = [
    {
      name: 'Site Preparation',
      plannedStart: 'Jan 15, 2024',
      plannedEnd: 'Feb 10, 2024',
      actualStart: 'Jan 15, 2024',
      progress: 100,
      status: 'green',
    },
    {
      name: 'Foundation Work',
      plannedStart: 'Feb 15, 2024',
      plannedEnd: 'Apr 15, 2024',
      actualStart: 'Feb 14, 2024',
      progress: 85,
      status: 'green',
    },
    {
      name: 'Structural Assembly',
      plannedStart: 'Apr 20, 2024',
      plannedEnd: 'Jul 20, 2024',
      actualStart: 'Apr 22, 2024',
      progress: 62,
      status: 'yellow',
    },
    {
      name: 'Finishing & Quality',
      plannedStart: 'Jul 25, 2024',
      plannedEnd: 'Oct 15, 2024',
      actualStart: 'Oct 01, 2024',
      progress: 0,
      status: 'yellow',
    },
    {
      name: 'Final Inspection',
      plannedStart: 'Oct 20, 2024',
      plannedEnd: 'Dec 31, 2024',
      actualStart: 'Pending',
      progress: 0,
      status: 'red',
    },
  ];

  const defaultFundReleases = [
    { release: 'Release 1', date: 'Jan 20, 2024', amount: '$500,000' },
    { release: 'Release 2', date: 'Mar 15, 2024', amount: '$500,000' },
    { release: 'Release 3', date: 'May 10, 2024', amount: '$450,000' },
    { release: 'Release 4', date: 'Jul 18, 2024', amount: '$500,000' },
  ];

  const alerts = [
    {
      date: 'Nov 10, 2024',
      type: 'Schedule Delay',
      severity: 'warning',
      message: 'Structural assembly phase showing 1-week delay due to material shortage.',
      action: 'Expedited procurement initiated',
      icon: '📅',
    },
    {
      date: 'Oct 28, 2024',
      type: 'Budget Variance',
      severity: 'warning',
      message: 'Labor costs trending 8% higher than budgeted. Investigating overtime impact.',
      action: 'Cost optimization meeting scheduled',
      icon: '💰',
    },
    {
      date: 'Oct 15, 2024',
      type: 'Weather Impact',
      severity: 'info',
      message: 'Heavy rains caused 2-day work stoppage. No critical impact on timeline.',
      action: 'Schedule buffer absorbed delay',
      icon: '🌧️',
    },
    {
      date: 'Sep 22, 2024',
      type: 'Safety Incident',
      severity: 'danger',
      message: 'Minor tooling accident. No injuries. Investigation completed.',
      action: 'Safety training reinforced',
      icon: '⚠️',
    },
    {
      date: 'Aug 10, 2024',
      type: 'Progress Ahead',
      severity: 'success',
      message: 'Foundation work completed 3 days ahead of schedule.',
      action: 'Great momentum! Continue current pace',
      icon: '✅',
    },
  ];

  const photos = [
    {
      id: 1,
      date: 'Nov 08, 2024',
      coords: '40.7128° N, 74.0060° W',
      by: 'James Wilson',
      placeholder: true,
      milestone: '50%'
    },
    {
      id: 2,
      date: 'Nov 05, 2024',
      coords: '40.7130° N, 74.0062° W',
      by: 'Sarah Chen',
      placeholder: true,
      milestone: '25%'
    },
    {
      id: 3,
      date: 'Oct 30, 2024',
      coords: '40.7125° N, 74.0058° W',
      by: 'Ahmed Hassan',
      placeholder: true,
      milestone: '0%'
    },
  ];

  // Persisted photos (local demo)
  const STORAGE_KEY = `bt_photos_${projectData.title.replace(/\W+/g,'_')}`;

  function loadPhotosFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const stored = JSON.parse(raw);
      return Array.isArray(stored) ? stored : null;
    } catch (e) {
      console.warn('Failed to load photos from storage', e);
      return null;
    }
  }

  function savePhotosToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch (e) {
      console.warn('Failed to save photos to storage', e);
    }
  }

  const stored = loadPhotosFromStorage();
  if (stored && stored.length) {
    photos.length = 0;
    photos.push(...stored);
  }

  // ════════════════════════════════════════════
  // 3. POPULATE OVERVIEW TAB
  // ════════════════════════════════════════════
  function populateOverview() {
    document.getElementById('projectTitle').textContent = projectData.title;
    document.getElementById('projectStatus').textContent = projectData.status;
    document.getElementById('projectLocation').textContent = projectData.location;
    document.getElementById('projectContractor').textContent = projectData.contractor;

    document.getElementById('infoTitle').textContent = projectData.title;
    document.getElementById('infoLocation').textContent = projectData.location;
    document.getElementById('infoOffice').textContent = projectData.office;
    document.getElementById('infoContractor').textContent = projectData.contractor;
    document.getElementById('infoContractAmount').textContent = projectData.contractAmount;
    document.getElementById('infoStartDate').textContent = projectData.startDate;
    document.getElementById('infoTargetDate').textContent = projectData.targetDate;

    document.getElementById('physicalPercent').textContent = `${projectData.physicalProgress}%`;
    document.getElementById('financialPercent').textContent = `${projectData.financialProgress}%`;

    // Update progress bars
    const physicalFill = document.querySelector('.progress-card .progress-fill--green');
    const financialFill = document.querySelector('.progress-card .progress-fill--blue');
    if (physicalFill) physicalFill.style.width = `${projectData.physicalProgress}%`;
    if (financialFill) financialFill.style.width = `${projectData.financialProgress}%`;

    // Update delay status
    const delayStatus = document.getElementById('delayStatus');
    const delayDays = document.getElementById('delayDays');
    const delayValue = Math.abs(projectData.delayDays);

    if (projectData.delayDays > 0) {
      delayDays.textContent = `${delayValue} days behind`;
      delayStatus.classList.add('is-negative');
    } else if (projectData.delayDays < 0) {
      delayDays.textContent = `${delayValue} days ahead`;
      delayStatus.classList.remove('is-negative');
    } else {
      delayDays.textContent = 'On schedule';
    }
  }

  // ════════════════════════════════════════════
  // 4. POPULATE TIMELINE TAB
  // ════════════════════════════════════════════
  function populateTimeline() {
    const timelineBody = document.getElementById('timelineBody');
    timelineBody.innerHTML = timelineTasks
      .map((task) => {
        const statusLabel = {
          green: 'On Track',
          yellow: 'Slight Delay',
          red: 'Critical Delay',
        }[task.status];

        return `
          <div class="timeline-row">
            <div class="timeline-col timeline-col--name">${task.name}</div>
            <div class="timeline-col timeline-col--date">${task.plannedStart}</div>
            <div class="timeline-col timeline-col--date">${task.plannedEnd}</div>
            <div class="timeline-col timeline-col--date">${task.actualStart}</div>
            <div class="timeline-col timeline-col--progress">${task.progress}%</div>
            <div class="timeline-col timeline-col--status">
              <span class="timeline-status timeline-status--${task.status}">${statusLabel}</span>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // ════════════════════════════════════════════
  // 5. POPULATE PHOTOS TAB
  // ════════════════════════════════════════════
  function populatePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const photoCount = document.getElementById('photoCount');

    // Group photos by milestone slots
    const slots = ['0%','25%','50%','75%','100%','issue'];

    photoGrid.innerHTML = slots
      .map(slot => {
        const slotPhotos = photos.filter(p => (p.milestone || 'issue') === slot);
        const title = slot === 'issue' ? 'Issue Snapshots' : `${slot} Milestone`;

        const items = slotPhotos.length
          ? slotPhotos.map(photo => `
            <div class="photo-item">
              <div class="photo-item__image" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#e0f2fe 0%,#f0f9ff 100%);">
                ${photo.dataUrl ? `<img src="${photo.dataUrl}" alt="photo" />` : '📷'}
              </div>
              <div class="photo-item__info">
                <span class="photo-item__date">${photo.date}</span>
                <span class="photo-item__coords">${photo.coords}</span>
                <span class="photo-item__by">by ${photo.by}</span>
              </div>
            </div>
          `).join('')
          : `<div class="photo-slot-empty">No photos for this slot</div>`;

        return `
          <section class="photo-slot">
            <div class="photo-slot__header">
              <h5>${title}</h5>
              <small class="text-muted">${slotPhotos.length} ${slotPhotos.length === 1 ? 'photo' : 'photos'}</small>
            </div>
            <div class="photo-slot__grid">${items}</div>
          </section>
        `;
      })
      .join('');

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`;
  }

  // ════════════════════════════════════════════
  // 6. POPULATE FINANCIAL TAB
  // ════════════════════════════════════════════
  function populateFinancial() {
    const fundReleasesBody = document.getElementById('fundReleasesBody');
    fundReleasesBody.innerHTML = defaultFundReleases
      .map(
        (release) => `
        <tr>
          <td>${release.release}</td>
          <td>${release.date}</td>
          <td>${release.amount}</td>
        </tr>
      `
      )
      .join('');

    document.getElementById('totalBudget').textContent = projectData.contractAmount;
    document.getElementById('spentToDate').textContent = '$1,450,000';
    document.getElementById('budgetRemaining').textContent = '$1,050,000';
  }

  // ════════════════════════════════════════════
  // 7. POPULATE ALERTS TAB
  // ════════════════════════════════════════════
  function populateAlerts() {
    const alertsTimeline = document.getElementById('alertsTimeline');
    alertsTimeline.innerHTML = alerts
      .map(
        (alert) => `
        <div class="alert-item alert-item--${alert.severity}">
          <div class="alert-icon">${alert.icon}</div>
          <div class="alert-content">
            <div class="alert-header">
              <span class="alert-title">${alert.type}</span>
              <span class="alert-severity alert-severity--${alert.severity}">
                ${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </span>
            </div>
            <span class="alert-date">${alert.date}</span>
            <p class="alert-message">${alert.message}</p>
            <span class="alert-action">${alert.action}</span>
          </div>
        </div>
      `
      )
      .join('');
  }

  // ════════════════════════════════════════════
  // 8. CHART RENDERING
  // ════════════════════════════════════════════
  function initializeSpendingChart() {
    const ctx = document.getElementById('spendingChart');
    if (!ctx || window.spendingChart) return;

    const totalBudget = 2500000;
    const spent = 1450000;
    const remaining = totalBudget - spent;

    window.spendingChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Spent', 'Remaining'],
        datasets: [
          {
            data: [spent, remaining],
            backgroundColor: ['#d97706', '#16a34a'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { size: 12, family: "'Inter', sans-serif" },
              color: '#64748b',
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed || 0;
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                });
                return formatter.format(value);
              },
            },
          },
        },
      },
    });
  }

  // ════════════════════════════════════════════
  // 9. PHOTO UPLOAD MODAL
  // ════════════════════════════════════════════
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const uploadPhotoModal = document.getElementById('uploadPhotoModal');
  const submitPhotoBtn = document.getElementById('submitPhotoBtn');
  const closeUploadModal = document.getElementById('closeUploadModal');
  const cancelPhotoBtn = document.getElementById('cancelPhotoBtn');

  if (uploadPhotoBtn) {
    uploadPhotoBtn.addEventListener('click', () => {
      uploadPhotoModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeUploadModal) {
    closeUploadModal.addEventListener('click', () => {
      uploadPhotoModal.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  if (cancelPhotoBtn) {
    cancelPhotoBtn.addEventListener('click', () => {
      uploadPhotoModal.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  // Live image preview when selecting a file (use FileReader to create data URL)
  const photoFileInput = document.getElementById('photoFile');
  const photoPreviewContainer = document.getElementById('photoPreview');
  if (photoFileInput && photoPreviewContainer) {
    photoFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        photoPreviewContainer.innerHTML = '';
        photoPreviewContainer.setAttribute('aria-hidden', 'true');
        return;
      }
      const fr = new FileReader();
      fr.onload = () => {
        photoPreviewContainer.innerHTML = `<img src="${fr.result}" alt="Photo preview" />`;
        photoPreviewContainer.setAttribute('aria-hidden', 'false');
      };
      fr.readAsDataURL(file);
    });
  }

  if (submitPhotoBtn) {
    submitPhotoBtn.addEventListener('click', () => {
      const fileInput = document.getElementById('photoFile');
      const file = fileInput?.files && fileInput.files[0];
      const photoDate = document.getElementById('photoDate').value;
      const photoGPS = document.getElementById('photoGPS').value;
      const photoUploadedBy = document.getElementById('photoUploadedBy').value;
      const photoMilestone = document.getElementById('photoMilestone')?.value || 'issue';

      if (!file || !photoDate || !photoGPS) {
        alert('Please fill in all required fields');
        return;
      }

      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result;
        const newPhoto = {
          id: Date.now(),
          date: new Date(photoDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          coords: photoGPS,
          by: photoUploadedBy,
          placeholder: false,
          milestone: photoMilestone,
          dataUrl: dataUrl,
        };

        photos.unshift(newPhoto);
        savePhotosToStorage();
        populatePhotos();

        // Close modal and reset form
        uploadPhotoModal.classList.remove('is-open');
        document.body.style.overflow = '';
        fileInput.value = '';
        document.getElementById('photoDate').value = '';
        document.getElementById('photoGPS').value = '';
        document.getElementById('photoUploadedBy').value = 'Current User';
        const preview = document.getElementById('photoPreview');
        if (preview) { preview.innerHTML = ''; preview.setAttribute('aria-hidden', 'true'); }

        window.showToast({ message: 'Photo uploaded successfully!', type: 'success', duration: 3000 });
      };
      fr.readAsDataURL(file);
    });
  }

  // ════════════════════════════════════════════
  // 10. ENGINEER TIMELINE UPDATES
  // ════════════════════════════════════════════
  const submitProgressBtn = document.getElementById('submitProgressBtn');
  const submitAccomplishBtn = document.getElementById('submitAccomplishBtn');
  
  if (submitProgressBtn) {
    submitProgressBtn.addEventListener('click', () => {
      const newProgress = parseInt(document.getElementById('engineerPhysicalUpdate').value) || 65;
      projectData.physicalProgress = newProgress;

      const physicalPercent = document.getElementById('physicalPercent');
      const physicalFill = document.querySelector('.progress-card .progress-fill--green');

      if (physicalPercent) physicalPercent.textContent = `${newProgress}%`;
      if (physicalFill) physicalFill.style.width = `${newProgress}%`;

      populateContractorPerformance();

      window.showToast({ message: `Physical progress updated to ${newProgress}%`, type: 'success', duration: 3000 });
    });
  }

  if (submitAccomplishBtn) {
    submitAccomplishBtn.addEventListener('click', () => {
      const accomplishment = document.getElementById('engineerAccomplishments').value;
      if (!accomplishment.trim()) {
        alert('Please enter accomplishment details');
        return;
      }
      
      // Store accomplishment in array
      if (!projectData.accomplishments) projectData.accomplishments = [];
      projectData.accomplishments.push({
        date: new Date().toLocaleDateString(),
        text: accomplishment
      });
      
      document.getElementById('engineerAccomplishments').value = '';
      window.showToast({ message: 'Accomplishment logged successfully!', type: 'success', duration: 3000 });
    });
  }

  // ════════════════════════════════════════════
  // 11. PROGRESS LOG MANAGEMENT
  // ════════════════════════════════════════════
  let progressLogs = [];
  const PROGRESS_LOG_KEY = `bt_progress_logs_${projectData.title.replace(/\W+/g,'_')}`;
  
  function loadProgressLogs() {
    try {
      const raw = localStorage.getItem(PROGRESS_LOG_KEY);
      if (raw) progressLogs = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load progress logs', e);
    }
  }

  function saveProgressLogs() {
    try {
      localStorage.setItem(PROGRESS_LOG_KEY, JSON.stringify(progressLogs));
    } catch (e) {
      console.warn('Failed to save progress logs', e);
    }
  }

  function renderProgressLogs() {
    const historyContainer = document.getElementById('progressLogHistory');
    if (!historyContainer) return;
    
    if (progressLogs.length === 0) {
      historyContainer.innerHTML = '<p style="color: var(--color-text-muted); font-size: var(--text-sm);">No progress logs yet</p>';
      return;
    }

    historyContainer.innerHTML = progressLogs
      .slice()
      .reverse()
      .map((log, idx) => `
        <div style="padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg);">
          <div style="font-weight: 600; color: var(--color-text); margin-bottom: var(--space-2);">${log.date}</div>
          <div style="font-size: var(--text-sm); color: var(--color-text); margin-bottom: var(--space-2);"><strong>Work Done:</strong> ${log.workDone}</div>
          <div style="font-size: var(--text-sm); color: var(--color-text); margin-bottom: var(--space-2);"><strong>Materials:</strong> ${log.materials}</div>
          <div style="font-size: var(--text-sm); color: var(--color-text); margin-bottom: var(--space-2);"><strong>Contractor:</strong> ${log.contractor}</div>
          <div style="font-size: var(--text-sm); color: var(--color-text);"><strong>Issues:</strong> ${log.problems}</div>
        </div>
      `).join('');
  }

  const submitProgressLogBtn = document.getElementById('submitProgressLogBtn');
  if (submitProgressLogBtn) {
    submitProgressLogBtn.addEventListener('click', () => {
      const reportDate = document.getElementById('logReportDate').value;
      const workDone = document.getElementById('logWorkDone').value;
      const materials = document.getElementById('logMaterials').value;
      const contractor = document.getElementById('logContractor').value;
      const problems = document.getElementById('logProblems').value;

      if (!reportDate || !workDone || !materials || !contractor) {
        alert('Please fill in all required fields');
        return;
      }

      const newLog = {
        date: new Date(reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        workDone,
        materials,
        contractor,
        problems: problems || 'None'
      };

      progressLogs.push(newLog);
      saveProgressLogs();
      renderProgressLogs();

      // Reset form
      document.getElementById('logReportDate').value = '';
      document.getElementById('logWorkDone').value = '';
      document.getElementById('logMaterials').value = '';
      document.getElementById('logContractor').value = '';
      document.getElementById('logProblems').value = '';

      window.showToast({ message: 'Progress log entry saved!', type: 'success', duration: 3000 });
    });
  }

  // ════════════════════════════════════════════
  // 12. FINANCIAL RECORDS MANAGEMENT
  // ════════════════════════════════════════════
  let fundReleases = [];
  let expenditures = [];
  const FUND_RELEASES_KEY = `bt_fund_releases_${projectData.title.replace(/\W+/g,'_')}`;
  const EXPENDITURES_KEY = `bt_expenditures_${projectData.title.replace(/\W+/g,'_')}`;

  function loadFinancialData() {
    try {
      const releasesRaw = localStorage.getItem(FUND_RELEASES_KEY);
      if (releasesRaw) fundReleases = JSON.parse(releasesRaw);
      
      const expendRaw = localStorage.getItem(EXPENDITURES_KEY);
      if (expendRaw) expenditures = JSON.parse(expendRaw);
    } catch (e) {
      console.warn('Failed to load financial data', e);
    }
  }

  function saveFinancialData() {
    try {
      localStorage.setItem(FUND_RELEASES_KEY, JSON.stringify(fundReleases));
      localStorage.setItem(EXPENDITURES_KEY, JSON.stringify(expenditures));
    } catch (e) {
      console.warn('Failed to save financial data', e);
    }
  }

  const submitFundReleaseBtn = document.getElementById('submitFundReleaseBtn');
  if (submitFundReleaseBtn) {
    submitFundReleaseBtn.addEventListener('click', () => {
      const date = document.getElementById('fundReleaseDate').value;
      const amount = document.getElementById('fundReleaseAmount').value;
      const desc = document.getElementById('fundReleaseDesc').value;

      if (!date || !amount) {
        alert('Please fill in date and amount');
        return;
      }

      fundReleases.push({
        date,
        amount: parseFloat(amount),
        desc: desc || 'Fund Release'
      });

      saveFinancialData();

      // Add row to table
      const fundBody = document.getElementById('fundReleasesBody');
      if (fundBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${desc || 'Release ' + fundReleases.length}</td>
          <td>${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
          <td>₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        `;
        fundBody.appendChild(row);
      }

      // Reset form
      document.getElementById('fundReleaseDate').value = '';
      document.getElementById('fundReleaseAmount').value = '';
      document.getElementById('fundReleaseDesc').value = '';

      window.showToast({ message: 'Fund release recorded!', type: 'success', duration: 3000 });
    });
  }

  const submitExpenditureBtn = document.getElementById('submitExpenditureBtn');
  if (submitExpenditureBtn) {
    submitExpenditureBtn.addEventListener('click', () => {
      const date = document.getElementById('expenditureDate').value;
      const amount = document.getElementById('expenditureAmount').value;
      const category = document.getElementById('expenditureCategory').value;
      const desc = document.getElementById('expenditureDesc').value;

      if (!date || !amount || !category) {
        alert('Please fill in date, amount, and category');
        return;
      }

      expenditures.push({
        date,
        amount: parseFloat(amount),
        category,
        desc: desc || 'Expenditure'
      });

      saveFinancialData();

      // Update spent amount and chart
      const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
      document.getElementById('spentToDate').textContent = '₱' + totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 });

      // Reset form
      document.getElementById('expenditureDate').value = '';
      document.getElementById('expenditureAmount').value = '';
      document.getElementById('expenditureCategory').value = '';
      document.getElementById('expenditureDesc').value = '';

      window.showToast({ message: 'Expenditure recorded!', type: 'success', duration: 3000 });
    });
  }

  // ════════════════════════════════════════════
  // CONTRACTOR PERFORMANCE SCORING
  // ════════════════════════════════════════════

  function calculateProjectDuration(timelineTasks) {
    if (!timelineTasks || timelineTasks.length === 0) return 1;
    const startDate = new Date(timelineTasks[0].plannedStart);
    const endDate = new Date(timelineTasks[timelineTasks.length - 1].plannedEnd);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
  }

  function calculateDaysElapsed(startDateStr) {
    if (!startDateStr) return 0;
    const startDate = new Date(startDateStr);
    const today = new Date();
    return Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
  }

  function classifyPerformanceLevel(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  function getPerformanceLevelLabel(level) {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    };
    return labels[level] || 'Unknown';
  }

  function getPerformanceInterpretation(score, scheduleScore, qualityScore, progressScore, budgetScore) {
    const level = classifyPerformanceLevel(score);
    let details = [];

    if (scheduleScore >= 80) details.push('on schedule');
    else if (scheduleScore < 40) details.push('experiencing delays');

    if (qualityScore >= 90) details.push('minimal quality issues');
    else if (qualityScore < 60) details.push('multiple quality concerns');

    if (progressScore >= 80) details.push('maintaining pace');
    else if (progressScore < 60) details.push('behind expected progress');

    if (budgetScore >= 80) details.push('on budget');
    else if (budgetScore < 60) details.push('budget overruns');

    const baseMessage = {
      excellent: 'Strong contractor performance with excellent execution across all metrics.',
      good: 'Solid contractor performance with good results on most metrics.',
      fair: 'Moderate contractor performance with some areas needing improvement.',
      poor: 'Poor contractor performance with significant issues requiring attention.'
    };

    return baseMessage[level] + (details.length > 0 ? ' (' + details.join(', ') + ')' : '');
  }

  function calculateContractorPerformance() {
    // Schedule Performance (0-100)
    let scheduleScore = 100;
    if (projectData.delayDays < 0) {
      scheduleScore = Math.min(110, 100 + (projectData.delayDays * 1));
    } else {
      scheduleScore = Math.max(0, 100 - (projectData.delayDays * 2));
    }

    // Quality Issues (0-100) - based on alert severity
    let qualityScore = 100;
    alerts.forEach(alert => {
      if (alert.severity === 'info') qualityScore -= 2;
      else if (alert.severity === 'warning') qualityScore -= 5;
      else if (alert.severity === 'danger') qualityScore -= 15;
    });
    qualityScore = Math.max(0, qualityScore);

    // Progress Rate (0-100)
    const totalProjectDays = calculateProjectDuration(timelineTasks);
    const elapsedDays = calculateDaysElapsed(projectData.startDate);
    let progressScore = 100;

    if (totalProjectDays > 0) {
      const expectedProgress = (elapsedDays / totalProjectDays) * 100;
      if (projectData.physicalProgress < expectedProgress) {
        const progressBehind = expectedProgress - projectData.physicalProgress;
        progressScore = Math.max(0, 100 - progressBehind);
      } else {
        progressScore = 100;
      }
    }

    // Budget Performance (0-100)
    let budgetScore = 100;
    if (projectData.financialProgress < projectData.physicalProgress) {
      const variance = projectData.physicalProgress - projectData.financialProgress;
      budgetScore = Math.max(0, 100 - (variance * 2));
    }

    // Overall Score (average of 4 components)
    const overallScore = Math.round((scheduleScore + qualityScore + progressScore + budgetScore) / 4);
    const level = classifyPerformanceLevel(overallScore);

    return {
      overall: overallScore,
      schedule: Math.round(scheduleScore),
      quality: Math.round(qualityScore),
      progress: Math.round(progressScore),
      budget: Math.round(budgetScore),
      level: level,
      interpretation: getPerformanceInterpretation(overallScore, scheduleScore, qualityScore, progressScore, budgetScore)
    };
  }

  function populateContractorPerformance() {
    const performanceData = calculateContractorPerformance();

    // Update main score circle
    const circle = document.getElementById('performanceCircle');
    const level = document.getElementById('performanceLevel');
    const interpretation = document.getElementById('performanceInterpretation');

    if (circle) {
      circle.textContent = performanceData.overall;
      circle.className = `performance-score-circle ${performanceData.level}`;
    }

    if (level) {
      level.textContent = getPerformanceLevelLabel(performanceData.level);
    }

    if (interpretation) {
      interpretation.textContent = performanceData.interpretation;
    }

    // Populate metrics grid
    const metricsGrid = document.getElementById('performanceMetricsGrid');
    if (!metricsGrid) return;

    const metrics = [
      {
        name: 'Schedule Performance',
        value: performanceData.schedule,
        description: 'Days ahead/behind schedule'
      },
      {
        name: 'Quality Issues',
        value: performanceData.quality,
        description: 'Alert severity impact'
      },
      {
        name: 'Progress Rate',
        value: performanceData.progress,
        description: 'Pace vs timeline'
      },
      {
        name: 'Budget Performance',
        value: performanceData.budget,
        description: 'Cost efficiency'
      }
    ];

    metricsGrid.innerHTML = metrics.map(metric => {
      const metricLevel = classifyPerformanceLevel(metric.value);
      return `
        <div class="performance-metric-item ${metricLevel}">
          <div class="performance-metric-header">
            <div class="performance-metric-name">${metric.name}</div>
            <div class="performance-metric-value">${metric.value}</div>
          </div>
          <div class="performance-metric-bar">
            <div class="performance-metric-fill ${metricLevel}" style="width: ${metric.value}%"></div>
          </div>
          <div class="performance-score-interpretation" style="font-size: var(--text-xs); margin-top: 0;">${metric.description}</div>
        </div>
      `;
    }).join('');
  }


  function initializePage() {
    populateOverview();
    populateTimeline();
    populatePhotos();
    populateFinancial();
    populateAlerts();
    populateContractorPerformance();

    // Load and display persistent data
    loadProgressLogs();
    loadFinancialData();
    renderProgressLogs();
  }

  // Run initialization
  initializePage();
});
