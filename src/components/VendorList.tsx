import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vendor, Contract, PerformanceReview, ComplianceCheck, BusinessUnit, BUSINESS_UNITS } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  User, 
  Mail, 
  AlertTriangle, 
  ChevronRight, 
  SlidersHorizontal, 
  Sliders, 
  Activity, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X
} from 'lucide-react';
import VendorDetailModal from './VendorDetailModal';

interface VendorListProps {
  vendors: Vendor[];
  contracts: Contract[];
  reviews: PerformanceReview[];
  compliance: ComplianceCheck[];
  onAddVendor: (vendor: Omit<Vendor, 'id' | 'overallScore' | 'createdAt'>) => void;
  onUpdateVendorStatus: (vendorId: string, status: Vendor['status']) => void;
  onRenewContract: (contract: Contract) => void;
  onAddReview: (vendorId: string, review: Omit<PerformanceReview, 'id' | 'vendorId' | 'vendorName' | 'overallScore'>) => void;
  onUpdateCompliance: (checkId: string, status: ComplianceCheck['status'], remarks: string) => void;
  onAddComplianceCheck: (vendorId: string, check: Omit<ComplianceCheck, 'id' | 'vendorId' | 'vendorName' | 'updatedAt'>) => void;
}

export default function VendorList({
  vendors,
  contracts,
  reviews,
  compliance,
  onAddVendor,
  onUpdateVendorStatus,
  onRenewContract,
  onAddReview,
  onUpdateCompliance,
  onAddComplianceCheck
}: VendorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBUFilter, setSelectedBUFilter] = useState<BusinessUnit | 'ALL'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<Vendor['status'] | 'ALL'>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'Low' | 'Medium' | 'High' | 'ALL'>('ALL');
  
  // Modals state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showAddVendorForm, setShowAddVendorForm] = useState(false);

  // Form states for new Vendor
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('IT Infrastructure & Support');
  const [newBUSelections, setNewBUSelections] = useState<BusinessUnit[]>([]);
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRisk, setNewRisk] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [newPaymentTerms, setNewPaymentTerms] = useState('Net 30');
  const [newTermDuration, setNewTermDuration] = useState('12 Months');

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBU = selectedBUFilter === 'ALL' || vendor.businessUnits.includes(selectedBUFilter);
    const matchesStatus = selectedStatusFilter === 'ALL' || vendor.status === selectedStatusFilter;
    const matchesRisk = selectedRiskFilter === 'ALL' || vendor.riskRating === selectedRiskFilter;

    return matchesSearch && matchesBU && matchesStatus && matchesRisk;
  });

  // Toggle BU checkbox in add form
  const handleBUToggle = (bu: BusinessUnit) => {
    if (newBUSelections.includes(bu)) {
      setNewBUSelections(newBUSelections.filter(id => id !== bu));
    } else {
      setNewBUSelections([...newBUSelections, bu]);
    }
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContact || !newEmail || newBUSelections.length === 0) return;

    onAddVendor({
      name: newName,
      category: newCategory,
      businessUnits: newBUSelections,
      contactPerson: newContact,
      email: newEmail,
      phone: newPhone || '+63-2-0000-0000',
      status: 'active',
      performanceMetrics: { quality: 80, delivery: 80, communication: 80, pricing: 80 },
      complianceScore: 100,
      riskRating: newRisk,
      paymentTerms: newPaymentTerms,
      termDuration: newTermDuration
    });

    // Reset Form
    setNewName('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewBUSelections([]);
    setNewPaymentTerms('Net 30');
    setNewTermDuration('12 Months');
    setShowAddVendorForm(false);
  };

  const getRiskIcon = (rating: Vendor['riskRating']) => {
    switch (rating) {
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'Low':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRiskColor = (rating: Vendor['riskRating']) => {
    switch (rating) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="vendor_directory_title">Vendor Directory</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Maintain and audit business relations, performance trackers, and licensing across Elev8.
          </p>
        </div>
        
        <button
          id="toggle_add_vendor_drawer_btn"
          onClick={() => setShowAddVendorForm(!showAddVendorForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register New Vendor
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        
        {/* Search and Business Unit shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[50%] -translate-y-[50%]" />
            <input
              id="vendor_search_box"
              type="text"
              placeholder="Search partnerships by name, category, personnel, or contact email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* BU selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">BU Support:</span>
            <select
              id="bu_filter_dropdown"
              value={selectedBUFilter}
              onChange={(e) => setSelectedBUFilter(e.target.value as BusinessUnit | 'ALL')}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="ALL">All Business Units</option>
              <option value="MEDIA">Elev8 Media Inc.</option>
              <option value="HOLDINGS">Elev8 Holdings Inc.</option>
              <option value="TRADING">Elev8 Trading & Marketing</option>
            </select>
          </div>

          {/* Risk selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">Risk Profile:</span>
            <select
              id="risk_filter_dropdown"
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value as 'Low' | 'Medium' | 'High' | 'ALL')}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
        </div>

        {/* Status segment selectors */}
        <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-50 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Status:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                selectedStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All States ({vendors.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('active')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                selectedStatusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active ({vendors.filter(v => v.status === 'active').length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('under_review')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                selectedStatusFilter === 'under_review' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Under Review ({vendors.filter(v => v.status === 'under_review').length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('suspended')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                selectedStatusFilter === 'suspended' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Suspended ({vendors.filter(v => v.status === 'suspended').length})
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER NEW VENDOR FORM PANEL */}
      {showAddVendorForm && (
        <form onSubmit={handleCreateVendor} className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Corporate Partner Registration
            </h2>
            <button 
              type="button" 
              onClick={() => setShowAddVendorForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel Registration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Vendor Corporation Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Ocean Shipping Inc."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Service Verticals category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="IT Infrastructure & Support">IT Infrastructure & Support</option>
                <option value="Hardware & Infrastructure">Hardware & Infrastructure</option>
                <option value="Large-Format Printing">Large-Format Printing</option>
                <option value="Logistics & Shipping">Logistics & Shipping</option>
                <option value="Warehousing & Storage">Warehousing & Storage</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Real Estate & Renting">Real Estate & Renting</option>
                <option value="Legal Services">Legal Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Contact */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary Account representative</label>
              <input
                required
                type="text"
                placeholder="e.g. Clara Lopez"
                value={newContact}
                onChange={e => setNewContact(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Email Address</label>
              <input
                required
                type="email"
                placeholder="clara.l@apexshipping.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phone Code / Numbers</label>
              <input
                type="tel"
                placeholder="+63-917-000-0000"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Payment Terms & Engagement / Term Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/50">
            {/* Payment Terms */}
            <div className="space-y-1">
              <label className="font-bold text-indigo-900 block">Payment Terms</label>
              <select
                value={newPaymentTerms}
                onChange={e => setNewPaymentTerms(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-slate-700"
              >
                <option value="Immediate">Immediate / COD (Cash on Delivery)</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Net 90">Net 90 Days</option>
                <option value="Retainer Monthly">Monthly Retainer</option>
                <option value="Custom">Custom Terms (negotiated)</option>
              </select>
            </div>

            {/* Duration of Terms */}
            <div className="space-y-1">
              <label className="font-bold text-indigo-900 block">Engagement / Term Duration</label>
              <select
                value={newTermDuration}
                onChange={e => setNewTermDuration(e.target.value)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-slate-700"
              >
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months (1 Year)</option>
                <option value="24 Months">24 Months (2 Years)</option>
                <option value="36 Months">36 Months (3 Years)</option>
                <option value="48 Months">48 Months (4 Years)</option>
                <option value="Ongoing">Indefinite / Ongoing / Open-ended</option>
                <option value="Project-based">Project-based / Event-specific</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            {/* BU multi select */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Assigned Elev8 Subsidiaries (Choose at least one)</label>
              <div className="flex flex-col sm:flex-row gap-4">
                {(Object.keys(BUSINESS_UNITS) as BusinessUnit[]).map(buKey => {
                  const details = BUSINESS_UNITS[buKey];
                  const isChecked = newBUSelections.includes(buKey);
                  return (
                    <label key={buKey} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleBUToggle(buKey)}
                        className="rounded accent-indigo-600 text-white cursor-pointer"
                      />
                      <span className={`text-[11px] font-bold ${isChecked ? details.color : 'text-slate-500'}`}>
                        {details.fullName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Risk rating */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Initial Risk Evaluation</label>
              <div className="flex gap-4 mt-1">
                {['Low', 'Medium', 'High'].map(r => (
                  <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="risk"
                      value={r}
                      checked={newRisk === r}
                      onChange={() => setNewRisk(r as any)}
                      className="accent-indigo-605 text-indigo-600"
                    />
                    <span className="font-bold">{r} Risk</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="confirm_vendor_submit"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold cursor-pointer rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Publish Vendor Portfolio
            </button>
          </div>
        </form>
      )}

      {/* VENDOR DIRECTORY LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="vendors_grid_container">
        {filteredVendors.length === 0 ? (
          <div className="bg-white py-16 px-4 rounded-2xl border text-center text-slate-400 text-sm md:col-span-3">
            No partnerships matching current filters found. Modify criteria or register a new vendor.
          </div>
        ) : (
          filteredVendors.map(vendor => {
            const activeSlas = contracts.filter(c => c.vendorId === vendor.id && c.status === 'active');
            const expiringSlas = contracts.filter(c => c.vendorId === vendor.id && c.status === 'expiring_soon');
            
            return (
              <div 
                id={`vendor_card_${vendor.id}`}
                key={vendor.id} 
                className="bg-white rounded-2xl border border-slate-150 shadow-xs hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between"
              >
                {/* Header ribbon */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{vendor.id}</span>
                    
                    {/* Animated Status Badge Container */}
                    <div className="flex items-center gap-1.5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={vendor.status}
                          initial={{ opacity: 0, scale: 0.8, y: -2 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 2 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 uppercase tracking-wide cursor-default select-none ${
                            vendor.status === 'active'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : vendor.status === 'under_review'
                              ? 'bg-amber-50 border-amber-250 text-amber-800'
                              : 'bg-rose-50 border-rose-250 text-rose-800'
                          }`}
                        >
                          <span 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: 
                                vendor.status === 'active' 
                                  ? '#10b981' 
                                  : vendor.status === 'under_review' 
                                  ? '#d97706' 
                                  : '#e11d48',
                              boxShadow: `0 0 6px ${
                                vendor.status === 'active' 
                                  ? '#34d399' 
                                  : vendor.status === 'under_review'
                                  ? '#f59e0b' 
                                  : '#f43f5e'
                              }`
                            }}
                          />
                          <span>
                            {vendor.status === 'active' 
                              ? 'Active' 
                              : vendor.status === 'under_review' 
                              ? 'In Review' 
                              : 'Suspended'}
                          </span>
                        </motion.div>
                      </AnimatePresence>

                      {/* Status updater dropdown */}
                      <select
                        id={`vendor_status_select_${vendor.id}`}
                        value={vendor.status}
                        onChange={(e) => onUpdateVendorStatus(vendor.id, e.target.value as Vendor['status'])}
                        className="text-[10px] font-bold py-0.5 px-1.5 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                      >
                        <option value="active">Active State</option>
                        <option value="under_review">Under Review</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight block truncate text-sm" title={vendor.name}>
                      {vendor.name}
                    </h3>
                    <span className="text-[10.5px] font-semibold text-slate-500">{vendor.category}</span>
                  </div>

                  {/* Business Units associated */}
                  <div className="flex flex-wrap gap-1">
                    {vendor.businessUnits.map(bu => (
                      <span key={bu} className={`text-[9.5px] font-black px-1.5 py-0.5 rounded tracking-wide ${BUSINESS_UNITS[bu].bgColor} ${BUSINESS_UNITS[bu].color}`}>
                        {BUSINESS_UNITS[bu].name}
                      </span>
                    ))}
                  </div>

                  {/* Representative details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-50 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                       <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                       <span className="truncate">{vendor.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                       <span className="truncate text-indigo-600">{vendor.email}</span>
                    </div>
                  </div>

                  {/* Terms & Duration Details */}
                  <div className="bg-indigo-50/15 border border-indigo-100/40 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-[10.5px] mt-1.5">
                    <div>
                      <span className="text-[9px] text-indigo-505 text-slate-400 block uppercase font-bold tracking-tight">Payment Terms</span>
                      <span className="font-bold text-slate-700 font-mono">{vendor.paymentTerms || 'Net 30'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-indigo-505 text-slate-400 block uppercase font-bold tracking-tight">Term Duration</span>
                      <span className="font-bold text-slate-700 font-mono">{vendor.termDuration || '12 Months'}</span>
                    </div>
                  </div>
                </div>

                {/* Score section and action button */}
                <div className="bg-slate-50/70 p-4 rounded-b-2xl border-t border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
                  <div className="flex items-center gap-4 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-bold">Risk Rating</span>
                      <div className={`mt-0.5 flex items-center gap-1 border px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${getRiskColor(vendor.riskRating)}`}>
                        {getRiskIcon(vendor.riskRating)}
                        <span>{vendor.riskRating}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block uppercase font-bold">Perf. Mean</span>
                      <span className="text-slate-800 font-bold block mt-1">{vendor.overallScore}%</span>
                    </div>
                  </div>

                  <button
                    id={`view_dossier_btn_${vendor.id}`}
                    onClick={() => setSelectedVendor(vendor)}
                    className="flex items-center gap-0.5 text-xs font-bold bg-white border cursor-pointer border-slate-200 text-slate-800 hover:text-indigo-600 hover:border-indigo-400 px-3 py-2 rounded-xl transition-all shadow-xs"
                  >
                    Open Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PROFILE DETAILS DRAWER / MODAL */}
      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          contracts={contracts}
          reviews={reviews}
          compliance={compliance}
          onClose={() => {
            // Re-sync detail modal in case status changes
            setSelectedVendor(null);
          }}
          onRenewContract={onRenewContract}
          onAddReview={(review) => {
            onAddReview(selectedVendor.id, review);
            // Refresh local reference for overall score updating
            const updated = vendors.find(v => v.id === selectedVendor.id);
            if (updated) setSelectedVendor(updated);
          }}
          onUpdateCompliance={onUpdateCompliance}
          onAddComplianceCheck={(check) => {
            onAddComplianceCheck(selectedVendor.id, check);
            const updated = vendors.find(v => v.id === selectedVendor.id);
            if (updated) setSelectedVendor(updated);
          }}
        />
      )}

    </div>
  );
}
