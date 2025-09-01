(() => {
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');
  if (!btn || !menu) return;

  const open = () => {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded','true');
    if (menuIcon) menuIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded','false');
    if (menuIcon) menuIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
  };

  btn.addEventListener('click', () => (menu.classList.contains('hidden') ? open() : close()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  menu.querySelectorAll('.mobile-nav-link').forEach(a => a.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) close(); });
})();
 (function(){
    var el = document.getElementById('yr');
    if (el) el.textContent = new Date().getFullYear();
  })();

