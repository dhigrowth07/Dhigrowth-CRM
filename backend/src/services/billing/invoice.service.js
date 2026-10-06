import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { supabase } from '../../config/supabase.js';
import { generateInvoicePdf } from '../../utils/invoicePdfGenerator.js';
import { getTenantMetaConfig } from '../meta/tenantMetaManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INVOICES_FILE = path.resolve(__dirname, '../../../data/invoices.json');

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
    const parentDir = path.dirname(INVOICES_FILE);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
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
    if (!supabase) return;

    let targetConvId = conversationId;

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
        workspace_id: env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',
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
    workspaceId: workspaceId || env.VITE_DEFAULT_WORKSPACE_ID || 'b0000000-0000-0000-0000-000000000001',
    userId,
    username: username || 'sri',
    slug,
  });

  if (!config?.accessToken || !config?.phoneNumberId) {
    config = getTenantMetaConfig({ workspaceId: 'b0000000-0000-0000-0000-000000000001', username: 'sri' });
  }

  const phoneId = config?.phoneNumberId || env.META_WHATSAPP_PHONE_NUMBER_ID || '1272943605907701';
  const token = config?.accessToken || env.META_WHATSAPP_ACCESS_TOKEN;

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
    filename,
    caption,
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
  description = 'WAPPILOT WhatsApp CRM & AI Concierge',
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

  const pdfBuffer = await generateInvoicePdf({
    invoiceId: invoice.id,
    customerName: invoice.customerName,
    phone: invoice.phone,
    email: invoice.email,
    city: invoice.city,
    description: invoice.description,
    amount: invoice.amount,
    status: invoice.status,
    paymentLink: invoice.paymentLink,
  });
  invoice.duePdfBuffer = pdfBuffer;

  let metaResult = null;
  const filename = `Invoice_${invoice.id}.pdf`;
  const formattedAmount = `INR ${invoice.amount.toLocaleString('en-IN')}`;

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
    caption = `🧾 *INVOICE DUE: ${invoice.id}*\n\nDear ${invoice.customerName},\nYour invoice for *${invoice.description}* has been issued.\n\n💳 *Amount Due:* ${formattedAmount}\n🔗 *Secure Payment Link:* ${paymentLink}\n\nClick the link above to pay via UPI, Cards, or NetBanking. Once completed, your official Paid Receipt PDF will be automatically sent here.\n\n_WAPPILOT Business Solutions_`;
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

// Alias for checklist compatibility
export const createInvoiceRecord = createAndSendInvoice;

/**
 * Get all invoices for a workspace
 */
export function getWorkspaceInvoices(workspaceId = 'b0000000-0000-0000-0000-000000000001') {
  const result = [];
  for (const inv of invoices.values()) {
    if (!workspaceId || inv.workspaceId === workspaceId || workspaceId === 'all') {
      const { duePdfBuffer: _d, paidPdfBuffer: _p, ...clean } = inv;
      result.push(clean);
    }
  }
  return result;
}

/**
 * Get an individual invoice by ID
 */
