import { useEffect } from 'react';
import { academiaPageTitle, ACADEMIA_PRODUCT_NAME } from './publicBrand';

export function usePublicPageTitle(pageLabel) {
  useEffect(() => {
    document.title = academiaPageTitle(pageLabel);
    return () => {
      document.title = ACADEMIA_PRODUCT_NAME;
    };
  }, [pageLabel]);
}
