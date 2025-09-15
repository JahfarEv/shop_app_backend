const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (payment, subscription, shop, plan) => {
  return new Promise((resolve, reject) => {
    try {
      // Create directory per shop
      const shopDir = path.join(__dirname, `../invoices/${shop._id}`);
      if (!fs.existsSync(shopDir)) {
        fs.mkdirSync(shopDir, { recursive: true });
      }

      const fileName = `invoice_${payment.id}_${Date.now()}.pdf`;
      const filePath = path.join(shopDir, fileName);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== Header =====
      doc.fontSize(20).text("PocketStor Invoice", { align: "center" });
      doc.moveDown();

      // ===== Invoice Info =====
      doc.fontSize(12).text(`Invoice No: INV-${Date.now()}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // ===== Shop Info =====
      doc.text(`Shop ID: ${shop._id}`);
      doc.text(`Shop Name: ${shop?.name || "N/A"}`);
      doc.moveDown();

      // ===== Plan Info =====
      doc.text(`Plan: ${plan.name}`);
      doc.text(`Duration: ${plan.duration} days`);
      doc.text(`Amount: ₹${plan.amount}`);
      doc.moveDown();

      // ===== Payment Info =====
      doc.text(`Payment ID: ${payment.id}`);
      doc.text(`Order ID: ${payment.order_id}`);
      doc.text(`Status: Paid`);
      doc.moveDown();

      doc.text("Thank you for subscribing to PocketStor!", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;
