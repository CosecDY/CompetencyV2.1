// Action Constants
export enum Action {
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
  Manage = "manage", // สิทธิ์สูงสุด (ทำได้ทุกอย่าง)
}

// Resource Names (Namespace Prefixed)
export enum Resource {
  // ===== Core / User Management =====
  User = "user",
  Profile = "profile",
  Session = "session",
  Portfolio = "portfolio",
  PortfolioItem = "portfolioItem",
  BackUp = "BackUp",

  // ===== RBAC System (Admin Only) =====
  Role = "role",
  Permission = "permission",
  Operation = "operation",
  Asset = "asset",
  AssetInstance = "assetInstance",
  UserRole = "userRole",
  UserAssetInstance = "userAssetInstance",
  RolePermission = "rolePermission",
  Log = "log",

  // ===== SFIA Domain (Prefix: sfia) =====
  SfiaCategory = "sfiaCategory", // ป้องกันซ้ำกับ Category อื่น
  SfiaSubcategory = "sfiaSubcategory",
  SfiaSkill = "sfiaSkill",
  SfiaLevel = "sfiaLevel",
  SfiaDescription = "sfiaDescription",
  SfiaSubSkill = "sfiaSubSkill",
  SfiaInformation = "sfiaInformation",
  SfiaSummary = "sfiaSummary", // ผลการประเมินของผู้ใช้

  // ===== TPQI Domain (Prefix: tpqi) =====
  TpqiSector = "tpqiSector", // สาขาวิชาชีพ (เทียบเท่า Category)
  TpqiCareer = "tpqiCareer", // อาชีพ
  TpqiCareerLevel = "tpqiCareerLevel",
  TpqiLevel = "tpqiLevel", // ระดับมาตรฐาน (แยกกับ SFIA Level)
  TpqiKnowledge = "tpqiKnowledge",
  TpqiSkill = "tpqiSkill",
  TpqiUnitCode = "tpqiUnitCode",
  TpqiOccupational = "tpqiOccupational",
  TpqiSummary = "tpqiSummary", // ผลการประเมินของผู้ใช้

  // TPQI Relations/Details
  TpqiCareerLevelDetail = "tpqiCareerLevelDetail",
  TpqiCareerLevelKnowledge = "tpqiCareerLevelKnowledge",
  TpqiCareerLevelSkill = "tpqiCareerLevelSkill",
  TpqiCareerLevelUnitCode = "tpqiCareerLevelUnitCode",
  TpqiUnitOccupational = "tpqiUnitOccupational",
  TpqiUnitSector = "tpqiUnitSector",

  // TPQI User Records
  TpqiUserKnowledge = "tpqiUserKnowledge",
  TpqiUserSkill = "tpqiUserSkill",
  TpqiUserUnitKnowledge = "tpqiUserUnitKnowledge",
  TpqiUserUnitSkill = "tpqiUserUnitSkill",
}
