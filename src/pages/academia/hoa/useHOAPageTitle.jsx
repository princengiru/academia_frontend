import { useEffect } from 'react';
import { hoaPageTitle, HOA_PRODUCT_NAME } from './hoaBrand';

export function useHOAPageTitle(pageLabel) {
  useEffect(() => {
    document.title = hoaPageTitle(pageLabel);
    return () => {
      document.title = HOA_PRODUCT_NAME;
    };
  }, [pageLabel]);
}
