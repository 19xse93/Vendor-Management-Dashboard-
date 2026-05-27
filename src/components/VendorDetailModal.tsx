import React, { useState, useEffect } from 'react';
import { Vendor, Contract, PerformanceReview, ComplianceCheck, BUSINESS_UNITS, BusinessUnit } from '../types';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  FileText, 
  AlertOctagon, 
  Plus, 
  TrendingUp, 
  Award, 
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  UploadCloud,
  Check,
  Download,
  Eye,
  ShieldAlert
} from 'lucide-react';

interface VendorDetailModalProps {
  vendor: Vendor;
  contracts: Contract[];
  reviews: PerformanceReview[];
  compliance: ComplianceCheck[];
  onClose: () => void;
  onRenewContract: (contract: Contract) => void;
  onAddReview: (review: Omit<PerformanceReview, 'id' | 'vendorId' | 'vendorName' | 'overallScore'>) => void;
  onUpdateCompliance: (
    checkId: string, 
    status: ComplianceCheck['status'], 
    remarks: string,
    documentName?: string,
    fileData?: string,
    fileSize?: string
  ) => void;
  onAddComplianceCheck: (check: Omit<ComplianceCheck, 'id' | 'vendorId' | 'vendorName' | 'updatedAt'>) => void;
  onUpdateVendorRisk: (riskRating: Vendor['riskRating'], riskFactors: Record<string, 'Low' | 'Medium' | 'High'>, reason: string) => void;
}

