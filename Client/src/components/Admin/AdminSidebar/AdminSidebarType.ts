export interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export interface MenuItemBase {
  label: string;
  path: string;
  icon?: React.ReactNode;
  resource?: string;
}

export interface Group {
  title: string;
  icon: React.ReactNode;
  key: string;
  items: MenuItemBase[];
}
