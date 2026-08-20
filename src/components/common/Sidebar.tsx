import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  ArrowLeftRight,
  ShoppingBag,
  TrendingUp,
  Users,
  Building2,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
  PlusCircle,
  PackageCheck,
  FileSearch,
  DollarSign,
  Compass,
  CheckCircle,
  HelpCircle,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  matchCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  matchCount = 0,
}) => {
  const { role, user, logout } = useAuth();

  // Navigation Items per Role
  const adminNav = [
    { section: 'MANAGED DESK' },
    { id: 'admin-dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'admin-matching', label: 'AI Matching Engine', icon: Layers, badge: matchCount > 0 ? `${matchCount}` : undefined },
    { id: 'admin-marketplace', label: 'Global Marketplace', icon: Boxes },
    { id: 'admin-transactions', label: 'Deals & Settlement', icon: ArrowLeftRight },
    { section: 'PARTNER NETWORK' },
    { id: 'admin-counterparties', label: 'Suppliers & Buyers', icon: Building2 },
    { id: 'admin-agents', label: 'Agent Brokerage', icon: Users },
    { section: 'COMPLIANCE & AUDIT' },
    { id: 'admin-documents', label: 'Trade Documents', icon: FileText },
    { id: 'admin-reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'admin-audit-logs', label: 'Audit Trail Logs', icon: ShieldCheck },
    { id: 'admin-settings', label: 'System Settings', icon: Settings },
  ];

  const supplierNav = [
    { section: 'SUPPLY DESK' },
    { id: 'supplier-dashboard', label: 'Supplier Dashboard', icon: LayoutDashboard },
    { id: 'supplier-listings', label: 'My Scrap Lots', icon: Boxes },
    { id: 'supplier-add-listing', label: 'List New Material', icon: PlusCircle },
    { section: 'MARKET OPPORTUNITIES' },
    { id: 'supplier-demands', label: 'Buyer Demands Feed', icon: FileSearch },
    { id: 'supplier-transactions', label: 'Sales & Settlements', icon: ArrowLeftRight },
  ];

  const buyerNav = [
    { section: 'PROCUREMENT DESK' },
    { id: 'buyer-dashboard', label: 'Buyer Dashboard', icon: LayoutDashboard },
    { id: 'buyer-marketplace', label: 'Explore Scrap Marketplace', icon: Boxes },
    { id: 'buyer-requirements', label: 'Post Buy Demand', icon: PlusCircle },
    { section: 'ORDERS & SHIPMENTS' },
    { id: 'buyer-transactions', label: 'Orders & Settlements', icon: PackageCheck },
  ];

  const agentNav = [
    { section: 'BROKERAGE DESK' },
    { id: 'agent-dashboard', label: 'Agent Command Center', icon: LayoutDashboard },
    { id: 'agent-assigned-materials', label: 'Assigned Materials', icon: Boxes },
    { id: 'agent-commission-ledger', label: 'Commissions & Ledger', icon: DollarSign },
  ];

  let currentNav = adminNav;
  if (role === 'SUPPLIER') currentNav = supplierNav;
  else if (role === 'BUYER') currentNav = buyerNav;
  else if (role === 'AGENT') currentNav = agentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar-navigation"
        className={`fixed top-26 lg:top-28 bottom-0 left-0 z-40 w-68 bg-slate-950/95 text-slate-200 border-r border-emerald-900/30 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between shadow-2xl backdrop-blur-2xl`}
      >
        {/* Navigation List */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
          {/* Official Brand Header */}
          <div className="px-1 py-2 mb-3 border-b border-emerald-900/30">
            <Logo size="sm" showTagline={false} />
          </div>

          <div className="px-3 py-2 mb-2 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">
                {role} DESK
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Doha QTR</span>
          </div>

          {currentNav.map((item: any, idx) => {
            if (item.section) {
              return (
                <div
                  key={`sec-${idx}`}
                  className="pt-4 pb-1.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-xs bg-emerald-500/40" />
                  <span>{item.section}</span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-900/60 to-emerald-950/40 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950 shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Support & Corporate Badge */}
        <div className="p-4 bg-slate-950/90 border-t border-emerald-900/30 mt-auto space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
            </div>
            <div className="text-xs flex-1 min-w-0">
              <p className="font-bold text-white truncate">{user?.name || 'Al Shaheed'}</p>
              <p className="text-[10px] text-emerald-400/90 font-mono truncate">
                {user?.companyName || 'Enterprise Member'}
              </p>
            </div>
          </div>

          <button
            id="sidebar-signout-btn"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>
    </>
  );
};
