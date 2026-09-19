import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Building2,
  ShoppingCart,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Menu,
  TrendingUp,
  TrendingDown,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { INITIAL_USERS } from '../../constants/tradeData';

interface HeaderProps {
  onToggleSidebar?: () => void;
  activeViewTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeViewTitle }) => {
  const {
    user,
    role,
    logout,
    switchDemoUser,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllAsRead,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live Real-Time Global Commodity & Freight Ticker Benchmarks
  const tickerItems = [
    { label: 'HMS 1/2 (80:20) CFR Nhava Sheva', price: '$395/MT', change: '+1.8%', isUp: true },
    { label: 'Copper Millberry 99.9%', price: '$9,280/MT', change: '+0.9%', isUp: true },
    { label: 'OCC Grade 11 Bales CFR Chittagong', price: '$185/MT', change: '+0.5%', isUp: true },
    { label: 'Shredded Steel 211 CFR Aliaga', price: '$415/MT', change: '-0.3%', isUp: false },
    { label: 'Aluminium UBC Bales CFR Mundra', price: '$1,860/MT', change: '+2.1%', isUp: true },
    { label: 'Doha Hamad -> JNPT Freight (20ft)', price: '$650/TEU', change: 'Stable', isUp: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-emerald-900/30 transition-all">
      {/* High-End Global Commodity Ticker Bar */}
      <div className="bg-slate-950/95 border-b border-emerald-950/60 px-4 py-1.5 overflow-hidden flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider shrink-0 pr-2 border-r border-emerald-900/50">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '18s' }} />
            <span>Live Trade Desk Ticker</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
            {tickerItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="text-slate-400 font-medium">{item.label}:</span>
                <span className="text-white font-mono font-bold">{item.price}</span>
                <span
                  className={`inline-flex items-center text-[10px] font-bold ${
                    item.isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.isUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Trade Support Hotline */}
        <div className="hidden lg:flex items-center gap-2 pl-4 shrink-0 border-l border-emerald-900/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-300 font-semibold">Al Shaheed Industrial Exchange</span>
        </div>
      </div>

      {/* Main Spacious Header Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-4">
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Logo size="md" />

          {activeViewTitle && (
            <div className="hidden md:flex items-center gap-2.5 pl-5 ml-2 border-l border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
                {activeViewTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Office Contact, Notifications, User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-emerald-900/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-slate-300">Doha HQ: +974 30437712</span>
          </div>

          {/* Notification Center Popover */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all shadow-xs"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-emerald-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-950 shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Menu Dropdown */}
            {showNotifications && (
              <div
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Trade Desk Alerts</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      id="mark-all-read-btn"
                      onClick={() => markAllAsRead()}
                      className="text-xs font-semibold text-emerald-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No active alerts for this desk.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3.5 text-xs transition-colors cursor-pointer ${
                          notif.isRead
                            ? 'bg-slate-900/50 text-slate-400'
                            : 'bg-emerald-950/30 text-slate-200 font-medium'
                        } hover:bg-slate-800/80`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-white leading-tight">
                            {notif.title}
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="mt-1 text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Bar in Header */}
          <div className="hidden lg:flex items-center bg-slate-900/90 border border-emerald-900/40 rounded-xl p-1 gap-1 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">Desk:</span>
            {[
              { id: 'ADMIN', label: 'Admin', icon: ShieldCheck, color: 'text-amber-400' },
              { id: 'SUPPLIER', label: 'Supplier', icon: Building2, color: 'text-blue-400' },
              { id: 'BUYER', label: 'Buyer', icon: ShoppingCart, color: 'text-emerald-400' },
              { id: 'AGENT', label: 'Agent', icon: Briefcase, color: 'text-purple-400' },
            ].map((r) => {
              const Icon = r.icon;
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  id={`header-switch-role-${r.id.toLowerCase()}`}
                  onClick={() => switchDemoUser(r.id)}
                  title={`Instant switch to ${r.label} Desk`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : r.color}`} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              id="user-profile-menu-button"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl border border-emerald-900/40 bg-slate-900/80 hover:bg-slate-800/90 transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md shadow-emerald-950/60">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {showUserMenu && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 rounded-xl mb-2">
                  <p className="text-xs font-bold text-white">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{user?.email}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified {role} Desk
                  </div>
                </div>

                <div className="space-y-1 py-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Institutional Entity
                  </div>
                  <div className="px-3 py-1 text-xs text-slate-200 font-medium truncate">
                    {user?.companyName || 'Al Shaheed Trading & Equipment'}
                  </div>
                  <div className="px-3 py-0.5 text-xs text-slate-400">
                    {user?.country || 'Qatar'} &bull; {user?.city || 'Doha'}
                  </div>
                </div>

                {/* Instant Role Switcher Section inside Dropdown */}
                <div className="border-t border-slate-800 my-2 pt-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Instant Desk Switcher</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800 font-mono">1-Click</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 mt-1">
                    <button
                      id="dropdown-switch-role-admin"
                      onClick={() => {
                        switchDemoUser('ADMIN');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        role === 'ADMIN'
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div className="truncate">
                        <div>Admin</div>
                        <div className="text-[9px] opacity-75 font-normal">Pricing &amp; Oversight</div>
                      </div>
                    </button>

                    <button
                      id="dropdown-switch-role-supplier"
                      onClick={() => {
                        switchDemoUser('SUPPLIER');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        role === 'SUPPLIER'
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <div className="truncate">
                        <div>Supplier</div>
                        <div className="text-[9px] opacity-75 font-normal">List Lots &amp; Dispatch</div>
                      </div>
                    </button>

                    <button
                      id="dropdown-switch-role-buyer"
                      onClick={() => {
                        switchDemoUser('BUYER');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        role === 'BUYER'
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div>Buyer</div>
                        <div className="text-[9px] opacity-75 font-normal">Browse &amp; Bid</div>
                      </div>
                    </button>

                    <button
                      id="dropdown-switch-role-agent"
                      onClick={() => {
                        switchDemoUser('AGENT');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center gap-1.5 p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                        role === 'AGENT'
                          ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <div>Agent</div>
                        <div className="text-[9px] opacity-75 font-normal">Commissions &amp; Lots</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-2 pt-2">
                  <button
                    id="logout-btn"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Desk</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
