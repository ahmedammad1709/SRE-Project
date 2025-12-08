import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function calculateCost(functionalCount) {
  const baseCost = functionalCount * 6 * 8; // # functional requirements × 6 hours × $8/hour
  const overhead = baseCost * 0.2; // 20% overhead
  return Math.round(baseCost + overhead);
}

function calculateTimeline(functionalCount) {
  return Math.round(functionalCount * 1.3); // functional count × 1.3 days
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ success: false, error: "Method Not Allowed" }));
    }

    const body = await parseJSON(req);
    const { extractedData, clientName, clientEmail, projectName } = body;

    if (!extractedData) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ success: false, error: "extractedData is required" }));
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const width = 612;
    const height = 792;
    let page;

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaObliqueFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;
    const sectionSpacing = 30;

    // Helper function to add text with word wrap
    function addText(currentPage, text, x, y, maxWidth, font, size, color = rgb(0, 0, 0)) {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const textWidth = font.widthOfTextAtSize(testLine, size);
        if (textWidth > maxWidth && i > 0) {
          currentPage.drawText(line, { x, y: currentY, size, font, color });
          line = words[i] + " ";
          currentY -= size + 2;
        } else {
          line = testLine;
        }
      }
      currentPage.drawText(line, { x, y: currentY, size, font, color });
      return currentY - size - 2;
    }

    // Helper function to add section
    function addSection(title, content, isList = false) {
      if (yPosition < 100) {
        page = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      // Section title
      yPosition -= 20;
      page.drawText(title, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 10;

      // Section content
      if (isList && Array.isArray(content) && content.length > 0) {
        content.forEach((item, idx) => {
          if (yPosition < 100) {
            page = pdfDoc.addPage([612, 792]);
            yPosition = height - 50;
          }
          const bulletText = `• ${item}`;
          yPosition = addText(page, bulletText, margin + 20, yPosition, width - margin * 2 - 20, helveticaFont, 10, rgb(0.2, 0.2, 0.2));
          yPosition -= 5;
        });
      } else if (typeof content === "string" && content.trim()) {
        yPosition = addText(page, content, margin + 20, yPosition, width - margin * 2 - 20, helveticaFont, 10, rgb(0.2, 0.2, 0.2));
      } else {
        yPosition = addText(page, "Not provided", margin + 20, yPosition, width - margin * 2 - 20, helveticaFont, 10, rgb(0.5, 0.5, 0.5));
      }

      yPosition -= sectionSpacing;
    }

    // Title Page
    const titlePage = pdfDoc.addPage([width, height]);
    const titleY = height / 2 + 60;
    const mainTitle = "Software Requirements Specification";
    const subTitle = "(SRS) Report";
    const mainTitleSize = 26;
    const subTitleSize = 22;
    const mainTitleX = (width - helveticaBoldFont.widthOfTextAtSize(mainTitle, mainTitleSize)) / 2;
    const subTitleX = (width - helveticaBoldFont.widthOfTextAtSize(subTitle, subTitleSize)) / 2;
    titlePage.drawText(mainTitle, {
      x: mainTitleX,
      y: titleY + 40,
      size: mainTitleSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    titlePage.drawText(subTitle, {
      x: subTitleX,
      y: titleY,
      size: subTitleSize,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    const detailsStartY = titleY - 30;
    const nameText = `Client: ${clientName || "N/A"}`;
    const emailText = `Email: ${clientEmail || "N/A"}`;
    const projectText = `Project: ${projectName || "N/A"}`;
    titlePage.drawText(projectText, {
      x: margin,
      y: detailsStartY,
      size: 12,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    titlePage.drawText(nameText, {
      x: margin,
      y: detailsStartY - 20,
      size: 12,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    titlePage.drawText(emailText, {
      x: margin,
      y: detailsStartY - 40,
      size: 12,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    titlePage.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: detailsStartY - 60,
      size: 12,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    page = pdfDoc.addPage([width, height]);
    yPosition = height - 50;

    // Table of Contents (simplified)
    page.drawText("Table of Contents", {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    const tocItems = [];
    if (extractedData.summary) tocItems.push("1. Executive Summary");
    tocItems.push(extractedData.summary ? "2. Project Overview" : "1. Project Overview");
    tocItems.push(extractedData.summary ? "3. Functional Requirements" : "2. Functional Requirements");
    tocItems.push(extractedData.summary ? "4. Non-Functional Requirements" : "3. Non-Functional Requirements");
    tocItems.push(extractedData.summary ? "5. User Stories" : "4. User Stories");
    tocItems.push(extractedData.summary ? "6. Stakeholders" : "5. Stakeholders");
    tocItems.push(extractedData.summary ? "7. Constraints" : "6. Constraints");
    tocItems.push(extractedData.summary ? "8. Risks" : "7. Risks");
    tocItems.push(extractedData.summary ? "9. Cost Estimate & Timeline" : "8. Cost Estimate & Timeline");

    tocItems.forEach((item) => {
      page.drawText(item, {
        x: margin + 20,
        y: yPosition,
        size: 11,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 18;
    });

    yPosition -= sectionSpacing;

    // Executive Summary (if available)
    if (extractedData.summary) {
      addSection("1. Executive Summary", extractedData.summary);
    }

    // Project Overview
    addSection(extractedData.summary ? "2. Project Overview" : "1. Project Overview", extractedData.overview || "Not provided");

    // Functional Requirements
    addSection(extractedData.summary ? "3. Functional Requirements" : "2. Functional Requirements", extractedData.functional || [], true);

    // Non-Functional Requirements
    addSection(extractedData.summary ? "4. Non-Functional Requirements" : "3. Non-Functional Requirements", extractedData.nonFunctional || [], true);

    // User Stories
    addSection(extractedData.summary ? "5. User Stories" : "4. User Stories", extractedData.userStories || [], true);

    // Stakeholders
    addSection(extractedData.summary ? "6. Stakeholders" : "5. Stakeholders", extractedData.stakeholders || [], true);

    // Constraints
    addSection(extractedData.summary ? "7. Constraints" : "6. Constraints", extractedData.constraints || [], true);

    // Risks
    addSection(extractedData.summary ? "8. Risks" : "7. Risks", extractedData.risks || [], true);

    // Cost Estimate & Timeline
    const functionalCount = extractedData.functional?.length || 0;
    const cost = extractedData.costEstimate || (functionalCount > 0 ? `$${calculateCost(functionalCount).toLocaleString()}` : "Not provided");
    const timeline = extractedData.timeline || (functionalCount > 0 ? `${calculateTimeline(functionalCount)} days` : "Not provided");

    if (yPosition < 100) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 50;
    }

    const sectionNum = extractedData.summary ? "9. Cost Estimate & Timeline" : "8. Cost Estimate & Timeline";
    yPosition -= 20;
    page.drawText(sectionNum, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText(`Estimated Cost: ${cost}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 18;

    page.drawText(`Estimated Timeline: ${timeline}`, {
      x: margin + 20,
      y: yPosition,
      size: 11,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    if (functionalCount > 0) {
      yPosition -= 18;
      page.drawText(`Based on ${functionalCount} functional requirement${functionalCount !== 1 ? "s" : ""}`, {
        x: margin + 20,
        y: yPosition,
        size: 10,
        font: helveticaObliqueFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Footer on last page
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    lastPage.drawText(`Page ${pages.length}`, {
      x: width - margin - 50,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();

    // Send PDF as response
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="SRS_Report_${new Date().toISOString().split("T")[0]}.pdf"`);
    res.end(pdfBytes);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
}

