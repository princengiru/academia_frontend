export const ACADEMIA_PRODUCT_NAME = 'Gonaraza Academia';

export function academiaPageTitle(pageLabel) {
  return pageLabel ? `${pageLabel} | ${ACADEMIA_PRODUCT_NAME}` : ACADEMIA_PRODUCT_NAME;
}
