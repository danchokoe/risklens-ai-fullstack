
import React, { useState } from 'react';
import { AiAuditLog } from '../types';

interface AiAuditTrailProps {
  logs: AiAuditLog[];
}

const AiAuditTrail: React.FC<AiAuditTrailProps> = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState<AiAuditLog | null>(null);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">AI Audit Trail</h2>
          <p className="text-slate-500 font-medium">Immutable oversight of all automated deliberations and synthesis cycles.</p>
        </div>
        <div className="flex gap-4">
           <input 
             type="text" 
             placeholder="Filter logs..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 min-w-[300px] transition-all"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Oversight Register</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{logs.length} Recorded Cycles</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context & Model</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initiator</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Node</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Oversight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className={`group hover:bg-blue-50/30 transition-all cursor-pointer ${selectedLog?.id === log.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{log.module}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{log.action}</p>
                          <span className="text-[8px] font-mono text-slate-300 mt-1 block">{log.model}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                            {log.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze Evidence →</span>
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-300 italic font-medium">No audit logs matched search criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {selectedLog ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden h-fit max-h-[850px] flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-8">Cycle Inspection</h4>
               
               <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Synthesis Prompt</p>
                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                      "{selectedLog.prompt}"
                    </p>
                  </div>

                  <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3">Final Narrative Output</p>
                    <p className="text-xs font-medium text-slate-200 leading-loose">
                      {selectedLog.response}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Verify Hash Consistency</button>
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">Download Signed Log</button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mb-16 -mr-16" />
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mb-8 border border-white/10">📜</div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Select Audit Log</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 leading-relaxed italic">Select an entry from the oversight register to perform a forensic review of the AI's internal state during synthesis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAuditTrail;
