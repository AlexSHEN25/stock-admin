export function hasActiveFilters(queryFields, queryState) {
  return (queryFields || []).some((field) => {
    const value = queryState?.[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'number') return true;
    return String(value).trim() !== '';
  });
}
