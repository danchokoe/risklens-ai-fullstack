
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_RISKS, MOCK_ACTIONS } from '../constants';

const data = [
  { name: 'Jan', risk: 45, compliance: 80 },
  { name: 'Feb', risk: 52, compliance: 82 },
  { name: 'Mar', risk: 48, compliance: 78 },
  { name: 'Apr', risk: 61, compliance: 75 },
  { name: 'May', risk: 55, compliance: 85 },
  { name: 'Jun', risk: 40, compliance: 88 },
];

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981'];

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const riskStats = [
    { label: 'Critical Risks', value: '4', trend: '+1', color: 'text-red-600', tab: 'risks' },
    { label: 'Compliance Score', value: '84%', trend: '+2%', color: 'text-green-600', tab: 'regulatory' },
    { label: 'Audit Findings', value: '12', trend: '-3', color: 'text-blue-600', tab: 'audit' },
    { label: 'Pending Actions', value: '28', trend: '+5', color: 'text-amber-600', tab: 'actions' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Executive Overview</h2>
        <p className="text-slate-500">Real-time risk and compliance posture across business units.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {riskStats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => onNavigate(stat.tab)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
          >
            <p className="text-sm text-slate-500 font-medium group-hover:text-blue-600 transition-colors">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs font-semibold text-slate-400">{stat.trend} vs last month</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold tracking-tight">Risk vs Compliance Trend</h3>
            <button onClick={() => onNavigate('reporting')} className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline">View Detailed Report</button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="compliance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 tracking-tight">Action Completion Risk</h3>
          <div className="h-[200px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'On Track', value: 40 },
                      { name: 'At Risk', value: 30 },
                      { name: 'Stalled', value: 15 },
                      { name: 'Delayed', value: 15 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0,1,2,3].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            <button 
              onClick={() => onNavigate('actions')}
              className="w-full flex justify-between text-sm hover:bg-slate-50 p-2 rounded-xl transition-all group"
            >
              <span className="text-slate-500 group-hover:text-slate-900">Stalled Actions</span>
              <span className="font-semibold text-red-500">12</span>
            </button>
            <button 
              onClick={() => onNavigate('audit')}
              className="w-full flex justify-between text-sm hover:bg-slate-50 p-2 rounded-xl transition-all group"
            >
              <span className="text-slate-500 group-hover:text-slate-900">High Impact Findings</span>
              <span className="font-semibold text-slate-800">5</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Urgent Remediation Required</h3>
          <button onClick={() => onNavigate('actions')} className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">Full Register →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Item</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_ACTIONS.slice(0, 5).map((action) => (
                <tr 
                  key={action.id} 
                  onClick={() => onNavigate('actions')}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="py-5 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{action.task}</td>
                  <td className="py-5 text-sm text-slate-500 font-medium">{action.assignee}</td>
                  <td className="py-5 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      action.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {action.priority}
                    </span>
                  </td>
                  <td className="py-5 text-right text-[10px] font-bold text-slate-400 italic uppercase">{action.daysPending} days pending</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
