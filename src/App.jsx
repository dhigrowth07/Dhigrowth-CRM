import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/layout/Toast';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TeamInbox } from './components/inbox/TeamInbox';
import { AiStudio } from './components/ai-studio/AiStudio';
import { ToolsPage } from './components/tools/ToolsPage';
import { LeadStudioPage } from './components/lead-studio/LeadStudioPage';
import { LeadSegmentationPage } from './components/segmentation/LeadSegmentationPage';
import { CampaignManager } from './components/campaigns/CampaignManager';
import { DripCampaignsPage } from './components/campaigns/DripCampaignsPage';
import { AutomationsPage } from './components/automations/AutomationsPage';
import { TemplatesPage } from './components/templates/TemplatesPage';
import { FileManagerPage } from './components/files/FileManagerPage';
import { LeadsCrm } from './components/leads/LeadsCrm';
import { MetaCapiEvents } from './components/capi/MetaCapiEvents';
import { ConnectedChannelsPage } from './components/channels/ConnectedChannelsPage';
import { WhatsAppBusinessPage } from './components/channels/WhatsAppBusinessPage';
import { InstagramChannelPage } from './components/channels/InstagramChannelPage';
import { MessengerChannelPage } from './components/channels/MessengerChannelPage';
import { LineChannelPage } from './components/channels/LineChannelPage';
import { ShopifyIntegrationPage } from './components/integrations/ShopifyIntegrationPage';
import { ZohoIntegrationPage } from './components/integrations/ZohoIntegrationPage';
import { ApiWebhooksPage } from './components/api-keys/ApiWebhooksPage';
import { IntegrationsHubPage } from './components/integrations/IntegrationsHubPage';
import { OrganizationSettingsPage } from './components/settings/OrganizationSettingsPage';
import { WalletPage } from './components/wallet/WalletPage';
import { PlansPricingPage } from './components/plans/PlansPricingPage';
import { UsageLimitsPage } from './components/usage/UsageLimitsPage';
import { InsightsPage } from './components/insights/InsightsPage';
import { UpgradeModal } from './components/modals/UpgradeModal';
import { UsageModal } from './components/modals/UsageModal';
import { SearchCommandPalette } from './components/modals/SearchCommandPalette';
import { SendieeWidgetModal } from './components/modals/SendieeWidgetModal';
import { LoginPage } from './components/auth/LoginPage';
import { MetaApiSettings } from './components/settings/MetaApiSettings';
import { ClientPortal } from './components/portal/ClientPortal';
import { AdminTopBar } from './components/layout/AdminTopBar';
import { SuperAdminTenantsPage } from './components/admin/SuperAdminTenantsPage';
import { CheckoutModal } from './components/billing/CheckoutModal';
import { FeaturePaywall } from './components/common/FeaturePaywall';
import { BroadcastDueModal } from './components/inbox/BroadcastDueModal';
import { BroadcastTemplateModal } from './components/inbox/BroadcastTemplateModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { OnboardingWizardModal } from './components/onboarding/OnboardingWizardModal';
import { TeamMembersPage } from './components/settings/TeamMembersPage';

