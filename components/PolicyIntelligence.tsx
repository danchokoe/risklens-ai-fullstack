
import React, { useState, useRef, useMemo } from 'react';
import { MOCK_POLICIES } from '../constants';
import { analyzePolicyGap, generatePolicySOP, generateRemediationContent, ingestPolicyDocument } from '../ollamaService';
import { ReviewCycle, Policy } from '../types';
import BulkImportPanel from './BulkImportPanel';

const PolicyIntelligence: React.FC = () => {
  const [activeView, setActiveView] = useState<'analyze' | 'generate' | 'ingest' | 'reminders'>('analyze');
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);
  const [selectedPolicy, setSelectedPolicy] = useState(policies[0]);
  const [framework, setFramework] = useState('ISO 27001');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Policy' | 'SOP'>('All');
  const [showOnlyDue, setShowOnlyDue] = useState(false);

  // Ingestion State
  const [ingestedPolicy, setIngestedPolicy] = useState<Partial<Policy> | null>(null);
  const fileInputRefIngest = useRef<HTMLInputElement>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  // Remediation State
  const [loadingRemediation, setLoadingRemediation] = useState<number | null>(null);
  const [remediationContent, setRemediationContent] = useState<Record<number, string>>({});

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(policies.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [policies]);

  const getDaysUntilReview = (nextReviewDate: string) => {
    const next = new Date(nextReviewDate);
    const today = new Date();
    const diffTime = next.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isReviewImminent = (nextReviewDate: string) => {
    const days = getDaysUntilReview(nextReviewDate);
    return days <= 60 && days >= 0;
  };

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesType = selectedType === 'All' || p.type === selectedType;
      const matchesDue = !showOnlyDue || isReviewImminent(p.nextReviewDate);
      return matchesSearch && matchesCategory && matchesType && matchesDue;
    });
  }, [policies, searchQuery, selectedCategory, selectedType, showOnlyDue]);

  const imminentPolicies = useMemo(() => policies.filter(p => isReviewImminent(p.nextReviewDate)), [policies]);
  const dueCount = imminentPolicies.length;

  // Generation State
  const [genDetails, setGenDetails] = useState({
    companyName: 'Chokoe Group',
    industry: 'Media & Technology',
    type: 'Policy' as 'Policy' | 'SOP',
    title: 'Data Classification and Handling',
    requirements: 'Must comply with POPIA and local data residency laws. Include specific encryption standards for cloud broadcasting assets.',
    logo: '',
    reviewCycle: '1 Year' as ReviewCycle,
    referencePolicyId: 'none'
  });

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

  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setRemediationContent({});
    try {
      const res = await analyzePolicyGap(selectedPolicy.name, framework);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await ingestPolicyDocument(base64, file.type);
        setIngestedPolicy(res);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to ingest document. Ensure the file is a readable PDF or Image.");
    }
  };

  const handleBulkImportComplete = (newRecords: any[]) => {
    const formatted: Policy[] = newRecords.map((rec, i) => {
      const cycle = (rec.reviewCycle as ReviewCycle) || '1 Year';
      return {
        ...rec,
        id: `POL-BULK-${Date.now()}-${i}`,
        type: (rec.type || 'Policy') as any,
        category: rec.category || 'General',
        lastReviewDate: new Date().toISOString().split('T')[0],
        nextReviewDate: calculateNextReviewDate(cycle),
        reviewCycle: cycle,
        complianceScore: Number(rec.complianceScore) || 70,
        status: (rec.status || 'Active') as any
      } as Policy;
    });
    
    setPolicies([...formatted, ...policies]);
    setIsBulkImporting(false);
  };

  const saveIngestedPolicy = () => {
    if (!ingestedPolicy) return;
    const nrd = calculateNextReviewDate((ingestedPolicy.reviewCycle as ReviewCycle) || '1 Year');
    const newPolicy: Policy = {
      id: `POL-ING-${Date.now()}`,
      name: ingestedPolicy.name || 'Untitled Policy',
      type: ingestedPolicy.type as any || 'Policy',
      category: ingestedPolicy.category || 'General',
      lastReviewDate: new Date().toISOString().split('T')[0],
      nextReviewDate: nrd,
      reviewCycle: (ingestedPolicy.reviewCycle as ReviewCycle) || '1 Year',
      complianceScore: ingestedPolicy.complianceScore || 70,
      status: 'Active'
    };
    setPolicies([newPolicy, ...policies]);
    setIngestedPolicy(null);
    setActiveView('analyze');
    setSelectedPolicy(newPolicy);
    alert("Policy ingested and saved to registry.");
  };

  const handleGenerateRemediation = async (index: number, recommendation: string) => {
    setLoadingRemediation(index);
    try {
      const content = await generateRemediationContent(selectedPolicy.name, recommendation);
      setRemediationContent(prev => ({...prev, [index]: content}));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRemediation(null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const refPolicy = policies.find(p => p.id === genDetails.referencePolicyId);
      const nrd = calculateNextReviewDate(genDetails.reviewCycle);
      const res = await generatePolicySOP({
        ...genDetails,
        nextReviewDate: nrd,
        referencePolicy: refPolicy?.name
      });
      setGeneratedDoc(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGenDetails(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedDoc) return;
    window.print();
  };

  return (
    <div className="space-y-6">
      {isBulkImporting && (
        <BulkImportPanel 
          moduleName="Policy"
          templateHeaders={['name', 'type', 'category', 'reviewCycle', 'complianceScore', 'status']}
          onImportComplete={handleBulkImportComplete}
          onCancel={() => setIsBulkImporting(false)}
        />
      )}

      <header className="flex justify-between items-end no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase">Governance Intelligence & Control Execution</h2>
          <p className="text-slate-500 font-medium">Analyze strategic policies, generate operational SOPs, or ingest existing documents via AI.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setActiveView('analyze')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'analyze' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Assurance Audit
          </button>
          <button 
            onClick={() => setActiveView('generate')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'generate' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            AI PDF Engine
          </button>
          <button 
            onClick={() => setActiveView('reminders')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${activeView === 'reminders' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Reminders
            {dueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-200 animate-pulse">
                {dueCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveView('ingest')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'ingest' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            Doc Ingestion
          </button>
        </div>
      </header>

      {activeView === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[800px] flex flex-col">
            <h3 className="font-black mb-4 text-slate-900 uppercase text-[10px] tracking-widest">Inventory Management</h3>
            
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setIsBulkImporting(true)}
                className="flex-1 bg-white border border-slate-200 hover:border-blue-500 text-[9px] font-black uppercase tracking-widest py-2 rounded-lg transition-all"
              >
                📂 Bulk CSV Upload
              </button>
            </div>

            {dueCount > 0 && (
              <button 
                onClick={() => setActiveView('reminders')}
                className="mb-4 w-full p-4 rounded-xl border-2 bg-red-50 border-red-100 text-red-600 hover:bg-red-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl animate-bounce">🔔</span>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Automated Lifecycle Alerts</p>
                    <p className="text-xs font-bold mt-1">{dueCount} Critical Reviews Generated</p>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-red-600 text-white">View Feed</span>
              </button>
            )}

            <div className="mb-4 space-y-2">
              <input 
                type="text" 
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10"
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Policy">Policies</option>
                  <option value="SOP">SOPs</option>
                </select>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {filteredPolicies.map((p) => {
                const imminent = isReviewImminent(p.nextReviewDate);
                const daysLeft = getDaysUntilReview(p.nextReviewDate);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPolicy(p);
                      setAnalysis(null);
                      setRemediationContent({});
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative ${
                      selectedPolicy.id === p.id 
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 shadow-lg' 
                        : imminent ? `border-red-200 bg-red-50/20 hover:border-red-400 ${daysLeft < 30 ? 'ring-2 ring-red-500/20 animate-pulse' : ''}` : 'border-slate-50 hover:border-slate-200 bg-white'
                    }`}
                  >
                    {imminent && (
                      <div className={`absolute -top-2 right-2 px-2 py-0.5 rounded text-[7px] font-black uppercase shadow-lg z-10 ${daysLeft < 30 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {daysLeft} Days Remaining
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          p.type === 'Policy' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>{p.type}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        p.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      }`} />
                    </div>
                    <h4 className="font-black text-slate-800 mt-2 uppercase text-xs tracking-tight leading-tight">{p.name}</h4>
                    <div className="mt-3 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className={imminent ? 'text-red-600 font-black' : ''}>Next: {p.nextReviewDate}</span>
                      <span className="font-mono">{p.id}</span>
                    </div>
                  </button>
                );
              })}
              {filteredPolicies.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Documents Match</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden min-h-[800px]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Diagnostic Node: {selectedPolicy.name}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Classification: {selectedPolicy.type} • Domain: {selectedPolicy.category} • Cycle: {selectedPolicy.reviewCycle}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    selectedPolicy.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                   }`}>
                    {selectedPolicy.status}
                  </span>
                </div>
              </div>

              {isReviewImminent(selectedPolicy.nextReviewDate) && (
                <div className="bg-red-600 rounded-3xl p-6 text-white mb-8 flex items-center justify-between shadow-xl animate-in slide-in-from-top-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl animate-pulse">⏳</span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest">Critical Lifecycle Action Required</h4>
                      <p className="text-[10px] font-medium opacity-80 mt-1">This document breaches regulatory integrity thresholds in {getDaysUntilReview(selectedPolicy.nextReviewDate)} days.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('generate')}
                    className="bg-white text-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                  >
                    ✨ Initiate AI Review Draft
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Target Assurance Framework</label>
                  <select 
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all uppercase tracking-widest"
                  >
                    <option>ISO 27001 (InfoSec)</option>
                    <option>COBIT (IT Governance)</option>
                    <option>King IV (Governance)</option>
                    <option>ITIL v4 (Operations)</option>
                    <option>POPIA Compliance</option>
                    <option>ICASA Regulatory</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-black transition-all disabled:opacity-50 uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/10"
                  >
                    {loading ? 'Executing Synthesis...' : `Run AI ${selectedPolicy.type === 'SOP' ? 'Efficiency' : 'Gap'} Analysis`}
                  </button>
                </div>
              </div>

              {analysis ? (
                <div className="animate-in fade-in duration-500 space-y-10">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-8 rounded-[2rem] text-center border border-blue-100">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest">Alignment Index</p>
                      <p className="text-5xl font-black text-blue-700 tracking-tighter">{analysis.score}%</p>
                    </div>
                    <div className="bg-red-50 p-8 rounded-[2rem] text-center border border-red-100">
                      <p className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Deficiency Nodes</p>
                      <p className="text-5xl font-black text-red-700 tracking-tighter">{analysis.gaps.length}</p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-[2rem] text-center border border-green-100">
                      <p className="text-[10px] font-black text-green-500 uppercase mb-2 tracking-widest">Strategic Recs</p>
                      <p className="text-5xl font-black text-green-700 tracking-tighter">{analysis.recommendations.length}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="font-black text-slate-900 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] border-b border-slate-100 pb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Compliance Deficiencies
                      </h4>
                      <div className="space-y-4">
                        {analysis.gaps.map((gap: string, i: number) => (
                          <div key={i} className="text-xs leading-relaxed p-6 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100 font-medium italic border-l-4 border-l-red-500">"{gap}"</div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-black text-slate-900 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] border-b border-slate-100 pb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Remediation Roadmap
                      </h4>
                      <div className="space-y-4">
                        {analysis.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200 hover:shadow-md">
                            <div className="flex gap-4 items-start">
                              <div className="flex-1 text-xs leading-relaxed text-slate-700 font-medium italic border-l-4 border-l-green-500 pl-4">"{rec}"</div>
                              <button 
                                onClick={() => handleGenerateRemediation(i, rec)}
                                disabled={loadingRemediation === i}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg transition-all flex items-center gap-2 ${
                                  remediationContent[i] ? 'bg-slate-900 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                                }`}
                              >
                                {loadingRemediation === i ? '...' : remediationContent[i] ? '✨ Refresh' : '⚡ Fix'}
                              </button>
                            </div>
                            
                            {remediationContent[i] && (
                              <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" /> AI Remediator Output
                                  </span>
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(remediationContent[i]);
                                      alert("Remediation clause copied to clipboard.");
                                    }} 
                                    className="text-[8px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] border border-slate-200 px-2 py-1 rounded-md transition-all"
                                  >
                                    Copy Clause
                                  </button>
                                </div>
                                <div className="text-[10px] font-mono text-slate-800 bg-slate-900/5 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                                  {remediationContent[i]}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mx-auto mb-8 text-3xl opacity-30">⚖️</div>
                  <h4 className="text-slate-900 font-black uppercase text-[10px] tracking-widest">Assurance Vault Locked</h4>
                  <p className="text-slate-400 text-xs mt-4 max-w-xs mx-auto font-medium leading-relaxed italic">Select a {selectedPolicy.type === 'SOP' ? 'procedural SOP' : 'governance policy'} and target framework to manifest the intelligence report.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'reminders' && (
        <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-500 no-print pb-20">
           <div className="bg-slate-900 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
              <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                 <div className="space-y-6">
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight">Lifecycle Reminder Command Center</h3>
                    <p className="text-slate-400 max-w-xl font-medium leading-relaxed italic">"RiskLens AI has detected {dueCount} documentation objects breaching the 60-day mandatory review threshold. Failure to update may result in regulatory non-compliance under ICASA and POPIA mandates."</p>
                    <div className="flex gap-4">
                       <button 
                         onClick={() => window.print()}
                         className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-red-600/20 transition-all"
                       >
                          🚀 Export Risk Briefing
                       </button>
                       <button onClick={() => setActiveView('analyze')} className="px-8 py-5 border-2 border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-white/5 transition-all">Back to Registry</button>
                    </div>
                 </div>
                 <div className="w-48 h-48 bg-white/5 rounded-full border border-white/10 flex flex-col items-center justify-center text-center shadow-inner relative">
                    <p className="text-6xl font-black tracking-tighter mb-1 text-red-500">{dueCount}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Critical items</p>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-bounce shadow-lg text-lg">⚠️</div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {imminentPolicies.map(p => {
                const days = getDaysUntilReview(p.nextReviewDate);
                return (
                  <div key={p.id} className={`bg-white border-2 p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all flex flex-col group relative overflow-hidden ${days < 30 ? 'border-red-200' : 'border-amber-200'}`}>
                     <div className={`absolute top-0 right-0 px-8 py-3 rounded-bl-[2rem] text-white font-black uppercase text-[10px] tracking-widest ${days < 30 ? 'bg-red-600' : 'bg-amber-500'}`}>
                        {days} Days Remaining
                     </div>
                     <div className="flex items-center gap-4 mb-8">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg ${p.type === 'Policy' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                          {p.type === 'Policy' ? '📜' : '⚙️'}
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.category} • {p.id}</p>
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight max-w-[200px] truncate">{p.name}</p>
                        </div>
                     </div>
                     <div className="space-y-6 flex-1">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                             AI Breach Risk Prediction
                           </p>
                           <p className="text-[10px] font-medium text-slate-600 leading-relaxed italic">
                             "Leaving this document outdated increases the likelihood of finding <strong>IA-001 (Control Mismatch)</strong> during the next external audit. {p.category} alignment is mandatory for current FY assurance."
                           </p>
                        </div>
                     </div>
                     <div className="mt-10 pt-8 border-t border-slate-50 flex gap-3">
                        <button 
                          onClick={() => {
                            setGenDetails({
                              ...genDetails,
                              title: `Update Draft: ${p.name}`,
                              referencePolicyId: p.id,
                              type: p.type as any
                            });
                            setActiveView('generate');
                          }}
                          className="flex-1 py-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                        >
                          ✨ Generate Update
                        </button>
                        <button onClick={() => { setSelectedPolicy(p); setActiveView('analyze'); }} className="px-6 py-4 border border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Inspect Gaps</button>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      )}

      {activeView === 'ingest' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 no-print">
           <div className="bg-white p-16 rounded-[3.5rem] border border-slate-200 shadow-xl text-center space-y-8">
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-inner">📂</div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">AI Policy Ingestion</h3>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">Upload a PDF or Image of an existing policy/SOP. RiskLens AI will extract key governance parameters and catalog it in your registry.</p>
              
              <div className="pt-6">
                <input 
                  type="file" 
                  ref={fileInputRefIngest}
                  onChange={handleIngestFile}
                  className="hidden"
                  accept="application/pdf,image/*"
                />
                <button 
                  onClick={() => fileInputRefIngest.current?.click()}
                  disabled={loading}
                  className="bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-2xl font-black shadow-2xl transition-all uppercase text-xs tracking-[0.2em] flex items-center gap-4 mx-auto"
                >
                  {loading ? 'Synthesizing...' : 'Select Document for Ingestion'}
                </button>
              </div>

              {ingestedPolicy && (
                <div className="mt-12 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-10 text-left animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-8">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Extracted Metadata</h4>
                     <button onClick={() => setIngestedPolicy(null)} className="text-slate-400 hover:text-red-500">Discard</button>
                   </div>
                   <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Extracted Title</p>
                        <p className="text-sm font-black text-slate-900 uppercase">{ingestedPolicy.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Classified Type</p>
                        <p className="text-sm font-black text-slate-900 uppercase">{ingestedPolicy.type}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Category</p>
                        <p className="text-sm font-black text-slate-900 uppercase">{ingestedPolicy.category}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Compliance Health</p>
                        <p className="text-sm font-black text-green-600">{ingestedPolicy.complianceScore}%</p>
                      </div>
                   </div>
                   <div className="mb-10">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Extracted Narrative Preview</p>
                      <div className="text-[10px] text-slate-600 font-medium leading-relaxed bg-white border border-slate-200 p-6 rounded-2xl max-h-40 overflow-y-auto whitespace-pre-wrap">
                        {ingestedPolicy.content}
                      </div>
                   </div>
                   <button 
                     onClick={saveIngestedPolicy}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-xl uppercase text-xs tracking-widest"
                   >
                     Commit to Registry & Database
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      {activeView === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8 no-print">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">AI PDF Synthesis Engine</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Entity Signature</label>
                <input 
                  type="text" 
                  value={genDetails.companyName}
                  onChange={(e) => setGenDetails({...genDetails, companyName: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Operational Industry</label>
                <input 
                  type="text" 
                  value={genDetails.industry}
                  onChange={(e) => setGenDetails({...genDetails, industry: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none font-bold transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Manifestation Type</label>
                <select 
                  value={genDetails.type}
                  onChange={(e) => setGenDetails({...genDetails, type: e.target.value as 'Policy' | 'SOP'})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all uppercase tracking-widest"
                >
                  <option value="Policy">High-Level Policy</option>
                  <option value="SOP">Operational SOP</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Corporate Branding</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden" 
                  ref={fileInputRef} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-50 border-2 border-slate-100 border-dashed rounded-2xl px-6 py-4 text-[10px] font-black text-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 uppercase tracking-widest h-[56px]"
                >
                  {genDetails.logo ? 'Identity Uploaded' : 'Enroll Identity Logo'}
                  {genDetails.logo && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Review Cycle</label>
                <select 
                  value={genDetails.reviewCycle}
                  onChange={(e) => setGenDetails({...genDetails, reviewCycle: e.target.value as ReviewCycle})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all uppercase tracking-widest"
                >
                  <option>6 Months</option>
                  <option>1 Year</option>
                  <option>2 Years</option>
                  <option>3 Years</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Reference Governance Policy</label>
                <select 
                  value={genDetails.referencePolicyId}
                  onChange={(e) => setGenDetails({...genDetails, referencePolicyId: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-slate-500 uppercase"
                >
                  <option value="none">Standalone Artifact</option>
                  {policies.filter(p => p.type === 'Policy').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Document Narrative Title</label>
              <input 
                type="text" 
                value={genDetails.title}
                onChange={(e) => setGenDetails({...genDetails, title: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all uppercase tracking-tighter"
                placeholder="e.g. Incident Response Protocol"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Operational Control Requirements</label>
              <textarea 
                rows={5}
                value={genDetails.requirements}
                onChange={(e) => setGenDetails({...genDetails, requirements: e.target.value})}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none resize-none transition-all leading-relaxed"
                placeholder="Define mandates, encryption standards, or step-by-step procedure rules..."
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl font-black shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-4 uppercase text-xs tracking-[0.3em]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Synthesizing Artifact...
                </>
              ) : '✨ Generate Official PDF'}
            </button>
          </div>

          <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl p-6 overflow-hidden flex flex-col h-[950px] print:bg-white print:shadow-none print:border-none print:h-auto print:p-0">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 mb-6 no-print">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono tracking-[0.4em] uppercase opacity-40">High-Fidelity PDF Workbench</span>
              <button onClick={handleDownloadPDF} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest">Download PDF</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
            </div>

            <div className="flex-1 bg-white rounded-[2.5rem] overflow-y-auto p-20 text-black shadow-inner relative mx-2 mb-2 custom-scrollbar print:m-0 print:p-0 print:shadow-none print:rounded-none">
              {generatedDoc ? (
                <div className="animate-in fade-in duration-1000 relative z-10 print:animate-none">
                  <header className="border-b-8 border-slate-900 pb-12 mb-12 flex justify-between items-start print:border-slate-800">
                    <div className="space-y-6 flex-1">
                      <h1 className="text-5xl font-serif font-black tracking-tighter uppercase leading-none text-black">{genDetails.companyName}</h1>
                      <div className="flex gap-4 items-center">
                        <span className={`px-4 py-1.5 text-white text-[10px] font-black uppercase tracking-[0.3em] ${
                          genDetails.type === 'Policy' ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}>{genDetails.type} Manifest</span>
                        <div className="h-px w-12 bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Next Review: {calculateNextReviewDate(genDetails.reviewCycle)}</span>
                      </div>
                      <p className="text-3xl font-black text-black tracking-tight leading-tight uppercase">{genDetails.title}</p>
                    </div>
                    {genDetails.logo && <img src={genDetails.logo} alt="Corporate Logo" className="max-h-24 max-w-[200px] object-contain shadow-sm rounded-xl p-2 bg-slate-50 border border-slate-100" />}
                  </header>

                  <div className="text-black leading-[2] whitespace-pre-wrap font-serif text-lg">
                    {generatedDoc}
                  </div>

                  <footer className="mt-24 pt-12 border-t-4 border-slate-100 text-[10px] text-slate-400 flex justify-between uppercase font-black tracking-[0.3em]">
                    <div>© {new Date().getFullYear()} {genDetails.companyName} • Confidential Proprietary</div>
                    <div>Generated by RiskLens AI • PDF v1.0 • {new Date().toLocaleDateString()}</div>
                  </footer>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-200 print:hidden">
                  <div className="w-32 h-44 border-8 border-dashed border-slate-50 rounded-[3rem] flex items-center justify-center mb-10">
                    <span className="text-7xl opacity-20">📜</span>
                  </div>
                  <h4 className="font-black text-slate-300 uppercase tracking-[0.5em] text-sm">PDF Synthesis Vault</h4>
                  <p className="text-[10px] max-w-[240px] text-center mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed italic">The finalized {genDetails.type.toLowerCase()} PDF artifact will materialize here after AI deliberation.</p>
                </div>
              )}
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
          div.bg-white { background-color: white !important; color: black !important; }
        }
      `}} />
    </div>
  );
};

export default PolicyIntelligence;
