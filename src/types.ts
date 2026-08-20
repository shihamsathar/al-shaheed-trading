/**
 * Al Shaheed Trading and Equipment Co.
 * Core TypeScript Definitions & Interfaces
 */

export type UserRole = 'ADMIN' | 'SUPPLIER' | 'BUYER' | 'AGENT';

export type ListingStatus = 
  | 'AVAILABLE' 
  | 'PENDING_REVIEW' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'EXPIRED' 
  | 'ARCHIVED';

export type DemandStatus = 
  | 'ACTIVE' 
  | 'MATCHED' 
  | 'FULFILLED' 
  | 'CANCELLED';

export type TransactionStatus = 
  | 'LISTED'
  | 'AVAILABLE'
  | 'MATCHED'
  | 'INTERESTED'
  | 'NEGOTIATION'
  | 'RESERVED'
  | 'PURCHASE_CREATED'
  | 'SALE_CREATED'
  | 'AGENT_ASSIGNED'
  | 'IN_PROGRESS'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'SOLD'
  | 'CANCELLED';

export type AgentAssignmentStatus = 
  | 'ASSIGNED' 
  | 'IN_NEGOTIATION' 
  | 'BUYER_IDENTIFIED' 
  | 'COMMERCIAL_CLOSED' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyName?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  businessRegNumber?: string;
  taxVatNumber?: string;
  website?: string;
  commodityCategories?: string[];
  typicalVolume?: string;
  tradingRegion?: string;
  languages?: string[];
  experienceYears?: number;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface ScrapListing {
  id: string;
  supplierId: string;
  supplierCompanyName: string;
  supplierContactName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierCountry: string;
  commodityCategory: string; // e.g. "Metal Scrap", "Paper Waste"
  materialName: string;      // e.g. "HMS 1&2 Steel Scrap", "OCC Cardboard Waste"
  scrapType: string;         // e.g. "Ferrous Metal", "Corrugated Cardboard"
  grade: string;             // e.g. "ISRI 200-206", "OCC 11"
  description: string;
  quantity: number;
  quantityUnit: string;      // "MT", "KG", "Container", "Bale"
  numberOfContainers?: number;
  pricePerUnit: number;
  currency: string;          // "USD", "QAR", "EUR", etc.
  countryOfOrigin: string;
  loadingLocation: string;
  portOfShipping: string;
  destinationPort?: string;
  packaging: string;         // "Loose in 20ft Container", "Baled", "Bundled"
  qualitySpecification: string;
  inspectionAvailable: boolean;
  minOrderQuantity: number;
  availabilityDate: string;
  validUntil: string;
  paymentTerms: string;      // "LC at Sight", "30% Advance + 70% BL", "CAD"
  incoterms: string;         // "FOB", "CIF", "CFR", "EXW"
  photos: string[];
  status: ListingStatus;
  adminPublishedPrice?: boolean;
  assignedAgentId?: string;
  assignedAgentName?: string;
  agentRatePerTon?: number;  // $ per MT
  interestedBuyerCount?: number;
  matchedDemandCount?: number;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  visibilitySettings?: {
    showPrice: boolean;
    showOrigin: boolean;
    showPort: boolean;
    showDescription: boolean;
    showPhotos: boolean;
    showPackaging: boolean;
    showIncoterms: boolean;
    showDelivery: boolean;
    showDocuments: boolean;
  };
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerCompanyName: string;
  buyerContactName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  commodityCategory: string;
  materialName: string;
  grade: string;
  requiredQuantity: number;
  quantityUnit: string;
  targetPricePerUnit: number;
  currency: string;
  destinationCountry: string;
  destinationPort: string;
  preferredOrigin?: string;
  requiredDeliveryDate: string;
  packaging: string;
  qualityRequirements: string;
  inspectionRequired: boolean;
  paymentTerms: string;
  incoterms: string;
  additionalRequirements?: string;
  status: DemandStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  id: string;
  listingId: string;
  requirementId: string;
  listing: ScrapListing;
  requirement: BuyerRequirement;
  overallScore: number; // 0 - 100
  category: 'EXCELLENT' | 'STRONG' | 'POSSIBLE' | 'LOW';
  breakdown: {
    commodity: number;
    grade: number;
    quantity: number;
    destination: number;
    price: number;
    delivery: number;
    packaging: number;
    incoterms: number;
  };
  aiInsight?: string;
  adminStatus: 'NEW' | 'REVIEWED' | 'DEAL_INITIATED' | 'REJECTED' | 'ARCHIVED';
  createdAt: string;
}

