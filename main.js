document.addEventListener('DOMContentLoaded', function () {
  // ===== Mobile Menu Toggle =====
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });
  }

  // ===== Smooth Scroll =====
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== Delivery Form Submission =====
  const deliveryForm = document.getElementById('deliveryForm');
  const deliverySuccess = document.getElementById('successMessage');

  if (deliveryForm) {
    deliveryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputs = deliveryForm.querySelectorAll('input, select, textarea');
      let valid = true;
      inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) valid = false;
      });

      if (!valid) {
        alert('Please fill in all required fields.');
        return;
      }

      deliverySuccess.classList.remove('hidden');
      deliveryForm.reset();
      window.scrollTo({ top: deliverySuccess.offsetTop - 100, behavior: 'smooth' });
    });
  }

  // ===== Driver Signup Form =====
  const driverForm = document.getElementById('driverForm');
  const driverSuccess = document.getElementById('driverSuccessMessage');
  const submitBtn = driverForm ? driverForm.querySelector('button[type="submit"]') : null;
  const fileInputs = driverForm ? driverForm.querySelectorAll('input[type="file"]') : [];

  if (driverForm) {
    submitBtn.disabled = false;

    // File validation
    fileInputs.forEach(input => {
      input.addEventListener('change', function () {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        const maxSizeMB = 5;
        const file = this.files[0];

        if (!file) return;

        if (!allowedTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}`);
          this.value = '';
        } else if (file.size / 1024 / 1024 > maxSizeMB) {
          alert(`File too large (max ${maxSizeMB}MB): ${file.name}`);
          this.value = '';
        }
      });
    });

    driverForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const inputs = driverForm.querySelectorAll('input[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value) valid = false;
      });

      const dayChecked = driverForm.querySelectorAll('input[name="availableDays"]:checked').length;
      if (!dayChecked) valid = false;

      if (!valid) {
        alert('Please complete all required fields, upload all documents, and select your available days.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      setTimeout(() => {
        driverSuccess.classList.remove('hidden');
        driverForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
        window.scrollTo({ top: driverSuccess.offsetTop - 100, behavior: 'smooth' });
      }, 1000);
    });
  }

  // ===== Tracking Form =====
  const trackingResults = document.getElementById('trackingResults');
  const trackingError = document.getElementById('trackingError');
  const displayTrackingId = document.getElementById('displayTrackingId');
  const progressBar = document.getElementById('progressBar');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step1Time = document.getElementById('step1Time');
  const step2Time = document.getElementById('step2Time');
  const step3Time = document.getElementById('step3Time');
  const statusMessage = document.getElementById('statusMessage');
  const pickupInfo = document.getElementById('pickupInfo');
  const deliveryInfo = document.getElementById('deliveryInfo');
  const trackAnotherBtn = document.getElementById('trackAnotherBtn');
  const tryAgainBtn = document.getElementById('tryAgainBtn');

  const deliveries = {
    "EXP123456": { pickup: "123 Main Street, Cape Town", delivery: "456 Market Street, Cape Town", status: ["Picked Up", "In Transit", "Delivered"], times: ["08:15", "10:30", "12:00"] },
    "EXP789012": { pickup: "789 Long Street, Cape Town", delivery: "321 Short Street, Cape Town", status: ["Picked Up", "In Transit"], times: ["09:00", "11:15"] },
    "EXP345678": { pickup: "12 Loop Street, Cape Town", delivery: "99 Hill Street, Cape Town", status: ["Picked Up"], times: ["07:45"] }
  };

  function resetProgress() {
    progressBar.style.width = "0%";
    [step1, step2, step3].forEach((step, i) => {
      step.classList.replace('bg-cyan-500', 'bg-white');
      step.querySelector('svg').classList.replace('text-white', 'text-gray-400');
      [step1Time, step2Time, step3Time][i].textContent = "--:--";
    });
    statusMessage.querySelector('p:first-child').textContent = "Preparing for pickup...";
    statusMessage.querySelector('p:last-child').textContent = "Your delivery request is being processed.";
  }

  function showTracking(id) {
    resetProgress();
    if (deliveries[id]) {
      const data = deliveries[id];
      trackingResults.classList.remove('hidden');
      trackingError.classList.add('hidden');
      displayTrackingId.textContent = id;
      pickupInfo.textContent = data.pickup;
      deliveryInfo.textContent = data.delivery;

      data.status.forEach((step, index) => {
        if (index === 0) { step1.classList.replace('bg-white', 'bg-cyan-500'); step1.querySelector('svg').classList.replace('text-gray-400', 'text-white'); step1Time.textContent = data.times[index]; }
        if (index === 1) { step2.classList.replace('bg-white', 'bg-cyan-500'); step2.querySelector('svg').classList.replace('text-gray-400', 'text-white'); step2Time.textContent = data.times[index]; }
        if (index === 2) { step3.classList.replace('bg-white', 'bg-cyan-500'); step3.querySelector('svg').classList.replace('text-gray-400', 'text-white'); step3Time.textContent = data.times[index]; }
      });

      let width = (data.status.length === 1 ? 33 : data.status.length === 2 ? 66 : 100);
      progressBar.style.width = width + "%";

      const lastStatus = data.status[data.status.length-1];
      statusMessage.querySelector('p:first-child').textContent = lastStatus + "...";
      statusMessage.querySelector('p:last-child').textContent = "Your delivery request is being processed.";
    } else {
      trackingResults.classList.add('hidden');
      trackingError.classList.remove('hidden');
    }
  }

  document.querySelectorAll('.sample-id').forEach(btn => {
    btn.addEventListener('click', () => showTracking(btn.dataset.id));
  });

  if (trackAnotherBtn) trackAnotherBtn.addEventListener('click', () => trackingResults.classList.add('hidden'));
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', () => trackingError.classList.add('hidden'));

  const trackingForm = document.getElementById('trackingForm');
  if (trackingForm) {
    trackingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = trackingForm.querySelector('input[name="trackingId"]').value.trim();
      showTracking(id);
    });
  }
});

