import jsPDF, { jsPDF as jsPDFType } from "jspdf";
import autoTable from "jspdf-autotable";
import { embedThaiFont } from "@Utils/pdfThaiFont";
import { PortfolioData } from "./types/portfolio";

export async function generatePortfolioPdf(portfolio: PortfolioData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let cursorY = margin;

  await embedThaiFont(doc);

  // --- HEADER SECTION ---
  doc.setFont("THSarabunNew", "bold");
  doc.setFontSize(22);
  doc.text("Portfolio Report", margin, cursorY);

  doc.setFontSize(10);
  doc.setFont("THSarabunNew", "normal");
  const dateStr = new Date().toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Generated on: ${dateStr}`, 550, cursorY, { align: "right" });

  cursorY += 35;

  // --- INFO SECTION ---
  doc.setFontSize(16);
  doc.setFont("THSarabunNew", "bold");
  doc.text(`Portfolio Name: ${portfolio.portfolioName}`, margin, cursorY);
  cursorY += 20;

  doc.setFontSize(12);
  doc.setFont("THSarabunNew", "normal");

  // User Info
  doc.text(`User Email: ${portfolio.userEmail || "-"}`, margin, cursorY);
  cursorY += 20;

  // Description
  if (portfolio.portfolioDescription) {
    const descLines = doc.splitTextToSize(`Description: ${portfolio.portfolioDescription}`, 500);
    doc.text(descLines, margin, cursorY);
    cursorY += descLines.length * 15 + 10;
  } else {
    cursorY += 10;
  }

  // --- STATS OVERVIEW ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, cursorY, 550, cursorY);
  cursorY += 20;

  doc.setFontSize(14);
  doc.setFont("THSarabunNew", "bold");
  doc.text("Summary Statistics", margin, cursorY);
  cursorY += 20;

  doc.setFontSize(12);
  doc.setFont("THSarabunNew", "normal");
  doc.text(`• SFIA Skills Selected: ${portfolio.sfiaSkills.length} items`, margin + 10, cursorY);
  cursorY += 15;
  doc.text(`• TPQI Careers Selected: ${portfolio.tpqiCareers.length} items`, margin + 10, cursorY);
  cursorY += 30;

  // --- TABLE 1: SFIA SKILLS ---
  if (portfolio.sfiaSkills.length > 0) {
    doc.setFontSize(14);
    doc.setFont("THSarabunNew", "bold");
    doc.text("1. SFIA Competencies", margin, cursorY);
    cursorY += 10;

    const sfiaRows = portfolio.sfiaSkills.map((item) => [item.skillCode, item.skill?.name || "-", item.level?.name || "-", `${item.skillPercent}%`]);

    autoTable(doc, {
      startY: cursorY,
      head: [["Code", "Skill Name", "Level", "Progress"]],
      body: sfiaRows,
      margin: { left: margin, right: margin },
      styles: {
        font: "THSarabunNew",
        fontSize: 11,
        cellPadding: 4,
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Code
        1: { cellWidth: "auto" }, // Name
        2: { cellWidth: 60 }, // Level
        3: { cellWidth: 50, halign: "center" }, // Progress
      },
    });

    cursorY = (doc as unknown as jsPDFType & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 30;
  }

  // --- TABLE 2: TPQI CAREERS ---
  if (portfolio.tpqiCareers.length > 0) {
    if (cursorY > 700) {
      doc.addPage();
      cursorY = margin;
    }

    doc.setFontSize(14);
    doc.setFont("THSarabunNew", "bold");
    doc.text("2. TPQI Professional Standards", margin, cursorY);
    cursorY += 10;

    const tpqiRows = portfolio.tpqiCareers.map((item) => [item.career?.name || "-", item.level?.name || "-", `${item.skillPercent}%`, `${item.knowledgePercent}%`]);

    autoTable(doc, {
      startY: cursorY,
      head: [["Career / Standard", "Level", "Skill %", "Knowledge %"]],
      body: tpqiRows,
      margin: { left: margin, right: margin },
      styles: {
        font: "THSarabunNew",
        fontSize: 11,
        cellPadding: 4,
        valign: "middle",
      },
      headStyles: {
        fillColor: [39, 174, 96],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 80 },
        2: { cellWidth: 50, halign: "center" },
        3: { cellWidth: 50, halign: "center" },
      },
    });
  }

  const safeName = (portfolio.portfolioName || "Portfolio").replace(/[^a-z0-9ก-๙]/gi, "_");
  doc.save(`Portfolio_${safeName}.pdf`);
}
