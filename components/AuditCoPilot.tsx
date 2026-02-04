
import React, { useState, useEffect } from 'react';
import { MOCK_AUDITS as INITIAL_AUDITS } from '../constants';
import { AuditFinding, RiskLevel } from '../types';
import { draftAuditResponse, analyzeAuditRootCause, generateAuditInsights } from '../ollamaService';
import BulkImportPanel from './BulkImportPanel';

interface AuditCoPilotProps {
  onToast: (msg: string, type?: 'success' | 'info') => void;
}

const AuditCoPilot: React.FC<AuditCoPilotProps> = ({ onToast }) => {
  const [audits, setAudits] = useState<AuditFinding[]>(INITIAL_AUDITS);
  const [selectedAudit, setSelectedAudit] = useState<AuditFinding | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Operation States
  const [drafting, setDrafting] = useState(false);
  const [analyzingEvidence, setAnalyzingEvidence] = useState(false);
  
  // Content States
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<string | null>(null);
  const [portfolioInsights, setPortfolioInsights] = useState<{
    maturityScore: number;
    maturityTrend: string;
    topRisks: { title: string; description: string }[];
  } | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const auditStr = audits.map(a => `${a.title} (${a.severity}) - ${a.department}`).join(', ');
      try {
        const insights = await generateAuditInsights(auditStr);
        if (insights) setPortfolioInsights(insights);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, [audits]);

  const handleImportComplete = (newRecords: any[]) => {
    const formatted: AuditFinding[] = newRecords.map((rec, i) => ({
      ...rec,
      id: `A-IMP-${Date.now()}-${i}`,
      severity: (rec.severity || 'Medium') as RiskLevel,
      completionStatus: Number(rec.completionStatus) || 0,
      dueDate: rec.dueDate || new Date().toISOString().split('T')[0]
    } as AuditFinding));
    
    setAudits([...formatted, ...audits]);
    setIsImporting(false);
    onToast(`Imported ${formatted.length} findings`, "success");
  };

  const handleDraftResponse = async () => {
    if (!selectedAudit) return;
    setDrafting(true);
    setAiDraft(null);
    try {
      const response = await draftAuditResponse(selectedAudit.title, selectedAudit.severity, selectedAudit.department);
      setAiDraft(response);
      onToast("Response Draft Generated", "success");
    } catch (err) {
      console.error(err);
      onToast("Drafting Failed", "info");
    } finally {
      setDrafting(false);
    }
  };

  const handleAnalyzeEvidence = async () => {
    if (!selectedAudit) return;
    setAnalyzingEvidence(true);
    setEvidenceAnalysis(null);
    try {
      const response = await analyzeAuditRootCause(selectedAudit.title, selectedAudit.severity);
      setEvidenceAnalysis(response);
      onToast("Root Cause Analysis Complete", "success");
    } catch (err) {
      console.error(err);
      onToast("Analysis Failed", "info");
    } finally {
      setAnalyzingEvidence(false);
    }
  };

  return (
    <div className="space-y-6">
      {isImporting && (
        <BulkImportPanel 
          moduleName="Audit"
          templateHeaders={['title', 'severity', 'department', 'dueDate', 'completionStatus']}
          onImportComplete={handleImportComplete}
          onCancel={() => setIsImporting(false)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase leading-none">Audit & Assurance Co-Pilot</h2>
          <p className="text-slate-500 font-medium mt-2">Smart tracking of findings and assurance maturity scoring.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setIsImporting(true)}
             className="bg-white border-2 border-slate-100 hover:border-blue-500 text-slate-900 px-6 py-2.5 rounded-xl font-black shadow-sm uppercase text-[10px] tracking-widest transition-all"
           >
             📂 Bulk Import Excel
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm col-span-2 flex flex-col min-h-[700px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Assurance Portfolio</h3>
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-200">
                {audits.filter(a => a.completionStatus < 100 && new Date(a.dueDate) < new Date()).length} Overdue
              </span>
              <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200">
                {audits.filter(a => a.completionStatus < 100).length} Pending
              </span>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {audits.map((finding) => (
              <button 
                key={finding.id} 
                onClick={() => { setSelectedAudit(finding); setAiDraft(null); setEvidenceAnalysis(null); }}
                className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${
                  selectedAudit?.id === finding.id ? 'border-blue-600 bg-blue-50/20 shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{finding.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Department: {finding.department}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${
                    finding.severity === 'High' || finding.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {finding.severity}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Assurance Progress</span>
                    <span className="text-slate-800">{finding.completionStatus}% Verified</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${finding.completionStatus === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                      style={{ width: `${finding.completionStatus}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {selectedAudit ? (
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col h-[700px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-8">Remediation Workbench</h4>
                <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Finding</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-tight">{selectedAudit.title}</p>
                   </div>
                   <div className="grid grid-cols-1 gap-3 shrink-0">
                     <button onClick={handleAnalyzeEvidence} disabled={analyzingEvidence} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2">
                       {analyzingEvidence ? 'Analyzing...' : '🔍 Analyze Root Cause & Evidence'}
                     </button>
                     <button onClick={handleDraftResponse} disabled={drafting} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                       {drafting ? 'Synthesizing...' : '✨ Draft Management Response'}
                     </button>
                   </div>
                   <div className="flex-1 bg-slate-50/50 border border-slate-100 rounded-3xl p-6 relative">
                      {evidenceAnalysis ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Root Cause Analysis</p>
                          <div className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">{evidenceAnalysis}</div>
                        </div>
                      ) : aiDraft ? (
                        <div className="animate-in fade-in duration-500">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2">Draft Response</p>
                          <div className="text-sm font-medium text-slate-800 leading-loose whitespace-pre-wrap italic">{aiDraft}</div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                           <div className="text-4xl mb-4 opacity-20">🤖</div>
                           <p className="text-[9px] font-black uppercase tracking-[0.2em]">AI Idle</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          ) : (
             <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden h-[300px]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">Assurance Maturity</h3>
               {portfolioInsights ? (
                 <div className="flex flex-col items-center py-6 animate-in fade-in duration-700">
                   <div className="text-6xl font-black text-white tracking-tighter mb-2">{portfolioInsights.maturityScore}</div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Maturity Index</div>
                 </div>
               ) : (
                 <div className="flex items-center justify-center h-full">
                   <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditCoPilot;
