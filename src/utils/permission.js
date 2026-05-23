import { REGULAR_USER_WRITE_MODULES, isAdminByPermissionCodes } from './module-ui';

export function hasWritePermission(moduleKey, permissionReady, permissionCodes) {
  if (!permissionReady) return true;
  if (isAdminByPermissionCodes(permissionCodes)) return true;
  return REGULAR_USER_WRITE_MODULES.has(moduleKey);
}

export function canCreateModuleRecord(moduleKey, permissionCodes) {
  if (moduleKey !== 'user') return true;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canBatchDeleteModuleRecord(moduleKey, permissionCodes) {
  if (moduleKey !== 'user') return true;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canDeleteModuleRecord(moduleKey, permissionCodes) {
  if (moduleKey !== 'user') return true;
  return isAdminByPermissionCodes(permissionCodes);
}

export function canEditModuleRecord(moduleKey, record, currentUser, permissionCodes) {
  if (moduleKey !== 'user') return true;
  if (isAdminByPermissionCodes(permissionCodes)) return true;
  return isOwnUserRecord(record, currentUser);
}

export function canInlineEditModuleRecord(moduleKey, record, currentUser, permissionCodes) {
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
