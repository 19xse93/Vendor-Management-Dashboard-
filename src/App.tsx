import { useState, useEffect } from 'react';
import { 
  getStoredVendors, 
  saveVendors, 
  getStoredContracts, 
  saveContracts, 
  getStoredReviews, 
  saveReviews, 
  getStoredCompliance, 
  saveCompliance, 
  getStoredLogs, 
  saveLogs, 
  appendLog,
  getStoredCompanyDocuments,
  saveCompanyDocuments
} from './mockData';
import { Vendor, Contract, PerformanceReview, ComplianceCheck, LogEntry, BusinessUnit, BUSINESS_UNITS, CompanyDocument } from './types';
import Dashboard from './components/Dashboard';
import VendorList from './components/VendorList';
import ContractRenewals from './components/ContractRenewals';
import PerformanceTracker from './components/PerformanceTracker';
import ComplianceCenter from './components/ComplianceCenter';
import CompanyDocuments from './components/CompanyDocuments';
import Login from './components/Login';
import { 
  isFirebaseConfigured, 
  saveUserProfile, 
  fetchCompanyDocuments, 
  uploadCompanyDocumentToFirestore, 
  deleteCompanyDocumentFromFirestore, 
  fetchComplianceChecks, 
  saveComplianceCheckToFirestore 
} from './firebase';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  ShieldCheck, 
  History, 
  Clock, 
  Check, 
  BellRing,
  Award,
  CircleCheck,
  FolderOpen,
  Shield,
  LogOut,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Authenticated User Session state
  const [user, setUser] = useState<{
    email: string;
    role: 'ADMIN' | 'COMPLIANCE_OFFICER' | 'GUEST_AUDITOR';
    fullName: string;
    subsidiaryAccess: 'ALL' | 'MEDIA' | 'HOLDINGS' | 'TRADING';
  } | null>(() => {
    const stored = localStorage.getItem('elev8_vms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogin = (u: any) => {
    setUser(u);
    localStorage.setItem('elev8_vms_user', JSON.stringify(u));
    if (isFirebaseConfigured()) {
      const safeId = u.email.replace(/[^a-zA-Z0-9_\-]/g, '_');
      saveUserProfile(safeId, u.email, u.role, u.fullName);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('elev8_vms_user');
  };
  
  // Real-time states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [compliance, setCompliance] = useState<ComplianceCheck[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [companyDocuments, setCompanyDocuments] = useState<CompanyDocument[]>([]);
  
  // Current UTC time state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Track dynamic link selection to open Renewal Form straight away
  const [selectedRenewalContract, setSelectedRenewalContract] = useState<Contract | null>(null);

  // Initialize data from localStorage or mockData defaults
  useEffect(() => {
    setVendors(getStoredVendors());
    setContracts(getStoredContracts());
    setReviews(getStoredReviews());
    setLogs(getStoredLogs());

    if (isFirebaseConfigured()) {
      fetchCompanyDocuments().then(docs => {
        if (docs && docs.length > 0) {
          setCompanyDocuments(docs);
        } else {
          const initialDocs = getStoredCompanyDocuments();
          setCompanyDocuments(initialDocs);
          initialDocs.forEach(d => uploadCompanyDocumentToFirestore(d));
        }
      }).catch(() => {
        setCompanyDocuments(getStoredCompanyDocuments());
      });

      fetchComplianceChecks().then(checks => {
        if (checks && checks.length > 0) {
          setCompliance(checks);
        } else {
          const initialChecks = getStoredCompliance();
          setCompliance(initialChecks);
          initialChecks.forEach(c => saveComplianceCheckToFirestore(c));
        }
      }).catch(() => {
        setCompliance(getStoredCompliance());
      });
    } else {
      setCompliance(getStoredCompliance());
      setCompanyDocuments(getStoredCompanyDocuments());
    }

    // Sync clock on 2026 UTC period
    const updateClock = () => {
      const date = new Date();
      setCurrentTime(date.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync back to local storage whenever states update
  const handleSetVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    saveVendors(newVendors);
  };

  const handleSetContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    saveContracts(newContracts);
  };

  const handleSetReviews = (newReviews: PerformanceReview[]) => {
    setReviews(newReviews);
    saveReviews(newReviews);
  };

  const handleSetCompliance = (newCompliance: ComplianceCheck[]) => {
    setCompliance(newCompliance);
    saveCompliance(newCompliance);
  };

  // --- STATE MODIFIERS (CRUD) ---

  // 1. Add Vendor
  const handleAddVendor = (newVendor: Omit<Vendor, 'id' | 'overallScore' | 'createdAt'>) => {
    const nextId = `V-${String(vendors.length + 1).padStart(3, '0')}`;
    const vendor: Vendor = {
      ...newVendor,
      id: nextId,
      overallScore: 80, // Default baseline performance score
      createdAt: new Date().toISOString()
    };

    const updated = [...vendors, vendor];
    handleSetVendors(updated);
    
    // Auto provision mock compliance documents for new vendors! (To make UX amazing)
    const mockChecks: ComplianceCheck[] = [
      {
        id: `CC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        vendorId: nextId,
        vendorName: vendor.name,
        checkType: "Mayor's Permit & Licensing",
        status: 'passed',
        expiryDate: '2027-01-31',
        documentName: `Mayor_Permit_2026_${vendor.name.split(' ')[0]}.pdf`,
        remarks: 'Provisioned on onboarding registry.',
        updatedAt: new Date().toISOString()
      },
      {
        id: `CC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        vendorId: nextId,
        vendorName: vendor.name,
        checkType: "Bureau of Internal Revenue Tax Clearance (2303)",
        status: 'pending',
        expiryDate: '2026-12-31',
        documentName: `BIR_Form_2303_${vendor.name.split(' ')[0]}.pdf`,
        remarks: 'Review in progress; document submitted to taxation desk.',
        updatedAt: new Date().toISOString()
      }
    ];

    const updatedComp = [...compliance, ...mockChecks];
    handleSetCompliance(updatedComp);

    if (isFirebaseConfigured()) {
      mockChecks.forEach(c => saveComplianceCheckToFirestore(c));
    }

    appendLog('Vendor Portfolio Published', `Registered ${vendor.name} under ${vendor.category}`, 'vendor');
    setLogs(getStoredLogs());
  };

  // 2. Update Vendor Status
  const handleUpdateVendorStatus = (vendorId: string, status: Vendor['status']) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) return { ...v, status };
      return v;
    });
    handleSetVendors(updated);

    const vendorName = vendors.find(v => v.id === vendorId)?.name || 'Unknown';
    appendLog('Vendor Status Revised', `Adjusted ${vendorName} status to ${status.replace('_', ' ')}`, 'vendor');
    setLogs(getStoredLogs());
  };

  // 2b. Update Vendor Risk Evaluation & Factors
  const handleUpdateVendorRisk = (
    vendorId: string, 
    riskRating: Vendor['riskRating'], 
    riskFactors: Record<string, 'Low' | 'Medium' | 'High'>,
    reason: string
  ) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) {
        return { 
          ...v, 
          riskRating, 
          riskFactors 
        };
      }
      return v;
    });
    handleSetVendors(updated);

    const vendorName = vendors.find(v => v.id === vendorId)?.name || 'Unknown';
    appendLog('Vendor Risk Re-evaluated', `Updated ${vendorName} Risk to ${riskRating} level. Reason: ${reason}`, 'vendor');
    setLogs(getStoredLogs());
  };

  // 3. Renew Contract
  const handleRenewSubmit = (contractId: string, extensionMonths: number, newValue: number, autoRenew: boolean, noticePeriod: number) => {
    const original = contracts.find(c => c.id === contractId);
    if (!original) return;

    // Calculate new end date based on original end date plus extension months
    const prevEnd = new Date(original.endDate);
    prevEnd.setMonth(prevEnd.getMonth() + extensionMonths);
    const newEndDate = prevEnd.toISOString().split('T')[0];

    const updated = contracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          endDate: newEndDate,
          value: newValue,
          autoRenew,
          noticePeriodDays: noticePeriod,
          status: 'active' as const, // resets warning statuses
          complianceStatus: 'compliant' as const
        };
      }
      return c;
    });
    handleSetContracts(updated);

    // Update parent vendor compliance metrics optionally if it is fully renewed
    appendLog('Agreement Renewed', `SLA ${original.id} with ${original.vendorName} extended for ${extensionMonths} months. Spend adjusted to PHP ${newValue.toLocaleString()}`, 'contract');
    setLogs(getStoredLogs());
    setSelectedRenewalContract(null);
  };

  // 4. Add Contract
  const handleAddContract = (newContract: Omit<Contract, 'id' | 'status' | 'complianceStatus'>) => {
    const nextId = `CON-${contracts.length + 101}`;
    
    // Determine status based on dates
    const today = new Date('2026-05-27');
    const end = new Date(newContract.endDate);
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    let status: Contract['status'] = 'active';
    if (diffDays <= 0) status = 'expired';
    else if (diffDays <= 30) status = 'expiring_soon';

    const contract: Contract = {
      ...newContract,
      id: nextId,
      status,
      complianceStatus: 'compliant'
    };

    const updated = [...contracts, contract];
    handleSetContracts(updated);

    appendLog('Agreement Issued', `Registered new contract ${nextId} with ${contract.vendorName}`, 'contract');
    setLogs(getStoredLogs());
  };

  // 5. Add Performance Review
  const handleAddReview = (vendorId: string, review: Omit<PerformanceReview, 'id' | 'vendorId' | 'vendorName' | 'overallScore'>) => {
    const nextId = `REV-${reviews.length + 201}`;
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    // Calculate overallScore as general average
    const overallScore = Math.round(
      (review.qualityScore + review.deliveryScore + review.communicationScore + review.pricingScore) / 4
    );

    const fullReview: PerformanceReview = {
      ...review,
      id: nextId,
      vendorId,
      vendorName: vendor.name,
      overallScore
    };

    const updatedReviews = [fullReview, ...reviews];
    handleSetReviews(updatedReviews);

    // Recalculate Vendor overallScore and specific parameters dynamically
    const vendorReviews = updatedReviews.filter(r => r.vendorId === vendorId);
    const avgOverall = Math.round(vendorReviews.reduce((sum, r) => sum + r.overallScore, 0) / vendorReviews.length);
    const avgQuality = Math.round(vendorReviews.reduce((sum, r) => sum + r.qualityScore, 0) / vendorReviews.length);
    const avgDelivery = Math.round(vendorReviews.reduce((sum, r) => sum + r.deliveryScore, 0) / vendorReviews.length);
    const avgComm = Math.round(vendorReviews.reduce((sum, r) => sum + r.communicationScore, 0) / vendorReviews.length);
    const avgPrice = Math.round(vendorReviews.reduce((sum, r) => sum + r.pricingScore, 0) / vendorReviews.length);

    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          overallScore: avgOverall,
          performanceMetrics: {
            quality: avgQuality,
            delivery: avgDelivery,
            communication: avgComm,
            pricing: avgPrice
          }
        };
      }
      return v;
    });
    handleSetVendors(updatedVendors);

    appendLog('Evaluation Lodged', `Performance scorecard ${nextId} certified for ${vendor.name} (Result: ${overallScore}%)`, 'performance');
    setLogs(getStoredLogs());
  };

  // 6. Update Compliance Audit
  const handleUpdateCompliance = (
    checkId: string, 
    status: ComplianceCheck['status'], 
    remarks: string,
    documentName?: string,
    fileData?: string,
    fileSize?: string
  ) => {
    const targetCheck = compliance.find(c => c.id === checkId);
    if (!targetCheck) return;

    const updated = compliance.map(c => {
      if (c.id === checkId) {
        const item = {
          ...c,
          status,
          remarks: remarks || c.remarks,
          documentName: documentName || c.documentName,
          fileData: fileData !== undefined ? fileData : c.fileData,
          fileSize: fileSize !== undefined ? fileSize : c.fileSize,
          updatedAt: new Date().toISOString()
        };
        if (isFirebaseConfigured()) {
          saveComplianceCheckToFirestore(item);
        }
        return item;
      }
      return c;
    });
    handleSetCompliance(updated);

    // Recalculate target vendor complianceScore and Risk Rating!
    const vendorId = targetCheck.vendorId;
    const vendorChecks = updated.filter(c => c.vendorId === vendorId);
    const passedCount = vendorChecks.filter(c => c.status === 'passed').length;
    
    const complianceScore = Math.round(
      vendorChecks.length > 0 ? (passedCount / vendorChecks.length) * 100 : 100
    );

    // Auto calculate risk index based on compliance
    let riskRating: Vendor['riskRating'] = 'Low';
    if (complianceScore < 50) riskRating = 'High';
    else if (complianceScore < 90) riskRating = 'Medium';

    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          complianceScore,
          riskRating
        };
      }
      return v;
    });
    handleSetVendors(updatedVendors);

    appendLog('Compliance Check revised', `Credential check for ${targetCheck.vendorName} marked ${status.toUpperCase()}`, 'compliance');
    setLogs(getStoredLogs());
  };

  // 7. Add Compliance Check
  const handleAddComplianceCheck = (vendorId: string, check: Omit<ComplianceCheck, 'id' | 'vendorId' | 'vendorName' | 'updatedAt'>) => {
    const nextId = `CC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;

    const fullCheck: ComplianceCheck = {
      ...check,
      id: nextId,
      vendorId,
      vendorName: vendor.name,
      updatedAt: new Date().toISOString()
    };

    const updatedCompliance = [...compliance, fullCheck];
    handleSetCompliance(updatedCompliance);

    if (isFirebaseConfigured()) {
      saveComplianceCheckToFirestore(fullCheck);
    }

    // Recalculate complianceScore for the vendor
    const vendorChecks = updatedCompliance.filter(c => c.vendorId === vendorId);
    const passedCount = vendorChecks.filter(c => c.status === 'passed').length;
    const complianceScore = Math.round((passedCount / vendorChecks.length) * 100);

    let riskRating: Vendor['riskRating'] = 'Low';
    if (complianceScore < 50) riskRating = 'High';
    else if (complianceScore < 90) riskRating = 'Medium';

    const updatedVendors = vendors.map(v => {
      if (v.id === vendorId) {
        return {
          ...v,
          complianceScore,
          riskRating
        };
      }
      return v;
    });
    handleSetVendors(updatedVendors);

    appendLog('Compliance Check Added', `Authorized regulatory standard ${check.checkType} for ${vendor.name}`, 'compliance');
    setLogs(getStoredLogs());
  };

  // 8. Company Documents CRUD
  const handleAddCompanyDocument = (newDoc: Omit<CompanyDocument, 'id' | 'uploadedAt'>) => {
    const doc: CompanyDocument = {
      ...newDoc,
      id: `DOC-${String(companyDocuments.length + 101)}`,
      uploadedAt: new Date().toISOString()
    };
    const updated = [doc, ...companyDocuments];
    setCompanyDocuments(updated);
    saveCompanyDocuments(updated);
    if (isFirebaseConfigured()) {
      uploadCompanyDocumentToFirestore(doc);
    }
    appendLog('Upload Document', `Uploaded corporate credential "${doc.documentType}" for subsidiary ${doc.subsidiary}.`, 'compliance');
    setLogs(getStoredLogs());
  };

  const handleDeleteCompanyDocument = (docId: string) => {
    const doc = companyDocuments.find(d => d.id === docId);
    if (!doc) return;
    const updated = companyDocuments.filter(d => d.id !== docId);
    setCompanyDocuments(updated);
    saveCompanyDocuments(updated);
    if (isFirebaseConfigured()) {
      deleteCompanyDocumentFromFirestore(docId);
    }
    appendLog('Delete Document', `Deleted company document "${doc.documentType}" (ID: ${docId}).`, 'compliance');
    setLogs(getStoredLogs());
  };

  const handleUpdateCompanyDocumentStatus = (docId: string, status: CompanyDocument['status']) => {
    const updated = companyDocuments.map(d => {
      if (d.id === docId) {
        const item = { ...d, status };
        if (isFirebaseConfigured()) {
          uploadCompanyDocumentToFirestore(item);
        }
        return item;
      }
      return d;
    });
    setCompanyDocuments(updated);
    saveCompanyDocuments(updated);
    const doc = companyDocuments.find(d => d.id === docId);
    if (doc) {
      appendLog('Status Update', `Updated company document "${doc.documentType}" (ID: ${docId}) status to ${status}.`, 'compliance');
      setLogs(getStoredLogs());
    }
  };

  // --- SYSTEM STATS IN HEADER ---
  const activeAgreementsCount = contracts.filter(c => c.status === 'active' || c.status === 'expiring_soon').length;
  const expiredContractsCount = contracts.filter(c => c.status === 'expired').length;
  const totalSpendSum = contracts
    .filter(c => c.status === 'active' || c.status === 'expiring_soon')
    .reduce((sum, c) => sum + c.value, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans" id="app_root_frame">
      
      {/* GLOBAL HEADBOARD TOPBAR */}
      <header className="bg-slate-900 text-white shrink-0 shadow-md border-b border-indigo-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <Building2 className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-indigo-400">ELEV8 GROUP</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">subsidiary portal</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-none mt-1">Vendor & Contract Hub</h1>
          </div>
        </div>

        {/* Aggregate ribbon details */}
        <div className="flex items-center flex-wrap gap-5 text-xs text-slate-300 font-semibold">
          {/* User auth ribbon status */}
          <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80" id="user_ribbon_status">
            <div className="p-1 bg-indigo-505/20 text-indigo-400 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left font-sans">
              <div className="text-white font-extrabold text-[11px] leading-tight truncate max-w-[130px]" title={user.fullName}>
                {user.fullName}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.2 rounded-sm ${
                  user.role === 'ADMIN' 
                    ? 'bg-amber-400/20 text-amber-300' 
                    : user.role === 'COMPLIANCE_OFFICER' 
                    ? 'bg-emerald-400/20 text-emerald-300' 
                    : 'bg-slate-500/20 text-slate-300'
                }`}>
                  {user.role.replace('_', ' ')}
                </span>
                <span className="text-[8.5px] bg-slate-900 text-slate-400 px-1 font-bold">
                  {user.subsidiaryAccess}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-slate-900/50 rounded-lg transition-colors cursor-pointer ml-1"
              title="Logout Session"
              id="logout_btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-5 shrink-0 col-span-2">
            <BellRing className="w-4 h-4 text-rose-400 animate-pulse-slow" />
            <div>
              <span className="text-slate-400 text-[9px] block uppercase font-bold">Overdue SLA Limits</span>
              <span className="text-rose-400 font-bold">{expiredContractsCount} warning indicators</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-[11px] text-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTime || 'Syncing UTC period...'}</span>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER CONTROLLER */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto md:p-6 gap-6" id="dashboard_panel_frame">
        
        {/* RESPONSIVE LEFT SIDEBAR NAVIGATION */}
        <aside className="md:w-64 bg-white p-4 border border-slate-100 md:rounded-2xl shadow-sm flex flex-col justify-between self-start shrink-0 w-full md:sticky md:top-24 gap-4 animate-in fade-in duration-200">
          <div className="space-y-4">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block px-2">Navigation desk</span>
            <nav className="space-y-1" id="navigation_menu">
              
              {/* Dashboard */}
              <button
                id="tab_nav_dashboard"
                onClick={() => {
                  setActiveTab('dashboard');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Central Dashboard</span>
              </button>

              {/* Vendor Directory */}
              <button
                id="tab_nav_vendors"
                onClick={() => {
                  setActiveTab('vendors');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'vendors'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Vendor Directory</span>
              </button>

              {/* Contract Renewals */}
              <button
                id="tab_nav_renewals"
                onClick={() => {
                  setActiveTab('renewals');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'renewals'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4.5 h-4.5" />
                <span>Contract Renewals</span>
              </button>

              {/* Performance Scorecards */}
              <button
                id="tab_nav_performance"
                onClick={() => {
                  setActiveTab('performance');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'performance'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-4.5 h-4.5" />
                <span>Performance scorecards</span>
              </button>

              {/* Compliance */}
              <button
                id="tab_nav_compliance"
                onClick={() => {
                  setActiveTab('compliance');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'compliance'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Credentials audits</span>
              </button>

              {/* Company Documents */}
              <button
                id="tab_nav_company_docs"
                onClick={() => {
                  setActiveTab('company_documents');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'company_documents'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <FolderOpen className="w-4.5 h-4.5" />
                <span>Company Documents</span>
              </button>

              {/* System Audit trace log */}
              <button
                id="tab_nav_logs"
                onClick={() => {
                  setActiveTab('logs');
                  setSelectedRenewalContract(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold leading-none cursor-pointer border transition-all ${
                  activeTab === 'logs'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <History className="w-4.5 h-4.5" />
                <span>System Audit Logs</span>
              </button>

            </nav>
          </div>

          {/* Sidebar bottom branding card */}
          <div className="bg-slate-50 border p-3.5 rounded-xl text-[10.5px] border-slate-100 hidden md:block">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
              <span className="text-slate-600 font-bold uppercase tracking-wider">SYSTEM CENTRAL ACTIVE</span>
            </div>
            <p className="text-slate-400 mt-1 font-semibold">Elev8 Media Inc, Elev8 Holdings, & Elev8 Trading are synchronized.</p>
          </div>
        </aside>

        {/* ACTIVE MODULE CONTAINER */}
        <main className="flex-1 p-4 md:p-0 overflow-hidden" id="active_render_frame">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              vendors={vendors} 
              contracts={contracts} 
              onNavigate={(tab, targetStatus) => {
                setActiveTab(tab);
              }}
              onRenewContract={(contract) => {
                setSelectedRenewalContract(contract);
                setActiveTab('renewals');
              }}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorList
              vendors={vendors}
              contracts={contracts}
              reviews={reviews}
              compliance={compliance}
              onAddVendor={handleAddVendor}
              onUpdateVendorStatus={handleUpdateVendorStatus}
              onUpdateVendorRisk={handleUpdateVendorRisk}
              onRenewContract={(contract) => {
                setSelectedRenewalContract(contract);
                setActiveTab('renewals');
              }}
              onAddReview={handleAddReview}
              onUpdateCompliance={handleUpdateCompliance}
              onAddComplianceCheck={handleAddComplianceCheck}
            />
          )}

          {activeTab === 'renewals' && (
            <ContractRenewals
              contracts={contracts}
              vendors={vendors}
              onRenewSubmit={handleRenewSubmit}
              onAddContract={handleAddContract}
              selectedRenewalContract={selectedRenewalContract}
              onClearSelectedRenewal={() => setSelectedRenewalContract(null)}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceTracker
              vendors={vendors}
              reviews={reviews}
              onAddReview={handleAddReview}
            />
          )}

          {activeTab === 'compliance' && (
            <ComplianceCenter
              vendors={vendors}
              compliance={compliance}
              onUpdateCompliance={handleUpdateCompliance}
              onAddComplianceCheck={handleAddComplianceCheck}
              userRole={user.role}
              userEmail={user.email}
            />
          )}

          {activeTab === 'company_documents' && (
            <CompanyDocuments
              documents={companyDocuments}
              onAddDocument={handleAddCompanyDocument}
              onDeleteDocument={handleDeleteCompanyDocument}
              onUpdateDocumentStatus={handleUpdateCompanyDocumentStatus}
              userRole={user.role}
              userEmail={user.email}
            />
          )}

          {/* AUDIT LOG EVENTS VIEW */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-800 tracking-tight" id="audit_logs_title">Corporate Audit Logs</h1>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Continuous ledger verifying administrator procurement and status changes. Key standard tracking for SOC2 certifications.
                  </p>
                </div>

                <button
                  id="flush_logs_btn"
                  onClick={() => {
                    localStorage.removeItem('elev8_vms_logs');
                    setLogs([]);
                  }}
                  className="px-3.5 py-2 hover:bg-rose-50 border hover:border-rose-200 text-rose-600 rounded-xl font-bold cursor-pointer text-xs"
                >
                  Flush Trace List
                </button>
              </div>

              {/* Logging traces cards */}
              <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-rose-100 bg-rose-50/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-500" />
                    Ledger entries tracking
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">Ledger Size: {logs.length}</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto" id="audit_logs_container">
                  {logs.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-xs font-semibold">Ledger holds 0 events logged in current workspace session.</div>
                  ) : (
                    logs.map(log => {
                      return (
                        <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-all text-xs">
                          {/* Event Icon/Marker */}
                          <div className={`p-2 rounded-lg shrink-0 ${
                            log.type === 'contract' 
                              ? 'bg-blue-50 text-blue-600' 
                              : log.type === 'vendor' 
                              ? 'bg-purple-50 text-purple-600'
                              : log.type === 'performance'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {log.type === 'contract' && <FileText className="w-4 h-4" />}
                            {log.type === 'vendor' && <Building2 className="w-4 h-4" />}
                            {log.type === 'performance' && <Award className="w-4 h-4" />}
                            {log.type === 'compliance' && <ShieldCheck className="w-4 h-4" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{log.action}</span>
                              <span className="text-[10px] text-slate-400 font-medium font-mono">({log.timestamp})</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed font-medium">{log.details}</p>
                            <span className="text-[10.5px] block font-mono text-indigo-500 font-semibold uppercase">{log.actor}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
