const navigationState = new Map();

export function setNavigationState(key, value) {
  const stateKey = String(key || '').trim();
  if (!stateKey) return;
  if (value === undefined || value === null || String(value).trim() === '') {
    navigationState.delete(stateKey);
    return;
  }
  navigationState.set(stateKey, String(value));
}

export function getNavigationState(key) {
  const stateKey = String(key || '').trim();
  if (!stateKey) return '';
  return navigationState.get(stateKey) || '';
}

export function takeNavigationState(key) {
  const stateKey = String(key || '').trim();
  if (!stateKey) return '';
  const value = navigationState.get(stateKey) || '';
  navigationState.delete(stateKey);
  return value;
}

export function clearNavigationState(key) {
  const stateKey = String(key || '').trim();
  if (!stateKey) return;
  navigationState.delete(stateKey);
}
