import { useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { NavItem } from "../types";

export const useNavigation = (isLoggedIn: boolean, role?: string) => {
  const location = useLocation();

  const NAV_ITEMS: NavItem[] = useMemo(() => {
    const baseItems: NavItem[] = [
      { name: "Home", path: "/home" },
      { name: "Search", path: "/results" },
      { name: "About", path: "/about" },
    ];

    if (isLoggedIn) {
      baseItems.push({ name: "Profile", path: "/profile" });
      baseItems.push({ name: "Portfolio", path: "/portfolio" });

      if (role === "Admin") {
        baseItems.push({
          name: "Admin Panel",
          path: "/admin/dashboard",
          className: "text-red-600 font-bold hover:text-red-700",
        });
      }
    }

    return baseItems;
  }, [isLoggedIn, role]);

  const isActiveNavItem = useCallback((itemPath: string) => location.pathname === itemPath, [location.pathname]);

  return {
    NAV_ITEMS,
    isActiveNavItem,
  };
};
