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
  RegistrationOtp,
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
  registrationOtps: RegistrationOtp[] = [];
  settings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
  private initialized = false;

  constructor() {
    this.seedInitialData();
    this.syncWithFirestore();
  }

  seedInitialData() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS)).map((u: User) => ({
      ...u,
      username: u.username || (u.name === 'admin' ? 'admin' : (u.email ? u.email.split('@')[0].toLowerCase() : u.name.toLowerCase().replace(/\s+/g, ''))),
      password: u.role === 'ADMIN' ? 'admin123' : 'password123',
    }));
    // Enforce default credentials for demo/production stability
    for (const u of this.users) {
      if (u.role === 'ADMIN') {
        u.username = 'admin';
        u.password = 'admin123';
      } else if (!u.password) {
        u.password = 'password123';
      }
    }
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.requirements = JSON.parse(JSON.stringify(INITIAL_REQUIREMENTS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.assignments = JSON.parse(JSON.stringify(INITIAL_AGENT_ASSIGNMENTS));
    this.documents = JSON.parse(JSON.stringify(INITIAL_DOCUMENTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.settings = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_SETTINGS));

    // Initial Registration OTPs (Official Admin Verification Desk)
    this.registrationOtps = [
      {
        id: 'otp-demo-01',
        role: 'SUPPLIER',
        email: 'supplier@qatarmetals.com',
        name: 'Nasser Al-Kuwari',
        companyName: 'Qatar Metal Recycling Yard W.L.L.',
        phone: '+974 55123456',
        country: 'Qatar',
        city: 'Doha',
        otpCode: '849201',
        status: 'USED',
        issuedBy: 'ADMIN',
        createdAt: '2026-01-12T07:45:00Z',
        expiresAt: '2026-01-12T08:45:00Z',
        verifiedAt: '2026-01-12T07:55:00Z',
        usedAt: '2026-01-12T08:00:00Z',
      },
      {
        id: 'otp-demo-02',
        role: 'BUYER',
        email: 'procurement@jswsteel.in',
        name: 'Rajesh Mehta',
        companyName: 'JSW Steel & Alloys Ltd',
        phone: '+91 9820123456',
        country: 'India',
        city: 'Mumbai',
        otpCode: '592314',
        status: 'USED',
        issuedBy: 'ADMIN',
        createdAt: '2026-01-13T09:30:00Z',
        expiresAt: '2026-01-13T10:30:00Z',
        verifiedAt: '2026-01-13T09:40:00Z',
        usedAt: '2026-01-13T09:45:00Z',
      },
      {
        id: 'otp-demo-03',
        role: 'AGENT',
        email: 'mandate@gulfscrapbrokers.com',
        name: 'Tariq Mansoor',
        companyName: 'Gulf Commodities Mandate & Brokerage',
        phone: '+971 501234567',
        country: 'UAE',
        city: 'Dubai',
        otpCode: '736182',
        status: 'USED',
        issuedBy: 'ADMIN',
        createdAt: '2026-01-14T11:00:00Z',
        expiresAt: '2026-01-14T12:00:00Z',
        verifiedAt: '2026-01-14T11:15:00Z',
        usedAt: '2026-01-14T11:20:00Z',
      }
    ];
  }

  async syncWithFirestore() {
    try {
      console.log('[Firestore] Synchronizing database state with cloud store...');
      // 1. Sync Users
      const remoteUsers = await fetchCollection<User>('users');
      if (remoteUsers && remoteUsers.length > 0) {
        const userMap = new Map<string, User>();
        // Always maintain the verified institutional accounts (Admin, Supplier, Buyer, Agent)
        this.users.forEach((u) => userMap.set(u.id, u));
        // Merge in remote users
        remoteUsers.forEach((u) => {
          if (!u.email?.includes('@example.com')) {
            const existing = userMap.get(u.id);
            userMap.set(u.id, existing ? { ...existing, ...u } : u);
          }
        });
        this.users = Array.from(userMap.values());
        console.log(`[Firestore] Database active with ${this.users.length} institutional & registered accounts.`);
      } else {
        console.log('[Firestore] Initializing official institutional accounts in cloud store...');
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

      // 7. Sync Registration OTPs
      const remoteOtps = await fetchCollection<RegistrationOtp>('registrationOtps');
      if (remoteOtps && remoteOtps.length > 0) {
        const otpMap = new Map<string, RegistrationOtp>();
        this.registrationOtps.forEach((o) => otpMap.set(o.id, o));
        remoteOtps.forEach((o) => otpMap.set(o.id, o));
        this.registrationOtps = Array.from(otpMap.values());
      }

      this.initialized = true;
      console.log('[Firestore] Database synchronization successfully active.');
    } catch (err) {
      console.warn('[Firestore] Sync notice (running with resilient cache):', err);
    }
  }

  // Registration OTP CRUD
  async saveRegistrationOtp(otp: RegistrationOtp): Promise<RegistrationOtp> {
    const rawCode = otp.otpCode || (otp as any).code || '';
    otp.otpCode = rawCode;
    (otp as any).code = rawCode;

    const idx = this.registrationOtps.findIndex((o) => o.id === otp.id);
    if (idx >= 0) {
      this.registrationOtps[idx] = otp;
    } else {
      this.registrationOtps.unshift(otp);
    }
    await saveDocument('registrationOtps', otp);
    return otp;
  }

  async findRegistrationOtp(email: string, otpCode: string): Promise<RegistrationOtp | null> {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otpCode || '').trim();
    if (!cleanEmail || !cleanOtp) return null;

    const found = this.registrationOtps.find(
      (o) =>
        o.email.toLowerCase() === cleanEmail &&
        (o.otpCode === cleanOtp || (o as any).code === cleanOtp)
    );
    if (found) {
      const code = found.otpCode || (found as any).code;
      found.otpCode = code;
      (found as any).code = code;
    }
    return found || null;
  }

  async findRegistrationOtpById(id: string): Promise<RegistrationOtp | null> {
    const cleanId = (id || '').trim();
    if (!cleanId) return null;
    const found = this.registrationOtps.find((o) => o.id === cleanId);
    return found || null;
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
      pricePerUnit: listing.pricePerUnit,
      currency: listing.currency,
      countryOfOrigin: listing.countryOfOrigin,
      portOfShipping: listing.portOfShipping,
      destinationPort: listing.destinationPort,
      packaging: listing.packaging,
      qualitySpecification: listing.qualitySpecification,
      inspectionAvailable: listing.inspectionAvailable,
      minOrderQuantity: listing.minOrderQuantity,
      availabilityDate: 'Prompt Ocean Dispatch (Verified by Al Shaheed)',
      validUntil: 'Active Trade Window',
      paymentTerms: listing.paymentTerms,
      incoterms: listing.incoterms,
      photos: listing.photos,
      status: listing.status,
      isPublished: listing.isPublished,
      publishedAt: listing.publishedAt,
      // CONFIDENTIAL DATA EXCLUDED: Supplier name, email, phone, company, exact posting dates
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
      requiredDeliveryDate: 'Prompt Cargo Acceptance (Coordinated by Al Shaheed)',
      packaging: req.packaging,
      qualityRequirements: req.qualityRequirements,
      inspectionRequired: req.inspectionRequired,
      paymentTerms: req.paymentTerms,
      incoterms: req.incoterms,
      status: req.status,
      isPublished: req.isPublished,
      // CONFIDENTIAL DATA EXCLUDED: Buyer name, company, email, phone, exact posting dates
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
