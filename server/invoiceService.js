import { generateInvoicePdf } from './invoicePdfGenerator.js';
import { getTenantMetaConfig } from './tenantMetaManager.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const INVOICES_FILE = path.resolve(__dirname, 'invoices.json');

// In-memory invoice storage with JSON file persistence
export const invoices = new Map();

function loadInvoicesFromDisk() {
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8'));
      Object.entries(data).forEach(([k, v]) => invoices.set(k, v));
      console.log(`📂 [Invoices] Loaded ${invoices.size} invoices from ${INVOICES_FILE}`);
    }
  } catch (e) {
    console.warn('[Invoices] Could not load invoices from disk:', e.message);
  }
}

export function saveInvoicesToDisk() {
  try {
    const obj = {};
    for (const [k, v] of invoices.entries()) {
      const { duePdfBuffer: _d, paidPdfBuffer: _p, ...clean } = v;
      obj[k] = clean;
    }
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Invoices] Could not save invoices to disk:', e.message);
  }
}

loadInvoicesFromDisk();

/**
 * Log message in Supabase with guaranteed valid conversation_id and message_type
 */
async function logSupabaseMessage({ conversationId, phone, text, type = 'document', externalMessageId = null }) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let targetConvId = conversationId;

    // 1. Verify if targetConvId exists in conversations
    if (targetConvId) {
      const { data: checkConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', targetConvId)
        .maybeSingle();
      if (!checkConv) {
        targetConvId = null;
      }
    }

    // 2. If targetConvId was invalid (e.g. was contact ID or fallback), find conversation by phone
    if (!targetConvId && phone) {
      const clean = phone.replace(/[^0-9]/g, '');
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, phone_number');
      
      const matchedContact = (contacts || []).find((c) => {
        const cPhone = (c.phone_number || '').replace(/[^0-9]/g, '');
        return cPhone && (cPhone === clean || cPhone.endsWith(clean) || clean.endsWith(cPhone));
      });

      if (matchedContact) {
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('contact_id', matchedContact.id)
          .maybeSingle();
        if (conv) {
          targetConvId = conv.id;
        }
      }
    }

    // 3. Fallback to any active conversation if still not found
    if (!targetConvId) {
      const { data: latestConv } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (latestConv) {
        targetConvId = latestConv.id;
      }
    }

    if (!targetConvId) {
      console.warn('[Invoice Log Warning] No valid conversation found to log message.');
      return;
    }

    const { data: inserted, error: insertError } = await supabase.from('messages').insert([
      {
        workspace_id: process.env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',
        conversation_id: targetConvId,
        channel_id: 'd0000000-0000-0000-0000-000000000001',
        direction: 'outbound',
        ai_generated: false,
        type: 'document',
        content: text,
        status: externalMessageId ? 'sent' : 'delivered',
        external_message_id: externalMessageId,
      },
    ]).select();

    if (insertError) {
      console.error('[Invoice Log Error] Insert failed:', insertError);
    } else {
      console.log('✅ [Invoice Log] Inserted message into conversation:', targetConvId, inserted?.[0]?.id);
    }

    await supabase
      .from('conversations')
      .update({
        last_message_text: text,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', targetConvId);
  } catch (err) {
    console.warn('[Invoice Log Warning] Could not log to Supabase:', err.message);
  }
}


/**
 * Resolve active Meta WhatsApp credentials for tenant or workspace
 */
export function resolveMetaCredentials({ workspaceId, userId, username, slug } = {}) {
  let config = getTenantMetaConfig({
    workspaceId: workspaceId || process.env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',
    userId,
    username: username || 'sri',
    slug,
  });

  if (!config?.accessToken || !config?.phoneNumberId) {
    config = getTenantMetaConfig({ workspaceId: 'b0000000-0000-0000-0000-000000000001', username: 'sri' });
  }

  const phoneId = config?.phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701';
  const token = config?.accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;

  return { phoneId, token };
}

/**
 * Upload PDF buffer to Meta WhatsApp Cloud API /media
 */
export async function uploadPdfToMeta(pdfBuffer, filename = 'invoice.pdf', metaContext = {}) {
  const { phoneId, token } = resolveMetaCredentials(metaContext);

  if (!token || !phoneId) {
    console.warn('[Meta Media] Missing active Meta WhatsApp access token or phone ID');
    return null;
  }

  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', 'application/pdf');
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), filename);

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/media`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.id) {
    console.error('[Meta Media Upload Error]', data);
    throw new Error(data.error?.message || 'Failed to upload PDF to Meta');
  }

  console.log(`📎 [Meta Media] Uploaded ${filename} -> Media ID: ${data.id}`);
  return data.id;
}

/**
 * Send WhatsApp Document Message via Meta Cloud API
 */
export async function sendWhatsAppDocument({ toPhone, mediaId, filename, caption, pdfUrl, metaContext = {} }) {
  const { phoneId, token } = resolveMetaCredentials(metaContext);
  const cleanPhone = toPhone.replace(/[^0-9]/g, '');

  if (!token || !phoneId) {
    console.warn('[Meta Document] Missing active Meta WhatsApp access token or phone ID');
    return { success: false, error: 'Missing active Meta credentials' };
  }

  const documentPayload = {
    filename: filename,
    caption: caption,
  };
  if (mediaId) {
    documentPayload.id = mediaId;
  } else if (pdfUrl) {
    documentPayload.link = pdfUrl;
  }

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'document',
      document: documentPayload,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Meta Document Send Error]', data);
    return { success: false, error: data.error };
  }

  console.log(`✅ [Meta Document Dispatched] ID: ${data.messages?.[0]?.id} to ${cleanPhone}`);
  return { success: true, messageId: data.messages?.[0]?.id };
}

/**
 * Create an invoice and optionally dispatch Due PDF to WhatsApp
 */
export async function createAndSendInvoice({
  customerName = 'Valued Client',
  phone = '919791471277',
  email = '',
  city = 'Mumbai, IN',
  description = 'WAPPPILOT WhatsApp CRM & AI Concierge',
  amount = 2499,
  conversationId = 'c1000000-0000-0000-0000-000000000001',
  messageTemplate = '',
  baseUrl = 'http://localhost:4000',
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  userId = null,
  username = 'sri',
  slug = null,
}) {
  const invoiceNum = 'INV-' + Math.floor(100000 + Math.random() * 900000);
  const paymentLink = `${baseUrl}/invoices/${invoiceNum}/pay`;

  const invoice = {
    id: invoiceNum,
    customerName,
    phone,
    email,
    city,
    description,
    amount: Number(amount) || 2499,
    status: 'due',
    paymentLink,
    conversationId,
    workspaceId: workspaceId || 'b0000000-0000-0000-0000-000000000001',
    createdAt: new Date().toISOString(),
    transactionId: null,
    paymentMethod: null,
    paymentDate: null,
  };

  invoices.set(invoiceNum, invoice);

  // Generate Due PDF
  const pdfBuffer = await generateInvoicePdf(invoice);
  invoice.duePdfBuffer = pdfBuffer;

  // Upload to Meta & Send to WhatsApp
  let metaResult = null;
  const filename = `Invoice_${invoice.id}.pdf`;
  const formattedAmount = `INR ${invoice.amount.toLocaleString('en-IN')}`;

  // Custom User Message Template (with dynamic variable tags) or default formal caption
  let caption;
  if (messageTemplate && messageTemplate.trim()) {
    caption = messageTemplate
      .replace(/\{\{\s*name\s*\}\}/gi, invoice.customerName)
      .replace(/\{\{\s*customerName\s*\}\}/gi, invoice.customerName)
      .replace(/\{\{\s*amount\s*\}\}/gi, formattedAmount)
      .replace(/\{\{\s*invoiceId\s*\}\}/gi, invoice.id)
      .replace(/\{\{\s*id\s*\}\}/gi, invoice.id)
      .replace(/\{\{\s*description\s*\}\}/gi, invoice.description)
      .replace(/\{\{\s*paymentLink\s*\}\}/gi, paymentLink);
  } else {
    caption = `🧾 *INVOICE DUE: ${invoice.id}*\n\nDear ${invoice.customerName},\nYour invoice for *${invoice.description}* has been issued.\n\n💳 *Amount Due:* ${formattedAmount}\n🔗 *Secure Payment Link:* ${paymentLink}\n\nClick the link above to pay via UPI, Cards, or NetBanking. Once completed, your official Paid Receipt PDF will be automatically sent here.\n\n_WAPPPILOT Business Solutions_`;
  }

  const metaContext = { workspaceId, userId, username, slug };

  try {
    const mediaId = await uploadPdfToMeta(pdfBuffer, filename, metaContext);
    if (mediaId) {
      metaResult = await sendWhatsAppDocument({
        toPhone: invoice.phone,
        mediaId,
        filename,
        caption,
        metaContext,
      });
    }
  } catch (err) {
    console.error('[Create & Send Invoice Error]', err);
    metaResult = { success: false, error: err.message };
  }

  // Log in Supabase
  await logSupabaseMessage({
    conversationId: invoice.conversationId,
    phone: invoice.phone,
    text: `🧾 [INVOICE DUE: ${invoice.id}]\nAmount: ${formattedAmount}\nService: ${invoice.description}\nPayment Link: ${paymentLink}`,
    type: 'document',
    externalMessageId: metaResult?.messageId || null,
  });

  saveInvoicesToDisk();

  const { duePdfBuffer: _d, paidPdfBuffer: _p, ...cleanInvoice } = invoice;
  return { invoice: cleanInvoice, metaResult };
}

/**
 * Mark an invoice as PAID and automatically send the Paid Receipt PDF to WhatsApp
 */
export async function markInvoicePaid(invoiceId, {
  transactionId = '',
  paymentMethod = 'UPI / Google Pay',
  customerName = '',
  phone = '',
  email = '',
  city = '',
  description = '',
  amount = 2499,
  conversationId = null,
  baseUrl = '',
  workspaceId = null,
  userId = null,
  username = 'sri',
  slug = null,
} = {}) {
  let invoice = invoices.get(invoiceId);
  if (!invoice) {
    loadInvoicesFromDisk();
    invoice = invoices.get(invoiceId);
  }

  // If still not in memory, construct it gracefully from parameters
  if (!invoice) {
    console.log(`ℹ️ [Invoice Auto-Construct] Invoice ${invoiceId} not found in memory, creating record...`);
    const resolvedBaseUrl = (baseUrl || process.env.VITE_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'https://api-wappilot.dhigrowth.com').replace(/\/+$/, '');
    invoice = {
      id: invoiceId,
      customerName: customerName || 'Valued Client',
      phone: phone || '919791471277',
      email: email || '',
      city: city || 'India',
      description: description || 'WAPPPILOT WhatsApp CRM & AI Business Concierge',
      amount: Number(amount) || 2499,
      status: 'due',
      paymentLink: `${resolvedBaseUrl}/invoices/${invoiceId}/pay`,
      conversationId: conversationId || null,
      workspaceId: workspaceId || 'b0000000-0000-0000-0000-000000000001',
      createdAt: new Date().toISOString(),
      transactionId: null,
      paymentMethod: null,
      paymentDate: null,
    };
    invoices.set(invoiceId, invoice);
  }

  if (invoice.status === 'paid') {
    const { duePdfBuffer: _d, paidPdfBuffer: _p, ...cleanInvoice } = invoice;
    return { invoice: cleanInvoice, alreadyPaid: true };
  }

  invoice.status = 'paid';
  invoice.transactionId = transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
  invoice.paymentMethod = paymentMethod;
  invoice.paymentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate Paid Receipt PDF
  const paidPdfBuffer = await generateInvoicePdf(invoice);

  // Upload Paid PDF to Meta & Send to WhatsApp
  let metaResult = null;
  const filename = `Receipt_${invoice.id}.pdf`;
  const formattedAmount = `INR ${invoice.amount.toLocaleString('en-IN')}`;
  const caption = `✅ *PAYMENT CONFIRMED / RECEIPT: ${invoice.id}*\n\nDear ${invoice.customerName},\nThank you! We have received your payment of *${formattedAmount}* for *${invoice.description}*.\n\n🛡️ *Transaction ID:* ${invoice.transactionId}\n💳 *Payment Mode:* ${invoice.paymentMethod}\n📅 *Paid On:* ${invoice.paymentDate}\n\nAttached is your official Tax Payment Receipt PDF.\n\n_Thank you for choosing WAPPPILOT Business Solutions! 🚀_`;

  const effectiveWorkspaceId = workspaceId || invoice.workspaceId || 'b0000000-0000-0000-0000-000000000001';
  const metaContext = { workspaceId: effectiveWorkspaceId, userId, username, slug };

  try {
    const mediaId = await uploadPdfToMeta(paidPdfBuffer, filename, metaContext);
    if (mediaId) {
      metaResult = await sendWhatsAppDocument({
        toPhone: invoice.phone,
        mediaId,
        filename,
        caption,
        metaContext,
      });
    }
  } catch (err) {
    console.error('[Mark Paid WhatsApp Error]', err);
    metaResult = { success: false, error: err.message };
  }

  // Log in Supabase
  await logSupabaseMessage({
    conversationId: invoice.conversationId,
    phone: invoice.phone,
    text: `✅ [PAYMENT RECEIVED: ${invoice.id}]\nAmount: ${formattedAmount}\nTransaction ID: ${invoice.transactionId}\nReceipt PDF sent to customer.`,
    type: 'document',
    externalMessageId: metaResult?.messageId || null,
  });

  saveInvoicesToDisk();

  const { duePdfBuffer: _d, paidPdfBuffer: _p, ...cleanInvoice } = invoice;
  return { invoice: cleanInvoice, metaResult };
}


/**
 * Render responsive payment checkout HTML page
 */
export function renderCheckoutHtml(invoice) {
  const isPaid = invoice.status === 'paid';
  const formattedAmount = `INR ${invoice.amount.toLocaleString('en-IN')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isPaid ? 'Payment Receipt' : 'Pay Invoice'} - ${invoice.id} | WAPPPILOT Business Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 24px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
      overflow: hidden;
    }
    .header {
      background: ${isPaid ? '#F0FDF4' : '#F4F0FD'};
      border-bottom: 1px solid ${isPaid ? '#DCFCE7' : '#E9D8FD'};
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-title {
      font-size: 16px;
      font-weight: 800;
      color: #101828;
    }
    .brand-sub {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
    .status-badge {
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: ${isPaid ? '#DCFCE7' : '#FEF2F2'};
      color: ${isPaid ? '#15803D' : '#DC2626'};
      border: 1px solid ${isPaid ? '#86EFAC' : '#FECACA'};
    }
    .body {
      padding: 24px;
    }
    .amount-box {
      background: #F8FAFC;
      border: 1px solid #EAECF0;
      border-radius: 16px;
      padding: 18px;
      text-align: center;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .amount-val {
      font-size: 32px;
      font-weight: 800;
      color: ${isPaid ? '#15803D' : '#7C3AED'};
      margin-top: 4px;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px dashed #E2E8F0;
      font-size: 13px;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-label {
      color: #64748B;
    }
    .details-val {
      font-weight: 600;
      color: #0F172A;
      text-align: right;
    }
    .payment-options {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #EAECF0;
    }
    .payment-title {
      font-size: 12px;
      font-weight: 700;
      color: #344054;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pay-btn {
      width: 100%;
      background: #7C3AED;
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      padding: 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
      transition: all 0.2s ease;
    }
    .pay-btn:hover {
      background: #6D28D9;
      transform: translateY(-1px);
    }
    .pay-btn:disabled {
      background: #94A3B8;
      cursor: not-allowed;
      transform: none;
    }
    .pdf-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      background: #F4F0FD;
      color: #7C3AED;
      border: 1px solid #E9D8FD;
      margin-top: 12px;
      transition: all 0.2s ease;
    }
    .pdf-btn:hover {
      background: #EDE5FA;
    }
    .success-alert {
      background: #F0FDF4;
      border: 1px solid #86EFAC;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    .success-icon {
      width: 48px;
      height: 48px;
      background: #DCFCE7;
      color: #15803D;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 11px;
      color: #94A3B8;
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="header">
      <div>
        <div class="brand-title">DhiGrowth IT Services</div>
        <div class="brand-sub">AI Business Solutions & WhatsApp Automation</div>
      </div>
      <div class="status-badge">
        ${isPaid ? '✓ Paid' : 'Due'}
      </div>
    </div>

    <div class="body">
      ${
        isPaid
          ? `
        <div class="success-alert">
          <div class="success-icon">✓</div>
          <h2 style="font-size: 18px; font-weight: 800; color: #15803D; margin-bottom: 4px;">Payment Completed</h2>
          <p style="font-size: 12px; color: #166534;">
            Your payment has been verified. The official PDF tax receipt has been sent to your WhatsApp (${invoice.phone}).
          </p>
        </div>
      `
          : ''
      }

      <div class="amount-box">
        <div class="amount-label">${isPaid ? 'Total Paid' : 'Amount Due'}</div>
        <div class="amount-val">${formattedAmount}</div>
      </div>

      <div>
        <div class="details-row">
          <span class="details-label">Invoice Reference</span>
          <span class="details-val">${invoice.id}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Billed To</span>
          <span class="details-val">${invoice.customerName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">WhatsApp Number</span>
          <span class="details-val">${invoice.phone}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Service / Description</span>
          <span class="details-val">${invoice.description}</span>
        </div>
        ${
          isPaid
            ? `
          <div class="details-row">
            <span class="details-label">Transaction ID</span>
            <span class="details-val" style="font-family: monospace;">${invoice.transactionId}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Payment Mode</span>
            <span class="details-val">${invoice.paymentMethod}</span>
          </div>
          <div class="details-row">
            <span class="details-label">Paid At</span>
            <span class="details-val">${invoice.paymentDate}</span>
          </div>
        `
            : `
          <div class="details-row">
            <span class="details-label">Payment Status</span>
            <span class="details-val" style="color: #DC2626;">Pending Payment</span>
          </div>
        `
        }
      </div>

      ${
        !isPaid
          ? `
        <div class="payment-options">
          <div class="payment-title">⚡ Instant Payment Methods</div>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 16px;">
            Supports UPI (GPay, PhonePe, Paytm, BHIM), NetBanking, and Debit/Credit cards.
          </p>
          <button id="payButton" class="pay-btn" onclick="executePayment()">
            <span>Pay ${formattedAmount} Now</span>
            <span>→</span>
          </button>
        </div>
      `
          : ''
      }

      <a href="/api/invoices/${invoice.id}/pdf" target="_blank" class="pdf-btn">
        📄 Download ${isPaid ? 'Paid Tax Receipt' : 'Invoice Due'} PDF
      </a>
    </div>
  </div>

  <div class="footer">
    DhiGrowth IT Services · GSTIN: 29AABCU9603R1ZM<br>
    Support: support@dhigrowth.com · WhatsApp: +91 97914 71277
  </div>

  <script>
    async function executePayment() {
      const btn = document.getElementById('payButton');
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = 'Processing Payment...';

      try {
        const res = await fetch('/api/invoices/${invoice.id}/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: 'UPI / Online Checkout',
          })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert('Payment error: ' + (data.error || 'Failed to process payment'));
          btn.disabled = false;
          btn.innerHTML = 'Pay ${formattedAmount} Now →';
        }
      } catch (err) {
        alert('Network error: ' + err.message);
        btn.disabled = false;
        btn.innerHTML = 'Pay ${formattedAmount} Now →';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Broadcast Payment Due Invoice PDFs to all contacts
 * If a customer pays via the payment link, markInvoicePaid will automatically dispatch their Paid Receipt PDF to WhatsApp!
 */
export async function broadcastDueInvoicesToAll({
  contacts = [],
  description = 'WAPPPILOT WhatsApp CRM & AI Business Concierge',
  amount = 2499,
  messageTemplate = '',
  baseUrl = 'https://api-wappilot.dhigrowth.com',
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  userId = null,
  username = 'sri',
  slug = null,
} = {}) {
  let targetContacts = [...(contacts || [])];

  // If no contacts passed from frontend, query all contacts from Supabase
  if (targetContacts.length === 0) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase.from('contacts').select('*');
        if (!error && data && data.length > 0) {
          targetContacts = data.map((c) => ({
            name: c.full_name || 'Valued Client',
            phone: c.phone_number,
            email: c.email || '',
            city: c.custom_attributes?.city || 'India',
          }));
        }
      } catch (e) {
        console.warn('[Broadcast] Error querying Supabase contacts:', e.message);
      }
    }
  }

  // Deduplicate and filter contacts with phone numbers
  const seenPhones = new Set();
  const validContacts = [];
  for (const c of targetContacts) {
    const raw = c.phone || c.phone_number || '';
    const clean = raw.replace(/[^0-9]/g, '');
    if (clean && !seenPhones.has(clean)) {
      seenPhones.add(clean);
      validContacts.push({
        ...c,
        phone: clean,
      });
    }
  }

  console.log(`📢 [Broadcast Invoices] Starting broadcast to ${validContacts.length} contacts...`);
  const results = [];

  for (const contact of validContacts) {
    try {
      const result = await createAndSendInvoice({
        customerName: contact.name || contact.full_name || 'Valued Client',
        phone: contact.phone,
        email: contact.email || '',
        city: contact.city || 'India',
        description,
        amount: Number(amount) || 2499,
        conversationId: contact.conversationId || null,
        messageTemplate,
        baseUrl,
        workspaceId,
        userId,
        username,
        slug,
      });

      results.push({
        name: contact.name || contact.phone,
        phone: contact.phone,
        invoiceId: result.invoice?.id,
        paymentLink: result.invoice?.paymentLink,
        success: true,
        metaDelivered: Boolean(result.metaResult?.messageId),
      });
    } catch (err) {
      console.error(`❌ [Broadcast Invoices] Error for ${contact.phone}:`, err.message);
      results.push({
        name: contact.name || contact.phone,
        phone: contact.phone,
        success: false,
        error: err.message,
      });
    }
  }

  console.log(`✅ [Broadcast Invoices] Completed: ${results.filter((r) => r.success).length}/${validContacts.length} sent.`);

  return {
    total: validContacts.length,
    dispatched: results.filter((r) => r.success).length,
    results,
  };
}

