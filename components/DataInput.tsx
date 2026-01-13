
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
    price: '',
    currency: '',
    incoterm: '',
    moq: ''
  });

  const [marketCols, setMarketCols] = useState<ColumnData>({
    description: '',
    price: '',
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

  const zipData = () => {
    // Process Supplier Data
    const sCodes = supplierCols.code.split('\n');
    const sDescs = supplierCols.description.split('\n');
    const sPrices = supplierCols.price.split('\n');
    const sCurrencies = supplierCols.currency.split('\n');
    const sIncoterms = supplierCols.incoterm.split('\n');
    const sMoqs = supplierCols.moq.split('\n');

    const maxSupplierRows = Math.max(sCodes.length, sDescs.length, sPrices.length);
    const suppliers: SupplierProduct[] = [];

    for (let i = 0; i < maxSupplierRows; i++) {
      const desc = sDescs[i]?.trim() || '';
      if (!desc && !sCodes[i]?.trim()) continue; // Skip empty rows

      suppliers.push({
        id: `sup-${i}-${Date.now()}`,
        code: sCodes[i]?.trim() || 'N/A',
        description: desc || `Product ${i + 1}`,
        price: parseFloat(sPrices[i]?.replace(/[^\d.]/g, '') || '0'),
        currency: sCurrencies[i]?.trim() || 'USD',
        incoterm: sIncoterms[i]?.trim(),
        moq: sMoqs[i]?.trim(),
        normalizedTokens: normalizeText(desc)
      });
    }

    // Process Market Data
    const mDescs = marketCols.description.split('\n');
    const mPrices = marketCols.price.split('\n');
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
        price: parseFloat(mPrices[i]?.replace(/[^\d.]/g, '') || '0'),
        currency: mCurrencies[i]?.trim() || 'USD',
        source: mSources[i]?.trim(),
        country: mCountries[i]?.trim(),
        normalizedTokens: normalizeText(desc)
      });
    }

    onProcess(suppliers, markets);
  };

  const ColumnBox = ({ label, value, onChange, placeholder, required = false }: any) => (
    <div className="flex flex-col min-w-[200px] flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        className="h-64 p-3 font-mono text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition excel-input shadow-sm resize-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1 text-[10px] text-slate-400 font-medium">
        {value.split('\n').filter((l: string) => l.trim()).length} rows detected
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Supplier Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">1. Supplier Data Columns</h2>
            <p className="text-sm text-slate-500">Paste entire columns from Excel into each respective box below.</p>
          </div>
          <div className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Master Reference</div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <ColumnBox 
            label="Product Code" 
            value={supplierCols.code} 
            onChange={(v: string) => handleSupplierColChange('code', v)} 
            placeholder="PROD-001&#10;PROD-002"
          />
          <ColumnBox 
            label="Description" 
            value={supplierCols.description} 
            onChange={(v: string) => handleSupplierColChange('description', v)} 
            placeholder="Standard Adhesive&#10;Heavy Duty Sealant"
            required
          />
          <ColumnBox 
            label="Price" 
            value={supplierCols.price} 
            onChange={(v: string) => handleSupplierColChange('price', v)} 
            placeholder="45.50&#10;120.00"
            required
          />
          <ColumnBox 
            label="Currency" 
            value={supplierCols.currency} 
            onChange={(v: string) => handleSupplierColChange('currency', v)} 
            placeholder="USD&#10;EUR"
          />
          <ColumnBox 
            label="Incoterm" 
            value={supplierCols.incoterm} 
            onChange={(v: string) => handleSupplierColChange('incoterm', v)} 
            placeholder="FOB&#10;EXW"
          />
          <ColumnBox 
            label="MOQ" 
            value={supplierCols.moq} 
            onChange={(v: string) => handleSupplierColChange('moq', v)} 
            placeholder="100&#10;500"
          />
        </div>
      </section>

      {/* Market Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Market Research Columns</h2>
            <p className="text-sm text-slate-500">Paste messy market data here. The app will normalize and match these descriptions to the supplier.</p>
          </div>
          <div className="px-3 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">External Data</div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <ColumnBox 
            label="Market Description" 
            value={marketCols.description} 
            onChange={(v: string) => handleMarketColChange('description', v)} 
            placeholder="Super Glue 500ml&#10;Industrial Sealant"
            required
          />
          <ColumnBox 
            label="Market Price" 
            value={marketCols.price} 
            onChange={(v: string) => handleMarketColChange('price', v)} 
            placeholder="48.00&#10;115.00"
            required
          />
          <ColumnBox 
            label="Currency" 
            value={marketCols.currency} 
            onChange={(v: string) => handleMarketColChange('currency', v)} 
            placeholder="USD&#10;USD"
          />
          <ColumnBox 
            label="Distributor / Source" 
            value={marketCols.source} 
            onChange={(v: string) => handleMarketColChange('source', v)} 
            placeholder="GlobalSource&#10;DirectChem"
          />
          <ColumnBox 
            label="Region / Country" 
            value={marketCols.country} 
            onChange={(v: string) => handleMarketColChange('country', v)} 
            placeholder="USA&#10;Germany"
          />
        </div>
      </section>

      <div className="flex justify-center border-t border-slate-200 pt-8">
        <button
          onClick={zipData}
          disabled={!supplierCols.description || !marketCols.description}
          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          Process and Match Data
        </button>
      </div>
    </div>
  );
};

export default DataInput;
