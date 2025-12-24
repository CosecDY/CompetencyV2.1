// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// /**
//  * Retrieves all unique permission keys associated with the roles assigned to a given user.
//  *
//  * This function queries the `users` table via Prisma ORM and traverses the related
//  * `UserRoles`, `Roles`, `RolePermissions`, and `Permissions` to collect all permission keys.
//  *
//  * @param userId - The numeric user ID for which to retrieve permission keys.
//  * @returns A promise that resolves to a list of unique permission keys the user has through their roles.
//  */
// export async function getUserPermissions(userId: number): Promise<string[]> {
//   const userWithRoles = await prisma.users.findUnique({
//     where: { user_id: userId.toString() },
//     select: {
//       UserRoles: {
//         select: {
//           Roles: {
//             select: {
//               role_name: true,
//               RolePermissions: {
//                 select: {
//                   Permissions: {
//                     select: {
//                       permission_key: true,
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!userWithRoles) {
//     return [];
//   }

//   const permissionKeys = userWithRoles.UserRoles.flatMap(
//     (ur: {
//       Roles: {
//         RolePermissions: { Permissions: { permission_key: string } }[];
//       };
//     }) => ur.Roles.RolePermissions.map((rp: { Permissions: { permission_key: string } }) => rp.Permissions.permission_key)
//   ) as string[];
//   const uniqueKeys = Array.from(new Set(permissionKeys));

//   return uniqueKeys;
// }
