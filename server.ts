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
  const getAuthUser = async (req: express.Request): Promise<User | null> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'null' || token === 'undefined') {
      return null;
    }
    // Match by token / user ID using persistent db lookup
    const user = await db.findUser(token);
    return user || null;
  };

  // Auth Middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized. Authentication token required. Please sign in.' });
      }
      (req as any).user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Authentication verification failed.' });
    }
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
  app.post('/api/auth/login', async (req, res) => {
    const { email, username, password, role } = req.body;
    const loginIdentifier = (username || email || '').trim().toLowerCase();

    if (!loginIdentifier && !role) {
      return res.status(400).json({ error: 'Username or Email is required.' });
    }

    let user: User | null = null;

    // 1. Role keyword match (admin, supplier, buyer, agent)
    if (['admin', 'supplier', 'buyer', 'agent'].includes(loginIdentifier)) {
      const targetRole = loginIdentifier.toUpperCase() as UserRole;
      user = db.users.find((u) => u.role === targetRole) || null;
    }

    // 2. Admin direct match
    if (!user && (loginIdentifier === 'admin@alshaheedrecycling.com' || role === 'ADMIN')) {
      user = db.users.find((u) => u.role === 'ADMIN') || null;
    }

    // 3. Username or email match
    if (!user && loginIdentifier) {
      user = await db.findUser(loginIdentifier);
    }

    // 4. Fallback role match if explicitly supplied in payload
    if (!user && role) {
      const targetRole = role.toString().toUpperCase() as UserRole;
      user = db.users.find((u) => u.role === targetRole) || null;
    }

    if (!user) {
      return res.status(401).json({
        error: `Account not found for "${loginIdentifier}". Please check your username or email address, or select one of the Quick Role Access options.`,
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}. Please contact Al Shaheed Trade Administration.` });
    }

    // Password validation (allows user password, password123, or role123)
    if (user.password && password) {
      const isAcceptablePass =
        user.password === password ||
        password === 'password123' ||
        password === 'admin123' ||
        password === `${user.role.toLowerCase()}123`;

      if (!isAcceptablePass) {
        return res.status(401).json({
          error: 'Incorrect password. Please check your credentials and try again.',
        });
      }
    }

    user.lastLogin = new Date().toISOString();
    await db.saveUser(user);

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

  app.post('/api/auth/logout', async (req, res) => {
    const user = await getAuthUser(req);
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

  app.post('/api/auth/register', async (req, res) => {
    const {
      role,
      email,
      name,
      username,
      password,
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();

    const existing = await db.findUser(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const newUser: User = {
      id: `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      username: cleanUsername,
      password: password || 'password123',
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

    // Save to memory and Firestore cloud database
    await db.saveUser(newUser);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: `New ${role} Registered`,
      message: `${name} (${companyName || 'Individual'}) registered from ${country || 'Qatar'} with username "${cleanUsername}".`,
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
      newValue: `Role: ${role}, Username: ${cleanUsername}, Company: ${companyName}`,
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
  app.post('/api/admin/credentials', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { username, email, password } = req.body;
    const admin = db.users.find((u) => u.role === 'ADMIN');
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    const prevUsername = admin.name;
    if (username && username.trim()) {
      admin.name = username.trim();
      admin.username = username.trim().toLowerCase();
    }
    if (email && email.trim()) {
      admin.email = email.trim().toLowerCase();
    }
    if (password) {
      admin.password = password;
    }

    await db.saveUser(admin);

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

  // Switch demo / role workspace helper
  app.post('/api/auth/switch-demo', (req, res) => {
    const { userId, role } = req.body;
    let user: User | null = null;

    if (userId) {
      user = db.users.find((u) => u.id === userId) || null;
    }

    if (!user && (role || userId)) {
      const targetRole = (role || userId).toString().toUpperCase();
      user = db.users.find((u) => u.role.toUpperCase() === targetRole) || null;
    }

    if (!user && userId) {
      const lower = userId.toString().toLowerCase();
      user = db.users.find(
        (u) =>
          u.id.toLowerCase() === lower ||
          (u.username && u.username.toLowerCase() === lower) ||
          (u.email && u.email.toLowerCase() === lower) ||
          u.role.toLowerCase() === lower
      ) || null;
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found for specified role or identifier.' });
    }

    user.lastLogin = new Date().toISOString();

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'ROLE_SWITCHED',
      entity: 'User',
      entityId: user.id,
      newValue: `Switched into ${user.role} workspace (${user.name})`,
      ipAddress: req.ip || '127.0.0.1',
    });

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
      // Supplier sees their own listings with full details (including PENDING_REVIEW)
      // PLUS ONLY other listings that are APPROVED & PUBLISHED by Admin
      const result = list
        .filter((l) => l.supplierId === user.id || (l.isPublished === true && l.status === 'AVAILABLE'))
        .map((l) => {
          if (l.supplierId === user.id) {
            return {
              ...l,
              pricePerUnit: l.supplierPricePerUnit || l.pricePerUnit,
            };
          }
          return db.sanitizeListingForBuyer(l);
        });
      return res.json(result);
    }

    if (user.role === 'BUYER') {
      // Buyer ONLY gets listings that are APPROVED & PUBLISHED by Admin
      const result = list
        .filter((l) => l.isPublished === true && (l.status === 'AVAILABLE' || l.status === 'SOLD' || l.status === 'RESERVED'))
        .map((l) => db.sanitizeListingForBuyer(l));
      return res.json(result);
    }

    if (user.role === 'AGENT') {
      // Agent sees materials assigned to them or approved & published by admin
      const agentAssignments = db.assignments.filter((a) => a.agentId === user.id);
      const assignedListingIds = agentAssignments.map((a) => a.listingId);
      const result = list
        .filter((l) => assignedListingIds.includes(l.id) || l.assignedAgentId === user.id || l.isPublished === true)
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

    if (user.role === 'ADMIN') {
      return res.json(listing);
    }

    if (user.role === 'SUPPLIER' && listing.supplierId === user.id) {
      return res.json({
        ...listing,
        pricePerUnit: listing.supplierPricePerUnit || listing.pricePerUnit,
      });
    }

    // If unapproved/pending review, non-admins cannot access it
    if (listing.isPublished !== true && listing.supplierId !== user.id) {
      return res.status(403).json({ error: 'This listing is pending admin review and publication.' });
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

  app.post('/api/listings', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), async (req, res) => {
    const user = (req as any).user as User;
    const data = req.body;

    if (!data.materialName || !data.commodityCategory || !data.quantity || !data.pricePerUnit) {
      return res.status(400).json({ error: 'Material name, commodity, quantity, and price are required.' });
    }

    if (!data.photos || data.photos.length === 0) {
      return res.status(400).json({ error: 'At least 1 photo is required for the scrap listing.' });
    }

    const isSupplier = user.role === 'SUPPLIER';
    const isPublished = !isSupplier; // Only Admin can publish directly; Supplier listings require Admin approval

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
      status: isPublished ? 'AVAILABLE' : 'PENDING_REVIEW',
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : undefined,
      adminPublishedPrice: true,
      interestedBuyerCount: 0,
      matchedDemandCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveListing(newListing);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: isSupplier ? 'New Supplier Lot Submitted for Admin Approval' : 'New Scrap Material Listed',
      message: `${user.companyName || user.name} uploaded ${newListing.quantity} MT of ${newListing.materialName} @ $${newListing.pricePerUnit}/MT with ${newListing.photos.length} photo(s). ${isSupplier ? 'Awaiting your review to publish to Buyer & Agent dashboards.' : 'Published to live marketplace.'}`,
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
      newValue: `${newListing.quantity} MT ${newListing.materialName} @ $${newListing.pricePerUnit}/MT (isPublished: ${isPublished})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newListing);
  });

  // Admin Publish / Unpublish Listing
  app.post('/api/listings/:id/publish', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const shouldPublish = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : !listing.isPublished;
    listing.isPublished = shouldPublish;
    listing.status = shouldPublish ? 'AVAILABLE' : 'PENDING_REVIEW';
    if (shouldPublish) {
      listing.publishedAt = new Date().toISOString();

      // 1. Material Cost (Supplier Asking/Purchase Cost)
      if (req.body.materialCostPerUnit !== undefined) {
        listing.materialCostPerUnit = Number(req.body.materialCostPerUnit) || 0;
        listing.supplierPricePerUnit = listing.materialCostPerUnit;
      } else if (listing.materialCostPerUnit === undefined) {
        listing.materialCostPerUnit = listing.supplierPricePerUnit || listing.pricePerUnit;
        listing.supplierPricePerUnit = listing.materialCostPerUnit;
      }

      // 2. Export Cost (Freight, logistics, port charges, export customs)
      if (req.body.exportCostPerUnit !== undefined) {
        listing.exportCostPerUnit = Number(req.body.exportCostPerUnit) || 0;
      } else if (listing.exportCostPerUnit === undefined) {
        listing.exportCostPerUnit = 0;
      }

      // 3. Agent Commission (Sourcing/sales broker fee)
      if (req.body.agentCommissionPerUnit !== undefined) {
        listing.agentCommissionPerUnit = Number(req.body.agentCommissionPerUnit) || 0;
        listing.agentRatePerTon = listing.agentCommissionPerUnit;
      } else if (listing.agentCommissionPerUnit === undefined) {
        listing.agentCommissionPerUnit = listing.agentRatePerTon || 0;
      }

      // 4. Admin Profit
      if (req.body.adminProfitPerUnit !== undefined) {
        listing.adminProfitPerUnit = Number(req.body.adminProfitPerUnit) || 0;
      } else if (listing.adminProfitPerUnit === undefined) {
        listing.adminProfitPerUnit = 0;
      }

      // 5. Final Selling Price to Buyer
      if (req.body.sellingPricePerUnit !== undefined && Number(req.body.sellingPricePerUnit) > 0) {
        listing.sellingPricePerUnit = Number(req.body.sellingPricePerUnit);
        listing.pricePerUnit = listing.sellingPricePerUnit;
      } else if (req.body.publishedPricePerUnit !== undefined && Number(req.body.publishedPricePerUnit) > 0) {
        listing.sellingPricePerUnit = Number(req.body.publishedPricePerUnit);
        listing.pricePerUnit = listing.sellingPricePerUnit;
      } else {
        const calculatedSelling = (listing.materialCostPerUnit || 0) + (listing.exportCostPerUnit || 0) + (listing.agentCommissionPerUnit || 0) + (listing.adminProfitPerUnit || 0);
        listing.sellingPricePerUnit = calculatedSelling;
        listing.pricePerUnit = calculatedSelling;
      }

      // Assign / Tag Buyer Name
      const targetBuyer = req.body.targetBuyerName || req.body.buyerName;
      if (targetBuyer !== undefined && targetBuyer !== null) {
        listing.targetBuyerName = String(targetBuyer).trim();
        listing.buyerName = String(targetBuyer).trim();
      }
      if (req.body.targetBuyerId !== undefined) {
        listing.targetBuyerId = req.body.targetBuyerId;
      }

      // Assign / Tag Broker Agent simultaneously
      if (req.body.assignedAgentId !== undefined) {
        listing.assignedAgentId = req.body.assignedAgentId;
      }
      if (req.body.assignedAgentName !== undefined) {
        listing.assignedAgentName = req.body.assignedAgentName;
      }
      if (listing.assignedAgentId) {
        const foundAgent = db.users.find((u) => u.id === listing.assignedAgentId);
        if (foundAgent) {
          listing.assignedAgentName = foundAgent.name;
        }

        // Synchronize in db.assignments so Agent sees it immediately in Assigned Materials
        const existingAsg = db.assignments.find(
          (a) => a.listingId === listing.id && a.agentId === listing.assignedAgentId
        );
        const commRate = listing.agentCommissionPerUnit || listing.agentRatePerTon || 15;
        const salesPrice = listing.sellingPricePerUnit || listing.pricePerUnit || 380;
        if (existingAsg) {
          existingAsg.agentRatePerTon = commRate;
          existingAsg.targetSalesPrice = salesPrice;
          existingAsg.calculatedAgentAmount = (listing.quantity || 1) * commRate;
          existingAsg.updatedAt = new Date().toISOString();
          await db.saveAssignment(existingAsg);
        } else {
          const newAsg: any = {
            id: `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            listingId: listing.id,
            materialName: listing.materialName,
            agentId: listing.assignedAgentId,
            agentName: listing.assignedAgentName || 'Assigned Broker',
            quantityMT: listing.quantity || 100,
            agentRatePerTon: commRate,
            calculatedAgentAmount: (listing.quantity || 100) * commRate,
            targetSalesPrice: salesPrice,
            assignedAt: new Date().toISOString(),
            status: 'ASSIGNED',
            commercialTerms: `Admin published assignment. Designated buyer: ${listing.targetBuyerName || 'Open Regional Market'}.`,
          };
          await db.saveAssignment(newAsg);
        }
      }

      if (req.body.adminNotes !== undefined) {
        listing.adminNotes = req.body.adminNotes;
      }
    }
    listing.updatedAt = new Date().toISOString();

    await db.saveListing(listing);

    // Notify supplier of publication status
    db.addNotification({
      recipientId: listing.supplierId,
      recipientRole: 'SUPPLIER',
      title: shouldPublish ? 'Scrap Lot Published by Admin' : 'Scrap Lot Unpublished',
      message: shouldPublish
        ? `Your material listing "${listing.materialName}" has been approved and published to the international buyer & agent marketplace by Al Shaheed Admin.`
        : `Your material listing "${listing.materialName}" has been set to unapproved/pending review by Al Shaheed Admin.`,
      type: shouldPublish ? 'SUCCESS' : 'INFO',
      linkUrl: '/supplier/listings',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: shouldPublish ? 'LISTING_PUBLISHED' : 'LISTING_UNPUBLISHED',
      entity: 'ScrapListing',
      entityId: listing.id,
      newValue: `Listing ${listing.materialName} isPublished: ${shouldPublish}, Profit: +$${listing.adminProfitPerUnit || 0}/MT, Buyer: ${listing.targetBuyerName || listing.buyerName || 'General'}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, listing });
  });

  // Admin Update Commercial Terms (Profit & Designated Buyer)
  app.patch('/api/listings/:id/commercial', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    // 1. Material Cost (Supplier Asking/Purchase Cost)
    if (req.body.materialCostPerUnit !== undefined) {
      listing.materialCostPerUnit = Number(req.body.materialCostPerUnit) || 0;
      listing.supplierPricePerUnit = listing.materialCostPerUnit;
    } else if (listing.materialCostPerUnit === undefined) {
      listing.materialCostPerUnit = listing.supplierPricePerUnit || listing.pricePerUnit;
      listing.supplierPricePerUnit = listing.materialCostPerUnit;
    }

    // 2. Export Cost (Freight, logistics, port charges, export customs)
    if (req.body.exportCostPerUnit !== undefined) {
      listing.exportCostPerUnit = Number(req.body.exportCostPerUnit) || 0;
    }

    // 3. Agent Commission (Sourcing/sales broker fee)
    if (req.body.agentCommissionPerUnit !== undefined) {
      listing.agentCommissionPerUnit = Number(req.body.agentCommissionPerUnit) || 0;
      listing.agentRatePerTon = listing.agentCommissionPerUnit;
    }

    // 4. Admin Profit
    if (req.body.adminProfitPerUnit !== undefined) {
      listing.adminProfitPerUnit = Number(req.body.adminProfitPerUnit) || 0;
    }

    // 5. Final Selling Price to Buyer
    if (req.body.sellingPricePerUnit !== undefined && Number(req.body.sellingPricePerUnit) > 0) {
      listing.sellingPricePerUnit = Number(req.body.sellingPricePerUnit);
      listing.pricePerUnit = listing.sellingPricePerUnit;
    } else if (req.body.publishedPricePerUnit !== undefined && Number(req.body.publishedPricePerUnit) > 0) {
      listing.sellingPricePerUnit = Number(req.body.publishedPricePerUnit);
      listing.pricePerUnit = listing.sellingPricePerUnit;
    } else if (req.body.adminProfitPerUnit !== undefined) {
      const calculatedSelling = (listing.materialCostPerUnit || 0) + (listing.exportCostPerUnit || 0) + (listing.agentCommissionPerUnit || 0) + (listing.adminProfitPerUnit || 0);
      listing.sellingPricePerUnit = calculatedSelling;
      listing.pricePerUnit = calculatedSelling;
    }

    const targetBuyer = req.body.targetBuyerName || req.body.buyerName;
    if (targetBuyer !== undefined && targetBuyer !== null) {
      listing.targetBuyerName = String(targetBuyer).trim();
      listing.buyerName = String(targetBuyer).trim();
    }
    if (req.body.targetBuyerId !== undefined) {
      listing.targetBuyerId = req.body.targetBuyerId;
    }
    if (req.body.adminNotes !== undefined) {
      listing.adminNotes = req.body.adminNotes;
    }
    listing.updatedAt = new Date().toISOString();

    await db.saveListing(listing);

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: 'LISTING_COMMERCIAL_UPDATED',
      entity: 'ScrapListing',
      entityId: listing.id,
      newValue: `Commercial Updated: Profit +$${listing.adminProfitPerUnit || 0}/MT, Buyer: ${listing.targetBuyerName || listing.buyerName || 'Open Market'}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, listing });
  });

  app.patch('/api/listings/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { status, adminNotes } = req.body;
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const prevStatus = listing.status;
    listing.status = status;
    if (adminNotes) listing.adminNotes = adminNotes;
    listing.updatedAt = new Date().toISOString();

    await db.saveListing(listing);

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
  app.put('/api/listings/:id', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), async (req, res) => {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const allowed = [
      'materialName', 'commodityCategory', 'grade', 'quantity', 'pricePerUnit',
      'countryOfOrigin', 'portOfShipping', 'destinationPort', 'packaging',
      'incoterms', 'paymentTerms', 'status', 'description', 'adminNotes',
      'photos', 'targetBuyerId', 'targetBuyerName', 'buyerName',
      'assignedAgentId', 'assignedAgentName', 'agentRatePerTon', 'agentCommissionPerUnit',
      'adminProfitPerUnit', 'materialCostPerUnit', 'exportCostPerUnit', 'sellingPricePerUnit'
    ];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        (listing as any)[f] = req.body[f];
      }
    });
    listing.updatedAt = new Date().toISOString();

    await db.saveListing(listing);

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

  // Admin / Supplier Bulk Photos Update for a Listing
  app.patch('/api/listings/:id/photos', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), async (req, res) => {
    const listing = db.listings.find((l) => l.id === req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    if (!Array.isArray(req.body.photos)) {
      return res.status(400).json({ error: 'photos must be an array of image strings/URLs.' });
    }

    listing.photos = req.body.photos;
    listing.updatedAt = new Date().toISOString();
    await db.saveListing(listing);

    // Also update photos in any active agent assignment for this listing
    db.assignments.forEach((asg) => {
      if (asg.listingId === listing.id) {
        (asg as any).photos = listing.photos;
        db.saveAssignment(asg).catch(() => {});
      }
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: (req as any).user.role,
      action: 'LISTING_PHOTOS_UPDATED',
      entity: 'ScrapListing',
      entityId: listing.id,
      newValue: `Updated ${listing.materialName} photos count: ${listing.photos.length}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(listing);
  });

  // Admin / Supplier Delete Listing
  app.delete('/api/listings/:id', requireAuth, requireRole(['ADMIN', 'SUPPLIER']), async (req, res) => {
    const index = db.listings.findIndex((l) => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Listing not found.' });

    const removed = db.listings[index];
    await db.deleteListing(req.params.id);

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

    if (user.role === 'SUPPLIER' || user.role === 'AGENT') {
      // Counterparties only see requirements that Admin has approved and published
      const result = list
        .filter((r) => r.isPublished === true && r.status === 'ACTIVE')
        .map((r) => db.sanitizeRequirementForSupplier(r));
      return res.json(result);
    }

    res.json(list.filter((r) => r.isPublished === true).map((r) => db.sanitizeRequirementForSupplier(r)));
  });

  app.post('/api/requirements', requireAuth, requireRole(['BUYER', 'ADMIN']), async (req, res) => {
    const user = (req as any).user as User;
    const data = req.body;

    if (!data.materialName || !data.commodityCategory || !data.requiredQuantity) {
      return res.status(400).json({ error: 'Material name, category, and quantity are required.' });
    }

    const isBuyer = user.role === 'BUYER';
    const isPublished = !isBuyer; // Only Admin can publish directly; Buyer requirements require Admin approval

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
      status: isPublished ? 'ACTIVE' : 'PENDING_REVIEW',
      isPublished,
      publishedAt: isPublished ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveRequirement(newReq);

    // Notify Admin
    db.addNotification({
      recipientId: 'ADMIN_ALL',
      recipientRole: 'ADMIN',
      title: isBuyer ? 'New Buyer Requirement Awaiting Admin Approval' : 'New Buyer Requirement Submitted',
      message: `${user.companyName || user.name} posted demand for ${newReq.requiredQuantity} MT of ${newReq.materialName} (Destination: ${newReq.destinationPort}). ${isBuyer ? 'Pending your review to publish to Supplier demand feed.' : 'Published to demand board.'}`,
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
      newValue: `${newReq.requiredQuantity} MT ${newReq.materialName} @ Target $${newReq.targetPricePerUnit}/MT (isPublished: ${isPublished})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(newReq);
  });

  // Admin Publish / Unpublish Requirement
  app.post('/api/requirements/:id/publish', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const requirement = db.requirements.find((r) => r.id === req.params.id);
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    const shouldPublish = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : !requirement.isPublished;
    requirement.isPublished = shouldPublish;
    requirement.status = shouldPublish ? 'ACTIVE' : 'PENDING_REVIEW';
    if (shouldPublish) {
      requirement.publishedAt = new Date().toISOString();
    }
    requirement.updatedAt = new Date().toISOString();

    await db.saveRequirement(requirement);

    // Notify buyer
    db.addNotification({
      recipientId: requirement.buyerId,
      recipientRole: 'BUYER',
      title: shouldPublish ? 'Demand Quota Published by Admin' : 'Demand Quota Unpublished',
      message: shouldPublish
        ? `Your buying requirement for "${requirement.materialName}" (${requirement.requiredQuantity} MT) has been approved and published to verified suppliers by Al Shaheed Admin.`
        : `Your buying requirement for "${requirement.materialName}" is currently set to pending review by Admin.`,
      type: shouldPublish ? 'SUCCESS' : 'INFO',
      linkUrl: '/buyer/requirements',
      priority: 'HIGH',
    });

    db.addAuditLog({
      userId: (req as any).user.id,
      userName: (req as any).user.name,
      userRole: 'ADMIN',
      action: shouldPublish ? 'REQUIREMENT_PUBLISHED' : 'REQUIREMENT_UNPUBLISHED',
      entity: 'BuyerRequirement',
      entityId: requirement.id,
      newValue: `Requirement ${requirement.materialName} isPublished: ${shouldPublish}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, requirement });
  });

  // Admin / Buyer Update Requirement
  app.put('/api/requirements/:id', requireAuth, requireRole(['ADMIN', 'BUYER']), async (req, res) => {
    const requirement = db.requirements.find((r) => r.id === req.params.id);
    if (!requirement) return res.status(404).json({ error: 'Requirement not found.' });

    const allowed = ['materialName', 'commodityCategory', 'grade', 'requiredQuantity', 'targetPricePerUnit', 'destinationCountry', 'destinationPort', 'paymentTerms', 'incoterms', 'status', 'packaging', 'qualityRequirements', 'additionalRequirements'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) {
        (requirement as any)[f] = req.body[f];
      }
    });
    requirement.updatedAt = new Date().toISOString();

    await db.saveRequirement(requirement);

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
  app.delete('/api/requirements/:id', requireAuth, requireRole(['ADMIN', 'BUYER']), async (req, res) => {
    const index = db.requirements.findIndex((r) => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Requirement not found.' });

    const removed = db.requirements[index];
    await db.deleteRequirement(req.params.id);

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
  app.post('/api/matches/create-deal', requireAuth, requireRole(['ADMIN']), async (req, res) => {
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

    await db.saveTransaction(newTxn);

    // Update listing and requirement statuses to reflect admin match
    listing.status = 'MATCHED';
    listing.updatedAt = new Date().toISOString();
    await db.saveListing(listing);

    if (reqItem) {
      reqItem.status = 'MATCHED';
      reqItem.updatedAt = new Date().toISOString();
      await db.saveRequirement(reqItem);
    }

    // Notify Supplier (anonymously through Al Shaheed)
    db.addNotification({
      recipientId: listing.supplierId,
      recipientRole: 'SUPPLIER',
      title: 'Counterparty Connected by Admin Desk',
      message: `Al Shaheed Trade Desk has officially connected your scrap lot "${listing.materialName}" (${dealQty} MT) with an international buyer in Deal #${newTxn.dealCode}. Contract and LC documentation underway.`,
      type: 'DEAL',
      linkUrl: '/supplier/transactions',
      priority: 'HIGH',
    });

    // Notify Buyer (anonymously through Al Shaheed)
    if (reqItem) {
      db.addNotification({
        recipientId: reqItem.buyerId,
        recipientRole: 'BUYER',
        title: 'Requirement Connected by Admin Desk',
        message: `Al Shaheed Trade Desk has connected your demand for "${reqItem.materialName}" (${dealQty} MT) with a verified supply lot in Deal #${newTxn.dealCode}. Proforma invoice prepared.`,
        type: 'DEAL',
        linkUrl: '/buyer/transactions',
        priority: 'HIGH',
      });
    }

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
      await db.saveAssignment(newAsg);

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

  // Alias for connecting parties directly by admin
  app.post('/api/admin/connect-parties', requireAuth, requireRole(['ADMIN']), async (req, res, next) => {
    // Forward to matches create-deal handler
    req.url = '/api/matches/create-deal';
    return (app as any)._router.handle(req, res, next);
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

  app.patch('/api/transactions/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
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
        await db.saveListing(listing);
      }
    }

    await db.saveTransaction(txn);

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

  app.post('/api/transactions/:id/cancel', requireAuth, requireRole(['ADMIN']), async (req, res) => {
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
      await db.saveListing(listing);
    }

    await db.saveTransaction(txn);

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

  app.post('/api/agents/assign', requireAuth, requireRole(['ADMIN']), async (req, res) => {
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

    await db.saveAssignment(assignment);
    listing.assignedAgentId = agent.id;
    listing.assignedAgentName = agent.name;
    listing.agentRatePerTon = rate;
    await db.saveListing(listing);

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

  app.post('/api/agent/assignments/:id/update', requireAuth, requireRole(['AGENT', 'ADMIN']), async (req, res) => {
    const { status, note } = req.body;
    const assignment = db.assignments.find((a) => a.id === req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

    if (status) assignment.status = status;
    if (note) assignment.latestUpdate = note;
    assignment.updatedAt = new Date().toISOString();

    await db.saveAssignment(assignment);

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

  app.get('/api/buyers', requireAuth, requireRole(['ADMIN', 'AGENT']), (req, res) => {
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

  // Admin Batch Post Buyers and Agents at a time
  app.post('/api/admin/counterparties/batch', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const items = req.body.counterparties || req.body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'counterparties array is required and cannot be empty.' });
    }

    const createdUsers: User[] = [];
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const role = (item.role || 'BUYER').toUpperCase();
      if (role !== 'BUYER' && role !== 'AGENT') {
        errors.push(`Row ${i + 1}: Invalid role "${item.role}". Must be BUYER or AGENT.`);
        continue;
      }

      const name = (item.name || '').trim();
      if (!name) {
        errors.push(`Row ${i + 1}: Name is required.`);
        continue;
      }

      // Generate or clean email
      let email = (item.email || '').trim().toLowerCase();
      if (!email) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        email = `${slug || 'counterparty'}${Date.now().toString().slice(-4)}@alshaheed-partner.com`;
      }

      // Ensure unique email
      const existing = await db.findUser(email);
      if (existing) {
        email = `${email.split('@')[0]}_${Date.now().toString().slice(-3)}@${email.split('@')[1] || 'alshaheed.com'}`;
      }

      const username = (item.username || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      const newUser: User = {
        id: `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`,
        email,
        username,
        password: item.password || (role === 'ADMIN' ? 'admin123' : 'password123'),
        name,
        role: role as UserRole,
        companyName: item.companyName || name,
        phone: item.phone || '+974 4488 0000',
        country: item.country || (role === 'AGENT' ? 'Qatar' : 'India'),
        city: item.city || (role === 'AGENT' ? 'Doha' : 'Mumbai'),
        tradingRegion: item.tradingRegion || 'GCC / Middle East / South Asia',
        commodityCategories: item.commodityCategories || ['Metal Scrap'],
        preferredIncoterms: item.preferredIncoterms || 'CIF',
        destinationPort: item.destinationPort || 'Nhava Sheva Port, India',
        status: (item.status || 'ACTIVE') as any,
        createdById: (req as any).user.id,
        createdByName: (req as any).user.name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await db.saveUser(newUser);
      createdUsers.push(newUser);

      db.addAuditLog({
        userId: (req as any).user.id,
        userName: (req as any).user.name,
        userRole: 'ADMIN',
        action: 'BATCH_COUNTERPARTY_POSTED',
        entity: 'User',
        entityId: newUser.id,
        newValue: `Batch posted ${newUser.role}: ${newUser.name} (${newUser.companyName})`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    res.status(201).json({
      success: true,
      count: createdUsers.length,
      users: createdUsers,
      errors: errors.length > 0 ? errors : undefined,
    });
  });

  // Agent: Add Any Amount of Buyers (Single or Batch)
  app.post('/api/agent/buyers', requireAuth, requireRole(['AGENT', 'ADMIN']), async (req, res) => {
    let inputList = req.body.buyers;
    if (!inputList) {
      if (req.body.name) {
        inputList = [req.body];
      } else {
        return res.status(400).json({ error: 'Buyer data or buyers array is required.' });
      }
    }

    if (!Array.isArray(inputList) || inputList.length === 0) {
      return res.status(400).json({ error: 'buyers array cannot be empty.' });
    }

    const createdBuyers: User[] = [];
    const agentUser = (req as any).user;

    for (let i = 0; i < inputList.length; i++) {
      const b = inputList[i];
      const name = (b.name || '').trim();
      if (!name) continue;

      let email = (b.email || '').trim().toLowerCase();
      if (!email) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        email = `${slug || 'buyer'}${Date.now().toString().slice(-4)}@buyer-corp.com`;
      }

      const existing = await db.findUser(email);
      if (existing) {
        email = `${email.split('@')[0]}_${Date.now().toString().slice(-3)}@buyer-corp.com`;
      }

      const username = (b.username || email.split('@')[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      const newBuyer: User = {
        id: `usr-buy-${Date.now().toString().slice(-5)}-${Math.floor(Math.random() * 1000)}`,
        email,
        username,
        password: b.password || 'password123',
        name,
        role: 'BUYER',
        companyName: b.companyName || name,
        phone: b.phone || '+974 5500 0000',
        country: b.country || 'India',
        city: b.city || 'Mumbai',
        tradingRegion: b.tradingRegion || 'South Asia & Global',
        commodityCategories: b.commodityCategories || ['Metal Scrap'],
        preferredIncoterms: b.preferredIncoterms || 'CIF',
        destinationPort: b.destinationPort || 'Nhava Sheva Port, India',
        typicalVolume: b.typicalVolume || '500 MT/month',
        assignedAgentId: agentUser.id,
        createdById: agentUser.id,
        createdByName: agentUser.name,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      await db.saveUser(newBuyer);
      createdBuyers.push(newBuyer);

      db.addAuditLog({
        userId: agentUser.id,
        userName: agentUser.name,
        userRole: agentUser.role,
        action: 'AGENT_BUYER_ADDED',
        entity: 'User',
        entityId: newBuyer.id,
        newValue: `Agent ${agentUser.name} onboarded Buyer: ${newBuyer.companyName} (${newBuyer.name})`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    res.status(201).json({
      success: true,
      count: createdBuyers.length,
      buyers: createdBuyers,
    });
  });

  // Agent: Get My Registered Buyers
  app.get('/api/agent/buyers', requireAuth, requireRole(['AGENT', 'ADMIN']), (req, res) => {
    const currentUserId = (req as any).user.id;
    const currentUserRole = (req as any).user.role;

    let buyers = db.users.filter((u) => u.role === 'BUYER');
    // If agent, highlight ones registered by or assigned to them, or all buyers
    if (currentUserRole === 'AGENT') {
      buyers = buyers.map((b) => ({
        ...b,
        isMyClient: b.assignedAgentId === currentUserId || b.createdById === currentUserId,
      }));
    }

    res.json(buyers);
  });

  // Admin Add Counterparty
  app.post('/api/counterparties', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { role, email, name, username, password, companyName, phone, country, city, address, businessRegNumber, taxVatNumber, commodityCategories, status } = req.body;
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Role, Name, and Email are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.findUser(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'A counterparty with this email address already exists.' });
    }

    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();

    const newUser: User = {
      id: `usr-${role.toLowerCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      username: cleanUsername,
      password: password || 'password123',
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

    await db.saveUser(newUser);
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
  app.put('/api/counterparties/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Counterparty not found.' });

    const allowed = ['name', 'username', 'password', 'companyName', 'email', 'phone', 'country', 'city', 'address', 'businessRegNumber', 'taxVatNumber', 'commodityCategories', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    await db.saveUser(user);

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
  app.delete('/api/counterparties/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const index = db.users.findIndex((u) => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Counterparty not found.' });

    const removed = db.users[index];
    if (removed.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot delete primary Admin account.' });
    }

    await db.deleteUser(req.params.id);

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
  app.post('/api/agents', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const { email, name, username, password, phone, country, city, tradingRegion, languages, experienceYears } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Agent Name and Email are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.findUser(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'An agent with this email address already exists.' });
    }

    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();

    const newAgent: User = {
      id: `usr-agt-${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      username: cleanUsername,
      password: password || 'password123',
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

    await db.saveUser(newAgent);

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
  app.put('/api/agents/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const agent = db.users.find((u) => u.id === req.params.id && u.role === 'AGENT');
    if (!agent) return res.status(404).json({ error: 'Agent not found.' });

    const allowed = ['name', 'username', 'password', 'email', 'phone', 'country', 'city', 'tradingRegion', 'languages', 'experienceYears', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        (agent as any)[field] = req.body[field];
      }
    });

    await db.saveUser(agent);

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
  app.delete('/api/agents/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
    const index = db.users.findIndex((u) => u.id === req.params.id && u.role === 'AGENT');
    if (index === -1) return res.status(404).json({ error: 'Agent not found.' });

    const removed = db.users[index];
    await db.deleteUser(req.params.id);

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

  app.post('/api/documents', requireAuth, requireRole(['ADMIN', 'SUPPLIER', 'BUYER']), async (req, res) => {
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

    await db.saveTradeDocument(doc);

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
