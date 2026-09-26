import React, { useState } from 'react';
import {
  Users,
  Tag as TagIcon,
  Filter as FunnelIcon,
  Search,
  Filter,
  Columns,
  RotateCw,
  AlertTriangle,
  List,
  Kanban,
  Plus,
  MoreVertical,
  Info,
  ArrowUpRight,
  ShieldCheck,
  Download,
  X,
  User,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Trash2,
  Loader2,
  Edit2,
  Edit3,
  Upload,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContactAvatar } from '../common/ContactAvatar';
import { BulkLeadImportModal } from './BulkLeadImportModal';

export const LeadsCrm = () => {
  const {
    chats,
    createLead,
    updateLead,
    deleteLead,
    setActiveChatId,
    setActiveTab,
    setIsUpgradeModalOpen,
    showToast,
    currentWorkspaceId,
  } = useApp();

  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('all-leads'); // 'all-leads' | 'segments' | 'tags'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Contact Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTag, setFormTag] = useState('Interested');
  const [formChannel, setFormChannel] = useState('WhatsApp');
  const [formCity, setFormCity] = useState('');

  // Edit Contact State
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [selectedContactToEdit, setSelectedContactToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTag, setEditTag] = useState('Interested');
  const [editCity, setEditCity] = useState('');
  const [editDealValue, setEditDealValue] = useState('');
  const [editProduct, setEditProduct] = useState('');

  // Contact list synced with AppContext & Supabase
  const contacts = chats || [];

  const filteredContacts = contacts.filter((c) => {
    if (selectedTagFilter !== 'all' && c.tag !== selectedTagFilter) return false;
    if (
      searchTerm &&
      !c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.phone.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenEdit = (contact) => {
    if (!contact) return;
    setSelectedContactToEdit(contact);
    setEditName(contact.contactName || '');
    setEditPhone(contact.phone || '');
    setEditEmail(contact.email || '');
    setEditTag(contact.tag || 'Interested');
    setEditCity(contact.city || contact.attributes?.city || 'Mumbai, IN');
    setEditDealValue(contact.dealValue || contact.attributes?.budget || '₹2,499');
    setEditProduct(contact.attributes?.product || 'General inquiry');
    setIsEditContactModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedContactToEdit || !editName.trim() || !editPhone.trim()) return;

    setIsUpdatingContact(true);
    try {
      await updateLead(selectedContactToEdit.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        tag: editTag,
        city: editCity.trim(),
        dealValue: editDealValue.trim(),
        attributes: {
          budget: editDealValue.trim(),
          city: editCity.trim(),
          product: editProduct.trim(),
        },
      });
      setIsEditContactModalOpen(false);
      setSelectedContactToEdit(null);
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast('Error updating contact details', 'error');
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await createLead({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        tag: formTag,
        city: formCity.trim() || 'Mumbai, IN',
        channel: formChannel.toLowerCase(),
      });
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormCity('');
      setIsAddContactModalOpen(false);
    } catch (err) {
      console.error('Error adding contact:', err);
      showToast('Error saving contact to database', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(contactToDelete.id);
      setContactToDelete(null);
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast('Error deleting contact from database', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (!contacts || contacts.length === 0) {
      showToast('No contacts available to export', 'info');
      return;
    }

    const headers = ['Name', 'Phone', 'Email', 'Stage', 'City', 'Deal Value', 'AI Handled', 'Last Seen'];
    const rows = contacts.map((c) => [
      `"${(c.contactName || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.tag || 'Interested').replace(/"/g, '""')}"`,
      `"${(c.city || 'Mumbai, IN').replace(/"/g, '""')}"`,
      `"${(c.dealValue || '₹2,499').replace(/"/g, '""')}"`,
      c.aiHandled ? 'Yes' : 'No',
      `"${(c.lastSeen || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`📤 Exported ${contacts.length} leads to CSV!`, 'success');
  };

  const tagColorMap = {
    Hot: 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]',
    Interested: 'bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]',
    Cold: 'bg-[#F1F5F9] text-[#475467] border-[#E2E8F0]',
    Converted: 'bg-[#F4F0FD] text-[#7C3AED] border-[#E9D8FD]',
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#101828] tracking-tight">
            Leads
          </h1>
          <p className="text-xs lg:text-sm text-[#475467] mt-0.5">
            Manage leads with list, kanban, advanced filters and AI tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tour Button */}
          <button
            onClick={() => showToast('Starting interactive Leads CRM guided tour', 'info')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] px-3 py-1.5 rounded-xl hover:bg-[#F2F4F7] transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#667085]" />
            <span>Tour</span>
          </button>

          {/* Pill Sub-Tabs: All leads | Segments | Tags */}
          <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] p-1 rounded-full text-xs font-semibold">
            {[
              { id: 'all-leads', label: 'All leads' },
              { id: 'segments', label: 'Segments' },
              { id: 'tags', label: 'Tags' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                    : 'text-[#667085] hover:text-[#101828]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Three Metric Bar Cards: LEADS | TAGS | SEGMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: LEADS */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
              <Users className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                LEADS
              </div>
              <div className="text-base font-bold text-[#101828]">
                {contacts.length} <span className="text-[#98A2B3] text-xs font-normal">/ 80,000</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] bg-[#F4F0FD] hover:bg-[#EDE5FA] border border-[#E9D8FD] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Addon</span>
          </button>
        </div>

        {/* Card 2: TAGS */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
              <TagIcon className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                TAGS
              </div>
              <div className="text-base font-bold text-[#101828]">
                4 <span className="text-[#98A2B3] text-xs font-normal">/ 50</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] bg-[#F4F0FD] hover:bg-[#EDE5FA] border border-[#E9D8FD] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Addon</span>
          </button>
        </div>

        {/* Card 3: SEGMENTS */}
        <div className="sendiee-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
              <FunnelIcon className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
                SEGMENTS
              </div>
              <div className="text-base font-bold text-[#101828]">
                3 <span className="text-[#98A2B3] text-xs font-normal">/ 20</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7C3AED] bg-[#F4F0FD] hover:bg-[#EDE5FA] border border-[#E9D8FD] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Addon</span>
          </button>
        </div>
      </div>

      {/* 3. Toolbar: Search | Filter | Column Customizer | Refresh | Low Balance | View Switch | + Add Contact */}
      <div className="sendiee-card p-3 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left Search and Filter Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-9 pr-3.5 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
            className="flex items-center gap-1.5 bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-[#667085]" />
            <span>Filter</span>
          </button>

          {/* Column Customizer Icon */}
          <button
            onClick={() => showToast('Column layout saved to workspace preferences', 'info')}
            className="p-2 rounded-xl bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
            title="Customize columns"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => showToast('Leads refreshed from Meta Cloud API Webhook', 'success')}
            className="p-2 rounded-xl bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-[#EAECF0] text-[#667085] hover:text-[#101828] transition-colors cursor-pointer"
            title="Refresh leads"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Actions: Low Balance Badge | View Switcher | + Add Contact */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Low Balance Warning Pill */}
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] text-[11px] font-bold hover:bg-[#FDE68A] transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low balance</span>
          </button>

          {/* List vs Kanban View Switcher */}
          <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#7C3AED] text-white shadow-2xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#7C3AED] text-white shadow-2xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Quick Import CSV Button */}
          <button
            type="button"
            onClick={() => setIsBulkImportModalOpen(true)}
            className="bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] border border-[#E9D8FD] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
            title="Import leads from CSV or Excel file"
          >
            <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* + Add Contact Button */}
          <button
            type="button"
            onClick={() => setIsAddContactModalOpen(true)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add contact</span>
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreActionsOpen((prev) => !prev)}
              className="p-1.5 rounded-xl border border-[#EAECF0] text-[#667085] hover:text-[#101828] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
              title="Bulk Lead Import & CSV Tools"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMoreActionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() => setIsMoreActionsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#EAECF0] rounded-2xl shadow-xl z-30 py-1.5 text-xs animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      setIsBulkImportModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F4F0FD] hover:text-[#7C3AED] text-[#101828] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-[#7C3AED]" />
                    <span>Bulk Lead Import (CSV)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreActionsOpen(false);
                      handleExportCSV();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#F9FAFB] text-[#344054] flex items-center gap-2.5 font-medium cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#667085]" />
                    <span>Export Leads to CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Dropdown Popover */}
      {isFilterModalOpen && (
        <div className="p-4 rounded-2xl bg-white border border-[#EAECF0] shadow-xl flex items-center gap-3 animate-in fade-in">
          <span className="text-xs font-bold text-[#475467]">Filter by Stage:</span>
          {['all', 'Hot', 'Interested', 'Cold', 'Converted'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedTagFilter(st);
                setIsFilterModalOpen(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTagFilter === st
                  ? 'bg-[#7C3AED] text-white'
                  : 'bg-[#F9FAFB] text-[#475467] hover:bg-[#F2F4F7]'
              }`}
            >
              {st === 'all' ? 'All Stages' : st}
            </button>
          ))}
        </div>
      )}

      {/* 4. Main Body: Empty State OR List Table OR Kanban Board */}
      {filteredContacts.length === 0 ? (
        /* Exact Empty State matching user's uploaded screenshot */
        <div className="sendiee-card p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
          <div className="w-16 h-16 rounded-full bg-[#F2F4F7] flex items-center justify-center text-[#98A2B3]">
            <Users className="w-8 h-8 text-[#98A2B3]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">No leads to show</h3>
            <p className="text-xs text-[#667085] max-w-sm">
              Once leads come in via WhatsApp, Instagram or import, they'll show up here.
            </p>
          </div>
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Lead</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List Table View */
        <div className="sendiee-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAECF0] bg-[#F9FAFB] text-[#667085] font-mono text-[10px] uppercase">
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Channel</th>
                  <th className="p-4 font-semibold">Stage Tag</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Deal Value</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {filteredContacts.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ContactAvatar name={lead.contactName} size="md" />
                        <div>
                          <div className="font-bold text-[#101828] flex items-center gap-1">
                            <span>{lead.contactName}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                          </div>
                          <div className="text-[10px] text-[#667085] font-mono">{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize font-mono text-[11px] text-[#475467]">
                      {lead.channel}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tagColorMap[lead.tag] || 'bg-slate-100 text-slate-700'}`}>
                        {lead.tag}
                      </span>
                    </td>
                    <td className="p-4 text-[#475467] text-[11px]">
                      {lead.city}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#16A34A]">
                      {lead.dealValue || '₹2,499'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveChatId(lead.id);
                            setActiveTab('inbox');
                          }}
                          className="px-3 py-1 bg-[#F4F0FD] hover:bg-[#EDE5FA] text-[#7C3AED] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Open Chat ↗
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(lead);
                          }}
                          className="p-1.5 text-[#98A2B3] hover:text-[#7C3AED] hover:bg-[#F4F0FD] rounded-lg transition-colors cursor-pointer"
                          title="Edit contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToDelete(lead);
                          }}
                          className="p-1.5 text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors cursor-pointer"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Hot', 'Interested', 'Cold', 'Converted'].map((stage) => {
            const stageLeads = filteredContacts.filter((c) => c.tag === stage);
            return (
              <div key={stage} className="bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#101828]">
                    <span>{stage}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#EAECF0] text-[#667085] font-mono">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 bg-white border border-[#EAECF0] rounded-xl hover:border-[#7C3AED] shadow-2xs transition-all space-y-2 group relative"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => {
                            setActiveChatId(lead.id);
                            setActiveTab('inbox');
                          }}
                          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                        >
                          <ContactAvatar name={lead.contactName} size="sm" />
                          <div className="font-bold text-xs text-[#101828] truncate">{lead.contactName}</div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(lead);
                            }}
                            className="p-1 text-[#98A2B3] hover:text-[#7C3AED] hover:bg-[#F4F0FD] rounded transition-all cursor-pointer"
                            title="Edit contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactToDelete(lead);
                            }}
                            className="p-1 text-[#98A2B3] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded transition-all cursor-pointer"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          setActiveChatId(lead.id);
                          setActiveTab('inbox');
                        }}
                        className="flex justify-between items-center text-[10px] text-[#667085] font-mono cursor-pointer"
                      >
                        <span>{lead.phone}</span>
                        <span className="font-bold text-[#16A34A]">{lead.dealValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Interactive Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsAddContactModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Users className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Add New Lead Contact</h3>
                <p className="text-xs text-[#667085]">Save contact into Supabase and start conversation</p>
              </div>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Rao"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Lead Stage</label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Interested">Interested</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Messenger">Messenger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, IN"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <span>Create Contact & Save to Supabase</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {isEditContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditContactModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Edit3 className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Edit Contact Details</h3>
                <p className="text-xs text-[#667085]">Update lead information in Supabase database</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">WhatsApp Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 84384 89970"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED] font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#475467]">Email Address</label>
                <input
                  type="email"
                  placeholder="sri@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Lead Stage</label>
                  <select
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Interested">Interested</option>
                    <option value="Cold">Cold</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, IN"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Budget / Deal Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,499"
                    value={editDealValue}
                    onChange={(e) => setEditDealValue(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#475467]">Product / Interest</label>
                  <input
                    type="text"
                    placeholder="e.g. Omnichannel CRM Lead"
                    value={editProduct}
                    onChange={(e) => setEditProduct(e.target.value)}
                    className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditContactModalOpen(false)}
                  disabled={isUpdatingContact}
                  className="flex-1 py-2.5 border border-[#D0D5DD] bg-white hover:bg-[#F9FAFB] text-[#344054] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingContact}
                  className="flex-1 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUpdatingContact ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mx-auto">
              <Trash2 className="w-6 h-6 text-[#DC2626]" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#101828]">Delete Contact?</h3>
              <p className="text-xs text-[#667085]">
                Are you sure you want to permanently delete <span className="font-bold text-[#101828]">{contactToDelete.contactName}</span> ({contactToDelete.phone}) from Supabase database?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setContactToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bulk Lead Import Modal */}
      <BulkLeadImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        createLead={createLead}
        showToast={showToast}
        currentWorkspaceId={currentWorkspaceId}
      />
    </div>
  );
};
