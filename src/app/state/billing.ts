export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';
export type BillingPlanId = 'free' | 'creator' | 'pro' | 'studio';

export type BillingPlan = {
  id: BillingPlanId;
  name: string;
  audience: string;
  monthlyPrice: number;
  credits: number;
  avatarLimit: number;
  highlights: string[];
};

export type BillingState = {
  planId: BillingPlanId;
  period: BillingPeriod;
  credits: number;
  renewalAt: string;
  simulatedRevenue: number;
  updatedAt?: string;
};

export const DEMO_GENERATION_CREDIT_COST = 80;

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: '体验版',
    audience: '适合短期试用和小规模内测',
    monthlyPrice: 29,
    credits: 120,
    avatarLimit: 2,
    highlights: ['每月 120 生成额度', '最多 2 个自建分身', '可体验分身召唤和作品生成'],
  },
  {
    id: 'creator',
    name: '创作者版',
    audience: '适合稳定创作和对比分身组合',
    monthlyPrice: 99,
    credits: 1200,
    avatarLimit: 10,
    highlights: ['每月 1200 生成额度', '最多 10 个自建分身', '支持分身对比与高质量 Demo'],
  },
  {
    id: 'pro',
    name: 'Pro 版',
    audience: '适合团队协作和高频作品生产',
    monthlyPrice: 199,
    credits: 3200,
    avatarLimit: 50,
    highlights: ['每月 3200 生成额度', '最多 50 个分身资产', '优先使用真实音乐生成队列'],
  },
  {
    id: 'studio',
    name: 'Studio 版',
    audience: '适合工作室和商业项目',
    monthlyPrice: 499,
    credits: 9000,
    avatarLimit: 999,
    highlights: ['每月 9000 生成额度', '不限量分身资产', '商业授权和结算看板预留'],
  },
];

export const BILLING_PERIODS: Array<{ id: BillingPeriod; label: string; multiplier: number; discount: string }> = [
  { id: 'monthly', label: '按月', multiplier: 1, discount: '灵活订阅' },
  { id: 'quarterly', label: '按季度', multiplier: 2.7, discount: '约 9 折' },
  { id: 'yearly', label: '按年', multiplier: 9.6, discount: '约 8 折' },
];

export function createDefaultBilling(): BillingState {
  const renewalAt = new Date();
  renewalAt.setMonth(renewalAt.getMonth() + 1);
  return {
    planId: 'free',
    period: 'monthly',
    credits: 120,
    renewalAt: renewalAt.toISOString(),
    simulatedRevenue: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeBilling(value: unknown): BillingState {
  const fallback = createDefaultBilling();
  if (!value || typeof value !== 'object') return fallback;
  const partial = value as Partial<BillingState>;
  const planId = BILLING_PLANS.some((plan) => plan.id === partial.planId) ? partial.planId as BillingPlanId : fallback.planId;
  const period = BILLING_PERIODS.some((item) => item.id === partial.period) ? partial.period as BillingPeriod : fallback.period;
  return {
    planId,
    period,
    credits: typeof partial.credits === 'number' && Number.isFinite(partial.credits) ? Math.max(0, Math.floor(partial.credits)) : fallback.credits,
    renewalAt: partial.renewalAt || fallback.renewalAt,
    simulatedRevenue: typeof partial.simulatedRevenue === 'number' && Number.isFinite(partial.simulatedRevenue) ? Math.max(0, partial.simulatedRevenue) : fallback.simulatedRevenue,
    updatedAt: partial.updatedAt || fallback.updatedAt,
  };
}

export function planPrice(plan: BillingPlan, period: BillingPeriod) {
  const periodConfig = BILLING_PERIODS.find((item) => item.id === period) ?? BILLING_PERIODS[0];
  return Math.round(plan.monthlyPrice * periodConfig.multiplier);
}
