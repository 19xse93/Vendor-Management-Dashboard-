import React, { useState, useEffect } from 'react';
import { Contract, BusinessUnit, BUSINESS_UNITS, Vendor } from '../types';
import { 
  FileText, 
  Calendar, 
  RefreshCw, 
  Filter, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  FileEdit, 
  Bookmark, 
  Check,
  CheckCircle,
  TrendingDown
} from 'lucide-react';

interface ContractRenewalsProps {
  contracts: Contract[];
  vendors: Vendor[];
  onRenewSubmit: (contractId: string, extensionMonths: number, newValue: number, autoRenew: boolean, noticePeriod: number) => void;
  onAddContract: (contract: Omit<Contract, 'id' | 'status' | 'complianceStatus'>) => void;
  selectedRenewalContract?: Contract | null;
  onClearSelectedRenewal: () => void;
}

export default function ContractRenewals({
  contracts,
  vendors,
  onRenewSubmit,
  onAddContract,
  selectedRenewalContract,
  onClearSelectedRenewal
}: ContractRenewalsProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'expiring_soon' | 'expired' | 'active'>('ALL');
  const [selectedBU, setSelectedBU] = useState<BusinessUnit | 'ALL'>('ALL');

  // Form states for renewal execution
  const [renewingContractId, setRenewingContractId] = useState<string | null>(null);
  const [extensionMonths, setExtensionMonths] = useState(12);
  const [revisedValue, setRevisedValue] = useState(100000);
  const [autoRenewToggle, setAutoRenewToggle] = useState(true);
  const [revisedNoticePeriod, setRevisedNoticePeriod] = useState(30);

  // Form states for creating a NEW contract
  const [showAddContractForm, setShowAddContractForm] = useState(false);
  const [newVendorId, setNewVendorId] = useState(vendors[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newVal, setNewVal] = useState(120000);
  const [newBU, setNewBU] = useState<BusinessUnit>('MEDIA');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [newAutoRenew, setNewAutoRenew] = useState(false);
  const [newNoticeDays, setNewNoticeDays] = useState(30);
  const [newKeyTerms, setNewKeyTerms] = useState('');

  // Auto-fill form values when triggered from parent (Quick Renew)
  useEffect(() => {
    if (selectedRenewalContract) {
      setRenewingContractId(selectedRenewalContract.id);
      setRevisedValue(selectedRenewalContract.value);
      setAutoRenewToggle(selectedRenewalContract.autoRenew);
      setRevisedNoticePeriod(selectedRenewalContract.noticePeriodDays);
      setExtensionMonths(12);
      
      // Scroll to the renewal panel
      const element = document.getElementById('renewal_panel');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedRenewalContract]);

  // Filter criteria
  const filteredContracts = contracts.filter(contract => {
    const matchesFilter = activeFilter === 'ALL' || contract.status === activeFilter;
    const matchesBU = selectedBU === 'ALL' || contract.businessUnit === selectedBU;
    return matchesFilter && matchesBU;
  });

  const handleRenewClick = (contract: Contract) => {
    setRenewingContractId(contract.id);
    setRevisedValue(contract.value);
    setAutoRenewToggle(contract.autoRenew);
    setRevisedNoticePeriod(contract.noticePeriodDays);
    setExtensionMonths(12);
  };

  const submitRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingContractId) return;

    onRenewSubmit(
      renewingContractId,
      extensionMonths,
      revisedValue,
      autoRenewToggle,
      revisedNoticePeriod
    );

    // Reset states
    setRenewingContractId(null);
    onClearSelectedRenewal();
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorId || !newTitle || newVal <= 0) return;

    const vendor = vendors.find(v => v.id === newVendorId);
    if (!vendor) return;

    // Split key terms by newline
    const terms = newKeyTerms
      ? newKeyTerms.split('\n').filter(t => t.trim().length > 0)
      : ['Adherence to standard service level agreements', 'Termination with 30-day corporate written notice'];

    onAddContract({
      vendorId: newVendorId,
      vendorName: vendor.name,
      title: newTitle,
      businessUnit: newBU,
      value: newVal,
      startDate: newStartDate,
      endDate: newEndDate,
      autoRenew: newAutoRenew,
      noticePeriodDays: newNoticeDays,
      keyTerms: terms
    });

    // Reset Form
    setNewTitle('');
    setNewVal(120000);
    setNewKeyTerms('');
    setShowAddContractForm(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Quick statistics
  const expiringSoonCount = contracts.filter(c => c.status === 'expiring_soon').length;
  const expiredCount = contracts.filter(c => c.status === 'expired').length;
  const activeCount = contracts.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="contract_renewals_title">SLA Contract Renewals</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Mitigate liability risk. Renew contracts, negotiate spends, and manage auto-renewal clauses seamlessly.
          </p>
        </div>
        
        <button
          id="toggle_add_contract_drawer_btn"
          onClick={() => setShowAddContractForm(!showAddContractForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          Create New Agreement
        </button>
      </div>

      {/* RENEWING CORE ACTION FORM (TRGGGERED DYNAMICALLY) */}
      {renewingContractId && (() => {
        const contract = contracts.find(c => c.id === renewingContractId);
        if (!contract) return null;
        return (
          <div id="renewal_panel" className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/30 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-indigo-400 font-bold text-[10px] uppercase font-mono tracking-wider">RENEGOTIATION PANEL • {contract.id}</span>
                <h3 className="text-lg font-bold text-white mt-1">Renew SLA with {contract.vendorName}</h3>
                <p className="text-slate-400 text-xs truncate max-w-lg md:max-w-2xl mt-0.5 font-bold text-slate-350">Previous agreement: "{contract.title}" (Notice Clause: {contract.noticePeriodDays} Days Required)</p>
              </div>
              <button 
                onClick={() => {
                  setRenewingContractId(null);
                  onClearSelectedRenewal();
                }}
                className="text-slate-400 hover:text-white font-semibold text-xs cursor-pointer p-1"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={submitRenewal} className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
              {/* Term Extension */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Extension Duration</label>
                <select
                  value={extensionMonths}
                  onChange={e => setExtensionMonths(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 border border-slate-750 text-white rounded-xl outline-none"
                >
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>1 Year Extension</option>
                  <option value={24}>2 Years Extension</option>
                  <option value={36}>3 Years Extension</option>
                </select>
              </div>

              {/* Revised Value */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1">
                  Target SLA Response Hours (Score record)
                  <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={revisedValue}
                  onChange={e => setRevisedValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 border border-slate-750 text-white rounded-xl outline-none font-mono font-bold"
                />
              </div>

              {/* Notice Period */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Notice Period (Days)</label>
                <input
                  required
                  type="number"
                  value={revisedNoticePeriod}
                  onChange={e => setRevisedNoticePeriod(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-800 border border-slate-750 text-white rounded-xl outline-none font-mono"
                />
              </div>

              {/* Submit Renewal */}
              <div className="flex flex-col justify-end space-y-1 pb-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="autoRenewToggle"
                    checked={autoRenewToggle}
                    onChange={e => setAutoRenewToggle(e.target.checked)}
                    className="rounded accent-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="autoRenewToggle" className="text-slate-300 font-bold cursor-pointer select-none">Enable Auto-Renewal clause</label>
                </div>
                
                <button
                  id="submit_renewal_btn"
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer rounded-xl flex items-center justify-center gap-1 text-xs shadow-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  Approve and Issue New Period
                </button>
              </div>
            </form>
          </div>
        );
      })()}

      {/* CREATE NEW AGREEMENT FORM */}
      {showAddContractForm && (
        <form onSubmit={handleCreateContract} className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              SLA Contract Registration Form
            </h2>
            <button 
              type="button" 
              onClick={() => setShowAddContractForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel Setup
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Vendor List */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contracting Vendor Partner</label>
              <select
                value={newVendorId}
                onChange={e => setNewVendorId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1 md:col-span-2">
              <label className="font-bold text-slate-700">Agreement Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Phase 2 Digital Billboard Assembly and Lease"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* BU Selection */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Assigned business unit</label>
              <select
                value={newBU}
                onChange={e => setNewBU(e.target.value as BusinessUnit)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {(Object.keys(BUSINESS_UNITS) as BusinessUnit[]).map(buKey => (
                  <option key={buKey} value={buKey}>{BUSINESS_UNITS[buKey].fullName}</option>
                ))}
              </select>
            </div>

            {/* SLA Response Limit */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">SLA Response Limit (Hours)</label>
              <input
                required
                type="number"
                min={1}
                value={newVal}
                onChange={e => setNewVal(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Notice Period */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Notice Period for Renewal/Termination (Days)</label>
              <input
                required
                type="number"
                value={newNoticeDays}
                onChange={e => setNewNoticeDays(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contract Start Date</label>
              <input
                required
                type="date"
                value={newStartDate}
                onChange={e => setNewStartDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contract end date</label>
              <input
                required
                type="date"
                value={newEndDate}
                onChange={e => setNewEndDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Key Legal Phrases & Terms (One per line)</label>
            <textarea
              placeholder="e.g. Uptime SLA must exceed 99.5%&#10;Notice written 30 days prior required&#10;Indemnification capped at full annual expenditure"
              rows={3}
              value={newKeyTerms}
              onChange={e => setNewKeyTerms(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="newAutoRenew"
              checked={newAutoRenew}
              onChange={e => setNewAutoRenew(e.target.checked)}
              className="rounded accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="newAutoRenew" className="font-bold text-slate-700 cursor-pointer select-none">Check if agreement carries an auto-renewal clause</label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="confirm_contract_submit"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold cursor-pointer rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Issue Active Agreement
            </button>
          </div>
        </form>
      )}

      {/* FILTER BUTTONS & BU SELECTOR */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Segment Filter for status alerts */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Agreements ({contracts.length})
            </button>
            <button
              onClick={() => setActiveFilter('expiring_soon')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeFilter === 'expiring_soon'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Expiring Soon ({expiringSoonCount})
            </button>
            <button
              onClick={() => setActiveFilter('expired')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeFilter === 'expired'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Overdue / Expired ({expiredCount})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Secure / Active ({activeCount})
            </button>
          </div>

          {/* Business Unit dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Unit:</span>
            <select
              value={selectedBU}
              onChange={e => setSelectedBU(e.target.value as BusinessUnit | 'ALL')}
              className="p-2 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700"
            >
              <option value="ALL">All Subsidiaries</option>
              <option value="MEDIA">Elev8 Media Inc</option>
              <option value="HOLDINGS">Elev8 Holdings Inc</option>
              <option value="TRADING">Elev8 Trading & Marketing</option>
            </select>
          </div>

        </div>
      </div>

      {/* AGREEMENTS DATA DISPLAY */}
      <div className="space-y-4" id="contracts_display_list">
        {filteredContracts.length === 0 ? (
          <div className="bg-white py-14 px-4 border border-dashed text-slate-400 text-sm text-center rounded-2xl">
            No service level agreements found operating under selected parameters.
          </div>
        ) : (
          filteredContracts.map(contract => {
            const bu = BUSINESS_UNITS[contract.businessUnit];
            const isExpiring = contract.status === 'expiring_soon';
            const isExpired = contract.status === 'expired';
            
            // Calculate relative days limit
            const diffTime = new Date(contract.endDate).getTime() - new Date('2026-05-27').getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div 
                id={`contract_accordian_${contract.id}`}
                key={contract.id}
                className={`bg-white rounded-2xl border transition-all hover:shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative group ${
                  isExpired 
                    ? 'border-rose-200 bg-rose-50/10' 
                    : isExpiring 
                    ? 'border-amber-200 bg-amber-50/10' 
                    : 'border-slate-150'
                }`}
              >
                {/* Details col */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{contract.id}</span>
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded tracking-wide ${bu.bgColor} ${bu.color}`}>
                      {bu.fullName}
                    </span>
                    <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                      isExpired 
                        ? 'bg-rose-100 text-rose-800' 
                        : isExpiring 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {contract.status.replace('_', ' ')}
                    </span>
                    {contract.autoRenew && (
                      <span className="text-[9px] bg-sky-50 text-sky-700 font-bold border border-sky-100 px-1.5 py-0.5 rounded">
                        Auto-Renew SLA
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors text-sm">{contract.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">Contractor: <span className="text-slate-700 font-bold">{contract.vendorName}</span></p>
                  </div>

                  {/* Core terms grid */}
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/70 text-[10.5px] text-slate-500 max-w-xl">
                    <span className="font-extrabold text-[9px] text-slate-400 uppercase block mb-1">Key SLA Terms</span>
                    <ul className="list-disc list-inside space-y-0.5 font-medium">
                      {contract.keyTerms.slice(0, 2).map((term, i) => (
                        <li key={i} className="truncate">{term}</li>
                      ))}
                      {contract.keyTerms.length > 2 && (
                        <li className="text-[9px] text-slate-400 italic">+{contract.keyTerms.length - 2} more technical clauses...</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Date & SLA Metrics Column */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-xs md:w-fit shrink-0 font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">SLA Target Limit</span>
                      <span className="text-slate-900 font-extrabold tracking-tight text-[13px] block">{contract.value} Hours Limit</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">Renewal Period</span>
                      <div className="flex items-center gap-1 mt-1 font-bold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contract.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Renew button / Status meter */}
                  <div className="flex items-center sm:flex-col justify-between w-full sm:w-28 gap-3 sm:space-y-1.5 border-t sm:border-t-0 p-2 sm:p-0">
                    {isExpired ? (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-100 w-full text-center">
                        Overdue {Math.abs(diffDays)} Days
                      </span>
                    ) : isExpiring ? (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100 w-full text-center">
                        Expiring {diffDays} Days
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-full text-center">
                        Secure
                      </span>
                    )}

                    <button
                      id={`renew_agreement_cta_${contract.id}`}
                      onClick={() => handleRenewClick(contract)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl cursor-pointer w-full text-center hover:shadow-xs transition-shadow"
                    >
                      Renew Term
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
