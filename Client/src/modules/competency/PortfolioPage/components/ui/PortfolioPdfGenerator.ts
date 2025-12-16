import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { embedThaiFont } from "@Utils/pdfThaiFont";
import { PortfolioData } from "modules/competency/PortfolioPage/types/portfolio";
import { UserProfileData } from "modules/competency/ProfilePage/services/profileService";

export async function generatePortfolioPdf(portfolioData: PortfolioData, userProfile: UserProfileData) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = 595.28; // A4 width in points
  const contentWidth = pageWidth - 2 * margin;
  let cursorY = margin;

  // Formal CV color scheme (neutral, print-friendly)
  const colors = {
    primary: [33, 37, 41], // near-black
    secondary: [73, 80, 87], // gray-700
    accent: [45, 55, 72], // subtle slate
    light: [245, 246, 248], // very light gray
    text: [33, 37, 41],
    muted: [108, 117, 125],
    tableHead: [230, 230, 230],
  };

  // Embed Thai font first
  await embedThaiFont(doc);

  // Helper function to ensure Thai font is set correctly
  const setThaiFont = (style: "normal" | "bold" = "normal", size: number = 12) => {
    doc.setFontSize(size);
    try {
      doc.setFont("THSarabunNew", style);
    } catch {
      console.warn(`Font style "${style}" not available, using normal`);
      doc.setFont("THSarabunNew", "normal");
    }
  };

  // Helper function to safely render Thai text
  const renderThaiText = (text: string, x: number, y: number, options?: { maxWidth?: number }) => {
    const normalizedText = text.normalize("NFC");
    doc.text(normalizedText, x, y, options);
  };

  // Helper function to draw section separator
  const drawSectionSeparator = (y: number) => {
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 15;
  };

  // Helper: render a clean header with name and contact details
  const renderFormalHeader = (y: number) => {
    const safeJoin = (parts: (string | null | undefined)[]) => parts.filter((p) => !!p && String(p).trim().length > 0).join(" • ");
    const fullNameTH = safeJoin([userProfile.firstNameTH ?? "", userProfile.lastNameTH ?? ""]);
    const fullNameEN = safeJoin([userProfile.firstNameEN ?? "", userProfile.lastNameEN ?? ""]);

    // Name
    setThaiFont("bold", 22);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    renderThaiText((fullNameTH || fullNameEN || userProfile.email.split("@")[0]).normalize("NFC"), margin, y);
    y += 24;

    // English name (if Thai and English both exist)
    if (fullNameTH && fullNameEN) {
      setThaiFont("normal", 12);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      renderThaiText(fullNameEN.normalize("NFC"), margin, y);
      y += 18;
    }

    // Contact line
    setThaiFont("normal", 11);
    doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    const contact = safeJoin([userProfile.email, userProfile.phone, userProfile.line ? `Line: ${userProfile.line}` : undefined, userProfile.address]);
    if (contact) {
      renderThaiText(contact.normalize("NFC"), margin, y);
      y += 14;
    }

    // Thin separator
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    return y;
  };

  // Helper function to render metrics cards
  const renderMetricsCards = (
    metrics: {
      label: string;
      value: string | number;
      progress: number;
      color: number[];
    }[],
    cursorY: number
  ) => {
    const cardWidth = (contentWidth - 20) / 3;
    const cardHeight = 60;
    const cardSpacing = 10;

    metrics.forEach((metric, index) => {
      const x = margin + index * (cardWidth + cardSpacing);

      // Card background (formal, subtle border)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(230, 230, 230);
      doc.rect(x, cursorY, cardWidth, cardHeight, "FD");

      // Progress bar background
      doc.setFillColor(235, 235, 235);
      doc.rect(x + 10, cursorY + cardHeight - 15, cardWidth - 20, 8, "F");

      // Progress bar fill
      doc.setFillColor(90, 90, 90);
      const progressWidth = (cardWidth - 20) * (metric.progress / 100);
      doc.rect(x + 10, cursorY + cardHeight - 15, progressWidth, 8, "F");

      // Metric value
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      setThaiFont("bold", 18);
      doc.text(typeof metric.value === "number" ? metric.value.toString() : metric.value, x + 10, cursorY + 20);

      // Metric label
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      setThaiFont("normal", 10);
      doc.text(metric.label, x + 10, cursorY + 35);

      // Progress percentage
      setThaiFont("bold", 10);
      doc.text(`${metric.progress}%`, x + cardWidth - 30, cursorY + 20);
    });

    return cursorY + cardHeight + 30;
  };

  // Helper function to generate achievements list
  const getAchievements = (stats: PortfolioData["overallStats"]) => {
    const achievementList: string[] = [];

    if (stats.averageSfiaProgress > 70) {
      achievementList.push("• High-performing professional with 70%+ average competency across technical skills");
    }

    if (stats.totalSfiaSkills > 5) {
      achievementList.push(`• Comprehensive skill portfolio spanning ${stats.totalSfiaSkills} technical competencies`);
    }

    if (stats.totalTpqiCareers > 1) {
      achievementList.push(`• Multi-pathway career readiness across ${stats.totalTpqiCareers} professional domains`);
    }

    if (stats.averageTpqiKnowledgeProgress > 60) {
      achievementList.push("• Strong knowledge foundation with 60%+ proficiency in specialized domains");
    }

    // Add standard professional achievements
    achievementList.push("• Digitally competent professional with verified skill assessments");
    achievementList.push("• Ready for technology-driven roles and digital transformation initiatives");
    return achievementList;
  };

  // Header
  cursorY = renderFormalHeader(cursorY);

  const overallStats = portfolioData.overallStats;
  const metrics = [
    {
      label: "SFIA Skills",
      value: overallStats.totalSfiaSkills,
      progress: Math.round(overallStats.averageSfiaProgress),
      color: colors.secondary,
    },
    {
      label: "TPQI Careers",
      value: overallStats.totalTpqiCareers,
      progress: Math.round(overallStats.averageTpqiSkillProgress),
      color: colors.accent,
    },
    {
      label: "Knowledge Base",
      value: "Comprehensive",
      progress: Math.round(overallStats.averageTpqiKnowledgeProgress),
      color: colors.primary,
    },
  ];

  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  setThaiFont("bold", 16);
  renderThaiText("PROFILE SUMMARY", margin, cursorY);
  cursorY += 20;

  setThaiFont("normal", 11);
  const summaryText = `Digital professional with comprehensive competency profile across ${portfolioData.overallStats.totalSfiaSkills} SFIA framework skills and ${
    portfolioData.overallStats.totalTpqiCareers
  } TPQI career pathways. Demonstrated expertise with ${Math.round(portfolioData.overallStats.averageSfiaProgress)}% average proficiency in technical skills and ${Math.round(
    (portfolioData.overallStats.averageTpqiSkillProgress + portfolioData.overallStats.averageTpqiKnowledgeProgress) / 2
  )}% in specialized knowledge domains. Ready for challenging roles in technology and digital transformation.`;

  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 14 + 25;

  // Competency overview metrics
  cursorY = drawSectionSeparator(cursorY);

  setThaiFont("bold", 16);
  renderThaiText("COMPETENCY OVERVIEW", margin, cursorY);
  cursorY += 25;

  // Render metrics cards using helper
  cursorY = renderMetricsCards(metrics, cursorY);

  // Check if we need a new page
  if (cursorY > 650) {
    doc.addPage();
    cursorY = margin;
  }

  // SFIA Technical Skills - Professional Table
  if (portfolioData.sfiaSkills.length > 0) {
    cursorY = drawSectionSeparator(cursorY);

    setThaiFont("bold", 16);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    renderThaiText("TECHNICAL SKILLS (SFIA FRAMEWORK)", margin, cursorY);
    cursorY += 25;

    // Group skills by category for better presentation
    const skillsByCategory: { [key: string]: typeof portfolioData.sfiaSkills } = {};
    portfolioData.sfiaSkills.forEach((skill) => {
      const category = skill.skill?.category?.name || "Other";
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skill);
    });

    // Display top skills in a clean table
    const sortedSkills = [...portfolioData.sfiaSkills];
    sortedSkills.sort((a, b) => (b.skillPercent || 0) - (a.skillPercent || 0));
    const topSkills = sortedSkills.slice(0, 10); // Show top 10 skills

    const sfiaTableData: string[][] = [];
    topSkills.forEach((skill) => {
      const skillName = (skill.skill?.name || skill.skillCode || "N/A").normalize("NFC");
      const levelName = (skill.level?.name || "N/A").normalize("NFC");
      const categoryName = (skill.skill?.category?.name || "General").normalize("NFC");
      const progress = skill.skillPercent ? `${Math.round(skill.skillPercent)}%` : "0%";

      sfiaTableData.push([skillName, levelName, categoryName, progress]);
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["Technical Skill".normalize("NFC"), "Proficiency Level".normalize("NFC"), "Category".normalize("NFC"), "Progress".normalize("NFC")]],
      body: sfiaTableData,
      margin: { left: margin, right: margin },
      styles: {
        font: "THSarabunNew",
        fontSize: 10,
        cellPadding: 8,
        overflow: "linebreak",
        valign: "middle",
        textColor: [colors.text[0], colors.text[1], colors.text[2]],
      },
      headStyles: {
        fillColor: colors.tableHead as [number, number, number],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        font: "THSarabunNew",
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.4, font: "THSarabunNew" },
        1: {
          cellWidth: contentWidth * 0.25,
          halign: "center",
          font: "THSarabunNew",
        },
        2: { cellWidth: contentWidth * 0.25, font: "THSarabunNew" },
        3: {
          cellWidth: contentWidth * 0.1,
          halign: "center",
          font: "THSarabunNew",
          fillColor: [245, 245, 245],
        },
      },
    });

    // Use jspdf-autotable's augmented typing on jsPDF; avoid unnecessary type assertions
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 20;

    // Add skills summary if there are more skills
    if (portfolioData.sfiaSkills.length > 10) {
      setThaiFont("normal", 9);
      doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      renderThaiText(`*Showing top 10 skills. Total ${portfolioData.sfiaSkills.length} technical skills assessed.`, margin, cursorY);
      cursorY += 25;
    }
  }

  // Check if we need a new page before TPQI section
  if (cursorY > 600) {
    doc.addPage();
    cursorY = margin;
  }

  // TPQI Career Pathways - Professional Presentation
  if (portfolioData.tpqiCareers.length > 0) {
    cursorY = drawSectionSeparator(cursorY);

    setThaiFont("bold", 16);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    renderThaiText("CAREER PATHWAY READINESS (TPQI)", margin, cursorY);
    cursorY += 25;

    const tpqiTableData: string[][] = [];
    portfolioData.tpqiCareers.forEach((career) => {
      const careerName = (career.career?.name || "N/A").normalize("NFC");
      const levelName = (career.level?.name || "N/A").normalize("NFC");
      const skillProgress = career.skillPercent ? `${Math.round(career.skillPercent)}%` : "0%";
      const knowledgeProgress = career.knowledgePercent ? `${Math.round(career.knowledgePercent)}%` : "0%";
      const overallProgress = career.skillPercent && career.knowledgePercent ? `${Math.round((career.skillPercent + career.knowledgePercent) / 2)}%` : "N/A";

      tpqiTableData.push([careerName, levelName, skillProgress, knowledgeProgress, overallProgress]);
    });

    autoTable(doc, {
      startY: cursorY,
      head: [["Career Path".normalize("NFC"), "Level".normalize("NFC"), "Skills".normalize("NFC"), "Knowledge".normalize("NFC"), "Overall".normalize("NFC")]],
      body: tpqiTableData,
      margin: { left: margin, right: margin },
      styles: {
        font: "THSarabunNew",
        fontSize: 10,
        cellPadding: 8,
        overflow: "linebreak",
        valign: "middle",
        textColor: [colors.text[0], colors.text[1], colors.text[2]],
      },
      headStyles: {
        fillColor: colors.tableHead as [number, number, number],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        font: "THSarabunNew",
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.25, font: "THSarabunNew" },
        1: {
          cellWidth: contentWidth * 0.15,
          halign: "center",
          font: "THSarabunNew",
        },
        2: {
          cellWidth: contentWidth * 0.15,
          halign: "center",
          font: "THSarabunNew",
        },
        3: {
          cellWidth: contentWidth * 0.15,
          halign: "center",
          font: "THSarabunNew",
        },
        4: {
          cellWidth: contentWidth * 0.15,
          halign: "center",
          font: "THSarabunNew",
        },
      },
    });

    // Use jspdf-autotable's augmented typing on jsPDF; avoid unnecessary type assertions
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 20;
  }

  // Achievements Section
  cursorY = drawSectionSeparator(cursorY);

  setThaiFont("bold", 16);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  renderThaiText("KEY ACHIEVEMENTS & QUALIFICATIONS", margin, cursorY);
  cursorY += 20;

  // Calculate achievements dynamically
  const achievements = getAchievements(portfolioData.overallStats);

  setThaiFont("normal", 11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

  achievements.forEach((achievement: string) => {
    const lines = doc.splitTextToSize(achievement, contentWidth - 20);
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 14 + 5;
  });

  // Minimal footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(0.8);
    doc.line(0, 800, pageWidth, 800);

    // Footer content
    setThaiFont("normal", 9);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);

    // Left side - Generation info
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    renderThaiText(`Generated: ${currentDate} | Digital Competency Portfolio`, margin, 820);

    // Right side - Page number
    const pageText = `Page ${i} of ${pageCount}`;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - textWidth, 820);
  }

  // Generate professional filename
  const fullNameEN = userProfile.firstNameEN + " " + userProfile.lastNameEN || "";
  const fullNameTH = userProfile.firstNameTH + " " + userProfile.lastNameTH || "";
  const fileDisplayName = fullNameEN || fullNameTH || userProfile.email.split("@")[0];
  const cleanName = fileDisplayName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `CV_${cleanName}_${dateStr}.pdf`;

  // Save the PDF
  doc.save(filename);
}
