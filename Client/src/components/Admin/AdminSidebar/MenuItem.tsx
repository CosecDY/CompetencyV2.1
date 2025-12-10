import { FiHome, FiUsers, FiLock, FiCopy, FiBarChart2, FiKey } from "react-icons/fi";
import { MenuItemBase, Group } from "./AdminSidebarType";

// Main menu
export const mainMenu: MenuItemBase[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
  { label: "Logs", path: "/admin/logs", icon: <FiBarChart2 /> },
  { label: "Session Management", path: "/admin/session", icon: <FiLock /> },
  { label: "Users", path: "/admin/users", icon: <FiUsers /> },
  { label: "Database Backup", path: "/admin/backup", icon: <FiCopy /> },
];

// RBAC groups
export const rbacGroups: Group[] = [
  {
    title: "RBAC",
    icon: <FiKey />,
    key: "rbac",
    items: [
      { label: "Assets", path: "/admin/assets", resource: "Asset" },
      { label: "Asset Instances", path: "/admin/asset-instances", resource: "AssetInstance" },
      { label: "Operations", path: "/admin/operations", resource: "Operation" },
      { label: "Permissions", path: "/admin/permissions", resource: "Permission" },
      { label: "Role Permissions", path: "/admin/role-permissions", resource: "RolePermission" },
      { label: "Roles", path: "/admin/roles", resource: "Role" },
      { label: "User Asset Instances", path: "/admin/user-asset-instances", resource: "UserAssetInstance" },
      { label: "User Roles", path: "/admin/user-roles", resource: "UserRole" },
    ],
  },
];

// Frameworks groups
export const frameworks: Group[] = [
  {
    title: "SFIA",
    icon: <FiBarChart2 />,
    key: "sfia",
    items: [
      { label: "Categories", path: "/admin/sfia/category", resource: "Category" },
      { label: "Descriptions", path: "/admin/sfia/description", resource: "Description" },
      { label: "Levels", path: "/admin/sfia/level", resource: "Level" },
      { label: "Skills", path: "/admin/sfia/skill", resource: "Skill" },
      { label: "SubCategories", path: "/admin/sfia/subcategory", resource: "Subcategory" },
      { label: "SFIA Summary", path: "/admin/sfia/sfiasummary", resource: "SFIAsummary" },
      { label: "Information", path: "/admin/sfia/information", resource: "Information" },
      { label: "SubSkill", path: "/admin/sfia/subskill", resource: "SubSkill" },
    ],
  },
  {
    title: "TPQI",
    icon: <FiCopy />,
    key: "tpqi",
    items: [
      { label: "Career", path: "/admin/tpqi/career", resource: "Career" },
      { label: "Career Level", path: "/admin/tpqi/careerlevel", resource: "CareerLevel" },
      { label: "CareerLevel Detail", path: "/admin/tpqi/cldetail", resource: "ClDetail" },
      { label: "CareerLevel Knowledge", path: "/admin/tpqi/clknowledge", resource: "ClKnowledge" },
      { label: "CareerLevel Skill", path: "/admin/tpqi/clskill", resource: "ClSkill" },
      { label: "CareerLevel Unit Code", path: "/admin/tpqi/clunitcode", resource: "ClUnitCode" },
      { label: "Knowledge", path: "/admin/tpqi/knowledge", resource: "Knowledge" },
      { label: "Level", path: "/admin/tpqi/level", resource: "Level" },
      { label: "Occupational", path: "/admin/tpqi/occupational", resource: "Occupational" },
      { label: "Sector", path: "/admin/tpqi/sector", resource: "Sector" },
      { label: "Skill", path: "/admin/tpqi/skill", resource: "Skill" },
      { label: "TPQI Summary", path: "/admin/tpqi/tpqisummary", resource: "TPQISummary" },
      { label: "Unit Code", path: "/admin/tpqi/unitcode", resource: "UnitCode" },
      { label: "Unit Knowledge", path: "/admin/tpqi/unitknowledge", resource: "UnitKnowledge" },
      { label: "Unit Occupational", path: "/admin/tpqi/unitoccupational", resource: "UnitOccupational" },
      { label: "Unit Sector", path: "/admin/tpqi/unitsector", resource: "UnitSector" },
      { label: "Unit Skill", path: "/admin/tpqi/unitskill", resource: "UnitSkill" },
      { label: "User Knowledge", path: "/admin/tpqi/userknowledge", resource: "UserKnowledge" },
      { label: "User Skill", path: "/admin/tpqi/userskill", resource: "UserSkill" },
    ],
  },
];
