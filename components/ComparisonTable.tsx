
import React, { useState, useMemo } from 'react';
import { SupplierProduct, MarketProduct, MatchResult, HealthStatus, PricingStats } from '../types';
import { calculateStats } from '../utils/math';

interface ComparisonTableProps {
  suppliers: SupplierProduct[];
  markets: MarketProduct[];
  matches: MatchResult[];
  confidenceThreshold: number;
}

type SortKey = 'description' | 'price' | 'variance' | 'matches';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'matched' | 'unmatched';

interface ViewRow {
  supplier: SupplierProduct;
  matchedItems: MarketProduct[];
  productMatches: MatchResult[];
  stats: PricingStats;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ suppliers, markets, matches, confidenceThreshold }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('description');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const getHealthStatus = (variance: number): HealthStatus => {
    if (variance < -10) return 'good';
    if (variance > 10) return 'critical';
    if (variance > 0) return 'warning';
    return 'neutral';
  };

  const healthColors: Record<HealthStatus, string> = {
    good: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    critical: 'text-rose-600 bg-rose-50 border-rose-100',
    neutral: 'text-slate-600 bg-slate-50 border-slate-100'
  };

  const viewRows = useMemo(() => {
    let rows: ViewRow[] = suppliers.map(sup => {
      const productMatches = matches
        .filter(m => m.supplierId === sup.id && m.confidence >= confidenceThreshold)
        .sort((a, b) => b.confidence - a.confidence);
      
      const matchedItems = productMatches.map(m => markets.find(mk => mk.id === m.marketId)!);
      const stats = calculateStats(sup.price, matchedItems.map(m => m.price));

      return { supplier: sup, matchedItems, productMatches, stats };
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      rows = rows.filter(r => 
        r.supplier.description.toLowerCase().includes(lowerSearch) || 
        r.supplier.code.toLowerCase().includes(lowerSearch) ||
        r.supplier.size?.toLowerCase().includes(lowerSearch) ||
        r.supplier.otherFeature?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterStatus === 'matched') {
      rows = rows.filter(r => r.matchedItems.length > 0);
    } else if (filterStatus === 'unmatched') {
      rows = rows.filter(r => r.matchedItems.length === 0);
    }

    rows.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'description':
          comparison = a.supplier.description.localeCompare(b.supplier.description);
          break;
        case 'price':
          comparison = a.supplier.price - b.supplier.price;
          break;
        case 'variance':
          const varA = a.matchedItems.length > 0 ? a.stats.varianceFromAvg : -999;
          const varB = b.matchedItems.length > 0 ? b.stats.varianceFromAvg : -999;
          comparison = varA - varB;
          break;
        case 'matches':
          comparison = a.matchedItems.length - b.matchedItems.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return rows;
  }, [suppliers, markets, matches, confidenceThreshold, searchTerm, filterStatus, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search descriptions, codes, features..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['all', 'matched', 'unmatched'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterStatus === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <div className="flex gap-2">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={sortKey}
              onChange={(e) => handleSort(e.target.value as SortKey)}
            >
              <option value="description">Sort by: Name</option>
              <option value="price">Sort by: Price</option>
              <option value="variance">Sort by: Variance</option>
              <option value="matches">Sort by: Match Count</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4 w-10"></th>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4 text-right">Supplier Price</th>
              <th className="px-6 py-4 text-center">Matches</th>
              <th className="px-6 py-4 text-right">Market Avg</th>
              <th className="px-6 py-4 text-right">Min Market</th>
              <th className="px-6 py-4 text-center">Pricing Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {viewRows.length > 0 ? (
              viewRows.map(({ supplier: sup, matchedItems, productMatches, stats }) => {
                const health = getHealthStatus(stats.varianceFromAvg);
                const isExpanded = expandedRows.has(sup.id);

                return (
                  <React.Fragment key={sup.id}>
                    <tr className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isExpanded ? 'bg-indigo-50/30' : ''}`} onClick={() => toggleRow(sup.id)}>
                      <td className="px-6 py-4">
                        <button className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="9 5l7 7-7 7"/></svg>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{sup.description}</div>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-xs text-slate-400 font-mono">{sup.code}</span>
                          {sup.size && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Size: {sup.size}</span>}
                          {sup.otherFeature && <span className="text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-500">{sup.otherFeature}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {sup.price.toFixed(2)} <span className="text-[10px] text-slate-400">{sup.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${matchedItems.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                          {matchedItems.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {stats.avg > 0 ? stats.avg.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {stats.min > 0 ? stats.min.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {matchedItems.length > 0 ? (
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-bold ${healthColors[health]}`}>
                            {stats.varianceFromAvg > 0 ? '+' : ''}{stats.varianceFromAvg.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No Match</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-slate-50/50">
                          <div className="border-l-4 border-indigo-400 pl-4 py-2 space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Market Comparison Details</h4>
                            {matchedItems.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4">
                                {productMatches.map(pm => {
                                  const mk = markets.find(m => m.id === pm.marketId)!;
                                  return (
                                    <div key={mk.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                      <div className="flex-grow">
                                        <div className="text-sm font-bold text-slate-800">{mk.description}</div>
                                        <div className="flex gap-2 items-center mt-1">
                                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{mk.source || 'Unknown'}</span>
                                          <span className="text-[10px] text-slate-400">{mk.country || 'Global'}</span>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 text-center">
                                        <div>
                                          <div className="text-[9px] text-slate-400 uppercase font-bold">Base Price</div>
                                          <div className="text-sm font-bold text-slate-900">{mk.price.toFixed(2)}</div>
                                        </div>
                                        <div>
                                          <div className="text-[9px] text-slate-400 uppercase font-bold">Min/Max</div>
                                          <div className="text-xs font-medium text-slate-600">
                                            {mk.minPrice?.toFixed(1) || '-'}/{mk.maxPrice?.toFixed(1) || '-'}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[9px] text-slate-400 uppercase font-bold">Retail</div>
                                          <div className="text-sm font-bold text-emerald-600">{mk.retailPrice?.toFixed(2) || '-'}</div>
                                        </div>
                                        <div>
                                          <div className="text-[9px] text-slate-400 uppercase font-bold">Wholesale</div>
                                          <div className="text-sm font-bold text-indigo-600">{mk.wholesalePrice?.toFixed(2) || '-'}</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${pm.confidence > 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {pm.confidence.toFixed(0)}% Match
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-400 italic">No market matches found within the confidence threshold.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
