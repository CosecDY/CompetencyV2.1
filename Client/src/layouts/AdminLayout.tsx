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
    <div className="theme-admin font-sans flex h-screen overflow-hidden bg-background text-main-text">
      {/* Sidebar Section */}
      <AdminSidebar collapsed={sidebarCollapsed} mobileOpen={mobileOpen} onToggle={toggleSidebar} onMobileClose={() => setMobileOpen(false)} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out 
          ${sidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}
      >
        {/* Navbar Section */}
        <AdminNavbar
          collapsed={sidebarCollapsed}
          onToggleSidebar={() => {
            if (window.innerWidth < 768) toggleMobile();
            else toggleSidebar();
          }}
        />

        <main className="flex-1 overflow-auto pt-16 relative z-0 custom-scrollbar flex flex-col">
          <div className="bg-surface p-4 sm:p-6 transition-all flex-1 shadow-sm">
            <div className="max-w-[1600px] mx-auto w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};
