export const PROFESSOR_PRODUCT_NAME = 'Gonaraza Academia';
export const PROFESSOR_PRODUCT_TAGLINE = 'Create courses, assess learners, and grow';

export function professorPageTitle(pageLabel) {
  return pageLabel ? `${pageLabel} | ${PROFESSOR_PRODUCT_NAME}` : PROFESSOR_PRODUCT_NAME;
}

export function resolveProfessorCurrentPage(pathname = '') {
  const path = pathname.replace(/\/$/, '');

  if (path === '/academia/professor') return 'index';
  if (path.startsWith('/academia/professor/assignments')) return 'assignments';
  if (path.startsWith('/academia/professor/projects') || path.startsWith('/academia/professor/view-project')) return 'projects';
  if (path.startsWith('/academia/professor/performance')) return 'performance';
  if (path.startsWith('/academia/professor/earnings')) return 'earnings';
  if (path.startsWith('/academia/professor/management') || path.startsWith('/academia/professor/prepare-')) return 'management';
  if (path.startsWith('/academia/professor/settings')) return 'settings';
  if (path.startsWith('/academia/professor/account')) return 'account';

  return '';
}
