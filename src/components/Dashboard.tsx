import { useState } from 'react';
import { Vendor, Contract, BusinessUnit, BUSINESS_UNITS, CompanyDocument } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Clock
} from 'lucide-react';

interface DashboardProps {
  vendors: Vendor[];
  contracts: Contract[];
  companyDocuments?: CompanyDocument[];
  onNavigate: (tab: string, filterStatus?: string) => void;
  onRenewContract: (contract: Contract) => void;
}

export default function Dashboard({ 
  vendors, 
  contracts, 
  companyDocuments = [], 
  onNavigate, 
  onRenewContract 
}: DashboardProps) {
  const [selectedBU, setSelectedBU] = useState<BusinessUnit | 'ALL'>('ALL');

  // Filter contracts/vendors by BU if needed
  const filteredContracts = selectedBU === 'ALL' 
    ? contracts 
    : contracts.filter(c => c.businessUnit === selectedBU);

  const filteredVendors = selectedBU === 'ALL'
    ? vendors
    : vendors.filter(v => v.businessUnits.includes(selectedBU));

  // --- STATS CALCULATIONS ---
  const activeVendorsCount = filteredVendors.filter(v => v.status === 'active').length;
  const urgentContracts = filteredContracts.filter(c => c.status === 'expiring_soon' || c.status === 'expired');

  // Compliance rating: percentage of compliance check items passed or complianceScore of vendors
  const avgComplianceScore = Math.round(
    filteredVendors.length > 0
      ? filteredVendors.reduce((sum, v) => sum + v.complianceScore, 0) / filteredVendors.length
      : 100
  );

  const avgPerformanceScore = Math.round(
    filteredVendors.length > 0
      ? filteredVendors.reduce((sum, v) => sum + v.overallScore, 0) / filteredVendors.length
      : 0
  );

  // --- CHART 1: Active Partnerships (Contract Count) per BU ---
  const partnershipsByBU = Object.keys(BUSINESS_UNITS).map(key => {
    const bu = key as BusinessUnit;
    const buCount = contracts.filter(
      c => c.businessUnit === bu && (c.status === 'active' || c.status === 'expiring_soon')
    ).length;
    return {
      name: BUSINESS_UNITS[bu].name,
      value: buCount,
      color: bu === 'MEDIA' ? '#0ea5e9' : bu === 'HOLDINGS' ? '#f59e0b' : '#10b981'
    };
  });

  // --- CHART 2: Performance Categories Breakdown ---
  const performanceAverages = {
    quality: Math.round(filteredVendors.reduce((sum, v) => sum + v.performanceMetrics.quality, 0) / (filteredVendors.length || 1)),
    delivery: Math.round(filteredVendors.reduce((sum, v) => sum + v.performanceMetrics.delivery, 0) / (filteredVendors.length || 1)),
    communication: Math.round(filteredVendors.reduce((sum, v) => sum + v.performanceMetrics.communication, 0) / (filteredVendors.length || 1)),
    collaboration: Math.round(filteredVendors.reduce((sum, v) => sum + v.performanceMetrics.pricing, 0) / (filteredVendors.length || 1)),
  };

  const performanceChartData = [
    { name: 'Quality Standards', Score: performanceAverages.quality, fill: '#6366f1' },
    { name: 'SLA Delivery', Score: performanceAverages.delivery, fill: '#ec4899' },
    { name: 'Communication', Score: performanceAverages.communication, fill: '#14b8a6' },
    { name: 'SLA Deliverity', Score: performanceAverages.collaboration, fill: '#f59e0b' },
  ];

  // --- CHART 3: Compliance Status Count ---
  const compliantCount = filteredVendors.filter(v => v.complianceScore >= 90).length;
  const actionCount = filteredVendors.filter(v => v.complianceScore >= 50 && v.complianceScore < 90).length;
  const nonCompliantCount = filteredVendors.filter(v => v.complianceScore < 50).length;

  const compliancePieData = [
    { name: 'Fully Certified', value: compliantCount, color: '#10b981' },
    { name: 'Pending Review', value: actionCount, color: '#f59e0b' },
    { name: 'Non-Compliant Risk', value: nonCompliantCount, color: '#ef4444' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Group Title and BU Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm font-sans">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight" id="dashboard_title">Elev8 Group Dashboard</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Consolidated insights for Media, Holdings, and Trading business units. Designed specifically for vendor compliance and accreditations.
          </p>
        </div>

        {/* Custom Segmented Controller for BUs */}
        <div className="flex bg-slate-105 p-1 rounded-xl w-fit border border-slate-100" id="bu_selector_wrapper">
          <button
            id="bu_all_btn"
            onClick={() => setSelectedBU('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
              selectedBU === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Units
          </button>
          {(Object.keys(BUSINESS_UNITS) as BusinessUnit[]).map(buKey => (
            <button
              id={`bu_${buKey.toLowerCase()}_btn`}
              key={buKey}
              onClick={() => setSelectedBU(buKey)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedBU === buKey
                  ? 'bg-white text-slate-950 shadow-xs border-l-2'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
              style={{
                borderLeftColor: selectedBU === buKey 
                  ? (buKey === 'MEDIA' ? '#0ea5e9' : buKey === 'HOLDINGS' ? '#f59e0b' : '#10b981')
                  : 'transparent'
              }}
            >
              {BUSINESS_UNITS[buKey].name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="kpi_grid_container">
        {/* Active Vendors */}
        <div 
          id="kpi_card_vendors"
          onClick={() => onNavigate('vendors')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 font-sans">
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Active Partnerships</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{activeVendorsCount}</span>
                <span className="text-xs text-slate-500 font-bold">/ {filteredVendors.length} total</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>View Vendor Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Compliance Rating */}
        <div 
          id="kpi_card_compliance"
          onClick={() => onNavigate('compliance')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 font-sans">
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">Compliance Index</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{avgComplianceScore}%</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  avgComplianceScore >= 90 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {avgComplianceScore >= 90 ? 'Secure' : 'Needs Admin'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-500 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-teal-700 font-bold group-hover:translate-x-1 transition-transform">
            <span>Check compliance reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Expiring Alerts */}
        <div 
          id="kpi_card_alerts"
          onClick={() => onNavigate('renewals')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 font-sans">
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">SLA Warnings</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{urgentContracts.length}</span>
                <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-rose-600 font-bold group-hover:translate-x-1 transition-transform">
            <span>Open Renewal Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts_section_container font-sans">
        
        {/* BAR CHART: Performance Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                Performance Quality Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregate performance ratings across active partner scorecards
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Avg: {avgPerformanceScore}/100</span>
            </div>
          </div>
          <div className="h-64 font-sans text-xs" id="performance_barchart_wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="Score" radius={[8, 8, 0, 0]} barSize={40}>
                  {performanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART: Compliance Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between font-sans">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              Compliance Snapshot
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Classification of partnerships by credentials safety
            </p>
          </div>
          
          <div className="h-44 relative flex items-center justify-center font-sans" id="compliance_donutchart_wrapper">
            {compliancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Pie
                    data={compliancePieData}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {compliancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs text-center py-6">No sufficient compliance data available</div>
            )}
            
            {/* Center absolute indicator */}
            <div className="absolute top-[48%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-center">
              <span className="text-2xl font-black text-slate-800">{avgComplianceScore}%</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPLIANT</p>
            </div>
          </div>

          <div className="space-y-2 mt-4" id="compliance_donut_legend">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-slate-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Fully Verified
              </span>
              <span className="font-extrabold text-slate-800">{compliantCount} vendors</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="flex items-center gap-2 text-slate-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Incomplete Actions
              </span>
              <span className="font-extrabold text-slate-800">{actionCount} vendors</span>
            </div>
            {nonCompliantCount > 0 && (
              <div className="flex items-center justify-between text-xs px-1">
                <span className="flex items-center gap-2 text-slate-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  Non-Compliant Risk
                </span>
                <span className="font-extrabold text-slate-800">{nonCompliantCount} vendors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CORES - RECENT EXPIRED & EXPIRING CONTRACTS DESK */}
      <div className="grid grid-cols-1 font-sans" id="spend_dashboard_section_grid">
        
        {/* EXPIRING DESK - STREMLINING RENEWALS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-full flex flex-col justify-between" id="dashboard_expiring_desk">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                Contract Renewals Desk
              </h2>
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                {urgentContracts.length} Attention Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              SLA contracts expired or expiring soon. Overdue notices compromise continuous operations.
            </p>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1" id="expiring_contracts_list">
              {urgentContracts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">
                  ✓ All agreements are currently compliant and secure. No SLA warnings pending.
                </div>
              ) : (
                urgentContracts.map(contract => {
                  const buDetails = BUSINESS_UNITS[contract.businessUnit];
                  const isExpired = contract.status === 'expired';
                  // Calculate days remaining or overdue
                  const diffTime = new Date(contract.endDate).getTime() - new Date('2026-05-27').getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <div className="py-3 flex items-center justify-between gap-4 key_contract_item text-xs" key={contract.id}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{contract.vendorName}</span>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-extrabold tracking-wide ${buDetails.color} ${buDetails.bgColor}`}>
                            {buDetails.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-xs md:max-w-md font-medium">{contract.title}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold font-mono">
                          <span>Notice: {contract.noticePeriodDays} Days Required</span>
                          <span>•</span>
                          <span>Renewal Period: {contract.endDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          isExpired 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isExpired ? 'Overdue' : `${diffDays} days left`}
                        </span>
                        
                        <button
                          id={`quick_renew_btn_${contract.id}`}
                          onClick={() => onRenewContract(contract)}
                          className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex justify-end" id="expiring_contracts_footer">
            <button
              id="navigate_to_renewals_btn"
              onClick={() => onNavigate('renewals')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
            >
              Explore SLA Contracts & Renewals Workflow
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
