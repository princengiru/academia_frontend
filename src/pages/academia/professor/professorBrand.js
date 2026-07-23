export const PROFESSOR_PRODUCT_NAME = 'Gonaraza Academia';
export const PROFESSOR_PRODUCT_TAGLINE = 'Create courses, assess learners, and grow';

export function professorPageTitle(pageLabel) {
  return pageLabel ? `${pageLabel} | ${PROFESSOR_PRODUCT_NAME}` : PROFESSOR_PRODUCT_NAME;
}

export function resolveProfessorCurrentPage(pathname = '') {
  const path = pathname.replace(/\/$/, '');

  if (path === '/professor') return 'index';
  if (path.startsWith('/professor/assignments')) return 'assignments';
  if (path.startsWith('/professor/projects') || path.startsWith('/professor/view-project')) return 'projects';
  if (path.startsWith('/professor/performance')) return 'performance';
  if (path.startsWith('/professor/earnings')) return 'earnings';
  if (path.startsWith('/professor/management') || path.startsWith('/professor/prepare-')) return 'management';
  if (path.startsWith('/professor/settings')) return 'settings';
  if (path.startsWith('/professor/account')) return 'account';

  return '';
}
