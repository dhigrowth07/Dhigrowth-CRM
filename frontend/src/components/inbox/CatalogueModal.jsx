import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Store,
  Send,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Bot,
  MessageSquare,
  Cpu,
  Layers,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Save,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const DEFAULT_SITARC_CATALOGUE_ITEMS = [
  {
    id: 'cat_sitarc_pump_testing',
    title: 'Pump & Motor Performance Testing',
    category: 'Testing',
    price: 'Standard NABL Rates',
    badge: 'NABL / BIS',
    iconType: 'cpu',
    description: 'Comprehensive testing for Submersible, Monobloc, Centrifugal & Solar pumps up to high HP with complete NABL test reports.',
    features: ['ISO/IEC 17025 accredited', 'BEE Star labeling & BIS compliance', 'Flow, Head & Efficiency curves', 'Witness testing facility'],
  },
  {
    id: 'cat_sitarc_calibration',
    title: 'Precision Calibration Services',
    category: 'Calibration',
    price: 'Accredited Rates',
    badge: 'Accredited',
    iconType: 'layers',
    description: 'NABL accredited calibration for Thermal, Mechanical, Electro-technical & Pressure instruments with master traceability.',
    features: ['Pressure gauges & transmitters', 'Digital multimeters & energy meters', 'Temperature controllers & RTDs', 'Fast report turnaround'],
  },
  {
    id: 'cat_sitarc_chemical',
    title: 'Chemical & Metallurgy Analysis',
    category: 'Analysis',
    price: 'Standard Lab Rates',
    badge: 'Certified',
    iconType: 'store',
    description: 'Chemical composition analysis, material spectroscopy, hardness, and corrosion testing for metals, alloys & water.',
    features: ['Spectrometer elemental analysis', 'Tensile, impact & hardness test', 'RoHS & environmental compliance', 'Certified metallurgists'],
  },
  {
    id: 'cat_sitarc_electrical',
    title: 'Electrical & Electronic Safety Testing',
    category: 'Testing',
    price: 'Standard Rates',
    badge: 'Popular',
    iconType: 'bot',
    description: 'High voltage, insulation resistance, harmonics, and energy efficiency testing for industrial electrical equipment.',
    features: ['HV & breakdown voltage tests', 'Power quality & harmonics analysis', 'Control panel evaluation', 'Detailed safety certificates'],
  },
];

const DEFAULT_CATALOGUE_ITEMS = [
  {
    id: 'cat_mobile_app',
    title: 'Mobile App & Web Development',
    category: 'Development',
    price: '₹49,999 onwards',
    badge: 'Popular',
    iconType: 'smartphone',
    description: 'Bespoke iOS, Android & modern Web applications built with Flutter, React Native, and high-performance cloud backends.',
    features: ['Native iOS & Android builds', 'Admin Dashboard & Analytics', 'Payment Gateway Integration', '3 Months Support & Maintenance'],
  },
  {
    id: 'cat_ai_autopilot',
    title: 'AI Auto-Pilot Bots & Business Concierge',
    category: 'AI Automation',
    price: '₹14,999 onwards',
    badge: 'Trending',
    iconType: 'bot',
    description: 'Autonomous 24/7 AI conversational agents connected to your product catalog, knowledge base, and Google Sheets CRM.',
    features: ['Meta WhatsApp & Instagram DM sync', 'Multi-lingual automatic translation', 'Lead qualification & sheet logging', 'Human handoff anytime'],
  },
  {
    id: 'cat_whatsapp_crm',
    title: 'WhatsApp CRM & Marketing Automation',
    category: 'Marketing',
    price: '₹9,999 onwards',
    badge: 'High ROI',
    iconType: 'messages',
    description: 'Official Meta WhatsApp Cloud API multi-agent team inbox, bulk broadcasts, interactive button templates, and drip sequences.',
    features: ['Official Green Tick Assistance', 'High delivery rate broadcasts', 'Auto-sync with Google Sheets', 'Team collaboration inbox'],
  },
  {
    id: 'cat_enterprise_it',
    title: 'Custom IT Software & Enterprise Portals',
    category: 'Enterprise',
    price: '₹79,999 onwards',
    badge: 'Custom Scope',
    iconType: 'cpu',
    description: 'End-to-end enterprise cloud portals, internal business management dashboards, ERP sync, and microservices.',
    features: ['Custom workflow automation', 'Role-based access security', 'Supabase / PostgreSQL database', 'REST & GraphQL APIs'],
  },
];

