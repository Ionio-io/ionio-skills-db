/**
 * Department identity colours.
 *
 * Each department takes a categorical slot by its position in the catalog (which
 * is alphabetical and stable), so a department keeps its colour everywhere. Past
 * the eighth, departments share the neutral "other" colour rather than inventing
 * new hues, as the dataviz palette requires.
 */
import type { DepartmentSummary } from '@ionio-skills/core/types';

const SLOTS = 8;

export function departmentColor(id: string, departments: readonly Pick<DepartmentSummary, 'id'>[]): string {
  const index = departments.findIndex((department) => department.id === id);
  return index >= 0 && index < SLOTS ? `var(--dept-${index + 1})` : 'var(--dept-other)';
}
