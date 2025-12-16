import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to the top of the page whenever the route changes.
 * This ensures users always start at the top when navigating to a new page.
 *
 * Features:
 * - Smooth scrolling animation
 * - Triggers on route change
 * - Zero visual footprint (renders nothing)
 *
 * @component
 * @example
 * ```tsx
 * <BrowserRouter>
 *   <ScrollToTop />
 *   <Routes>
 *     // Your routes here
 *   </Routes>
 * </BrowserRouter>
 * ```
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Smooth scrolling animation
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
