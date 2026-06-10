import React, { useState, useEffect } from 'react';
import { Vendor, BUSINESS_UNITS } from '../types';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Trash2,
  Clock,
  Edit2
} from 'lucide-react';

interface VendorDetailModalProps {
  vendor: Vendor;
  onClose: () => void;
  userRole?: string;
  onUpdateVendor?: (vendorId: string, updatedFields: Partial<Vendor>) => void;
  onDeleteVendor?: (vendorId: string) => void;
}

export default function VendorDetailModal({
  vendor,
  onClose,
  userRole = 'ADMIN',
  onUpdateVendor,
  onDeleteVendor
}: VendorDetailModalProps) {
  // Core edit states for Vendor
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [editName, setEditName] = useState(vendor.name);
  const [editCategory, setEditCategory] = useState(vendor.category);
  const [editContact, setEditContact] = useState(vendor.contactPerson);
  const [editEmail, setEditEmail] = useState(vendor.email);
  const [editPhone, setEditPhone] = useState(vendor.phone);
  const [editPaymentTerms, setEditPaymentTerms] = useState(vendor.paymentTerms || 'Net 30');
  const [editTermDuration, setEditTermDuration] = useState(vendor.termDuration || '12 Months');
  const [editStatus, setEditStatus] = useState<Vendor['status']>(vendor.status);

  useEffect(() => {
    setEditName(vendor.name);
    setEditCategory(vendor.category);
    setEditContact(vendor.contactPerson);
    setEditEmail(vendor.email);
    setEditPhone(vendor.phone);
    setEditPaymentTerms(vendor.paymentTerms || 'Net 30');
    setEditTermDuration(vendor.termDuration || '12 Months');
    setEditStatus(vendor.status);
    setIsEditingVendor(false);
  }, [vendor.id]);

  const handleVendorUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateVendor) {
      onUpdateVendor(vendor.id, {
        name: editName,
        category: editCategory,
        contactPerson: editContact,
        email: editEmail,
        phone: editPhone,
        paymentTerms: editPaymentTerms,
        termDuration: editTermDuration,
        status: editStatus
      });
      setIsEditingVendor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="detail_modal_container">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100" id="detail_modal_wrapper">
        
        {/* MODAL HEADER */}
        <header className="bg-slate-900 text-white shrink-0 px-6 py-4 flex items-center justify-between border-b border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">{vendor.id}</span>
                <span className={`text-[8.5px] uppercase font-bold px-1.5 py-0.2 rounded ${
                  vendor.status === 'active' 
                    ? 'bg-emerald-400/20 text-emerald-300' 
                    : vendor.status === 'under_review' 
                    ? 'bg-amber-400/20 text-indigo-300' 
                    : 'bg-rose-400/20 text-rose-300'
                }`}>
                  {vendor.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight leading-none mt-1" id="detail_modal_title">
                {vendor.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && !isEditingVendor && (
              <button
                type="button"
                id="edit_vendor_nav_btn"
                onClick={() => setIsEditingVendor(true)}
                className="px-3.5 py-1.5 hover:bg-slate-800 text-[11px] text-indigo-400 border border-slate-700/80 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Registry
              </button>
            )}
            <button 
              onClick={onClose}
              id="close_vendor_modal_btn"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close Portal"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* MODAL CONTENT CONTAINER */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          
          {/* VENDOR EDIT FORM OR INFORMATION BLOCK */}
          {isEditingVendor ? (
            <form onSubmit={handleVendorUpdateSubmit} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4" id="vendor_edit_frame">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Vendor Corporate Name</label>
                  <input 
                    required
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Industry Category</label>
                  <input 
                    required
                    type="text" 
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Primary Representative Account</label>
                  <input 
                    required
                    type="text" 
                    value={editContact}
                    onChange={e => setEditContact(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Representative Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Representative Direct Phone</label>
                  <input 
                    required
                    type="text" 
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Payment Terms</label>
                  <input 
                    type="text" 
                    value={editPaymentTerms}
                    onChange={e => setEditPaymentTerms(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
                    placeholder="Net 30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Agreement Term Duration</label>
                  <input 
                    type="text" 
                    value={editTermDuration}
                    onChange={e => setEditTermDuration(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
                    placeholder="12 Months"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold uppercase tracking-wide block">Accreditation Status</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="active">Active Accredited</option>
                    <option value="under_review">Under Review</option>
                    <option value="suspended">Suspended Gate</option>
                  </select>
                </div>
                <div className="flex items-end justify-between gap-4">
                  {userRole === 'SUPER_ADMIN' ? (
                    <button 
                      type="button"
                      onClick={() => {
                        if (onDeleteVendor && window.confirm(`Permanently purge vendor registry "${vendor.name}" and all records from database?`)) {
                          onDeleteVendor(vendor.id);
                        }
                      }}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Purge Vendor Record
                    </button>
                  ) : <div />}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsEditingVendor(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg cursor-pointer"
                >
                  Discard Edits
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 text-xs text-slate-600 font-semibold" id="vendor_details_view">
              
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Mail className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Primary Contact Email</span>
                  <a href={`mailto:${vendor.email}`} className="font-bold text-indigo-600 hover:underline text-xs block mt-1">{vendor.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Phone className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Contact Number</span>
                  <span className="font-bold text-slate-800 text-xs block mt-1">{vendor.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Registered Business Units</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {vendor.businessUnits.map(b => (
                      <span key={b} className={`text-[8px] font-black px-1.5 py-0.5 rounded ${BUSINESS_UNITS[b].bgColor} ${BUSINESS_UNITS[b].color}`}>
                        {BUSINESS_UNITS[b].name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Payment Terms</span>
                  <span className="font-bold text-slate-800 font-mono text-xs block mt-1">{vendor.paymentTerms || 'Net 30'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Clock className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Term Duration</span>
                  <span className="font-bold text-slate-800 font-mono text-xs block mt-1">{vendor.termDuration || '12 Months'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Building2 className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Industry Sector</span>
                  <span className="font-bold text-slate-800 text-xs block mt-1">{vendor.category}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2 lg:col-span-3">
                <div className="w-full">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Representative Personnel</span>
                  <span className="font-bold text-slate-800 text-xs block mt-1">{vendor.contactPerson}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
