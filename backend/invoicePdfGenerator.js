import PDFDocument from 'pdfkit';

/**
 * Generate a professional corporate invoice or receipt PDF
 * @param {Object} options
 * @param {string} options.invoiceId - e.g. "INV-2026-8941"
 * @param {string} options.customerName - e.g. "Sri"
 * @param {string} options.phone - e.g. "+91 84384 89970"
 * @param {string} options.email - e.g. "sri@example.com"
 * @param {string} options.city - e.g. "Mumbai, IN"
 * @param {string} options.description - e.g. "DhiGrowth WhatsApp CRM & AI Concierge"
 * @param {number|string} options.amount - e.g. 2499 or "2,499"
 * @param {'due'|'paid'} options.status - 'due' or 'paid'
 * @param {string} options.paymentLink - e.g. "http://localhost:4000/invoices/INV-2026-8941/pay"
 * @param {string} [options.transactionId] - e.g. "TXN-9842109"
 * @param {string} [options.paymentMethod] - e.g. "UPI / Google Pay"
 * @param {string} [options.paymentDate] - e.g. "11 Sep 2026, 02:45 PM"
 * @returns {Promise<Buffer>}
 */
export const generateInvoicePdf = ({
  invoiceId,
  customerName = 'Valued Client',
  phone = '',
  email = '',
  city = 'India',
  description = 'DhiGrowth Business Solutions & IT Services',
  amount = 2499,
  status = 'due',
  paymentLink = '',
  transactionId = '',
  paymentMethod = 'UPI / NetBanking / Cards',
  paymentDate = '',
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) || 2499 : amount;
      const formattedAmount = `INR ${numAmount.toLocaleString('en-IN')}`;
      const isPaid = status === 'paid';
      const issueDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      // 1. Top Decorative Bar
      doc.rect(0, 0, 595.28, 8).fill(isPaid ? '#16A34A' : '#7C3AED');

      // 2. Company Brand Header
      doc.fillColor('#101828').fontSize(22).font('Helvetica-Bold').text('WAPPPILOT Business Solutions', 40, 35);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('AI WhatsApp CRM, Marketing Automation & Commerce', 40, 62);
      doc.text('support@wapppilot.com  |  +91 97914 71277  |  Official Meta Business Partner', 40, 75);

      // 3. Status Badge (Top Right)
      if (isPaid) {
        doc.roundedRect(390, 32, 165, 52, 6).fillAndStroke('#DCFCE7', '#86EFAC');
        doc.fillColor('#15803D').fontSize(14).font('Helvetica-Bold').text('PAID / RECEIPT', 405, 42);
        doc.fillColor('#166534').fontSize(8).font('Helvetica').text(`Txn: ${transactionId || 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()}`, 405, 60);
        doc.text(`Paid on: ${paymentDate || issueDate}`, 405, 70);
      } else {
        doc.roundedRect(390, 32, 165, 52, 6).fillAndStroke('#FEF2F2', '#FECACA');
        doc.fillColor('#DC2626').fontSize(14).font('Helvetica-Bold').text('PAYMENT DUE', 415, 44);
        doc.fillColor('#991B1B').fontSize(8.5).font('Helvetica').text(`Due by: ${dueDate}`, 415, 64);
      }

      // Divider
      doc.moveTo(40, 100).lineTo(555, 100).strokeColor('#E2E8F0').lineWidth(1).stroke();

      // 4. Invoice Details & Billed To Columns
      // Left: Billed To
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('BILLED TO', 40, 115);
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(customerName, 40, 128);
      doc.fillColor('#475467').fontSize(9).font('Helvetica');
      if (phone) doc.text(`Phone: ${phone}`, 40, 144);
      if (email) doc.text(`Email: ${email}`, 40, 157);
      if (city) doc.text(`Location: ${city}`, 40, 170);

      // Right: Invoice Metadata
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('INVOICE DETAILS', 350, 115);
      doc.fillColor('#475467').fontSize(9).font('Helvetica');
      doc.text('Invoice Number:', 350, 130);
      doc.fillColor('#0F172A').font('Helvetica-Bold').text(invoiceId, 450, 130);

      doc.fillColor('#475467').font('Helvetica').text('Issue Date:', 350, 145);
      doc.fillColor('#0F172A').font('Helvetica-Bold').text(issueDate, 450, 145);

      doc.fillColor('#475467').font('Helvetica').text(isPaid ? 'Payment Status:' : 'Payment Due:', 350, 160);
      doc.fillColor(isPaid ? '#16A34A' : '#DC2626').font('Helvetica-Bold').text(isPaid ? 'PAID IN FULL' : dueDate, 450, 160);

      // 5. Itemized Table
      const tableTop = 205;
      doc.rect(40, tableTop, 515, 24).fill('#F8FAFC');
      doc.fillColor('#475467').fontSize(8.5).font('Helvetica-Bold');
      doc.text('ITEM / SERVICE DESCRIPTION', 50, tableTop + 7);
      doc.text('QTY', 360, tableTop + 7, { width: 40, align: 'center' });
      doc.text('UNIT PRICE', 410, tableTop + 7, { width: 60, align: 'right' });
      doc.text('TOTAL', 480, tableTop + 7, { width: 65, align: 'right' });

      // Table Row
      const rowY = tableTop + 34;
      doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text(description, 50, rowY);
      doc.fillColor('#64748B').fontSize(8).font('Helvetica').text('Official WAPPPILOT enterprise service delivery & SLA', 50, rowY + 14);

      doc.fillColor('#0F172A').fontSize(9).font('Helvetica').text('1', 360, rowY + 4, { width: 40, align: 'center' });
      doc.text(formattedAmount, 410, rowY + 4, { width: 60, align: 'right' });
      doc.font('Helvetica-Bold').text(formattedAmount, 480, rowY + 4, { width: 65, align: 'right' });

      // Table Bottom Line
      doc.moveTo(40, rowY + 36).lineTo(555, rowY + 36).strokeColor('#E2E8F0').lineWidth(0.75).stroke();

      // 6. Summary Totals (Right Aligned)
      const summaryY = rowY + 48;
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('Subtotal:', 350, summaryY);
      doc.fillColor('#0F172A').text(formattedAmount, 450, summaryY, { width: 95, align: 'right' });

      doc.fillColor('#64748B').text('Taxes & GST (0%):', 350, summaryY + 16);
      doc.fillColor('#0F172A').text('INR 0.00', 450, summaryY + 16, { width: 95, align: 'right' });

      doc.rect(340, summaryY + 34, 215, 30).fill(isPaid ? '#F0FDF4' : '#F4F0FD');
      doc.fillColor(isPaid ? '#15803D' : '#6D28D9').fontSize(11).font('Helvetica-Bold').text(isPaid ? 'Total Paid:' : 'Total Due:', 350, summaryY + 43);
      doc.text(formattedAmount, 450, summaryY + 43, { width: 95, align: 'right' });

      // 7. Payment Action Box (Bottom)
      const actionY = 410;
      if (isPaid) {
        doc.roundedRect(40, actionY, 515, 120, 8).fillAndStroke('#F0FDF4', '#86EFAC');
        doc.fillColor('#15803D').fontSize(12).font('Helvetica-Bold').text('Official Tax Payment Receipt', 55, actionY + 15);
        doc.fillColor('#166534').fontSize(9).font('Helvetica');
        doc.text(`Payment received with thanks via ${paymentMethod}.`, 55, actionY + 35);
        doc.text(`Transaction Reference: ${transactionId || 'TXN-' + Date.now().toString(36).toUpperCase()}`, 55, actionY + 50);
        doc.text(`Receipt Generated At: ${paymentDate || new Date().toLocaleString('en-IN')}`, 55, actionY + 65);
        doc.text('This is a verified digital invoice receipt and does not require physical signature.', 55, actionY + 85);
      } else {
        doc.roundedRect(40, actionY, 515, 125, 8).fillAndStroke('#F8FAFC', '#CBD5E1');
        doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('How to Pay Online', 55, actionY + 15);
        doc.fillColor('#475467').fontSize(8.5).font('Helvetica');
        doc.text('Click the secure online payment link below or pay via UPI / Cards / NetBanking:', 55, actionY + 32);

        // Payment Link Box
        doc.roundedRect(55, actionY + 48, 485, 32, 6).fillAndStroke('#EEF2FF', '#C7D2FE');
        doc.fillColor('#4338CA').fontSize(9).font('Helvetica-Bold').text(`Pay Online: ${paymentLink || 'https://dhigrowth.com/pay/' + invoiceId}`, 70, actionY + 59);

        doc.fillColor('#64748B').fontSize(8).font('Helvetica').text('Accepted Methods: UPI (Google Pay, PhonePe, Paytm), Visa, Mastercard, NetBanking.', 55, actionY + 92);
        doc.text('Once paid, an official confirmation receipt will be instantly dispatched to your WhatsApp.', 55, actionY + 104);
      }

      // 8. Footer Notes
      const footerY = 740;
      doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(
        'DhiGrowth IT Services  ·  GSTIN: 29AABCU9603R1ZM  ·  https://dhigrowth.com',
        40,
        footerY + 10,
        { align: 'center', width: 515 }
      );
      doc.text(
        'Questions? Contact billing at support@dhigrowth.com or WhatsApp +91 97914 71277',
        40,
        footerY + 22,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
