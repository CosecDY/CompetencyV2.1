import React, { useState, useEffect, useCallback } from "react";
import { AdminSidebar, AdminNavbar } from "@Components/Admin/ExportComponent";
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="font-sans flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} onToggle={toggleSidebar} onMobileClose={() => setMobileOpen(false)} />

      {/* Main panel */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? "md:pl-16" : "md:pl-64"}`}
      >
        {/* Navbar */}
        <AdminNavbar
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) toggleMobile();
            else toggleSidebar();
          }}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto pt-16 px-2 sm:px-4 lg:px-6 relative z-0">
          <div className="bg-white shadow  p-6 min-h-[calc(100vh-4rem)]">{children}</div>
        </main>
      </div>
    </div>
  );
};
