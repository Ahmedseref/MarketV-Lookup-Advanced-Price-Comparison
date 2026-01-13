
import React from 'react';
import { SupplierProduct, MarketProduct, MatchResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { calculateStats } from '../utils/math';

interface DashboardProps {
  suppliers: SupplierProduct[];
  markets: MarketProduct[];
  matches: MatchResult[];
  confidenceThreshold: number;
}

const Dashboard: React.FC<DashboardProps> = ({ suppliers, markets, matches, confidenceThreshold }) => {
  const matchedData = suppliers.map(sup => {
    const productMatches = matches
      .filter(m => m.supplierId === sup.id && m.confidence >= confidenceThreshold);
    const matchedMarketItems = productMatches.map(m => markets.find(mk => mk.id === m.marketId)!);
    const stats = calculateStats(sup.price, matchedMarketItems.map(m => m.price));
    
    return {
      name: sup.description.slice(0, 15) + '...',
      variance: stats.varianceFromAvg,
      count: stats.count,
      fullName: sup.description
    };
  }).filter(d => d.count > 0);

  const healthDistribution = {
    undermarket: matchedData.filter(d => d.variance < -5).length,
    neutral: matchedData.filter(d => d.variance >= -5 && d.variance <= 5).length,
    overmarket: matchedData.filter(d => d.variance > 5).length,
  };

  const pieData = [
    { name: 'Lower than Market (-5% <)', value: healthDistribution.undermarket, color: '#10b981' },
    { name: 'Within Range (±5%)', value: healthDistribution.neutral, color: '#94a3b8' },
    { name: 'Above Market (> 5%)', value: healthDistribution.overmarket, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Mapped Products</h3>
          <div className="text-3xl font-bold text-slate-900">{matchedData.length} <span className="text-sm text-slate-400 font-normal">/ {suppliers.length}</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Avg Market Opportunity</h3>
          <div className="text-3xl font-bold text-emerald-600">
            {healthDistribution.undermarket > 0 ? (Math.max(...matchedData.map(d => Math.abs(d.variance)))).toFixed(1) : '0'}%
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Risk Coverage</h3>
          <div className="text-3xl font-bold text-rose-500">
            {healthDistribution.overmarket} <span className="text-sm text-slate-400 font-normal">Overpriced items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Price Variance vs Market Average (%)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matchedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={10} interval={0} />
              <YAxis fontSize={12} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-lg">
                        <div className="text-xs font-bold mb-1">{payload[0].payload.fullName}</div>
                        <div className={`text-sm font-bold ${payload[0].value! > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {payload[0].value! > 0 ? '+' : ''}{Number(payload[0].value).toFixed(1)}% variance
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="variance">
                {matchedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.variance > 5 ? '#f43f5e' : entry.variance < -5 ? '#10b981' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Portfolio Health Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 -mt-10">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                <span className="text-xs font-medium text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
