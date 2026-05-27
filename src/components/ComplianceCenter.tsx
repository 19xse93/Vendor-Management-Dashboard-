import React, { useState } from 'react';
import { Vendor, ComplianceCheck, BUSINESS_UNITS } from '../types';
import { 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  FileEdit, 
  CheckCircle,
  XCircle,
  HelpCircle,
  UploadCloud,
  Check,
  Eye
} from 'lucide-react';

interface ComplianceCenterProps {
  vendors: Vendor[];
  compliance: ComplianceCheck[];
  onUpdateCompliance: (
    checkId: string, 
    status: ComplianceCheck['status'], 
    remarks: string,
    documentName?: string,
    fileData?: string,
    fileSize?: string
  ) => void;
  onAddComplianceCheck: (vendorId: string, check: Omit<ComplianceCheck, 'id' | 'vendorId' | 'vendorName' | 'updatedAt'>) => void;
}

export default function ComplianceCenter({
  vendors,
  compliance,
  onUpdateCompliance,
  onAddComplianceCheck
}: ComplianceCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplianceCheck['status'] | 'ALL'>('ALL');
  const [checkTypeFilter, setCheckTypeFilter] = useState<string | 'ALL'>('ALL');

  // Form states for creating a new audit check
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [checkType, setCheckType] = useState('Mayor\'s Permit & Licensing');
  const [status, setStatus] = useState<ComplianceCheck['status']>('passed');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [docName, setDocName] = useState('regulatory_filing.pdf');
  const [remarks, setRemarks] = useState('');

  // File upload drag-and-drop helper states and functions
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, size: string} | null>(null);
  const [previewCheck, setPreviewCheck] = useState<ComplianceCheck | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, onFileUploaded: (name: string, data: string, size: string) => void) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0], onFileUploaded);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, onFileUploaded: (name: string, data: string, size: string) => void) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0], onFileUploaded);
    }
  };

  const processFile = (file: File, callback: (name: string, data: string, size: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const readableSize = formatBytes(file.size);
      callback(file.name, base64Data, readableSize);
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Settle checklists
  const filteredChecks = compliance.filter(check => {
    const matchesSearch = 
      check.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.checkType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || check.status === statusFilter;
    const matchesType = checkTypeFilter === 'ALL' || check.checkType === checkTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate high-level stats
  const totalAuditCount = compliance.length;
  const passedCount = compliance.filter(c => c.status === 'passed').length;
  const pendingCount = compliance.filter(c => c.status === 'pending').length;
  const criticalHoldCount = compliance.filter(c => c.status === 'failed' || c.status === 'expired').length;
  
  const totalComplianceRating = totalAuditCount > 0 
    ? Math.round((passedCount / totalAuditCount) * 100)
    : 100;

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !remarks) return;

    onAddComplianceCheck(selectedVendorId, {
      checkType,
      status,
      expiryDate,
      documentName: docName || uploadedFile?.name || 'regulatory_filing.pdf',
      remarks,
      fileData: uploadedFile?.data,
      fileSize: uploadedFile?.size || 'Default PDF'
    });

    // Reset Form
    setRemarks('');
    setDocName('regulatory_filing.pdf');
    setUploadedFile(null);
    setShowAddForm(false);
  };

  const getStatusStyle = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'expired':
        return 'bg-amber-100 text-amber-900 border-amber-300 pattern-expired';
    }
  };

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-amber-650" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="compliance_center_title">Corporate Compliance Reporting</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Audit vendor NDAs, financial certifications, Mayor's permits, and security indices. Manage risk triggers actively.
          </p>
        </div>
        
        <button
          id="toggle_compliance_uploader_btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          License & Audit Registration
        </button>
      </div>

      {/* COMPLIANCE RATING GRID STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="compliance_stats_grid">
        {/* Compliance Rating */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Credential Pass Index</span>
            <span className="text-2xl font-black text-slate-900">{totalComplianceRating}%</span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Passed Audits */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Valid Clearances</span>
            <span className="text-2xl font-black text-emerald-600">{passedCount} <span className="text-slate-400 font-medium text-xs">documents</span></span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Audits */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Pending Validation</span>
            <span className="text-2xl font-black text-amber-600">{pendingCount} <span className="text-slate-400 font-medium text-xs">requests</span></span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Holds */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Critical Failures / Holds</span>
            <span className="text-2xl font-black text-rose-600">{criticalHoldCount} <span className="text-slate-400 font-medium text-xs">warnings</span></span>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-500 rounded-xl">
            <AlertTriangle className="w-5 h-5 animated-pulse" />
          </div>
        </div>
      </div>

      {/* ADD AUDIT CHECK FORM */}
      {showAddForm && (
        <form onSubmit={handleAuditSubmit} className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Regulatory Compliance Record Registration
            </h2>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Vendor List */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contracting Vendor Partner</label>
              <select
                value={selectedVendorId}
                onChange={e => setSelectedVendorId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Audit Licensing Category</label>
              <select
                value={checkType}
                onChange={e => setCheckType(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="Mayor's Permit & Licensing">Mayor's Permit & Licensing</option>
                <option value="Bureau of Internal Revenue Tax Clearance (2303)">Tax Clearance (BIR 2303)</option>
                <option value="SEC Registration Certificate">SEC Registration Certificate</option>
                <option value="General Liability Insurance Policy">Corporate Insurance Policy</option>
                <option value="Bilateral Corporate NDA">MNDA / Confidentiality</option>
                <option value="SOC 2 Type II Auditing Details">SOC 2 / Data Security Clearance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Verification Status */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Validation Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ComplianceCheck['status'])}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="passed">Passed (Valid & Verified)</option>
                <option value="pending">Pending Validation Review</option>
                <option value="failed">Failed (Underhold / Invalid)</option>
                <option value="expired">Expired (Requires Update)</option>
              </select>
            </div>

            {/* Document Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Certificate PDF Name</label>
              <input
                required
                type="text"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                placeholder="e.g. SEC_Registration_Permit_Apex_2026.pdf"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Expiry Date</label>
              <input
                required
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Modern Interactive Drag and Drop Upload Area */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700 block">Certificate File Upload (Drag & Drop or Click)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, (name, data, size) => {
                setUploadedFile({ name, data, size });
                setDocName(name);
              })}
              onClick={() => document.getElementById('compliance_center_file_picker')?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : uploadedFile
                  ? 'border-indigo-500 bg-indigo-50/22'
                  : 'border-slate-150 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                id="compliance_center_file_picker"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileSelect(e, (name, data, size) => {
                  setUploadedFile({ name, data, size });
                  setDocName(name);
                })}
              />
              <UploadCloud className={`w-8 h-8 ${uploadedFile ? 'text-indigo-500' : 'text-slate-400'}`} />
              {uploadedFile ? (
                <div>
                  <p className="font-bold text-slate-800 text-xs">Attached: {uploadedFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">SIZE: {uploadedFile.size} • PDF/IMAGE</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-600">Drag & drop your certificate file here, or click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, PNG, JPEG, DOCX up to 4MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Compliance Audit Remarks</label>
            <input
              required
              type="text"
              placeholder="e.g. BIR 2303 checked against taxation database registries; matches Elev8 profile."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="confirm_compliance_record_submit"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold cursor-pointer rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Commit Audit Log
            </button>
          </div>
        </form>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
            <input
              id="compliance_search"
              type="text"
              placeholder="Search compliance logs by vendor name, remarks, or registry code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Type Filter:</span>
            <select
              value={checkTypeFilter}
              onChange={e => setCheckTypeFilter(e.target.value)}
              className="p-2 border border-slate-200 bg-white rounded-lg text-slate-700 font-bold w-full"
            >
              <option value="ALL">All Standards</option>
              <option value="Mayor's Permit & Licensing">Mayor's Permit & Licensing</option>
              <option value="Bureau of Internal Revenue Tax Clearance (2303)">Tax Clearance (BIR 2303)</option>
              <option value="SEC Registration Certificate">SEC Registration Certificate</option>
              <option value="General Liability Insurance Policy">Corporate Insurance Policy</option>
              <option value="Bilateral Corporate NDA">MNDA / Confidentiality</option>
              <option value="SOC 2 Type II Auditing Details">SOC 2 / Data Security Clearance</option>
            </select>
          </div>

        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-50 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Document Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Registers ({compliance.length})
            </button>
            <button
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                statusFilter === 'passed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Passed ({compliance.filter(c => c.status === 'passed').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({compliance.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                statusFilter === 'failed' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Failed ({compliance.filter(c => c.status === 'failed').length})
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                statusFilter === 'expired' ? 'bg-white text-amber-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Expired ({compliance.filter(c => c.status === 'expired').length})
            </button>
          </div>
        </div>

      </div>

      {/* COMPLIANCE CHECK LIST GRID */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-extrabold text-slate-900 text-sm">Audited Certification Registers</h3>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Total Active Registers: {filteredChecks.length}</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto" id="compliance_checks_list">
          {filteredChecks.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-xs">
              No regulatory clearances checked operating under selected status guidelines.
            </div>
          ) : (
            filteredChecks.map(check => {
              const isPassed = check.status === 'passed';
              const isPending = check.status === 'pending';
              const isCritical = check.status === 'failed' || check.status === 'expired';

              return (
                <div key={check.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative group hover:bg-slate-50/50 transition-all">
                  
                  {/* Left Column: Vendor & File */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-indigo-600 font-bold font-mono uppercase shrink-0">{check.id}</span>
                      <h4 className="font-extrabold text-slate-900 text-xs truncate max-w-xs">{check.vendorName}</h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-medium">
                      <span className="text-slate-400 font-bold block bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase">{check.checkType}</span>
                      <span>•</span>
                      <span>Filename: <span 
                        onClick={() => setPreviewCheck(check)}
                        className="underline text-indigo-600 font-bold hover:text-indigo-800 cursor-pointer text-[10.5px] font-mono inline-flex items-center gap-1"
                        title="Click to preview/download document"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {check.documentName}
                      </span></span>
                    </div>

                    {/* Remarks detailing verification check */}
                    <p className="text-xs text-slate-500 font-semibold italic bg-slate-50 p-2.5 rounded-lg max-w-xl">
                      "{check.remarks}"
                    </p>
                  </div>

                  {/* Right Column: Status Toggle, Date & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs md:w-fit shrink-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Expiry Period</span>
                        <span className="text-slate-700 font-medium">{check.expiryDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[9px] uppercase">Last Updated</span>
                        <span className="text-slate-500 text-[10px]">{check.updatedAt.split('T')[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col justify-between w-full sm:w-28 gap-3 sm:space-y-1.5 border-t sm:border-t-0 p-2 sm:p-0">
                      {/* Status pill */}
                      <div className={`flex items-center gap-1 border px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase w-full justify-center ${getStatusStyle(check.status)}`}>
                        {getStatusIcon(check.status)}
                        <span>{check.status}</span>
                      </div>

                      {/* Dropdown to instantly toggle compliance */}
                      <select
                        id={`compliance_audit_update_${check.id}`}
                        value={check.status}
                        onChange={(e) => onUpdateCompliance(check.id, e.target.value as ComplianceCheck['status'], check.remarks)}
                        className="p-1 border text-[10px] font-bold bg-white rounded cursor-pointer outline-none w-full text-center"
                      >
                        <option value="passed">Pass Check</option>
                        <option value="pending">Mark Pending</option>
                        <option value="failed">Mark Hold</option>
                        <option value="expired">Mark Expired</option>
                      </select>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RENDER CERTIFICATE PREVIEW MODAL */}
      {previewCheck && (
        <div className="fixed inset-0 z-55 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center bg-slate-900">
              <div>
                <span className="text-[10px] font-mono text-indigo-300 font-extrabold block">CREDENTIAL VERIFICATION DESK</span>
                <h3 className="text-sm font-bold truncate max-w-xs">{previewCheck.checkType}</h3>
              </div>
              <button 
                onClick={() => setPreviewCheck(null)}
                className="p-1 px-2.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* File details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase text-[9px]">Document Name</span>
                  <span className="font-mono text-slate-800 break-all pr-4 font-bold">{previewCheck.documentName}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase text-[9px]">Track ID</span>
                  <span className="font-mono text-indigo-600 font-black">{previewCheck.id}</span>
                </div>
              </div>

              {/* Graphical Corporate Visual Certificate */}
              <div className="border-[5px] border-double border-indigo-100 p-6 rounded-2xl relative bg-slate-50/20 shadow-inner overflow-hidden flex flex-col items-center text-center space-y-3 min-h-[200px] justify-center">
                {/* Decorative corner borders */}
                <div className="absolute top-1 left-1 border-t border-l border-indigo-200 w-4 h-4" />
                <div className="absolute top-1 right-1 border-t border-r border-indigo-200 w-4 h-4" />
                <div className="absolute bottom-1 left-1 border-b border-l border-indigo-200 w-4 h-4" />
                <div className="absolute bottom-1 right-1 border-b border-r border-indigo-200 w-4 h-4" />

                {previewCheck.fileData && previewCheck.fileData.startsWith('data:image/') ? (
                  <div className="w-full flex justify-center">
                    <img 
                      src={previewCheck.fileData} 
                      className="max-h-56 object-contain rounded-lg shadow-md border" 
                      referrerPolicy="no-referrer"
                      alt={previewCheck.documentName} 
                    />
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-indigo-500 animate-pulse shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight uppercase">Elev8 Group Compliance Certificate</h4>
                      <p className="text-[10] text-slate-400 font-semibold uppercase mt-0.5 mt-1">Formal Auditor Attestation Log</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-600">The document registers legal accreditation standard verified for</p>
                      <p className="font-black text-indigo-900 text-xs">{previewCheck.vendorName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-2 border-t border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-bold uppercase">Audit Status</span>
                        <span className="font-mono font-bold text-emerald-600 uppercase tracking-wide">{previewCheck.status}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase">Audited Expiry</span>
                        <span className="font-mono font-bold text-slate-800">{previewCheck.expiryDate}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Remarks block */}
              <div className="space-y-1 text-[11px]">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Auditor Notes</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 italic text-slate-600 font-medium">
                  "{previewCheck.remarks}"
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between gap-3 text-xs">
              <button
                onClick={() => setPreviewCheck(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold rounded-xl cursor-pointer"
              >
                Cancel View
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewCheck.fileData || 'data:text/plain;charset=utf-8,' + encodeURIComponent(
                    `Elev8 Compliance Certificate attestation file\n\n` +
                    `Vendor: ${previewCheck.vendorName}\n` +
                    `Type: ${previewCheck.checkType}\n` +
                    `Status: ${previewCheck.status}\n` +
                    `Expiry: ${previewCheck.expiryDate}\n` +
                    `Remarks: ${previewCheck.remarks}\n` +
                    `Unique Registry ID: ${previewCheck.id}\n\n` +
                    `This attested credentials file is verified inside Elev8 media network systems.`
                  );
                  link.download = previewCheck.documentName.endsWith('.pdf') || previewCheck.documentName.endsWith('.png') || previewCheck.documentName.endsWith('.jpg') ? previewCheck.documentName : `${previewCheck.documentName}.txt`;
                  link.click();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                id="compliance_center_download_btn"
              >
                <Download className="w-3.5 h-3.5" />
                Download Attestation File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
