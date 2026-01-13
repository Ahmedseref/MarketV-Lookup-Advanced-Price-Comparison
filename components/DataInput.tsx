
import React, { useState } from 'react';
import { SupplierProduct, MarketProduct } from '../types';
import { normalizeText } from '../utils/matching';

interface DataInputProps {
  onProcess: (suppliers: SupplierProduct[], markets: MarketProduct[]) => void;
}

interface ColumnData {
  [key: string]: string;
}

const DataInput: React.FC<DataInputProps> = ({ onProcess }) => {
  const [supplierCols, setSupplierCols] = useState<ColumnData>({
    code: '',
    description: '',
    size: '',
    feature: '',
    price: '',
    currency: '',
    incoterm: '',
    moq: ''
  });

  const [marketCols, setMarketCols] = useState<ColumnData>({
    description: '',
    price: '',
    minPrice: '',
    maxPrice: '',
    retail: '',
    wholesale: '',
    currency: '',
    source: '',
    country: ''
  });

  const handleSupplierColChange = (key: string, value: string) => {
    setSupplierCols(prev => ({ ...prev, [key]: value }));
  };

  const handleMarketColChange = (key: string, value: string) => {
    setMarketCols(prev => ({ ...prev, [key]: value }));
  };

  const parseVal = (val: string) => {
    const cleaned = val?.replace(/[^\d.]/g, '');
    return cleaned ? parseFloat(cleaned) : undefined;
  };

  const zipData = () => {
    // Process Supplier Data
    const sCodes = supplierCols.code.split('\n');
    const sDescs = supplierCols.description.split('\n');
    const sSizes = supplierCols.size.split('\n');
    const sFeatures = supplierCols.feature.split('\n');
    const sPrices = supplierCols.price.split('\n');
    const sCurrencies = supplierCols.currency.split('\n');
    const sIncoterms = supplierCols.incoterm.split('\n');
    const sMoqs = supplierCols.moq.split('\n');

    const maxSupplierRows = Math.max(sCodes.length, sDescs.length, sPrices.length);
    const suppliers: SupplierProduct[] = [];

    for (let i = 0; i < maxSupplierRows; i++) {
      const desc = sDescs[i]?.trim() || '';
      if (!desc && !sCodes[i]?.trim()) continue;

      suppliers.push({
        id: `sup-${i}-${Date.now()}`,
        code: sCodes[i]?.trim() || 'N/A',
        description: desc || `Product ${i + 1}`,
        size: sSizes[i]?.trim(),
        otherFeature: sFeatures[i]?.trim(),
        price: parseVal(sPrices[i]) || 0,
        currency: sCurrencies[i]?.trim() || 'USD',
        incoterm: sIncoterms[i]?.trim(),
        moq: sMoqs[i]?.trim(),
        normalizedTokens: normalizeText(`${desc} ${sSizes[i] || ''} ${sFeatures[i] || ''}`)
      });
    }

    // Process Market Data
    const mDescs = marketCols.description.split('\n');
    const mPrices = marketCols.price.split('\n');
    const mMinPrices = marketCols.minPrice.split('\n');
    const mMaxPrices = marketCols.maxPrice.split('\n');
    const mRetail = marketCols.retail.split('\n');
    const mWholesale = marketCols.wholesale.split('\n');
    const mCurrencies = marketCols.currency.split('\n');
    const mSources = marketCols.source.split('\n');
    const mCountries = marketCols.country.split('\n');

    const maxMarketRows = Math.max(mDescs.length, mPrices.length);
    const markets: MarketProduct[] = [];

    for (let i = 0; i < maxMarketRows; i++) {
      const desc = mDescs[i]?.trim() || '';
      if (!desc && !mPrices[i]?.trim()) continue;

      markets.push({
        id: `mkt-${i}-${Date.now()}`,
        description: desc || `Market Item ${i + 1}`,
        price: parseVal(mPrices[i]) || 0,
        minPrice: parseVal(mMinPrices[i]),
        maxPrice: parseVal(mMaxPrices[i]),
        retailPrice: parseVal(mRetail[i]),
        wholesalePrice: parseVal(mWholesale[i]),
        currency: mCurrencies[i]?.trim() || 'USD',
        source: mSources[i]?.trim(),
        country: mCountries[i]?.trim(),
        normalizedTokens: normalizeText(desc)
      });
    }

    onProcess(suppliers, markets);
  };

  const ColumnBox = ({ label, value, onChange, placeholder, required = false, theme = 'indigo' }: any) => (
    <div className="flex flex-col min-w-[180px] flex-1">
      <label className={`text-[10px] font-bold ${theme === 'indigo' ? 'text-indigo-600' : 'text-amber-600'} uppercase mb-1 flex justify-between`}>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        className="h-64 p-3 font-mono text-[11px] bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition excel-input shadow-sm resize-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1 text-[10px] text-slate-400 font-medium">
        {value.split('\n').filter((l: string) => l.trim()).length} rows
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Supplier Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Standardized Supplier Columns</h2>
            <p className="text-sm text-slate-500">Paste your master data catalog columns individually.</p>
          </div>
          <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Source of Truth</div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <ColumnBox label="Code" value={supplierCols.code} onChange={(v: string) => handleSupplierColChange('code', v)} placeholder="SKU-101" />
          <ColumnBox label="Description" value={supplierCols.description} onChange={(v: string) => handleSupplierColChange('description', v)} placeholder="Standard Valve" required />
          <ColumnBox label="Size" value={supplierCols.size} onChange={(v: string) => handleSupplierColChange('size', v)} placeholder="1/2 inch" />
          <ColumnBox label="Other Feature" value={supplierCols.feature} onChange={(v: string) => handleSupplierColChange('feature', v)} placeholder="Stainless Steel" />
          <ColumnBox label="Price" value={supplierCols.price} onChange={(v: string) => handleSupplierColChange('price', v)} placeholder="10.50" required />
          <ColumnBox label="Currency" value={supplierCols.currency} onChange={(v: string) => handleSupplierColChange('currency', v)} placeholder="USD" />
          <ColumnBox label="Incoterm" value={supplierCols.incoterm} onChange={(v: string) => handleSupplierColChange('incoterm', v)} placeholder="FOB" />
          <ColumnBox label="MOQ" value={supplierCols.moq} onChange={(v: string) => handleSupplierColChange('moq', v)} placeholder="100" />
        </div>
      </section>

      {/* Market Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">2. Market Research Columns</h2>
            <p className="text-sm text-slate-500">Capture varied market data, including multiple price points (Retail, Wholesale, etc.).</p>
          </div>
          <div className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Market Context</div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <ColumnBox label="Description" value={marketCols.description} onChange={(v: string) => handleMarketColChange('description', v)} placeholder="Valve 0.5'" theme="amber" required />
          <ColumnBox label="Base Price" value={marketCols.price} onChange={(v: string) => handleMarketColChange('price', v)} placeholder="11.00" theme="amber" required />
          <ColumnBox label="Min Price" value={marketCols.minPrice} onChange={(v: string) => handleMarketColChange('minPrice', v)} placeholder="9.00" theme="amber" />
          <ColumnBox label="Max Price" value={marketCols.maxPrice} onChange={(v: string) => handleMarketColChange('maxPrice', v)} placeholder="13.00" theme="amber" />
          <ColumnBox label="Retail" value={marketCols.retail} onChange={(v: string) => handleMarketColChange('retail', v)} placeholder="15.00" theme="amber" />
          <ColumnBox label="Wholesale" value={marketCols.wholesale} onChange={(v: string) => handleMarketColChange('wholesale', v)} placeholder="8.50" theme="amber" />
          <ColumnBox label="Currency" value={marketCols.currency} onChange={(v: string) => handleMarketColChange('currency', v)} placeholder="USD" theme="amber" />
          <ColumnBox label="Source" value={marketCols.source} onChange={(v: string) => handleMarketColChange('source', v)} placeholder="Alibaba" theme="amber" />
          <ColumnBox label="Country" value={marketCols.country} onChange={(v: string) => handleMarketColChange('country', v)} placeholder="CN" theme="amber" />
        </div>
      </section>

      <div className="flex justify-center border-t border-slate-200 pt-8 pb-12">
        <button
          onClick={zipData}
          disabled={!supplierCols.description || !marketCols.description}
          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          Initialize XLOOKUP Analysis
        </button>
      </div>
    </div>
  );
};

export default DataInput;
