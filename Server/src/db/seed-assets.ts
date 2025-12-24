import { PrismaClient } from "@prisma/client_competency";

const prisma = new PrismaClient();

async function main() {
  const operations = ["create", "read", "update", "delete"];

  const assets = [
    // ===== SFIA =====
    { tableName: "Category", description: "หมวดหมู่หลักของ SFIA" },
    { tableName: "Subcategory", description: "หมวดย่อยของ SFIA" },
    { tableName: "Skill", description: "ทักษะหลักใน SFIA" },
    { tableName: "Level", description: "ระดับของทักษะ SFIA" },
    { tableName: "Description", description: "คำอธิบายระดับ SFIA" },
    { tableName: "SubSkill", description: "ทักษะย่อยของ SFIA" },
    { tableName: "Information", description: "ข้อมูล/หลักฐานการประเมิน" },
    { tableName: "SfiaSummary", description: "สรุปคะแนนทักษะผู้ใช้" },

    // ===== TPQI =====
    { tableName: "Career", description: "อาชีพหลักใน TPQI" },
    { tableName: "CareerLevel", description: "ระดับอาชีพ" },
    { tableName: "LevelTpqi", description: "ระดับมาตรฐาน TPQI" },
    { tableName: "CareerLevelDetail", description: "รายละเอียดระดับอาชีพ" },
    { tableName: "CareerLevelKnowledge", description: "ความรู้ในระดับอาชีพ" },
    { tableName: "CareerLevelSkill", description: "ทักษะในระดับอาชีพ" },
    { tableName: "CareerLevelUnitCode", description: "รหัสหน่วยอาชีพ" },
    { tableName: "Knowledge", description: "ความรู้ใน TPQI" },
    { tableName: "SkillTpqi", description: "ทักษะใน TPQI" },
    { tableName: "UnitCode", description: "หน่วยรหัสมาตรฐาน" },
    { tableName: "UserKnowledge", description: "ความรู้ของผู้ใช้" },
    { tableName: "UserSkill", description: "ทักษะของผู้ใช้" },
    { tableName: "UserUnitKnowledge", description: "หน่วยมาตรฐานความรู้ของผู้ใช้" },
    { tableName: "UserUnitSkill", description: "หน่วยมาตรฐานทักษะของผู้ใช้" },
    { tableName: "Occupational", description: "อาชีพมาตรฐาน" },
    { tableName: "UnitOccupational", description: "ความสัมพันธ์อาชีพกับหน่วย" },
    { tableName: "Sector", description: "สาขาวิชาชีพ" },
    { tableName: "UnitSector", description: "ความสัมพันธ์สาขาวิชาชีพกับหน่วย" },
    { tableName: "TpqiSummary", description: "สรุปผลการประเมินผู้ใช้ TPQI" },

    // ===== RBAC =====
    { tableName: "User", description: "ข้อมูลผู้ใช้" },
    { tableName: "Role", description: "ข้อมูล Role" },
    { tableName: "UserRole", description: "ความสัมพันธ์ผู้ใช้กับ Role" },
    { tableName: "Operation", description: "Operation สำหรับ Permission" },
    { tableName: "Asset", description: "ข้อมูล Asset" },
    { tableName: "AssetInstance", description: "Instance ของ Asset" },
    { tableName: "UserAssetInstance", description: "ความสัมพันธ์ผู้ใช้กับ AssetInstance" },
    { tableName: "Permission", description: "Permission CRUD" },
    { tableName: "RolePermission", description: "ความสัมพันธ์ Role กับ Permission" },
    { tableName: "Log", description: "Log ของระบบ" },
  ];

  // สร้าง Operation
  const operationRecords = [];
  for (const opName of operations) {
    const op = await prisma.operation.upsert({
      where: { name: opName },
      update: {},
      create: { name: opName, description: `${opName} operation` },
    });
    operationRecords.push(op);
  }

  for (const asset of assets) {
    const assetRecord = await prisma.asset.upsert({
      where: { tableName: asset.tableName },
      update: { description: asset.description },
      create: asset,
    });

    // สร้าง Permission CRUD สำหรับแต่ละ Asset
    for (const op of operationRecords) {
      await prisma.permission.upsert({
        where: { operationId_assetId: { operationId: op.id, assetId: assetRecord.id } },
        update: {},
        create: { operationId: op.id, assetId: assetRecord.id },
      });
    }
  }

  console.log("Seeded SFIA, TPQI, and RBAC assets with operations and permissions.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
