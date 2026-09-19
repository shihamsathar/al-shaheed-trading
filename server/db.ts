/**
 * Al Shaheed Trading and Equipment Co.
 * Server Database & In-Memory Store with Seed Data, Matching Engine & Privacy Sanitizers
 */

import {
  User,
  ScrapListing,
  BuyerRequirement,
  MatchResult,
  BuyerInterest,
  AgentAssignment,
  PurchaseRecord,
  SaleRecord,
  Transaction,
  TradeDocument,
  Notification,
  AuditLog,
  SystemSettings,
  UserRole,
} from '../src/types.js';

import {
  INITIAL_USERS,
  INITIAL_LISTINGS,
  INITIAL_REQUIREMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_AGENT_ASSIGNMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SYSTEM_SETTINGS,
} from '../src/constants/tradeData.js';
import {
  fetchCollection,
  saveDocument,
  deleteDocument,
  findUserInFirestore,
} from './firestore.js';

class TradingDatabase {
  users: User[] = [];
  listings: ScrapListing[] = [];
  requirements: BuyerRequirement[] = [];
  interests: BuyerInterest[] = [];
  assignments: AgentAssignment[] = [];
  purchases: PurchaseRecord[] = [];
  sales: SaleRecord[] = [];
  transactions: Transaction[] = [];
  documents: TradeDocument[] = [];
  notifications: Notification[] = [];
  auditLogs: AuditLog[] = [];
  settings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
  private initialized = false;

  constructor() {
    this.seedInitialData();
    this.syncWithFirestore();
  }

