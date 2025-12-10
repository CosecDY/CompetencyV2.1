// import { Request, Response } from "express";
// import { StatusCodes } from "http-status-codes";
// import * as searchCareerServices from "@Competency/services/searchCareerServices";

// // Get all skills/careers from the specified database (sfia or tpqi)
// export const getSkills = async (req: Request, res: Response): Promise<void> => {
//   const dbType = req.params?.dbType as "sfia" | "tpqi";
//   if (!dbType || (dbType !== "sfia" && dbType !== "tpqi")) {
//     res.status(StatusCodes.BAD_REQUEST).json({
//       message: "Invalid or missing dbType (must be 'sfia' or 'tpqi')",
//     });
//     return;
//   }
//   try {
//     const skills = await searchCareerServices.getSkills(dbType);
//     res.status(StatusCodes.OK).json({ skills });
//   } catch (err: any) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: err.message ?? "Failed to fetch skills" });
//   }
// };

// // Search for skills/careers by name from the specified database (sfia or tpqi)
// export const searchCareer = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const dbType = req.params?.dbType as "sfia" | "tpqi";
//   const searchTerm = req.body?.searchTerm;

//   if (!dbType || (dbType !== "sfia" && dbType !== "tpqi")) {
//     res.status(StatusCodes.BAD_REQUEST).json({
//       message: "Invalid or missing dbType (must be 'sfia' or 'tpqi')",
//     });
//     return;
//   }
//   if (
//     !searchTerm ||
//     typeof searchTerm !== "string" ||
//     searchTerm.trim() === ""
//   ) {
//     res
//       .status(StatusCodes.BAD_REQUEST)
//       .json({ message: "Missing or invalid searchTerm" });
//     return;
//   }
//   try {
//     const results = await searchCareerServices.searchCareer(dbType, searchTerm);
//     res.status(StatusCodes.OK).json({ results });
//   } catch (err: any) {
//     res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json({ message: err.message ?? "Failed to search careers" });
//   }
// };
