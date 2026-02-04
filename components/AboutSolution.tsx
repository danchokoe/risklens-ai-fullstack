
import React, { useState } from 'react';

const AboutSolution: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'Banks' | 'Telcos' | 'Corporates' | 'Mining' | 'Government'>('Banks');

  const SEGMENT_CONTENT = {
    'Banks': {
      title: 'Banking & Financial Services',
      focus: 'Basel III/IV, SARB Directives & Prudential Governance',
      points: [
        'Automate compliance workflows for SARB Directive 1/2024 (Cloud Resilience).',
        'Real-time liquidity and capital adequacy tracking using AI diagnostics.',
        'Prudential governance mapping against Basel III/IV conducting standards.',
        'Digital banking channel risk monitoring for FSCA Conduct compliance.'
      ],
      icon: '🏦'
    },
    'Telcos': {
      title: 'Telecommunications',
      focus: 'Infrastructure Resilience & Data Privacy',
      points: [
        'Asset lifecycle management linked to cyber vulnerability feeds.',
        'ICASA compliance monitoring and automated license reporting.',
        'Customer data protection (POPIA) at scale with AI redaction.',
        'Physical infrastructure risk tracking (batteries, towers, fiber).'
      ],
      icon: '📡'
    },
    'Corporates': {
      title: 'Listed Entities & Large Corps',
      focus: 'King IV, ESG & Shareholder Assurance',
      points: [
        'Automated ESG data collection and sustainability reporting.',
        'King IV governance gap analysis and board charter alignment.',
        'Supply chain vendor risk management and due diligence.',
        'Policy management and staff attestation workflows.'
      ],
      icon: '🏢'
    },
    'Mining': {
      title: 'Mining & Natural Resources',
      focus: 'Zero Harm, Tailings Management & SLP Compliance',
      points: [
        'Predictive safety analysis to identify patterns in near-miss reports.',
        'Automated monitoring of Social and Labor Plans (SLP) for mining rights.',
        'Asset risk tracking for heavy machinery and critical TSF infrastructure.',
        'Environmental rehabilitation fund governance and ESG audit automation.'
      ],
      icon: '⛏️'
    },
    'Government': {
      title: 'Government & Public Sector',
      focus: 'PFMA, MFMA & Service Delivery',
      points: [
        'Automated irregular expenditure detection and reporting.',
        'PFMA/MFMA compliance monitoring for supply chain management.',
        'Service delivery risk mapping (water, power, logistics).',
        'Audit outcome prediction for AGSA reviews and clean audits.'
      ],
      icon: '🏛️'
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="text-center max-w-4xl mx-auto space-y-6">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          <span className="text-blue-600">Risk</span>Lens AI
        </h2>
        <p className="text-xl font-medium text-slate-500">The Cognitive GRC Operating System</p>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Legacy GRC tools are passive data repositories. RiskLens is an active Intelligence Node that fuses enterprise telemetry with Generative AI to predict risks, automate assurance, and synthesize strategy.
        </p>
      </header>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🔮</div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">Predictive Assurance</h3>
          <p className="text-xs text-slate-500 leading-loose font-medium">
            Stop looking in the rearview mirror. Our AI diagnostic engine analyzes risk descriptions against global best practices, predicting bottlenecks and SLA breaches before they happen.
          </p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🤖</div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">The Audit Co-Pilot</h3>
          <p className="text-xs text-slate-500 leading-loose font-medium">
            A force multiplier for your audit team. Instantly generate management responses, perform 5-Why Root Cause Analysis, and assess portfolio maturity automatically.
          </p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">📜</div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-4">Living Policy Intel</h3>
          <p className="text-xs text-slate-500 leading-loose font-medium">
            Transform static PDFs into active guardrails. Instantly analyze gaps against new regulations (e.g., Cybercrimes Act) and map clauses directly to internal controls.
          </p>
        </div>
      </div>

      {/* Interactive Segment Section */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Tailored For Your Industry</h3>
            {(Object.keys(SEGMENT_CONTENT) as Array<keyof typeof SEGMENT_CONTENT>).map((segment) => (
              <button
                key={segment}
                onClick={() => setActiveSegment(segment)}
                className={`w-full text-left p-6 rounded-2xl transition-all flex items-center justify-between group ${
                  activeSegment === segment 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-sm font-black uppercase tracking-widest">{segment}</span>
                <span className="text-xl">{activeSegment === segment ? '→' : '+'}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-white/10 rounded-[2.5rem] p-10 border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-right-8 duration-300" key={activeSegment}>
             <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl">
                  {SEGMENT_CONTENT[activeSegment].icon}
                </div>
                <div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase">{SEGMENT_CONTENT[activeSegment].title}</h4>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-2">{SEGMENT_CONTENT[activeSegment].focus}</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {SEGMENT_CONTENT[activeSegment].points.map((point, i) => (
                 <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                   <span className="text-blue-400 font-black text-lg">•</span>
                   <p className="text-sm font-medium text-slate-200 leading-relaxed">{point}</p>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Feature Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Strategic ROI</h3>
          <ul className="space-y-6">
            <li className="flex gap-4 items-start">
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1">Efficiency</div>
              <p className="text-sm text-slate-600 font-medium">Reduce audit costs by <span className="font-bold text-slate-900">40%</span> by automating the drafting of responses, scoping, and evidence review.</p>
            </li>
            <li className="flex gap-4 items-start">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1">Velocity</div>
              <p className="text-sm text-slate-600 font-medium">Move from weeks of policy drafting to <span className="font-bold text-slate-900">minutes</span> of AI synthesis and review.</p>
            </li>
            <li className="flex gap-4 items-start">
              <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1">Compliance</div>
              <p className="text-sm text-slate-600 font-medium"><span className="font-bold text-slate-900">Zero Regulatory Surprise</span>. Real-time monitoring of regulatory updates with instant impact assessments.</p>
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 relative overflow-hidden">
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Enterprise Security</h3>
           <div className="space-y-6 relative z-10">
              <div className="flex gap-4 items-center">
                 <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-lg">🔒</div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Immutable Audit Trail</p>
                    <p className="text-[10px] text-slate-500 font-medium">Every AI suggestion is logged in a tamper-proof registry.</p>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-lg">🔑</div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">RBAC & Sovereignty</p>
                    <p className="text-[10px] text-slate-500 font-medium">Granular permissions ensure data sovereignty per department.</p>
                 </div>
              </div>
              <div className="flex gap-4 items-center">
                 <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-lg">🇿🇦</div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Local Compliance</p>
                    <p className="text-[10px] text-slate-500 font-medium">Pre-configured for King IV, POPIA, and ISO 27001.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSolution;
