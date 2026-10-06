import { env } from '../config/env.js';
import {
  invoices,
  createAndSendInvoice,
  getWorkspaceInvoices,
  getInvoiceById,
  markInvoicePaid,
  verifyInvoicePayment,
  renderCheckoutHtml,
  renderHostedPayPage,
  broadcastDueInvoicesToAll,
} from '../services/billing/invoice.service.js';
import { generateInvoicePdf } from '../utils/invoicePdfGenerator.js';

/**
 * GET /api/invoices
 * Retrieve all generated customer invoices for a workspace
 */
export function getInvoices(req, res) {
  try {
    const workspaceId =
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const invoicesList = getWorkspaceInvoices(workspaceId);
    return res.status(200).json({
      success: true,
      count: invoicesList.length,
      invoices: invoicesList,
    });
  } catch (err) {
    console.error('[InvoicesController] Error getting invoices:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/invoices/:id
 * Retrieve details for a specific invoice
 */
export function getInvoice(req, res) {
  try {
    const invoiceId = req.params.id;
    const invoice = getInvoiceById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, error: `Invoice "${invoiceId}" not found` });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (err) {
    console.error('[InvoicesController] Error getting invoice:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/invoices/:id/pdf
 * Download or stream vector PDF for a specific invoice
 */
export async function getInvoicePdf(req, res) {
  try {
    const invoiceId = req.params.id;
    const invoice = getInvoiceById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ success: false, error: `Invoice "${invoiceId}" not found` });
    }

    const rawInvoice = invoices.get(invoiceId);
    let pdfBuffer = rawInvoice?.paidPdfBuffer || rawInvoice?.duePdfBuffer;

    if (!pdfBuffer) {
      pdfBuffer = await generateInvoicePdf({
        invoiceId: invoice.id,
        customerName: invoice.customerName || 'Valued Client',
        phone: invoice.phone || '',
        email: invoice.email || '',
        city: invoice.city || 'India',
        description: invoice.description || 'DhiGrowth Business Solutions & IT Services',
        amount: invoice.amount,
        status: invoice.status || 'due',
        paymentLink: invoice.paymentLink || '',
        transactionId: invoice.paymentId || invoice.transactionId || '',
        paymentMethod: invoice.paymentMethod || 'UPI / NetBanking / Cards',
        paymentDate: invoice.paidAt || '',
        gstPercentage: invoice.gstPercentage || 18,
      });

      if (rawInvoice) {
        if (invoice.status === 'paid') rawInvoice.paidPdfBuffer = pdfBuffer;
        else rawInvoice.duePdfBuffer = pdfBuffer;
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Invoice_${invoice.id}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('[InvoicesController] Error rendering PDF:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/invoices
 * Create a GST invoice record and optionally dispatch Due PDF to WhatsApp
 */
export async function createInvoice(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      customerName,
      phone,
      email,
      city,
      description = 'DhiGrowth Business Solutions & IT Services',
      amount,
      gstPercentage = 18,
      dispatchToWhatsApp = true,
      messageTemplate,
      baseUrl,
      conversationId,
      userId,
      username,
      slug,
    } = req.body || {};

    if (!customerName || !phone || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: 'customerName, phone, and amount are required to create an invoice',
      });
    }

    const hostBaseUrl = baseUrl || (req.protocol && req.get ? `${req.protocol}://${req.get('host')}` : 'http://localhost:4000');

    const result = await createAndSendInvoice({
      customerName,
      phone,
      email,
      city,
      description,
      amount: Number(amount),
      gstPercentage,
      dispatchToWhatsApp,
      messageTemplate,
      baseUrl: hostBaseUrl,
      conversationId,
      workspaceId,
      userId,
      username,
      slug,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[InvoicesController] Error creating invoice:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/invoices/broadcast
 * Bulk generate and dispatch Due Invoices to a recipient audience
 */
export async function broadcastInvoices(req, res) {
  try {
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'] ||
      env.VITE_DEFAULT_WORKSPACE_ID ||
      'b0000000-0000-0000-0000-000000000001';

    const {
      contacts = [],
      description,
      amount = 2499,
      messageTemplate,
      baseUrl,
      userId,
      username,
      slug,
    } = req.body || {};

    const hostBaseUrl = baseUrl || (req.protocol && req.get ? `${req.protocol}://${req.get('host')}` : 'http://localhost:4000');

    const summary = await broadcastDueInvoicesToAll({
      contacts,
      description,
      amount: Number(amount) || 2499,
      messageTemplate,
      baseUrl: hostBaseUrl,
      workspaceId,
      userId,
      username,
      slug,
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error('[InvoicesController] Error broadcasting invoices:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/invoices/:id/verify-payment & POST /api/invoices/:id/pay
 * Confirm invoice payment and dispatch Paid Receipt PDF to customer on WhatsApp
 */
export async function verifyPayment(req, res) {
  try {
    const invoiceId = req.params.id;
    const existing = getInvoiceById(invoiceId);

    if (!existing) {
      return res.status(404).json({ success: false, error: `Invoice "${invoiceId}" not found` });
    }

    const {
      paymentId,
      orderId,
      transactionId,
      paymentMethod = 'UPI / Online Payment',
      paidAt,
      baseUrl,
      workspaceId,
    } = req.body || {};

    const hostBaseUrl = baseUrl || (req.protocol && req.get ? `${req.protocol}://${req.get('host')}` : 'http://localhost:4000');

    const result = await markInvoicePaid(invoiceId, {
      paymentId,
      orderId,
      transactionId: transactionId || paymentId || `pay_${Date.now()}`,
      paymentMethod,
      paidAt,
      baseUrl: hostBaseUrl,
      workspaceId: workspaceId || existing.workspaceId,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[InvoicesController] Error verifying invoice payment:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /pay/:id & GET /invoices/:id/pay
 * Hosted responsive checkout HTML page with direct Razorpay integration
 */
export function renderCheckoutPage(req, res) {
  try {
    const invoiceId = req.params.id;
    const invoice = getInvoiceById(invoiceId);

    if (!invoice) {
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice Not Found - WAPPILOT</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { text-align: center; max-width: 400px; padding: 40px; background: #1e293b; border-radius: 16px; border: 1px solid #334155; }
            h1 { font-size: 24px; margin-bottom: 12px; color: #f43f5e; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Invoice Not Found</h1>
            <p>The invoice "${invoiceId}" could not be located or may have been deleted.</p>
          </div>
        </body>
        </html>
      `);
    }

    const html = renderCheckoutHtml(invoice);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (err) {
    console.error('[InvoicesController] Error rendering checkout page:', err);
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send('<h3>Error loading invoice checkout page.</h3>');
  }
}

// Aliases for parity
export const getInvoicesList = getInvoices;
export const getAllInvoices = getInvoices;
export const getInvoiceByIdController = getInvoice;
export const createAndSendInvoiceController = createInvoice;
export const broadcastInvoicesController = broadcastInvoices;
export const broadcastDueInvoices = broadcastInvoices;
export const verifyInvoicePaymentController = verifyPayment;
export const payInvoice = verifyPayment;
export const renderPayCheckoutPage = renderCheckoutPage;

export default {
  getInvoices,
  getInvoicesList,
  getInvoice,
  getInvoicePdf,
  createInvoice,
  createAndSendInvoiceController,
  broadcastInvoices,
  broadcastDueInvoices,
  verifyPayment,
  verifyInvoicePaymentController,
  payInvoice,
  renderCheckoutPage,
};
