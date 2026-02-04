
import React, { useState, useEffect } from 'react';
import { MOCK_DOCUMENTS } from '../constants';
import { ManagedDocument, DocStatus, ApprovalStep, User, ReviewCycle } from '../types';
import { draftManagedDocument, editDocumentWithAI, suggestDocumentImprovements, generateUpdateDraft } from '../ollamaService';

interface DocumentManagementProps {
  currentUser: User | null;
  onToast: (msg: string, type?: 'success' | 'info') => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ currentUser, onToast }) => {
  const [documents, setDocuments] = useState<ManagedDocument[]>(MOCK_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<ManagedDocument | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftCycle, setDraftCycle] = useState<ReviewCycle>('1 Year');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'editor' | 'workflow'>('list');

  // Editor/Collaboration State
  const [editInstruction, setEditInstruction] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const AI_REVISION_PRESETS = [
    { label: 'Summarize', prompt: 'Add a 3-sentence executive summary to the top of this document.' },
    { label: 'Formalize Tone', prompt: 'Rewrite the entire document to be extremely formal and authoritative.' },
    { label: 'Compliance Audit', prompt: 'Identify 3 potential regulatory gaps in this text and suggest additions.' },
    { label: 'Simplify', prompt: 'Simplify complex jargon into plain English for easier staff comprehension.' }
  ];

  const calculateNextReviewDate = (cycle: ReviewCycle): string => {
    const d = new Date();
    switch (cycle) {
      case '6 Months': d.setMonth(d.getMonth() + 6); break;
      case '1 Year': d.setFullYear(d.getFullYear() + 1); break;
      case '2 Years': d.setFullYear(d.getFullYear() + 2); break;
      case '3 Years': d.setFullYear(d.getFullYear() + 3); break;
    }
    return d.toISOString().split('T')[0];
  };

  const isReviewImminent = (nextReviewDate: string) => {
    const next = new Date(nextReviewDate);
    const today = new Date();
    const twoMonthsAway = new Date();
    twoMonthsAway.setMonth(today.getMonth() + 2);
    return next <= twoMonthsAway;
  };

  const pushToHistory = (content: string) => {
    setHistory(prev => [content, ...prev].slice(0, 10)); // Keep last 10 versions
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previous = history[0];
      setEditorContent(previous);
      setHistory(prev => prev.slice(1));
      onToast("Reverted to previous version", "info");
    }
  };

  const handleCreateDraft = async () => {
    if (!draftPrompt) return;
    setLoading(true);
    try {
      const nrd = calculateNextReviewDate(draftCycle);
      const content = await draftManagedDocument(draftPrompt, "RiskLens Enterprise GRC Framework", draftCycle, nrd);
      const newDoc: ManagedDocument = {
        id: `DOC-${Math.floor(100 + Math.random() * 899)}`,
        title: draftPrompt.length > 30 ? draftPrompt.substring(0, 30) + '...' : draftPrompt,
        content,
        status: 'Draft',
        version: '0.1',
        owner: currentUser?.name || 'Unknown',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        reviewCycle: draftCycle,
        nextReviewDate: nrd,
        approvals: [],
        signatures: []
      };
      setDocuments([newDoc, ...documents]);
      setSelectedDoc(newDoc);
      setEditorContent(content);
      setHistory([]);
      setIsDrafting(false);
      setView('editor');
      onToast("PDF Draft Materialized", "success");
    } catch (err) {
      console.error("Drafting error:", err);
      onToast("AI Synthesis Failed", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleAICollaborate = async (presetPrompt?: string) => {
    const instruction = presetPrompt || editInstruction;
    if (!instruction || !selectedDoc) return;

    pushToHistory(editorContent);
    setIsAIProcessing(true);
    try {
      const updated = await editDocumentWithAI(editorContent, instruction);
      setEditorContent(updated);
      setEditInstruction('');
      onToast("AI Revision Applied", "success");
    } catch (err) {
      console.error("AI Edit error:", err);
      onToast("AI Collaboration Failed", "info");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleGenerateUpdateDraft = async () => {
    if (!selectedDoc) return;
    setIsAIProcessing(true);
    pushToHistory(editorContent);
    try {
      const updated = await generateUpdateDraft(editorContent, selectedDoc.title);
      setEditorContent(updated);
      onToast("AI Review Update Applied", "success");
    } catch (err) {
      console.error(err);
      onToast("Update Synthesis Failed", "info");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleComplianceScan = async () => {
    if (!selectedDoc) return;
    setIsAIProcessing(true);
    setSuggestions(null);
    try {
      const res = await suggestDocumentImprovements(editorContent);
      setSuggestions(res);
      onToast("Compliance Scan Complete", "success");
    } catch (err) {
      console.error(err);
      onToast("Scan Failed", "info");
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleSaveAndSubmit = () => {
    if (!selectedDoc) return;
    const updatedDocs = documents.map(d => 
      d.id === selectedDoc.id 
        ? { 
            ...d, 
            content: editorContent, 
            status: 'Awaiting Approval' as DocStatus,
            updatedAt: new Date().toISOString().split('T')[0]
          } 
        : d
    );
    setDocuments(updatedDocs);
    setView('list');
    setSelectedDoc(null);
    onToast("Document Workflow Updated", "success");
  };

  // Approval Assignment State
  const [newApproverName, setNewApproverName] = useState('');
  const [newApproverRole, setNewApproverRole] = useState('');

  const handleAddApprover = () => {
    if (!selectedDoc || !newApproverName || !newApproverRole) return;
    const newStep: ApprovalStep = {
      id: `APP-${Date.now()}`,
      approverName: newApproverName,
      role: newApproverRole,
      status: 'Pending'
    };
    
    const updatedDoc = { ...selectedDoc, approvals: [...selectedDoc.approvals, newStep] };
    setSelectedDoc(updatedDoc);
    setDocuments(documents.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    setNewApproverName('');
    setNewApproverRole('');
    onToast("Approver Delegated", "info");
  };

  const handleDigitalSeal = () => {
    if (!selectedDoc || !currentUser) return;
    
    // Generate a pseudo-cryptographic hash for the signature
    const hashData = `${selectedDoc.id}-${currentUser.id}-${Date.now()}-${Math.random()}`;
    const hash = `sha256:${btoa(hashData).substring(0, 48)}`;

    const signature = {
      id: `SIG-${Date.now()}`,
      signerName: currentUser.name,
      signerRole: currentUser.role,
      timestamp: new Date().toLocaleString(),
      hash: hash
    };

    const updatedDoc: ManagedDocument = {
      ...selectedDoc,
      signatures: [...selectedDoc.signatures, signature],
      status: 'Approved'
    };

    setDocuments(documents.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    setSelectedDoc(updatedDoc);
    
    onToast("Document Ratified & Sealed", "success");
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const getStatusBadge = (status: DocStatus) => {
    const styles: Record<DocStatus, string> = {
      'Approved': 'bg-green-100 text-green-700 border-green-200',
      'Awaiting Approval': 'bg-amber-100 text-amber-700 border-amber-200',
      'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
      'In Review': 'bg-blue-100 text-blue-700 border-blue-200',
      'Archived': 'bg-slate-50 text-slate-400 border-slate-100'
    };
    return styles[status] || styles['Draft'];
  };

  const dueForReview = selectedDoc ? isReviewImminent(selectedDoc.nextReviewDate) : false;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Governance PDF Studio</h2>
          <p className="text-slate-500 font-medium">Draft, collaborate, and ratify enterprise PDF documents with AI-led precision.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setIsDrafting(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all uppercase text-xs tracking-widest flex items-center gap-2"
          >
            <span className="text-xl">✨</span> New PDF Draft
          </button>
        )}
        {view !== 'list' && (
          <button 
            onClick={() => { setView('list'); setSelectedDoc(null); setSuggestions(null); }}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest"
          >
            ← Back to PDF Repository
          </button>
        )}
      </header>

      {isDrafting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6 no-print">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-12 animate-in zoom-in-95 duration-200">
            <div className="mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">PDF Policy Architect</h3>
              <p className="text-slate-400 text-sm font-medium">Provide a high-level prompt and RiskLens AI will generate a structured PDF draft.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Policy Intent / Prompt</label>
                <textarea 
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  placeholder="e.g. Draft a 2024 Remote Work Security Policy with a focus on MFA and device encryption requirements."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none resize-none h-48 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mandatory Review Cycle</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['6 Months', '1 Year', '2 Years', '3 Years'] as ReviewCycle[]).map(cycle => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setDraftCycle(cycle)}
                      className={`px-4 py-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                        draftCycle === cycle ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {cycle}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-3 italic">* Reminders will automatically trigger 2 months prior to expiry.</p>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={handleCreateDraft}
                disabled={loading || !draftPrompt}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-2xl shadow-blue-500/20 transition-all uppercase text-xs tracking-[0.2em] disabled:opacity-50"
              >
                {loading ? 'Synthesizing PDF...' : 'Synthesize Official PDF Draft'}
              </button>
              <button onClick={() => setIsDrafting(false)} className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 no-print">
          {documents.map((doc) => {
             const imminent = isReviewImminent(doc.nextReviewDate);
             return (
              <div key={doc.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-blue-100 transition-all group relative">
                {imminent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg animate-bounce">
                    ⚠️ Review Required Soon
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono font-bold tracking-tighter">RL-PDF-{doc.id.split('-')[1]}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tighter mb-4 leading-tight uppercase group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>PDF Owner</span>
                    <span className="text-slate-800">{doc.owner}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Cycle</span>
                    <span className="text-slate-800 font-mono">{doc.reviewCycle}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Next Review</span>
                    <span className={`font-bold ${imminent ? 'text-red-600' : 'text-slate-800'}`}>{doc.nextReviewDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Signatures</span>
                    <span className={`font-bold ${doc.signatures.length > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                      {doc.signatures.length > 0 ? '✓ VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setSelectedDoc(doc); setEditorContent(doc.content); setView('editor'); }}
                    className="bg-slate-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                  >
                    View PDF
                  </button>
                  <button 
                    onClick={() => { setSelectedDoc(doc); setView('workflow'); }}
                    className="bg-slate-50 text-slate-500 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Workflow
                  </button>
                </div>
                {imminent && (
                  <button 
                    onClick={() => { setSelectedDoc(doc); setEditorContent(doc.content); setView('editor'); }}
                    className="w-full mt-3 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-100"
                  >
                    🚀 Initiate AI-Led Review
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : view === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 h-[850px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main Editing Area */}
          <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative print:bg-white print:shadow-none print:border-none print:h-auto print:rounded-none">
             <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/20 no-print">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">PDF</div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase truncate w-64">{selectedDoc?.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise PDF Management</p>
                  </div>
                </div>
                <div className="flex gap-4">
                   {history.length > 0 && selectedDoc?.status !== 'Approved' && (
                     <button 
                       onClick={handleUndo}
                       className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                       title="Undo AI Change"
                     >
                       ↩ Undo
                     </button>
                   )}
                   <button onClick={handleDownloadPDF} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Download PDF</button>
                   {selectedDoc?.status !== 'Approved' && (
                     <button onClick={handleSaveAndSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">Submit Revision</button>
                   )}
                </div>
             </div>
             {dueForReview && (
               <div className="bg-red-600 text-white px-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex justify-between items-center animate-pulse shrink-0 no-print">
                 <span>⚠️ This document is within the 2-month review cycle threshold</span>
                 <span>Review Date: {selectedDoc?.nextReviewDate}</span>
               </div>
             )}
             <div className="flex-1 p-16 overflow-y-auto relative bg-white print:p-0">
                {isAIProcessing && (
                  <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center no-print">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                       <p className="text-xs font-black text-slate-900 uppercase tracking-widest animate-pulse">AI Synthesis in progress...</p>
                    </div>
                  </div>
                )}
                <textarea 
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  readOnly={selectedDoc?.status === 'Approved'}
                  className={`w-full h-full font-serif text-lg leading-loose outline-none text-black resize-none bg-white custom-scrollbar print:whitespace-pre-wrap print:overflow-visible print:italic-none`}
                  style={{ minHeight: '100%' }}
                />
             </div>
             
             {/* Dynamic Signature Visual */}
             {selectedDoc?.signatures.map((sig, idx) => (
                <div 
                  key={sig.id}
                  className="absolute bottom-10 right-10 p-8 border-4 border-blue-600/20 bg-white/95 backdrop-blur rounded-[2rem] pointer-events-none transform -rotate-3 shadow-2xl z-20 print:shadow-none print:rotate-0 print:border-slate-100"
                  style={{ transform: `rotate(${-3 + idx}deg) translateY(${-idx * 10}px)` }}
                >
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Digitally Sealed PDF</p>
                   </div>
                   <p className="font-serif italic text-3xl text-black opacity-90">{sig.signerName}</p>
                   <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">{sig.timestamp}</p>
                   <p className="text-[7px] font-mono text-slate-400 mt-1 uppercase truncate w-40">{sig.hash}</p>
                </div>
             ))}
          </div>

          {/* AI Side Panel */}
          <div className="space-y-6 flex flex-col h-full no-print">
            {dueForReview && (
              <div className="bg-red-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-right-4 duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-6">AI Review Assistant</h4>
                <p className="text-xs font-medium leading-relaxed mb-6">This policy requires formal review. RiskLens AI can suggest an updated draft based on recent governance trends.</p>
                <button 
                  onClick={handleGenerateUpdateDraft}
                  disabled={isAIProcessing}
                  className="w-full py-4 bg-white text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  {isAIProcessing ? 'Analyzing...' : '✨ Generate Update Draft'}
                </button>
              </div>
            )}

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex-1 flex flex-col">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-8">AI Assistant Panel</h4>
               
               <div className="space-y-4 mb-6">
                 <button 
                   onClick={handleComplianceScan}
                   disabled={isAIProcessing || selectedDoc?.status === 'Approved'}
                   className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                 >
                   🔍 Run Compliance Scan
                 </button>
               </div>

               <div className="space-y-4 mb-8">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Revision Presets</p>
                 <div className="grid grid-cols-2 gap-2">
                    {AI_REVISION_PRESETS.map((p) => (
                      <button 
                        key={p.label}
                        onClick={() => handleAICollaborate(p.prompt)}
                        disabled={selectedDoc?.status === 'Approved'}
                        className="text-left p-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider disabled:opacity-30"
                      >
                        {p.label}
                      </button>
                    ))}
                 </div>
               </div>

               <div className="flex-1 flex flex-col min-h-0">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Custom AI Instructions</p>
                 <textarea 
                   value={editInstruction}
                   onChange={(e) => setEditInstruction(e.target.value)}
                   disabled={selectedDoc?.status === 'Approved'}
                   placeholder={selectedDoc?.status === 'Approved' ? "PDF is locked." : "e.g. Rewrite the liability clause for POPIA compliance..."}
                   className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium focus:ring-4 focus:ring-blue-500/10 outline-none resize-none transition-all mb-4 text-white placeholder-slate-700 disabled:opacity-30"
                 />
                 <button 
                   onClick={() => handleAICollaborate()}
                   disabled={isAIProcessing || !editInstruction || selectedDoc?.status === 'Approved'}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                 >
                   {isAIProcessing ? 'Collaborating...' : 'Apply AI Revisions'}
                 </button>
               </div>
            </div>

            {suggestions && (
              <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white animate-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[300px] custom-scrollbar">
                 <div className="flex justify-between items-start mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">Compliance Suggestions</h4>
                    <button onClick={() => setSuggestions(null)} className="text-blue-200 hover:text-white transition-colors">✕</button>
                 </div>
                 <div className="text-[10px] font-medium leading-relaxed whitespace-pre-wrap opacity-90">
                    {suggestions}
                 </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Ratification Queue</h4>
               <div className="space-y-3">
                 {selectedDoc?.approvals.length === 0 && (
                   <p className="text-[10px] text-slate-400 italic">No approvers assigned.</p>
                 )}
                 {selectedDoc?.approvals.map((app) => (
                   <div key={app.id} className="flex gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                       app.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                     }`}>
                       {app.status === 'Approved' ? '✓' : '!'}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[10px] font-black text-slate-800 uppercase truncate">{app.approverName}</p>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter truncate">{app.role}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 no-print">
           <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl p-16">
              <div className="flex justify-between items-start border-b border-slate-50 pb-12 mb-12">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedDoc?.title}</h3>
                    <div className="flex items-center gap-4">
                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Master PDF Workflow & Governance Matrix</span>
                       <div className="h-4 w-px bg-slate-200" />
                       <span className="text-blue-600 text-[10px] font-black uppercase tracking-widest">v{selectedDoc?.version} PDF FINAL</span>
                    </div>
                 </div>
                 <div className={`px-8 py-3 rounded-2xl border-2 font-black uppercase text-xs tracking-widest ${getStatusBadge(selectedDoc!.status)}`}>
                   {selectedDoc?.status}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                 {/* Left Column: Approvals */}
                 <div className="space-y-10">
                    <div className="flex justify-between items-center mb-4">
                       <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Approval Matrix</h4>
                       <span className="text-[10px] font-bold text-blue-600 uppercase">Status Tracking</span>
                    </div>
                    
                    <div className="space-y-8 relative">
                       <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
                       
                       <div className="flex gap-8 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs shadow-lg shadow-green-600/20">✓</div>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Initial PDF Generation</p>
                             <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Owner: {selectedDoc?.owner} • {selectedDoc?.createdAt}</p>
                          </div>
                       </div>

                       {selectedDoc?.approvals.map((app) => (
                         <div key={app.id} className="flex gap-8 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg ${
                              app.status === 'Approved' ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-amber-100 text-amber-600 border border-amber-200'
                            }`}>
                              {app.status === 'Approved' ? '✓' : '!'}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{app.approverName}</p>
                               <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{app.role} • {app.status}</p>
                            </div>
                         </div>
                       ))}

                       <div className="flex gap-8 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs shadow-sm">+</div>
                          <div className="flex-1 space-y-4">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Assign Next PDF Approver</p>
                             <div className="grid grid-cols-2 gap-3">
                                <input 
                                  value={newApproverName}
                                  onChange={(e) => setNewApproverName(e.target.value)}
                                  placeholder="Full Name" 
                                  className="text-[10px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                                />
                                <input 
                                  value={newApproverRole}
                                  onChange={(e) => setNewApproverRole(e.target.value)}
                                  placeholder="Role (e.g. CEO)" 
                                  className="text-[10px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold"
                                />
                             </div>
                             <button 
                                onClick={handleAddApprover}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                             >
                               Assign To Individual
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Signatures */}
                 <div className="space-y-10">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Digital PDF Attestation</h4>
                    <div className="p-10 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20 flex flex-col items-center justify-center text-center">
                       {selectedDoc?.signatures.length ? (
                          <div className="space-y-8 animate-in zoom-in-95 duration-500">
                             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">🔒</div>
                             <div>
                                <p className="text-base font-black text-slate-900 uppercase tracking-widest leading-tight">PDF Sealed & Encrypted</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed max-w-xs mx-auto">This PDF record is immutable and verified within the organization's enterprise trust chain.</p>
                             </div>
                             <div className="pt-8 border-t border-slate-200 w-full space-y-4">
                                {selectedDoc.signatures.map((sig) => (
                                  <div key={sig.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="font-serif italic text-xl text-slate-800 opacity-70 mb-1">{sig.signerName}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sig.signerRole}</p>
                                    <p className="text-[7px] font-mono text-slate-300 break-all mt-2">{sig.hash}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-10">
                             <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-white shadow-lg">✍️</div>
                             <div>
                                <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Apply Official Signature</h5>
                                <p className="text-[10px] text-slate-400 font-medium mt-4 leading-relaxed max-w-xs mx-auto">
                                  You are signing as <span className="text-blue-600 font-black">{currentUser?.name}</span>. 
                                  This will seal the PDF and create an immutable record in the AI Audit Trail.
                                </p>
                             </div>
                             <button 
                                onClick={handleDigitalSeal}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                             >
                               <span className="text-lg">✒️</span> Sign & Ratify PDF
                             </button>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          main { margin-left: 0 !important; padding: 0 !important; }
          #root > div > main { margin-left: 0 !important; }
          textarea { border: none !important; resize: none !important; height: auto !important; width: 100% !important; background: white !important; color: black !important; }
        }
      `}} />
    </div>
  );
};

export default DocumentManagement;
