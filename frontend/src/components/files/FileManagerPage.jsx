import React, { useState } from 'react';
import {
  Folder,
  Upload,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  ArrowUpRight,
  HardDrive,
  File,
  FileImage,
  FileText,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FileManagerPage = () => {
  const { showToast, setIsUpgradeModalOpen, setActiveTab } = useApp();

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const newF = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: 'folder',
      size: '0 KB',
      updated: 'Just now',
    };

    setFiles((prev) => [newF, ...prev]);
    setFolderName('');
    setIsFolderModalOpen(false);
    showToast(`Created folder "${folderName}"`, 'success');
  };

  const handleUploadFile = (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: 'file',
      size: '2.4 MB',
      updated: 'Just now',
    };

    setFiles((prev) => [newFile, ...prev]);
    setFileName('');
    setIsUploadModalOpen(false);
    showToast(`Uploaded file "${fileName}" to Cloud Storage`, 'success');
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-[1300px] mx-auto font-sans">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#101828]">
            Dashboard
          </button>
          <span>&gt;</span>
          <span className="text-[#101828] font-semibold">File Manager</span>
        </div>
        <h1 className="text-2xl font-bold text-[#101828] tracking-tight mt-1">
          File Manager
        </h1>
      </div>

      {/* 2. Metric Bar Card: FILE STORAGE (GB) 0 / 10 */}
      <div className="sendiee-card p-4 flex items-center justify-between max-w-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
            <HardDrive className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider font-mono">
              FILE STORAGE (GB)
            </div>
            <div className="text-base font-bold text-[#101828]">
              0 <span className="text-[#98A2B3] text-xs font-normal">/ 10</span>
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

      {/* 3. Path Pill (Home) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#EAECF0] text-xs font-bold text-[#101828] shadow-2xs">
          <span>🏠 Home</span>
        </div>
      </div>

      {/* 4. Toolbar: Search | Filter | View Switcher | Storage Progress | New Folder | Upload */}
      <div className="sendiee-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Storage Progress Bar */}
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#667085]">Storage</span>
              <strong className="text-[#101828]">0 B / 10.00 GB</strong>
            </div>
            <div className="w-full bg-[#EAECF0] h-2 rounded-full overflow-hidden">
              <div className="bg-[#7C3AED] h-full" style={{ width: '0%' }} />
            </div>
          </div>

          {/* Right Search, Views & Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Box */}
            <div className="relative w-48 sm:w-60">
              <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#EAECF0] pl-9 pr-3 py-1.5 rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            {/* Filter */}
            <button
              onClick={() => showToast('Filter options', 'info')}
              className="p-2 rounded-xl bg-[#F9FAFB] border border-[#EAECF0] text-[#667085] hover:text-[#101828]"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>

            {/* View Switcher */}
            <div className="flex items-center bg-[#F9FAFB] border border-[#EAECF0] p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'cards' ? 'bg-white text-[#7C3AED] shadow-2xs' : 'text-[#667085]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-[#7C3AED] shadow-2xs' : 'text-[#667085]'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New Folder Button */}
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-[#EAECF0] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#475467] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Folder className="w-3.5 h-3.5 text-[#667085]" />
              <span>New Folder</span>
            </button>

            {/* Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Empty State or File Grid */}
      {files.length === 0 ? (
        <div className="sendiee-card p-16 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EAECF0] flex items-center justify-center text-[#98A2B3]">
            <Upload className="w-8 h-8 text-[#98A2B3]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#101828]">No files yet</h3>
            <p className="text-xs text-[#667085] max-w-sm">
              Drag and drop files here or click upload to get started
            </p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {files.map((item) => (
            <div
              key={item.id}
              className="sendiee-card p-4 flex flex-col items-center justify-center text-center space-y-2 hover:border-[#7C3AED] transition-colors cursor-pointer group"
            >
              {item.type === 'folder' ? (
                <Folder className="w-10 h-10 text-[#F59E0B]" />
              ) : (
                <FileText className="w-10 h-10 text-[#7C3AED]" />
              )}
              <div className="text-xs font-bold text-[#101828] truncate w-full">{item.name}</div>
              <div className="text-[10px] text-[#98A2B3] font-mono">{item.size}</div>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Upload className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Upload Media & Assets</h3>
                <p className="text-xs text-[#667085]">Images, PDFs and catalogs for AI responses</p>
              </div>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. festive_catalog_2026.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="p-8 border-2 border-dashed border-[#EAECF0] rounded-2xl text-center space-y-2 bg-[#F9FAFB]">
                <Upload className="w-8 h-8 text-[#98A2B3] mx-auto" />
                <div className="text-xs text-[#475467]">Click or drag files here to upload</div>
                <div className="text-[10px] text-[#98A2B3]">PNG, JPG, PDF up to 25MB</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Upload File
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-sans">
          <div className="bg-white border border-[#EAECF0] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsFolderModalOpen(false)}
              className="absolute top-5 right-5 text-[#98A2B3] hover:text-[#101828] p-1.5 rounded-xl hover:bg-[#F9FAFB] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4F0FD] border border-[#E9D8FD] flex items-center justify-center text-[#7C3AED]">
                <Folder className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101828]">Create New Folder</h3>
                <p className="text-xs text-[#667085]">Organize files into subdirectories</p>
              </div>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#475467]">Folder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WhatsApp Product Brochures"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full mt-1 bg-[#F9FAFB] border border-[#EAECF0] px-3.5 py-2 rounded-xl text-xs text-[#101828] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-2 cursor-pointer"
              >
                Create Folder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
