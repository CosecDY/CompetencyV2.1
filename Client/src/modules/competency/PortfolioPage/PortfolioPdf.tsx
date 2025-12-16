import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { embedThaiFont } from "@Utils/pdfThaiFont";
import { OccupationType, SkillType, UserType } from "../mockOccupations";

export async function generatePortfolioPdf(
  user: UserType,
  occupation: OccupationType
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let cursorY = margin;

  await embedThaiFont(doc);

  doc.setFontSize(18);
  doc.text("Portfolio Summary", margin, cursorY);
  cursorY += 30;

  doc.setFontSize(12);
  doc.setFont("THSarabunNew");
  doc.text(`Name: ${user.name}`, margin, cursorY);
  cursorY += 20;
  doc.text(
    `Email: ${user.name.toLowerCase().replace(" ", ".")}@example.com`,
    margin,
    cursorY
  );
  cursorY += 20;
  doc.text(`Role: Full Stack Developer`, margin, cursorY);
  cursorY += 20;
  doc.text(`Location: Bangkok, Thailand`, margin, cursorY);
  cursorY += 20;
  doc.text(
    "Bio: Passionate developer with experience in building full-stack applications. Skilled in React, Node.js, and cloud deployment. Always eager to learn new technologies and improve code quality.",
    margin,
    cursorY,
    {
      maxWidth: 500,
    }
  );
  cursorY += 40;

  const totalSkills = occupation.skills.length;
  const evidenceCount = Object.values(user.evidenceUrls).filter(
    (url) => url.trim() !== ""
  ).length;

  doc.setFontSize(14);
  doc.text("Statistics", margin, cursorY);
  cursorY += 20;
  doc.setFontSize(12);
  doc.text(`Occupation: ${occupation.name}`, margin, cursorY);
  cursorY += 20;
  doc.text(`Total Skills: ${totalSkills}`, margin, cursorY);
  cursorY += 20;
  doc.text(`Evidence Submitted: ${evidenceCount}`, margin, cursorY);
  cursorY += 30;

  const levelProgressData: Record<
    string,
    { total: number; completed: number }
  > = {};
  occupation.skills.forEach((skill) => {
    const lvl = skill.level;
    if (!levelProgressData[lvl]) {
      levelProgressData[lvl] = { total: 0, completed: 0 };
    }
    levelProgressData[lvl].total += 1;
    if (user.evidenceUrls[skill.id]?.trim() !== "") {
      levelProgressData[lvl].completed += 1;
    }
  });

  doc.setFontSize(14);
  doc.text("Level Progress", margin, cursorY);
  cursorY += 20;
  Object.entries(levelProgressData).forEach(([level, { total, completed }]) => {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    doc.setFontSize(12);
    doc.text(`${level}: ${percent}% (${completed}/${total})`, margin, cursorY);
    cursorY += 18;
  });
  cursorY += 20;

  doc.setFontSize(14);
  doc.text("รายละเอียดทักษะ (Skills Details)", margin, cursorY);
  cursorY += 20;

  const tableColumn = [
    "Skill Name",
    "Framework",
    "Level",
    "Has Evidence",
    "Evidence URL",
    "Responsibilities",
    "Requirements",
  ];
  const tableRows: string[][] = [];

  occupation.skills.forEach((skill: SkillType) => {
    const hasEv = Boolean(user.evidenceUrls[skill.id]?.trim() !== "");
    const respText = skill.responsibilities.length
      ? skill.responsibilities.join("\n")
      : "-";
    const reqText = skill.requirements.length
      ? skill.requirements.join("\n")
      : "-";
    tableRows.push([
      skill.name,
      skill.framework,
      skill.level,
      hasEv ? "Yes" : "No",
      hasEv ? user.evidenceUrls[skill.id] : "-",
      respText,
      reqText,
    ]);
  });

  autoTable(doc, {
    startY: cursorY,
    head: [tableColumn],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: {
      font: "THSarabunNew",
      fontSize: 10,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      font: "THSarabunNew",
    },
  });

  doc.save(`Portfolio_${user.name.replace(" ", "_")}.pdf`);
}
