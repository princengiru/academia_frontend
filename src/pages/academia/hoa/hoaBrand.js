export const HOA_PRODUCT_NAME = 'Gonaraza Academia';
export const HOA_PRODUCT_TAGLINE = 'Head of Academia workspace';
export const HOA_BRAND_SHORT = 'Gonaraza.com';

export const HOA_PAGE_TITLES = {
  index: 'Dashboard',
  learners: 'Learners',
  tutors: 'Tutors',
  reports: 'Reports',
  finance: 'Finance',
  settings: 'Settings',
  account: 'Account',
  assignments: 'Assignments',
  'passed-courses': 'Passed Courses',
  'retaken-courses': 'Retaken Courses',
  'failed-courses': 'Failed Courses',
  syllabus: 'Syllabus',
  'online-courses': 'Online Courses',
  projects: 'Projects',
  certificates: 'Certificates',
  'events-planning': 'Events & Planning',
  'e-travel': 'E-Travel',
  'terms-conditions': 'Terms & Conditions',
  community: 'Community',
};

export function hoaPageTitle(pageLabel) {
  return pageLabel ? `${pageLabel} | ${HOA_PRODUCT_NAME}` : HOA_PRODUCT_NAME;
}

export function resolveHoaCurrentPage(pathname = '') {
  const path = pathname.replace(/\/$/, '');

  if (path === '/hoa') return 'index';
  if (path.startsWith('/hoa/')) {
    const slug = path.slice('/hoa/'.length).split('/')[0];
    return HOA_PAGE_TITLES[slug] ? slug : slug || 'index';
  }

  return 'index';
}

export function getHoaPageLabel(pageKey) {
  return HOA_PAGE_TITLES[pageKey] || 'HOA';
}
