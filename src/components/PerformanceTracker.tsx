import React, { useState } from 'react';
import { Vendor, PerformanceReview, BusinessUnit, BUSINESS_UNITS } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Activity, 
  Plus, 
  Star, 
  Trash2, 
  TrendingUp, 
  MessageSquare, 
  FileCheck, 
  AlertOctagon, 
  CircleDot,
  CheckCircle2,
  ListFilter
} from 'lucide-react';

interface PerformanceTrackerProps {
  vendors: Vendor[];
  reviews: PerformanceReview[];
  onAddReview: (vendorId: string, review: Omit<PerformanceReview, 'id' | 'vendorId' | 'vendorName' | 'overallScore'>) => void;
}

export default function PerformanceTracker({ vendors, reviews, onAddReview }: PerformanceTrackerProps) {
  const [selectedBUFilter, setSelectedBUFilter] = useState<BusinessUnit | 'ALL'>('ALL');
  
  // Evaluation form states
  const [showForm, setShowForm] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [remarks, setRemarks] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [targetBU, setTargetBU] = useState<BusinessUnit>('MEDIA');
  
  // Slider values
  const [qualityScore, setQualityScore] = useState(80);
  const [deliveryScore, setDeliveryScore] = useState(80);
  const [commScore, setCommScore] = useState(80);
  const [pricingScore, setPricingScore] = useState(80);

  // Filter reviews
  const filteredReviews = selectedBUFilter === 'ALL'
    ? reviews
    : reviews.filter(r => r.businessUnit === selectedBUFilter);

  // High Performers vs Low Performers
  const performanceRankings = [...vendors].sort((a, b) => b.overallScore - a.overallScore);
  const topPerformers = performanceRankings.filter(v => v.overallScore >= 85).slice(0, 4);
  const criticalPerformers = performanceRankings.filter(v => v.overallScore < 75);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !reviewer || !remarks) return;

    onAddReview(selectedVendorId, {
      businessUnit: targetBU,
      date: new Date().toISOString().split('T')[0],
      reviewer,
      comments: remarks,
      qualityScore,
      deliveryScore,
      communicationScore: commScore,
      pricingScore
    });

    // Reset Form
    setReviewer('');
    setRemarks('');
    setShowForm(false);
  };

  // BU average scores for charts
  const buPerfChartData = Object.keys(BUSINESS_UNITS).map(key => {
    const bu = key as BusinessUnit;
    const buReviews = reviews.filter(r => r.businessUnit === bu);
    const avg = buReviews.length > 0
      ? Math.round(buReviews.reduce((sum, r) => sum + r.overallScore, 0) / buReviews.length)
      : Math.round(vendors.filter(v => v.businessUnits.includes(bu)).reduce((sum, v) => sum + v.overallScore, 0) / (vendors.filter(v => v.businessUnits.includes(bu)).length || 1));

    return {
      name: BUSINESS_UNITS[bu].name,
      Score: avg,
      fill: bu === 'MEDIA' ? '#0ea5e9' : bu === 'HOLDINGS' ? '#f59e0b' : '#10b981'
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight" id="performance_tracker_title">SLA Performance tracking</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Log scorecard criteria. Segment average capability profiles by Business Unit. Highlight high-performing partnerships.
          </p>
        </div>
        
        <button
          id="toggle_new_scorecard_btn"
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Scorecard Review
        </button>
      </div>

      {/* NEW EVALUATION FORM */}
      {showForm && (
        <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-2xl border border-indigo-150 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-indigo-700 flex items-center gap-2">
              <Star className="w-5 h-5 text-indigo-500" />
              Operational Scorecard evaluation
            </h2>
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              Cancel Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Vendor List */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contracting Vendor Partner</label>
              <select
                value={selectedVendorId}
                onChange={e => {
                  setSelectedVendorId(e.target.value);
                  const v = vendors.find(x => x.id === e.target.value);
                  if (v && v.businessUnits.length > 0) setTargetBU(v.businessUnits[0]);
                }}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.id})</option>
                ))}
              </select>
            </div>

            {/* Reviewer Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Evaluator Name & Designation</label>
              <input
                required
                type="text"
                placeholder="e.g. Atty. Santos (Holdings General Legal Counsel)"
                value={reviewer}
                onChange={e => setReviewer(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Business Unit Context */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sub-firm business unit</label>
              <select
                value={targetBU}
                onChange={e => setTargetBU(e.target.value as BusinessUnit)}
                className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {vendors.find(v => v.id === selectedVendorId)?.businessUnits.map(bu => (
                  <option key={bu} value={bu}>{BUSINESS_UNITS[bu].fullName}</option>
                )) || (Object.keys(BUSINESS_UNITS) as BusinessUnit[]).map(buKey => (
                  <option key={buKey} value={buKey}>{BUSINESS_UNITS[buKey].fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric sliders grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            {/* Quality */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                <span>Quality of Outputs ({qualityScore}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={qualityScore}
                onChange={e => setQualityScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Delivery */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                <span>Delivery SLA Timeliness ({deliveryScore}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deliveryScore}
                onChange={e => setDeliveryScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Communication */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                <span>Communication efficiency ({commScore}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={commScore}
                onChange={e => setCommScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between font-bold text-slate-700 text-[11px]">
                <span>Pricing & Cost Allocation ({pricingScore}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pricingScore}
                onChange={e => setPricingScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-bold text-slate-700">Audit Remarks & Critiques</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Delivered output ahead of schedule with exemplary quality control. Highly recommended for future core agreements."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
               id="confirm_evaluation_submit"
               type="submit"
               className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold cursor-pointer rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
            >
              Publish Scorecard Review
            </button>
          </div>
        </form>
      )}

      {/* DASHBOARD CHARTS & COMPARE ROWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BU Comparative Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-indigo-500" />
              Sub-firm index comparative
            </h3>
            <p className="text-xs text-slate-500 mb-4">Review mean overall index scored grouped across Elev8 subsidiaries</p>
          </div>
          
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buPerfChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9.5} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9.5} domain={[0, 100]} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="Score" radius={[4, 4, 0, 0]} barSize={25}>
                  {buPerfChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performer List */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            Top Partners Leaderboard
          </h3>
          <p className="text-xs text-slate-500 mb-4">Elite rating vendors representing premium service standards</p>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-1" id="top_leaderboard_list">
            {topPerformers.map(vendor => (
              <div className="flex items-center justify-between py-1 border-b border-slate-50" key={vendor.id}>
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="text-xs font-bold text-slate-900 block truncate">{vendor.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{vendor.category}</span>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold font-mono text-[10.5px]">
                  {vendor.overallScore}% score
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Attention List */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1 text-rose-600">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            Underperforming partners alert
          </h3>
          <p className="text-xs text-slate-500 mb-4">Partners scoring &lt; 75% requiring immediate service audits</p>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-1" id="critical_leaderboard_list">
            {criticalPerformers.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-10">
                ✓ No critical underperformers flagged.
              </div>
            ) : (
              criticalPerformers.map(vendor => (
                <div className="flex items-center justify-between py-1 border-b border-slate-50" key={vendor.id}>
                  <div className="space-y-0.5 max-w-[75%]">
                    <span className="text-xs font-bold text-slate-900 block truncate">{vendor.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{vendor.category}</span>
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-2 py-1 rounded-lg font-bold font-mono text-[10.5px] border border-rose-100 animate-pulse">
                    {vendor.overallScore}% score
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FILTER SCORECARDS SECTION */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-indigo-500" />
            Historic Evaluations logs
          </h3>

          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold w-fit">
            <button
              onClick={() => setSelectedBUFilter('ALL')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${selectedBUFilter === 'ALL' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-950'}`}
            >
              All BUs ({reviews.length})
            </button>
            {(Object.keys(BUSINESS_UNITS) as BusinessUnit[]).map(buKey => (
              <button
                key={buKey}
                onClick={() => setSelectedBUFilter(buKey)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${selectedBUFilter === buKey ? 'bg-white text-slate-950 shadow-xs border-l' : 'text-slate-500 hover:text-slate-950'}`}
                style={{ borderLeftColor: selectedBUFilter === buKey ? '#6366f1' : 'transparent' }}
              >
                {BUSINESS_UNITS[buKey].name}
              </button>
            ))}
          </div>
        </div>

        {/* LOG GRIDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="scorecard_eval_grid_list">
          {filteredReviews.length === 0 ? (
            <div className="bg-slate-50 py-12 px-4 border text-center text-slate-400 text-xs rounded-xl md:col-span-2">
              No registered evaluations logged operating under selected sub-firm.
            </div>
          ) : (
            filteredReviews.map(review => {
              const bu = BUSINESS_UNITS[review.businessUnit];
              return (
                <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col justify-between hover:border-indigo-150 transition-all shadow-xs relative">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{review.id}</span>
                        <h4 className="font-extrabold text-slate-900 text-xs lines-clamp-1">{review.vendorName}</h4>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-wide ${bu.bgColor} ${bu.color}`}>
                        {bu.name}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-600 bg-slate-50/70 p-2.5 rounded-lg font-medium leading-relaxed italic">
                      "{review.comments}"
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] font-bold">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-700 block">{review.reviewer}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{review.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-mono text-xs">
                      <FileCheck className="w-4 h-4" />
                      <span>{review.overallScore}% Rating</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
