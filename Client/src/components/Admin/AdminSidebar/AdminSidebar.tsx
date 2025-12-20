import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronRight, FiChevronLeft, FiAlertCircle } from "react-icons/fi";
import { checkViewPermission } from "@Services/competency/authService";
import { rbacGroups, frameworks, mainMenu } from "./MenuItem";
import { Modal } from "@Components/Admin/Common/Modal/Modal";
import { AdminSidebarProps, MenuItemBase, Group } from "./AdminSidebarType";

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, mobileOpen, onToggle, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [loadingPaths, setLoadingPaths] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const allGroups = [...rbacGroups, ...frameworks];
    const newOpenSections: Record<string, boolean> = {};
    allGroups.forEach((group) => {
      if (group.items.some((item) => location.pathname === item.path)) {
        newOpenSections[group.key] = true;
      }
    });
    setOpenSections(newOpenSections);
  }, [location.pathname]);

  const handleNavigation = async (item: MenuItemBase) => {
    if (!item.resource) {
      navigate(item.path);
      onMobileClose();
      return;
    }

    setLoadingPaths((prev) => ({ ...prev, [item.path]: true }));

    try {
      const res = await checkViewPermission(item.resource);
      if (res.allowed) {
        navigate(item.path);
      } else {
        setModalState({ isOpen: true, message: "You do not have permission to access this page" });
      }
    } catch {
      setModalState({ isOpen: true, message: "An error occurred while checking permissions." });
    } finally {
      setLoadingPaths((prev) => ({ ...prev, [item.path]: false }));
      onMobileClose();
    }
  };

  const renderNavItem = (item: MenuItemBase, isNested = false) => {
    const isActive = location.pathname === item.path;

    const baseClasses = `flex items-center gap-2 w-full text-left transition-all duration-200 
      rounded-r-full rounded-l-none
      ${isActive ? "bg-primary text-white font-bold shadow-md shadow-primary/30" : "text-muted hover:bg-primary/10 hover:text-primary font-medium"}
      ${loadingPaths[item.path] ? "opacity-70 cursor-wait" : ""}`;

    const paddingClasses = isNested ? "pl-12 pr-4 py-2" : "pl-8 pr-5 py-3";

    return (
      <li key={item.path}>
        <button onClick={() => handleNavigation(item)} className={`${baseClasses} ${paddingClasses}`} disabled={loadingPaths[item.path]}>
          {item.icon && <span className={`${isNested ? "text-base" : "text-lg"}`}>{item.icon}</span>}
          <span className={isNested ? "text-sm" : ""}>{item.label}</span>
        </button>
      </li>
    );
  };

  const renderGroup = (group: Group) => (
    <li key={group.key}>
      <button
        type="button"
        onClick={() => setOpenSections((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
        className="flex items-center w-full gap-3 pl-8 pr-5 py-3 text-sm text-muted transition-colors rounded-r-full rounded-l-none hover:bg-primary/10 hover:text-primary"
      >
        <span className="text-lg text-primary">{group.icon}</span>
        <span className="flex-1 font-medium text-left">{group.title}</span>
        {openSections[group.key] ? <FiChevronDown /> : <FiChevronRight />}
      </button>

      {openSections[group.key] && <ul className="mt-1 space-y-1">{group.items.map((item) => renderNavItem(item, true))}</ul>}
    </li>
  );

  return (
    <>
      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, message: "" })}
        className="p-0 bg-surface text-main-text"
        actions={
          <button onClick={() => setModalState({ isOpen: false, message: "" })} className="px-6 py-2 font-medium text-white transition-all bg-primary rounded-md hover:bg-primary-hover">
            Close
          </button>
        }
      >
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <FiAlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-base text-center text-main-text md:text-lg">{modalState.message}</p>
        </div>
      </Modal>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden transition-all duration-300
          ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={onMobileClose}
      />

      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 bg-surface text-main-text transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${collapsed ? "w-20" : "w-64"} `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-end px-6 py-4 md:hidden">
            <button className="text-muted hover:text-primary transition-colors" onClick={onToggle}>
              <FiChevronLeft size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 pr-3 pl-0 mt-6 overflow-y-auto custom-scrollbar">
            {/* Main Menu */}
            <div className="mb-6">
              <p className={`pl-8 mb-3 text-xs font-bold tracking-widest text-muted/60 uppercase ${collapsed ? "text-center px-0" : ""}`}>{collapsed ? "Main" : "Main Menu"}</p>
              <ul className="space-y-1">{mainMenu.map((item) => renderNavItem(item))}</ul>
            </div>

            {/* RBAC Groups */}
            {rbacGroups.length > 0 && (
              <div className="mb-6">
                <p className={`px-5 mb-3 text-xs font-bold tracking-widest text-muted/60 uppercase ${collapsed ? "text-center" : ""}`}>{collapsed ? "Mng" : "Management"}</p>
                <ul className="space-y-1">{rbacGroups.map(renderGroup)}</ul>
              </div>
            )}

            {/* Frameworks */}
            <div>
              <p className={`px-5 mb-3 text-xs font-bold tracking-widest text-muted/60 uppercase ${collapsed ? "text-center" : ""}`}>{collapsed ? "Frame" : "Framework"}</p>
              <ul className="space-y-1">{frameworks.map(renderGroup)}</ul>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
