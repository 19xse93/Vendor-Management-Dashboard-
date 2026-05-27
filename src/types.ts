export type BusinessUnit = 'MEDIA' | 'HOLDINGS' | 'TRADING';

export interface BusinessUnitDetails {
  id: BusinessUnit;
  name: string;
  fullName: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

export const BUSINESS_UNITS: Record<BusinessUnit, BusinessUnitDetails> = {
  MEDIA: {
    id: 'MEDIA',
    name: 'Elev8 Media',
    fullName: 'Elev8 Media Inc.',
    color: 'text-sky-500',
    borderColor: 'border-sky-500',
    bgColor: 'bg-sky-500/10'
  },
  HOLDINGS: {
    id: 'HOLDINGS',
    name: 'Elev8 Holdings',
    fullName: 'Elev8 Holdings Inc.',
    color: 'text-amber-500',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  TRADING: {
    id: 'TRADING',
    name: 'Elev8 Trading',
    fullName: 'Elev8 Trading and Marketing Inc.',
    color: 'text-emerald-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10'
  }
};

export type VendorStatus = 'active' | 'under_review' | 'suspended';
export type ComplianceStatus = 'compliant' | 'action_required' | 'non_compliant';
export type ContractStatus = 'active' | 'expiring_soon' | 'expired' | 'in_negotiation';
export type RiskRating = 'Low' | 'Medium' | 'High';

export interface PerformanceMetrics {
  quality: number;       // 1-100
  delivery: number;      // 1-100
  communication: number; // 1-100
  pricing: number;       // 1-100
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  businessUnits: BusinessUnit[];
  contactPerson: string;
  email: string;
  phone: string;
  status: VendorStatus;
  overallScore: number; // calculated from reviews or stored
  performanceMetrics: PerformanceMetrics;
  complianceScore: number; // 0-100
  riskRating: RiskRating;
  createdAt: string;
  paymentTerms?: string; // e.g. "Net 30", "Net 60"
  termDuration?: string; // e.g. "12 Months", "Ongoing"
}

export interface Contract {
  id: string;
  vendorId: string;
  vendorName: string;
  title: string;
  businessUnit: BusinessUnit;
  value: number; // annual or total value in USD or PHP
  startDate: string;
  endDate: string;
  status: ContractStatus;
  autoRenew: boolean;
  noticePeriodDays: number;
  documentUrl?: string;
  complianceStatus: ComplianceStatus;
  keyTerms: string[];
}

export interface PerformanceReview {
  id: string;
  vendorId: string;
  vendorName: string;
  businessUnit: BusinessUnit;
  date: string;
  reviewer: string;
  comments: string;
  qualityScore: number;       // 1-100
  deliveryScore: number;      // 1-100
  communicationScore: number; // 1-100
  pricingScore: number;       // 1-100
  overallScore: number;       // average status
}

export interface ComplianceCheck {
  id: string;
  vendorId: string;
  vendorName: string;
  checkType: string; // e.g., 'Tax Certificate', 'NDA', 'Insurance Policy', 'Mayor\'s Permit', 'SEC Registration'
  status: 'passed' | 'pending' | 'failed' | 'expired';
  expiryDate: string;
  documentName: string;
  remarks: string;
  updatedAt: string;
  fileData?: string; // base64 string
  fileSize?: string; // human-readable file size prefix
}

export interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  type: 'contract' | 'vendor' | 'compliance' | 'performance';
}

export interface CompanyDocument {
  id: string;
  documentType: string;
  subsidiary: BusinessUnit | 'ALL';
  fileName: string;
  fileSize: string;
  status: 'valid' | 'pending_verification' | 'expired' | 'failed_audit';
  expiryDate: string;
  uploadedBy: string;
  uploadedAt: string;
  remarks: string;
}

