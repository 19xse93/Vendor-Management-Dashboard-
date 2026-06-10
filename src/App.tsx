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
  appendLog,
  getStoredCompanyDocuments
} from './mockData';
import { Vendor, Contract, PerformanceReview, ComplianceCheck, LogEntry } from './types';
import VendorList from './components/VendorList';
import Login from './components/Login';
import { 
  isFirebaseConfigured, 
  saveUserProfile, 
  fetchComplianceChecks, 
  saveComplianceCheckToFirestore
} from './firebase';
import { 
  Building2, 
  Clock, 
  LogOut,
  Shield
} from 'lucide-react';

export default function App() {
  // Authenticated User Session state
  const [user, setUser] = useState<{
    email: string;
    role: 'ADMIN' | 'COMPLIANCE_OFFICER' | 'GUEST_AUDITOR' | 'SUPER_ADMIN';
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
  
  // Current UTC time state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Initialize data from localStorage or mockData defaults
  useEffect(() => {
    setVendors(getStoredVendors());
    setContracts(getStoredContracts());
    setReviews(getStoredReviews());
    setLogs(getStoredLogs());

    if (isFirebaseConfigured()) {
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

  // --- SUPER ADMIN CRUD EXCLUSIVES ---
  const handleUpdateVendor = (vendorId: string, updatedFields: Partial<Vendor>) => {
    const updated = vendors.map(v => {
      if (v.id === vendorId) return { ...v, ...updatedFields };
      return v;
    });
    handleSetVendors(updated);
    appendLog('Vendor Updated (Super Access)', `Super Administration revised details of vendor ${vendorId}`, 'vendor');
    setLogs(getStoredLogs());
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updated = vendors.filter(v => v.id !== vendorId);
    handleSetVendors(updated);
    appendLog('Vendor Purged (Super Access)', `Super Administration deleted vendor ${vendorId}`, 'vendor');
    setLogs(getStoredLogs());
  };

  const handleUpdateContract = (contractId: string, updatedFields: Partial<Contract>) => {
    const updated = contracts.map(c => {
      if (c.id === contractId) return { ...c, ...updatedFields };
      return c;
    });
    handleSetContracts(updated);
    appendLog('Contract Term Update (Super Access)', `Super Administration revised contract ${contractId}`, 'contract');
    setLogs(getStoredLogs());
  };

  const handleDeleteContract = (contractId: string) => {
    const updated = contracts.filter(c => c.id !== contractId);
    handleSetContracts(updated);
    appendLog('Contract Purged (Super Access)', `Super Administration deleted contract ${contractId}`, 'contract');
    setLogs(getStoredLogs());
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
        <div className="flex items-center flex-wrap gap-5 text-xs text-slate-300 font-semibold text-right">
          {/* User auth ribbon status */}
          <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80" id="user_ribbon_status">
            <div className="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg">
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

          <div className="flex items-center gap-2 shrink-0 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-[11px] text-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentTime || 'Syncing UTC period...'}</span>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER CONTROLLER */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6" id="dashboard_panel_frame">
        <main className="w-full overflow-hidden" id="active_render_frame">
          <VendorList
            vendors={vendors}
            contracts={contracts}
            reviews={[]}
            compliance={[]}
            onAddVendor={handleAddVendor}
            onUpdateVendorStatus={handleUpdateVendorStatus}
            onUpdateVendorRisk={handleUpdateVendorRisk}
            onAddReview={() => {}}
            onUpdateCompliance={() => {}}
            onAddComplianceCheck={() => {}}
            userRole={user.role}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
            onDeleteContract={handleDeleteContract}
            onUpdateContract={handleUpdateContract}
            onAddContract={handleAddContract}
            onRenewSubmit={handleRenewSubmit}
          />
        </main>
      </div>

    </div>
  );
}