const AppContent = () => {
  const {
    activeTab,
    isAuthenticated,
    currentUser,
    clientViewMode,
    subscription,
    isOnboardingWizardOpen,
    setIsOnboardingWizardOpen,
  } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'Super Administrator' ||
    currentUser?.username?.toLowerCase() === 'admin'
  );

  // If user explicitly selected the isolated BYOK Client Portal view:
  const shouldShowClientPortal = currentUser?.isExternalClient && clientViewMode === 'portal';

  if (shouldShowClientPortal) {
    return (
      <div className="flex flex-col min-h-screen">
        {isSuperAdmin && <AdminTopBar />}
        <ClientPortal />
        <Toast />
        <BroadcastDueModal />
        <BroadcastTemplateModal />
      </div>
    );
  }

  const isPaidActive = subscription?.status === 'active';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'inbox':
        return <TeamInbox />;
      case 'channels':
        return isPaidActive ? (
          <ConnectedChannelsPage />
        ) : (
          <FeaturePaywall
            featureTitle="Omnichannel Hub & Connected Channels"
            featureDescription="Connect and manage multi-channel customer communications across WhatsApp, Instagram Direct, Facebook Messenger, and LINE."
            requiredPlan="Growth"
          />
        );
      case 'channel-whatsapp':
      case 'whatsapp':
        return isPaidActive ? (
          <WhatsAppBusinessPage />
        ) : (
          <FeaturePaywall
            featureTitle="Official WhatsApp Business Cloud Channel"
            featureDescription="Connect and operate your official Meta WhatsApp Business number, webhook sync, live chat routing, and business profile."
            requiredPlan="Growth"
          />
        );
      case 'channel-instagram':
      case 'instagram':
        return isPaidActive ? (
          <InstagramChannelPage />
        ) : (
          <FeaturePaywall
            featureTitle="Instagram Direct & Story Automation"
            featureDescription="Engage Instagram followers, handle story mentions, and capture leads directly within your team inbox."
            requiredPlan="Growth"
          />
        );
      case 'channel-messenger':
      case 'messenger':
        return isPaidActive ? (
          <MessengerChannelPage />
        ) : (
          <FeaturePaywall
            featureTitle="Facebook Messenger Channel"
            featureDescription="Unify Facebook Page Messenger chats with automated responses, lead qualification, and agent handoff."
            requiredPlan="Growth"
          />
        );
      case 'channel-line':
      case 'line':
        return isPaidActive ? (
          <LineChannelPage />
        ) : (
          <FeaturePaywall
            featureTitle="LINE Official Account Integration"
            featureDescription="Connect your verified LINE Official Account to automate messaging, rich menus, and broadcasts."
            requiredPlan="Pro"
          />
        );
      case 'shopify':
        return isPaidActive ? (
          <ShopifyIntegrationPage />
        ) : (
          <FeaturePaywall
            featureTitle="Shopify E-Commerce Integration"
            featureDescription="Automate WhatsApp order confirmations, abandoned cart recovery, shipping updates, and cash-on-delivery confirmations."
            requiredPlan="Growth"
          />
        );
      case 'zoho':
        return isPaidActive ? (
          <ZohoIntegrationPage />
        ) : (
          <FeaturePaywall
            featureTitle="Zoho CRM Integration"
            featureDescription="Sync WhatsApp conversation leads, create contacts, and manage deal stages directly with Zoho CRM."
            requiredPlan="Growth"
          />
        );
      case 'api':
        return isPaidActive ? (
          <ApiWebhooksPage />
        ) : (
          <FeaturePaywall
            featureTitle="Developer API & Custom Webhooks"
            featureDescription="Full REST API access and inbound webhook triggers for programmatic message dispatch and CRM synchronization."
            requiredPlan="Pro"
          />
        );
      case 'meta-api':
      case 'meta_api':
      case 'meta-settings':
        return isPaidActive ? (
          <MetaApiSettings />
        ) : (
          <FeaturePaywall
            featureTitle="Meta WhatsApp Cloud API Credentials"
            featureDescription="Configure Phone Number IDs, Meta Access Tokens, and Webhook verification for live production messaging."
            requiredPlan="Growth"
          />
        );
      case 'apps':
      case 'integrations':
        return isPaidActive ? (
          <IntegrationsHubPage />
        ) : (
          <FeaturePaywall
            featureTitle="App Integrations Hub"
            featureDescription="Connect 100+ native apps, CRMs, payment gateways, and tools to your WAPPPILOT workspace."
            requiredPlan="Growth"
          />
        );
      case 'wallet':
        return <WalletPage />;
      case 'plans':
        return <PlansPricingPage />;
      case 'usage':
      case 'limits':
        return <UsageLimitsPage />;
      case 'settings':
      case 'manage':
        return <OrganizationSettingsPage />;
      case 'insights':
        return <InsightsPage />;
      case 'tools':
        return isPaidActive ? (
          <ToolsPage />
        ) : (
          <FeaturePaywall
            featureTitle="AI Function Tools & External Webhooks"
            featureDescription="Connect custom API endpoints, CRM webhooks, and live databases directly into your AI autonomous agents."
            requiredPlan="Growth"
          />
        );
      case 'lead-studio':
        return isPaidActive ? (
          <LeadStudioPage />
        ) : (
          <FeaturePaywall
            featureTitle="AI Lead Studio & Audience Enricher"
            featureDescription="Automatically enrich inbound WhatsApp and Instagram leads with verified company intel, email lookups, and qualification scores."
            requiredPlan="Growth"
          />
        );
      case 'segmentation':
        return isPaidActive ? (
          <LeadSegmentationPage />
        ) : (
          <FeaturePaywall
            featureTitle="Smart Lead Segmentation"
            featureDescription="Filter and segment your contacts with high-precision criteria, custom tags, deal stages, and AI buyer intent."
            requiredPlan="Growth"
          />
        );
      case 'ai-assistants':
      case 'ai-studio':
        return isPaidActive ? (
          <AiStudio />
        ) : (
          <FeaturePaywall
            featureTitle="AI Studio & Autonomous Auto-Pilot Agents"
            featureDescription="Deploy 24/7 autonomous WhatsApp, Instagram, and Messenger AI agents trained on your custom company knowledge base."
            requiredPlan="Growth"
          />
        );
      case 'campaigns':
        return isPaidActive ? (
          <CampaignManager />
        ) : (
          <FeaturePaywall
            featureTitle="Mass Broadcast Campaigns"
            featureDescription="Schedule and blast official Meta pre-approved WhatsApp templates with dynamic variables ({{name}}, {{city}}, {{deal_value}}) to thousands of leads."
            requiredPlan="Growth"
          />
        );
      case 'drip-campaigns':
        return isPaidActive ? (
          <DripCampaignsPage />
        ) : (
          <FeaturePaywall
            featureTitle="Multi-Step Drip Sequences"
            featureDescription="Nurture leads automatically across minutes, hours, or days with conditional branching and automated follow-ups."
            requiredPlan="Pro"
          />
        );
      case 'automations':
        return isPaidActive ? (
          <AutomationsPage />
        ) : (
          <FeaturePaywall
            featureTitle="Event Triggers & Workflow Automations"
            featureDescription="Automate real-time triggers on keyword matches, Shopify order creation, cart abandonment, and CRM status updates."
            requiredPlan="Growth"
          />
        );
      case 'templates':
        return isPaidActive ? (
          <TemplatesPage />
        ) : (
          <FeaturePaywall
            featureTitle="Official Meta Message Templates"
            featureDescription="Draft, sync, and submit rich WhatsApp message templates with dynamic variables and interactive quick-reply buttons directly to Meta."
            requiredPlan="Growth"
          />
        );
      case 'files':
        return <FileManagerPage />;
      case 'leads':
        return <LeadsCrm />;
      case 'capi':
        return isPaidActive ? (
          <MetaCapiEvents />
        ) : (
          <FeaturePaywall
            featureTitle="Meta Conversions API (CAPI)"
            featureDescription="Send server-side purchase and lead conversion events directly to Meta Ads Manager for 10x ROAS attribution."
            requiredPlan="Pro"
          />
        );
      case 'super-admin':
      case 'tenants':
      case 'tenant-management':
        return isSuperAdmin ? (
          <SuperAdminTenantsPage />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl font-bold mb-3 shadow-xs">
              🛡️
            </div>
            <h2 className="text-xl font-bold text-[#101828]">Super Administrator Access Required</h2>
            <p className="text-sm text-[#667085] max-w-md mt-1 mb-4">
              The Tenant Organizations & Users Directory is reserved for WAPPPILOT Super Administrators. Please sign in with <strong>admin</strong> credentials to manage platform tenants.
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Return to Dashboard
            </button>
          </div>
        );
      case 'team':
      case 'team-members':
      case 'members':
        return <TeamMembersPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FC] text-[#101828] font-sans antialiased">
      {isSuperAdmin && <AdminTopBar />}

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main App Container */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
          <Header />
          <main className={`flex-1 min-w-0 pb-16 md:pb-0 ${activeTab === 'inbox' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
            {renderActiveView()}
          </main>
          {/* Mobile Bottom Thumb Navigation */}
          <MobileBottomNav />
        </div>
      </div>

      {/* Mobile Navigation Drawer Sheet */}
      <MobileDrawer />

      {/* Interactive Global Modals */}
      <OnboardingWizardModal
        isOpen={isOnboardingWizardOpen}
        onClose={() => setIsOnboardingWizardOpen(false)}
      />
      <CheckoutModal />
      <UpgradeModal />
      <UsageModal />
      <SearchCommandPalette />
      <SendieeWidgetModal />
      <Toast />
      <BroadcastDueModal />
      <BroadcastTemplateModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
