// ===============================
// Footer year
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
});

// ===============================
// Mobile menu logic
// ===============================
(function () {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (!btn || !menu) return;

  function openMenu() {
    menu.style.display = 'block';
    btn.setAttribute('aria-expanded', 'true');
    if (menuIcon) menuIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
    if (menuIcon) menuIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    const isOpen = menu.style.display === 'block';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when clicking a nav link
  menu.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  // Reset on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  });
})();

// ===============================
// Delivery type switching + placeholders + accordion
// ===============================
(function(){
  const form = document.getElementById('quickQuoteForm');
  if (!form) return;

  const note = document.getElementById('quickQuoteNote');
  const typeRadios = form.querySelectorAll('input[name="deliveryType"]');
  const vehicleRow = document.getElementById('vehicleRow');
  const crossWrap  = document.getElementById('crossBorderWrap');

  function applyType(type){
    // accordion open/close for cross-border fields
    if (type === 'crossborder') {
      crossWrap?.classList.add('open');
      crossWrap?.setAttribute('aria-hidden', 'false');
      vehicleRow?.classList.remove('hide');
    } else {
      crossWrap?.classList.remove('open');
      crossWrap?.setAttribute('aria-hidden', 'true');
      vehicleRow?.classList.remove('hide');
    }

    const pickup = form.elements['pickup'];
    const dropoff = form.elements['dropoff'];
    if (!pickup || !dropoff) return;

    if (type === 'metropolitan') {
      pickup.placeholder = 'Pickup address (within metro)';
      dropoff.placeholder = 'Drop-off address (within metro)';
    } else if (type === 'city') {
      pickup.placeholder = 'Pickup city & address';
      dropoff.placeholder = 'Destination city & address';
    } else if (type === 'national') {
      pickup.placeholder = 'Pickup (anywhere in country)';
      dropoff.placeholder = 'Destination (anywhere in country)';
    } else if (type === 'crossborder') {
      pickup.placeholder = 'Pickup address & country';
      dropoff.placeholder = 'Destination address & country';
    }
  }

  typeRadios.forEach(r => {
    r.addEventListener('change', () => {
      applyType(r.value);
      buildTimeWindows(); // lead-time depends on type
    });
    if (r.checked) applyType(r.value);
  });

  // Demo submit
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (note) note.textContent = 'Thanks! Please create an account or login to post a real load.';
  });
})();

// ===============================
// Date & 1-hour Time Window generation with lead-time rules
// Metropolitan => next 15 minutes
// City/National/Cross-border => now + 90 minutes (rounded to next 15)
// ===============================
(function(){
  const form = document.getElementById('quickQuoteForm');
  if (!form) return;

  const dateEl   = document.getElementById('collectDate');
  const windowEl = document.getElementById('collectWindow');
  const hintEl   = document.getElementById('timeHint');
  const typeRadios = form.querySelectorAll('input[name="deliveryType"]');

  const DAY_START = 6;   // 06:00
  const DAY_END   = 22;  // last slot ends 22:00 (21:00–22:00)

  function fmtDate(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function roundToNext15(date){
    const d = new Date(date);
    d.setSeconds(0,0);
    const mins = d.getMinutes();
    const remainder = (15 - (mins % 15)) % 15;
    d.setMinutes(mins + remainder);
    return d;
  }
  function addMinutes(date, mins){
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + mins);
    return d;
  }
  function selectedType(){
    const r = Array.from(typeRadios).find(x => x.checked);
    return r ? r.value : 'metropolitan';
  }
  function earliestStartToday(){
    const now = new Date();
    const type = selectedType();
    return (type === 'metropolitan') ? roundToNext15(now) : roundToNext15(addMinutes(now, 90));
  }
  function makeSlotLabel(h){
    const start = new Date();
    start.setHours(h, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours()+1);

    const fmt = (d)=>{
      let hr = d.getHours();
      const ampm = hr >= 12 ? 'pm' : 'am';
      hr = hr % 12 || 12;
      return `${hr}:00${ampm}`;
    };
    return `${fmt(start)} – ${fmt(end)}`;
  }

  function buildTimeWindows(){
    if (!dateEl || !windowEl) return;
    const chosenDate = dateEl.value || fmtDate(new Date());
    const isToday = chosenDate === fmtDate(new Date());

    // Clear options
    windowEl.innerHTML = '';

    // Compute minimum allowed start (today only)
    let minHH = DAY_START, minMM = 0;
    if (isToday) {
      const minDate = earliestStartToday();
      minHH = minDate.getHours();
      minMM = minDate.getMinutes();
      // Update hint
      if (hintEl) {
        const hr12 = (h)=>{
          const ampm = h >= 12 ? 'pm' : 'am';
          const h12 = (h % 12) || 12;
          return `${h12}:${String(minMM).padStart(2,'0')}${ampm}`;
        };
        hintEl.textContent = `(Earliest today: ${hr12(minHH)})`;
      }
    } else {
      if (hintEl) hintEl.textContent = '';
    }

    // Build slots from DAY_START to DAY_END-1 (1-hour each)
    for (let h = DAY_START; h < DAY_END; h++) {
      // Filter out slots that start before earliest allowed if today
      if (isToday) {
        if (h < minHH) continue;
        if (h === minHH && minMM > 0) continue; // e.g., earliest 11:15 → skip 11:00–12:00
      }
      const opt = document.createElement('option');
      opt.value = `${String(h).padStart(2,'0')}:00-${String(h+1).padStart(2,'0')}:00`;
      opt.textContent = makeSlotLabel(h);
      windowEl.appendChild(opt);
    }

    if (!windowEl.options.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No slots available today — choose another date';
      windowEl.appendChild(opt);
    }
  }

  // Init date min = today and default date
  const todayStr = fmtDate(new Date());
  if (dateEl) {
    dateEl.min = todayStr;
    if (!dateEl.value) dateEl.value = todayStr;
  }

  // Build on load and when date/type changes
  buildTimeWindows();
  dateEl?.addEventListener('change', buildTimeWindows);
  typeRadios.forEach(r => r.addEventListener('change', buildTimeWindows));
})();

