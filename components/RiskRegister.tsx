
import React, { useState, useMemo } from 'react';
import { MOCK_RISKS as INITIAL_RISKS } from '../constants';
import { getRiskInsights } from '../ollamaService';
import { Risk } from '../types';
import BulkImportPanel from './BulkImportPanel';

const RiskRegister: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>(INITIAL_RISKS);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'lineage'>('details');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');

  // New Risk Form State - Extended for Industry Standards
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    title: '',
    description: '',
    impact: 3,
    likelihood: 3,
    owner: '',
    status: 'Open',
    category: 'Operational',
    rootCause: '',
    consequences: '',
    dateIdentified: new Date().toISOString().split('T')[0],
    existingControls: '',
    controlEffectiveness: 'Satisfactory',
    residualImpact: 3,
    residualLikelihood: 3,
    treatmentStrategy: 'Mitigate'
  });

  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchesOwner = ownerFilter === 'All' || r.owner === ownerFilter;
      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [risks, searchQuery, statusFilter, ownerFilter]);

  const handleImportComplete = (newRecords: any[]) => {
    const formatted: Risk[] = newRecords.map((rec, i) => ({
      ...rec,
      id: `R-IMP-${Date.now()}-${i}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      impact: Number(rec.impact) || 3,
      likelihood: Number(rec.likelihood) || 3,
      status: rec.status || 'Open'
    } as Risk));
    
    setRisks([...formatted, ...risks]);
    setIsImporting(false);
  };

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRisk.title || !newRisk.owner) return;

    const riskToAdd: Risk = {
      id: `R-MAN-${Date.now()}`,
      title: newRisk.title,
      description: newRisk.description || '',
      impact: Number(newRisk.impact) || 3,
      likelihood: Number(newRisk.likelihood) || 3,
      owner: newRisk.owner,
      status: (newRisk.status as any) || 'Open',
      lastUpdated: new Date().toISOString().split('T')[0],
      category: newRisk.category,
      rootCause: newRisk.rootCause,
      consequences: newRisk.consequences,
      dateIdentified: newRisk.dateIdentified,
      existingControls: newRisk.existingControls,
      controlEffectiveness: newRisk.controlEffectiveness,
      residualImpact: Number(newRisk.residualImpact),
      residualLikelihood: Number(newRisk.residualLikelihood),
      treatmentStrategy: newRisk.treatmentStrategy
    };

    setRisks([riskToAdd, ...risks]);
    setIsAdding(false);
    // Reset form
    setNewRisk({
      title: '',
      description: '',
      impact: 3,
      likelihood: 3,
      owner: '',
      status: 'Open',
      category: 'Operational',
      rootCause: '',
      consequences: '',
      dateIdentified: new Date().toISOString().split('T')[0],
      existingControls: '',
      controlEffectiveness: 'Satisfactory',
      residualImpact: 3,
      residualLikelihood: 3,
      treatmentStrategy: 'Mitigate'
    });
  };

  const handleGetInsights = async () => {
    setLoading(true);
    try {
      const dataStr = risks.map(r => `${r.title} (Impact:${r.impact}, Likelihood:${r.likelihood})`).join(', ');
      const res = await getRiskInsights(dataStr);
      setAiInsight(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (i: number = 0, l: number = 0) => i * l;

  return (
    <div className="space-y-6">
      {isImporting && (
        <BulkImportPanel 
          moduleName="Risk"
          templateHeaders={['title', 'description', 'impact', 'likelihood', 'owner', 'status']}
          onImportComplete={handleImportComplete}
          onCancel={() => setIsImporting(false)}
        />
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Enterprise Risk Registration</h3>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">Standard ISO 31000 Protocol</div>
            </div>
            
            <form onSubmit={handleSaveRisk} className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-4">
              
              {/* Section 1: Context */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">1. Risk Context & Identification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Title / Event</label>
                    <input 
                      required
                      type="text" 
                      value={newRisk.title}
                      onChange={(e) => setNewRisk({...newRisk, title: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all"
                      placeholder="e.g. Failure of Critical Third-Party Service Provider"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Category</label>
                    <select 
                      value={newRisk.category}
                      onChange={(e) => setNewRisk({...newRisk, category: e.target.value as any})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                    >
                      <option>Operational</option>
                      <option>Financial</option>
                      <option>Strategic</option>
                      <option>Compliance</option>
                      <option>Reputational</option>
                      <option>Cyber/IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Owner</label>
                    <input 
                      required
                      type="text" 
                      value={newRisk.owner}
                      onChange={(e) => setNewRisk({...newRisk, owner: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                      placeholder="e.g. CIO / Head of Ops"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Identified</label>
                    <input 
                      type="date"
                      value={newRisk.dateIdentified}
                      onChange={(e) => setNewRisk({...newRisk, dateIdentified: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Status</label>
                    <select 
                      value={newRisk.status}
                      onChange={(e) => setNewRisk({...newRisk, status: e.target.value as any})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Monitoring">Monitoring</option>
                      <option value="Mitigated">Mitigated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Narrative */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">2. Causality & Consequence</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Risk Description</label>
                    <textarea 
                      rows={2}
                      value={newRisk.description}
                      onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                      placeholder="Describe the risk event..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Root Cause (Source)</label>
                    <textarea 
                      rows={3}
                      value={newRisk.rootCause}
                      onChange={(e) => setNewRisk({...newRisk, rootCause: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-medium outline-none resize-none"
                      placeholder="What is the underlying cause?"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Potential Consequences (Impact)</label>
                    <textarea 
                      rows={3}
                      value={newRisk.consequences}
                      onChange={(e) => setNewRisk({...newRisk, consequences: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-medium outline-none resize-none"
                      placeholder="What happens if this risk materializes?"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Assessment */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">3. Assessment & Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Inherent Risk */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inherent Risk (Gross)</span>
                      <span className="text-xs font-black text-slate-900">Score: {calculateScore(newRisk.impact, newRisk.likelihood)}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Impact (1-5)</label>
                        <select 
                          value={newRisk.impact}
                          onChange={(e) => setNewRisk({...newRisk, impact: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Likelihood (1-5)</label>
                        <select 
                          value={newRisk.likelihood}
                          onChange={(e) => setNewRisk({...newRisk, likelihood: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Residual Risk */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex justify-between mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Residual Risk (Net)</span>
                      <span className="text-xs font-black text-blue-600">Score: {calculateScore(newRisk.residualImpact, newRisk.residualLikelihood)}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Impact (1-5)</label>
                        <select 
                          value={newRisk.residualImpact}
                          onChange={(e) => setNewRisk({...newRisk, residualImpact: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Likelihood (1-5)</label>
                        <select 
                          value={newRisk.residualLikelihood}
                          onChange={(e) => setNewRisk({...newRisk, residualLikelihood: Number(e.target.value)})}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Existing Controls</label>
                      <textarea 
                        rows={2}
                        value={newRisk.existingControls}
                        onChange={(e) => setNewRisk({...newRisk, existingControls: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-medium outline-none resize-none"
                        placeholder="List controls mitigating this risk..."
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Control Effectiveness</label>
                      <select 
                        value={newRisk.controlEffectiveness}
                        onChange={(e) => setNewRisk({...newRisk, controlEffectiveness: e.target.value as any})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                      >
                        <option>Satisfactory</option>
                        <option>Needs Improvement</option>
                        <option>Weak</option>
                        <option>None</option>
                      </select>
                   </div>
                </div>
              </div>

              {/* Section 4: Treatment */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-50 pb-2">4. Treatment Strategy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Treatment Approach</label>
                      <select 
                        value={newRisk.treatmentStrategy}
                        onChange={(e) => setNewRisk({...newRisk, treatmentStrategy: e.target.value as any})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                      >
                        <option>Mitigate</option>
                        <option>Accept</option>
                        <option>Transfer</option>
                        <option>Avoid</option>
                      </select>
                   </div>
                   {/* Placeholder for future action plans if needed */}
                </div>
              </div>

            </form>

            <div className="pt-8 border-t border-slate-50 flex gap-4 shrink-0">
              <button onClick={handleSaveRisk} className="flex-1 bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black shadow-2xl transition-all uppercase text-xs tracking-[0.2em]">Confirm Registration</button>
              <button onClick={() => setIsAdding(false)} className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Dynamic Risk Register</h2>
          <p className="text-slate-500 font-medium">Enterprise-wide exposure tracking and AI-led diagnostic tools.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsImporting(true)}
            className="bg-white border-2 border-slate-100 hover:border-blue-500 text-slate-900 px-6 py-2.5 rounded-xl font-black shadow-sm uppercase text-[10px] tracking-widest transition-all"
          >
            📂 Bulk Import Excel
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-black shadow-lg uppercase text-[10px] tracking-widest"
          >
            + Register New Risk
          </button>
          <button 
            onClick={handleGetInsights}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black shadow-lg flex items-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            {loading ? 'Synthesizing...' : '✨ Run AI Diagnostic'}
          </button>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <h3 className="text-blue-400 font-black mb-6 flex items-center gap-2 uppercase text-[10px] tracking-[0.3em]">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            RiskLens AI Strategic Advisory
          </h3>
          <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-medium max-w-4xl">
            {aiInsight}
          </div>
          <button onClick={() => setAiInsight(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black mb-8 uppercase tracking-[0.4em] text-slate-400">Risk Heatmap (5x5)</h3>
            <div className="grid grid-cols-5 gap-1 aspect-square relative border border-slate-100 p-1 bg-slate-50/50 rounded-xl">
              {[5, 4, 3, 2, 1].map((impact) => (
                [1, 2, 3, 4, 5].map((likelihood) => {
                  const risksInCell = risks.filter(r => r.impact === impact && r.likelihood === likelihood);
                  const bgColors = ['bg-green-100', 'bg-green-200', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100','bg-green-200', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100', 'bg-red-200','bg-yellow-100', 'bg-orange-100', 'bg-red-100', 'bg-red-200', 'bg-red-300','bg-orange-100', 'bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400','bg-red-100', 'bg-red-200', 'bg-red-300', 'bg-red-400', 'bg-red-500'];
                  const cellIndex = (5 - impact) * 5 + (likelihood - 1);
                  const cellBg = bgColors[cellIndex] || 'bg-slate-50';
                  return (
                    <div key={`${impact}-${likelihood}`} className={`${cellBg} border border-white/50 flex flex-wrap gap-0.5 p-0.5 items-center justify-center relative group`}>
                      {risksInCell.map(r => (
                        <div key={r.id} onClick={() => setSelectedRisk(r)} className={`w-3 h-3 rounded-full border border-white cursor-pointer hover:scale-150 transition-all ${selectedRisk?.id === r.id ? 'bg-blue-600 scale-125 z-10 shadow-lg' : 'bg-slate-900'}`} />
                      ))}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-slate-50">
               <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Inventory Control</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredRisks.length} Profiles Matched</span>
              </div>
              <div className="flex gap-4">
                <input type="text" placeholder="Filter registry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 px-6 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all">
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="Monitoring">Monitoring</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {filteredRisks.map((risk) => (
                <button key={risk.id} onClick={() => { setSelectedRisk(risk); setActiveTab('details'); }} className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${selectedRisk?.id === risk.id ? 'border-blue-600 bg-blue-50/20 shadow-xl' : 'border-slate-50 hover:border-slate-200 bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-xs font-black border-2 ${risk.impact * risk.likelihood > 15 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600'}`}>
                        <span className="text-[10px] font-bold opacity-60 uppercase">Score</span>
                        <span className="text-xl leading-none">{risk.impact * risk.likelihood}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 tracking-tighter uppercase group-hover:text-blue-600 transition-colors leading-none text-lg">{risk.title}</h4>
                        <div className="mt-3 flex items-center gap-3">
                           {risk.category && <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{risk.category}</span>}
                           <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Accountable: {risk.owner} • Last Sync: {risk.lastUpdated}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust-Enhanced Detail Panel */}
      {selectedRisk && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right-full duration-500 flex flex-col overflow-hidden relative">
            <div className="p-10 flex border-b border-slate-50 bg-slate-50/30">
               <button onClick={() => setActiveTab('details')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Risk Profile</button>
               <button onClick={() => setActiveTab('lineage')} className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'lineage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>⚡ Evidence Lineage</button>
               <button onClick={() => setSelectedRisk(null)} className="ml-auto text-slate-300 hover:text-slate-900 text-3xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-16">
              {activeTab === 'details' ? (
                <div className="space-y-10 animate-in fade-in duration-300">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4 block">Intelligence Node</span>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-[1.1]">{selectedRisk.title}</h3>
                    {selectedRisk.category && (
                      <span className="inline-block mt-4 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {selectedRisk.category}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Inherent Exposure</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-slate-900">{selectedRisk.impact * selectedRisk.likelihood}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">/ 25</span>
                       </div>
                    </div>
                    {selectedRisk.residualImpact && (
                      <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                         <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">Residual Exposure</p>
                         <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-blue-700">{(selectedRisk.residualImpact || 0) * (selectedRisk.residualLikelihood || 0)}</span>
                            <span className="text-[9px] font-black text-blue-400 uppercase">/ 25</span>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Risk Narrative</h4>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed font-serif italic border-l-4 border-slate-100 pl-6">
                      "{selectedRisk.description}"
                    </p>
                    {selectedRisk.rootCause && (
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Root Cause Analysis</p>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedRisk.rootCause}</p>
                      </div>
                    )}
                    {selectedRisk.consequences && (
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Analysis</p>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedRisk.consequences}</p>
                      </div>
                    )}
                  </div>

                  {selectedRisk.existingControls && (
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Control Environment</h4>
                       <p className="text-xs font-medium text-slate-700 leading-relaxed">{selectedRisk.existingControls}</p>
                       <div className="flex gap-4 pt-2">
                          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 uppercase">
                            Effectiveness: {selectedRisk.controlEffectiveness || 'N/A'}
                          </span>
                          <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 uppercase">
                            Strategy: {selectedRisk.treatmentStrategy || 'N/A'}
                          </span>
                       </div>
                    </div>
                  )}

                  <div className="p-8 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden">
                     <p className="text-[10px] font-black opacity-60 uppercase mb-4">Custodian</p>
                     <p className="text-3xl font-black uppercase tracking-tighter">{selectedRisk.owner}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl -mr-12 -mt-12" />
                     <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6">AI Chain of Thought (CoT) Log</h4>
                     <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                       "Computed based on cross-referencing document <strong>POL-CG-01 (Corporate Governance)</strong> with live audit finding <strong>A-22 (Privileged Access)</strong>. Logic inferred high impact due to lack of offsetting technical control mapped in the Regulatory Monitor."
                     </p>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Source Data Provenance</h4>
                    <div className="space-y-4">
                      {[
                        { type: 'Policy', label: 'InfoSec Standards v2.1', id: 'POL-IT-01', hash: 'SHA256:7f8e...' },
                        { type: 'Asset', label: 'Mainframe Gateway 04', id: 'AST-003', hash: 'SHA256:bb12...' },
                        { type: 'Regulatory', label: 'Cybercrimes Act Sect 12', id: 'REG-03', hash: 'SHA256:99da...' }
                      ].map((evidence, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white border-2 border-slate-50 rounded-2xl group hover:border-blue-100 transition-all">
                           <div className="flex gap-4 items-center">
                              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[8px] font-black uppercase shadow-inner">REF</span>
                              <div>
                                 <p className="text-xs font-black text-slate-800 uppercase">{evidence.label}</p>
                                 <p className="text-[9px] text-slate-400 font-mono mt-0.5">{evidence.id} • {evidence.hash}</p>
                              </div>
                           </div>
                           <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100">View Source →</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-green-50 border-2 border-green-100 rounded-[2.5rem] flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-green-100">⚖️</div>
                    <div>
                      <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Board-Level Ratification</p>
                      <p className="text-xs font-bold text-slate-800 uppercase">Human-Verified on 2024-03-18</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-medium">Verified by: CRO (Jane Doe)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRegister;
