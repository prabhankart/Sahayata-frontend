import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page on route change
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array ensures this runs only when the path changes

  return null; // This component does not render anything
}

export default ScrollToTop;