import { PrismaClient } from "@prisma/client_competency";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting Seeding Process...");

  // 1. Define Operations
  const operations = ["create", "read", "update", "delete", "manage"];

  // 2. Define Assets
  // ใช้ชื่อแบบ camelCase และมี Prefix ระบุ Domain ชัดเจน
  const assets = [
    // ===== Core & User Data =====
    { tableName: "user", description: "ข้อมูลบัญชีผู้ใช้" },
    { tableName: "profile", description: "ข้อมูลส่วนตัวและประวัติ" },
    { tableName: "session", description: "เซสชันการใช้งาน" },
    { tableName: "portfolio", description: "แฟ้มสะสมงาน" },
    { tableName: "portfolioItem", description: "รายการในแฟ้มสะสมงาน" },

    // ===== SFIA Domain =====
    { tableName: "sfiaCategory", description: "หมวดหมู่หลัก (SFIA Category)" },
    { tableName: "sfiaSubcategory", description: "หมวดย่อย (SFIA Subcategory)" },
    { tableName: "sfiaSkill", description: "ทักษะหลัก (SFIA Skill)" },
    { tableName: "sfiaLevel", description: "ระดับความสามารถ (SFIA Level)" },
    { tableName: "sfiaDescription", description: "คำอธิบายระดับ (SFIA Description)" },
    { tableName: "sfiaSubSkill", description: "ทักษะย่อย (SFIA SubSkill)" },
    { tableName: "sfiaInformation", description: "ข้อมูลหลักฐาน (SFIA Info)" },
    { tableName: "sfiaSummary", description: "สรุปผลคะแนน SFIA ผู้ใช้" },

    // ===== TPQI Domain =====
    { tableName: "tpqiSector", description: "สาขาวิชาชีพ (TPQI Sector)" },
    { tableName: "tpqiCareer", description: "อาชีพ (TPQI Career)" },
    { tableName: "tpqiCareerLevel", description: "ระดับชั้นคุณวุฒิอาชีพ" },
    { tableName: "tpqiLevel", description: "นิยามระดับ (TPQI Level)" },
    { tableName: "tpqiCareerLevelDetail", description: "รายละเอียดระดับอาชีพ" },
    { tableName: "tpqiCareerLevelKnowledge", description: "ความรู้ตามระดับอาชีพ" },
    { tableName: "tpqiCareerLevelSkill", description: "ทักษะตามระดับอาชีพ" },
    { tableName: "tpqiCareerLevelUnitCode", description: "รหัสหน่วยสมรรถนะตามระดับ" },
    { tableName: "tpqiKnowledge", description: "องค์ความรู้ (TPQI Knowledge)" },
    { tableName: "tpqiSkill", description: "ทักษะ (TPQI Skill)" },
    { tableName: "tpqiUnitCode", description: "หน่วยสมรรถนะ (Unit Code)" },
    { tableName: "tpqiOccupational", description: "มาตรฐานอาชีพ (Occupational)" },
    { tableName: "tpqiUnitOccupational", description: "Mapping อาชีพ-หน่วยสมรรถนะ" },
    { tableName: "tpqiUnitSector", description: "Mapping สาขา-หน่วยสมรรถนะ" },

    // ===== TPQI User Records =====
    { tableName: "tpqiSummary", description: "สรุปผลประเมิน TPQI ผู้ใช้" },
    { tableName: "tpqiUserKnowledge", description: "บันทึกความรู้ของผู้ใช้" },
    { tableName: "tpqiUserSkill", description: "บันทึกทักษะของผู้ใช้" },
    { tableName: "tpqiUserUnitKnowledge", description: "บันทึกหน่วยความรู้ผู้ใช้" },
    { tableName: "tpqiUserUnitSkill", description: "บันทึกหน่วยทักษะผู้ใช้" },

    // ===== System / RBAC (Admin Only) =====
    { tableName: "role", description: "บทบาทผู้ใช้งาน" },
    { tableName: "permission", description: "สิทธิ์การใช้งาน" },
    { tableName: "operation", description: "ประเภทการกระทำ" },
    { tableName: "asset", description: "ทะเบียนทรัพยากรระบบ" },
    { tableName: "assetInstance", description: "เจาะจงทรัพยากร (Instance)" },
    { tableName: "userRole", description: "Mapping ผู้ใช้-บทบาท" },
    { tableName: "userAssetInstance", description: "Mapping ผู้ใช้-ความเป็นเจ้าของ" },
    { tableName: "rolePermission", description: "Mapping บทบาท-สิทธิ์" },
    { tableName: "log", description: "บันทึกการใช้งาน (Audit Log)" },
  ];

  // --- Step 1: Create Operations ---
  console.log("   Processing Operations...");
  const operationRecords = [];
  for (const opName of operations) {
    const op = await prisma.operation.upsert({
      where: { name: opName },
      update: {},
      create: { name: opName, description: `${opName} operation` },
    });
    operationRecords.push(op);
  }

  // --- Step 2: Create Assets & Permissions ---
  console.log(`   Processing ${assets.length} Assets...`);

  for (const asset of assets) {
    // Upsert Asset
    const assetRecord = await prisma.asset.upsert({
      where: { tableName: asset.tableName },
      update: { description: asset.description },
      create: {
        tableName: asset.tableName,
        description: asset.description,
      },
    });

    // Create Permissions (Cartesian Product)
    // สำหรับทุก Asset จะสร้าง Permission ครบทุก Operation (create, read, update, delete, manage)
    for (const op of operationRecords) {
      await prisma.permission.upsert({
        where: {
          operationId_assetId: {
            operationId: op.id,
            assetId: assetRecord.id,
          },
        },
        update: {},
        create: {
          operationId: op.id,
          assetId: assetRecord.id,
        },
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