export function getInvoiceById(invoiceId) {
  let inv = invoices.get(invoiceId);
  if (!inv) {
    loadInvoicesFromDisk();
    inv = invoices.get(invoiceId);
  }
  if (!inv) return null;
  const { duePdfBuffer: _d, paidPdfBuffer: _p, ...clean } = inv;
  return clean;
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

  if (!invoice) {
    console.log(`ℹ️ [Invoice Auto-Construct] Invoice ${invoiceId} not found in memory, creating record...`);
    const resolvedBaseUrl = (baseUrl || env.VITE_BACKEND_URL || 'http://localhost:4000').replace(/\/+$/, '');
    invoice = {
      id: invoiceId,
      customerName: customerName || 'Valued Client',
      phone: phone || '919791471277',
      email: email || '',
      city: city || 'India',
      description: description || 'WAPPILOT WhatsApp CRM & AI Business Concierge',
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

  const paidPdfBuffer = await generateInvoicePdf({
    invoiceId: invoice.id,
    customerName: invoice.customerName,
    phone: invoice.phone,
    email: invoice.email,
    city: invoice.city,
    description: invoice.description,
    amount: invoice.amount,
    status: 'paid',
    transactionId: invoice.transactionId,
    paymentMethod: invoice.paymentMethod,
    paymentDate: invoice.paymentDate,
  });

  let metaResult = null;
  const filename = `Receipt_${invoice.id}.pdf`;
  const formattedAmount = `INR ${invoice.amount.toLocaleString('en-IN')}`;
  const caption = `✅ *PAYMENT CONFIRMED / RECEIPT: ${invoice.id}*\n\nDear ${invoice.customerName},\nThank you! We have received your payment of *${formattedAmount}* for *${invoice.description}*.\n\n🛡️ *Transaction ID:* ${invoice.transactionId}\n💳 *Payment Mode:* ${invoice.paymentMethod}\n📅 *Paid On:* ${invoice.paymentDate}\n\nAttached is your official Tax Payment Receipt PDF.\n\n_Thank you for choosing WAPPILOT Business Solutions! 🚀_`;

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

// Alias for checklist compatibility
export const verifyInvoicePayment = markInvoicePaid;

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
  <title>${isPaid ? 'Payment Receipt' : 'Pay Invoice'} - ${invoice.id} | WAPPILOT Business Solutions</title>
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
      font-size: 18px;
      font-weight: 800;
      color: ${isPaid ? '#15803D' : '#6B21A8'};
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 9999px;
      background: ${isPaid ? '#DCFCE7' : '#FEF3C7'};
      color: ${isPaid ? '#15803D' : '#B45309'};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .body-content {
      padding: 28px 24px;
    }
    .amount-box {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 13px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .amount-val {
      font-size: 32px;
      font-weight: 800;
      color: #0F172A;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
      font-size: 14px;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-lbl {
      color: #64748B;
      font-weight: 500;
    }
    .meta-val {
      color: #0F172A;
      font-weight: 600;
      text-align: right;
    }
    .pay-btn {
      display: block;
      width: 100%;
      background: #2563EB;
      color: #FFFFFF;
      text-align: center;
      padding: 16px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      margin-top: 24px;
      border: none;
      box-shadow: 0 10px 15px -3px rgba(37,99,235,0.25);
    }
    .pay-btn:hover {
      background: #1D4ED8;
    }
    .footer-note {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand-title">WAPPILOT Billing</div>
      <div class="badge">${invoice.status}</div>
    </div>
    <div class="body-content">
      <div class="amount-box">
        <div class="amount-label">${isPaid ? 'Total Paid' : 'Amount Due'}</div>
        <div class="amount-val">${formattedAmount}</div>
      </div>
      <div class="meta-row">
        <div class="meta-lbl">Invoice ID</div>
        <div class="meta-val">${invoice.id}</div>
      </div>
      <div class="meta-row">
        <div class="meta-lbl">Client Name</div>
        <div class="meta-val">${invoice.customerName}</div>
      </div>
      <div class="meta-row">
        <div class="meta-lbl">Description</div>
        <div class="meta-val">${invoice.description}</div>
      </div>
      ${isPaid ? `
      <div class="meta-row">
        <div class="meta-lbl">Transaction ID</div>
        <div class="meta-val">${invoice.transactionId || 'N/A'}</div>
      </div>
      <div class="meta-row">
        <div class="meta-lbl">Paid Date</div>
        <div class="meta-val">${invoice.paymentDate || 'N/A'}</div>
      </div>
      ` : `
      <div class="meta-row">
        <div class="meta-lbl">Payment Status</div>
        <div class="meta-val" style="color: #DC2626;">Pending Payment</div>
      </div>
      `}
      <a href="/api/invoices/${invoice.id}/pdf" target="_blank" style="display:block;margin-top:14px;padding:12px;background:#F1F5F9;border-radius:12px;text-align:center;color:#475569;text-decoration:none;font-weight:600;font-size:13px;border:1px solid #E2E8F0;">
        📄 Download ${isPaid ? 'Paid Tax Receipt' : 'Invoice Due'} PDF
      </a>
      ${!isPaid ? `
      <button class="pay-btn" id="payButton" onclick="handlePayment()">Pay via UPI / Cards</button>
      ` : ''}
    </div>
  </div>
  <div class="footer-note">Secured by 256-bit encryption · WAPPILOT Systems</div>

  ${!isPaid ? `
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    async function handlePayment() {
      const btn = document.getElementById('payButton');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Processing Payment...';
      }
      try {
        const res = await fetch('/api/invoices/${invoice.id}/pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: 'UPI / Online Checkout' })
        });
        const data = await res.json();
        if (data.success && data.razorpayOrder) {
          const options = {
            key: data.razorpayKeyId,
            amount: data.razorpayOrder.amount,
            currency: 'INR',
            name: 'WAPPILOT Billing',
            description: '${invoice.description}',
            order_id: data.razorpayOrder.id,
            handler: function (response) {
              window.location.reload();
            }
          };
          const rzp = new Razorpay(options);
          rzp.open();
        } else if (data.success) {
          window.location.reload();
        } else {
          alert(data.message || data.error || 'Payment initiation failed.');
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Pay via UPI / Cards';
          }
        }
      } catch (err) {
        alert('Network error: ' + err.message);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Pay via UPI / Cards';
        }
      }
    }
  </script>
  ` : ''}
</body>
</html>`;
}

// Alias for checklist compatibility
export const renderHostedPayPage = renderCheckoutHtml;

/**
 * Broadcast Payment Due Invoice PDFs to all contacts
 * If a customer pays via the payment link, markInvoicePaid will automatically dispatch their Paid Receipt PDF to WhatsApp!
 */
export async function broadcastDueInvoicesToAll({
  contacts = [],
  description = 'WAPPILOT WhatsApp CRM & AI Business Concierge',
  amount = 2499,
  messageTemplate = '',
  baseUrl = 'http://localhost:4000',
  workspaceId = 'b0000000-0000-0000-0000-000000000001',
  userId = null,
  username = 'sri',
  slug = null,
} = {}) {
  let targetContacts = [...(contacts || [])];

  // If no contacts passed from frontend, query all contacts from Supabase
  if (targetContacts.length === 0 && supabase) {
    try {
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

export default {
  invoices,
  saveInvoicesToDisk,
  createAndSendInvoice,
  createInvoiceRecord,
  getWorkspaceInvoices,
  getInvoiceById,
  markInvoicePaid,
  verifyInvoicePayment,
  renderCheckoutHtml,
  renderHostedPayPage,
  uploadPdfToMeta,
  sendWhatsAppDocument,
  broadcastDueInvoicesToAll,
};
