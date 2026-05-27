import React, { useState, useRef, useEffect } from 'react';
import { CompanyDocument, BusinessUnit, BUSINESS_UNITS } from '../types';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Calendar, 
  Download, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  FileUp,
  Search,
  Filter,
  CheckCircle,
  FolderOpen,
  AlertCircle
} from 'lucide-react';

interface CompanyDocumentsProps {
  documents: CompanyDocument[];
  onAddDocument: (doc: Omit<CompanyDocument, 'id' | 'uploadedAt'>) => void;
  onDeleteDocument: (docId: string) => void;
  onUpdateDocumentStatus: (docId: string, status: CompanyDocument['status']) => void;
  userRole?: string;
  userEmail?: string;
}

export default function CompanyDocuments({
  documents,
  onAddDocument,
  onDeleteDocument,
  onUpdateDocumentStatus,
  userRole = 'ADMIN',
  userEmail = 'admin@elev8.com'
}: CompanyDocumentsProps) {
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    if (!expiryDateStr || expiryDateStr === '2500-12-31') return Infinity;
    const expiry = new Date(expiryDateStr);
    const today = new Date('2026-05-27T08:01:30Z');
    const diffTime = expiry.getTime() - today.getTime();
    if (isNaN(diffTime)) return Infinity;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // State modifiers & toast alerts mimicking premium in-iframe notification gates
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Navigation & Filter options
  const [searchTerm, setSearchTerm] = useState('');
  const [buFilter, setBuFilter] = useState<BusinessUnit | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<CompanyDocument['status'] | 'ALL'>('ALL');

  // Form states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [docType, setDocType] = useState('BIR Form 2303 (Certificate of Registration)');
  const [customType, setCustomType] = useState('');
  const [selectedBU, setSelectedBU] = useState<BusinessUnit | 'ALL'>('ALL');
  const [expiryDate, setExpiryDate] = useState('2500-12-31');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; data?: string } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewerName, setReviewerName] = useState(userEmail);

  // Synchronize reviewer info with auth
  useEffect(() => {
    setReviewerName(userEmail);
  }, [userEmail]);

  // Interactive Drag & Drop Simulation States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal States
  const [previewDoc, setPreviewDoc] = useState<CompanyDocument | null>(null);

  // Status attempt security wrapper
  const handleStatusChangeAttempt = (docId: string, val: string) => {
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }
    onUpdateDocumentStatus(docId, val as any);
    showToast('Corporate accreditation status updated successfully.');
  };

  const handleDeleteAttempt = (docId: string) => {
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }
    onDeleteDocument(docId);
    showToast('Corporate document record purged from registry.');
  };

  // Standard preset document options
  const STANDARD_DOC_OPTIONS = [
    'BIR Form 2303 (Certificate of Registration)',
    'SEC Certificate of Incorporation',
    'Mayor\'s Business Permit',
    'BIR Tax Clearance Certificate',
    'SSS Employer Remittance clearance',
    'Pag-IBIG Employer Registration',
    'PhilHealth Compliance Clearance',
    'Audited Financial Statements (AFS)',
    'Standard Corporate MNDA',
    'Others (Custom Registration Name)'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const triggerFileSelect = () => {
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 80) {
          clearInterval(interval);
          return 80;
        }
        return prev + 15;
      });
    }, 100);

    reader.onload = (event) => {
      clearInterval(interval);
      const base64Data = event.target?.result as string;
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      setUploadProgress(100);
      setTimeout(() => {
        setUploadedFile({
          name: file.name,
          size: `${sizeMB} MB`,
          data: base64Data
        });
        setUploadProgress(null);
        showToast('Accreditation attachment compiled and locked successfully.');
      }, 250);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setUploadProgress(null);
      showToast('Failed to compile attachment raw files.');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole === 'GUEST_AUDITOR') {
      showToast('Action Denied: External Guest Auditors hold read-only clearance.');
      return;
    }

    const finalDocType = docType === 'Others (Custom Registration Name)' 
      ? (customType || 'Custom Corporate Certification') 
      : docType;

    const fileName = uploadedFile ? uploadedFile.name : `${finalDocType.replace(/\s+/g, '_')}_Elev8.pdf`;
    const fileSize = uploadedFile ? uploadedFile.size : '1.5 MB';

    onAddDocument({
      documentType: finalDocType,
      subsidiary: selectedBU,
      fileName,
      fileSize,
      status: 'pending_verification', // New uploads default to audit queue
      expiryDate,
      uploadedBy: reviewerName || 'current_user@elev8.com',
      remarks: remarks || `Corporate Certificate for Elev8 ${selectedBU === 'ALL' ? 'Group' : selectedBU}. Verified by Internal Audit.`,
      fileData: uploadedFile?.data
    });

    // Reset Form
    setDocType('BIR Form 2303 (Certificate of Registration)');
    setCustomType('');
    setSelectedBU('ALL');
    setExpiryDate('2500-12-31');
    setUploadedFile(null);
    setRemarks('');
    setShowUploadForm(false);
    showToast('Corporate accrediting document added securely.');
  };

  // Filter Company Documents
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBU = buFilter === 'ALL' || doc.subsidiary === buFilter;
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;

    return matchesSearch && matchesBU && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert Gate */}
      {toastMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-bold flex items-center gap-2 animate-in fade-in duration-200" id="documents_auth_toast">
          <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="company_documents_title">Company Documents & Accreditations</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Store and verify the regulatory registrations, legal certificates of registration (BIR, SEC), and business permits of Elev8 subsidiaries.
          </p>
        </div>
        
        <button
          id="toggle_upload_form_btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <FileUp className="w-4 h-4" />
          Upload Company Document
        </button>
      </div>

      {/* QUICK CORE CARD STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="corporate_doc_stats">
        <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block uppercase font-bold">Total Certificates</span>
            <span className="text-slate-800 font-extrabold text-sm">{documents.length} Uploaded</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block uppercase font-bold">Active & Valid</span>
            <span className="text-emerald-700 font-extrabold text-sm">
              {documents.filter(d => d.status === 'valid').length} Cleared
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block uppercase font-bold">Expired / Overdue</span>
            <span className={`font-extrabold text-sm ${documents.filter(d => d.status === 'expired').length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {documents.filter(d => d.status === 'expired').length} Certificates
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-150 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg shrink-0">
            <Clock className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-slate-400 text-[9px] block uppercase font-bold">Review Pending</span>
            <span className="text-amber-700 font-extrabold text-sm">
              {documents.filter(d => d.status === 'pending_verification').length} Audits
            </span>
          </div>
        </div>
      </div>

      {/* UPLOAD NEW DOCUMENT FORM BOX */}
      {showUploadForm && (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200" id="upload_document_form">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Corporate Regulation Credential
            </h2>
            <button 
              type="button" 
              onClick={() => {
                setShowUploadForm(false);
                setUploadedFile(null);
              }}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Document Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Registration Document Category</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              >
                {STANDARD_DOC_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Subsidiary Alignment */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Applies to Subsidiary</label>
              <select
                value={selectedBU}
                onChange={e => setSelectedBU(e.target.value as BusinessUnit | 'ALL')}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value="ALL">All Subsidiaries (Elev8 Group)</option>
                <option value="MEDIA">Elev8 Media Inc.</option>
                <option value="HOLDINGS">Elev8 Holdings Inc.</option>
                <option value="TRADING">Elev8 Trading & Marketing</option>
              </select>
            </div>
          </div>

          {/* Custom Document Type Input if "Others" chosen */}
          {docType === 'Others (Custom Registration Name)' && (
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-700">Registration Document Name (Custom)</label>
              <input
                required
                type="text"
                placeholder="e.g. BIR Permit for Special Digital Billboard Operation"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Document Expiration */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Expiry Date (Set 2500-12-31 if non-expiring)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            {/* Logged admin */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Uploading Compliance Auditor</label>
              <input
                required
                type="text"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Text Summary */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Tax TIN Details / Document Remarks</label>
            <textarea
              placeholder="Specify registration reference code, TIN, address alignment, or validation logs..."
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-medium"
            />
          </div>

          {/* DRAG AND DROP AREA */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-700 block">Accreditation PDF Document Upload</span>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer text-center transition-all ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/40 text-indigo-750' 
                  : uploadedFile 
                  ? 'border-emerald-300 bg-emerald-50/10 text-emerald-800' 
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-500'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden" 
              />

              {uploadProgress !== null ? (
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-center gap-2 font-bold text-indigo-600">
                    <Clock className="w-5 h-5 animate-spin-slow" />
                    <span>Uploading attachment ({uploadProgress}%)</span>
                  </div>
                  <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-1 py-1">
                  <div className="flex items-center justify-center gap-2 font-extrabold text-emerald-600 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>Successfully Compressed!</span>
                  </div>
                  <p className="text-slate-700 font-bold font-mono text-[11px] block">{uploadedFile.name} ({uploadedFile.size})</p>
                  <span className="text-slate-400 text-[10px] block">Click back here to replace file.</span>
                </div>
              ) : (
                <div className="space-y-2 py-1">
                  <FileUp className="w-10 h-10 text-slate-300 mx-auto" />
                  <div>
                    <span className="text-indigo-600 font-bold hover:underline">Drag & drop company document PDF</span>
                    <span className="text-slate-400 font-medium"> or click to explore local folders.</span>
                  </div>
                  <span className="text-slate-400 text-[10px] block">Supported formats: PDF, JPG, PNG (Max size: 10 MB)</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="confirm_corporate_doc_btn"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold cursor-pointer rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Verify & Log Document
            </button>
          </div>
        </form>
      )}

      {/* FILTER SEARCH PANEL */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
            <input
              id="doc_search_box"
              type="text"
              placeholder="Search company registrants, file names, or validation remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Subsidiary Dropdown */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Subsidiary:</span>
            <select
              value={buFilter}
              onChange={e => setBuFilter(e.target.value as BusinessUnit | 'ALL')}
              className="p-2 border border-slate-200 bg-white rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Subsidiaries</option>
              <option value="MEDIA">Elev8 Media Inc.</option>
              <option value="HOLDINGS">Elev8 Holdings Inc.</option>
              <option value="TRADING">Elev8 Trading & Marketing</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="p-2 border border-slate-200 bg-white rounded-lg font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="valid">Active & Valid</option>
              <option value="pending_verification">Pending Audit</option>
              <option value="expired">Expired</option>
              <option value="failed_audit">Failed Audit</option>
            </select>
          </div>

        </div>
      </div>

      {/* DOCUMENTS LISTING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="company_docs_list">
        {filteredDocs.length === 0 ? (
          <div className="bg-white py-16 px-4 border border-dashed rounded-2xl text-slate-400 text-sm font-semibold text-center md:col-span-2">
            No company credentials match the selected query. Modify keywords or upload a new certificate.
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isSubGroup = doc.subsidiary === 'ALL';
            const buDetails = !isSubGroup ? BUSINESS_UNITS[doc.subsidiary] : null;
            const isExpired = doc.status === 'expired' || doc.status === 'failed_audit';
            const isPending = doc.status === 'pending_verification';
            
            const daysLeft = getDaysUntilExpiry(doc.expiryDate);
            const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;

            return (
              <div 
                id={`company_doc_card_${doc.id}`}
                key={doc.id}
                className={`rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isExpiringSoon 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50/20 via-white to-white ring-1 ring-amber-300/45 shadow-sm' 
                    : 'bg-white border-slate-150 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Category Ribbon */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{doc.id}</span>
                    <div className="flex items-center gap-2">
                      {isSubGroup ? (
                        <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded tracking-wide">
                          ELEV8 GROUP ALL
                        </span>
                      ) : (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wide ${buDetails?.bgColor} ${buDetails?.color}`}>
                          {buDetails?.fullName}
                        </span>
                      )}

                      <select
                        id={`company_doc_status_modifier_${doc.id}`}
                        value={doc.status}
                        onChange={(e) => handleStatusChangeAttempt(doc.id, e.target.value as any)}
                        className={`text-[10px] uppercase font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 py-0.5 px-1.5 text-center cursor-pointer border rounded-md font-sans ${
                          doc.status === 'valid'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-50 border-amber-100 text-amber-800'
                            : 'bg-rose-50 border-rose-100 text-rose-800'
                        }`}
                      >
                        <option value="valid">Valid & Stamped</option>
                        <option value="pending_verification">Pending Audit</option>
                        <option value="expired">Expired / Void</option>
                        <option value="failed_audit">Failed Audit / Re-upload</option>
                      </select>
                    </div>
                  </div>

                  {/* Expiring Soon Alert Ribbon */}
                  {isExpiringSoon && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-800 font-extrabold px-3 py-2 rounded-xl text-[10.5px] border border-amber-200/50">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Warning: Expiring in {daysLeft} Days!</span>
                    </div>
                  )}

                  {/* Core Content */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{doc.documentType}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2 md:lines-clamp-none font-medium text-slate-600">
                      {doc.remarks}
                    </p>
                  </div>

                  {/* Attachment Block */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-800 block font-bold truncate text-[11px]" title={doc.fileName}>
                          {doc.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">{doc.fileSize}</span>
                      </div>
                    </div>
                    
                    <button
                      id={`preview_btn_${doc.id}`}
                      onClick={() => setPreviewDoc(doc)}
                      className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1 shrink-0 bg-indigo-50 px-2 py-1 rounded-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Preview File
                    </button>
                  </div>
                </div>

                {/* Card Footer detail */}
                <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[10px] text-slate-400 font-bold font-sans">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-350" />
                    <span>Expires: <span className={`font-bold ${isExpiringSoon ? 'text-amber-600 font-black' : 'text-slate-600'}`}>{doc.expiryDate}</span></span>
                    {isExpiringSoon && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 inline ml-0.5" />}
                  </div>
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <span>By: <span className="text-slate-650 font-bold font-mono">{doc.uploadedBy.split('@')[0]}</span></span>
                    </div>
                    <button
                      id={`delete_company_doc_${doc.id}`}
                      onClick={() => handleDeleteAttempt(doc.id)}
                      className="text-slate-350 hover:text-rose-600 cursor-pointer p-1"
                      title="Delete Certificate Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FILE PREVIEW MODAL DRAWER */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs" id="file_preview_modal">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h4 className="font-extrabold text-slate-900 text-sm">Regulatory Document Preview</h4>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Close View
              </button>
            </div>

            {/* Document simulator canvas */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 space-y-4 font-sans text-xs">
              <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 space-y-6 relative overflow-hidden">
                
                {/* Simulated Certificate Header */}
                <div className="text-center pb-4 border-b-2 border-slate-900/10 space-y-1 relative">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">REPUBLIC OF THE PHILIPPINES</span>
                  <div className="font-black text-slate-900 font-serif leading-tight">OFFICIAL GOVERNMENT REGISTRY</div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Bureau / Municipal Validation division</span>
                </div>

                {/* Certificate Specifics */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Registered Certification / Permit</span>
                    <span className="text-slate-950 font-black text-sm block leading-snug">{previewDoc.documentType}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Assigned Entity</span>
                      <span className="text-slate-800 font-extrabold block uppercase mt-0.5">
                        {previewDoc.subsidiary === 'ALL' ? 'ELEV8 GROUP ALL' : `ELEV8 ${previewDoc.subsidiary} INC.`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Registration ID Code</span>
                      <span className="text-indigo-600 font-bold font-mono block mt-0.5 uppercase">ID-{previewDoc.id}</span>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-lg p-3 bg-slate-50 text-[11px] leading-relaxed select-text font-serif">
                    <span className="font-bold text-slate-400 uppercase font-sans text-[8px] block mb-1">VALIDATION LOG / TIN NOTES</span>
                    "{previewDoc.remarks}"
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-sans font-semibold">
                    <div>
                      <span className="text-[9.5px] text-slate-400 block font-bold">STAMPED STATUS</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase mt-1 ${
                        previewDoc.status === 'valid' 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-250' 
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                        {previewDoc.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 block font-bold">EXPIRATION LIMITS</span>
                      <span className="text-slate-800 font-extrabold block mt-2 text-xs">{previewDoc.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Stamp watermark on bottom right */}
                <div className="absolute bottom-6 right-6 border-4 border-emerald-500/25 text-emerald-500/30 text-[10px] font-black rotate-12 p-3 tracking-widest text-center select-none leading-none rounded-lg uppercase">
                  VERIFIED ACCREDITATION<br />
                  <span className="text-xs">APPROVED</span>
                </div>

                {/* Stamped signature */}
                <div className="border-t-2 border-slate-900/10 pt-4 flex justify-between text-[10px] text-slate-400 font-bold mt-4 font-mono">
                  <span>Authorized by: {previewDoc.uploadedBy}</span>
                  <span>System Date: 2026-05-27</span>
                </div>

              </div>
              
              {/* Simulated download / trigger */}
              <div className="bg-white p-3.5 rounded-xl border flex items-center justify-between text-[11px] font-medium font-sans">
                <span className="text-slate-500 font-bold">Export complete certificate folder</span>
                <button
                  onClick={() => showToast(`Simulated export details: Folder package ID-${previewDoc.id} downloaded successfully to local disk.`)}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white font-extrabold rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-xs"
                >
                  Download Registered PDF folder
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
