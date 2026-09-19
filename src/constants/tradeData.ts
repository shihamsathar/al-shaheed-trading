/**
 * Al Shaheed Trading and Equipment Co.
 * Master Constants, Commodities, Global Ports, Incoterms & Demo Data Seed
 */

import { ScrapListing, BuyerRequirement, User, Transaction, AgentAssignment, TradeDocument, Notification, AuditLog, SystemSettings } from '../types';

export const COMPANY_INFO = {
  name: 'AL SHAHEED TRADING AND EQUIPMENT CO',
  shortName: 'Al Shaheed Recycling',
  tagline: 'Global Scrap Trading. Smarter Supply. Reliable Demand.',
  website: 'www.alshaheedrecycling.com',
  websiteUrl: 'https://www.alshaheedrecycling.com',
  email: 'alshaheedrecycling@gmail.com',
  phone1: '+974 30437712',
  phone2: '+974 30437733',
  address: 'Building 45, Street 810, Industrial Area, Zone 57, Doha, State of Qatar',
  country: 'Qatar',
  city: 'Doha',
};

export const COMMODITY_CATEGORIES = [
  'Metal Scrap',
  'Paper Waste',
  'Industrial Recyclables & Equipment',
  'Plastic Recyclables',
  'Machinery & Heavy Equipment',
];

export const COMMODITY_CATEGORIES_DATA = [
  {
    id: 'metal-scrap',
    name: 'Metal Scrap',
    description: 'Ferrous & non-ferrous industrial metals, shredded steel, copper cathodes, and aluminum scrap.',
    subcategories: [
      'HMS 1&2 (80:20 / 90:10)',
      'HMS 1 (Heavy Melting Scrap 1)',
      'HMS 2 (Heavy Melting Scrap 2)',
      'Shredded Steel Scrap 211',
      'Cast Iron Scrap',
      'Stainless Steel 304 / 316',
      'Copper Cathode / Birch / Cliff',
      'Aluminium Tense / Tabor / Extrusion 6063',
      'Brass Scrap (Honey / Ocean)',
      'Zinc Scrap',
      'Mixed Metal Scrap (Zorba / Zurik)',
    ],
  },
  {
    id: 'paper-waste',
    name: 'Paper Waste',
    description: 'Baled recyclable paper, OCC cardboard, ONP, and clean bleached pulp grades.',
    subcategories: [
      'OCC (Old Corrugated Cardboard - Grade 11 / 12)',
      'ONP (Old Newspapers)',
      'Mixed Paper Scrap',
      'White Office Paper (Sorted Office Paper - SOP)',
      'Hard White Shavings (HWS)',
      'Magazine Scrap (OMG)',
      'Kraft Paper & Multiwall Bag Waste',
      'Pulp & Paper Mill Broke',
    ],
  },
  {
    id: 'industrial-recyclables',
    name: 'Industrial Recyclables & Equipment',
    description: 'Industrial scrap, HDPE/PET baled plastics, tires, and retired decommissioning machinery.',
    subcategories: [
      'HDPE Regrind & Bales (Blow & Injection)',
      'PET Flakes & Bales',
      'LDPE Film Scrap 98/2',
      'Decommissioned Plant Equipment & Machinery',
      'Used Rails (R50 / R65)',
    ],
  },
];

export const INCOTERMS = ['CFR', 'CIF', 'FOB', 'EXW', 'FCA', 'CIP', 'DAP'];
export const INCOTERMS_OPTIONS = INCOTERMS;

export const PORTS_OF_SHIPPING = [
  'Hamad Port (Doha)',
  'Ras Laffan Port',
  'Jebel Ali Port (Dubai)',
  'Khalifa Port (Abu Dhabi)',
  'King Abdulaziz Port (Dammam)',
  'Port of Rotterdam',
  'Port of Antwerp',
  'Port of Houston',
];

export const DESTINATION_PORTS = [
  'Nhava Sheva (JNPT Mumbai)',
  'Mundra Port (Gujarat)',
  'Chennai Port',
  'Chittagong (Chattogram) Port',
  'Port Qasim (Karachi)',
  'Aliaga Port (Izmir)',
  'Iskenderun Port',
  'Hai Phong Port',
  'Ho Chi Minh Port (Cat Lai)',
  'Alexandria Port',
];

