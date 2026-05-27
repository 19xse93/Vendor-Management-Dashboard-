import { Vendor, Contract, PerformanceReview, ComplianceCheck, LogEntry, BusinessUnit, CompanyDocument } from './types';

// Helper to generate IDs
const uuid = () => Math.random().toString(36).substring(2, 11);


export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'V-001',
    name: 'Aegis LED Digital Displays',
    category: 'Hardware & Infrastructure',
    businessUnits: ['MEDIA'],
    contactPerson: 'David Vance',
    email: 'd.vance@aegisdisplays.com',
    phone: '+63-2-8843-1200',
    status: 'active',
    overallScore: 92,
    performanceMetrics: { quality: 95, delivery: 90, communication: 92, pricing: 88 },
    complianceScore: 100,
    riskRating: 'Low',
    createdAt: '2024-01-15T08:00:00Z',
    paymentTerms: 'Net 30',
    termDuration: '24 Months'
  },
  {
    id: 'V-002',
    name: 'Apex Logistics Group',
    category: 'Logistics & Shipping',
    businessUnits: ['TRADING'],
    contactPerson: 'Sarah Lin',
    email: 's.lin@apexlogistics.com',
    phone: '+63-917-555-4321',
    status: 'active',
    overallScore: 84,
    performanceMetrics: { quality: 80, delivery: 85, communication: 82, pricing: 90 },
    complianceScore: 90,
    riskRating: 'Low',
    createdAt: '2024-02-10T10:30:00Z',
    paymentTerms: 'Net 15',
    termDuration: '12 Months'
  },
  {
    id: 'V-003',
    name: 'Metro-Vanguard Printers',
    category: 'Large-Format Printing',
    businessUnits: ['MEDIA'],
    contactPerson: 'Roberto Carlos',
    email: 'r.carlos@metrovanguard.ph',
    phone: '+63-2-8511-9922',
    status: 'active',
    overallScore: 88,
    performanceMetrics: { quality: 92, delivery: 84, communication: 88, pricing: 88 },
    complianceScore: 100,
    riskRating: 'Low',
    createdAt: '2023-11-20T14:45:00Z',
    paymentTerms: 'Net 30',
    termDuration: '12 Months'
  },
  {
    id: 'V-004',
    name: 'Pacific Rim Warehousing',
    category: 'Warehousing & Storage',
    businessUnits: ['TRADING'],
    contactPerson: 'Kenji Sato',
    email: 'k.sato@pacrim-storage.com',
    phone: '+63-908-111-9876',
    status: 'under_review',
    overallScore: 68,
    performanceMetrics: { quality: 65, delivery: 70, communication: 60, pricing: 78 },
    complianceScore: 75,
    riskRating: 'Medium',
    createdAt: '2024-03-01T09:15:00Z',
    paymentTerms: 'Net 45',
    termDuration: '36 Months'
  },
  {
    id: 'V-005',
    name: 'Integrity Audit & Consulting',
    category: 'Professional Services',
    businessUnits: ['HOLDINGS'],
    contactPerson: 'Victoria Perez',
    email: 'v.perez@integrityaudit.ph',
    phone: '+63-2-7214-3800',
    status: 'active',
    overallScore: 96,
    performanceMetrics: { quality: 98, delivery: 95, communication: 96, pricing: 94 },
    complianceScore: 100,
    riskRating: 'Low',
    createdAt: '2023-08-05T16:00:00Z',
    paymentTerms: 'Retainer Monthly',
    termDuration: 'Ongoing'
  },
  {
    id: 'V-006',
    name: 'Prime Corporate Spaces Ltd.',
    category: 'Real Estate & Renting',
    businessUnits: ['HOLDINGS', 'MEDIA'],
    contactPerson: 'Clarissa Cruz',
    email: 'c.cruz@primeres.com.ph',
    phone: '+63-2-8900-3344',
    status: 'active',
    overallScore: 85,
    performanceMetrics: { quality: 86, delivery: 82, communication: 88, pricing: 84 },
    complianceScore: 100,
    riskRating: 'Low',
    createdAt: '2023-05-12T11:00:00Z',
    paymentTerms: 'Net 60',
    termDuration: '48 Months'
  },
  {
    id: 'V-007',
    name: 'Global Freight Specialist Inc.',
    category: 'Logistics & Shipping',
    businessUnits: ['TRADING'],
    contactPerson: 'Arthur Pendelton',
    email: 'a.pendelton@globalfreight.org',
    phone: '+1-512-890-4411',
    status: 'under_review',
    overallScore: 56,
    performanceMetrics: { quality: 50, delivery: 55, communication: 58, pricing: 62 },
    complianceScore: 40,
    riskRating: 'High',
    createdAt: '2024-04-18T13:20:00Z',
    paymentTerms: 'Net 30',
    termDuration: '12 Months'
  },
  {
    id: 'V-008',
    name: 'Vertex Legal & Associates',
    category: 'Legal Services',
    businessUnits: ['HOLDINGS', 'MEDIA', 'TRADING'],
    contactPerson: 'Atty. Miguel Santos',
    email: 'm.santos@vertexlegal.ph',
    phone: '+63-2-8114-5000',
    status: 'active',
    overallScore: 95,
    performanceMetrics: { quality: 96, delivery: 94, communication: 95, pricing: 94 },
    complianceScore: 100,
    riskRating: 'Low',
    createdAt: '2023-06-01T08:30:00Z',
    paymentTerms: 'Retainer Monthly',
    termDuration: 'Ongoing'
  },
  {
    id: 'V-009',
    name: 'Synergy Unified Technology',
    category: 'IT Infrastructure & Support',
    businessUnits: ['MEDIA', 'HOLDINGS', 'TRADING'],
    contactPerson: 'Raymond Gomez',
    email: 'r.gomez@synergyunified.com',
    phone: '+63-918-800-4433',
    status: 'active',
    overallScore: 90,
    performanceMetrics: { quality: 92, delivery: 88, communication: 90, pricing: 90 },
    complianceScore: 95,
    riskRating: 'Low',
    createdAt: '2024-01-05T09:00:00Z',
    paymentTerms: 'Net 30',
    termDuration: '12 Months'
  },
  {
    id: 'V-010',
    name: 'Ascent Billboard Structures',
    category: 'Hardware & Infrastructure',
    businessUnits: ['MEDIA'],
    contactPerson: 'Gerald Choa',
    email: 'gchoa@ascentstructures.ph',
    phone: '+63-2-8610-1111',
    status: 'suspended',
    overallScore: 45,
    performanceMetrics: { quality: 40, delivery: 45, communication: 50, pricing: 45 },
    complianceScore: 20,
    riskRating: 'High',
    createdAt: '2023-10-15T15:00:00Z',
    paymentTerms: 'Net 30',
    termDuration: '24 Months'
  }
];

