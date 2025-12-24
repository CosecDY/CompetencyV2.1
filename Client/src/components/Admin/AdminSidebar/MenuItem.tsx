import { FiHome, FiUsers, FiLock, FiCopy, FiBarChart2, FiKey } from "react-icons/fi";
import { MenuItemBase, Group } from "./AdminSidebarType";
import { Resource } from "@Constants/resources";

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
      { label: "Assets", path: "/admin/assets", resource: Resource.Asset },
      { label: "Asset Instances", path: "/admin/asset-instances", resource: Resource.AssetInstance },
      { label: "Operations", path: "/admin/operations", resource: Resource.Operation },
      { label: "Permissions", path: "/admin/permissions", resource: Resource.Permission },
      { label: "Role Permissions", path: "/admin/role-permissions", resource: Resource.RolePermission },
      { label: "Roles", path: "/admin/roles", resource: Resource.Role },
      { label: "User Asset Instances", path: "/admin/user-asset-instances", resource: Resource.UserAssetInstance },
      { label: "User Roles", path: "/admin/user-roles", resource: Resource.UserRole },
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
      { label: "Categories", path: "/admin/sfia/category", resource: Resource.SfiaCategory },
      { label: "SubCategories", path: "/admin/sfia/subcategory", resource: Resource.SfiaSubcategory },
      { label: "Skills", path: "/admin/sfia/skill", resource: Resource.SfiaSkill },
      { label: "SubSkill", path: "/admin/sfia/subskill", resource: Resource.SfiaSubSkill },
      { label: "Levels", path: "/admin/sfia/level", resource: Resource.SfiaLevel },
      { label: "Descriptions", path: "/admin/sfia/description", resource: Resource.SfiaDescription },
      { label: "Information", path: "/admin/sfia/information", resource: Resource.SfiaInformation },
      { label: "SFIA Summary", path: "/admin/sfia/sfiasummary", resource: Resource.SfiaSummary },
    ],
  },
  {
    title: "TPQI",
    icon: <FiCopy />,
    key: "tpqi",
    items: [
      { label: "Sector", path: "/admin/tpqi/sector", resource: Resource.TpqiSector },
      { label: "Career", path: "/admin/tpqi/career", resource: Resource.TpqiCareer },
      { label: "Career Level", path: "/admin/tpqi/careerlevel", resource: Resource.TpqiCareerLevel },
      { label: "Level", path: "/admin/tpqi/level", resource: Resource.TpqiLevel },

      { label: "Knowledge", path: "/admin/tpqi/knowledge", resource: Resource.TpqiKnowledge },
      { label: "Skill", path: "/admin/tpqi/skill", resource: Resource.TpqiSkill },
      { label: "Unit Code", path: "/admin/tpqi/unitcode", resource: Resource.TpqiUnitCode },
      { label: "Occupational", path: "/admin/tpqi/occupational", resource: Resource.TpqiOccupational },

      // Relations / Details
      { label: "CareerLevel Detail", path: "/admin/tpqi/cldetail", resource: Resource.TpqiCareerLevelDetail },
      { label: "CareerLevel Knowledge", path: "/admin/tpqi/clknowledge", resource: Resource.TpqiCareerLevelKnowledge },
      { label: "CareerLevel Skill", path: "/admin/tpqi/clskill", resource: Resource.TpqiCareerLevelSkill },
      { label: "CareerLevel Unit Code", path: "/admin/tpqi/clunitcode", resource: Resource.TpqiCareerLevelUnitCode },

      { label: "Unit Occupational", path: "/admin/tpqi/unitoccupational", resource: Resource.TpqiUnitOccupational },
      { label: "Unit Sector", path: "/admin/tpqi/unitsector", resource: Resource.TpqiUnitSector },

      // User Records
      { label: "User Knowledge", path: "/admin/tpqi/userknowledge", resource: Resource.TpqiUserKnowledge },
      { label: "User Skill", path: "/admin/tpqi/userskill", resource: Resource.TpqiUserSkill },
    ],
  },
];