export const GLOBAL_PORTS = [
  { country: 'Qatar', port: 'Hamad Port (Doha)' },
  { country: 'Qatar', port: 'Ras Laffan Port' },
  { country: 'United Arab Emirates', port: 'Jebel Ali Port (Dubai)' },
  { country: 'United Arab Emirates', port: 'Khalifa Port (Abu Dhabi)' },
  { country: 'Saudi Arabia', port: 'King Abdulaziz Port (Dammam)' },
  { country: 'Saudi Arabia', port: 'Jeddah Islamic Port' },
  { country: 'India', port: 'Nhava Sheva (JNPT Mumbai)' },
  { country: 'India', port: 'Mundra Port (Gujarat)' },
  { country: 'India', port: 'Chennai Port' },
  { country: 'Bangladesh', port: 'Chittagong (Chattogram) Port' },
  { country: 'Pakistan', port: 'Port Qasim (Karachi)' },
  { country: 'Turkey', port: 'Aliaga Port (Izmir)' },
  { country: 'Turkey', port: 'Iskenderun Port' },
  { country: 'Vietnam', port: 'Hai Phong Port' },
  { country: 'Vietnam', port: 'Ho Chi Minh Port (Cat Lai)' },
  { country: 'Egypt', port: 'Alexandria Port' },
  { country: 'Netherlands', port: 'Port of Rotterdam' },
  { country: 'Germany', port: 'Port of Hamburg' },
  { country: 'Belgium', port: 'Port of Antwerp' },
  { country: 'United States', port: 'Port of Houston' },
  { country: 'United States', port: 'Port of Los Angeles' },
  { country: 'China', port: 'Ningbo-Zhoushan Port' },
  { country: 'China', port: 'Shanghai Port' },
];

export const COUNTRIES_LIST = [
  'Qatar', 'United Arab Emirates', 'Saudi Arabia', 'Oman', 'Kuwait', 'Bahrain',
  'India', 'Bangladesh', 'Pakistan', 'Turkey', 'Egypt', 'Vietnam', 'Indonesia',
  'Malaysia', 'Thailand', 'South Korea', 'Japan', 'China', 'Germany', 'Netherlands',
  'Belgium', 'United Kingdom', 'United States', 'Canada', 'South Africa',
];

export const PAYMENT_TERMS_OPTIONS = [
  '100% LC at Sight (Irrevocable & Confirmed)',
  '30% TT Advance + 70% against BL copy',
  '20% TT Advance + 80% LC at Sight',
  'Cash Against Documents (CAD)',
  '100% Advance Wire Transfer',
];

export const PACKAGING_OPTIONS = [
  'Loose in 20ft Dry Cargo Container (Approx 25-28 MT)',
  'Hydraulically Compressed Bales (Avg 500-800 kg/bale)',
  'Bundles strapped with high-tensile steel wire',
  'Bulk Vessel Load (3,000 - 15,000 MT charter)',
  'Big Bags (Jumbo Bags 1.0 - 1.5 MT)',
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  companyName: COMPANY_INFO.name,
  logoUrl: '/logo.svg',
  website: COMPANY_INFO.website,
  email: COMPANY_INFO.email,
  phone1: COMPANY_INFO.phone1,
  phone2: COMPANY_INFO.phone2,
  address: COMPANY_INFO.address,
  defaultAgentRatePerTon: 15, // $15 / MT default
  tradingCurrencies: ['USD', 'QAR', 'EUR', 'AED', 'SAR', 'INR', 'GBP', 'CNY'],
  primaryCurrency: 'USD',
  minMatchScoreThreshold: 65,
  autoMatchNotification: true,
};

// Clean Administrator Account (No sample counterparties)
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@alshaheedrecycling.com',
    name: 'admin',
    role: 'ADMIN',
    companyName: 'Al Shaheed Trading and Equipment Co',
    phone: '+974 30437712',
    country: 'Qatar',
    city: 'Doha',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
  },
];

// Fresh Clean Slate: No sample listings, requirements, deals, assignments, or documents
export const INITIAL_LISTINGS: ScrapListing[] = [];

export const INITIAL_REQUIREMENTS: BuyerRequirement[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_AGENT_ASSIGNMENTS: AgentAssignment[] = [];

export const INITIAL_DOCUMENTS: TradeDocument[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