// Helper to construct dynamic dates relative to current date (2026-05-27)
// So our contracts are expiring soon / recently expired relative to current date!
export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'CON-101',
    vendorId: 'V-001',
    vendorName: 'Aegis LED Digital Displays',
    title: 'EDSA Grand LED Maintenance Agreement',
    businessUnit: 'MEDIA',
    value: 124000,
    startDate: '2025-06-01',
    endDate: '2026-06-10', // Expiring in 14 days relative to 2026-05-27
    status: 'expiring_soon',
    autoRenew: false,
    noticePeriodDays: 30,
    complianceStatus: 'compliant',
    keyTerms: [
      '99.9% screen uptime guarantee',
      '4-hour average response time for on-site visual hardware repairs',
      'Quarterly screen calibration and luminance adjustments',
      'Bi-annual structural soundness inspections'
    ]
  },
  {
    id: 'CON-102',
    vendorId: 'V-002',
    vendorName: 'Apex Logistics Group',
    title: 'Container Haulage Service Level Agreement',
    businessUnit: 'TRADING',
    value: 85000,
    startDate: '2025-07-15',
    endDate: '2026-07-15', // Active, expiring in 49 days
    status: 'active',
    autoRenew: true,
    noticePeriodDays: 60,
    complianceStatus: 'compliant',
    keyTerms: [
      'Priority truck allotment during peak harvest and shipping seasons',
      'Diesel fuel indexation clause updated semi-annually',
      'PhP 5,000 liquid damages penalty per container per day of delay',
      'Active GPS sharing link integration with Elev8 supply monitors'
    ]
  },
  {
    id: 'CON-103',
    vendorId: 'V-003',
    vendorName: 'Metro-Vanguard Printers',
    title: 'Large-Format Vinyl Printing Annual Contract',
    businessUnit: 'MEDIA',
    value: 62000,
    startDate: '2025-05-01',
    endDate: '2026-05-01', // Expired recently! (expired 26 days ago)
    status: 'expired',
    autoRenew: false,
    noticePeriodDays: 30,
    complianceStatus: 'compliant',
    keyTerms: [
      'Fixed unit rate pricing of PhP 18 per square foot of heavy-duty vinyl',
      '24-hour turnaround on promotional artwork approvals and test prints',
      'Free delivery to site locations within Metro Manila',
      '6-month ink fade and degradation structural warranty'
    ]
  },
  {
    id: 'CON-104',
    vendorId: 'V-005',
    vendorName: 'Integrity Audit & Consulting',
    title: 'FY2025 External Auditing Services Account',
    businessUnit: 'HOLDINGS',
    value: 45000,
    startDate: '2025-08-01',
    endDate: '2026-07-31', // Active
    status: 'active',
    autoRenew: false,
    noticePeriodDays: 45,
    complianceStatus: 'compliant',
    keyTerms: [
      'Comprehensive financial statement audits for Elev8 and subsidiaries',
      'Submission of initial draft audit memorandum by June 15th annually',
      'Representation before local tax authorities if required',
      'Adherence to strict professional confidentiality agreements (NDAs)'
    ]
  },
  {
    id: 'CON-105',
    vendorId: 'V-006',
    vendorName: 'Prime Corporate Spaces Ltd.',
    title: 'Elev8 Corporate Headquarters Tower 2 Sublease',
    businessUnit: 'HOLDINGS',
    value: 280000,
    startDate: '2023-06-01',
    endDate: '2028-05-31', // Long term active
    status: 'active',
    autoRenew: true,
    noticePeriodDays: 180,
    complianceStatus: 'compliant',
    keyTerms: [
      'Lease of 14th and 15th floors of Prime Towers, totaling 1,800 sqm',
      '5% capped annual rental escalation threshold beginning Year 3',
      'Subleasing rights to sister corporations (Media and Trading)',
      'Provision of 20 secure corporate underground parking spaces'
    ]
  },
  {
    id: 'CON-106',
    vendorId: 'V-008',
    vendorName: 'Vertex Legal & Associates',
    title: 'Retainer Agreement for Legal Advisory Services',
    businessUnit: 'HOLDINGS',
    value: 36000,
    startDate: '2025-06-01',
    endDate: '2026-05-31', // Expiring in 4 days!
    status: 'expiring_soon',
    autoRenew: true,
    noticePeriodDays: 30,
    complianceStatus: 'compliant',
    keyTerms: [
      '30 billable retainer hours per month with pre-negotiated excess rates',
      'Drafting, vetting, and execution of third-party procurement contracts',
      'Labor relation advisories and representation for standard personnel',
      '24-hour SLA response for critical executive litigation alerts'
    ]
  },
  {
    id: 'CON-107',
    vendorId: 'V-007',
    vendorName: 'Global Freight Specialist Inc.',
    title: 'International Feedstock Ocean Freight Agreement',
    businessUnit: 'TRADING',
    value: 195000,
    startDate: '2025-01-01',
    endDate: '2026-06-05', // Expiring in 9 days!
    status: 'expiring_soon',
    autoRenew: false,
    noticePeriodDays: 30,
    complianceStatus: 'non_compliant', // High-risk compliance (expired documents)
    keyTerms: [
      'Preferential container slot allocations on selected trans-pacific routes',
      'Demurrage and detention concessions limited to maximum of 14 days free-time',
      'Customs clearance broker processing times capped at 48 hours max',
      'Provision of absolute cargo risk insurance at 0.5% declared value'
    ]
  },
  {
    id: 'CON-108',
    vendorId: 'V-009',
    vendorName: 'Synergy Unified Technology',
    title: 'Central ERP Hosting & Technical Support SLA',
    businessUnit: 'HOLDINGS',
    value: 74000,
    startDate: '2025-01-10',
    endDate: '2026-06-25', // Expiring in 29 days!
    status: 'expiring_soon',
    autoRenew: true,
    noticePeriodDays: 60,
    complianceStatus: 'action_required', // Missing security clearance proof
    keyTerms: [
      '99.95% cloud application hosting server cluster availability',
      'Immediate 1-hour response for Severity 1 software downtime tickets',
      'Weekly automated databases backups stored off-site and encrypted',
      'Annual SOC2 compliance documentation submission'
    ]
  },
  {
    id: 'CON-109',
    vendorId: 'V-004',
    vendorName: 'Pacific Rim Warehousing',
    title: 'Southern Metro Logistics Hub Lease',
    businessUnit: 'TRADING',
    value: 90000,
    startDate: '2024-04-01',
    endDate: '2026-04-01', // Expired recently!
    status: 'expired',
    autoRenew: false,
    noticePeriodDays: 60,
    complianceStatus: 'action_required', // expired tax doc
    keyTerms: [
      '500 pallet slot cold-chain temperature monitoring standard',
      'FIFO inventory dispatch compliance with automated daily spreadsheets',
      'Third-party warehouse security and video cameras surveillance system'
    ]
  }
];

