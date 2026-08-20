/**
 * Al Shaheed Trading and Equipment Co.
 * Full-Stack Express Server with Vite Middleware Integration
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { analyzeTradeMatchWithAI, normalizeCommodityWithAI } from './server/gemini.js';
import { User, ScrapListing, BuyerRequirement, Transaction, UserRole, AgentAssignment, TradeDocument, BuyerInterest } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Helper for current authenticated user from Authorization header / session token
  const getAuthUser = (req: express.Request): User | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }
    // Match by token / user ID
    const user = db.users.find((u) => u.id === token);
    return user || null;
  };

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication token required. Please sign in.' });
    }
    (req as any).user = user;
    next();
  };

  const requireRole = (roles: UserRole[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user as User;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden. Requires one of [${roles.join(', ')}] role.` });
      }
      next();
    };
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      company: 'Al Shaheed Trading and Equipment Co',
      timestamp: new Date().toISOString(),
      activeListings: db.listings.length,
      activeUsers: db.users.length,
    });
  });

  // --- AUTHENTICATION ---
  app.post('/api/auth/login', (req, res) => {
    const { email, username, password, role } = req.body;
    const loginIdentifier = (username || email || '').trim().toLowerCase();

    if (!loginIdentifier && !role) {
      return res.status(400).json({ error: 'Username or Email is required.' });
    }

    let user: User | undefined;

    // 1. Admin login match (checks default "admin", custom admin username, or admin email)
    const admin = db.users.find((u) => u.role === 'ADMIN');
    if (
      admin &&
      (loginIdentifier === 'admin' ||
       loginIdentifier === 'admin@alshaheedrecycling.com' ||
       (admin.name && admin.name.toLowerCase() === loginIdentifier) ||
       (admin.email && admin.email.toLowerCase() === loginIdentifier) ||
       role === 'ADMIN')
    ) {
      user = admin;
    }

    // 2. Exact email or username match for registered partners (Suppliers, Buyers, Agents)
    if (!user && loginIdentifier) {
      user = db.users.find(
        (u) =>
          u.email.toLowerCase() === loginIdentifier ||
          (u.name && u.name.toLowerCase() === loginIdentifier) ||
          (u.companyName && u.companyName.toLowerCase() === loginIdentifier) ||
          u.id.toLowerCase() === loginIdentifier
      );
    }

    // 3. Fallback role match if explicitly supplied
    if (!user && role) {
      user = db.users.find((u) => u.role === role);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Account not found. Please verify your username (or email address) and password. If you are a new partner, please register first.',
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}. Please contact Al Shaheed Trade Administration.` });
    }

    user.lastLogin = new Date().toISOString();

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      newValue: `Signed into ${user.role} workspace as "${loginIdentifier}"`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      token: user.id,
      user,
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = getAuthUser(req);
    if (user) {
      db.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: user.id,
        newValue: `Signed out of portal`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/register', (req, res) => {
    const {
      role,
      email,
      name,
      companyName,
      phone,
      country,
      city,
      address,
      businessRegNumber,
      taxVatNumber,
      website,
      commodityCategories,
      typicalVolume,
      tradingRegion,
      languages,
      experienceYears,
    } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Email, Name, and Role are mandatory.' });
    }

    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const newUser: User = {
      id: `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      email,
      name,
      role: role as UserRole,
      companyName: companyName || name,
      phone: phone || '',
      country: country || 'Qatar',
      city: city || 'Doha',
      address,
      businessRegNumber,
      taxVatNumber,
      website,
      commodityCategories: commodityCategories || ['Metal Scrap'],
      typicalVolume,
      tradingRegion,
      languages,
      experienceYears: Number(experienceYears) || 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: `New ${role} Registered`,
      message: `${name} (${companyName || 'Individual'}) registered from ${country || 'Qatar'}.`,
      type: 'INFO',
      linkUrl: `/admin/counterparties`,
      priority: 'NORMAL',
    });

    db.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: newUser.id,
      newValue: `Role: ${role}, Company: ${companyName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      token: newUser.id,
      user: newUser,
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    res.json(user);
  });

  // --- ADMIN CREDENTIALS UPDATE ---
  app.post('/api/admin/credentials', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { username, email, password } = req.body;
    const admin = db.users.find((u) => u.role === 'ADMIN');
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const prevUsername = admin.name;
    if (username && username.trim()) {
      admin.name = username.trim();
    }
    if (email && email.trim()) {
      admin.email = email.trim();
    }
    if (password) {
      (admin as any).password = password;
    }

    db.addAuditLog({
      userId: admin.id,
      userName: admin.name,
      userRole: 'ADMIN',
      action: 'ADMIN_CREDENTIALS_UPDATED',
      entity: 'User',
      entityId: admin.id,
      previousValue: `Username: ${prevUsername}`,
      newValue: `Username: ${admin.name}, Email: ${admin.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Admin credentials updated successfully.', user: admin });
  });

  // Switch demo account helper
  app.post('/api/auth/switch-demo', (req, res) => {
    const { userId } = req.body;
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Demo user account not found.' });
    }
    res.json({ token: user.id, user });
  });

  // --- LISTINGS / MARKETPLACE ---
  app.get('/api/listings', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { category, status, search, origin, port } = req.query;

    let list = [...db.listings];

    if (category) {
      list = list.filter((l) => l.commodityCategory.toLowerCase() === String(category).toLowerCase());
    }
    if (status) {
      list = list.filter((l) => l.status.toLowerCase() === String(status).toLowerCase());
    }
    if (origin) {
      list = list.filter((l) => l.countryOfOrigin.toLowerCase() === String(origin).toLowerCase());
    }
    if (port) {
      list = list.filter((l) => l.portOfShipping.toLowerCase().includes(String(port).toLowerCase()));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (l) =>
          l.materialName.toLowerCase().includes(q) ||
          l.grade.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.commodityCategory.toLowerCase().includes(q) ||
          l.countryOfOrigin.toLowerCase().includes(q)
      );
    }

    // Role-based privacy segregation
    if (user.role === 'ADMIN') {
      return res.json(list);
    }

    if (user.role === 'SUPPLIER') {
      // Supplier sees their own listings with full details + anonymized public marketplace listings
      const result = list.map((l) => {
        if (l.supplierId === user.id) return l;
        return db.sanitizeListingForBuyer(l);
      });
      return res.json(result);
    }

    if (user.role === 'BUYER') {
      // Buyer gets completely sanitized counterparty details
      const result = list
        .filter((l) => l.status === 'AVAILABLE' || l.status === 'SOLD' || l.status === 'RESERVED')
        .map((l) => db.sanitizeListingForBuyer(l));
      return res.json(result);
    }

    if (user.role === 'AGENT') {
      // Agent sees materials assigned to them or approved by admin
      const agentAssignments = db.assignments.filter((a) => a.agentId === user.id);
      const assignedListingIds = agentAssignments.map((a) => a.listingId);
      const result = list
        .filter((l) => assignedListingIds.includes(l.id) || l.assignedAgentId === user.id)
        .map((l) => {
          const assignment = agentAssignments.find((a) => a.listingId === l.id);
          return db.sanitizeListingForAgent(l, assignment);
        });
      return res.json(result);
    }

    res.json(list);
  });

  app.get('/api/listings/:id', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    if (user.role === 'ADMIN' || (user.role === 'SUPPLIER' && listing.supplierId === user.id)) {
      return res.json(listing);
    }

    if (user.role === 'BUYER') {
      return res.json(db.sanitizeListingForBuyer(listing));
    }

    if (user.role === 'AGENT') {
      const assignment = db.assignments.find((a) => a.listingId === listing.id && a.agentId === user.id);
      return res.json(db.sanitizeListingForAgent(listing, assignment));
    }

    res.json(db.sanitizeListingForBuyer(listing));
  });

  app.post('/api/listings', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), (req, res) => {
    const user = (req as any).user as User;
    const data = req.body;

    if (!data.materialName || !data.commodityCategory || !data.quantity || !data.pricePerUnit) {
      return res.status(400).json({ error: 'Material name, commodity, quantity, and price are required.' });
    }

    if (!data.photos || data.photos.length === 0) {
      return res.status(400).json({ error: 'At least 1 photo is required for the scrap listing.' });
    }

    const newListing: ScrapListing = {
      id: `lst-${Date.now().toString().slice(-4)}`,
      supplierId: user.role === 'ADMIN' ? data.supplierId || user.id : user.id,
      supplierCompanyName: user.role === 'ADMIN' ? data.supplierCompanyName || user.companyName || user.name : user.companyName || user.name,
      supplierContactName: user.name,
      supplierEmail: user.email,
      supplierPhone: user.phone || '+974 30437712',
      supplierCountry: data.countryOfOrigin || user.country || 'Qatar',
      commodityCategory: data.commodityCategory,
      materialName: data.materialName,
      scrapType: data.scrapType || data.commodityCategory,
      grade: data.grade || 'Standard ISRI Grade',
      description: data.description || '',
      quantity: Number(data.quantity),
      quantityUnit: data.quantityUnit || 'MT',
      numberOfContainers: Number(data.numberOfContainers) || Math.ceil(Number(data.quantity) / 25),
      pricePerUnit: Number(data.pricePerUnit),
      currency: data.currency || 'USD',
      countryOfOrigin: data.countryOfOrigin || 'Qatar',
      loadingLocation: data.loadingLocation || 'Industrial Area Depot',
      portOfShipping: data.portOfShipping || 'Hamad Port (Doha)',
      destinationPort: data.destinationPort || '',
      packaging: data.packaging || 'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
      qualitySpecification: data.qualitySpecification || 'Standard Industrial Grade, SGS Inspected',
      inspectionAvailable: data.inspectionAvailable !== false,
      minOrderQuantity: Number(data.minOrderQuantity) || 25,
      availabilityDate: data.availabilityDate || new Date().toISOString().slice(0, 10),
      validUntil: data.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      paymentTerms: data.paymentTerms || '100% LC at Sight (Irrevocable & Confirmed)',
      incoterms: data.incoterms || 'CFR',
      photos: Array.isArray(data.photos) ? data.photos : [data.photos],
      status: user.role === 'ADMIN' ? 'AVAILABLE' : 'AVAILABLE',
      adminPublishedPrice: true,
      interestedBuyerCount: 0,
      matchedDemandCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.listings.unshift(newListing);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: 'New Scrap Material Listed',
      message: `${user.companyName || user.name} listed ${newListing.quantity} MT of ${newListing.materialName} @ $${newListing.pricePerUnit}/MT.`,
      type: 'INFO',
      linkUrl: '/admin/marketplace',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LISTING_CREATED',
      entity: 'ScrapListing',
      entityId: newListing.id,
      newValue: `${newListing.quantity} MT ${newListing.materialName} @ $${newListing.pricePerUnit}/MT`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newListing);
  });

  app.patch('/api/listings/:id/status', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { status, adminNotes } = req.body;
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const prevStatus = listing.status;
    listing.status = status;
    if (adminNotes) listing.adminNotes = adminNotes;
    listing.updatedAt = new Date().toISOString();

    // If marked SOLD or RESERVED, notify supplier
    db.addNotification({
      recipientId: listing.supplierId,
      recipientRole: 'SUPPLIER',
      title: `Listing Status Updated: ${status}`,
      message: `Your material listing "${listing.materialName}" is now marked as ${status}.`,
      type: status === 'SOLD' ? 'SUCCESS' : 'INFO',
      linkUrl: '/supplier/listings',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'LISTING_STATUS_CHANGED',
      entity: 'ScrapListing',
      entityId: listing.id,
      previousValue: prevStatus,
      newValue: status,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(listing);
  });

  // Admin / Supplier Update Listing
  app.put('/api/listings/:id', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), (req, res) => {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const allowed = ['materialName', 'commodityCategory', 'grade', 'quantity', 'pricePerUnit', 'countryOfOrigin', 'portOfShipping', 'destinationPort', 'packaging', 'incoterms', 'paymentTerms', 'status', 'description', 'adminNotes'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        (listing as any)[f] = req.body[f];
      }
    });
    listing.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: (req as any).user.role,
      action: 'LISTING_UPDATED',
      entity: 'ScrapListing',
      entityId: listing.id,
      newValue: `Updated ${listing.materialName} (${listing.quantity} MT @ $${listing.pricePerUnit})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(listing);
  });

  // Admin / Supplier Delete Listing
  app.delete('/api/listings/:id', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), (req, res) => {
    const index = db.listings.findIndex((l) => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Listing not found.' });

    const removed = db.listings[index];
    db.listings.splice(index, 1);

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: (req as any).user.role,
      action: 'LISTING_DELETED',
      entity: 'ScrapListing',
      entityId: removed.id,
      newValue: `Deleted lot: ${removed.materialName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Listing deleted successfully.' });
  });

  // Buyer expresses interest
  app.post('/api/listings/:id/interest', requireAuth, requireRole(['BUYER', 'ADMIN']), (req, res) => {
    const user = (req as any).user as User;
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const { proposedQuantity, proposedPrice, message } = req.body;

    const newInterest: BuyerInterest = {
      id: `int-${Date.now().toString().slice(-4)}`,
      listingId: listing.id,
      buyerId: user.id,
      buyerCompanyName: user.companyName || user.name,
      buyerContactName: user.name,
      buyerEmail: user.email,
      buyerPhone: user.phone || '',
      buyerCountry: user.country || 'International',
      proposedQuantity: proposedQuantity ? Number(proposedQuantity) : listing.quantity,
      proposedPrice: proposedPrice ? Number(proposedPrice) : listing.pricePerUnit,
      message: message || 'Expressed immediate commercial buying interest.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.interests.unshift(newInterest);
    listing.interestedBuyerCount = (listing.interestedBuyerCount || 0) + 1;

    // Admin Notification
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: 'Buyer Expressed Interest',
      message: `Buyer "${user.companyName || user.name}" expressed interest in ${listing.materialName} (${newInterest.proposedQuantity} MT).`,
      type: 'DEAL',
      linkUrl: `/admin/marketplace`,
      priority: 'HIGH',
    });

    // Supplier gets anonymized notification
    db.addNotification({
      recipientId: listing.supplierId,
      recipientRole: 'SUPPLIER',
      title: 'Verified Buyer Interest Received',
      message: `A verified international buyer has expressed interest in your listing "${listing.materialName}". Trade desk is coordinating.`,
      type: 'INFO',
      linkUrl: '/supplier/listings',
      priority: 'NORMAL',
    });

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BUYER_INTEREST_EXPRESSED',
      entity: 'BuyerInterest',
      entityId: newInterest.id,
      newValue: `${listing.materialName} - Qty: ${newInterest.proposedQuantity} MT`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({ message: 'Interest successfully submitted to Al Shaheed Trade Coordination Desk.', interest: newInterest });
  });

  // --- BUYER DEMANDS / REQUIREMENTS ---
  app.get('/api/requirements', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    const { category, search } = req.query;

    let list = [...db.requirements];

    if (category) {
      list = list.filter((r) => r.commodityCategory.toLowerCase() === String(category).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (r) =>
          r.materialName.toLowerCase().includes(q) ||
          r.grade.toLowerCase().includes(q) ||
          r.destinationPort.toLowerCase().includes(q) ||
          r.destinationCountry.toLowerCase().includes(q)
      );
    }

    if (user.role === 'ADMIN') {
      return res.json(list);
    }

    if (user.role === 'BUYER') {
      return res.json(list.filter((r) => r.buyerId === user.id));
    }

    if (user.role === 'SUPPLIER') {
      // Supplier sees anonymized demand feed
      const result = list
        .filter((r) => r.status === 'ACTIVE')
        .map((r) => db.sanitizeRequirementForSupplier(r));
      return res.json(result);
    }

    res.json(list.map((r) => db.sanitizeRequirementForSupplier(r)));
  });

  app.post('/api/requirements', requireAuth, requireRole(['BUYER', 'ADMIN']), (req, res) => {
    const user = (req as any).user as User;
    const data = req.body;

    if (!data.materialName || !data.commodityCategory || !data.requiredQuantity) {
      return res.status(400).json({ error: 'Material name, category, and quantity are required.' });
    }

    const newReq: BuyerRequirement = {
      id: `req-${Date.now().toString().slice(-4)}`,
      buyerId: user.role === 'ADMIN' ? data.buyerId || user.id : user.id,
      buyerCompanyName: user.companyName || user.name,
      buyerContactName: user.name,
      buyerEmail: user.email,
      buyerPhone: user.phone || '',
      buyerCountry: data.destinationCountry || user.country || 'India',
      commodityCategory: data.commodityCategory,
      materialName: data.materialName,
      grade: data.grade || 'Standard ISRI Grade',
      requiredQuantity: Number(data.requiredQuantity),
      quantityUnit: data.quantityUnit || 'MT',
      targetPricePerUnit: Number(data.targetPricePerUnit) || 0,
      currency: data.currency || 'USD',
      destinationCountry: data.destinationCountry || 'India',
      destinationPort: data.destinationPort || 'Nhava Sheva (JNPT Mumbai)',
      preferredOrigin: data.preferredOrigin || '',
      requiredDeliveryDate: data.requiredDeliveryDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      packaging: data.packaging || 'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
      qualityRequirements: data.qualityRequirements || 'Free of radioactive matter and combustibles.',
      inspectionRequired: data.inspectionRequired !== false,
      paymentTerms: data.paymentTerms || '100% LC at Sight (Irrevocable & Confirmed)',
      incoterms: data.incoterms || 'CFR',
      additionalRequirements: data.additionalRequirements || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.requirements.unshift(newReq);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: 'New Buyer Requirement Submitted',
      message: `${user.companyName || user.name} posted demand for ${newReq.requiredQuantity} MT of ${newReq.materialName} for destination ${newReq.destinationPort}.`,
      type: 'INFO',
      linkUrl: '/admin/matching',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BUYER_REQUIREMENT_CREATED',
      entity: 'BuyerRequirement',
      entityId: newReq.id,
      newValue: `${newReq.requiredQuantity} MT ${newReq.materialName} @ Target $${newReq.targetPricePerUnit}/MT`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newReq);
  });

  // Admin / Buyer Update Requirement
  app.put('/api/requirements/:id', requireAuth, requireRole(['ADMIN', 'BUYER']), (req, res) => {
    const requirement = db.requirements.find((r) => r.id === req.params.id);
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    const allowed = ['materialName', 'commodityCategory', 'grade', 'requiredQuantity', 'targetPricePerUnit', 'destinationCountry', 'destinationPort', 'paymentTerms', 'incoterms', 'status', 'packaging', 'qualityRequirements', 'additionalRequirements'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        (requirement as any)[f] = req.body[f];
      }
    });
    requirement.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: (req as any).user.role,
      action: 'BUYER_REQUIREMENT_UPDATED',
      entity: 'BuyerRequirement',
      entityId: requirement.id,
      newValue: `Updated requirement: ${requirement.materialName} (${requirement.requiredQuantity} MT)`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(requirement);
  });

  // Admin / Buyer Delete Requirement
  app.delete('/api/requirements/:id', requireAuth, requireRole(['ADMIN', 'BUYER']), (req, res) => {
    const index = db.requirements.findIndex((r) => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Requirement not found.' });

    const removed = db.requirements[index];
    db.requirements.splice(index, 1);

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: (req as any).user.role,
      action: 'BUYER_REQUIREMENT_DELETED',
      entity: 'BuyerRequirement',
      entityId: removed.id,
      newValue: `Deleted requirement: ${removed.materialName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Requirement deleted successfully.' });
  });

  // --- AUTOMATED MATCHING ENGINE & WORKSPACE ---
  app.get('/api/matches', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const matches = db.computeMatches();
    res.json(matches);
  });

  app.post('/api/matches/analyze-ai', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { listingId, requirementId } = req.body;
    const listing = db.listings.find((l) => l.id === listingId);
    const reqItem = db.requirements.find((r) => r.id === requirementId);

    if (!listing || !reqItem) {
      return res.status(404).json({ error: 'Listing or Requirement not found for AI analysis.' });
    }

    const aiResult = await analyzeTradeMatchWithAI(
      {
        materialName: listing.materialName,
        commodity: listing.commodityCategory,
        grade: listing.grade,
        quantity: listing.quantity,
        price: listing.pricePerUnit,
        origin: listing.countryOfOrigin,
        port: listing.portOfShipping,
        incoterms: listing.incoterms,
      },
      {
        materialName: reqItem.materialName,
        commodity: reqItem.commodityCategory,
        grade: reqItem.grade,
        quantity: reqItem.requiredQuantity,
        targetPrice: reqItem.targetPricePerUnit,
        destinationPort: reqItem.destinationPort,
        incoterms: reqItem.incoterms,
      }
    );

    res.json(aiResult);
  });

  // Create Deal from Match Workspace
  app.post('/api/matches/create-deal', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const {
      listingId,
      requirementId,
      dealType,
      agentId,
      agentRatePerTon,
      purchasePricePerUnit,
      sellingPricePerUnit,
      quantity,
      freightCost,
      inspectionCost,
      incoterms,
    } = req.body;

    const listing = db.listings.find((l) => l.id === listingId);
    const reqItem = requirementId ? db.requirements.find((r) => r.id === requirementId) : null;

    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const dealQty = Number(quantity) || listing.quantity;
    const pPrice = Number(purchasePricePerUnit) || listing.pricePerUnit;
    const sPrice = Number(sellingPricePerUnit) || (reqItem ? reqItem.targetPricePerUnit : pPrice + 25);
    const agRate = Number(agentRatePerTon) || 15;
    const freight = Number(freightCost) || 0;
    const insp = Number(inspectionCost) || 0;

    const totalPurchase = dealQty * pPrice;
    const totalSales = dealQty * sPrice;
    const totalAgentComm = dealType === 'AGENT_TRADING' ? dealQty * agRate : 0;
    const grossMargin = totalSales - totalPurchase - freight - insp;
    const netMargin = grossMargin - totalAgentComm;

    const selectedAgent = agentId ? db.users.find((u) => u.id === agentId) : null;

    const newTxn: Transaction = {
      id: `txn-${Date.now().toString().slice(-4)}`,
      dealCode: `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
      listingId: listing.id,
      requirementId: reqItem?.id,
      supplierId: listing.supplierId,
      supplierName: listing.supplierCompanyName,
      buyerId: reqItem ? reqItem.buyerId : 'usr-buy-01',
      buyerName: reqItem ? reqItem.buyerCompanyName : 'Bharat Steelworks & Foundries Ltd',
      agentId: selectedAgent?.id,
      agentName: selectedAgent?.name,
      materialName: listing.materialName,
      commodity: listing.commodityCategory,
      grade: listing.grade,
      quantity: dealQty,
      unit: 'MT',
      purchasePricePerUnit: pPrice,
      sellingPricePerUnit: sPrice,
      currency: listing.currency,
      totalPurchaseValue: totalPurchase,
      totalSalesValue: totalSales,
      freightAndLogisticsCost: freight,
      inspectionAndInsuranceCost: insp,
      agentCommissionPerTon: agRate,
      totalAgentCommission: totalAgentComm,
      grossMargin,
      netMargin,
      status: 'IN_PROGRESS',
      type: dealType || 'DIRECT_TRADING',
      originPort: listing.portOfShipping,
      destinationPort: reqItem?.destinationPort || 'Nhava Sheva (JNPT Mumbai)',
      incoterms: incoterms || listing.incoterms,
      paymentStatus: 'ADVANCE_RECEIVED',
      shipmentStatus: 'CONTAINER_LOADED',
      contractNumber: `AST/CONT/2026/${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.transactions.unshift(newTxn);

    // If agent assigned, create assignment record
    if (selectedAgent) {
      const newAsg: AgentAssignment = {
        id: `asg-${Date.now().toString().slice(-4)}`,
        listingId: listing.id,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        agentEmail: selectedAgent.email,
        materialName: listing.materialName,
        commodity: listing.commodityCategory,
        quantityMT: dealQty,
        agentRatePerTon: agRate,
        calculatedAgentAmount: dealQty * agRate,
        commercialTerms: `Authorised target selling price $${sPrice}/MT. Destination: ${newTxn.destinationPort}. Payment: LC at Sight.`,
        targetSalesPrice: sPrice,
        currency: 'USD',
        status: 'ASSIGNED',
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.assignments.unshift(newAsg);

      // Notify Agent
      db.addNotification({
        recipientId: selectedAgent.id,
        recipientRole: 'AGENT',
        title: 'New Commercial Material Assigned',
        message: `Admin assigned ${dealQty} MT of ${listing.materialName}. Agent Rate: $${agRate}/MT (Total: $${dealQty * agRate}).`,
        type: 'DEAL',
        linkUrl: '/agent/assigned',
        priority: 'HIGH',
      });
    }

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'DEAL_CREATED',
      entity: 'Transaction',
      entityId: newTxn.id,
      newValue: `Deal ${newTxn.dealCode}: ${dealQty} MT @ Purchase $${pPrice}/MT, Sale $${sPrice}/MT. Margin: $${grossMargin}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newTxn);
  });

  // --- TRANSACTIONS LIFECYCLE ---
  app.get('/api/transactions', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role === 'ADMIN') {
      return res.json(db.transactions);
    }
    if (user.role === 'SUPPLIER') {
      return res.json(db.transactions.filter((t) => t.supplierId === user.id));
    }
    if (user.role === 'BUYER') {
      return res.json(db.transactions.filter((t) => t.buyerId === user.id));
    }
    if (user.role === 'AGENT') {
      return res.json(db.transactions.filter((t) => t.agentId === user.id));
    }
    res.json([]);
  });

  app.patch('/api/transactions/:id/status', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { status, paymentStatus, shipmentStatus } = req.body;
    const txn = db.transactions.find((t) => t.id === req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });

    const prev = txn.status;
    if (status) txn.status = status;
    if (paymentStatus) txn.paymentStatus = paymentStatus;
    if (shipmentStatus) txn.shipmentStatus = shipmentStatus;
    txn.updatedAt = new Date().toISOString();

    // If transaction marked SOLD or COMPLETED, update listing status as well
    if (status === 'SOLD' || status === 'COMPLETED') {
      const listing = db.listings.find((l) => l.id === txn.listingId);
      if (listing) {
        listing.status = 'SOLD';
        listing.updatedAt = new Date().toISOString();
      }
    }

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'TRANSACTION_STATUS_UPDATED',
      entity: 'Transaction',
      entityId: txn.id,
      previousValue: prev,
      newValue: `${status} (Payment: ${txn.paymentStatus}, Shipping: ${txn.shipmentStatus})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(txn);
  });

  app.post('/api/transactions/:id/cancel', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { reason, financialImpact, notes } = req.body;
    const txn = db.transactions.find((t) => t.id === req.params.id);
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });

    txn.status = 'CANCELLED';
    txn.cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      cancelledBy: (req as any).user.name,
      reason: reason || 'Commercial terms agreement expiration',
      financialImpact: Number(financialImpact) || 0,
      notes,
    };
    txn.updatedAt = new Date().toISOString();

    // Revert listing to AVAILABLE so it can be re-traded
    const listing = db.listings.find((l) => l.id === txn.listingId);
    if (listing) {
      listing.status = 'AVAILABLE';
    }

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'TRANSACTION_CANCELLED',
      entity: 'Transaction',
      entityId: txn.id,
      newValue: `Reason: ${reason}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(txn);
  });

  // --- AGENTS MANAGEMENT ---
  app.get('/api/agents', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const agents = db.users.filter((u) => u.role === 'AGENT');
    const enriched = agents.map((agent) => {
      const assignments = db.assignments.filter((a) => a.agentId === agent.id);
      const totalMTAssigned = assignments.reduce((acc, a) => acc + a.quantityMT, 0);
      const totalEarned = assignments
        .filter((a) => a.status === 'COMMERCIAL_CLOSED' || a.status === 'SOLD')
        .reduce((acc, a) => acc + a.calculatedAgentAmount, 0);
      const expectedEarned = assignments.reduce((acc, a) => acc + a.calculatedAgentAmount, 0);

      return {
        ...agent,
        totalMTAssigned,
        totalEarned,
        expectedEarned,
        activeAssignmentsCount: assignments.length,
      };
    });
    res.json(enriched);
  });

  app.get('/api/agent/assignments', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role === 'ADMIN') {
      return res.json(db.assignments);
    }
    if (user.role === 'AGENT') {
      return res.json(db.assignments.filter((a) => a.agentId === user.id));
    }
    res.status(403).json({ error: 'Unauthorized.' });
  });

  app.post('/api/agents/assign', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { listingId, agentId, quantityMT, agentRatePerTon, commercialTerms, targetSalesPrice } = req.body;
    const listing = db.listings.find((l) => l.id === listingId);
    const agent = db.users.find((u) => u.id === agentId && u.role === 'AGENT');

    if (!listing || !agent) {
      return res.status(404).json({ error: 'Listing or Agent not found.' });
    }

    const qty = Number(quantityMT) || listing.quantity;
    const rate = Number(agentRatePerTon) || 15; // in USD per MT
    const calcAmount = qty * rate; // Automated calculation: MT * ($/MT)

    const assignment: AgentAssignment = {
      id: `asg-${Date.now().toString().slice(-4)}`,
      listingId: listing.id,
      agentId: agent.id,
      agentName: agent.name,
      agentEmail: agent.email,
      materialName: listing.materialName,
      commodity: listing.commodityCategory,
      quantityMT: qty,
      agentRatePerTon: rate,
      calculatedAgentAmount: calcAmount,
      commercialTerms: commercialTerms || 'Target price aligned with FOB/CFR standard.',
      targetSalesPrice: Number(targetSalesPrice) || listing.pricePerUnit + 20,
      currency: 'USD',
      status: 'ASSIGNED',
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.assignments.unshift(assignment);
    listing.assignedAgentId = agent.id;
    listing.assignedAgentName = agent.name;
    listing.agentRatePerTon = rate;

    // Notify Agent
    db.addNotification({
      recipientId: agent.id,
      recipientRole: 'AGENT',
      title: 'Material Assigned by Trading Desk',
      message: `Assigned: ${qty} MT of ${listing.materialName}. Rate: $${rate}/MT (Potential Commission: $${calcAmount.toLocaleString()}).`,
      type: 'DEAL',
      linkUrl: '/agent/assigned',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'AGENT_ASSIGNED',
      entity: 'AgentAssignment',
      entityId: assignment.id,
      newValue: `Agent: ${agent.name}, Qty: ${qty} MT @ $${rate}/MT ($${calcAmount.toLocaleString()})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(assignment);
  });

  app.post('/api/agent/assignments/:id/update', requireAuth, requireRole(['AGENT', 'ADMIN']), (req, res) => {
    const { status, note } = req.body;
    const assignment = db.assignments.find((a) => a.id === req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

    if (status) assignment.status = status;
    if (note) assignment.latestUpdate = note;
    assignment.updatedAt = new Date().toISOString();

    // Admin Notification
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: 'Agent Sales Progress Update',
      message: `Agent ${assignment.agentName} updated ${assignment.materialName}: "${note || status}".`,
      type: 'INFO',
      linkUrl: '/admin/agents',
      priority: 'NORMAL',
    });

    res.json(assignment);
  });

  // --- COUNTERPARTIES (SUPPLIERS & BUYERS) ---
  app.get('/api/suppliers', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const suppliers = db.users.filter((u) => u.role === 'SUPPLIER');
    const enriched = suppliers.map((s) => {
      const userListings = db.listings.filter((l) => l.supplierId === s.id);
      const totalMT = userListings.reduce((acc, l) => acc + l.quantity, 0);
      const soldMT = userListings.filter((l) => l.status === 'SOLD').reduce((acc, l) => acc + l.quantity, 0);
      return {
        ...s,
        activeListingsCount: userListings.length,
        totalMTListed: totalMT,
        totalMTSold: soldMT,
      };
    });
    res.json(enriched);
  });

  app.get('/api/buyers', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const buyers = db.users.filter((u) => u.role === 'BUYER');
    const enriched = buyers.map((b) => {
      const userReqs = db.requirements.filter((r) => r.buyerId === b.id);
      const userInterests = db.interests.filter((i) => i.buyerId === b.id);
      const userTxns = db.transactions.filter((t) => t.buyerId === b.id);
      return {
        ...b,
        activeRequirementsCount: userReqs.length,
        totalInterestsCount: userInterests.length,
        completedDealsCount: userTxns.filter((t) => t.status === 'COMPLETED' || t.status === 'SOLD').length,
      };
    });
    res.json(enriched);
  });

  // Admin Add Counterparty
  app.post('/api/counterparties', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { role, email, name, companyName, phone, country, city, address, businessRegNumber, taxVatNumber, commodityCategories, status } = req.body;
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Role, Name, and Email are required.' });
    }
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'A counterparty with this email address already exists.' });
    }

    const newUser: User = {
      id: `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      email,
      name,
      role: role as UserRole,
      companyName: companyName || name,
      phone: phone || '',
      country: country || 'Qatar',
      city: city || 'Doha',
      address,
      businessRegNumber,
      taxVatNumber,
      commodityCategories: commodityCategories || ['Metal Scrap'],
      status: status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'COUNTERPARTY_CREATED',
      entity: 'User',
      entityId: newUser.id,
      newValue: `${role} - ${companyName || name} (${email})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newUser);
  });

  // Admin Update Counterparty
  app.put('/api/counterparties/:id', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Counterparty not found.' });

    const allowed = ['name', 'companyName', 'email', 'phone', 'country', 'city', 'address', 'businessRegNumber', 'taxVatNumber', 'commodityCategories', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'COUNTERPARTY_UPDATED',
      entity: 'User',
      entityId: user.id,
      newValue: `Updated ${user.name} (${user.companyName})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(user);
  });

  // Admin Delete / Remove Counterparty
  app.delete('/api/counterparties/:id', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const index = db.users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Counterparty not found.' });

    const removed = db.users[index];
    if (removed.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete primary Admin account.' });
    }

    db.users.splice(index, 1);
    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'COUNTERPARTY_DELETED',
      entity: 'User',
      entityId: removed.id,
      newValue: `Deleted ${removed.role}: ${removed.name} (${removed.companyName})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Counterparty deleted successfully.' });
  });

  // Admin Add Agent
  app.post('/api/agents', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const { email, name, phone, country, city, tradingRegion, languages, experienceYears } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Agent Name and Email are required.' });
    }
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An agent with this email address already exists.' });
    }

    const newAgent: User = {
      id: `usr-agt-${Date.now().toString().slice(-4)}`,
      email,
      name,
      role: 'AGENT',
      companyName: `${name} Brokerage Representation`,
      phone: phone || '',
      country: country || 'Qatar',
      city: city || 'Doha',
      tradingRegion: tradingRegion || 'GCC & MENA',
      languages: languages || ['English', 'Arabic', 'Hindi'],
      experienceYears: Number(experienceYears) || 3,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    db.users.push(newAgent);
    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'AGENT_CREATED',
      entity: 'User',
      entityId: newAgent.id,
      newValue: `Agent ${newAgent.name} (${email}) created by Admin`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newAgent);
  });

  // Admin Update Agent
  app.put('/api/agents/:id', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const agent = db.users.find((u) => u.id === req.params.id && u.role === 'AGENT');
    if (!agent) return res.status(404).json({ error: 'Agent not found.' });

    const allowed = ['name', 'email', 'phone', 'country', 'city', 'tradingRegion', 'languages', 'experienceYears', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (agent as any)[field] = req.body[field];
      }
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'AGENT_UPDATED',
      entity: 'User',
      entityId: agent.id,
      newValue: `Updated Agent ${agent.name}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(agent);
  });

  // Admin Delete Agent
  app.delete('/api/agents/:id', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const index = db.users.findIndex((u) => u.id === req.params.id && u.role === 'AGENT');
    if (index === -1) return res.status(404).json({ error: 'Agent not found.' });

    const removed = db.users[index];
    db.users.splice(index, 1);

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'AGENT_DELETED',
      entity: 'User',
      entityId: removed.id,
      newValue: `Deleted Agent: ${removed.name}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Agent deleted successfully.' });
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    let list: typeof db.notifications = [];
    if (user.role === 'ADMIN') {
      list = db.notifications.filter((n) => n.recipientId === 'ADMIN_ALL' || n.recipientRole === 'ADMIN' || n.recipientId === user.id);
    } else {
      list = db.notifications.filter((n) => n.recipientId === user.id || n.recipientRole === user.role || n.recipientId === 'ALL');
    }
    res.json(list);
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req, res) => {
    const notif = db.notifications.find((n) => n.id === req.params.id);
    if (notif) notif.isRead = true;
    res.json({ success: true });
  });

  app.patch('/api/notifications/read-all', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    db.notifications.forEach((n) => {
      if (user.role === 'ADMIN' && (n.recipientId === 'ADMIN_ALL' || n.recipientRole === 'ADMIN')) {
        n.isRead = true;
      } else if (n.recipientId === user.id) {
        n.isRead = true;
      }
    });
    res.json({ success: true });
  });

  // --- DOCUMENTS ---
  app.get('/api/documents', requireAuth, (req, res) => {
    const user = (req as any).user as User;
    if (user.role === 'ADMIN') {
      return res.json(db.documents);
    }
    return res.json(db.documents.filter((d) => d.accessRoles.includes(user.role)));
  });

  app.post('/api/documents', requireAuth, requireRole(['ADMIN', 'SUPPLIER', 'BUYER']), (req, res) => {
    const user = (req as any).user as User;
    const { title, documentType, fileName, fileSize, fileUrl, transactionId, listingId, accessRoles } = req.body;

    const doc: TradeDocument = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      transactionId,
      listingId,
      title: title || fileName || 'Trade Document',
      documentType: documentType || 'INSPECTION_REPORT',
      fileName: fileName || 'document.pdf',
      fileSize: fileSize || '1.2 MB',
      fileUrl: fileUrl || '#',
      uploadedBy: `${user.name} (${user.role})`,
      accessRoles: accessRoles || ['ADMIN', 'BUYER', 'SUPPLIER'],
      uploadedAt: new Date().toISOString(),
      status: user.role === 'ADMIN' ? 'VERIFIED' : 'DRAFT',
    };

    db.documents.unshift(doc);

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DOCUMENT_UPLOADED',
      entity: 'TradeDocument',
      entityId: doc.id,
      newValue: `${doc.title} (${doc.documentType})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(doc);
  });

  // --- AUDIT LOGS ---
  app.get('/api/audit-logs', requireAuth, requireRole(['ADMIN']), (req, res) => {
    res.json(db.auditLogs);
  });

  // --- ANALYTICS & REPORTS ---
  app.get('/api/analytics/summary', requireAuth, requireRole(['ADMIN']), (req, res) => {
    const totalSuppliers = db.users.filter((u) => u.role === 'SUPPLIER').length;
    const totalBuyers = db.users.filter((u) => u.role === 'BUYER').length;
    const totalAgents = db.users.filter((u) => u.role === 'AGENT').length;
    const activeListings = db.listings.filter((l) => l.status === 'AVAILABLE');
    const totalAvailableMT = activeListings.reduce((acc, l) => acc + l.quantity, 0);
    const activeDemands = db.requirements.filter((r) => r.status === 'ACTIVE');
    const totalDemandMT = activeDemands.reduce((acc, r) => acc + r.requiredQuantity, 0);

    const matches = db.computeMatches();
    const excellentMatches = matches.filter((m) => m.overallScore >= 90).length;

    const completedTxns = db.transactions.filter((t) => t.status === 'COMPLETED' || t.status === 'SOLD');
    const activeTxns = db.transactions.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'MATCHED' || t.status === 'NEGOTIATION');

    const totalSalesValue = db.transactions.reduce((acc, t) => acc + t.totalSalesValue, 0);
    const totalPurchaseValue = db.transactions.reduce((acc, t) => acc + t.totalPurchaseValue, 0);
    const totalGrossMargin = db.transactions.reduce((acc, t) => acc + t.grossMargin, 0);
    const totalAgentCommissions = db.transactions.reduce((acc, t) => acc + t.totalAgentCommission, 0);
    const soldMT = completedTxns.reduce((acc, t) => acc + t.quantity, 0);

    res.json({
      totalSuppliers,
      totalBuyers,
      totalAgents,
      activeListingsCount: activeListings.length,
      totalAvailableMT,
      activeDemandsCount: activeDemands.length,
      totalDemandMT,
      matchesCount: matches.length,
      excellentMatchesCount: excellentMatches,
      activeTransactionsCount: activeTxns.length,
      completedTransactionsCount: completedTxns.length,
      soldMT,
      totalSalesValue,
      totalPurchaseValue,
      totalGrossMargin,
      totalAgentCommissions,
    });
  });

  app.get('/api/analytics/charts', requireAuth, requireRole(['ADMIN']), (req, res) => {
    // Commodity Volume Breakdown
    const commodityMap: Record<string, { mt: number; value: number }> = {};
    db.listings.forEach((l) => {
      if (!commodityMap[l.commodityCategory]) {
        commodityMap[l.commodityCategory] = { mt: 0, value: 0 };
      }
      commodityMap[l.commodityCategory].mt += l.quantity;
      commodityMap[l.commodityCategory].value += l.quantity * l.pricePerUnit;
    });

    const commodityBreakdown = Object.keys(commodityMap).map((k) => ({
      name: k,
      volumeMT: commodityMap[k].mt,
      valueUSD: commodityMap[k].value,
    }));

    // Monthly Trading Trend (Mock realistic trend)
    const monthlyTrends = [
      { month: 'Mar', purchaseUSD: 310000, salesUSD: 345000, marginUSD: 28000, volumeMT: 950 },
      { month: 'Apr', purchaseUSD: 420000, salesUSD: 468000, marginUSD: 36000, volumeMT: 1200 },
      { month: 'May', purchaseUSD: 380000, salesUSD: 425000, marginUSD: 32000, volumeMT: 1100 },
      { month: 'Jun', purchaseUSD: 510000, salesUSD: 572000, marginUSD: 44000, volumeMT: 1450 },
      { month: 'Jul', purchaseUSD: 630000, salesUSD: 705000, marginUSD: 55000, volumeMT: 1800 },
      { month: 'Aug', purchaseUSD: 740000, salesUSD: 830000, marginUSD: 68000, volumeMT: 2150 },
    ];

    // Country distribution
    const countryMap: Record<string, number> = {};
    db.listings.forEach((l) => {
      countryMap[l.countryOfOrigin] = (countryMap[l.countryOfOrigin] || 0) + l.quantity;
    });
    const countryDistribution = Object.keys(countryMap).map((k) => ({
      country: k,
      volumeMT: countryMap[k],
    }));

    res.json({
      commodityBreakdown,
      monthlyTrends,
      countryDistribution,
    });
  });

  // --- SYSTEM SETTINGS ---
  app.get('/api/settings', requireAuth, (req, res) => {
    res.json(db.settings);
  });

  app.put('/api/settings', requireAuth, requireRole(['ADMIN']), (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'SYSTEM_SETTINGS_UPDATED',
      entity: 'SystemSettings',
      entityId: 'global-settings',
      newValue: `Updated company/agent trading defaults`,
      ipAddress: req.ip || '127.0.0.1',
    });
    res.json(db.settings);
  });

  // --- AI UTILITIES ---
  app.post('/api/ai/normalize-commodity', requireAuth, async (req, res) => {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ error: 'rawText is required.' });
    const normalized = await normalizeCommodityWithAI(rawText);
    res.json({ original: rawText, normalized });
  });

  // --- VITE MIDDLEWARE FOR FRONTEND ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AL SHAHEED RECYCLING PLATFORM] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
