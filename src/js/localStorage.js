export function read() {
  try {
    return JSON.parse(localStorage.getItem('state'));
  } catch (e) {
    throw new Error('Error to load');
  }
}

export function save() {
  const body = document.querySelector('body');
  const bodyHTML = body.innerHTML;
  window.localStorage.setItem('state', JSON.stringify(bodyHTML));
}
