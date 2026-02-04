
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_INCIDENTS } from '../constants';
import { analyzeIncident } from '../ollamaService';
import { Incident } from '../types';

interface IncidentMgmtProps {
  onToast: (msg: string, type?: 'success' | 'info') => void;
}

const QUICK_TEMPLATES = [
  { 
    title: 'Phishing Attempt Detected', 
    type: 'Cyber' as const, 
    severity: 'Medium' as const, 
    description: 'Suspicious email campaign targeting finance department discovered. Malicious links reported.' 
  },
  { 
    title: 'Critical System Outage', 
    type: 'Operational' as const, 
    severity: 'High' as const, 
    description: 'Core processing service is unresponsive. Load balancers reporting 503 errors.' 
  },
  { 
    title: 'Unauthorized Portal Access', 
    type: 'Cyber' as const, 
    severity: 'High' as const, 
    description: 'Multiple successful logins from non-whitelisted IP range detected on admin console.' 
  },
  { 
    title: 'Regulatory Breach Warning', 
    type: 'Legal' as const, 
    severity: 'Medium' as const, 
    description: 'Automated scan detected PII storage in non-compliant broadcast region.' 
  }
];

const IncidentManagement: React.FC<IncidentMgmtProps> = ({ onToast }) => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    type: 'Cyber',
    severity: 'Medium',
    status: 'Reported'
  });

  const quickReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickReportRef.current && !quickReportRef.current.contains(event.target as Node)) {
        setIsQuickReportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentToAdd: Incident = {
      ...newIncident as Incident,
      id: `INC-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toLocaleString(),
      reporter: 'Current User', // Placeholder for actual user session
      status: 'Reported'
    };
    setIncidents([incidentToAdd, ...incidents]);
    setIsReporting(false);
    onToast("Incident Cataloged Successfully", "success");
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setNewIncident({
      ...newIncident,
      title: template.title,
      type: template.type,
      severity: template.severity,
      description: template.description
    });
    setIsReporting(true);
    setIsQuickReportOpen(false);
  };

  const handleAIAnalysis = async () => {
    if (!selectedIncident) return;
    setLoading(true);
    setAiReport(null);
    try {
      const res = await analyzeIncident(selectedIncident.description);
      setAiReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Investigating': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reported': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Incident Response Center</h2>
          <p className="text-slate-500 font-medium">Coordinate containment, investigate root causes, and manage post-mortems with AI.</p>
        </div>
        <div className="flex gap-3 relative" ref={quickReportRef}>
          <button 
            onClick={() => setIsQuickReportOpen(!isQuickReportOpen)}
            className="bg-white border-2 border-slate-100 text-slate-900 px-6 py-4 rounded-2xl font-black shadow-sm transition-all uppercase text-xs tracking-widest hover:bg-slate-50 flex items-center gap-2"
          >
            ⚡ Quick Report
            <svg className={`w-4 h-4 transition-transform ${isQuickReportOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>

          {isQuickReportOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Template</p>
              </div>
              <div className="divide-y divide-slate-50">
                {QUICK_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-4 hover:bg-blue-50 transition-colors group"
                  >
                    <p className="text-xs font-black text-slate-800 uppercase group-hover:text-blue-600">{template.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{template.type} • {template.severity}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              setNewIncident({ type: 'Cyber', severity: 'Medium', status: 'Reported' });
              setIsReporting(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-red-500/20 transition-all uppercase text-xs tracking-widest"
          >
            🚨 Report Major Incident
          </button>
        </div>
      </header>

      {isReporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-8">Crisis Entry Panel</h3>
            <form onSubmit={handleReportIncident} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Incident Narrative Title</label>
                <input 
                  required
                  type="text" 
                  value={newIncident.title || ''}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Incident Type</label>
                  <select 
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value as any})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none"
                  >
                    <option>Cyber</option>
                    <option>Operational</option>
                    <option>Media</option>
                    <option>Legal</option>
                    <option>Financial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Severity</label>
                  <select 
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Observation</label>
                <textarea 
                  required
                  rows={4}
                  value={newIncident.description || ''}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all leading-relaxed"
                />
              </div>
              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black shadow-2xl shadow-red-500/20 transition-all uppercase text-xs tracking-[0.2em]">Initiate Containment</button>
                <button type="button" onClick={() => setIsReporting(false)} className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {aiReport && (
        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              RiskLens AI: Incident Post-Mortem & Strategy
            </h3>
            <button onClick={() => setAiReport(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
          <div className="text-slate-100 text-sm leading-loose whitespace-pre-wrap font-medium max-w-5xl">
            {aiReport}
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex gap-4">
             <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">Distribute Report to Board</button>
             <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Archive Investigation Logs</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Incident Lifecycle Register</h3>
              <div className="flex gap-2">
                 <span className="px-4 py-1.5 bg-red-100 text-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-200">1 Critical Active</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event & Severity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Domain & Time</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Oversight Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {incidents.map((inc) => (
                    <tr 
                      key={inc.id} 
                      onClick={() => setSelectedIncident(inc)}
                      className={`group hover:bg-slate-50 transition-all cursor-pointer ${selectedIncident?.id === inc.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-3 h-3 rounded-full ${
                            inc.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 
                            inc.severity === 'High' ? 'bg-orange-500' : 'bg-slate-300'
                          }`} />
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors">{inc.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">ID: {inc.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div>
                           <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{inc.type}</p>
                           <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{inc.timestamp}</p>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(inc.status)}`}>
                           {inc.status}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-transparent hover:border-blue-600 transition-all">Open War-Room</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {selectedIncident ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden h-fit">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-8">Crisis Management Hub</h4>
               
               <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Discovery Narrative</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{selectedIncident.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-slate-900 text-white rounded-2xl text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Time Elapsed</p>
                        <p className="text-lg font-black tracking-tighter">1h 22m</p>
                     </div>
                     <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">SLA Breach Risk</p>
                        <p className="text-lg font-black tracking-tighter text-green-600">Stable</p>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 space-y-4">
                    <button 
                      onClick={handleAIAnalysis}
                      disabled={loading}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                    >
                      {loading ? 'AI Analyzing Root Cause...' : '✨ Execute AI Post-Mortem'}
                    </button>
                    <button className="w-full py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all">Escalate to Executive ExCo</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-12 border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-6 opacity-30">🚨</div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Selection</h4>
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-4 leading-relaxed italic">Select an active incident from the register to initiate containment protocols and AI investigation.</p>
            </div>
          )}

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400 mb-8">Crisis Velocity</h4>
             <div className="space-y-10">
                <div>
                  <p className="text-5xl font-black tracking-tighter text-white">4.2</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Active Incidents / Month</p>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                   <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                     "AI Observation: Incident frequency in 'Cyber' domain has increased by 12% following the 2024 POPIA amendment. Current response bandwidth is operating at 88% capacity."
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentManagement;
