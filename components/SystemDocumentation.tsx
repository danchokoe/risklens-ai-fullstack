
import React from 'react';

const SystemDocumentation: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-32 animate-in fade-in duration-700">
      {/* Cover Header */}
      <section className="bg-white border-b-8 border-slate-900 pb-16 pt-8">
        <div className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-slate-900">
              System <span className="text-blue-600">Spec</span> 4.2
            </h1>
            <p className="text-xl font-medium text-slate-500 uppercase tracking-widest">RiskLens AI: The Cognitive GRC Kernel</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidential Classification</p>
            <p className="text-sm font-bold text-red-600 uppercase">Proprietary / Tier 1</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Revision</p>
            <p className="text-xs font-bold text-slate-800">March 2024</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine Backbone</p>
            <p className="text-xs font-bold text-slate-800">Gemini-3-Pro (1.2M Context)</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment Mode</p>
            <p className="text-xs font-bold text-slate-800">Hybrid Multi-Tenant / Private Node</p>
          </div>
        </div>
      </section>

      {/* 1. Executive Summary */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">01</span>
          Executive Summary
        </h2>
        <div className="prose prose-slate max-w-none text-lg leading-relaxed text-slate-600 font-medium italic border-l-4 border-blue-100 pl-8">
          RiskLens AI is not a tool; it is a force multiplier for the Risk and Audit function. By fusing enterprise telemetry (Policy, Asset, Audit, and Regulatory feeds) with high-context Generative AI, the system transitions organizations from "Detective" compliance to "Predictive" resilience.
        </div>
      </section>

      {/* 2. Technical Architecture */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">02</span>
          Technical Architecture
        </h2>
        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-200 relative overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">The Core Kernel</h3>
                 <ul className="space-y-4">
                    <li className="flex gap-4">
                       <div className="w-6 h-6 bg-white rounded-md border border-slate-200 flex items-center justify-center text-[10px] font-black">A</div>
                       <p className="text-xs text-slate-600 font-medium"><strong>Cognitive Layer:</strong> Uses Gemini-3-Pro for deep document analysis and Gemini-3-Flash for real-time dashboard synthesis.</p>
                    </li>
                    <li className="flex gap-4">
                       <div className="w-6 h-6 bg-white rounded-md border border-slate-200 flex items-center justify-center text-[10px] font-black">B</div>
                       <p className="text-xs text-slate-600 font-medium"><strong>Data Sovereignty:</strong> AES-256 encryption at rest. All AI processing nodes are region-locked to South Africa North (Azure/GCP).</p>
                    </li>
                 </ul>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 flex flex-col justify-center items-center text-center">
                 <div className="flex flex-col gap-4 w-full max-w-[200px]">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-mono text-slate-400">INPUT: Authenticated Telemetry</div>
                    <div className="h-4 w-px bg-blue-500/30 mx-auto" />
                    <div className="p-3 bg-blue-600 rounded-xl text-[9px] font-black text-white shadow-xl uppercase">AI Synthesis Engine</div>
                    <div className="h-4 w-px bg-blue-500/30 mx-auto" />
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-mono text-slate-400">OUTPUT: Board Advisory</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 6. Trust, Accuracy & Board Accountability (NEW) */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">06</span>
          Trust & Verification Protocols
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-10 bg-slate-900 text-white rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl -mr-12 -mt-12" />
              <h3 className="text-blue-400 font-black mb-6 uppercase text-[10px] tracking-[0.3em]">Forensic Data Lineage</h3>
              <p className="text-sm leading-relaxed text-slate-300 font-medium italic mb-6">
                "How do I know this risk score is accurate?"
              </p>
              <p className="text-xs leading-relaxed text-slate-400 font-normal">
                RiskLens AI implements <strong>Evidence Anchoring</strong>. Every dashboard metric is hyperlinked to its source document (PDFs, Audit Logs, Asset Tags). The AI outputs the exact clauses it deliberated on, allowing a director to drill down from a 'Red' risk score to the specific line in a policy that caused the breach.
              </p>
           </div>
           <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
              <h3 className="text-slate-900 font-black mb-6 uppercase text-[10px] tracking-[0.3em]">Human-in-the-Loop (HITL)</h3>
              <p className="text-sm leading-relaxed text-slate-600 font-medium italic mb-6">
                "I remain accountable as a director."
              </p>
              <p className="text-xs leading-relaxed text-slate-500 font-normal">
                Under the <strong>King IV Framework</strong>, technology is a facilitator, not an adjudicator. Our workflow requires human Risk Owners to 'Ratify' AI synthesis. Reports distinguish between <em>AI-Generated Insights</em> and <em>Management-Verified Facts</em>, ensuring you only delibrate on information that has been ethically commissioned and truthful.
              </p>
           </div>
        </div>
      </section>

      <footer className="pt-16 border-t border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
         <p>© 2024 RISKLENS AI • SOLUTIONS ARCHITECT OFFICE</p>
         <p>AUTH: RL-ADMIN-DOC-01</p>
      </footer>
    </div>
  );
};

export default SystemDocumentation;