// ===============================
// Optional file attachments preview
// ===============================
(function(){
  const input = document.getElementById('attachments');
  const list = document.getElementById('fileList');
  if (!input || !list) return;

  input.addEventListener('change', () => {
    list.innerHTML = '';
    const files = Array.from(input.files || []);
    if (!files.length) return;
    files.forEach(f => {
      const li = document.createElement('li');
      const kb = (f.size/1024).toFixed(1);
      li.textContent = `${f.name} (${kb} KB)`;
      list.appendChild(li);
    });
  });
})();
// Contact form: show/hide Company Name based on enquiry type
(function(){
  const select = document.getElementById('enquiryType');
  const companyWrap = document.getElementById('companyField');
  const companyInput = document.getElementById('companyName');
  if (!select || !companyWrap || !companyInput) return;

  function syncCompanyField(){
    const isCompany = select.value === 'company';
    companyWrap.classList.toggle('hide', !isCompany);
    companyInput.required = isCompany;
    if (!isCompany) companyInput.value = '';
  }
  // init + on change
  syncCompanyField();
  select.addEventListener('change', syncCompanyField);
})();

// Year in footer (already in your file)
// document.addEventListener('DOMContentLoaded', () => {
//   const y = document.getElementById('y');
//   if (y) y.textContent = new Date().getFullYear();
// });

// ====== Mobile menu logic (already in your file) ======
// ... (keep your existing mobile menu code)

// ====== Signup: role switching between Shipper and Driver ======
(function(){
  const roleRadios = document.querySelectorAll('#rolePills input[name="role"]');
  const shipperForm = document.getElementById('shipperForm');
  const driverForm  = document.getElementById('driverForm');
  if (!roleRadios.length || !shipperForm || !driverForm) return;

  function setRole(role){
    const isShipper = role === 'shipper';
    shipperForm.classList.toggle('hide', !isShipper);
    driverForm.classList.toggle('hide', isShipper);
  }
  roleRadios.forEach(r => {
    r.addEventListener('change', ()=> setRole(r.value));
    if (r.checked) setRole(r.value);
  });
})();

// ====== Shipper: company/individual toggles ======
(function(){
  const typeSel = document.getElementById('shipperType');
  const nameWrap = document.getElementById('shipperCompanyNameWrap');
  const idsWrap  = document.getElementById('shipperCompanyIds');
  const nameInput= document.getElementById('shipperCompanyName');
  if (!typeSel) return;

  function sync(){
    const isCo = typeSel.value === 'company';
    nameWrap.classList.toggle('hide', !isCo);
    idsWrap.classList.toggle('hide', !isCo);
    if (nameInput) nameInput.required = isCo;
    if (!isCo && nameInput) nameInput.value = '';
  }
  sync();
  typeSel.addEventListener('change', sync);
})();

// ====== Shipper: credit docs accordion ======
(function(){
  const creditSel = document.getElementById('creditApply');
  const col = document.getElementById('creditDocs');
  if (!creditSel || !col) return;
  function sync(){
    const open = creditSel.value === 'yes';
    col.classList.toggle('open', open);
    col.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  sync();
  creditSel.addEventListener('change', sync);
})();

// ====== Driver: company/individual toggles ======
(function(){
  const typeSel = document.getElementById('driverType');
  const nameWrap = document.getElementById('driverCompanyNameWrap');
  const nameInput= document.getElementById('driverCompanyName');
  if (!typeSel) return;

  function sync(){
    const isCo = typeSel.value === 'company';
    nameWrap.classList.toggle('hide', !isCo);
    if (nameInput) nameInput.required = isCo;
    if (!isCo && nameInput) nameInput.value = '';
  }
  sync();
  typeSel.addEventListener('change', sync);
})();

// ====== Select all / Clear all for checkbox groups ======
(function(){
  function setGroupChecked(groupName, checked){
    const group = document.querySelector(`[data-group="${groupName}"]`);
    if (!group) return;
    group.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = checked);
  }
  document.querySelectorAll('[data-select-all]').forEach(btn => {
    btn.addEventListener('click', () => setGroupChecked(btn.getAttribute('data-select-all'), true));
  });
  document.querySelectorAll('[data-clear-all]').forEach(btn => {
    btn.addEventListener('click', () => setGroupChecked(btn.getAttribute('data-clear-all'), false));
  });
})();
