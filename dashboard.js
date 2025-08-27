// Role detection + Admin gating + Driver-first UI
(function(){
  const params = new URLSearchParams(location.search);
  let role = (params.get('role') || 'shipper').toLowerCase();

  // ---- ADMIN GATING ----
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
  if (role === 'admin' && !isAdmin) {
    // Bounce back if not admin
    alert('Admin area – access denied.');
    role = 'driver'; // or 'shipper'
    params.set('role', role);
    history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  }

  applyRole(role);

  // Toggle buttons cycle roles (but show Admin only if isAdmin)
  const t1 = document.getElementById('roleToggle');
  const t2 = document.getElementById('roleToggleMobile');
  [t1, t2].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      const cycle = isAdmin
        ? { shipper: 'driver', driver: 'admin', admin: 'shipper' }
        : { shipper: 'driver', driver: 'shipper' };
      const next = cycle[document.body.dataset.role] || 'shipper';
      applyRole(next);
      params.set('role', next);
      history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    });
  });

  function applyRole(r){
    document.body.dataset.role = r;
    setText('#roleBadge', r.charAt(0).toUpperCase()+r.slice(1));

    // Sections
    toggleGroup('.shipper-only', r === 'shipper');
    toggleGroup('.driver-only',  r === 'driver');
    toggleGroup('.admin-only',   r === 'admin');

    // Wallet label
    setText('#walletPayout', r === 'driver' ? 'Weekly' : (r === 'admin' ? '— (admin)' : '—'));

    // Build KPIs for non-driver roles
    buildKpis(r);

    // Seed data
    seedTables(r);

    // Driver overview widgets
    if (r === 'driver') initDriverOverview();
  }

  // Helper toggles
  function toggleGroup(sel, show){ document.querySelectorAll(sel).forEach(el => el.classList.toggle('hide', !show)); }
  function setText(sel, val){ const el = document.querySelector(sel); if (el) el.textContent = val; }

  // KPI builder for shipper/admin
  function buildKpis(role){
    const grid = document.getElementById('kpiGrid');
    if (!grid) return;
    // If driver, we show the driverOverview area instead, keep KPIs minimal/hidden
    grid.style.display = (role === 'driver') ? 'none' : 'grid';
    if (role === 'shipper'){
      grid.innerHTML = k('Active','kpiActive')+k('Awaiting bids','kpiAwaiting')+k('In transit','kpiTransit')+k('Wallet balance','kpiBalance');
      setText('#kpiActive','7'); setText('#kpiAwaiting','2'); setText('#kpiTransit','3'); setText('#kpiBalance','R 2,350.00');
    } else if (role === 'admin'){
      grid.innerHTML = k('Active loads','kpiA1')+k('KYC pending','kpiA2')+k('Disputes open','kpiA3')+k('Payouts pending','kpiA4');
      setText('#kpiA1','126'); setText('#kpiA2','9'); setText('#kpiA3','3'); setText('#kpiA4','14');
    }
    function k(label,id){ return `<div class="kpi"><p class="kpi-label">${label}</p><p class="kpi-value" id="${id}">0</p></div>`; }
  }

  // ---- Driver Overview logic ----
  function initDriverOverview(){
    // Seed next job + earnings
    setText('#nextJobStatus','Booked');
    setText('#nextJobRoute','CPT → Sandton');
    setText('#nextJobSlot','Fri 10:00–11:00 • Panel Van');
    setText('#earningsAmount','R 7,420');
    setText('#earningsGoalLabel','Goal R 10,000');
    const bar = document.getElementById('earningsBar'); if (bar) bar.style.width = '74%';

    // Quick actions
    bind('qaOpenMarket', ()=> scrollToSection('#market'));
    bind('qaMyJobs',     ()=> scrollToSection('#my-jobs'));
    bind('qaEarnings',   ()=> scrollToSection('#wallet'));

    // Next job actions
    bind('btnStartJob',  ()=> toast('Job started. GPS tracking enabled (demo).'));
    bind('btnUpdateEta', ()=> toast('ETA updated (demo).'));
    bind('btnMessage',   ()=> toast('Messaging opened (demo).'));
  }

  function bind(id, fn){ const el = document.getElementById(id); if (el) el.addEventListener('click', fn); }
  function scrollToSection(sel){ const el = document.querySelector(sel); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); }

  // Simple toast
  function toast(text){
    const t = document.createElement('div');
    t.textContent = text;
    t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:#0ea5e9;color:#fff;padding:.6rem 1rem;border-radius:.75rem;box-shadow:0 6px 20px rgba(2,132,199,.3);z-index:9999;font-weight:600';
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), 2000);
  }

  // ---- Tables + demo data (unchanged logic + admin sets) ----
  function badge(text, type='neutral'){
    const cls = type==='success'?'success': type==='warning'?'warning': type==='danger'?'danger':'';
    return `<span class="badge ${cls}">${text}</span>`;
  }
  function btn(label, action="#"){ return `<button class="btn btn-table" data-action="${action}">${label}</button>`; }
  function fillTable(sel, rows){
    const tbody = document.querySelector(`${sel} tbody`);
    if (!tbody) return;
    tbody.innerHTML = rows.length
      ? rows.map(r => `<tr>${r.map(td => `<td>${td}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="10" class="text-center text-slate-500 py-6">No records</td></tr>`;
  }

  function seedTables(role){
    // Wallet common
    fillTable('#walletTable', [
      ['2025-08-26', role==='driver'?'Payout':'Top-up', role==='driver'?'EN-1015':'TX-4421', role==='driver'?'R 3,200.00':'R 1,000.00', role==='driver'?'Processing':'Success'],
      ['2025-08-25', 'Escrow hold', 'EN-1017', 'R 900.00', 'Held'],
      ['2025-08-24', 'Top-up', 'TX-4408', 'R 1,350.00', 'Success'],
    ]);
    setText('#walletBalance', role==='driver'?'R 7,420.00':'R 2,350.00');
    setText('#walletEscrow','R 900.00');

    // Shipper
    fillTable('#loadsTable', role==='shipper' ? [
      ['EN-1024', 'Cape Town', 'Pretoria', '2025-09-02', badge('Awaiting bids','warning'), '3', btn('View')],
      ['EN-1017', 'Bellville', 'Sandton', '2025-08-30', badge('Booked','success'), '—', btn('Track')],
      ['EN-1015', 'Parow', 'Midrand', '2025-08-29', badge('In transit','warning'), '—', btn('Track')],
      ['EN-1009', 'Claremont', 'Stellenbosch', '2025-08-25', badge('Delivered','success'), '—', btn('POD')],
    ] : []);
    fillTable('#bidsTable', role==='shipper' ? [
      ['EN-1024', 'Zambezi Freight', 'R 6,200', 'Tomorrow 09:00', '4.8★', `${btn('Accept')} ${btn('Counter')}`],
      ['EN-1024', 'N1 Logistics', 'R 5,950', 'Tomorrow 11:00', '4.7★', `${btn('Accept')} ${btn('Counter')}`],
      ['EN-1024', 'Kasi Bakkies', 'R 5,600', 'Today 16:00', '4.2★', `${btn('Accept')} ${btn('Counter')}`],
    ] : []);

    // Driver
    fillTable('#marketTable', role==='driver' ? [
      ['EN-1031', 'CPT → JHB', '2025-09-03', 'Truck 14t', 'R 7,000', btn('Bid')],
      ['EN-1029', 'CPT → PTA', '2025-09-02', 'Truck 8t', 'R 6,200', btn('Bid')],
      ['EN-1028', 'CBD → Rondebosch', 'Today 14:00', 'Bakkie', 'R 520', btn('Bid')],
      ['EN-1026', 'Khayelitsha → Bellville', 'Instant', 'Scooter', 'R 120', btn('Bid')],
    ] : []);
    fillTable('#jobsTable', role==='driver' ? [
      ['EN-1017', 'CPT → Sandton', badge('Booked','success'), 'R 5,950', 'Fri 10:00–11:00', `${btn('Start')} ${btn('Message')}`],
      ['EN-1015', 'Parow → Midrand', badge('In transit','warning'), 'R 6,100', 'Today 11:00–12:00', `${btn('Update ETA')}`],
      ['EN-1009', 'Claremont → Stellenbosch', badge('Delivered','success'), 'R 1,200', 'Mon 15:00–16:00', `${btn('Upload POD')}`],
    ] : []);

    // Admin
    if (role==='admin'){
      fillTable('#opsTable', [
        ['EN-1035', 'Load', 'Mzansi Traders', 'National', badge('Awaiting bids','warning'), btn('Open')],
        ['EN-1032', 'Load', 'Kasi Kitchens', 'Metro', badge('In transit','warning'), btn('Open')],
        ['EN-1027', 'Job',  'N1 Logistics', 'City',  badge('Delivered','success'), btn('POD')],
      ]);
      fillTable('#verifTable', [
        ['Zambezi Freight','Driver/Company','Co. Reg, GIT, Roadworthy','Today 10:15', badge('Pending','warning'), `${btn('Approve')} ${btn('Reject')}`],
        ['Mzansi Traders','Shipper','Co. Reg, VAT','Yesterday', badge('Pending','warning'), `${btn('Approve')} ${btn('Reject')}`],
        ['Kasi Bakkies','Driver','PDP, Licence','2 days ago', badge('Pending','warning'), `${btn('Approve')} ${btn('Reject')}`],
      ]);
      fillTable('#disputesTable', [
        ['DSP-204','EN-1015','Mzansi ↔ N1 Logistics','Late arrival penalty','3h', btn('Review')],
        ['DSP-199','EN-1009','Claremont ↔ Kasi Bakkies','POD mismatch','1d', btn('Review')],
        ['DSP-195','EN-1004','QuickMart ↔ Zambezi','Damage claim','4d', btn('Review')],
      ]);
      fillTable('#payoutsTable', [
        ['N1 Logistics','7','R 23,400.00','FNB ****1234', badge('Queued','warning'), btn('Release')],
        ['Kasi Bakkies','11','R 9,820.00','Capitec ****7781', badge('Queued','warning'), btn('Release')],
        ['Zambezi Freight','4','R 12,100.00','ABSA ****4420', badge('Processing','success'), btn('Details')],
      ]);
    }
  }

})();


