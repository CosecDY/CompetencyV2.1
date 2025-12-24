import * as ExportPages from "@Pages/ExportPages";
import { Resource } from "@Constants/resources";
export interface RouteItem {
  path: string;
  element: React.ReactNode;
  resource?: string;
}

// Helper constants

export const adminRoutes: RouteItem[] = [
  { path: "/dashboard", element: <ExportPages.DashboardPage />, resource: "Dashboard" },
  { path: "/users", element: <ExportPages.UserPage />, resource: Resource.User },
  { path: "/logs", element: <ExportPages.LogPage />, resource: Resource.Log },
  { path: "/session", element: <ExportPages.SessionPage />, resource: Resource.Session },
  { path: "/backup", element: <ExportPages.BackupPage />, resource: Resource.BackUp },

  // RBAC Management
  { path: "/roles", element: <ExportPages.RolePage />, resource: Resource.Role },
  { path: "/role-permissions", element: <ExportPages.RolePermissionManager />, resource: Resource.RolePermission },
  { path: "/permissions", element: <ExportPages.PermissionPage />, resource: Resource.Permission },
  { path: "/operations", element: <ExportPages.OperationPage />, resource: Resource.Operation },
  { path: "/user-roles", element: <ExportPages.UserRoleAssignmentPage />, resource: Resource.UserRole },

  { path: "/sfia/category", element: <ExportPages.CategoryPage />, resource: Resource.SfiaCategory },
  { path: "/sfia/level", element: <ExportPages.LevelPage />, resource: Resource.SfiaLevel },
  { path: "/sfia/subcategory", element: <ExportPages.SubcategoryPage />, resource: Resource.SfiaSubcategory },
  { path: "/sfia/description", element: <ExportPages.DescriptionPage />, resource: Resource.SfiaDescription },
  { path: "/sfia/sfiasummary", element: <ExportPages.SFIASummaryPage />, resource: Resource.SfiaSummary },
  { path: "/sfia/skill", element: <ExportPages.SFIASkillPage />, resource: Resource.SfiaSkill },
  { path: "/sfia/information", element: <ExportPages.InformationPage />, resource: Resource.SfiaInformation },
  { path: "/sfia/subskill", element: <ExportPages.SubSkillPage />, resource: Resource.SfiaSubSkill },

  // ==============================
  // TPQI (Admin + SuperAdmin)
  // ==============================
  { path: "/tpqi/career", element: <ExportPages.CareerPage />, resource: Resource.TpqiCareer },
  { path: "/tpqi/skill", element: <ExportPages.SkillPage />, resource: Resource.TpqiSkill },
  { path: "/tpqi/sector", element: <ExportPages.SectorPage />, resource: Resource.TpqiSector },
  { path: "/tpqi/occupational", element: <ExportPages.OccupationalPage />, resource: Resource.TpqiOccupational },
  { path: "/tpqi/knowledge", element: <ExportPages.KnowledgePage />, resource: Resource.TpqiKnowledge },
  { path: "/tpqi/unitcode", element: <ExportPages.UnitCodePage />, resource: Resource.TpqiUnitCode },
  { path: "/tpqi/level", element: <ExportPages.TPQILevelPage />, resource: Resource.TpqiLevel },
  { path: "/tpqi/clknowledge", element: <ExportPages.ClKnowledgePage />, resource: Resource.TpqiCareerLevelKnowledge },
  { path: "/tpqi/cldetail", element: <ExportPages.ClDetailPage />, resource: Resource.TpqiCareerLevelDetail },
  { path: "/tpqi/careerlevel", element: <ExportPages.CareerLevelPage />, resource: Resource.TpqiCareerLevel },
  { path: "/tpqi/clskill", element: <ExportPages.ClSkillPage />, resource: Resource.TpqiCareerLevelSkill },
  { path: "/tpqi/clunitcode", element: <ExportPages.ClUnitCodePage />, resource: Resource.TpqiCareerLevelUnitCode },
  { path: "/tpqi/unitoccupational", element: <ExportPages.UnitOccupationalPage />, resource: Resource.TpqiUnitOccupational },
  { path: "/tpqi/unitsector", element: <ExportPages.UnitSectorPage />, resource: Resource.TpqiUnitSector },
  { path: "/tpqi/userskill", element: <ExportPages.UserSkillPage />, resource: Resource.TpqiUserSkill },
  { path: "/tpqi/userknowledge", element: <ExportPages.UserKnowledgePage />, resource: Resource.TpqiUserKnowledge },
  { path: "/tpqi/tpqisummary", element: <ExportPages.TpqiSummaryPage />, resource: Resource.TpqiSummary },
  { path: "/tpqi/unitskill", element: <ExportPages.UnitSkillPage />, resource: Resource.TpqiUserSkill },
  { path: "/tpqi/unitknowledge", element: <ExportPages.UnitKnowledgePage />, resource: Resource.TpqiUserKnowledge },

  // ==============================
  // Assets (System related -> SuperAdmin)
  // ==============================
  { path: "/assets", element: <ExportPages.AssetPage />, resource: Resource.Asset },
  { path: "/asset-instances", element: <ExportPages.AssetInstancePage />, resource: Resource.AssetInstance },
  { path: "/user-asset-instances", element: <ExportPages.UserAssetInstanceAssignmentPage />, resource: Resource.UserAssetInstance },
];
