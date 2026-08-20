import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AuthPortal } from './components/auth/AuthPortal';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminMarketplace } from './components/admin/AdminMarketplace';
import { AdminMatchingWorkspace } from './components/admin/AdminMatchingWorkspace';
import { AdminTransactions } from './components/admin/AdminTransactions';
import { AdminAgents } from './components/admin/AdminAgents';
import { AdminCounterparties } from './components/admin/AdminCounterparties';
import { AdminDocuments } from './components/admin/AdminDocuments';
import { AdminReports } from './components/admin/AdminReports';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminSettings } from './components/admin/AdminSettings';

// Supplier Views
import { SupplierDashboard } from './components/supplier/SupplierDashboard';
import { SupplierMyListings } from './components/supplier/SupplierMyListings';
import { SupplierAddListing } from './components/supplier/SupplierAddListing';
import { SupplierDemandFeed } from './components/supplier/SupplierDemandFeed';
import { SupplierTransactions } from './components/supplier/SupplierTransactions';

// Buyer Views
import { BuyerDashboard } from './components/buyer/BuyerDashboard';
import { BuyerMarketplace } from './components/buyer/BuyerMarketplace';
import { BuyerMyRequirements } from './components/buyer/BuyerMyRequirements';
import { BuyerTransactions } from './components/buyer/BuyerTransactions';

// Agent Views
import { AgentDashboard } from './components/agent/AgentDashboard';
import { AgentAssignedMaterials } from './components/agent/AgentAssignedMaterials';
import { AgentCommissionLedger } from './components/agent/AgentCommissionLedger';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    switch (user?.role) {
      case 'SUPPLIER':
        return 'supplier-dashboard';
      case 'BUYER':
        return 'buyer-dashboard';
      case 'AGENT':
        return 'agent-dashboard';
      case 'ADMIN':
      default:
        return 'admin-dashboard';
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync tab when user changes role
  React.useEffect(() => {
    if (user?.role === 'SUPPLIER' && !activeTab.startsWith('supplier')) {
      setActiveTab('supplier-dashboard');
    } else if (user?.role === 'BUYER' && !activeTab.startsWith('buyer')) {
      setActiveTab('buyer-dashboard');
    } else if (user?.role === 'AGENT' && !activeTab.startsWith('agent')) {
      setActiveTab('agent-dashboard');
    } else if (user?.role === 'ADMIN' && !activeTab.startsWith('admin')) {
      setActiveTab('admin-dashboard');
    }
  }, [user?.role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 font-sans relative overflow-hidden">
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-600/30 animate-pulse">
            AS
          </div>
          <div className="text-center">
            <h2 className="font-black text-xl text-slate-900 tracking-wide">
              AL SHAHEED TRADING &amp; EQUIPMENT CO.
            </h2>
            <p className="text-xs text-emerald-700 font-mono mt-1.5 tracking-wider font-bold">
              INITIALIZING GLOBAL COMMODITIES &amp; SCRAP TRADING TERMINAL...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render the full AuthPortal (Login/Register)
  if (!user) {
    return <AuthPortal />;
  }

  const renderContent = () => {
    switch (activeTab) {
      // Admin
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'admin-marketplace':
        return <AdminMarketplace />;
      case 'admin-matching':
        return <AdminMatchingWorkspace />;
      case 'admin-transactions':
        return <AdminTransactions />;
      case 'admin-agents':
        return <AdminAgents />;
      case 'admin-counterparties':
        return <AdminCounterparties />;
      case 'admin-documents':
        return <AdminDocuments />;
      case 'admin-reports':
        return <AdminReports />;
      case 'admin-audit-logs':
        return <AdminAuditLogs />;
      case 'admin-settings':
        return <AdminSettings />;

      // Supplier
      case 'supplier-dashboard':
        return <SupplierDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'supplier-listings':
        return <SupplierMyListings onNavigate={(tab) => setActiveTab(tab)} />;
      case 'supplier-add-listing':
        return <SupplierAddListing onNavigate={(tab) => setActiveTab(tab)} />;
      case 'supplier-demands':
        return <SupplierDemandFeed />;
      case 'supplier-transactions':
        return <SupplierTransactions />;

      // Buyer
      case 'buyer-dashboard':
        return <BuyerDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'buyer-marketplace':
        return <BuyerMarketplace />;
      case 'buyer-requirements':
        return <BuyerMyRequirements />;
      case 'buyer-transactions':
        return <BuyerTransactions />;

      // Agent
      case 'agent-dashboard':
        return <AgentDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'agent-assigned-materials':
        return <AgentAssignedMaterials />;
      case 'agent-commission-ledger':
        return <AgentCommissionLedger />;

      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070d0d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 relative">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:ml-68 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
