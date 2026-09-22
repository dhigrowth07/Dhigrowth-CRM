const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Session mock for Super Admin to access all tabs
const superAdminSession = {
  username: 'admin',
  name: 'Super Administrator',
  email: 'admin@wapppilot.com',
  role: 'Super Administrator',
  isExternalClient: false,
  isSuperAdmin: true,
  isAdmin: true,
  organization: 'WAPPPILOT Platform Operations',
  workspaceId: 'b0000000-0000-0000-0000-000000000001',
  slug: 'admin',
  token: `wappilot_admin_session_${Date.now()}`,
  loginAt: new Date().toISOString(),
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Starting WAP PILOT screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 2 });

  // 1. Capture Login Page
  console.log('📸 1. Capturing Login Page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_page.png') });

  // 2. Inject Super Admin Auth Session into localStorage
  console.log('🔑 Injecting Super Admin session...');
  await page.evaluate((session) => {
    localStorage.setItem('dhigrowth_auth_session', JSON.stringify(session));
    localStorage.setItem('dhigrowth_auth_session_admin', JSON.stringify(session));
  }, superAdminSession);

  await page.reload({ waitUntil: 'networkidle0' });
  await sleep(1500);

  // Helper to click sidebar nav items
  async function clickTab(label) {
    try {
      const clicked = await page.evaluate((btnLabel) => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const target = buttons.find((b) => b.textContent && b.textContent.trim().toLowerCase().includes(btnLabel.toLowerCase()));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, label);
      await sleep(1200);
      return clicked;
    } catch (e) {
      console.warn(`Click ${label} note:`, e.message);
      return false;
    }
  }

  // 2. Dashboard
  console.log('📸 2. Capturing Dashboard...');
  await clickTab('Dashboard');
  await sleep(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard_overview.png') });

  // 3. Team Inbox & WhatsApp Chat
  console.log('📸 3. Capturing Team Inbox & WhatsApp Live Chat...');
  await clickTab('Team Inbox');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_team_inbox_chat.png') });

  // 4. Message Templates & Meta Approvals
  console.log('📸 4. Capturing WhatsApp Templates & Meta Approval...');
  await clickTab('Templates');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_message_templates.png') });

  // 5. Open Template Edit Modal for detailed preview
  console.log('📸 5. Capturing Template Editor Modal...');
  try {
    const opened = await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Edit'));
      if (editBtns.length > 0) {
        editBtns[0].click();
        return true;
      }
      return false;
    });
    if (opened) {
      await sleep(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_template_editor_modal.png') });
      // Close modal
      await page.evaluate(() => {
        const cancelBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent && b.textContent.includes('Cancel'));
        if (cancelBtn) cancelBtn.click();
      });
      await sleep(500);
    }
  } catch (e) {
    console.warn('Template edit modal note:', e.message);
  }

  // 6. Workflow Automations
  console.log('📸 6. Capturing Workflow Automations...');
  await clickTab('Automations');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_workflow_automations.png') });

  // 7. Broadcast Campaigns
  console.log('📸 7. Capturing Campaigns & Broadcasts...');
  await clickTab('Campaigns');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_broadcast_campaigns.png') });

  // 8. CRM Leads & Contacts
  console.log('📸 8. Capturing CRM Contacts & Leads...');
  await clickTab('Contacts');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_crm_leads.png') });

  // 9. Payment Due & Invoicing
  console.log('📸 9. Capturing Invoicing & WhatsApp Payment Due...');
  await clickTab('Invoicing');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_payment_due_invoices.png') });

  // 10. AI Studio
  console.log('📸 10. Capturing AI Business Studio...');
  await clickTab('AI Studio');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_ai_business_studio.png') });

  // 11. Super Admin Tenants & User Management
  console.log('📸 11. Capturing Super Admin Tenants & Users Directory...');
  await clickTab('Tenants');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_superadmin_tenants.png') });

  // 12. Channels & Meta WhatsApp Cloud API Configuration
  console.log('📸 12. Capturing Channels & WhatsApp Cloud API Setup...');
  await clickTab('Channels');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_channels_meta_api.png') });

  // 13. Wallet & Usage Billing
  console.log('📸 13. Capturing Wallet & Billing...');
  await clickTab('Wallet');
  await sleep(1200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_wallet_billing.png') });

  await browser.close();
  console.log('🎉 All screenshots captured successfully in screenshots/ directory!');
})();
