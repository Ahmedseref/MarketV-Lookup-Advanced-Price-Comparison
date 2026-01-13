
import { PricingStats } from '../types';

export const calculateStats = (supplierPrice: number, marketPrices: number[]): PricingStats => {
  if (marketPrices.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0, varianceFromAvg: 0, varianceFromMin: 0 };
  }
  
  const min = Math.min(...marketPrices);
  const max = Math.max(...marketPrices);
  const sum = marketPrices.reduce((a, b) => a + b, 0);
  const avg = sum / marketPrices.length;
  
  return {
    min,
    max,
    avg,
    count: marketPrices.length,
    varianceFromAvg: ((supplierPrice - avg) / avg) * 100,
    varianceFromMin: ((supplierPrice - min) / min) * 100
  };
};
