const button = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-nav');
const mobile = window.matchMedia('(max-width: 767px)');

function setOpen(open) {
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('span').textContent = open ? '閉じる' : 'メニュー';
  navigation.hidden = mobile.matches && !open;
}

function updateViewport() {
  const focusedInNav = navigation.contains(document.activeElement);
  button.hidden = !mobile.matches;
  setOpen(false);
  if (mobile.matches && focusedInNav) button.focus();
}

button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobile.matches && button.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    button.focus();
  }
});
mobile.addEventListener('change', updateViewport);
updateViewport();
