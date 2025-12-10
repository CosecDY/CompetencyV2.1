import * as ExportPages from "@Pages/ExportPages";
export interface RouteItem {
  path: string;
  element: React.ReactNode;
  resource?: string;
  allowedRoles: string[];
}

// Helper constants
const ALL_ADMINS = ["Admin", "SuperAdmin"];
const SUPER_ONLY = ["SuperAdmin"];

export const adminRoutes: RouteItem[] = [
  { path: "/dashboard", element: <ExportPages.DashboardPage />, resource: "Dashboard", allowedRoles: ALL_ADMINS },
  { path: "/users", element: <ExportPages.UserPage />, resource: "User", allowedRoles: ALL_ADMINS },
  { path: "/logs", element: <ExportPages.LogPage />, resource: "Log", allowedRoles: SUPER_ONLY },
  { path: "/session", element: <ExportPages.SessionPage />, resource: "Session", allowedRoles: SUPER_ONLY },
  { path: "/backup", element: <ExportPages.BackupPage />, resource: "Backup", allowedRoles: SUPER_ONLY },

  // RBAC Management
  { path: "/roles", element: <ExportPages.RolePage />, resource: "Role", allowedRoles: SUPER_ONLY },
  { path: "/role-permissions", element: <ExportPages.RolePermissionManager />, resource: "RolePermission", allowedRoles: SUPER_ONLY },
  { path: "/permissions", element: <ExportPages.PermissionPage />, resource: "Permission", allowedRoles: SUPER_ONLY },
  { path: "/operations", element: <ExportPages.OperationPage />, resource: "Operation", allowedRoles: SUPER_ONLY },
  { path: "/user-roles", element: <ExportPages.UserRoleAssignmentPage />, resource: "UserRole", allowedRoles: SUPER_ONLY },

  { path: "/sfia/category", element: <ExportPages.CategoryPage />, resource: "Category", allowedRoles: ALL_ADMINS },
  { path: "/sfia/level", element: <ExportPages.LevelPage />, resource: "Level", allowedRoles: ALL_ADMINS },
  { path: "/sfia/subcategory", element: <ExportPages.SubcategoryPage />, resource: "Subcategory", allowedRoles: ALL_ADMINS },
  { path: "/sfia/description", element: <ExportPages.DescriptionPage />, resource: "Description", allowedRoles: ALL_ADMINS },
  { path: "/sfia/sfiasummary", element: <ExportPages.SFIASummaryPage />, resource: "SFIASummary", allowedRoles: ALL_ADMINS },
  { path: "/sfia/skill", element: <ExportPages.SFIASkillPage />, resource: "Skill", allowedRoles: ALL_ADMINS },
  { path: "/sfia/information", element: <ExportPages.InformationPage />, resource: "Information", allowedRoles: ALL_ADMINS },
  { path: "/sfia/subskill", element: <ExportPages.SubSkillPage />, resource: "SubSkill", allowedRoles: ALL_ADMINS },

  // ==============================
  // TPQI (Admin + SuperAdmin)
  // ==============================
  { path: "/tpqi/career", element: <ExportPages.CareerPage />, resource: "Career", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/skill", element: <ExportPages.SkillPage />, resource: "Skill", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/sector", element: <ExportPages.SectorPage />, resource: "Sector", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/occupational", element: <ExportPages.OccupationalPage />, resource: "Occupational", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/knowledge", element: <ExportPages.KnowledgePage />, resource: "Knowledge", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/unitcode", element: <ExportPages.UnitCodePage />, resource: "UnitCode", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/level", element: <ExportPages.TPQILevelPage />, resource: "Level", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/clknowledge", element: <ExportPages.ClKnowledgePage />, resource: "ClKnowledge", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/cldetail", element: <ExportPages.ClDetailPage />, resource: "ClDetail", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/careerlevel", element: <ExportPages.CareerLevelPage />, resource: "CareerLevel", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/clskill", element: <ExportPages.ClSkillPage />, resource: "ClSkill", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/clunitcode", element: <ExportPages.ClUnitCodePage />, resource: "ClUnitCode", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/unitoccupational", element: <ExportPages.UnitOccupationalPage />, resource: "UnitOccupational", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/unitsector", element: <ExportPages.UnitSectorPage />, resource: "UnitSector", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/userskill", element: <ExportPages.UserSkillPage />, resource: "UserSkill", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/userknowledge", element: <ExportPages.UserKnowledgePage />, resource: "UserKnowledge", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/tpqisummary", element: <ExportPages.TpqiSummaryPage />, resource: "TPQISummary", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/unitskill", element: <ExportPages.UnitSkillPage />, resource: "UnitSkill", allowedRoles: ALL_ADMINS },
  { path: "/tpqi/unitknowledge", element: <ExportPages.UnitKnowledgePage />, resource: "UnitKnowledge", allowedRoles: ALL_ADMINS },

  // ==============================
  // Assets (System related -> SuperAdmin)
  // ==============================
  { path: "/assets", element: <ExportPages.AssetPage />, resource: "Asset", allowedRoles: SUPER_ONLY },
  { path: "/asset-instances", element: <ExportPages.AssetInstancePage />, resource: "AssetInstance", allowedRoles: SUPER_ONLY },
  { path: "/user-asset-instances", element: <ExportPages.UserAssetInstanceAssignmentPage />, resource: "UserAssetInstance", allowedRoles: SUPER_ONLY },
];
