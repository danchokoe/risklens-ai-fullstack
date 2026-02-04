
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'System Admin': ['dashboard', 'risks', 'policies', 'documents', 'assets', 'vulnerabilities', 'incidents', 'audit', 'regulatory', 'reporting', 'actions', 'users', 'marketplace', 'about'],
  'CRO': ['dashboard', 'risks', 'policies', 'documents', 'audit', 'regulatory', 'reporting', 'users', 'marketplace', 'about'],
  'Risk Manager': ['dashboard', 'risks', 'policies', 'documents', 'actions', 'assets', 'vulnerabilities', 'incidents', 'marketplace', 'about'],
  'Compliance Officer': ['dashboard', 'policies', 'regulatory', 'documents', 'audit', 'marketplace', 'about'],
  'Internal Auditor': ['dashboard', 'audit', 'documents', 'risks', 'vulnerabilities', 'marketplace', 'about'],
  'Board Member': ['dashboard', 'reporting', 'risks', 'policies', 'marketplace', 'about']
};

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const allMenuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: '📊' },
    { id: 'risks', label: 'Risk Register', icon: '🛡️' },
    { id: 'policies', label: 'Policy Intelligence', icon: '📜' },
    { id: 'documents', label: 'Document Lifecycle', icon: '📂' },
    { id: 'assets', label: 'Asset Registry', icon: '📦' },
    { id: 'vulnerabilities', label: 'Vuln Scanner', icon: '⚡' },
    { id: 'incidents', label: 'Incident Mgmt', icon: '🚨' },
    { id: 'audit', label: 'Audit Co-Pilot', icon: '🔍' },
    { id: 'regulatory', label: 'Reg Monitoring', icon: '⚖️' },
    { id: 'reporting', label: 'Board Reporting', icon: '📑' },
    { id: 'actions', label: 'Action Tracking', icon: '✅' },
    { id: 'users', label: 'User Management', icon: '👤' },
    { id: 'marketplace', label: 'Marketplace Profile', icon: '🏪' },
    { id: 'about', label: 'Solution Overview', icon: '💡' },
  ];

  const allowedItems = user ? allMenuItems.filter(item => ROLE_PERMISSIONS[user.role].includes(item.id)) : [];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-blue-500 text-2xl">Risk</span>Lens AI
        </h1>
        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-semibold">Enterprise GRC</p>
      </div>
      
      <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
        {allowedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-slate-800"
            style={activeTab === item.id ? { backgroundColor: '#2563eb', color: 'white', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' } : {}}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 text-xs font-black">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20"
        >
          Terminate Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
