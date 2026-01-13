
export interface SupplierProduct {
  id: string;
  code: string;
  description: string;
  price: number;
  currency: string;
  incoterm?: string;
  moq?: string;
  normalizedTokens: string[];
}

export interface MarketProduct {
  id: string;
  description: string;
  price: number;
  currency: string;
  source?: string;
  country?: string;
  normalizedTokens: string[];
}

export interface MatchResult {
  supplierId: string;
  marketId: string;
  confidence: number;
  reason?: string;
}

export interface PricingStats {
  min: number;
  max: number;
  avg: number;
  count: number;
  varianceFromAvg: number;
  varianceFromMin: number;
}

export type HealthStatus = 'good' | 'warning' | 'critical' | 'neutral';

export enum TabType {
  INPUT = 'INPUT',
  ANALYSIS = 'ANALYSIS',
  DASHBOARD = 'DASHBOARD'
}