export const INITIAL_REVIEWS: PerformanceReview[] = [
  {
    id: 'REV-201',
    vendorId: 'V-001',
    vendorName: 'Aegis LED Digital Displays',
    businessUnit: 'MEDIA',
    date: '2026-03-15',
    reviewer: 'Robert Lim (SVP, Media Operations)',
    comments: 'Excellent reliability. Uptime has consistently tracked over 99.95%. Technical and calibration teams are prompt. Minor pricing increases have been introduced but justified by reliability.',
    qualityScore: 96,
    deliveryScore: 92,
    communicationScore: 94,
    pricingScore: 86,
    overallScore: 92
  },
  {
    id: 'REV-202',
    vendorId: 'V-002',
    vendorName: 'Apex Logistics Group',
    businessUnit: 'TRADING',
    date: '2026-02-18',
    reviewer: 'Maricel Santos (Logistics Mgr)',
    comments: 'Good overall delivery timings. Some GPS linkages with Elev8 ERP were unstable during January shipments, but were resolved. Friendly customer relation executives.',
    qualityScore: 82,
    deliveryScore: 86,
    communicationScore: 85,
    pricingScore: 83,
    overallScore: 84
  },
  {
    id: 'REV-203',
    vendorId: 'V-004',
    vendorName: 'Pacific Rim Warehousing',
    businessUnit: 'TRADING',
    date: '2026-01-10',
    reviewer: 'Arvin Rivera (Warehouse Specialist)',
    comments: 'Operational issues identified. Occasional cold chain temperature dips reported on Sector B units. Daily logs have been submitted late multiple times. Vendor has been put on an action plan.',
    qualityScore: 65,
    deliveryScore: 68,
    communicationScore: 60,
    pricingScore: 78,
    overallScore: 68
  },
  {
    id: 'REV-204',
    vendorId: 'V-007',
    vendorName: 'Global Freight Specialist Inc.',
    businessUnit: 'TRADING',
    date: '2026-04-05',
    reviewer: 'Maricel Santos (Logistics Mgr)',
    comments: 'Critical performance degradation. 3 ocean import shipments delayed over 10 days due to document delays at transit ports. Communication is slow and customer service is hard to reach.',
    qualityScore: 50,
    deliveryScore: 52,
    communicationScore: 55,
    pricingScore: 67,
    overallScore: 56
  },
  {
    id: 'REV-205',
    vendorId: 'V-005',
    vendorName: 'Integrity Audit & Consulting',
    businessUnit: 'HOLDINGS',
    date: '2025-11-28',
    reviewer: 'Theresa Cruz (Group CFO)',
    comments: 'Exceptional audit quality. Deep regulatory understanding and practical recommendations. Audit outputs delivered precisely against our tight Board reporting schedules.',
    qualityScore: 98,
    deliveryScore: 96,
    communicationScore: 98,
    pricingScore: 92,
    overallScore: 96
  }
];