const ICON_MAP = {
  smartphone: { icon: Smartphone, label: 'Mobile / App', color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
  bot: { icon: Bot, label: 'AI / Bot', color: 'text-sky-500 bg-sky-50 border-sky-200' },
  messages: { icon: MessageSquare, label: 'WhatsApp / Chat', color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  cpu: { icon: Cpu, label: 'Enterprise / IT', color: 'text-amber-500 bg-amber-50 border-amber-200' },
  layers: { icon: Layers, label: 'Software Suite', color: 'text-violet-500 bg-violet-50 border-violet-200' },
  store: { icon: Store, label: 'Store / Commerce', color: 'text-pink-500 bg-pink-50 border-pink-200' },
};

const getIconConfig = (type) => {
  return ICON_MAP[type] || ICON_MAP.store;
};

export const CatalogueModal = ({ isOpen, onClose, onSendToChat, contactName, phone }) => {
  const { currentUser, currentWorkspaceId } = useApp();
  const isSitarcTenant = Boolean(
    currentUser?.username?.toLowerCase().includes('sitarc') ||
    currentUser?.companyName?.toLowerCase().includes('sitarc') ||
    currentUser?.name?.toLowerCase().includes('sitarc') ||
    currentWorkspaceId === 'b0000000-0000-0000-0000-000000000002'
  );
  const tenantBusinessName = isSitarcTenant
    ? "Si'Tarc Testing & Calibration Laboratory"
    : (currentUser?.companyName || 'DhiGrowth IT Services');
  const defaultItems = isSitarcTenant ? DEFAULT_SITARC_CATALOGUE_ITEMS : DEFAULT_CATALOGUE_ITEMS;
  const storageKey = `wappilot_catalogue_items_${currentWorkspaceId || 'default'}`;

  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey) || (!isSitarcTenant ? localStorage.getItem('wappilot_catalogue_items') : null);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            ...item,
            iconType: item.iconType || (item.category === 'AI Automation' ? 'bot' : item.category === 'Marketing' ? 'messages' : item.category === 'Enterprise' ? 'cpu' : 'smartphone'),
          }));
        }
      }
    } catch (e) {
      console.error('Error loading catalogue items from localStorage', e);
    }
    return defaultItems;
  });

  const [copiedId, setCopiedId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [itemToDelete, setItemToDelete] = useState(null); // id of item awaiting deletion confirmation
  const [editingItem, setEditingItem] = useState(null); // null or item object being edited/added
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Persist helper
  const persistItems = (newItems) => {
    setItems(newItems);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems));
    } catch (e) {
      console.error('Error saving catalogue items to localStorage', e);
    }
  };

  const showNotification = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  // Reset to default catalogue
  const handleResetToDefaults = () => {
    if (window.confirm(`Reset catalogue to the original ${tenantBusinessName} list? Any custom items will be overwritten.`)) {
      persistItems(defaultItems);
      setSelectedFilter('All');
      setItemToDelete(null);
      setEditingItem(null);
      showNotification('Catalogue reset to defaults');
    }
  };

  // Delete item
  const handleDeleteItem = (id) => {
    const updated = items.filter((item) => item.id !== id);
    persistItems(updated);
    setItemToDelete(null);
    showNotification('Item removed from catalogue');
  };

  // Open edit mode for existing item
  const handleStartEdit = (item) => {
    setEditingItem({
      ...item,
      featuresInput: Array.isArray(item.features) ? item.features.join('\n') : (item.features || ''),
    });
    setIsAddingNew(false);
  };

  // Open add mode for new item
  const handleStartAddNew = () => {
    setEditingItem({
      id: `cat_${Date.now()}`,
      title: '',
      category: 'Development',
      price: '₹9,999 onwards',
      badge: 'New',
      iconType: 'smartphone',
      description: '',
      featuresInput: 'Key feature 1\nKey feature 2\n24/7 Support',
    });
    setIsAddingNew(true);
  };

  // Save edit/add item
  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!editingItem.title.trim()) {
      alert('Please enter a service or product title.');
      return;
    }

    const parsedFeatures = (editingItem.featuresInput || '')
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter(Boolean);

    const savedPayload = {
      id: editingItem.id,
      title: editingItem.title.trim(),
      category: editingItem.category.trim() || 'General',
      price: editingItem.price.trim() || 'Contact for Quote',
      badge: editingItem.badge.trim() || 'Verified',
      iconType: editingItem.iconType || 'store',
      description: editingItem.description.trim(),
      features: parsedFeatures.length > 0 ? parsedFeatures : ['High Quality Service', 'Dedicated Support'],
    };

    let updatedList;
    if (isAddingNew) {
      updatedList = [savedPayload, ...items];
    } else {
      updatedList = items.map((i) => (i.id === savedPayload.id ? savedPayload : i));
    }

    persistItems(updatedList);
    setEditingItem(null);
    setIsAddingNew(false);
    showNotification(isAddingNew ? 'New item added to catalogue!' : 'Item updated successfully!');
  };

  const handleCopyLink = (item) => {
    const text = `🛍️ *${item.title}*\n💰 ${item.price}\nℹ️ ${item.description}\n🔗 Explore: https://dhigrowth.com/services#${item.id}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendItem = (item) => {
    const featuresList = Array.isArray(item.features)
      ? item.features.map((f) => `• ${f}`).join('\n')
      : '';
    const msg = `🛍️ *${isSitarcTenant ? "Si'Tarc Laboratory" : "DhiGrowth"} Catalogue: ${item.title}*\n\n${item.description}\n\n💰 *Price:* ${item.price}\n\n${featuresList ? `✨ *Key Inclusions:*\n${featuresList}\n\n` : ''}👉 Reply with *"Yes, I'm interested"* or let us know your requirements to receive a customized quote! ${isSitarcTenant ? '🔬' : '🚀'}`;
    if (onSendToChat) {
      onSendToChat(msg);
    }
    onClose();
  };

  const handleSendFullCatalogue = () => {
    if (items.length === 0) return;
    const servicesList = items
      .map((item, idx) => `${idx + 1}️⃣ *${item.title}* (${item.price || 'Custom'})`)
      .join('\n');
    const msg = `🏪 *${tenantBusinessName} — Official Business Catalogue*\n\nHello ${contactName || 'there'}! 👋 Here is our active solutions catalogue:\n\n${servicesList}\n\n👉 *Reply with the number (or describe what your requirements are) to get a full project proposal!* ${isSitarcTenant ? '🔬' : '🚀'}`;
    if (onSendToChat) {
      onSendToChat(msg);
    }
    onClose();
  };

  // Derive unique categories from active items
  const categories = useMemo(() => {
    const set = new Set();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = selectedFilter === 'All'
    ? items
    : items.filter((i) => i.category === selectedFilter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#EAECF0] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#121316] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A2B2E] border border-white/10 flex items-center justify-center text-sky-400 shadow-inner">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {editingItem ? (isAddingNew ? 'Add Catalogue Item' : 'Edit Catalogue Item') : 'Business Catalogue'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  {items.length} {items.length === 1 ? 'Service' : 'Services'}
                </span>
              </div>
              <p className="text-xs text-white/60">
                {editingItem
                  ? 'Update pricing, details, and inclusions saved to your catalogue'
                  : 'Manage, edit, delete, and share services directly to WhatsApp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editingItem && (
              <button
                type="button"
                onClick={handleStartAddNew}
                className="px-3 py-1.5 rounded-xl bg-[#2A2B2E] hover:bg-[#383A3E] border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Add a new service or product to catalogue"
              >
                <Plus className="w-3.5 h-3.5 text-sky-400" />
                <span>Add Item</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Feedback Notification */}
        {feedbackMsg && (
          <div className="px-6 py-2 bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <Check className="w-4 h-4" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Mode 1: Edit / Add Form */}
        {editingItem ? (
          <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FC]">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAECF0]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-xs font-bold text-[#475467] hover:text-[#101828] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Catalogue</span>
              </button>
              <span className="text-[11px] font-semibold text-[#667085]">
                {isAddingNew ? 'New Entry' : `ID: ${editingItem.id}`}
              </span>
            </div>

            {/* Service Title */}
            <div>
              <label className="block text-xs font-bold text-[#344054] mb-1">
                Service / Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. Mobile App & Web Development"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] bg-white text-sm text-[#101828] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">Category</label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  placeholder="e.g. Development, Marketing, AI"
                  list="category-options"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
                <datalist id="category-options">
                  <option value="Development" />
                  <option value="AI Automation" />
                  <option value="Marketing" />
                  <option value="Enterprise" />
                  <option value="Consulting" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">Price / Rate</label>
                <input
                  type="text"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  placeholder="e.g. ₹49,999 onwards, ₹9,999/mo"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            {/* Badge & Icon Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={editingItem.badge}
                  onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                  placeholder="e.g. Popular, Trending, High ROI, New"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">Card Icon Style</label>
                <select
                  value={editingItem.iconType || 'smartphone'}
                  onChange={(e) => setEditingItem({ ...editingItem, iconType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="smartphone">📱 Mobile / App Icon</option>
                  <option value="bot">🤖 AI / Bot Icon</option>
                  <option value="messages">💬 WhatsApp / Chat Icon</option>
                  <option value="cpu">⚡ Enterprise / IT Icon</option>
                  <option value="layers">🗂️ Software Suite Icon</option>
                  <option value="store">🏪 Business / Store Icon</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#344054] mb-1">Description</label>
              <textarea
                rows={3}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Describe what is offered in this package..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs text-[#101828] focus:outline-none focus:border-[#0284C7] leading-relaxed"
              />
            </div>

            {/* Key Inclusions / Features */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#344054]">
                  Key Inclusions / Features
                </label>
                <span className="text-[11px] text-[#667085]">One item per line or separated by comma</span>
              </div>
              <textarea
                rows={3}
                value={editingItem.featuresInput}
                onChange={(e) => setEditingItem({ ...editingItem, featuresInput: e.target.value })}
                placeholder="Native iOS & Android builds&#10;Admin Dashboard & Analytics&#10;Payment Gateway Integration&#10;3 Months Support"
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0D5DD] bg-white text-xs font-mono text-[#101828] focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-[#D0D5DD] hover:bg-[#F2F4F7] text-[#344054] font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAddingNew ? 'Create & Save Item' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Browse Catalogue Items List */
          <>
            {/* Filter Pills & Top Actions */}
            <div className="px-6 py-3 border-b border-[#EAECF0] bg-[#F9FAFB] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedFilter === cat
                        ? 'bg-[#101828] text-white shadow-xs'
                        : 'bg-white text-[#475467] border border-[#EAECF0] hover:bg-[#F2F4F7]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleSendFullCatalogue}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                  title="Send all services as a catalogue overview"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Entire Catalogue</span>
                </button>
              )}
            </div>

            {/* Catalogue Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3.5 min-h-0 bg-[#F8F9FC]">
              {filtered.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAECF0] flex items-center justify-center mx-auto text-[#98A2B3] shadow-xs">
                    <Store className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#101828]">No catalogue items found</h4>
                  <p className="text-xs text-[#667085] max-w-sm mx-auto">
                    {selectedFilter !== 'All'
                      ? `There are no items in category "${selectedFilter}". Try switching categories or add a new service.`
                      : 'Your catalogue is empty. You can add new services or restore default IT offerings.'}
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleStartAddNew}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0284C7] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0369A1] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Service</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefaults}
                      className="px-3.5 py-1.5 rounded-xl border border-[#D0D5DD] bg-white text-[#344054] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F2F4F7] transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>
                </div>
              ) : (
                filtered.map((item) => {
                  const iconCfg = getIconConfig(item.iconType);
                  const Icon = iconCfg.icon;
                  const isAwaitingDelete = itemToDelete === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl bg-white border transition-all space-y-3 group ${
                        isAwaitingDelete
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-[#EAECF0] hover:border-[#0284C7]/40 hover:shadow-md'
                      }`}
                    >
                      {/* Top Row: Icon, Title, Price & Quick Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconCfg.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#101828] truncate">{item.title}</h4>
                              {item.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  {item.badge}
                                </span>
                              )}
                              <span className="text-[10px] font-semibold text-[#667085] px-1.5 py-0.2 bg-[#F2F4F7] rounded border border-[#EAECF0] shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-xs font-bold font-mono text-[#0284C7] mt-0.5">
                              {item.price}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit, Delete, Copy, Send */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-2 rounded-xl border border-[#EAECF0] bg-white text-[#475467] hover:text-[#0284C7] hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all cursor-pointer shadow-2xs"
                            title="Edit this service (title, price, features)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item.id)}
                            className="p-2 rounded-xl border border-[#EAECF0] bg-white text-[#475467] hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs"
                            title="Delete this service from catalogue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Link button */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item)}
                            className="p-2 rounded-xl border border-[#EAECF0] bg-white text-[#475467] hover:text-[#0284C7] hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all cursor-pointer shadow-2xs"
                            title="Copy details & link"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Send to WhatsApp Chat button */}
                          <button
                            type="button"
                            onClick={() => handleSendItem(item)}
                            className="px-3 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Send this service card to customer in WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation Bar (Inline) */}
                      {isAwaitingDelete && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-in fade-in duration-150">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Delete &quot;{item.title}&quot; from catalogue?</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setItemToDelete(null)}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-white text-xs font-bold text-[#344054] hover:bg-[#F2F4F7] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-[#475467] leading-relaxed">
                        {item.description}
                      </p>

                      {/* Features Badges */}
                      {Array.isArray(item.features) && item.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F2F4F7] text-[#344054] border border-[#EAECF0]"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#EAECF0] bg-white flex items-center justify-between text-xs text-[#667085] shrink-0">
              <div className="flex items-center gap-3">
                <span>
                  Recipient: <strong className="text-[#101828] font-mono">{phone || contactName || 'Current Contact'}</strong>
                </span>
                <span className="hidden sm:inline text-[#D0D5DD]">|</span>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="hidden sm:flex items-center gap-1 text-[#667085] hover:text-[#101828] font-medium cursor-pointer"
                  title="Reset catalogue items back to defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-xl border border-[#D0D5DD] hover:bg-[#F2F4F7] text-[#344054] font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
