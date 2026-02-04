
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface TourStep {
  title: string;
  description: string;
  targetId?: string;
  icon: string;
}

interface OnboardingTourProps {
  role: UserRole;
  onComplete: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const TOUR_CONTENT: Record<UserRole, TourStep[]> = {
  'System Admin': [
    { title: 'Command Center', description: 'This is your high-level overview of enterprise health and critical alerts.', icon: '📊' },
    { title: 'Identity Orchestration', description: 'Manage your enterprise users and integrate with Active Directory / Azure Entra ID.', icon: '👤', targetId: 'users' },
    { title: 'Audit Trail', description: 'Every AI decision is logged here for 100% immutable oversight.', icon: '📜', targetId: 'auditTrail' }
  ],
  'CRO': [
    { title: 'Executive Oversight', description: 'Monitor your risk vs. compliance posture in real-time.', icon: '📈' },
    { title: 'Board Synthesis', description: 'Generate evidence-anchored reports for the Board using our AI engine.', icon: '📑', targetId: 'reporting' },
    { title: 'Policy Intelligence', description: 'Identify gaps in your governance framework against local regulations.', icon: '⚖️', targetId: 'policies' }
  ],
  'Risk Manager': [
    { title: 'Risk Intelligence', description: 'Visualize exposures across the enterprise 5x5 heatmap.', icon: '🛡️', targetId: 'risks' },
    { title: 'Predictive Tracking', description: 'AI predicts the probability of remediation success for your action items.', icon: '✅', targetId: 'actions' },
    { title: 'Asset Telemetry', description: 'Monitor hardware health and vulnerability data in the Infrastructure Vault.', icon: '📦', targetId: 'assets' }
  ],
  'Internal Auditor': [
    { title: 'Audit Co-Pilot', description: 'Use AI to perform root cause analysis and draft management responses.', icon: '🔍', targetId: 'audit' },
    { title: 'Vulnerability Feed', description: 'Real-time sync between discovered CVEs and your internal control environment.', icon: '⚡', targetId: 'vulnerabilities' },
    { title: 'Document Lifecycle', description: 'Track the ratification and digital signing of governance artifacts.', icon: '📂', targetId: 'documents' }
  ],
  'Compliance Officer': [
    { title: 'Regulatory Monitor', description: 'Stay ahead of SARB, ICASA, and POPIA mandates with real-time tracking.', icon: '⚖️', targetId: 'regulatory' },
    { title: 'Control Mapping', description: 'Map external regulatory clauses directly to your internal risk controls.', icon: '🔗', targetId: 'policies' }
  ],
  'Board Member': [
    { title: 'Strategic Dashboard', description: 'High-level metrics on organizational resilience and risk appetite.', icon: '📊' },
    { title: 'Board Artifacts', description: 'Access synthesized narratives and historical board packs here.', icon: '📑', targetId: 'reporting' }
  ]
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({ role, onComplete, activeTab, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = TOUR_CONTENT[role] || TOUR_CONTENT['Board Member'];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];
      if (nextStep.targetId) {
        onNavigate(nextStep.targetId);
      }
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Background Dimmer */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-500 pointer-events-auto" />
      
      {/* Tooltip Positioning Container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="bg-slate-900 text-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-slate-800 p-10 pointer-events-auto animate-in zoom-in-95 duration-300 relative overflow-hidden">
           {/* Top Accent Bar */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
           
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-xl">
                   {steps[currentStep].icon}
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Module Guide</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{currentStep + 1} of {steps.length}</p>
                 </div>
              </div>
              <button onClick={onComplete} className="text-slate-500 hover:text-white transition-colors">✕</button>
           </div>

           <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4 leading-tight">
             {steps[currentStep].title}
           </h3>
           
           <p className="text-sm font-medium text-slate-400 leading-relaxed mb-10 italic">
             "{steps[currentStep].description}"
           </p>

           <div className="flex items-center gap-4">
              <button 
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}
                {currentStep < steps.length - 1 && <span className="text-lg">→</span>}
              </button>
              <button 
                onClick={onComplete}
                className="px-6 py-4 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-all"
              >
                Skip
              </button>
           </div>

           {/* Progress Dots */}
           <div className="flex justify-center gap-1.5 mt-8">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'}`} 
                />
              ))}
           </div>
        </div>
      </div>

      {/* Decorative Pulse (Visual hint for where to look) */}
      {steps[currentStep].targetId && (
        <div className="absolute top-1/2 left-32 -translate-y-1/2 pointer-events-none">
           <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
           <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
        </div>
      )}
    </div>
  );
};

export default OnboardingTour;
