import { MODULE_LAYOUT_CONFIG, isAdminByPermissionCodes } from './module-ui';

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function moduleAliases(moduleKey) {
  const aliases = MODULE_LAYOUT_CONFIG.permissionAliases?.[moduleKey];
  if (Array.isArray(aliases) && aliases.length > 0) return aliases;
  return [moduleToUpperSnake(moduleKey)];
}

function hasModuleWriteCode(moduleKey, permissionCodes) {
  const codeSet = new Set(
    (Array.isArray(permissionCodes) ? permissionCodes : [])
      .map((item) => String(item || '').trim())
      .filter(Boolean),
  );
  const aliases = moduleAliases(moduleKey);
  return aliases.some((alias) => codeSet.has(`DATA_${alias}_WRITE`));
}

export function hasWritePermission(moduleKey, permissionReady, permissionCodes) {
  if (!permissionReady) return true;
  if (isAdminByPermissionCodes(permissionCodes)) return true;
  return hasModuleWriteCode(moduleKey, permissionCodes);
}

export function canCreateModuleRecord(moduleKey, permissionCodes) {
  if (moduleKey === 'stockRecord' || moduleKey === 'priceRecord' || moduleKey === 'operateLog') return false;
  if (moduleKey !== 'user') return true;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canBatchDeleteModuleRecord(moduleKey, permissionCodes) {
  if (!moduleKey) return false;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canDeleteModuleRecord(moduleKey, permissionCodes) {
  if (!moduleKey) return false;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canEditModuleRecord(moduleKey, record, currentUser, permissionCodes) {
  if (moduleKey === 'stockRecord' || moduleKey === 'priceRecord' || moduleKey === 'operateLog') return false;
  if (moduleKey !== 'user') return true;
  if (isAdminByPermissionCodes(permissionCodes)) return true;
  return isOwnUserRecord(record, currentUser);
}

export function canInlineEditModuleRecord(moduleKey, record, currentUser, permissionCodes) {
  if (moduleKey === 'stockRecord' || moduleKey === 'priceRecord' || moduleKey === 'operateLog') return false;
  if (moduleKey !== 'user') {
    return canEditModuleRecord(moduleKey, record, currentUser, permissionCodes);
  }
  return isAdminByPermissionCodes(permissionCodes) && canEditModuleRecord(moduleKey, record, currentUser, permissionCodes);
}

export function isOwnUserRecord(record, currentUser) {
  const self = String(currentUser || '').trim();
  if (!self) return false;
  const candidates = [record?.username, record?.userName, record?.loginName, record?.account];
  return candidates.some((name) => String(name || '').trim() === self);
}
