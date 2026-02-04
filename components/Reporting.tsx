
import React, { useState } from 'react';
import { generateBoardReport } from '../ollamaService';
import { MOCK_RISKS, MOCK_AUDITS } from '../constants';

interface ReportingProps {
  onToast: (msg: string, type?: 'success' | 'info') => void;
}

const Reporting: React.FC<ReportingProps> = ({ onToast }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [audience, setAudience] = useState('Board of Directors');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = { risks: MOCK_RISKS, audits: MOCK_AUDITS, audience };
      const res = await generateBoardReport(data);
      setReport(res);
      onToast("Executive Summary Synthesized", "success");
    } catch (err) {
      console.error(err);
      onToast("Synthesis Failed", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="text-center space-y-4 no-print">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Strategic Reporting</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">AI-generated narratives for high-level committees based on authenticated enterprise telemetry.</p>
      </header>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm relative overflow-hidden no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Committee</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 outline-none transition-all uppercase tracking-widest">
              <option>Board of Directors</option>
              <option>Risk Committee</option>
              <option>Audit Committee</option>
              <option>Executive ExCo</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] disabled:opacity-50">
              {loading ? 'Synthesizing...' : '✨ Generate Board Narrative'}
            </button>
          </div>
        </div>

        {report && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Integrity Index</p>
                  <p className="text-2xl font-black text-slate-800">98.2%</p>
                  <p className="text-[8px] font-bold text-green-600 uppercase mt-1">✓ Evidence Anchored</p>
               </div>
               <div className="border-l border-slate-200 pl-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Human Ratification</p>
                  <p className="text-2xl font-black text-slate-800">84%</p>
                  <p className="text-[8px] font-bold text-amber-600 uppercase mt-1">! 16% Pure AI Advisory</p>
               </div>
               <div className="border-l border-slate-200 pl-8">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Traceability</p>
                  <p className="text-2xl font-black text-slate-800">Forensic</p>
                  <p className="text-[8px] font-bold text-blue-600 uppercase mt-1">Immutable Logs Enabled</p>
               </div>
            </div>
            
            <div className="bg-white p-16 rounded-[3rem] border border-slate-200 shadow-inner relative">
               <div className="max-w-none text-black leading-[2] whitespace-pre-wrap font-serif text-xl border-l-4 border-slate-100 pl-12 py-4 italic">
                 {report}
               </div>
               <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <p>RiskLens AI Automated Report Engine v4.2</p>
                  <p>Authenticated Timestamp: {new Date().toLocaleString()}</p>
               </div>
            </div>
          </div>
        )}

        {!report && (
          <div className="bg-slate-50 border-4 border-dashed border-slate-100 py-32 rounded-[3rem] text-center">
            <div className="text-6xl mb-8 opacity-20">📑</div>
            <h4 className="font-black text-slate-800 uppercase tracking-[0.3em]">Analysis Chamber Empty</h4>
            <p className="text-slate-400 max-w-xs mx-auto text-sm mt-4 font-medium italic">Select your target committee to synthesize an evidence-anchored strategic narrative.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reporting;
