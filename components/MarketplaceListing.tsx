
import React from 'react';

const MarketplaceListing: React.FC = () => {
  const TIERS = [
    {
      name: 'Core GRC',
      price: 'R25k',
      period: 'per month',
      focus: 'Compliance Foundations',
      features: ['Digital Risk Register', 'Manual Policy Vault', 'Basic Audit Tracking', 'SAML SSO'],
      cta: 'Start Foundation',
      popular: false
    },
    {
      name: 'Professional AI',
      price: 'R85k',
      period: 'per month',
      focus: 'Automated Assurance',
      features: ['AI Policy Gap Analysis', 'Audit Co-Pilot (Drafting)', 'Predictive Action Tracking', 'Asset Lifecycle Intel'],
      cta: 'Go Pro',
      popular: true
    },
    {
      name: 'Enterprise Cognitive',
      price: 'Contact',
      period: 'Sales',
      focus: 'Systemic Resilience',
      features: ['Custom LLM Fine-tuning', 'Real-time Regulatory Sync', 'Crisis War-Room AI', 'Multi-Entity Data Sovereignty'],
      cta: 'Request POC',
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-in fade-in duration-700">
      {/* Hero Header */}
      <section className="relative bg-slate-900 rounded-[4rem] p-16 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Featured GRC Innovation 2024
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none uppercase">
              RiskLens <span className="text-blue-500">AI</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Transition from "Tick-Box" compliance to <span className="text-white">Active Cognitive Resilience</span>. The first GRC platform designed specifically for the high-velocity regulatory landscape of South African enterprise.
            </p>
            <div className="flex gap-4 pt-4">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-blue-600/20">Download Whitepaper</button>
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-white/10">Schedule Demo</button>
            </div>
          </div>
          <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 backdrop-blur-md">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Marketplace ID</span>
                <span className="text-xs font-mono text-blue-400">RL-AI-ZAF-4.2</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Ready</span>
                <span className="text-xs font-bold text-slate-300">King IV, POPIA, SARB Directive 1/2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment</span>
                <span className="text-xs font-bold text-slate-300">SaaS / Private Cloud / On-Prem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Write-Up Narrative */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Executive Write-Up</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-[1.8] font-medium text-lg italic border-l-4 border-blue-100 pl-8">
              "Most GRC tools are digital filing cabinets—passive, disconnected, and legacy. In a world where SARB directives change monthly and cyber threats evolve daily, 'filing cabinets' create a false sense of security. RiskLens AI is a Cognitive Operating System. It doesn't just store your risks; it deliberates on them."
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Strategic Impact Pillars</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-6">🧠</div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-3">AI Synthesis vs. Data Entry</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">RiskLens uses Gemini-3-Pro to analyze policy documents against global frameworks instantly, flagging gaps that take human teams weeks to identify.</p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl mb-6">⚖️</div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-3">Local Regulatory Precision</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Hard-coded support for the South African legislative landscape: FICA, POPIA, PFMA/MFMA, and King IV Governance.</p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-6">🛡️</div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-3">Predictive Assurance</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Our diagnostic engine correlates action aging, complexity, and historical SLA data to predict bottlenecks before they breach regulatory thresholds.</p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-6">🔒</div>
                <h4 className="font-black text-slate-900 uppercase text-sm mb-3">Immutable Evidence</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Every AI deliberation, document ratification, and digital signature is logged in an encrypted Audit Trail for 100% forensic defensibility.</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 sticky top-8">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-8">Technical Spec</h3>
          <ul className="space-y-6">
            <li className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Backbone</p>
              <p className="text-sm font-bold text-slate-800">Gemini-3-Pro & Flash Preview</p>
            </li>
            <li className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Residency</p>
              <p className="text-sm font-bold text-slate-800">Azure South Africa North / GCP Joburg</p>
            </li>
            <li className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Framework</p>
              <p className="text-sm font-bold text-slate-800">AES-256 at Rest / TLS 1.3 in Transit</p>
            </li>
            <li className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</p>
              <p className="text-sm font-bold text-slate-800">Microsoft Entra ID / Okta Integration</p>
            </li>
          </ul>
        </aside>
      </section>

      {/* Pricing Tiers */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Enterprise Licensing</h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">Scale your assurance maturity with transparent, predictable investment tiers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`relative bg-white p-10 rounded-[3.5rem] border-2 transition-all hover:-translate-y-2 hover:shadow-2xl ${tier.popular ? 'border-blue-600 ring-4 ring-blue-600/5' : 'border-slate-100'}`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Most Requested
                </div>
              )}
              <div className="mb-10">
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{tier.name}</h4>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">{tier.focus}</p>
              </div>
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{tier.price}</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{tier.period}</span>
              </div>
              <ul className="space-y-5 mb-12">
                {tier.features.map(f => (
                  <li key={f} className="flex gap-4 items-center">
                    <span className="text-blue-600 text-lg">✓</span>
                    <span className="text-sm font-medium text-slate-600 leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${
                tier.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/10'
              }`}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-blue-600 rounded-[3rem] p-16 text-center text-white space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        <h2 className="text-4xl font-black tracking-tighter uppercase leading-none relative z-10">Ready to automate your risk narrative?</h2>
        <p className="text-blue-100 max-w-xl mx-auto font-medium relative z-10">Join 15+ Top-Tier Banking and Telco entities across EMEA transforming their GRC capability.</p>
        <button className="relative z-10 px-12 py-6 bg-white text-blue-600 rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Connect with Sales Engine</button>
      </section>
    </div>
  );
};

export default MarketplaceListing;
