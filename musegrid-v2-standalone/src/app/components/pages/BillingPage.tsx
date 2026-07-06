import { CreditCard, Crown, Gem, ReceiptText, Sparkles, TrendingUp, Wallet, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '../common/GlassCard';
import { Tag } from '../common/Tag';
import { C, S, T } from '../../design/tokens';
import {
  BILLING_PERIODS,
  BILLING_PLANS,
  DEMO_GENERATION_CREDIT_COST,
  planPrice,
  type BillingPeriod,
  type BillingPlanId,
  type BillingState,
} from '../../state/billing';

type BillingPageProps = {
  billing: BillingState;
  onPeriodChange: (period: BillingPeriod) => void;
  onUpgradePlan: (planId: BillingPlanId, period: BillingPeriod) => void;
};

const revenueRows = [
  { label: '分身召唤收益', value: '¥128.40', desc: '外部项目召唤你的分身后产生的模拟分成' },
  { label: '作品播放分成', value: '¥36.80', desc: '作品页播放数据折算的体验期收益' },
  { label: '商业授权分成', value: '¥72.00', desc: '未来授权和商用任务的结算入口' },
];

const usageRows = [
  { label: '生成最终 Demo', value: `${DEMO_GENERATION_CREDIT_COST} 额度/次` },
  { label: '分身候选对比', value: '20 额度/次' },
  { label: '高质量导出', value: '120 额度/次' },
];

export function BillingPage({ billing, onPeriodChange, onUpgradePlan }: BillingPageProps) {
  const currentPlan = BILLING_PLANS.find((plan) => plan.id === billing.planId) ?? BILLING_PLANS[0];
  const currentPeriod = BILLING_PERIODS.find((period) => period.id === billing.period) ?? BILLING_PERIODS[0];
  const simulatedRevenue = Math.max(billing.simulatedRevenue, 237.2);
  const pendingRevenue = simulatedRevenue * 0.62;

  function handleUpgrade(planId: BillingPlanId) {
    onUpgradePlan(planId, billing.period);
    const plan = BILLING_PLANS.find((item) => item.id === planId);
    toast.success(`${plan?.name ?? '套餐'}已在体验期模拟开通，额度已刷新`);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: C.bg0, padding: '24px 28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 }}>
        <div>
          <h1 style={{ ...T.display, color: C.t0 }}>订阅与额度</h1>
          <p style={{ ...T.caption, color: C.t2, marginTop: 5 }}>
            管理生成额度、订阅周期和创作者收益。当前为体验期模拟支付，不会真实扣款。
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {BILLING_PERIODS.map((period) => {
            const active = billing.period === period.id;
            return (
              <button
                key={period.id}
                onClick={() => onPeriodChange(period.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: active ? '1px solid rgba(99,102,241,0.4)' : `1px solid ${C.bdr0}`,
                  background: active ? C.accentDim : 'rgba(255,255,255,0.04)',
                  color: active ? C.accentLight : C.t2,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {period.label}
                <span style={{ marginLeft: 6, color: active ? C.t1 : C.t3, fontWeight: 400 }}>{period.discount}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, marginBottom: 16 }}>
        <GlassCard pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p style={{ ...T.label, color: C.t3, marginBottom: 6 }}>当前套餐</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Crown size={18} color={C.warning} />
                <p style={{ ...T.heading, color: C.t0 }}>{currentPlan.name}</p>
                <Tag variant="accent">{currentPeriod.label}</Tag>
              </div>
              <p style={{ ...T.caption, color: C.t2 }}>{currentPlan.audience}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...T.label, color: C.t3, marginBottom: 4 }}>生成额度</p>
              <p style={{ color: C.warning, fontSize: 30, fontWeight: 800, fontFamily: "'Inter', monospace" }}>{billing.credits.toLocaleString('zh-CN')}</p>
              <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>到期续期：{new Date(billing.renewalAt).toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard pad={18} glow="warning">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ReceiptText size={18} color={C.warning} />
            <div>
              <p style={{ ...T.subheading, color: C.t0 }}>体验期模拟，不可提现</p>
              <p style={{ ...T.label, color: C.t3, marginTop: 2 }}>支付、充值和收益结算目前均为演示状态</p>
            </div>
          </div>
          <p style={{ ...T.caption, color: C.t2, lineHeight: 1.7 }}>
            现在先把商业闭环展示出来：用户可以选择订阅周期、模拟开通套餐、消耗额度生成作品；未来接入真实支付后，这里会替换为支付订单和结算后台。
          </p>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
        {BILLING_PLANS.map((plan) => {
          const active = plan.id === billing.planId;
          const price = planPrice(plan, billing.period);
          const isCreator = plan.id === 'creator';
          return (
            <GlassCard key={plan.id} active={active} pad={16} style={{ display: 'flex', flexDirection: 'column', minHeight: 238 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                <p style={{ ...T.subheading, color: C.t0 }}>{plan.name}</p>
                {active ? <Tag variant="success">当前</Tag> : isCreator ? <Tag variant="warning">推荐</Tag> : <Tag variant="dim">{plan.avatarLimit >= 999 ? '不限分身' : `${plan.avatarLimit}分身`}</Tag>}
              </div>
              <p style={{ ...T.caption, color: C.t2, minHeight: 34, lineHeight: 1.6 }}>{plan.audience}</p>
              <div style={{ margin: '14px 0 12px' }}>
                <span style={{ color: C.t0, fontSize: 26, fontWeight: 800, fontFamily: "'Inter', monospace" }}>¥{price}</span>
                <span style={{ ...T.label, color: C.t3, marginLeft: 5 }}>/{currentPeriod.label.replace('按', '')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {plan.highlights.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={10} color={C.accentLight} />
                    <span style={{ ...T.label, color: C.t2 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => handleUpgrade(plan.id)}
                style={{
                  ...(active ? S.btnGhost : plan.id === 'creator' ? S.btnPrimary : S.btnAccentOutline),
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 10,
                }}
              >
                {active ? '刷新当前额度（演示）' : `开通${plan.name}（演示）`}
              </button>
            </GlassCard>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <GlassCard pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={17} color={C.success} />
              <p style={{ ...T.subheading, color: C.t0 }}>收益中心</p>
            </div>
            <Tag variant="warning">体验期模拟，不可提现</Tag>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}>
              <p style={{ ...T.label, color: C.t3, marginBottom: 4 }}>模拟总收益</p>
              <p style={{ color: C.success, fontSize: 22, fontWeight: 800, fontFamily: "'Inter', monospace" }}>¥{simulatedRevenue.toFixed(2)}</p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}>
              <p style={{ ...T.label, color: C.t3, marginBottom: 4 }}>待结算</p>
              <p style={{ color: C.warning, fontSize: 22, fontWeight: 800, fontFamily: "'Inter', monospace" }}>¥{pendingRevenue.toFixed(2)}</p>
            </div>
          </div>
          {revenueRows.map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <p style={{ ...T.caption, color: C.t1, fontWeight: 600 }}>{row.label}</p>
                <p style={{ ...T.label, color: C.t3, marginTop: 3 }}>{row.desc}</p>
              </div>
              <span style={{ color: C.accentLight, fontSize: 15, fontWeight: 800, fontFamily: "'Inter', monospace" }}>{row.value}</span>
            </div>
          ))}
        </GlassCard>

        <GlassCard pad={18}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={17} color={C.warning} />
            <p style={{ ...T.subheading, color: C.t0 }}>额度消耗规则</p>
          </div>
          {usageRows.map((row) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.035)', border: `1px solid ${C.bdr0}`, marginBottom: 8 }}>
              <span style={{ ...T.caption, color: C.t1 }}>{row.label}</span>
              <span style={{ ...T.caption, color: C.warning, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Gem size={14} color={C.accentLight} />
              <p style={{ ...T.caption, color: C.accentLight, fontWeight: 700 }}>未来变现准备</p>
            </div>
            <p style={{ ...T.caption, color: C.t2, lineHeight: 1.8 }}>
              后续可以接入真实充值、订阅续费、创作者分身被召唤后的分成账单，以及作品商业授权收入。
            </p>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={13} color={C.success} />
            <p style={{ ...T.label, color: C.t3 }}>当前模拟套餐可支持约 {Math.floor(billing.credits / DEMO_GENERATION_CREDIT_COST)} 次最终 Demo 生成。</p>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, color: C.t3 }}>
        <CreditCard size={13} />
        <p style={{ ...T.label }}>演示环境不会发起真实扣款。正式上线前需要接入支付、订单、发票和结算审核。</p>
      </div>
    </div>
  );
}