export interface BuyerInterest {
  id: string;
  listingId: string;
  buyerId: string;
  buyerCompanyName: string;
  buyerContactName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCountry: string;
  proposedQuantity?: number;
  proposedPrice?: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CONVERTED_TO_DEAL';
  createdAt: string;
}

export interface AgentAssignment {
  id: string;
  listingId: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  materialName: string;
  commodity: string;
  quantityMT: number;
  agentRatePerTon: number; // in USD
  calculatedAgentAmount: number; // quantityMT * agentRatePerTon
  commercialTerms: string;
  targetSalesPrice?: number;
  currency: string;
  status: AgentAssignmentStatus;
  latestUpdate?: string;
  assignedAt: string;
  updatedAt: string;
}

export interface PurchaseRecord {
  id: string;
  transactionId?: string;
  listingId: string;
  supplierId: string;
  supplierName: string;
  materialName: string;
  quantity: number;
  unit: string;
  purchasePricePerUnit: number;
  currency: string;
  totalPurchaseValue: number;
  purchaseDate: string;
  portOfShipping: string;
  paymentTerms: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  shippingStatus: 'PENDING' | 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED';
  notes?: string;
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  transactionId?: string;
  requirementId?: string;
  listingId?: string;
  buyerId: string;
  buyerName: string;
  materialName: string;
  quantity: number;
  unit: string;
  sellingPricePerUnit: number;
  currency: string;
  totalSalesValue: number;
  salesDate: string;
  destinationPort: string;
  paymentTerms: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  shippingStatus: 'PENDING' | 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED';
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  dealCode: string; // e.g. "AST-2026-084"
  listingId: string;
  requirementId?: string;
  supplierId: string;
  supplierName: string;
  buyerId: string;
  buyerName: string;
  agentId?: string;
  agentName?: string;
  materialName: string;
  commodity: string;
  grade: string;
  quantity: number;
  unit: string;
  // Financials
  purchasePricePerUnit: number;
  sellingPricePerUnit: number;
  currency: string;
  totalPurchaseValue: number;
  totalSalesValue: number;
  freightAndLogisticsCost: number;
  inspectionAndInsuranceCost: number;
  agentCommissionPerTon: number;
  totalAgentCommission: number;
  grossMargin: number;
  netMargin: number;
  status: TransactionStatus;
  type: 'DIRECT_TRADING' | 'MANAGED_MEDIATION' | 'AGENT_TRADING';
  originPort: string;
  destinationPort: string;
  incoterms: string;
  paymentStatus: 'PENDING' | 'ADVANCE_RECEIVED' | 'LC_OPENED' | 'FULLY_SETTLED';
  shipmentStatus: 'NOT_SHIPPED' | 'CONTAINER_LOADED' | 'BL_ISSUED' | 'IN_TRANSIT' | 'ARRIVED_PORT' | 'CLEARED';
  contractNumber?: string;
  createdAt: string;
  updatedAt: string;
  cancellationDetails?: {
    cancelledAt: string;
    cancelledBy: string;
    reason: string;
    financialImpact: number;
    notes?: string;
  };
}

export interface TradeDocument {
  id: string;
  transactionId?: string;
  listingId?: string;
  title: string;
  documentType: 
    | 'PURCHASE_ORDER' 
    | 'SALES_CONTRACT' 
    | 'COMMERCIAL_INVOICE' 
    | 'BILL_OF_LADING' 
    | 'CERTIFICATE_OF_ORIGIN' 
    | 'INSPECTION_REPORT' 
    | 'WEIGHT_CERTIFICATE' 
    | 'INSURANCE_POLICY' 
    | 'OTHER';
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedBy: string;
  accessRoles: UserRole[];
  uploadedAt: string;
  status: 'DRAFT' | 'VERIFIED' | 'REJECTED';
}

export interface Notification {
  id: string;
  recipientId: string; // User ID or 'ADMIN_ALL' or 'ALL'
  recipientRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'MATCH' | 'DEAL';
  linkUrl?: string;
  isRead: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  companyName: string;
  logoUrl: string;
  website: string;
  email: string;
  phone1: string;
  phone2: string;
  address: string;
  defaultAgentRatePerTon: number; // default USD / MT
  tradingCurrencies: string[];
  primaryCurrency: string;
  minMatchScoreThreshold: number;
  autoMatchNotification: boolean;
}
