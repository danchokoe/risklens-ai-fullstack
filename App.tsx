
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RiskRegister from './components/RiskRegister';
import PolicyIntelligence from './components/PolicyIntelligence';
import AuditCoPilot from './components/AuditCoPilot';
import Reporting from './components/Reporting';
import RegMonitoring from './components/RegMonitoring';
import ActionTracking from './components/ActionTracking';
import DocumentManagement from './components/DocumentManagement';
import AssetRegistry from './components/AssetRegistry';
import VulnerabilityScanner from './components/VulnerabilityScanner';
import IncidentManagement from './components/IncidentManagement';
import UserManagement from './components/UserManagement';
import AiAuditTrail from './components/AiAuditTrail';
import AboutSolution from './components/AboutSolution';
import MarketplaceListing from './components/MarketplaceListing';
import Login from './components/Login';
import OnboardingTour from './components/OnboardingTour';
import { User, UserRole, AiAuditLog, Notification } from './types';
import { MOCK_DOCUMENTS, MOCK_POLICIES } from './constants';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Critical Risk Detected', description: 'New RCE vulnerability found on Mainframe Node.', type: 'critical', time: '2m ago' },
  { id: 2, title: 'Audit SLA Warning', description: 'User Access Review is 24h from breach.', type: 'warning', time: '1h ago' },
  { id: 3, title: 'Regulatory Update', description: 'POPI Act Section 72 requires policy sync.', type: 'info', time: '3h ago' },
  { id: 4, title: 'New Document for Review', description: 'Cloud Security Standard awaits your signature.', type: 'info', time: '5h ago' },
];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'System Admin': ['dashboard', 'risks', 'policies', 'documents', 'assets', 'vulnerabilities', 'incidents', 'audit', 'regulatory', 'reporting', 'actions', 'users', 'auditTrail', 'marketplace', 'about'],
  'CRO': ['dashboard', 'risks', 'policies', 'documents', 'audit', 'regulatory', 'reporting', 'users', 'auditTrail', 'marketplace', 'about'],
  'Risk Manager': ['dashboard', 'risks', 'policies', 'documents', 'actions', 'assets', 'vulnerabilities', 'incidents', 'marketplace', 'about'],
  'Compliance Officer': ['dashboard', 'policies', 'regulatory', 'documents', 'audit', 'marketplace', 'about'],
  'Internal Auditor': ['dashboard', 'audit', 'documents', 'risks', 'vulnerabilities', 'auditTrail', 'marketplace', 'about'],
  'Board Member': ['dashboard', 'reporting', 'risks', 'policies', 'marketplace', 'about']
};

