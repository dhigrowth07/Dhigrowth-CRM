import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

PRIMARY_OUT = r"C:\Users\SRIXX\Pictures\DHIGROWTH\NVVB- Hosur\Interior\WAP PILOT - WhatsApp Automation Software.docx"
SECONDARY_OUT = r"C:\Users\SRIXX\.gemini\antigravity\scratch\sendiee-ai-dashboard\WAP PILOT - WhatsApp Automation Software.docx"
SCREENSHOTS_DIR = r"C:\Users\SRIXX\.gemini\antigravity\scratch\sendiee-ai-dashboard\screenshots"

def create_document():
    doc = Document()

    # Configure Margins (0.75 in margin for clean presentation)
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Palette
    COLOR_PRIMARY = RGBColor(124, 58, 237)   # Purple #7C3AED
    COLOR_DARK = RGBColor(16, 24, 40)        # Dark Charcoal #101828
    COLOR_MUTED = RGBColor(71, 84, 103)      # Slate Gray #475467
    COLOR_GREEN = RGBColor(22, 163, 74)      # Emerald #16A34A

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(26)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(16)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK
        return p

    def add_contact_box(lines):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.8)
        
        # Shading
        shading = parse_xml(r'<w:shd {} w:fill="F4F0FD"/>'.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(shading)
        
        # Border
        borders = parse_xml(r'''
            <w:tcBorders {} >
                <w:top w:val="single" w:sz="6" w:space="0" w:color="E9D8FD"/>
                <w:left w:val="single" w:sz="18" w:space="0" w:color="7C3AED"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="E9D8FD"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="E9D8FD"/>
            </w:tcBorders>
        '''.format(nsdecls('w')))
        cell._tc.get_or_add_tcPr().append(borders)

        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(6)
        cp.paragraph_format.space_after = Pt(6)
        for i, (k, v) in enumerate(lines):
            p = cell.add_paragraph() if i > 0 else cp
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            r_k = p.add_run(k + ': ')
            r_k.font.name = 'Arial'
            r_k.font.bold = True
            r_k.font.size = Pt(10)
            r_k.font.color.rgb = COLOR_PRIMARY

            r_v = p.add_run(v)
            r_v.font.name = 'Arial'
            r_v.font.size = Pt(10)
            r_v.font.color.rgb = COLOR_DARK

        doc.add_paragraph().paragraph_format.space_after = Pt(10)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = COLOR_DARK
        return p

    def add_body(text, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10.5)
        run.font.italic = italic
        run.font.color.rgb = COLOR_MUTED
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        if bold_prefix:
            r_b = p.add_run(bold_prefix + ' ')
            r_b.font.name = 'Arial'
            r_b.font.bold = True
            r_b.font.size = Pt(10)
            r_b.font.color.rgb = COLOR_DARK
        r_t = p.add_run(text)
        r_t.font.name = 'Arial'
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = COLOR_MUTED
        return p

    def add_image_if_exists(filename, width_in=6.5):
        img_path = os.path.join(SCREENSHOTS_DIR, filename)
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(14)
            run = p.add_run()
            run.add_picture(img_path, width=Inches(width_in))
            print(f"  [+] Embedded image: {filename}")
        else:
            print(f"  [-] Image missing: {img_path}")

    # ==========================================
    # DOCUMENT CONTENT
    # ==========================================

    add_title("WAP PILOT")
    add_subtitle("WHATSAPP AUTOMATION & COMMERCIAL CRM PLATFORM")

    add_contact_box([
        ("PRODUCT", "WAP PILOT Enterprise SaaS (Meta WhatsApp Cloud API Certified)"),
        ("CONTACT NAME", "Kiruba Varshini"),
        ("DESIGNATION", "WAP PILOT Product Manager"),
        ("WHATSAPP / PHONE", "+91 86109 35770"),
        ("OFFICIAL EMAIL", "kirubavarshini54@gmail.com"),
        ("ADMIN PORTAL LINK", "https://admin.wapppilot.com / https://dhigrowth-crm.vercel.app/"),
    ])

    add_body("WAP PILOT bridges the gap between modern businesses and their customers by delivering a unified, autonomous WhatsApp Business infrastructure. Built on the official Meta WhatsApp Cloud API v20.0, WAP PILOT empowers enterprises, real estate firms, educational institutions, clinics, and e-commerce companies with multi-tenant workspace isolation, 24/7 autonomous AI concierges, official Meta template approval workflows, automated invoicing with PDF due collection, and bulk broadcast messaging.", italic=True)

    # 1. Executive Dashboard
    add_heading_1("1. Executive Dashboard: Omnichannel Business Command Center")
    add_body("The Executive Dashboard provides management with a real-time, comprehensive view of communication performance, active automations, contact growth, and revenue collection.")
    add_bullet("Live Meta Channel Status:", "Displays real-time WhatsApp Cloud API webhook connectivity, verified phone numbers, and encrypted channel health.")
    add_bullet("Key Operational Metrics:", "Total CRM Leads captured, active automated workflow bots, official WhatsApp messages delivered, read rates, and collection balance.")
    add_bullet("Quick Action Toolbar:", "1-click shortcuts to Add Customer/Lead, Schedule Broadcast Campaign, Create Meta Template, and Top-Up AI Credits.")
    add_bullet("Multi-Workspace Selector:", "Enables seamless switching between isolated company workspaces and client tenant partitions.")
    add_image_if_exists("02_dashboard_overview.png")

    # 2. Team Inbox & Live WhatsApp Chat
    add_heading_1("2. Team Inbox & WhatsApp Live Chat: Two-Way Customer Hub")
    add_body("A collaborative, enterprise-grade inbox designed for customer support teams and sales agents, featuring real-time speech bubbles, rich media support, and AI coexistence.")
    add_bullet("Two-Way Real-Time Messaging:", "Instant synchronization with Meta WhatsApp Cloud API webhooks with live delivered and read checkmarks.")
    add_bullet("AI Auto-Pilot vs Human Agent Toggle:", "One-click switch per conversation allowing agents to step in manually or hand off the chat to the autonomous AI Concierge.")
    add_bullet("Rich Media Attachments:", "Full support for sending and receiving public images, PDF brochures, invoices, audio notes, and catalog cards.")
    add_bullet("Customer Context Sidebar:", "Instant access to customer name, phone number, city, tags, assigned deal value, internal team notes, and conversation timestamps.")
    add_image_if_exists("03_team_inbox_chat.png")

    # 3. Message Templates & Meta Graph API Approvals
    add_heading_1("3. Message Templates & Official Meta Approval Workflow")
    add_body("WAP PILOT eliminates the hassle of WhatsApp template compliance by directly integrating with the Meta Graph API v20.0 for instant creation, dynamic token formatting, and official approval.")
    add_bullet("Official Meta Cloud API Formatting:", "Templates are automatically structured into Meta components: Header (Image/Text), Body with variables, Footer, and Quick Reply / Call-To-Action buttons.")
    add_bullet("Live Approval Status Tracking:", "Real-time query of Meta Graph API showing APPROVED (green badge), PENDING REVIEW (amber clock), or REJECTED (red badge).")
    add_bullet("Meta Compliance Notice Engine:", "Displays exact rejection reasons provided by Meta compliance guidelines directly on the template card for rapid adjustment.")
    add_bullet("Dynamic Variable Placeholders:", "Quick-insert buttons for + {{1}} Customer Name, + {{2}} Custom Param (City/Tariff), and + {{3}} Links/Offers.")
    add_bullet("Direct Meta Graph API Submission:", "1-click submission sends templates straight to Meta's review servers without needing to access Meta Business Manager manually.")
    add_bullet("Interactive Keyword Trigger Simulator:", "Type any customer test phrase (e.g., 'hi', 'price', 'app demo') to test which auto-reply template dispatches in real-time.")
    add_image_if_exists("04_message_templates.png")

    # 4. Template Editor Modal
    add_heading_1("4. Visual Template Editor with Realistic WhatsApp Mobile Preview")
    add_body("A visual builder designed for business owners to draft compliant message templates with instant preview of how customers view the message on their phones.")
    add_bullet("Realistic WhatsApp Bubble Preview:", "Interactive preview accurately renders image banners, bold text markdown (*bold*), and variable substitutions.")
    add_bullet("Curated Media Banner Presets:", "Instant selection of high-converting header banners for Tech, AI, Real Estate, E-Commerce, and Offers.")
    add_bullet("Official Approval Toggle:", "Optionally submits templates directly to Meta Cloud API for review immediately upon clicking Save.")
    add_image_if_exists("05_template_editor_modal.png")

    # 5. Workflow Automations
    add_heading_1("5. Workflow Automations & Intelligent Keyword Auto-Responder")
    add_body("Automate repetitive business workflows and guide leads toward conversion with zero manual intervention.")
    add_bullet("Keyword Match Triggers:", "Detects incoming trigger phrases such as 'order', 'quote', 'demo', 'pricing', 'support' in customer chats.")
    add_bullet("Multi-Step Automated Actions:", "Automatically sends interactive catalogs, dispatches approved templates, updates customer tags, or routes to human agents.")
    add_bullet("Active / Paused Controls:", "One-click toggles to activate or pause specific automated campaigns on the fly.")
    add_bullet("Test Trigger Runner:", "Simulate inbound keyword executions directly from the management console to verify bot response workflows.")
    add_image_if_exists("06_workflow_automations.png")

    # 6. Campaigns & WhatsApp Broadcasts
    add_heading_1("6. Campaigns & WhatsApp Bulk Broadcast Manager")
    add_body("Launch targeted, high-engagement WhatsApp broadcast marketing campaigns with industry-leading 98% open rates and verifiable ROI.")
    add_bullet("Segment-Based Broadcasts:", "Target specific audience segments (e.g. Hot Leads, Overdue Rent Tenants, New Enquiries) with personalized variables.")
    add_bullet("Full Lifecycle Delivery Analytics:", "Real-time tracking of Total Sent, Delivered, Read, Replied, Conversions, Revenue Generated, and ROAS.")
    add_bullet("Interactive Response Buttons:", "Equip broadcasts with quick-reply buttons ('Yes, Interested', 'Schedule Call', 'Pay Now') to drive immediate lead response.")
    add_image_if_exists("07_broadcast_campaigns.png")

    # 7. Contacts & CRM Leads
    add_heading_1("7. Contacts & Lead Management: Integrated Omnichannel CRM")
    add_body("A centralized directory organizing every customer contact, enquiry, and conversation history across all channels.")
    add_bullet("Comprehensive Contact Cards:", "Full Name, Phone Number, Email, City, Current Deal Value, and Lifetime Activity timestamps.")
    add_bullet("Color-Coded Lead Stage Tags:", "Categorize contacts as Hot Lead, Interested, Closed Won, Follow Up, or Inactive.")
    add_bullet("Fast Search & Multi-Tag Filters:", "Quickly isolate specific customer cohorts for follow-ups or bulk campaigns.")
    add_bullet("Bulk CSV Import & Manual Lead Creation:", "Effortlessly import existing customer databases or add new prospective clients in seconds.")
    add_image_if_exists("08_crm_leads.png")

    # 8. WhatsApp Invoicing & Payment Due
    add_heading_1("8. Invoicing & WhatsApp Payment Due Collection Engine")
    add_body("Eliminate delayed payments and manual follow-ups by generating and sending professional PDF invoices directly into customer WhatsApp chats.")
    add_bullet("Automated PDF Invoice Generator:", "Creates branded, itemized PDF tax invoices with item breakdowns, customer details, and total due.")
    add_bullet("1-Click WhatsApp Payment Due Broadcast:", "Dispatches overdue or upcoming payment reminders with the official PDF bill attached directly to WhatsApp.")
    add_bullet("Payment Status Tracking:", "Live classification of customer invoices as PAID, DUE, or OVERDUE.")
    add_bullet("Razorpay & Stripe Checkout Integration:", "Embedded payment links allowing customers to pay instantly via UPI, Cards, NetBanking, or Digital Wallets.")
    add_bullet("Automatic Status Reconciliation:", "Mark payments as settled manually or automatically via payment gateway webhook callbacks.")
    add_image_if_exists("09_payment_due_invoices.png")

    # 9. AI Business Studio
    add_heading_1("9. AI Business Studio: Autonomous 24/7 AI Concierge")
    add_body("Empower your WhatsApp Business with an intelligent generative AI agent trained specifically on your company's products, services, and policies.")
    add_bullet("Customizable System Persona:", "Define your AI Concierge's identity, tone of voice, greeting messages, and domain expertise.")
    add_bullet("Business Knowledge Base:", "Embed FAQs, pricing tables, operational hours, refund rules, and technical specifications.")
    add_bullet("Creativity & Temperature Controls:", "Tune the AI agent's response variability for strict factual accuracy vs creative consultative sales conversations.")
    add_bullet("Live Interactive Test Sandbox:", "Test real-time conversational responses in a simulated customer chat pane prior to deployment.")
    add_image_if_exists("10_ai_business_studio.png")

    # 10. Super Admin & Multi-Tenant Management
    add_heading_1("10. Super Admin Directory: Multi-Tenant Architecture & User Provisioning")
    add_body("Designed as a commercial SaaS product where administrators can provision independent tenant organizations and manage user accounts with strict database partitioning.")
    add_bullet("New User & Tenant Provisioning:", "Admins create new tenant accounts with Full Name, Email, Username, Password, Role, and Company Name.")
    add_bullet("Strict Data & Workspace Isolation:", "Each tenant user operates within an isolated workspaceId, ensuring templates, leads, automations, and chats remain strictly private.")
    add_bullet("Granular Permission Matrix:", "Toggle specific feature access per tenant: WhatsApp Cloud API keys, Broadcasts, AI Studio, Team Inbox, Invoicing, and Lead Management.")
    add_bullet("Direct Workspace Access URLs:", "Generates dedicated tenant onboarding and login URLs (e.g. ?tenant=company-slug) for branded customer access.")
    add_image_if_exists("11_superadmin_tenants.png")

    # 11. Channels & Meta WhatsApp Cloud API Setup
    add_heading_1("11. Omnichannel Hub & Official Meta WhatsApp Cloud API Setup")
    add_body("Connect and manage official Meta WhatsApp Business Accounts (WABA) alongside Instagram Direct, Facebook Messenger, and LINE in a unified gateway.")
    add_bullet("Official Meta Cloud API Infrastructure:", "Input Phone Number ID, WABA ID, and permanent System User Access Tokens.")
    add_bullet("1-Click Meta Embedded Signup:", "Direct OAuth onboarding flow enabling clients to connect their WhatsApp Business phone number in under 60 seconds.")
    add_bullet("Secure Webhook Gateway:", "Configured webhook endpoint (/webhook) with verify token handshakes ensuring verified, tamper-proof message ingestion.")
    add_image_if_exists("12_channels_meta_api.png")
    add_image_if_exists("13_whatsapp_business_channel.png")

    # 12. Wallet & Commercial Usage Billing
    add_heading_1("12. Wallet & Commercial SaaS Subscription Management")
    add_body("Transparent usage-based wallet accounting and flexible subscription plan tiers for enterprise operations.")
    add_bullet("Dual-Currency Balance Tracking:", "Real-time wallet monitoring in USD ($) and Indian Rupees (₹).")
    add_bullet("Instant Payment Gateway Top-Up:", "Recharge AI credits and template messaging balances via Razorpay or Stripe.")
    add_bullet("Audit Trail & Transaction Logs:", "Complete records of top-up dates, payment IDs, gateways used, and balance adjustments.")
    add_bullet("Commercial Tier Management:", "Support for Starter, Growth, and Enterprise subscription packages.")
    add_image_if_exists("14_wallet_billing.png")

    # 13. Summary & Commercial Availability
    add_heading_1("13. Commercial Readiness & Multi-Platform Availability")
    add_bullet("Web & Cloud Architecture:", "Hosted on high-availability cloud infrastructure with 99.9% uptime SLA.")
    add_bullet("Mobile Responsive UI:", "Fully optimized for desktop, tablet, and mobile browsers for on-the-go management.")
    add_bullet("Enterprise Data Security:", "End-to-end encrypted WhatsApp communication, isolated tenant schemas, and bcrypt credential hashing.")
    add_bullet("Official API Compliance:", "Strictly adheres to Meta WhatsApp Business Platform policies and rate limits.")

    # Save to both target locations
    os.makedirs(os.path.dirname(PRIMARY_OUT), exist_ok=True)
    doc.save(PRIMARY_OUT)
    print(f"[SUCCESS] Primary Document saved successfully at:\n   {PRIMARY_OUT}")

    doc.save(SECONDARY_OUT)
    print(f"[SUCCESS] Secondary Document copy saved at:\n   {SECONDARY_OUT}")

if __name__ == "__main__":
    create_document()
