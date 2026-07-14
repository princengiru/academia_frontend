export const LEARNER_PRODUCT_NAME = 'Gonaraza Academia';
export const LEARNER_PRODUCT_TAGLINE = 'Learn, assess, and earn certificates';

export function learnerPageTitle(pageLabel) {
  return pageLabel ? `${pageLabel} | ${LEARNER_PRODUCT_NAME}` : LEARNER_PRODUCT_NAME;
}