export const INITIAL_COMPLIANCE: ComplianceCheck[] = [
  {
    id: 'CC-001',
    vendorId: 'V-001',
    vendorName: 'Aegis LED Digital Displays',
    checkType: 'Mayor\'s Permit & Licensing',
    status: 'passed',
    expiryDate: '2027-01-31',
    documentName: 'Mayor_Permit_2026_Aegis.pdf',
    remarks: 'Valid and certified, renewed early in Jan.',
    updatedAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'CC-002',
    vendorId: 'V-001',
    vendorName: 'Aegis LED Digital Displays',
    checkType: 'SEC Registration Certificate',
    status: 'passed',
    expiryDate: '2030-12-31',
    documentName: 'SEC_Reg_Aegis_Corp.pdf',
    remarks: 'Static and permanently validated.',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'CC-003',
    vendorId: 'V-002',
    vendorName: 'Apex Logistics Group',
    checkType: 'Bureau of Internal Revenue (BIR) 2303',
    status: 'passed',
    expiryDate: '2027-12-31',
    documentName: 'BIR_2303_Apex_Logistics.pdf',
    remarks: 'Tax registration validated successfully.',
    updatedAt: '2025-12-10T11:30:00Z'
  },
  {
    id: 'CC-004',
    vendorId: 'V-004',
    vendorName: 'Pacific Rim Warehousing',
    checkType: 'General Liability Insurance Certificate',
    status: 'expired',
    expiryDate: '2026-04-15', // Expired!
    documentName: 'Liab_Insurance_PacRim_Expiry2026.pdf',
    remarks: 'Requires renewal immediately. Vendor notified via mail on April 1st.',
    updatedAt: '2026-04-15T00:00:00Z'
  },
  {
    id: 'CC-005',
    vendorId: 'V-004',
    vendorName: 'Pacific Rim Warehousing',
    checkType: 'Bureau of Internal Revenue (BIR) Tax Clearance',
    status: 'passed',
    expiryDate: '2026-11-30',
    documentName: 'BIR_TaxClearance_PacRim_2026.pdf',
    remarks: 'Valid, up to date.',
    updatedAt: '2025-11-28T09:00:00Z'
  },
  {
    id: 'CC-007',
    vendorId: 'V-007',
    vendorName: 'Global Freight Specialist Inc.',
    checkType: 'Customs Accreditation Permit',
    status: 'failed',
    expiryDate: '2026-03-31', // Expired and suspended
    documentName: 'Customs_Accred_Pre2026_Global.pdf',
    remarks: 'Accreditation permit shows revoked or expired. Explains severe container delays at port.',
    updatedAt: '2026-03-31T23:59:59Z'
  },
  {
    id: 'CC-008',
    vendorId: 'V-007',
    vendorName: 'Global Freight Specialist Inc.',
    checkType: 'Bilateral Mutual NDA',
    status: 'pending',
    expiryDate: '2026-06-30',
    documentName: 'NDA_GlobalFreight.pdf',
    remarks: 'Sent to legal for review on May 10.',
    updatedAt: '2026-05-10T14:30:00Z'
  },
  {
    id: 'CC-009',
    vendorId: 'V-009',
    vendorName: 'Synergy Unified Technology',
    checkType: 'SOC 2 Type II Compliance Report',
    status: 'pending',
    expiryDate: '2025-12-31', // expired but they promised next year SOC2 by next month
    documentName: 'SOC2_Report_2024.pdf',
    remarks: 'Audit in progress for FY2025 report. Interim cover letter uploaded.',
    updatedAt: '2026-01-10T09:00:00Z'
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'L-1',
    timestamp: '2026-05-26T14:32:00Z',
    actor: 'admin@elev8.com',
    action: 'Contract Renewal Flags Raised',
    details: 'System flagged contract CON-101 (Aegis LED) expiring in 14 days and CON-106 (Vertex Retainer) in 4 days.',
    type: 'contract'
  },
  {
    id: 'L-2',
    timestamp: '2026-05-25T11:15:00Z',
    actor: 'maricel.santos@elev8.com',
    action: 'Compliance Check Added',
    details: 'Added bilateral Mutual NDA for Global Freight Specialist (Pending status).',
    type: 'compliance'
  },
  {
    id: 'L-3',
    timestamp: '2026-05-24T09:44:00Z',
    actor: 'robert.lim@elev8.com',
    action: 'Performance Review Lodged',
    details: 'Submitted performance review (REV-201) for Aegis LED Digital Displays with overall score: 92%.',
    type: 'performance'
  },
  {
    id: 'L-4',
    timestamp: '2026-05-22T16:20:00Z',
    actor: 'system@elev8.com',
    action: 'Vendor Status Updated',
    details: 'Status of Pacific Rim Warehousing auto-flagged to "Under Review" due to failed General Liability Insurance check.',
    type: 'vendor'
  }
];

