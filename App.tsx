
import React, { useState, useEffect, useMemo } from 'react';
import { SupplierProduct, MarketProduct, MatchResult, TabType } from './types';
import DataInput from './components/DataInput';
import ComparisonTable from './components/ComparisonTable';
import Dashboard from './components/Dashboard';
import { calculateSimilarity } from './utils/matching';
import { calculateStats } from './utils/math';

const App: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierProduct[]>([]);
  const [markets, setMarkets] = useState<MarketProduct[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [activeTab, setActiveTab] = useState<TabType>(TabType.INPUT);
  const [isProcessing, setIsProcessing] = useState(false);

  const performMatching = (sups: SupplierProduct[], mkts: MarketProduct[]) => {
    setIsProcessing(true);
    // Heavy computational logic wrapped in timeout to allow UI update
    setTimeout(() => {
      const results: MatchResult[] = [];
      
      sups.forEach(sup => {
        mkts.forEach(mkt => {
          const score = calculateSimilarity(sup.normalizedTokens, mkt.normalizedTokens);
          if (score > 10) { // Store anything above 10 for the threshold slider to be useful
            results.push({
              supplierId: sup.id,
              marketId: mkt.id,
              confidence: score
            });
          }
        });
      });
      
      setSuppliers(sups);
      setMarkets(mkts);
      setMatches(results);
      setIsProcessing(false);
      setActiveTab(TabType.ANALYSIS);
    }, 100);
  };

  const handleExportCSV = () => {
    if (suppliers.length === 0) return;

    const headers = [
      'Supplier Code', 
      'Supplier Description', 
      'Supplier Price', 
      'Currency', 
      'Incoterm', 
      'MOQ', 
      'Market Matches Found', 
      'Market Min Price', 
      'Market Max Price', 
      'Market Avg Price', 
      'Variance from Avg (%)'
    ];
    
    const rows = suppliers.map(sup => {
      const productMatches = matches.filter(m => m.supplierId === sup.id && m.confidence >= confidenceThreshold);
      const matchedMarketPrices = productMatches.map(m => markets.find(mk => mk.id === m.marketId)?.price || 0);
      const stats = calculateStats(sup.price, matchedMarketPrices);
      
      // Escape strings containing commas for CSV safety
      const escape = (str: string | undefined) => `"${(str || '').toString().replace(/"/g, '""')}"`;

      return [
        escape(sup.code),
        escape(sup.description),
        sup.price,
        escape(sup.currency),
        escape(sup.incoterm),
        escape(sup.moq),
        stats.count,
        stats.count > 0 ? stats.min.toFixed(2) : 'N/A',
        stats.count > 0 ? stats.max.toFixed(2) : 'N/A',
        stats.count > 0 ? stats.avg.toFixed(2) : 'N/A',
        stats.count > 0 ? stats.varianceFromAvg.toFixed(2) : 'N/A'
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marketv_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setSuppliers([]);
    setMarkets([]);
    setMatches([]);
    setActiveTab(TabType.INPUT);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-100 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MarketV-Lookup</h1>
              <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-widest">Pricing Intelligence Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {suppliers.length > 0 && (
              <button 
                onClick={reset}
                className="text-slate-400 hover:text-rose-500 text-sm font-medium transition-colors"
              >
                Clear Data
              </button>
            )}
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab(TabType.INPUT)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === TabType.INPUT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Input
              </button>
              <button 
                onClick={() => setActiveTab(TabType.ANALYSIS)}
                disabled={suppliers.length === 0}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${suppliers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === TabType.ANALYSIS ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Compare
              </button>
              <button 
                onClick={() => setActiveTab(TabType.DASHBOARD)}
                disabled={suppliers.length === 0}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${suppliers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === TabType.DASHBOARD ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Metrics
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isProcessing && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-slate-900">Synchronizing Descriptions...</h2>
              <p className="text-slate-500">Normalizing tokens and calculating fuzzy similarity scores.</p>
            </div>
          </div>
        )}

        {activeTab === TabType.INPUT && <DataInput onProcess={performMatching} />}
        
        {activeTab === TabType.ANALYSIS && suppliers.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Analysis Threshold</h2>
                <p className="text-sm text-slate-500">Only showing matches with at least {confidenceThreshold}% token similarity.</p>
              </div>
              <div className="flex items-center gap-4 min-w-[300px]">
                <span className="text-sm font-bold text-slate-400">0%</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={confidenceThreshold} 
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-sm font-bold text-indigo-600">{confidenceThreshold}%</span>
              </div>
            </div>
            <ComparisonTable 
              suppliers={suppliers} 
              markets={markets} 
              matches={matches} 
              confidenceThreshold={confidenceThreshold} 
            />
          </div>
        )}

        {activeTab === TabType.DASHBOARD && suppliers.length > 0 && (
          <Dashboard 
            suppliers={suppliers} 
            markets={markets} 
            matches={matches} 
            confidenceThreshold={confidenceThreshold} 
          />
        )}
      </main>

      {/* Footer / Summary Bar */}
      {suppliers.length > 0 && (
        <footer className="bg-slate-900 text-white border-t border-slate-800 py-4 px-8 sticky bottom-0 z-30">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-8">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Supplier Items</span>
                <span className="text-lg font-bold">{suppliers.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-700 self-center"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Market Points</span>
                <span className="text-lg font-bold">{markets.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-700 self-center"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Active Lookups</span>
                <span className="text-lg font-bold text-indigo-400">{matches.filter(m => m.confidence >= confidenceThreshold).length}</span>
              </div>
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-lg transition-all shadow-lg shadow-indigo-900/40"
            >
              Export Analysis (CSV)
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
