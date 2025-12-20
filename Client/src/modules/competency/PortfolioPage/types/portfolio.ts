// ==========================================
// 1. SFIA Schema Types
// ==========================================
export interface SfiaSummary {
  id: number;
  userId: string;
  userEmail?: string | null;
  skillCode: string | null;
  levelId: number | null;
  skillPercent: number | null;

  // Relations
  skill?: SfiaSkill | null;
  level?: SfiaLevel | null;
}

export interface SfiaSkill {
  code: string;
  name: string | null;
  overview: string | null;
  note: string | null;
  levelId: number | null;
  categoryId: number | null;

  // Relations
  category?: SfiaCategory | null;
  levels: SfiaLevel[];
  subSkills: SfiaSubSkill[]; // ถ้าไม่ได้ใช้ SubSkill ในหน้า Portfolio อาจจะถอดออกได้เพื่อลด payload
}

export interface SfiaLevel {
  id: number;
  name: string | null;
  skillCode: string | null;
  descriptions: SfiaDescription[];
}

export interface SfiaCategory {
  id: number;
  name: string | null;
  subcategoryId: number | null;
  subcategory?: SfiaSubcategory | null;
}

export interface SfiaSubcategory {
  id: number;
  name: string | null;
}

export interface SfiaDescription {
  id: number;
  text: string | null;
  levelId: number | null;
}

export interface SfiaSubSkill {
  id: number;
  skillCode: string;
  descriptionId: number;
  text: string | null;
}

// ==========================================
// 2. TPQI Schema Types
// ==========================================
export interface TpqiSummary {
  id: number;
  userEmail: string;
  userId?: string;
  careerId: number;
  levelId: number;
  careerLevelId: number;
  skillPercent: number | null;
  knowledgePercent: number | null;

  // Relations
  career: TpqiCareer;
  careerLevel: TpqiCareerLevel;
  level: TpqiLevel;
}

export interface TpqiCareer {
  id: number;
  name: string;
}

export interface TpqiLevel {
  id: number;
  name: string;
}

export interface TpqiCareerLevel {
  id: number;
  careerId: number;
  levelId: number;
}

// ถ้าหน้าบ้านไม่ได้ใช้ list รายชื่อ knowledge/skill ย่อย อาจจะไม่ต้อง export ก็ได้
// แต่ถ้าใช้แสดงผลใน Modal รายละเอียด ให้คงไว้ครับ
export interface TpqiKnowledge {
  id: number;
  name: string;
}

export interface TpqiSkill {
  id: number;
  name: string;
}

// ==========================================
// 3. Portfolio Combined Types (Main Usage)
// ==========================================
export interface PortfolioData {
  // User Info
  userId: string;
  userEmail: string;

  // Portfolio Info (Optional: มีค่าเฉพาะตอนดู View Detail)
  portfolioId?: string;
  portfolioName?: string;
  portfolioDescription?: string | null;
  isPublic?: boolean; // [Recommended] เผื่อใช้ Toggle Public/Private
  updatedAt?: string; // [Recommended] ใช้แสดง "อัปเดตล่าสุดเมื่อ..." ใน Dashboard/PDF

  // Data Content
  sfiaSkills: SfiaSummary[];
  tpqiCareers: TpqiSummary[];

  // Statistics
  overallStats: {
    totalSfiaSkills: number;
    totalTpqiCareers: number;
    averageSfiaProgress: number;
    averageTpqiSkillProgress: number;
    averageTpqiKnowledgeProgress: number;
  };
}

// Helper Type สำหรับทำ Graph หรือ Progress Bar รวม
export interface SkillProgressItem {
  id: string | number; // เพิ่ม ID เพื่อใช้เป็น key ใน list
  name: string;
  percentage: number;
  level?: string;
  category?: string;
  type: "sfia" | "tpqi-skill" | "tpqi-knowledge";
}