export default function VendorDetailModal({
  vendor,
  contracts,
  reviews,
  compliance,
  onClose,
  onRenewContract,
  onAddReview,
  onUpdateCompliance,
  onAddComplianceCheck,
  onUpdateVendorRisk
}: VendorDetailModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'contracts' | 'performance' | 'compliance' | 'risk_evaluation'>('contracts');
  
  // States for adding a performance review
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [newReviewer, setNewReviewer] = useState('');
  const [newComments, setNewComments] = useState('');
  const [newQuality, setNewQuality] = useState(85);
  const [newDelivery, setNewDelivery] = useState(85);
  const [newCommunication, setNewCommunication] = useState(85);
  const [newPricing, setNewPricing] = useState(85);
  const [newBU, setNewBU] = useState<BusinessUnit>(vendor.businessUnits[0] || 'MEDIA');

  // States for adding a compliance check
  const [showAddComplianceForm, setShowAddComplianceForm] = useState(false);
  const [newCheckType, setNewCheckType] = useState('Mayor\'s Permit & Licensing');
  const [newCompStatus, setNewCompStatus] = useState<ComplianceCheck['status']>('passed');
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [newDocName, setNewDocName] = useState('validated_proof.pdf');
  const [newRemarks, setNewRemarks] = useState('');

  // File upload and certificate preview states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string, size: string} | null>(null);
  const [previewCheck, setPreviewCheck] = useState<ComplianceCheck | null>(null);

  // States for updatable risk evaluation
  const [evalRiskRating, setEvalRiskRating] = useState<Vendor['riskRating']>(vendor.riskRating);
  const [evalFinancial, setEvalFinancial] = useState<'Low' | 'Medium' | 'High'>(vendor.riskFactors?.financial || 'Low');
  const [evalCompliance, setEvalCompliance] = useState<'Low' | 'Medium' | 'High'>(vendor.riskFactors?.compliance || 'Low');
  const [evalSecurity, setEvalSecurity] = useState<'Low' | 'Medium' | 'High'>(vendor.riskFactors?.security || 'Low');
  const [evalOperational, setEvalOperational] = useState<'Low' | 'Medium' | 'High'>(vendor.riskFactors?.operational || 'Low');
  const [evalReason, setEvalReason] = useState('');
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  // Sync state when selected vendor changes
  useEffect(() => {
    setEvalRiskRating(vendor.riskRating);
    setEvalFinancial(vendor.riskFactors?.financial || 'Low');
    setEvalCompliance(vendor.riskFactors?.compliance || 'Low');
    setEvalSecurity(vendor.riskFactors?.security || 'Low');
    setEvalOperational(vendor.riskFactors?.operational || 'Low');
    setEvalReason('');
    setShowSuccessMsg(false);
  }, [vendor.id, vendor.riskRating, vendor.riskFactors]);

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

  const computedRating = (() => {
    const list = [evalFinancial, evalCompliance, evalSecurity, evalOperational];
    if (list.includes('High')) return 'High';
    if (list.includes('Medium')) return 'Medium';
    return 'Low';
  })();

  const handleRiskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalReason.trim()) return;
    onUpdateVendorRisk(
      evalRiskRating,
      {
        financial: evalFinancial,
        compliance: evalCompliance,
        security: evalSecurity,
        operational: evalOperational
      },
      evalReason
    );
    setShowSuccessMsg(true);
    setTimeout(() => {
      setShowSuccessMsg(false);
    }, 3000);
  };

  // Selected sub-items
  const vendorContracts = contracts.filter(c => c.vendorId === vendor.id);
  const vendorReviews = reviews.filter(r => r.vendorId === vendor.id);
  const vendorCompliance = compliance.filter(c => c.vendorId === vendor.id);

  // Status Badge
  const getStatusStyle = (status: Vendor['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'under_review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'suspended':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Submit Performance Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewer || !newComments) return;

    onAddReview({
      businessUnit: newBU,
      date: new Date().toISOString().split('T')[0],
      reviewer: newReviewer,
      comments: newComments,
      qualityScore: newQuality,
      deliveryScore: newDelivery,
      communicationScore: newCommunication,
      pricingScore: newPricing
    });

    // Reset Form
    setNewReviewer('');
    setNewComments('');
    setShowAddReviewForm(false);
  };

  // Submit Compliance Check
  const handleSubmitCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarks) return;

    onAddComplianceCheck({
      checkType: newCheckType,
      status: newCompStatus,
      expiryDate: newExpiryDate,
      documentName: newDocName || uploadedFile?.name || 'validated_proof.pdf',
      remarks: newRemarks,
      fileData: uploadedFile?.data,
      fileSize: uploadedFile?.size || 'Default Attachment'
    });

    setNewRemarks('');
    setUploadedFile(null);
    setShowAddComplianceForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" id="vendor_detail_modal_container">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header containing name & core status */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 relative">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-lg uppercase tracking-wide ${getStatusStyle(vendor.status)}`}>
                {vendor.status.replace('_', ' ')}
              </span>
              <span className={`text-[10px] uppercase px-2 py-1 bg-slate-200 text-slate-700 font-extrabold rounded-lg`}>
                Risk rating: {vendor.riskRating}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5" id="modal_vendor_name">
              <Building2 className="w-6 h-6 text-indigo-500" />
              {vendor.name}
            </h2>
            
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Category: <span className="text-slate-700 font-bold">{vendor.category}</span>
            </p>
          </div>

          <button
            id="close_vendor_modal_btn"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core details ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-indigo-500/5 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Primary Contact Email</p>
              <a href={`mailto:${vendor.email}`} className="font-bold text-indigo-600 hover:underline">{vendor.email}</a>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Contact Number</p>
              <span className="font-bold text-slate-800">{vendor.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Business Unit Engagement</p>
              <div className="flex gap-1.5 mt-1">
                {vendor.businessUnits.map(bu => (
                  <span key={bu} className={`text-[9px] font-black px-1.5 py-0.5 rounded ${BUSINESS_UNITS[bu].bgColor} ${BUSINESS_UNITS[bu].color}`}>
                    {BUSINESS_UNITS[bu].name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Payment Terms</p>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{vendor.paymentTerms || 'Net 30'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Term Duration</p>
              <span className="font-bold text-slate-800 font-mono text-[11px]">{vendor.termDuration || '12 Months'}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-white" id="modal_subtabs_container">
          <button
            id="subtab_contracts_btn"
            onClick={() => setActiveSubTab('contracts')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'contracts'
                ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4.5 h-4.5" />
              Service Contracts ({vendorContracts.length})
            </div>
          </button>
          <button
            id="subtab_performance_btn"
            onClick={() => setActiveSubTab('performance')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'performance'
                ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Activity className="w-4.5 h-4.5" />
              Performance Performance ({vendorReviews.length})
            </div>
          </button>
          <button
            id="subtab_compliance_btn"
            onClick={() => setActiveSubTab('compliance')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'compliance'
                ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5" />
              Credentials Audits ({vendorCompliance.length})
            </div>
          </button>
          <button
            id="subtab_risk_evaluation_btn"
            onClick={() => setActiveSubTab('risk_evaluation')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'risk_evaluation'
                ? 'border-indigo-500 text-indigo-600 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5" />
              Risk Evaluate & Factors
            </div>
          </button>
        </div>

        {/* TAB BODY (Scrollable content) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50" id="modal_tab_body_container">
          
          {/* CONTRACTS SUB TAB */}
          {activeSubTab === 'contracts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800 text-sm">Active Service Level Agreements</h3>
                <span className="text-xs text-slate-400 font-bold font-mono">Accredited active agreements: {vendorContracts.length}</span>
              </div>

              {vendorContracts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm bg-white border border-dashed rounded-xl">
                  No registered active contracts. Assign a contract to start streamlining.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorContracts.map(contract => {
                    const isExp = contract.status === 'expiring_soon';
                    const isExpired = contract.status === 'expired';
                    return (
                      <div key={contract.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{contract.id}</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${BUSINESS_UNITS[contract.businessUnit].bgColor} ${BUSINESS_UNITS[contract.businessUnit].color}`}>
                              {BUSINESS_UNITS[contract.businessUnit].name}
                            </span>
                          </div>
                          
                          <h4 className="font-bold text-slate-900 text-xs lines-clamp-1">{contract.title}</h4>
                          
                          <div className="grid grid-cols-2 gap-2 py-1 text-[11px] text-slate-600 font-medium">
                            <div>
                              <span className="text-slate-400 font-bold block text-[9px] uppercase">SLA Target Response</span>
                              <span className="text-slate-900 font-extrabold">{contract.value} Hours</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold block text-[9px] uppercase">Compliance Status</span>
                              <span className={`font-semibold ${
                                contract.complianceStatus === 'compliant' ? 'text-emerald-600' : 'text-amber-600'
                              }`}>{contract.complianceStatus.replace('_', ' ')}</span>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>Period: {contract.startDate} to {contract.endDate}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            isExp ? 'bg-amber-100 text-amber-800' : isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {contract.status.replace('_', ' ')}
                          </span>

                          <button
                            id={`modal_renew_btn_${contract.id}`}
                            onClick={() => onRenewContract(contract)}
                            className="text-[10px] font-bold text-indigo-600 cursor-pointer hover:text-indigo-800 hover:underline flex items-center gap-1"
                          >
                            Execute Renewal Form
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PERFORMANCE SUB TAB */}
          {activeSubTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Indicator Rings */}
              <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-4">Overall Performance Scorecards</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1 py-2 rounded-lg bg-indigo-50/20">
                    <span className="text-2xl font-black text-indigo-600">{vendor.performanceMetrics.quality}%</span>
                    <p className="text-[10.5px] text-slate-500 font-bold uppercase">Quality Score</p>
                  </div>
                  <div className="space-y-1 py-2 rounded-lg bg-pink-50/20">
                    <span className="text-2xl font-black text-pink-600">{vendor.performanceMetrics.delivery}%</span>
                    <p className="text-[10.5px] text-slate-500 font-bold uppercase">Delivery Slas</p>
                  </div>
                  <div className="space-y-1 py-2 rounded-lg bg-teal-50/20">
                    <span className="text-2xl font-black text-teal-600">{vendor.performanceMetrics.communication}%</span>
                    <p className="text-[10.5px] text-slate-500 font-bold uppercase">Communication</p>
                  </div>
                  <div className="space-y-1 py-2 rounded-lg bg-amber-50/20">
                    <span className="text-2xl font-black text-amber-600">{vendor.performanceMetrics.pricing}%</span>
                    <p className="text-[10.5px] text-slate-500 font-bold uppercase">SLA Align</p>
                  </div>
                </div>
              </div>

              {/* Add scorecard action */}
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">Past Evaluations ({vendorReviews.length})</h4>
                <button
                  id="toggle_add_scorecard_form_btn"
                  onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log New Scorecard
                </button>
              </div>

              {/* Form to submit review */}
              {showAddReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-white p-5 rounded-xl border border-indigo-150 space-y-4 shadow-sm relative animate-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h5 className="font-bold text-indigo-600 text-sm">Evaluation Parameters</h5>
                    <button 
                      type="button" 
                      onClick={() => setShowAddReviewForm(false)} 
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Reviewer Name & Position</label>
                      <input 
                        required
                        type="text" 
                        value={newReviewer}
                        onChange={(e) => setNewReviewer(e.target.value)}
                        placeholder="e.g. Marie Cruz (Media Director)" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Business Unit context</label>
                      <select
                        value={newBU}
                        onChange={(e) => setNewBU(e.target.value as BusinessUnit)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        {vendor.businessUnits.map(bu => (
                          <option key={bu} value={bu}>{BUSINESS_UNITS[bu].fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Quality slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                        <span>Quality ({newQuality}%)</span>
                      </div>
                      <input 
                        type="range" min="1" max="100" value={newQuality} 
                        onChange={e => setNewQuality(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer" 
                      />
                    </div>
                    {/* Delivery Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                        <span>Delivery SLA ({newDelivery}%)</span>
                      </div>
                      <input 
                        type="range" min="1" max="100" value={newDelivery} 
                        onChange={e => setNewDelivery(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer" 
                      />
                    </div>
                    {/* Communication Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                        <span>Communication ({newCommunication}%)</span>
                      </div>
                      <input 
                        type="range" min="1" max="100" value={newCommunication} 
                        onChange={e => setNewCommunication(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer" 
                      />
                    </div>
                    {/* Pricing Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                        <span>SLA Commitment Alignment ({newPricing}%)</span>
                      </div>
                      <input 
                        type="range" min="1" max="100" value={newPricing} 
                        onChange={e => setNewPricing(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700">Detailed Comments</label>
                    <textarea 
                      required
                      value={newComments}
                      onChange={(e) => setNewComments(e.target.value)}
                      placeholder="Comment on overall reliability, operational issues, compliance and recommendations."
                      rows={3}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      id="save_scorecard_submit"
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs cursor-pointer rounded-lg hover:bg-indigo-700"
                    >
                      Save Evaluation
                    </button>
                  </div>
                </form>
              )}

              {/* List of past audits */}
              <div className="space-y-3">
                {vendorReviews.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-white border border-dashed rounded-xl">
                    No historic performance evaluations available. Log one above.
                  </div>
                ) : (
                  vendorReviews.map(review => (
                    <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-slate-800">{review.reviewer}</span>
                          <span className="text-[10px] block text-slate-400 font-medium">Logged on {review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                          <Award className="w-3.5 h-3.5" />
                          <span>{review.overallScore}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg">
                        "{review.comments}"
                      </p>

                      <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 text-center font-bold">
                        <div>
                          <span className="block text-slate-400">Quality</span>
                          <span>{review.qualityScore}%</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Delivery</span>
                          <span>{review.deliveryScore}%</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">Comm.</span>
                          <span>{review.communicationScore}%</span>
                        </div>
                        <div>
                          <span className="block text-slate-400">SLA Align</span>
                          <span>{review.pricingScore}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* COMPLIANCE SUB TAB */}
          {activeSubTab === 'compliance' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Legal & Corporate Credentials Audit</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Maintain current corporate filings to prevent operating closures.</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-emerald-600">{vendor.complianceScore}%</span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">COMPLIANCE INDEX</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-850 text-sm">Regulatory Requirements Checklist</h4>
                <button
                  id="toggle_add_compliance_form_btn"
                  onClick={() => setShowAddComplianceForm(!showAddComplianceForm)}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Audit Item
                </button>
              </div>

              {/* Audit item Form */}
              {showAddComplianceForm && (
                <form onSubmit={handleSubmitCompliance} className="bg-white p-5 rounded-xl border border-emerald-150 space-y-4 shadow-sm relative animate-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h5 className="font-bold text-emerald-600 text-sm">Regulatory Certificate Upload</h5>
                    <button 
                      type="button" 
                      onClick={() => setShowAddComplianceForm(false)} 
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Requirement Standard Type</label>
                      <select
                        value={newCheckType}
                        onChange={(e) => setNewCheckType(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Mayor's Permit & Licensing">Mayor's Permit & Licensing</option>
                        <option value="Bureau of Internal Revenue Tax Clearance (2303)">Tax Clearance (BIR 2303)</option>
                        <option value="SEC Registration Certificate">SEC Registration Certificate</option>
                        <option value="General Liability Insurance Policy">Corporate Insurance Policy</option>
                        <option value="Bilateral Corporate NDA">MNDA / Confidentiality</option>
                        <option value="SOC 2 Type II Auditing Details">SOC 2 / Data Security Clearance</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Audited Document Name</label>
                      <input 
                        required
                        type="text" 
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="e.g. SEC_Accreditation_2026.pdf" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
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
                        setNewDocName(name);
                      })}
                      onClick={() => document.getElementById('new_cert_file_picker')?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isDragging
                          ? 'border-emerald-500 bg-emerald-50'
                          : uploadedFile
                          ? 'border-indigo-550 border-indigo-505 border-indigo-500 bg-indigo-50/20'
                          : 'border-slate-150 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        id="new_cert_file_picker"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, (name, data, size) => {
                          setUploadedFile({ name, data, size });
                          setNewDocName(name);
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Verification Status</label>
                      <select
                        value={newCompStatus}
                        onChange={(e) => setNewCompStatus(e.target.value as ComplianceCheck['status'])}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
                      >
                        <option value="passed">Passed (Valid / Compliant)</option>
                        <option value="pending">Pending (Review in progress)</option>
                        <option value="failed">Failed (Action Required / Hold)</option>
                        <option value="expired">Expired (Requires Update)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Expiry Date</label>
                      <input 
                        required
                        type="date" 
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700">Remarks / Auditor Details</label>
                    <input 
                      required
                      type="text" 
                      value={newRemarks}
                      onChange={(e) => setNewRemarks(e.target.value)}
                      placeholder="e.g. SEC registration confirmed on official website index; fully compliant."
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      id="save_compliance_submit"
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs cursor-pointer rounded-lg hover:bg-emerald-700"
                    >
                      Commit Audit Item
                    </button>
                  </div>
                </form>
              )}

              {/* Checklist list */}
              <div className="space-y-3">
                {vendorCompliance.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-white border border-dashed rounded-xl">
                    No compliance parameters evaluated. Log one above.
                  </div>
                ) : (
                  vendorCompliance.map(check => {
                    const isPassed = check.status === 'passed';
                    const isPending = check.status === 'pending';
                    const isExpired = check.status === 'expired' || check.status === 'failed';

                    return (
                      <div key={check.id} className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">{check.checkType}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isPassed ? 'bg-emerald-50 text-emerald-700' : isPending ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {check.status}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-slate-500">{check.remarks}</p>
                          
                          <div className="flex flex-col gap-1.5 mt-1">
                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                Doc: <span 
                                  onClick={() => setPreviewCheck(check)}
                                  className="text-indigo-600 font-bold hover:text-indigo-800 underline cursor-pointer flex items-center gap-0.5"
                                  title="Click to preview/verify document"
                                >
                                  <Eye className="w-3 h-3 text-indigo-505 text-indigo-500 shrink-0" />
                                  {check.documentName}
                                </span>
                              </span>
                              <span>•</span>
                              <span>Expiry: <span className="text-slate-700 font-bold font-mono">{check.expiryDate}</span></span>
                              {check.fileSize && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-550 text-slate-500 font-semibold font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[9.5px]">Size: {check.fileSize}</span>
                                </>
                              )}
                            </div>

                            {/* Inline File Upload & Replace Button for each specific certificate */}
                            <div className="flex items-center gap-3 mt-0.5">
                              <label className="text-[9.5px] bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 font-bold shadow-xs transition-all">
                                <UploadCloud className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                                <span>{check.fileData ? 'Replace File' : 'Upload File'}</span>
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const base64Data = event.target?.result as string;
                                        onUpdateCompliance(
                                          check.id,
                                          check.status,
                                          check.remarks,
                                          file.name,
                                          base64Data,
                                          formatBytes(file.size)
                                        );
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>

                              {check.fileData && (
                                <span className="text-[9.5px] text-emerald-600 font-black tracking-wide flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  SECURE ENCRYPTED STORE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Audit Action Panel */}
                        <div className="flex items-center gap-2 sm:self-center">
                          <select
                            id={`compliance_status_update_${check.id}`}
                            value={check.status}
                            onChange={(e) => onUpdateCompliance(check.id, e.target.value as ComplianceCheck['status'], check.remarks)}
                            className="text-[10px] font-bold p-1 border rounded bg-slate-50 cursor-pointer outline-none"
                          >
                            <option value="passed">Pass Document</option>
                            <option value="pending">Mark Pending</option>
                            <option value="failed">Flag Failed</option>
                            <option value="expired">Flag Expired</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'risk_evaluation' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Header card description */}
              <div className="bg-white border p-4 rounded-xl shadow-xs space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">Corporate Supplier Risk Evaluation Engine</h3>
                <p className="text-slate-400">
                  Assess and update operational, financial, compliance, and cybersecurity risk elements for <strong>{vendor.name}</strong>. Evaluated entries are immediately preserved in the central audit registry.
                </p>
              </div>

              {/* Matrix Board */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { title: 'Financial Solvency', key: 'financial_fac', val: evalFinancial, set: setEvalFinancial, desc: 'Balance sheet & funding rating' },
                  { title: 'Compliance & Permits', key: 'compliance_fac', val: evalCompliance, set: setEvalCompliance, desc: 'Licenses & legal stand' },
                  { title: 'IT & Cyber Security', key: 'security_fac', val: evalSecurity, set: setEvalSecurity, desc: 'Datashield & privacy' },
                  { title: 'Operational & SLA', key: 'operational_fac', val: evalOperational, set: setEvalOperational, desc: 'Deliveries & logistic' }
                ].map(fac => {
                  const valColor = fac.val === 'High' ? 'bg-rose-50 border-rose-100 text-rose-700' : fac.val === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700';
                  return (
                    <div key={fac.key} className={`border p-3.5 rounded-xl transition-all space-y-2 flex flex-col justify-between ${valColor}`}>
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">{fac.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{fac.desc}</span>
                      </div>
                      <div className="pt-2">
                        <select
                          id={`risk_factor_select_${fac.key}`}
                          value={fac.val}
                          onChange={(e) => fac.set(e.target.value as any)}
                          className="w-full text-xs font-bold p-1.5 border rounded-lg bg-white cursor-pointer outline-none text-slate-800 border-slate-200"
                        >
                          <option value="Low">Low Risk</option>
                          <option value="Medium">Medium Risk</option>
                          <option value="High">High Risk</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Assessment Dashboard */}
              <form onSubmit={handleRiskSubmit} className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-850 space-y-4 shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3.5">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-bold block uppercase tracking-wide">Dynamic Calibration</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Based on current dimensions, recommended state is: <span className={`font-black ${computedRating === 'High' ? 'text-rose-400' : computedRating === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{computedRating} Risk</span>
                    </div>
                  </div>
                  {evalRiskRating !== computedRating && (
                    <button
                      type="button"
                      onClick={() => setEvalRiskRating(computedRating)}
                      className="px-3 py-1.5 bg-indigo-600/35 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 font-bold text-[10.5px] rounded-lg cursor-pointer transition-all uppercase tracking-wide"
                    >
                      Sync proposed to {computedRating}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select final rating */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 text-[11px] block uppercase tracking-wide">Proposed Overall Risk Level</label>
                    <div className="flex gap-2.5 pt-1">
                      {['Low', 'Medium', 'High'].map(level => {
                        const isChecked = evalRiskRating === level;
                        const activeBg = level === 'High' ? 'bg-rose-500 text-white border-rose-500' : level === 'Medium' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-emerald-500 text-white border-emerald-500';
                        return (
                          <label
                            key={level}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border rounded-xl text-center font-black cursor-pointer transition-all select-none text-xs border-slate-800 bg-slate-950/40 text-slate-400 ${isChecked ? activeBg : 'hover:bg-slate-800'}`}
                          >
                            <input
                              type="radio"
                              name="evalRisk"
                              value={level}
                              checked={isChecked}
                              onChange={() => setEvalRiskRating(level as any)}
                              className="hidden"
                            />
                            {level} Risk
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Justification note */}
                  <div className="space-y-1.5">
                    <label htmlFor="risk_justification_input" className="font-bold text-slate-300 text-[11px] block uppercase tracking-wide">
                      Re-Evaluation Justification <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="risk_justification_input"
                      type="text"
                      required
                      placeholder="e.g., Supplier cleared IT security audit, NDA signed, or financial review complete."
                      value={evalReason}
                      onChange={(e) => setEvalReason(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-850 rounded-xl bg-slate-950 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    {showSuccessMsg ? (
                      <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1.5 animate-bounce">
                        ✓ Risk Rating successfully calibrated & logged!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium italic">All re-evaluation actions are logged in the corporate audit logs.</span>
                    )}
                  </div>
                  <button
                    id="submit_risk_reeval_btn"
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Commit Risk Re-Evaluation
                  </button>
                </div>
              </form>

              {/* Historical audit info or helpful reference */}
              <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl flex gap-3 text-xs text-slate-600">
                <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0 self-start" />
                <div className="space-y-1 flex-1">
                  <span className="font-black text-slate-700 block uppercase text-[10px]">Governance Policy Protocol</span>
                  <p className="font-semibold leading-relaxed">
                    Always inspect physical compliance track records, business continuity plans, and tax clearance certifications before degrading a partner from medium or high risk to low risk.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between text-xs" id="vendor_detail_footer">
          <span className="text-slate-400 self-center font-semibold font-mono">Dossier active for {vendor.id}</span>
          <button
            id="close_vendor_modal_footer_btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>

      {/* RENDER CERTIFICATE PREVIEW MODAL */}
      {previewCheck && (
        <div className="fixed inset-0 z-55 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-150 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            {/* Modal Header */}
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
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
                id="download_attested_cert_btn"
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
