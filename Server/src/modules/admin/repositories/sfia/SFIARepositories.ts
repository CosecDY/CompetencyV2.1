import { BaseRepository } from "@Utils/BaseRepository";
import { SFIA } from "@Database/dbManagers";
import type { Category, Description, Information, Level, Skill, SubSkill, Subcategory, SfiaSummary } from "@prisma/client_sfia";
import { DatabaseManagement } from "@Utils/databaseUtils";

// Category Repository
export class CategoryRepo extends BaseRepository<Category, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.category, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// Description Repository
export class DescriptionRepo extends BaseRepository<Description, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.description, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// Information Repository
export class InformationRepo extends BaseRepository<Information, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.information, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// Level Repository
export class LevelRepo extends BaseRepository<Level, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.level, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// Skill Repository
export class SkillRepo extends BaseRepository<Skill, "code"> {
  constructor(manager: DatabaseManagement<any> = SFIA.skill, pkField: "code" = "code") {
    super(manager, pkField);
  }
}

// SubSkill Repository
export class SubSkillRepo extends BaseRepository<SubSkill, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.subSkill, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// Subcategory Repository
export class SubcategoryRepo extends BaseRepository<Subcategory, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.subcategory, pkField: "id" = "id") {
    super(manager, pkField);
  }
}

// SfiaSummary Repository
export class SfiaSummaryRepo extends BaseRepository<SfiaSummary, "id"> {
  constructor(manager: DatabaseManagement<any> = SFIA.sfiaSummary, pkField: "id" = "id") {
    super(manager, pkField);
  }
}
