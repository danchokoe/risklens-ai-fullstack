
import React, { useState, useMemo } from 'react';
import { MOCK_ACTIONS, MOCK_USERS } from '../constants';
import { predictActionRisk } from '../ollamaService';
import { ActionItem } from '../types';

interface ActionTrackingProps {
  onToast?: (msg: string, type?: 'success' | 'info') => void;
}

const ActionTracking: React.FC<ActionTrackingProps> = ({ onToast }) => {
  const [actions, setActions] = useState<ActionItem[]>(MOCK_ACTIONS);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const filteredActions = filter === 'All' 
    ? actions 
    : actions.filter(a => a.priority === filter);

  // Workload calculation: count tasks per assignee
  const workloadMap = useMemo(() => {
    const map: Record<string, number> = {};
    actions.forEach(a => {
      map[a.assignee] = (map[a.assignee] || 0) + 1;
    });
    return map;
  }, [actions]);

  const handlePredictRisk = async () => {
    setLoading(true);
    setAiInsight(null);
    try {
      const dataStr = filteredActions.map(a => 
        `ID:${a.id}, Task:${a.task}, Assignee:${a.assignee}, Workload:${workloadMap[a.assignee]} active tasks, Complexity:${a.complexity}, HistSLA:${a.historicalSLA}%, DaysPending:${a.daysPending}`
      ).join('; ');
      const res = await predictActionRisk(dataStr);
      setAiInsight(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedAction = actions.find(a => a.id === selectedActionId);

  const handleEscalate = () => {
    if (!selectedAction) return;
    const updatedActions = actions.map(a => 
      a.id === selectedAction.id ? { ...a, priority: 'Critical' as const } : a
    );
    setActions(updatedActions);
    if (onToast) onToast(`Protocol Initiated: Task ${selectedAction.id} escalated to Critical priority.`, 'success');
  };

  const handleReassign = () => {
    if (!selectedAction) return;
    
    const candidates = MOCK_USERS.map(u => u.name);
    let bestCandidate = selectedAction.assignee;
    let minLoad = Infinity;

    // Simple load balancing logic
    candidates.forEach(candidate => {
      if (candidate === selectedAction.assignee) return;
      const load = workloadMap[candidate] || 0;
      if (load < minLoad) {
        minLoad = load;
        bestCandidate = candidate;
      }
    });

    if (bestCandidate !== selectedAction.assignee) {
      const updatedActions = actions.map(a => 
        a.id === selectedAction.id ? { ...a, assignee: bestCandidate } : a
      );
      setActions(updatedActions);
      if (onToast) onToast(`Load Balancing: Reassigned to ${bestCandidate} (${minLoad} active tasks).`, 'success');
    } else {
      if (onToast) onToast('Optimization failed: No available personnel with lower workload.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Intelligent Action Tracking</h2>
          <p className="text-slate-500">Managing accountability with AI-predicted success probabilities and automated escalation paths.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
              <button 
                key={p} 
                onClick={() => setFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={handlePredictRisk}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Synthesizing Predictions...' : '✨ Run AI Success Prediction'}
          </button>
        </div>
      </header>

      {aiInsight && (
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              RiskLens AI: Predictive Assurance Engine
            </h3>
            <button onClick={() => setAiInsight(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
          <div className="text-slate-100 text-sm leading-loose whitespace-pre-wrap font-medium max-w-5xl">
            {aiInsight}
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 flex gap-4">
             <button onClick={handleEscalate} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20">Authorize Automated Escalations</button>
             <button onClick={handleReassign} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Reassign High-Probability Failures</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Task & Narrative</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee / Workload</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Complexity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SLA Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredActions.map((action) => (
                  <tr 
                    key={action.id} 
                    onClick={() => setSelectedActionId(action.id)}
                    className={`group hover:bg-slate-50 transition-all cursor-pointer ${selectedActionId === action.id ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-start gap-5">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${
                          action.priority === 'Critical' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 
                          action.priority === 'High' ? 'bg-orange-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-slate-300'
                        }`} />
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors">{action.task}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">Instance ID: {action.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                          {action.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 tracking-tight uppercase">{action.assignee}</p>
                          <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${
                            workloadMap[action.assignee] > 2 ? 'text-red-500' : 'text-slate-400'
                          }`}>
                            {workloadMap[action.assignee]} Active Tasks {workloadMap[action.assignee] > 2 ? '(OVERLOAD)' : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                         action.complexity === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                         action.complexity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>
                         {action.complexity} Complexity
                       </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{action.daysPending}d Pending</span>
                          <span className={action.daysPending > 20 ? 'text-red-500' : 'text-slate-400'}>
                            {action.daysPending > 30 ? 'CRITICAL BREACH' : 'IN-SLA'}
                          </span>
                        </div>
                        <div className="w-40 bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner relative">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              action.daysPending > 20 ? 'bg-red-500' : 
                              action.daysPending > 10 ? 'bg-amber-500' : 'bg-blue-600'
                            }`} 
                            style={{ width: `${Math.min(100, (action.daysPending / 45) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {selectedAction ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-8">Asset Accountability Deep-Dive</h4>
               <div className="space-y-8">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assignee Telemetry</p>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black text-slate-800">{selectedAction.assignee}</span>
                      <span className="text-[10px] font-bold text-slate-400">Hist SLA: {selectedAction.historicalSLA}%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Pipeline: {workloadMap[selectedAction.assignee]} High-Fidelity Tasks</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Predicted Success Probability</p>
                    <div className="flex items-center gap-4">
                       <div className="text-4xl font-black text-slate-900 tracking-tighter">
                         {Math.max(10, 100 - (selectedAction.daysPending * 2) - (selectedAction.complexity === 'High' ? 30 : 10))}%
                       </div>
                       <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                         selectedAction.daysPending > 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                       }`}>
                         AI: {selectedAction.daysPending > 20 ? 'HIGH FAILURE RISK' : 'STABLE'}
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 space-y-4">
                    <button 
                      onClick={handleEscalate}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                    >
                      Initiate Escalation Protocol
                    </button>
                    <button 
                      onClick={handleReassign}
                      className="w-full py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all"
                    >
                      Reassign To Low-Workload Unit
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center py-24">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-8 opacity-30">⚖️</div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-loose">Select a remediation task to analyze individual success probability and intervention paths.</p>
            </div>
          )}

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">Unit Performance Indices</h4>
            <div className="space-y-10">
              <div>
                <p className="text-5xl font-black tracking-tighter text-blue-400">68%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Aggregate Completion Velocity</p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs leading-relaxed text-slate-300 italic font-medium">
                  "AI Observation: {actions.filter(a => workloadMap[a.assignee] > 2).length} tasks are currently held by 'Bottleneck' assignees. Historical data suggests a 42% chance of SLA breach without intervention."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionTracking;
