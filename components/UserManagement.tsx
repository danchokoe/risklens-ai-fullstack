
import React, { useState } from 'react';
import { MOCK_USERS } from '../constants';
import { User, UserRole, QueuedEmail } from '../types';
import BulkImportPanel from './BulkImportPanel';

interface UserManagementProps {
  currentUser: User | null;
  onToast: (msg: string, type?: 'success' | 'info') => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onToast }) => {
  const isAdmin = currentUser?.role === 'System Admin';
  const [activeSubTab, setActiveSubTab] = useState<'registry' | 'sync' | 'outbox'>('registry');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'Risk Manager', status: 'Active', name: '', email: '' });

  // Notification Queue State
  const [emailQueue, setEmailQueue] = useState<QueuedEmail[]>([]);
  const [isSendingQueue, setIsSendingQueue] = useState(false);

  // AD Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [adConfig, setAdConfig] = useState({
    provider: 'Azure Entra ID',
    tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
    clientId: 'risklens-prod-sync-01',
    syncInterval: '6 Hours',
    groupPrefix: 'RL_APP_'
  });

  const [mapping, setMapping] = useState([
    { adGroup: 'CN=Executive_Board_ZA', systemRole: 'Board Member' as UserRole },
    { adGroup: 'CN=Compliance_Assurance', systemRole: 'Compliance Officer' as UserRole },
    { adGroup: 'CN=Internal_Audit_Team', systemRole: 'Internal Auditor' as UserRole },
  ]);

  const queueEmail = (recipient: string, subject: string, content: string, type: QueuedEmail['type']) => {
    const newMail: QueuedEmail = {
      id: `MAIL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      recipient,
      subject,
      content,
      type,
      timestamp: new Date().toLocaleString()
    };
    setEmailQueue(prev => [newMail, ...prev]);
  };

  const handleImportComplete = (newRecords: any[]) => {
    const formatted: User[] = newRecords.map((rec, i) => {
      const u = {
        ...rec,
        id: `U-IMP-${Date.now()}-${i}`,
        lastLogin: 'Never',
        status: (rec.status || 'Active') as any,
        role: (rec.role || 'Risk Manager') as UserRole
      } as User;

      // Queue Welcome Email
      queueEmail(
        u.email,
        "Welcome to RiskLens AI Enterprise",
        `Hello ${u.name},\n\nYour account has been provisioned via bulk enrollment. Role: ${u.role}. Please use your SSO credentials to log in.`,
        'Enrollment'
      );

      return u;
    });
    
    setUsers([...formatted, ...users]);
    setIsImporting(false);
    onToast(`Provisioned ${formatted.length} users and queued welcome emails`, "success");
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const u: User = {
      id: `U-MAN-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: (newUser.role || 'Risk Manager') as UserRole,
      status: (newUser.status || 'Active') as any,
      lastLogin: 'Never'
    };

    setUsers([u, ...users]);
    setIsAddingUser(false);
    setNewUser({ role: 'Risk Manager', status: 'Active', name: '', email: '' });

    // Queue Enrollment Email
    queueEmail(
      u.email,
      "Account Activation: RiskLens AI",
      `Dear ${u.name},\n\nAn administrator has enrolled you into the RiskLens AI environment. You have been assigned the role: ${u.role}.`,
      'Enrollment'
    );

    onToast("User provisioned and activation email queued", "success");
  };

  const handleUpdateRole = (id: string, newRole: UserRole) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    setEditingUser(null);

    queueEmail(
      user.email,
      "Security Notice: Role Modification",
      `Hello ${user.name},\n\nYour access privileges in RiskLens AI have been modified. Your new role is: ${newRole}.`,
      'Role Modification'
    );

    onToast("User role updated and notification queued", "info");
  };

  const handleDispatchQueue = () => {
    if (emailQueue.length === 0) return;
    setIsSendingQueue(true);
    setTimeout(() => {
      setIsSendingQueue(false);
      const count = emailQueue.length;
      setEmailQueue([]);
      onToast(`Successfully dispatched ${count} enterprise notifications`, "success");
    }, 2000);
  };

  const handleSyncSimulation = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onToast("Active Directory Sync Complete: 12 Identities Updated", "success");
    }, 3000);
  };

  const toggleUserStatus = (id: string) => {
    if (!isAdmin) return;
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));

    // Queue Status Change Email
    queueEmail(
      user.email,
      `RiskLens AI Account ${newStatus === 'Active' ? 'Restored' : 'Suspended'}`,
      `Attention ${user.name},\n\nYour enterprise access to RiskLens AI has been ${newStatus.toLowerCase()} by an administrator.`,
      'Status Change'
    );

    onToast(`User ${newStatus === 'Active' ? 'Activated' : 'Suspended'} and notification queued`, "info");
  };

  return (
    <div className="space-y-8 pb-20">
      {isImporting && (
        <BulkImportPanel 
          moduleName="User"
          templateHeaders={['name', 'email', 'role', 'status']}
          onImportComplete={handleImportComplete}
          onCancel={() => setIsImporting(false)}
        />
      )}

      {isAddingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-8">Enroll Enterprise User</h3>
            <form onSubmit={handleSaveNewUser} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Identity Name</label>
                <input 
                  required
                  type="text" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corporate Email</label>
                <input 
                  required
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none"
                  >
                    <option value="Risk Manager">Risk Manager</option>
                    <option value="CRO">CRO</option>
                    <option value="Internal Auditor">Internal Auditor</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="System Admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Status</label>
                  <select 
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value as any})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-2xl transition-all uppercase text-xs tracking-[0.2em]">Complete Enrollment</button>
                <button type="button" onClick={() => setIsAddingUser(false)} className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Modify Permissions</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium italic">Identity: {editingUser.name}</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select New Enterprise Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {['CRO', 'Risk Manager', 'Internal Auditor', 'Compliance Officer', 'Board Member', 'System Admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => handleUpdateRole(editingUser.id, role as UserRole)}
                      className={`px-4 py-4 rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                        editingUser.role === role ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                 <button onClick={() => setEditingUser(null)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Cancel Modification</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none text-balance">Identity & Access Management</h2>
          <p className="text-slate-500 font-medium mt-2">Control user roles, permissions, and Active Directory orchestration.</p>
        </div>
        <div className="flex bg-slate-200 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveSubTab('registry')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'registry' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Identity Registry
          </button>
          <button 
            onClick={() => setActiveSubTab('sync')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'sync' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Directory Sync
          </button>
          <button 
            onClick={() => setActiveSubTab('outbox')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSubTab === 'outbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending Outbox
            {emailQueue.length > 0 && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">{emailQueue.length}</span>}
          </button>
        </div>
      </header>

      {activeSubTab === 'registry' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex justify-end gap-4">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setIsImporting(true)}
                  className="bg-white border-2 border-slate-100 hover:border-blue-500 text-slate-900 px-6 py-2.5 rounded-xl font-black shadow-sm uppercase text-[10px] tracking-widest transition-all"
                >
                  📂 Bulk Import Excel
                </button>
                <button 
                  onClick={() => setIsAddingUser(true)}
                  className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-black shadow-xl shadow-slate-900/10 transition-all uppercase text-[10px] tracking-widest"
                >
                  Enroll New User
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enterprise Role</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100 bg-blue-50 text-blue-600">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${user.id.includes('IMP') || user.id.includes('MAN') ? 'bg-blue-400' : 'bg-slate-300'}`} />
                         {user.id.includes('IMP') ? 'AD Sync' : user.id.includes('MAN') ? 'Manual Admin' : 'Local Vault'}
                       </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-slate-500' : 'text-slate-300'}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditingUser(user)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs" title="Edit Role">🖋️</button>
                            <button onClick={() => toggleUserStatus(user.id)} className={`p-2.5 rounded-xl transition-all text-xs ${user.status === 'Active' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`} title={user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                              {user.status === 'Active' ? '⛔' : '✅'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 'sync' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-right-8 duration-500">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-10 flex items-center gap-4">
                   <span className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">🌩️</span>
                   Azure Entra ID / LDAP Connector
                </h3>

                <div className="grid grid-cols-2 gap-8 mb-10">
                   <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Directory Provider</label>
                      <select value={adConfig.provider} onChange={(e) => setAdConfig({...adConfig, provider: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 outline-none transition-all uppercase tracking-widest">
                        <option>Azure Entra ID</option>
                        <option>Local Active Directory (LDAP)</option>
                        <option>Okta Universal Directory</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Frequency</label>
                      <select value={adConfig.syncInterval} onChange={(e) => setAdConfig({...adConfig, syncInterval: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 outline-none transition-all uppercase tracking-widest">
                        <option>Real-time (Webhooks)</option>
                        <option>1 Hour</option>
                        <option>6 Hours</option>
                        <option>Daily</option>
                      </select>
                   </div>
                   <div className="col-span-2 space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Directory Tenant ID</label>
                      <input type="text" value={adConfig.tenantId} onChange={(e) => setAdConfig({...adConfig, tenantId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold focus:ring-4 outline-none transition-all" />
                   </div>
                   <div className="col-span-2 space-y-2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Client ID / Service Account</label>
                      <input type="text" value={adConfig.clientId} onChange={(e) => setAdConfig({...adConfig, clientId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-mono font-bold focus:ring-4 outline-none transition-all" />
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex gap-4">
                   <button onClick={handleSyncSimulation} disabled={isSyncing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-2xl shadow-blue-500/20 transition-all uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
                      {isSyncing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Handshaking...
                        </>
                      ) : '🔄 Trigger Manual Sync'}
                   </button>
                   <button className="px-10 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Test Connection</button>
                </div>
              </div>

              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">AD Group Role Mapping</h3>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">+ New Mapping Rule</button>
                 </div>
                 <div className="space-y-3">
                    {mapping.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-blue-200 transition-all">
                         <div className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px]">📁</div>
                            <div>
                               <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none">{m.adGroup}</p>
                               <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Source Directory Object</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-slate-300">→</span>
                            <div className="bg-white px-5 py-2 rounded-xl border border-slate-200">
                               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">{m.systemRole}</p>
                            </div>
                            <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Sync Insights Side Panel */}
           <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">Identity Governance</h4>
                 <div className="space-y-10">
                    <div>
                      <p className="text-5xl font-black tracking-tighter text-white">4.2k</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Discovered Directory Objects</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                       <p className="text-xs text-slate-300 italic font-medium leading-relaxed">
                         "RiskLens is correctly receiving periodic heartbeats from Entra ID. No provisioning latency detected in the last 72 hours."
                       </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-500">Sync Pipeline Health</span>
                          <span className="text-green-500">OPTIMIZED</span>
                       </div>
                       <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 w-[94%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">📜</div>
                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Recent Activity Logs</h4>
                 <div className="mt-8 space-y-4 text-left">
                    {[
                      { ev: 'Sync Triggered', t: '12m ago', s: 'Manual' },
                      { ev: 'New Identity Found', t: '1h ago', s: 'Auto' },
                      { ev: 'Role Mismatch Fixed', t: '4h ago', s: 'System' }
                    ].map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <div>
                          <p className="text-[9px] font-black text-slate-800 uppercase tracking-tighter">{log.ev}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{log.s}</p>
                        </div>
                        <span className="text-[8px] font-bold text-slate-400">{log.t}</span>
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all">View Complete IAM Audit</button>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
           <div className="bg-slate-900 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                 <div className="space-y-6">
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight">Notification Outbox</h3>
                    <p className="text-slate-400 max-w-xl font-medium leading-relaxed italic">"RiskLens queues all automated system emails here for review. These notifications ensure enterprise accountability during lifecycle events like onboarding, offboarding, or privilege escalation."</p>
                    <div className="flex gap-4">
                       <button 
                         onClick={handleDispatchQueue} 
                         disabled={emailQueue.length === 0 || isSendingQueue}
                         className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 disabled:opacity-30"
                       >
                          {isSendingQueue ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Dispatching SSL/TLS...
                            </>
                          ) : '🚀 Dispatch All Notifications'}
                       </button>
                       <button onClick={() => setEmailQueue([])} disabled={emailQueue.length === 0} className="px-8 py-5 border-2 border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-white/5 transition-all disabled:opacity-10">Purge Queue</button>
                    </div>
                 </div>
                 <div className="w-48 h-48 bg-white/5 rounded-full border border-white/10 flex flex-col items-center justify-center text-center shadow-inner relative">
                    <p className="text-6xl font-black tracking-tighter mb-1">{emailQueue.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Pending</p>
                    {emailQueue.length > 0 && <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">📫</div>}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {emailQueue.length === 0 ? (
                <div className="lg:col-span-2 py-32 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-center flex flex-col items-center justify-center">
                   <div className="text-6xl mb-8 opacity-20 grayscale">✉️</div>
                   <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Outbox is Vacant</h4>
                   <p className="text-slate-400 font-medium text-sm mt-2 max-w-xs italic leading-relaxed">System notifications are only generated when user lifecycle events (Role changes, Enrollments, Status updates) are triggered.</p>
                </div>
              ) : (
                emailQueue.map(mail => (
                  <div key={mail.id} className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col group relative">
                     <div className="absolute top-8 right-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                          mail.type === 'Enrollment' ? 'bg-green-50 text-green-700 border-green-200' : 
                          mail.type === 'Role Modification' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                           {mail.type}
                        </span>
                     </div>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-lg">📩</div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">To: Identity Verified</p>
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{mail.recipient}</p>
                        </div>
                     </div>
                     <div className="space-y-4 flex-1">
                        <div className="pb-4 border-b border-slate-50">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject Narrative</p>
                           <p className="text-sm font-black text-slate-800 leading-tight">{mail.subject}</p>
                        </div>
                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 h-32 overflow-y-auto custom-scrollbar">
                           <p className="text-[10px] font-medium text-slate-500 leading-relaxed font-mono whitespace-pre-wrap italic">"{mail.content}"</p>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="font-mono">{mail.timestamp}</span>
                        <button onClick={() => setEmailQueue(emailQueue.filter(m => m.id !== mail.id))} className="text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Remove Item</button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