  seedInitialData() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS)).map((u: User) => ({
      ...u,
      username: u.name === 'admin' ? 'admin' : (u.email ? u.email.split('@')[0].toLowerCase() : u.name.toLowerCase().replace(/\s+/g, '')),
      password: u.role === 'ADMIN' ? 'admin123' : 'password123',
    }));
    // Enforce admin user credentials
    const admin = this.users.find((u) => u.role === 'ADMIN');
    if (admin) {
      admin.name = 'admin';
      admin.username = 'admin';
      admin.password = 'admin123';
    }
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.requirements = JSON.parse(JSON.stringify(INITIAL_REQUIREMENTS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.assignments = JSON.parse(JSON.stringify(INITIAL_AGENT_ASSIGNMENTS));
    this.documents = JSON.parse(JSON.stringify(INITIAL_DOCUMENTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  }

  async syncWithFirestore() {
    try {
      console.log('[Firestore] Synchronizing database state with cloud store...');
      // 1. Sync Users
      const remoteUsers = await fetchCollection<User>('users');
      if (remoteUsers && remoteUsers.length > 0) {
        // Exclude any legacy sample accounts if they exist in remote store
        const cleanRemoteUsers = remoteUsers.filter(
          (u) =>
            !u.id.startsWith('usr-sup-') &&
            !u.id.startsWith('usr-buy-') &&
            !u.id.startsWith('usr-agt-') &&
            !u.email?.includes('@example.com')
        );
        const userMap = new Map<string, User>();
        this.users.forEach((u) => userMap.set(u.id, u));
        cleanRemoteUsers.forEach((u) => userMap.set(u.id, u));
        this.users = Array.from(userMap.values());
        console.log(`[Firestore] Loaded ${cleanRemoteUsers.length} persistent accounts.`);
      } else {
        console.log('[Firestore] Initializing clean admin account in cloud store...');
        for (const u of this.users) {
          await saveDocument('users', u);
        }
      }

      // 2. Sync Listings
      const remoteListings = await fetchCollection<ScrapListing>('listings');
      this.listings = remoteListings || [];

      // 3. Sync Requirements
      const remoteReqs = await fetchCollection<BuyerRequirement>('requirements');
      this.requirements = remoteReqs || [];

      // 4. Sync Transactions
      const remoteTxns = await fetchCollection<Transaction>('transactions');
      this.transactions = remoteTxns || [];

      // 5. Sync Agent Assignments
      const remoteAsgs = await fetchCollection<AgentAssignment>('agentAssignments');
      this.assignments = remoteAsgs || [];

      // 6. Sync Trade Documents
      const remoteDocs = await fetchCollection<TradeDocument>('tradeDocuments');
      this.documents = remoteDocs || [];

      this.initialized = true;
      console.log('[Firestore] Database synchronization successfully active.');
    } catch (err) {
      console.warn('[Firestore] Sync notice (running with resilient cache):', err);
    }
  }

  // Find user by identifier (email, username, name, companyName, or ID)
  async findUser(identifier: string): Promise<User | null> {
    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) return null;

    // Check memory first
    const found = this.users.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.name && u.name.toLowerCase() === cleanId) ||
        (u.companyName && u.companyName.toLowerCase() === cleanId)
    );
    if (found) return found;

    // Fallback query directly to Firestore
    const remoteUser = await findUserInFirestore(identifier);
    if (remoteUser) {
      const idx = this.users.findIndex((u) => u.id === remoteUser.id);
      if (idx >= 0) {
        this.users[idx] = remoteUser;
      } else {
        this.users.push(remoteUser);
      }
      return remoteUser;
    }

    return null;
  }

  // Persistent User CRUD
  async saveUser(user: User): Promise<User> {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    await saveDocument('users', user);
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    this.users = this.users.filter((u) => u.id !== userId);
    await deleteDocument('users', userId);
  }

  // Persistent Listing CRUD
  async saveListing(listing: ScrapListing): Promise<ScrapListing> {
    const idx = this.listings.findIndex((l) => l.id === listing.id);
    if (idx >= 0) {
      this.listings[idx] = listing;
    } else {
      this.listings.unshift(listing);
    }
    await saveDocument('listings', listing);
    return listing;
  }

  async deleteListing(listingId: string): Promise<void> {
    this.listings = this.listings.filter((l) => l.id !== listingId);
    await deleteDocument('listings', listingId);
  }

  // Persistent Requirement CRUD
  async saveRequirement(req: BuyerRequirement): Promise<BuyerRequirement> {
    const idx = this.requirements.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      this.requirements[idx] = req;
    } else {
      this.requirements.unshift(req);
    }
    await saveDocument('requirements', req);
    return req;
  }

  async deleteRequirement(reqId: string): Promise<void> {
    this.requirements = this.requirements.filter((r) => r.id !== reqId);
    await deleteDocument('requirements', reqId);
  }

  // Persistent Transaction CRUD
  async saveTransaction(txn: Transaction): Promise<Transaction> {
    const idx = this.transactions.findIndex((t) => t.id === txn.id);
    if (idx >= 0) {
      this.transactions[idx] = txn;
    } else {
      this.transactions.unshift(txn);
    }
    await saveDocument('transactions', txn);
    return txn;
  }

  // Persistent Agent Assignment CRUD
  async saveAssignment(asg: AgentAssignment): Promise<AgentAssignment> {
    const idx = this.assignments.findIndex((a) => a.id === asg.id);
    if (idx >= 0) {
      this.assignments[idx] = asg;
    } else {
      this.assignments.unshift(asg);
    }
    await saveDocument('agentAssignments', asg);
    return asg;
  }

  // Persistent Trade Document CRUD
  async saveTradeDocument(docObj: TradeDocument): Promise<TradeDocument> {
    const idx = this.documents.findIndex((d) => d.id === docObj.id);
    if (idx >= 0) {
      this.documents[idx] = docObj;
    } else {
      this.documents.unshift(docObj);
    }
    await saveDocument('tradeDocuments', docObj);
    return docObj;
  }

  // Audit Logger with Firestore persistence
  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    saveDocument('auditLogs', log).catch(() => {});
    return log;
  }

  // Notifications with Firestore persistence
  addNotification(entry: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    saveDocument('notifications', notif).catch(() => {});
    return notif;
  }

  // --- AUTOMATED SUPPLY-DEMAND MATCHING ENGINE ---
  computeMatches(): MatchResult[] {
    const results: MatchResult[] = [];

    const activeListings = this.listings.filter(
      (l) => l.status === 'AVAILABLE' || l.status === 'RESERVED'
    );
    const activeDemands = this.requirements.filter((r) => r.status === 'ACTIVE');

    for (const listing of activeListings) {
      for (const req of activeDemands) {
        const breakdown = this.calculateMatchBreakdown(listing, req);
        const overallScore = Math.round(
          breakdown.commodity * 0.25 +
          breakdown.grade * 0.20 +
          breakdown.quantity * 0.15 +
          breakdown.price * 0.15 +
          breakdown.destination * 0.10 +
          breakdown.delivery * 0.05 +
          breakdown.packaging * 0.05 +
          breakdown.incoterms * 0.05
        );

        let category: MatchResult['category'] = 'LOW';
        if (overallScore >= 90) category = 'EXCELLENT';
        else if (overallScore >= 75) category = 'STRONG';
        else if (overallScore >= 50) category = 'POSSIBLE';

        if (overallScore >= 40) {
          results.push({
            id: `match-${listing.id}-${req.id}`,
            listingId: listing.id,
            requirementId: req.id,
            listing,
            requirement: req,
            overallScore,
            category,
            breakdown,
            adminStatus: overallScore >= 90 ? 'NEW' : 'REVIEWED',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    return results.sort((a, b) => b.overallScore - a.overallScore);
  }

  private calculateMatchBreakdown(listing: ScrapListing, req: BuyerRequirement) {
    // 1. Commodity category comparison
    let commodityScore = 0;
    const lComm = listing.commodityCategory.toLowerCase();
    const rComm = req.commodityCategory.toLowerCase();
    if (lComm === rComm) commodityScore = 100;
    else if (lComm.includes('metal') && rComm.includes('metal')) commodityScore = 95;
    else if (lComm.includes('paper') && rComm.includes('paper')) commodityScore = 95;
    else commodityScore = 20;

    // 2. Grade / Material similarity
    let gradeScore = 60;
    const lMat = (listing.materialName + ' ' + listing.grade).toLowerCase();
    const rMat = (req.materialName + ' ' + req.grade).toLowerCase();
    if (lMat === rMat) gradeScore = 100;
    else if (
      (lMat.includes('hms') && rMat.includes('hms')) ||
      (lMat.includes('occ') && rMat.includes('occ')) ||
      (lMat.includes('shredded') && rMat.includes('shredded')) ||
      (lMat.includes('copper') && rMat.includes('copper')) ||
      (lMat.includes('white') && rMat.includes('white')) ||
      (lMat.includes('304') && rMat.includes('304'))
    ) {
      gradeScore = 95;
    } else if (lMat.includes(rMat) || rMat.includes(lMat)) {
      gradeScore = 85;
    }

    // 3. Quantity compatibility
    let quantityScore = 80;
    const minQty = Math.min(listing.quantity, req.requiredQuantity);
    const maxQty = Math.max(listing.quantity, req.requiredQuantity);
    const ratio = minQty / maxQty;
    if (listing.quantity >= req.requiredQuantity) {
      quantityScore = 100; // Supplier has enough to fulfill buyer request
    } else {
      quantityScore = Math.round(ratio * 100);
    }

    // 4. Price margin compatibility
    let priceScore = 75;
    if (req.targetPricePerUnit >= listing.pricePerUnit) {
      priceScore = 100; // Buyer is willing to pay equal or more than supplier asking price
    } else {
      const priceDiffRatio = (listing.pricePerUnit - req.targetPricePerUnit) / listing.pricePerUnit;
      if (priceDiffRatio <= 0.05) priceScore = 90;
      else if (priceDiffRatio <= 0.10) priceScore = 75;
      else if (priceDiffRatio <= 0.20) priceScore = 55;
      else priceScore = 30;
    }

    // 5. Destination & Logistics
    let destScore = 85;
    if (listing.destinationPort && req.destinationPort && listing.destinationPort === req.destinationPort) {
      destScore = 100;
    } else if (req.destinationPort) {
      destScore = 90;
    }

    // 6. Delivery
    let deliveryScore = 90;

    // 7. Packaging
    let packagingScore = 85;
    if (listing.packaging && req.packaging && listing.packaging === req.packaging) {
      packagingScore = 100;
    }

    // 8. Incoterms
    let incotermsScore = 85;
    if (listing.incoterms === req.incoterms) incotermsScore = 100;

    return {
      commodity: commodityScore,
      grade: gradeScore,
      quantity: quantityScore,
      destination: destScore,
      price: priceScore,
      delivery: deliveryScore,
      packaging: packagingScore,
      incoterms: incotermsScore,
    };
  }

  // --- ABSOLUTE PRIVACY & COUNTERPARTY SANITIZERS ---
  sanitizeListingForBuyer(listing: ScrapListing): Partial<ScrapListing> {
    return {
      id: listing.id,
      commodityCategory: listing.commodityCategory,
      materialName: listing.materialName,
      scrapType: listing.scrapType,
      grade: listing.grade,
      description: listing.description,
      quantity: listing.quantity,
      quantityUnit: listing.quantityUnit,
      numberOfContainers: listing.numberOfContainers,
      pricePerUnit: listing.adminPublishedPrice ? listing.pricePerUnit : 0,
      currency: listing.currency,
      countryOfOrigin: listing.countryOfOrigin,
      portOfShipping: listing.portOfShipping,
      destinationPort: listing.destinationPort,
      packaging: listing.packaging,
      qualitySpecification: listing.qualitySpecification,
      inspectionAvailable: listing.inspectionAvailable,
      minOrderQuantity: listing.minOrderQuantity,
      availabilityDate: listing.availabilityDate,
      validUntil: listing.validUntil,
      paymentTerms: listing.paymentTerms,
      incoterms: listing.incoterms,
      photos: listing.photos,
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      // CONFIDENTIAL DATA EXCLUDED (Supplier name, email, phone, company, profit, margin)
    };
  }

  sanitizeRequirementForSupplier(req: BuyerRequirement): Partial<BuyerRequirement> {
    return {
      id: req.id,
      commodityCategory: req.commodityCategory,
      materialName: req.materialName,
      grade: req.grade,
      requiredQuantity: req.requiredQuantity,
      quantityUnit: req.quantityUnit,
      targetPricePerUnit: req.targetPricePerUnit,
      currency: req.currency,
      destinationCountry: req.destinationCountry,
      destinationPort: req.destinationPort,
      requiredDeliveryDate: req.requiredDeliveryDate,
      packaging: req.packaging,
      qualityRequirements: req.qualityRequirements,
      inspectionRequired: req.inspectionRequired,
      paymentTerms: req.paymentTerms,
      incoterms: req.incoterms,
      status: req.status,
      createdAt: req.createdAt,
      // CONFIDENTIAL DATA EXCLUDED (Buyer name, company, email, phone)
    };
  }

  sanitizeListingForAgent(listing: ScrapListing, assignment?: AgentAssignment) {
    return {
      id: listing.id,
      assignmentId: assignment?.id,
      commodityCategory: listing.commodityCategory,
      materialName: listing.materialName,
      scrapType: listing.scrapType,
      grade: listing.grade,
      description: listing.description,
      quantity: assignment ? assignment.quantityMT : listing.quantity,
      quantityUnit: 'MT',
      pricePerUnit: assignment?.targetSalesPrice || listing.pricePerUnit,
      currency: listing.currency,
      countryOfOrigin: listing.countryOfOrigin,
      portOfShipping: listing.portOfShipping,
      destinationPort: listing.destinationPort,
      packaging: listing.packaging,
      qualitySpecification: listing.qualitySpecification,
      inspectionAvailable: listing.inspectionAvailable,
      paymentTerms: listing.paymentTerms,
      incoterms: listing.incoterms,
      photos: listing.photos,
      status: assignment ? assignment.status : listing.status,
      agentRatePerTon: assignment ? assignment.agentRatePerTon : listing.agentRatePerTon || 15,
      calculatedAgentAmount: assignment ? assignment.calculatedAgentAmount : (listing.quantity * (listing.agentRatePerTon || 15)),
      commercialTerms: assignment?.commercialTerms || 'Standard Authorised Terms',
      assignedAt: assignment?.assignedAt || listing.createdAt,
      // CONFIDENTIAL DATA EXCLUDED (Supplier & Buyer details, internal margins)
    };
  }
}

export const db = new TradingDatabase();
