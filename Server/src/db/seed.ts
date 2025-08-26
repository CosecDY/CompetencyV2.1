// import { PrismaClient } from "@prisma/client_competency";

// const prisma = new PrismaClient();

// async function seedRBAC() {
//   try {
//     // 1. สร้าง Roles
//     const adminRole = await prisma.role.upsert({
//       where: { name: "admin" },
//       update: {},
//       create: {
//         name: "admin",
//         description: "Administrator role with all permissions",
//       },
//     });

//     const userRole = await prisma.role.upsert({
//       where: { name: "user" },
//       update: {},
//       create: {
//         name: "user",
//         description: "Regular user role with limited permissions",
//       },
//     });

//     // 2. สร้าง Permissions
//     const permissions = [
//       { key: "view", description: "View permission" },
//       { key: "edit", description: "Edit permission" },
//       { key: "delete", description: "Delete permission" },
//       { key: "create", description: "Create permission" },
//     ];

//     const permissionRecords = [];
//     for (const p of permissions) {
//       const perm = await prisma.permission.upsert({
//         where: { key: p.key },
//         update: {},
//         create: p,
//       });
//       permissionRecords.push(perm);
//     }

//     // 3. กำหนดสิทธิ์ให้ role admin (ทุก permission)
//     for (const perm of permissionRecords) {
//       await prisma.rolePermission.upsert({
//         where: {
//           roleId_permissionId: {
//             roleId: adminRole.id,
//             permissionId: perm.id,
//           },
//         },
//         update: {},
//         create: {
//           roleId: adminRole.id,
//           permissionId: perm.id,
//         },
//       });
//     }

//     // 4. กำหนดสิทธิ์ให้ role user (เฉพาะ view กับ create)
//     const userAllowedKeys = ["view", "create"];
//     for (const perm of permissionRecords.filter((p) => userAllowedKeys.includes(p.key))) {
//       await prisma.rolePermission.upsert({
//         where: {
//           roleId_permissionId: {
//             roleId: userRole.id,
//             permissionId: perm.id,
//           },
//         },
//         update: {},
//         create: {
//           roleId: userRole.id,
//           permissionId: perm.id,
//         },
//       });
//     }

//     console.log("RBAC seed completed");
//   } catch (error) {
//     console.error("Error seeding RBAC data:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// seedRBAC();