const AppContent: React.FC = () => {
  const { user: currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AiAuditLog[]>([]);
  const [isTourActive, setIsTourActive] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Proactive Lifecycle Reminders (2-month threshold)
  useEffect(() => {
    if (!currentUser) return;

    // Check if this is a first-time login for the session
    const hasSeenTour = sessionStorage.getItem(`has_seen_tour_${currentUser.id}`);
    if (!hasSeenTour) {
      setIsTourActive(true);
    }

    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(today.getMonth() + 2);

    const lifecycleReminders: Notification[] = [];

    // Scan Documents
    MOCK_DOCUMENTS.forEach(doc => {
      const nextReview = new Date(doc.nextReviewDate);
      if (nextReview <= twoMonthsFromNow && nextReview >= today) {
        lifecycleReminders.push({
          id: `lifecycle-doc-${doc.id}`,
          title: 'Upcoming PDF Review',
          description: `Policy "${doc.title}" review is due on ${doc.nextReviewDate}. 2-month threshold breached.`,
          type: 'warning',
          time: 'System generated'
        });
      }
    });

    // Scan Policies
    MOCK_POLICIES.forEach(pol => {
      const nextReview = new Date(pol.nextReviewDate);
      if (nextReview <= twoMonthsFromNow && nextReview >= today) {
        lifecycleReminders.push({
          id: `lifecycle-pol-${pol.id}`,
          title: 'Mandatory Policy Audit',
          description: `${pol.type} "${pol.name}" requires formal review by ${pol.nextReviewDate}.`,
          type: 'warning',
          time: 'System generated'
        });
      }
    });

    if (lifecycleReminders.length > 0) {
      setNotifications(prev => [...lifecycleReminders, ...prev]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleAuditLog = (event: any) => {
      if (!currentUser) return;
      const newLog: AiAuditLog = {
        ...event.detail,
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: currentUser.id,
        userName: currentUser.name
      };
      setAuditLogs(prev => [newLog, ...prev]);
    };

    window.addEventListener('ai-audit-log', handleAuditLog);
    return () => window.removeEventListener('ai-audit-log', handleAuditLog);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentUser && !ROLE_PERMISSIONS[currentUser.role].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
    showToast("Notifications cleared", "info");
  };

  const handleTourComplete = () => {
    if (currentUser) {
      sessionStorage.setItem(`has_seen_tour_${currentUser.id}`, 'true');
    }
    setIsTourActive(false);
    setActiveTab('dashboard');
    showToast("Onboarding Complete. Ready for enterprise operations.", "success");
  };

  if (!currentUser) {
    return <Login />;
  }

  const navigateTo = (tab: string) => {
    if (ROLE_PERMISSIONS[currentUser.role].includes(tab)) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast("Access Restricted: Permission Level Insufficient", "info");
    }
    setIsNotificationsOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
      case 'risks': return <RiskRegister />;
      case 'policies': return <PolicyIntelligence />;
      case 'documents': return <DocumentManagement currentUser={currentUser} onToast={showToast} />;
      case 'assets': return <AssetRegistry />;
      case 'vulnerabilities': return <VulnerabilityScanner />;
      case 'incidents': return <IncidentManagement onToast={showToast} />;
      case 'audit': return <AuditCoPilot onToast={showToast} />;
      case 'reporting': return <Reporting onToast={showToast} />;
      case 'regulatory': return <RegMonitoring />;
      case 'actions': return <ActionTracking onToast={showToast} />;
      case 'users': return <UserManagement currentUser={currentUser} onToast={showToast} />;
      case 'auditTrail': return <AiAuditTrail logs={auditLogs} />;
      case 'marketplace': return <MarketplaceListing />;
      case 'about': return <AboutSolution />;
      default: return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500 selection:text-white">
      {isTourActive && (
        <OnboardingTour 
          role={currentUser.role} 
          activeTab={activeTab} 
          onNavigate={navigateTo}
          onComplete={handleTourComplete} 
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={navigateTo} 
        user={currentUser}
        onLogout={logout}
      />
      
      <main className="ml-64 p-8 transition-all">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative z-[60]">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Instance: Chokoe Group</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsTourActive(true)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 transition-all flex items-center gap-2"
            >
              ❓ Help Tour
            </button>
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Alert Terminal</h4>
                    <button 
                      onClick={clearNotifications}
                      className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className={`text-[10px] font-black uppercase tracking-widest ${notif.type === 'critical' ? 'text-red-600' : notif.type === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}>
                              {notif.title}
                            </h5>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{notif.time}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-600 leading-relaxed group-hover:text-slate-900">{notif.description}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">System Clear</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => navigateTo('dashboard')}
                      className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-[0.2em]"
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-600/20">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-black text-slate-800 tracking-tight leading-none uppercase">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        {toast && (
          <div className={`fixed top-8 right-8 z-[100] p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right-10 duration-300 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <span className="text-lg">{toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <p className="text-[10px] font-black uppercase tracking-widest">{toast.message}</p>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderContent()}
        </div>
      </main>

      <footer className="ml-64 p-12 pt-0 flex flex-col md:flex-row justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] gap-6">
        <p>© 2026 RiskLens AI by Woke Owl• SOC2 Type II • ISO 27001 Certified Infrastructure</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-blue-600 transition-colors">Global Privacy Policy</a>
          <button onClick={() => navigateTo('auditTrail')} className="hover:text-blue-600 transition-colors">AI Audit Trail</button>
          <a href="#" className="hover:text-blue-600 transition-colors">API v4.2 Docs</a>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