// Local Storage Helper Utilities
export function getSavedData<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(`elev8_vms_${key}`);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    console.error('Error fetching localStorage for key:', key, e);
  }
  return defaultData;
}

export function saveToStore<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`elev8_vms_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage for key:', key, e);
  }
}

// Global Store Hook Simulators or standard State retrieval to bypass complex setups
export const getStoredVendors = () => getSavedData<Vendor[]>('vendors', INITIAL_VENDORS);
export const saveVendors = (vendors: Vendor[]) => saveToStore<Vendor[]>('vendors', vendors);

export const getStoredContracts = () => getSavedData<Contract[]>('contracts', INITIAL_CONTRACTS);
export const saveContracts = (contracts: Contract[]) => saveToStore<Contract[]>('contracts', contracts);

export const getStoredReviews = () => getSavedData<PerformanceReview[]>('reviews', INITIAL_REVIEWS);
export const saveReviews = (reviews: PerformanceReview[]) => saveToStore<PerformanceReview[]>('reviews', reviews);

export const INITIAL_COMPANY_DOCUMENTS: CompanyDocument[] = [
  {
    id: 'DOC-101',
    documentType: 'BIR Form 2303 (Certificate of Registration)',
    subsidiary: 'ALL',
    fileName: 'BIR_Form_2303_Elev8_Group.pdf',
    fileSize: '1.8 MB',
    status: 'valid',
    expiryDate: '2029-12-31',
    uploadedBy: 'ana.santos@elev8.com',
    uploadedAt: '2025-01-12T09:15:00Z',
    remarks: 'Registered under Corporate Tax Identification Number (TIN): 008-941-232-0000. Verified with BIR Revenue District Office (RDO).'
  },
  {
    id: 'DOC-102',
    documentType: 'SEC Certificate of Incorporation',
    subsidiary: 'HOLDINGS',
    fileName: 'SEC_Registration_Elev8_Holdings_Inc.pdf',
    fileSize: '2.4 MB',
    status: 'valid',
    expiryDate: '2045-10-24',
    uploadedBy: 'robert.lim@elev8.com',
    uploadedAt: '2023-10-24T14:30:00Z',
    remarks: 'SEC Company Registration No. CS201230491. Certified true copy stored and validated by Legal Counsel.'
  },
  {
    id: 'DOC-103',
    documentType: 'Mayor\'s Business Permit',
    subsidiary: 'MEDIA',
    fileName: 'Mayors_Permit_2026_Elev8_Media.pdf',
    fileSize: '3.1 MB',
    status: 'valid',
    expiryDate: '2027-01-31',
    uploadedBy: 'maricel.santos@elev8.com',
    uploadedAt: '2026-01-18T10:45:00Z',
    remarks: 'Manila City Hall Permit No. 2026-00010492. Paid and current. Displayed prominently at Headquarters.'
  },
  {
    id: 'DOC-104',
    documentType: 'BIR Tax Clearance Certificate',
    subsidiary: 'TRADING',
    fileName: 'BIR_Tax_Clearance_Trading_FY2025.pdf',
    fileSize: '1.2 MB',
    status: 'expired',
    expiryDate: '2025-12-31',
    uploadedBy: 'robert.lim@elev8.com',
    uploadedAt: '2025-01-05T08:00:00Z',
    remarks: 'Expired certificate. FY2026 BIR Tax Clearance application has been finalized, currently awaiting RDO signature and release.'
  },
  {
    id: 'DOC-105',
    documentType: 'SSS & Pag-IBIG Employer Clearance',
    subsidiary: 'ALL',
    fileName: 'SSS_PagIBIG_Employer_Clearance_Q1.pdf',
    fileSize: '1.5 MB',
    status: 'pending_verification',
    uploadedBy: 'maricel.santos@elev8.com',
    uploadedAt: '2026-05-24T16:40:00Z',
    expiryDate: '2026-09-30',
    remarks: 'Q1 2026 remittance clearance certificate uploaded. Awaiting compliance audit verification.'
  }
];

export const getStoredCompliance = () => getSavedData<ComplianceCheck[]>('compliance', INITIAL_COMPLIANCE);
export const saveCompliance = (compliance: ComplianceCheck[]) => saveToStore<ComplianceCheck[]>('compliance', compliance);

export const getStoredCompanyDocuments = () => getSavedData<CompanyDocument[]>('company_documents', INITIAL_COMPANY_DOCUMENTS);
export const saveCompanyDocuments = (documents: CompanyDocument[]) => saveToStore<CompanyDocument[]>('company_documents', documents);

export const getStoredLogs = () => getSavedData<LogEntry[]>('logs', INITIAL_LOGS);
export const saveLogs = (logs: LogEntry[]) => saveToStore<LogEntry[]>('logs', logs);

export function appendLog(action: string, details: string, type: LogEntry['type'], actor = 'current_user@elev8.com'): void {
  const currentLogs = getStoredLogs();
  const newLog: LogEntry = {
    id: `L-${uuid()}`,
    timestamp: new Date().toISOString(),
    actor,
    action,
    details,
    type
  };
  saveLogs([newLog, ...currentLogs].slice(0, 100)); // limit to 100 logs
}

