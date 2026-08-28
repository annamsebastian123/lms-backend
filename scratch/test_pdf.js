const PDFDocument = require("pdfkit");
const fs = require("fs");

try {
  const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0
  });

  const writeStream = fs.createWriteStream("scratch/test.pdf");
  doc.pipe(writeStream);

  // --- DRAW ARTISTIC BACKGROUND & BORDERS ---
  
  // 1. Thick Maroon Outer Border (15pt width, inset slightly)
  doc.save();
  doc.rect(15, 15, 811.89, 565.28)
     .lineWidth(15)
     .strokeStyle("#580f24") // Burgundy / Maroon
     .stroke();
  doc.restore();

  // 2. Double Golden Inner Borders
  doc.save();
  doc.rect(30, 30, 781.89, 535.28)
     .lineWidth(3)
     .strokeStyle("#d4af37") // Gold
     .stroke();
  
  doc.rect(36, 36, 769.89, 523.28)
     .lineWidth(1)
     .strokeStyle("#d4af37") // Gold
     .stroke();
  doc.restore();

  // 3. Artistic Burgundy/Gold Waves on Left Side
  doc.save();
  
  // Lighter Gold Wave (Behind)
  doc.fillColor("#d4af37");
  doc.moveTo(37, 37)
     .lineTo(37, 558)
     .lineTo(80, 558)
     .quadraticCurveTo(30, 400, 85, 250)
     .quadraticCurveTo(120, 120, 60, 37)
     .closePath()
     .fill();

  // Dark Burgundy Wave (Main)
  doc.fillColor("#7c1a35");
  doc.moveTo(37, 37)
     .lineTo(110, 37)
     .quadraticCurveTo(150, 180, 85, 330)
     .quadraticCurveTo(45, 460, 120, 558)
     .lineTo(37, 558)
     .closePath()
     .fill();
  
  doc.restore();

  // 4. Golden Accent Dots along Left Wave
  doc.save();
  doc.fillColor("#d4af37");
  const dotCoordinates = [
    {x: 105, y: 100},
    {x: 115, y: 150},
    {x: 108, y: 200},
    {x: 92, y: 250},
    {x: 78, y: 300},
    {x: 70, y: 350},
    {x: 75, y: 400},
    {x: 92, y: 450},
    {x: 112, y: 500}
  ];
  dotCoordinates.forEach(dot => {
    doc.circle(dot.x, dot.y, 3.5).fill();
  });
  doc.restore();

  // 5. Golden Seal / Ribbon on the Right Side
  doc.save();
  // Burgundy Ribbons
  doc.fillColor("#7c1a35");
  doc.moveTo(675, 270).lineTo(660, 360).lineTo(685, 345).lineTo(710, 360).lineTo(695, 270).closePath().fill();
  doc.moveTo(705, 270).lineTo(720, 360).lineTo(745, 345).lineTo(770, 360).lineTo(755, 270).closePath().fill();
  
  // Gold Seal base
  doc.fillColor("#e5c158");
  doc.circle(715, 250, 45).fill();
  
  // Inner Maroon Border
  doc.circle(715, 250, 38).lineWidth(1.5).strokeStyle("#7c1a35").stroke();
  
  // Dotted Inner Ring
  doc.circle(715, 250, 34).lineWidth(1).strokeStyle("#d4af37").dash(3, { space: 2 }).stroke();
  
  // Text inside Seal
  doc.fillColor("#7c1a35");
  doc.font("Helvetica-Bold").fontSize(9);
  doc.text("EXCELLENCE", 670, 240, { width: 90, align: "center" });
  doc.fontSize(7.5);
  doc.text("AWARD", 670, 253, { width: 90, align: "center" });
  doc.restore();

  // --- TYPOGRAPHY & LAYOUT ---
  
  // 1. Certificate Title
  doc.save();
  doc.fillColor("#1e293b");
  doc.font("Times-Bold").fontSize(34);
  doc.text("CERTIFICATE OF COMPLETION", 140, 80, { width: 560, align: "center" });
  doc.restore();

  // 2. Subtitle
  doc.save();
  doc.fillColor("#475569");
  doc.font("Times-Italic").fontSize(16);
  doc.text("This is proudly presented to", 140, 145, { width: 560, align: "center" });
  doc.restore();

  // 3. Recipient Name
  doc.save();
  doc.fillColor("#7c1a35");
  doc.font("Times-BoldItalic").fontSize(34);
  doc.text("Learner Name", 140, 185, { width: 560, align: "center" });
  
  // Gold Underline below Name
  doc.lineWidth(1.5).strokeStyle("#d4af37");
  doc.moveTo(250, 230).lineTo(590, 230).stroke();
  doc.restore();

  // 4. Description Subtitle
  doc.save();
  doc.fillColor("#475569");
  doc.font("Times-Italic").fontSize(15);
  doc.text("for successfully completing the course", 140, 255, { width: 560, align: "center" });
  doc.restore();

  // 5. Course Title
  doc.save();
  doc.fillColor("#0f172a");
  doc.font("Times-Bold").fontSize(26);
  doc.text("Course Name", 140, 290, { width: 560, align: "center" });
  doc.restore();

  // 6. Certificate Details (ID and info)
  doc.save();
  doc.fillColor("#64748b");
  doc.font("Helvetica").fontSize(10);
  doc.text(`Certificate No: HCK-LMS-2026-00001`, 140, 350, { width: 560, align: "center" });
  doc.restore();

  // 7. Signature & Date Lines
  doc.save();
  doc.lineWidth(1).strokeStyle("#d4af37");
  // Registrar / Signature line (Left)
  doc.moveTo(200, 480).lineTo(380, 480).stroke();
  // Date line (Right)
  doc.moveTo(460, 480).lineTo(640, 480).stroke();

  // Date text on top of Date Line
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  doc.fillColor("#1e293b").font("Times-Roman").fontSize(12);
  doc.text(issueDate, 460, 460, { width: 180, align: "center" });

  // Organization Registrar text on top of Signature Line
  doc.text("High Court of Kerala", 200, 460, { width: 180, align: "center" });

  // Signature Labels
  doc.fillColor("#475569").font("Helvetica-Bold").fontSize(10);
  doc.text("REGISTRAR", 200, 490, { width: 180, align: "center" });
  doc.text("DATE ISSUED", 460, 490, { width: 180, align: "center" });
  doc.restore();

  doc.end();
  
  writeStream.on("finish", () => {
    console.log("PDF generation success!");
  });
} catch (e) {
  console.error("PDF generation failure:", e);
}
