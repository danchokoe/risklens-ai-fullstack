
import React, { useState, useMemo } from 'react';
import { MOCK_ASSETS, MOCK_VULNERABILITIES } from '../constants';
import { analyzeAssetRisks, analyzeIndividualAssetHealth } from '../ollamaService';
import { DigitalAsset, AssetStatus, RiskLevel } from '../types';
import BulkImportPanel from './BulkImportPanel';

const AssetRegistry: React.FC = () => {
  const [assets, setAssets] = useState<DigitalAsset[]>(MOCK_ASSETS.map(a => ({...a, healthScore: a.riskLevel === 'Critical' ? 45 : 88})));
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Individual Health Audit State
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [healthReport, setHealthReport] = useState<any | null>(null);

  const handleImportComplete = (newRecords: any[]) => {
    const formatted: DigitalAsset[] = newRecords.map((pa, idx) => ({
      ...pa,
      id: `AST-B-${Date.now()}-${idx}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      warrantyExpiration: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
      status: 'Active',
      owner: 'System Auto-Ingest',
      location: pa.location || 'Unknown',
      healthScore: 100 // Default for new
    } as DigitalAsset));
    
    setAssets([...formatted, ...assets]);
    setIsImporting(false);
  };

  const handleAIAnalysis = async () => {
    setLoading(true);
    setAiAnalysis(null);
    try {
      const dataStr = assets.map(a => `ID:${a.id}, Risk:${a.riskLevel}, Health:${a.healthScore}`).join('; ');
      const res = await analyzeAssetRisks(dataStr);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runDeepHealthAudit = async (asset: DigitalAsset) => {
    setAuditingId(asset.id);
    setHealthReport(null);
    try {
      const relatedVulns = MOCK_VULNERABILITIES.filter(v => v.assetId === asset.id);
      const res = await analyzeIndividualAssetHealth(asset, relatedVulns);
      setHealthReport(res);
      // Update asset health score in state
      setAssets(assets.map(a => a.id === asset.id ? { ...a, healthScore: res.healthScore } : a));
      if (selectedAsset?.id === asset.id) {
         setSelectedAsset({ ...selectedAsset, healthScore: res.healthScore });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditingId(null);
    }
  };

  const getHealthColor = (score?: number) => {
    if (score === undefined) return 'bg-slate-200';
    if (score > 85) return 'bg-green-500';
    if (score > 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8 pb-20">
      {isImporting && (
        <BulkImportPanel 
          moduleName="Asset"
          templateHeaders={['name', 'manufacturer', 'type', 'serialNumber', 'value', 'riskLevel', 'responsibleTeam']}
          onImportComplete={handleImportComplete}
          onCancel={() => setIsImporting(false)}
        />
      )}

      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Infrastructure Vault</h2>
          <p className="text-slate-500 font-medium mt-2">Enterprise hardware registry with AI-driven predictive health telemetry.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleAIAnalysis}
             className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all uppercase text-xs tracking-widest flex items-center gap-2"
           >
             {loading ? 'Synthesizing...' : '✨ Global Portfolio Diagnostic'}
           </button>
           <button 
             onClick={() => setIsImporting(true)}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all uppercase text-xs tracking-widest"
           >
             📂 Bulk Ingest Excel
           </button>
           <button 
             onClick={() => setIsRegistering(true)}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all uppercase text-xs tracking-widest"
           >
             Register New Asset
           </button>
        </div>
      </header>

      {aiAnalysis && (
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
           <div className="flex justify-between items-start mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                RiskLens AI: Portfolio Health Report
              </h3>
              <button onClick={() => setAiAnalysis(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1 border-r border-white/10 pr-12">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Aggregate Index</p>
                 <p className="text-7xl font-black tracking-tighter text-white">{aiAnalysis.healthScore}%</p>
                 <div className="mt-4 w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.5)]" style={{ width: `${aiAnalysis.healthScore}%` }} />
                 </div>
              </div>
              <div className="md:col-span-3">
                 <p className="text-sm leading-relaxed text-slate-300 italic font-medium mb-6">"{aiAnalysis.summary}"</p>
                 <div className="grid grid-cols-2 gap-6">
                    {aiAnalysis.recommendations.map((rec: string, i: number) => (
                       <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-bold uppercase tracking-wide text-slate-400 flex gap-3">
                          <span className="text-blue-500">✓</span> {rec}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Asset Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Identity</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lifecycle Status</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Health Index</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {assets.map((asset) => (
              <tr key={asset.id} onClick={() => { setSelectedAsset(asset); setHealthReport(null); }} className={`hover:bg-slate-50 transition-all cursor-pointer group ${selectedAsset?.id === asset.id ? 'bg-blue-50/30' : ''}`}>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      {asset.type === 'Server' ? '🖥️' : asset.type === 'Network' ? '🌐' : '💻'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{asset.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1 tracking-tight">{asset.manufacturer} • {asset.serialNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    asset.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                    asset.status === 'Risk Flagged' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>{asset.status}</span>
                </td>
                <td className="px-10 py-8">
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(asset.healthScore)} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                      <span className="text-xs font-black text-slate-800">{asset.healthScore || '??'}%</span>
                   </div>
                </td>
                <td className="px-10 py-8">
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                     asset.riskLevel === 'Critical' ? 'bg-red-600 text-white border-red-600' : 
                     asset.riskLevel === 'High' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-100 text-slate-600 border-slate-200'
                   }`}>{asset.riskLevel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trust-Enhanced Asset Detail Panel */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[70] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right-full duration-500 flex flex-col overflow-hidden relative">
            <div className="p-10 flex border-b border-slate-50 bg-slate-50/30">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">📦</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">{selectedAsset.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAsset.id} • Identity Verified</p>
                  </div>
               </div>
               <button onClick={() => setSelectedAsset(null)} className="ml-auto text-slate-300 hover:text-slate-900 text-3xl transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-16 space-y-12">
               {/* Health Score Component */}
               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="flex justify-between items-end mb-10">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Asset Health Index</p>
                        <div className="flex items-baseline gap-3">
                           <span className="text-7xl font-black tracking-tighter">{selectedAsset.healthScore || 'N/A'}%</span>
                           <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                             (selectedAsset.healthScore || 0) > 85 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                           }`}>
                             {(selectedAsset.healthScore || 0) > 85 ? 'OPTIMIZED' : 'DEGRADED'}
                           </span>
                        </div>
                     </div>
                     <button 
                       onClick={() => runDeepHealthAudit(selectedAsset)}
                       disabled={auditingId === selectedAsset.id}
                       className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                     >
                       {auditingId === selectedAsset.id ? 'Auditing...' : '⚡ Deep Health Audit'}
                     </button>
                  </div>

                  {healthReport ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                       <div className="pt-6 border-t border-white/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Health Decomposition Logic</p>
                          <div className="space-y-3">
                             {healthReport.decomposition.map((factor: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                   <span className="text-blue-500 mt-0.5">•</span>
                                   <p className="text-[11px] font-medium text-slate-300 leading-relaxed">{factor}</p>
                                </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-6 bg-blue-600 rounded-[2rem] shadow-xl">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-100 mb-2">Mandatory Recommendation</p>
                          <p className="text-xs font-bold leading-relaxed">{healthReport.recommendation}</p>
                       </div>
                    </div>
                  ) : (
                    <div className="pt-6 border-t border-white/10 text-center py-10 opacity-30">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Run deep audit to manifest health decomposition</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Deployment Value</p>
                     <p className="text-2xl font-black text-slate-900 uppercase">R{(selectedAsset.value / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Warranty Status</p>
                     <p className={`text-xs font-black uppercase ${new Date(selectedAsset.warrantyExpiration) < new Date() ? 'text-red-500' : 'text-slate-800'}`}>
                        Exp: {selectedAsset.warrantyExpiration}
                        {new Date(selectedAsset.warrantyExpiration) < new Date() && ' (EXPIRED)'}
                     </p>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Physical Context</h4>
                  <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] space-y-4">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Manufacturer</span>
                        <span className="font-black text-slate-800 uppercase tracking-tighter">{selectedAsset.manufacturer}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Serial Identification</span>
                        <span className="font-mono text-xs font-bold text-slate-800">{selectedAsset.serialNumber}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Data Center Node</span>
                        <span className="font-black text-slate-800 uppercase tracking-tighter">{selectedAsset.location}</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Linked Vulnerabilities</h4>
                  <div className="space-y-3">
                     {MOCK_VULNERABILITIES.filter(v => v.assetId === selectedAsset.id).map(v => (
                        <div key={v.id} className="flex items-center justify-between p-6 bg-red-50 border-2 border-red-100 rounded-2xl group hover:border-red-500 transition-all">
                           <div className="flex gap-4 items-center">
                              <span className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-red-600/20">!</span>
                              <div>
                                 <p className="text-xs font-black text-slate-900 uppercase leading-none">{v.title}</p>
                                 <p className="text-[9px] text-red-500 font-mono mt-1 uppercase">{v.severity} • {v.cveId || 'INT-VUL'}</p>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{v.discoveredAt}</span>
                        </div>
                     ))}
                     {MOCK_VULNERABILITIES.filter(v => v.assetId === selectedAsset.id).length === 0 && (
                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active CVEs Mapped</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
               <button className="py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all">Schedule Maintenance</button>
               <button className="py-4 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-slate-300 transition-all">Retire Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRegistry;
