// import { prismaTpqi } from "../../../db/prismaClients";
// import { approvalStatus } from "@prisma/client_tpqi";

// export interface CreateTpqiEvidenceRequest {
//   userId: string;
//   skillId?: number;
//   knowledgeId?: number;
//   evidenceUrl?: string;
// }

// export interface TpqiEvidenceResponse {
//   id: number;
//   userId: string;
//   skillId?: number;
//   knowledgeId?: number;
//   evidenceUrl?: string | null;
//   approvalStatus: approvalStatus;
// }

// /**
//  * Creates evidence for a user's skill or knowledge in the TPQI database.
//  * At least one of skillId or knowledgeId must be provided.
//  */
// export async function createTpqiEvidence(data: CreateTpqiEvidenceRequest): Promise<TpqiEvidenceResponse> {
//   if (!data.skillId && !data.knowledgeId) {
//     throw new Error("Either skillId or knowledgeId must be provided.");
//   }

//   // Initialize evidence variable
//   let evidence:
//     | {
//         id: number;
//         userId: string;
//         skillId?: number;
//         knowledgeId?: number;
//         evidenceUrl: string | null;
//         approvalStatus: ApprovalStatus;
//       }
//     | undefined;

//   if (data.skillId) {
//     // Validate skill exists
//     const skill = await prismaTpqi.skill.findUnique({
//       where: { id: data.skillId },
//     });
//     if (!skill) throw new Error(`Skill with ID ${data.skillId} does not exist.`);

//     const created = await prismaTpqi.userSkill.create({
//       data: {
//         userId: data.userId,
//         skillId: data.skillId,
//         evidenceUrl: data.evidenceUrl,
//         approvalStatus: ApprovalStatus.PENDING,
//       },
//     });
//     evidence = {
//       id: created.id,
//       userId: created.userId,
//       skillId: created.skillId,
//       evidenceUrl: created.evidenceUrl,
//       approvalStatus: created.approvalStatus,
//     };
//   } else if (data.knowledgeId) {
//     // Validate knowledge exists
//     const knowledge = await prismaTpqi.knowledge.findUnique({
//       where: { id: data.knowledgeId },
//     });
//     if (!knowledge) throw new Error(`Knowledge with ID ${data.knowledgeId} does not exist.`);

//     const created = await prismaTpqi.userKnowledge.create({
//       data: {
//         userId: data.userId,
//         knowledgeId: data.knowledgeId,
//         evidenceUrl: data.evidenceUrl,
//         approvalStatus: ApprovalStatus.PENDING,
//       },
//     });
//     evidence = {
//       id: created.id,
//       userId: created.userId,
//       knowledgeId: created.knowledgeId,
//       evidenceUrl: created.evidenceUrl,
//       approvalStatus: created.approvalStatus,
//     };
//   }

//   if (!evidence) {
//     throw new Error("Evidence creation failed.");
//   }

//   return {
//     id: evidence.id,
//     userId: evidence.userId,
//     skillId: "skillId" in evidence ? evidence.skillId : undefined,
//     knowledgeId: "knowledgeId" in evidence ? evidence.knowledgeId : undefined,
//     evidenceUrl: evidence.evidenceUrl,
//     approvalStatus: evidence.approvalStatus,
//   };
// }
