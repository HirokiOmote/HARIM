const navigation = document.querySelector('.navigation');
const button = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const mobile = window.matchMedia('(max-width: 1023px)');

function closeMenu(returnFocus = false) {
  menu.hidden = mobile.matches;
  button.setAttribute('aria-expanded', 'false');
  if (returnFocus) button.focus();
}

function adaptMenu() {
  const focusWasInMenu = menu.contains(document.activeElement);
  button.hidden = !mobile.matches;
  closeMenu(mobile.matches && focusWasInMenu);
}

navigation.classList.add('is-enhanced');
adaptMenu();
mobile.addEventListener('change', adaptMenu);
button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
});
menu.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!navigation.contains(event.target)) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!navigation.contains(event.target)) closeMenu();
});
