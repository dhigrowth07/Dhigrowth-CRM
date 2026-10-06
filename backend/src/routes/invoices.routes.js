import { Router } from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceByIdController,
  getInvoicePdf,
  verifyPayment,
  broadcastInvoicesController,
  renderPayCheckoutPage,
} from '../controllers/invoices.controller.js';

const router = Router();

/**
 * Invoicing, PDFKit Vector Bills & Hosted Checkout Routes
 * Handles GST invoices creation, WhatsApp document delivery via Meta Cloud API,
 * dynamic PDF downloads, hosted responsive /pay/:id checkout portal, and receipt dispatch.
 */

// 1. Invoice Management
router.get('/api/invoices', getAllInvoices);
router.post('/api/invoices', createInvoice);
router.post('/api/invoices/broadcast', broadcastInvoicesController);

// 2. Individual Invoice & Dynamic PDFKit Vector Streaming
router.get('/api/invoices/:id', getInvoiceByIdController);
router.get('/api/invoices/:id/pdf', getInvoicePdf);

// 3. Payment Verification & Automated Receipt Dispatch
router.post('/api/invoices/:id/verify-payment', verifyPayment);

// 4. Hosted Mobile-Responsive Checkout Portal
router.get('/pay/:id', renderPayCheckoutPage);

export default router;
