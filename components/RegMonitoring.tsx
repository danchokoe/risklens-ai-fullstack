
import React, { useState, useMemo } from 'react';
import { MOCK_REGULATIONS, MOCK_RISKS, MOCK_POLICIES } from '../constants';
import { analyzeRegulatoryImpact } from '../ollamaService';
import { RegulatoryUpdate, Clause } from '../types';

const RegMonitoring: React.FC = () => {
  // Use state for regulations to allow interactive mapping updates
  const [regulations, setRegulations] = useState<RegulatoryUpdate[]>(MOCK_REGULATIONS);
  const [loading, setLoading] = useState(false);
  const [selectedRegId, setSelectedRegId] = useState<string>(MOCK_REGULATIONS[0].id);
  const [activeSubTab, setActiveSubTab] = useState<'analysis' | 'mapping'>('analysis');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);

  const selectedReg = regulations.find(r => r.id === selectedRegId) || regulations[0];

  const handleAnalyze = async (reg: RegulatoryUpdate) => {
    setSelectedRegId(reg.id);
    setLoading(true);
    setAiAnalysis(null);
    setActiveSubTab('analysis');
    try {
      const res = await analyzeRegulatoryImpact(reg.regulation, reg.summary);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openMapping = (clauseId: string) => {
    setActiveClauseId(clauseId);
    setIsMappingModalOpen(true);
  };

  const handleLinkControl = (controlId: string, controlName: string) => {
    if (!activeClauseId) return;

    const updatedRegs = regulations.map(reg => {
      if (reg.id === selectedRegId) {
        const updatedClauses = reg.clauses?.map(clause => {
          if (clause.id === activeClauseId) {
            return {
              ...clause,
              linkedControlId: controlId,
              linkedControlName: controlName,
              status: 'Compliant' as const
            };
          }
          return clause;
        });

        // Recalculate compliance score: % of clauses that are 'Compliant' or 'Partial'
        const compliantCount = updatedClauses?.filter(c => c.status === 'Compliant').length || 0;
        const total = updatedClauses?.length || 1;
        const newScore = Math.round((compliantCount / total) * 100);

        return { ...reg, clauses: updatedClauses, complianceScore: newScore };
      }
      return reg;
    });

    setRegulations(updatedRegs);
    setIsMappingModalOpen(false);
    setActiveClauseId(null);
  };

  const activeClause = selectedReg.clauses?.find(c => c.id === activeClauseId);

  const renderMappingModal = () => {
    if (!isMappingModalOpen || !activeClause) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Link Internal Control</h3>
                <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Clause: {activeClause.reference}</p>
              </div>
              <button onClick={() => setIsMappingModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors text-2xl">✕</button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clause Text</p>
              <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{activeClause.text}"</p>
            </div>

            <div className="space-y-8 max-h-[45vh] overflow-y-auto pr-4 custom-scrollbar">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">Risk Register Controls</h4>
                <div className="grid grid-cols-1 gap-2">
                  {MOCK_RISKS.map(risk => (
                    <button 
                      key={risk.id}
                      onClick={() => handleLinkControl(risk.id, risk.title)}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all flex justify-between items-center group bg-white shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{risk.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">Accountable: {risk.owner} • ID: {risk.id}</p>
                      </div>
                      <span className="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-opacity bg-blue-100 px-3 py-1 rounded-lg">Map This Control</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">Policy Intelligence Controls</h4>
                <div className="grid grid-cols-1 gap-2">
                  {MOCK_POLICIES.map(policy => (
                    <button 
                      key={policy.id}
                      onClick={() => handleLinkControl(policy.id, policy.name)}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all flex justify-between items-center group bg-white shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{policy.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{policy.type} • {policy.category} • ID: {policy.id}</p>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 uppercase tracking-widest transition-opacity bg-indigo-100 px-3 py-1 rounded-lg">Map This Policy</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {renderMappingModal()}
      
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Regulatory Monitoring & Control Mapping</h2>
        <p className="text-slate-500">Track dynamic mandates and map clauses directly to your internal risk and policy controls.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Feed: Recent Regulatory Updates</h3>
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {regulations.map((reg) => (
              <button
                key={reg.id}
                onClick={() => {
                  setSelectedRegId(reg.id);
                  setAiAnalysis(null);
                }}
                className={`w-full text-left p-5 rounded-3xl border-2 transition-all relative overflow-hidden group ${
                  selectedRegId === reg.id 
                    ? 'border-blue-600 bg-white ring-8 ring-blue-500/5 shadow-lg' 
                    : 'border-slate-50 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`absolute top-0 right-0 p-3 text-white rounded-bl-2xl transition-all ${
                  reg.complianceScore && reg.complianceScore > 70 ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  <div className="text-[10px] font-black uppercase tracking-tighter leading-none">Mapped</div>
                  <div className="text-sm font-black text-center">{reg.complianceScore}%</div>
                </div>
                
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    reg.impact === 'Critical' ? 'bg-red-100 text-red-600' : 
                    reg.impact === 'Major' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {reg.impact} IMPACT
                  </span>
                </div>
                <h4 className={`font-bold tracking-tight leading-snug transition-colors pr-10 ${
                  selectedRegId === reg.id ? 'text-blue-600' : 'text-slate-800 group-hover:text-blue-600'
                }`}>{reg.regulation}</h4>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{reg.date}</span>
                  <div className="flex -space-x-1">
                    {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full border border-white bg-slate-200" />)}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAnalyze(reg); }}
                  className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 rounded-xl transition-all"
                >
                  AI Impact Assessment
                </button>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[600px] flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-100 px-10 bg-slate-50/30">
              <button 
                onClick={() => setActiveSubTab('analysis')}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${
                  activeSubTab === 'analysis' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Strategic AI Analysis
              </button>
              <button 
                onClick={() => setActiveSubTab('mapping')}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${
                  activeSubTab === 'mapping' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Control Clause Mapping
              </button>
            </div>

            <div className="flex-1 p-10">
              {activeSubTab === 'analysis' ? (
                loading ? (
                  <div className="h-full flex flex-col items-center justify-center py-24 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-8 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">⚖️</div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Processing Regulation</h4>
                      <p className="text-slate-400 text-xs mt-2">AI is evaluating legal mandates and risk exposure...</p>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="prose prose-slate max-w-none text-slate-700 leading-loose whitespace-pre-wrap font-medium text-sm border-l-4 border-slate-100 pl-8">
                      {aiAnalysis}
                    </div>
                    <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                       <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mb-16 -mr-16" />
                       <h5 className="font-black text-blue-400 text-[10px] uppercase tracking-[0.3em] mb-4">AI Suggested Next Steps</h5>
                       <ul className="space-y-4 text-xs font-medium text-slate-300">
                         <li className="flex gap-3"><span className="text-blue-500">→</span> Re-evaluate Section 12 controls for cross-border alignment.</li>
                         <li className="flex gap-3"><span className="text-blue-500">→</span> Schedule a policy review meeting with HR for GDPR sync.</li>
                       </ul>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-24 text-slate-300">
                    <div className="text-6xl mb-6 opacity-20">🤖</div>
                    <h4 className="font-black uppercase tracking-[0.3em] text-xs">AI Ready</h4>
                    <p className="text-slate-400 text-xs mt-3 max-w-xs text-center font-medium opacity-60">Click "AI Impact Assessment" on any regulation to generate a strategic summary of obligations and risk.</p>
                  </div>
                )
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="flex justify-between items-end mb-4 border-b border-slate-50 pb-8">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedReg.regulation} Clauses</h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Audit Trail: Linkage of external mandates to internal control framework</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-8 shadow-inner">
                       <div className="text-center">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clauses</p>
                         <p className="text-xl font-black text-slate-800 leading-none">{selectedReg.clauses?.length || 0}</p>
                       </div>
                       <div className="h-10 w-px bg-slate-200" />
                       <div className="text-center">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mapping Integrity</p>
                         <p className={`text-xl font-black leading-none ${selectedReg.complianceScore && selectedReg.complianceScore > 70 ? 'text-green-600' : 'text-blue-600'}`}>
                           {selectedReg.complianceScore}%
                         </p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {selectedReg.clauses?.map((clause) => (
                      <div key={clause.id} className="p-8 rounded-[2rem] bg-white border-2 border-slate-50 hover:border-blue-100 transition-all group relative">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                             <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shadow-lg">{clause.reference.split(' ')[1] || clause.id}</span>
                             <h5 className="font-black text-slate-800 tracking-tight uppercase text-xs">{clause.reference}</h5>
                           </div>
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${
                             clause.status === 'Compliant' ? 'bg-green-50 text-green-700 border-green-200' : 
                             clause.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                             clause.status === 'Non-Compliant' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                           }`}>
                             {clause.status}
                           </span>
                        </div>
                        
                        <p className="text-sm font-medium text-slate-600 leading-loose mb-8 italic">
                          "{clause.text}"
                        </p>
                        
                        <div className="flex justify-between items-center border-t border-slate-50 pt-6">
                          {clause.linkedControlId ? (
                            <div className="flex items-center gap-4 group/control">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-inner group-hover/control:bg-blue-600 group-hover/control:text-white transition-all">🔗</div>
                              <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Control</p>
                                <p className="text-xs font-black text-blue-600 uppercase tracking-tight">{clause.linkedControlName}</p>
                                <p className="text-[8px] text-slate-400 font-mono mt-0.5">VAULT REF: {clause.linkedControlId}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-slate-300">
                               <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center">?</div>
                               <p className="text-[10px] font-bold uppercase tracking-widest">No internal control mapping identified.</p>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => openMapping(clause.id)}
                            className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                          >
                            {clause.linkedControlId ? 'Update Control Mapping' : 'Execute Mapping Node'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegMonitoring;
