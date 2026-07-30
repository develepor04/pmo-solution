import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  AlertTriangle, BarChart2, Clock, TrendingUp, Activity, Loader2, Users,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import useStore from '../store/useStore';
import useSheetData from '../hooks/useSheetData';
import useIsMobile from '../hooks/useIsMobile';

const HEALTH_COLOR = { 'On Track': '#16a34a', Recovering: '#16a34a', 'At Risk': '#f59e0b', Critical: '#dc2626' };

// TEMPORARY placeholder data for the two widgets with no real data source at
// all: Schedule Variance Trend (needs historical snapshots we don't store)
// and Risk Score (no composite risk model exists yet). Cost Intelligence and
// Productivity now use real figures from compute_metrics_from_sheet -- see
// metrics.costChart/costBreakdown/costCategoryTable and
// metrics.productivity/productivityGap.
const DUMMY_SCHEDULE_TREND = [
  { month: 'Feb', variance: -2 }, { month: 'Mar', variance: -6 }, { month: 'Apr', variance: -5 },
  { month: 'May', variance: -11 }, { month: 'Jun', variance: -9 }, { month: 'Jul', variance: -14 },
  { month: 'Aug', variance: -18 }, { month: 'Sep', variance: -16 }, { month: 'Oct', variance: -20 },
  { month: 'Now', variance: -23 },
];
const DUMMY_RISK_SCORE = 68;
const DUMMY_RISK_LABEL = 'Elevated';

// Sheet dates are stored either as Excel serial numbers (days since
// 1899-12-30) or as plain date strings, depending on how the source cell
// was typed -- mirrors thetaValidation.js's isValidDateValue serial range.
// '% Complete' cells come through as either a 0-100 number/string ("45",
// "45%") or an Excel percentage-formatted fraction (0.45 meaning 45%) --
// both are common depending on how the source cell was typed/exported.
function parsePercentValue(v) {
  const n = parseFloat(String(v ?? '').replace('%', ''));
  if (!Number.isFinite(n)) return null;
  return n <= 1 ? n * 100 : n;
}

// Briefly flags a card as "just updated" when the watched value changes
// between polls -- gives the live 3s/5s polling a visible, synchronized cue
// instead of numbers silently jumping.
function useChangeFlash(value) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value]);
  return flash;
}

function parseSheetDate(v) {
  if (v === undefined || v === null || v === '') return null;
  if (typeof v === 'number' && v > 0 && v < 100000) {
    return new Date(Math.round((v - 25569) * 86400 * 1000));
  }
  const s = String(v).trim().replace(/\s*[A*]$/i, '').trim();
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Light-themed executive report shown after Theta Sheets processing/save.
 * A single continuous page (no tabs) styled after the app's "Pulse Command
 * Center" reference -- stat cards, planned-vs-actual progress, project
 * health gauge, an expandable executive summary, delayed activities /
 * upcoming milestones, and a critical path callout.
 *
 * Most figures are pulled directly from compute_metrics_from_sheet (backend,
 * already verified against the real saved data) or derived client-side from
 * the same active sheet's raw rows (planned-vs-actual per phase, delayed
 * activities, upcoming milestones, progress %, critical path chain).
 * Widgets we can't honestly back with real fields at all (external
 * data-source freshness, decisions/safety feeds) are omitted rather than
 * faked. Schedule Variance Trend and Risk Score still use placeholder data
 * (no historical snapshots or composite risk model exist yet) -- see the
 * DUMMY_* constants above and their "Preview data" badges below.
 */
export default function ThetaReportView() {
  const { user } = useStore();
  const isMobile = useIsMobile();
  const [openSummaryIdx, setOpenSummaryIdx] = useState(0);
  const { metrics, lastUpdated } = useSheetData({ mode: 'metrics', useActive: true, pollIntervalMs: 3000 });
  const { sheet } = useSheetData({ mode: 'sheet', useActive: true, pollIntervalMs: 5000 });

  const grid = sheet?.data?.sheets?.[0];
  const headers = grid?.headers || [];
  const rows = grid?.rows || [];
  const colIdx = useMemo(() => Object.fromEntries(headers.map((h, i) => [h, i])), [headers]);
  const col = (row, name) => (colIdx[name] !== undefined ? row[colIdx[name]] : undefined);

  const activities = useMemo(
    () => rows.filter(r => String(col(r, 'Activity ID') ?? '').trim() && String(col(r, 'Activity Name') ?? '').trim()),
    [rows, colIdx]
  );

  const progressPct = useMemo(() => {
    const vals = activities
      .map(r => parsePercentValue(col(r, '% Complete')))
      .filter(v => v !== null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [activities, colIdx]);

  const delayedActivities = useMemo(() => {
    return activities
      .filter(r => String(col(r, 'Status') ?? '').trim() === 'Delayed')
      .map(r => ({
        id: col(r, 'Activity ID'),
        name: col(r, 'Activity Name'),
        days: Math.round(parseFloat(col(r, 'Variance (Days)')) || 0),
      }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);
  }, [activities, colIdx]);

  const upcomingMilestones = useMemo(() => {
    const now = Date.now();
    const in60d = now + 60 * 24 * 3600 * 1000;
    return activities
      .filter(r => String(col(r, 'Status') ?? '').trim() !== 'Completed')
      .map(r => {
        const d = parseSheetDate(col(r, 'Forecast Finish'));
        return d ? { name: col(r, 'Activity Name'), date: d, status: col(r, 'Status') } : null;
      })
      .filter(Boolean)
      .filter(m => m.date.getTime() >= now && m.date.getTime() <= in60d)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5);
  }, [activities, colIdx]);

  // Planned vs actual progress, per phase -- "actual" is the real avg
  // % Complete; "planned" is how far along each activity's own baseline
  // start/finish window says it should be today. Both real, both derived
  // from the sheet's own dates/values.
  const phaseProgress = useMemo(() => {
    const order = [];
    const byPhase = {};
    activities.forEach(r => {
      const phase = String(col(r, 'Phase') ?? '').trim();
      if (!phase) return;
      if (!byPhase[phase]) { byPhase[phase] = []; order.push(phase); }
      byPhase[phase].push(r);
    });
    const now = Date.now();
    return order.map(phase => {
      const phaseRows = byPhase[phase];
      const actualVals = phaseRows
        .map(r => parsePercentValue(col(r, '% Complete')))
        .filter(v => v !== null);
      const actual = actualVals.length ? Math.round(actualVals.reduce((a, b) => a + b, 0) / actualVals.length) : 0;
      const plannedVals = phaseRows.map(r => {
        const bs = parseSheetDate(col(r, 'Baseline Start'));
        const bf = parseSheetDate(col(r, 'Baseline Finish'));
        if (!bs || !bf || bf.getTime() <= bs.getTime()) return null;
        const p = ((now - bs.getTime()) / (bf.getTime() - bs.getTime())) * 100;
        return Math.max(0, Math.min(100, p));
      }).filter(v => v !== null);
      const planned = plannedVals.length ? Math.round(plannedVals.reduce((a, b) => a + b, 0) / plannedVals.length) : 0;
      return { phase, planned, actual };
    });
  }, [activities, colIdx]);

  // Critical Path callout -- which phases form the active delay chain,
  // derived from the same real scheduleRows the backend already computes.
  const criticalPath = useMemo(() => {
    const scheduleRows = metrics?.scheduleRows || [];
    const offTrack = scheduleRows.filter(r => r.variance !== 'Closed');
    return {
      count: offTrack.length,
      chainText: offTrack.length
        ? `Longest delay chain runs through ${offTrack.map(r => r.phase).join(' → ')}. Any further slip in ${offTrack[0].phase} moves the downstream phases directly.`
        : 'No active delay chain — every phase is on or ahead of baseline.',
    };
  }, [metrics]);

  if (!metrics) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#94a3b8', fontSize: 13 }}>
        <Loader2 size={16} className="spinning" /> Loading report…
      </div>
    );
  }

  const isOnTrack = metrics.healthStatus === 'On Track';
  const healthColor = HEALTH_COLOR[metrics.healthStatus] || '#f59e0b';
  const scheduleColor = metrics.scheduleVariance > 20 ? '#dc2626' : metrics.scheduleVariance > 0 ? '#f59e0b' : '#16a34a';
  const costColor = metrics.costExposure > 1 ? '#dc2626' : metrics.costExposure > 0 ? '#f59e0b' : '#16a34a';

  const summaryItems = [
    {
      label: 'Overall status',
      dot: healthColor,
      meta: `${metrics.healthIndex}% complete · ${metrics.scheduleVariance} days behind`,
      detail: metrics.aiInsight,
    },
    {
      label: 'Cost & contingency',
      dot: costColor,
      meta: `AED ${metrics.costExposure}M exposure · ${metrics.costExposure <= 1 ? 'within budget' : 'over budget'}`,
      detail: metrics.costLinkage,
    },
    {
      label: 'Schedule recovery',
      dot: '#16a34a',
      meta: `+${metrics.recoveryDays} days recoverable · AED ${metrics.recoverySavings} savings potential`,
      detail: `Recovery plan carries ${metrics.recoveryConf}% confidence, based on current trajectory and how many activities already have a real Actual Finish date logged.`,
    },
  ];

  return (
    <div className="trv-scroll" style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
      <style>{`
        @keyframes trv-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.35); } 50% { box-shadow: 0 0 0 6px rgba(5,150,105,0); } }
        .trv-live-dot { animation: trv-pulse 2s ease-in-out infinite; }
        .trv-summary-row { transition: background 0.15s ease; }
        .trv-summary-row:hover { background: #f8fafc; }
        @keyframes trv-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .trv-fade { animation: trv-fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .trv-card { transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease; }
        .trv-card:hover { box-shadow: 0 10px 24px rgba(15,23,42,0.09); transform: translateY(-2px); }
        .trv-activity-row { transition: background 0.15s ease, padding-left 0.15s ease; border-radius: 8px; }
        .trv-activity-row:hover { background: #f8fafc; padding-left: 6px; }
        .trv-card:hover .trv-icon-box { transform: scale(1.08); }
        .trv-icon-box { transition: transform 0.2s ease; }
        @keyframes trv-card-flash-kf { 0% { transform: scale(1); } 35% { transform: scale(1.015); } 100% { transform: scale(1); } }
        .trv-card-flash { animation: trv-card-flash-kf 0.5s ease; border-color: #a7f3d0 !important; }
        .trv-scroll::-webkit-scrollbar { width: 9px; height: 9px; }
        .trv-scroll::-webkit-scrollbar-track { background: transparent; }
        .trv-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid #f8fafc; }
        .trv-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .trv-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
      `}</style>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '16px 14px 32px' : '24px 28px 48px', scrollBehavior: 'smooth' }}>

        {/* ── Hero header ── */}
        <div className="trv-fade" style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 55%, #f0fdfa 100%)',
          border: '1px solid #bbf7d0', borderRadius: 18, padding: isMobile ? '16px 16px' : '22px 26px', marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
        }}>
          <div style={{ position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', position: 'relative' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(5,150,105,0.35)',
            }}>
              <BarChart2 size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 19 : 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Live Project Report
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748b' }}>
                Computed directly from your saved Theta Sheet.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 20, padding: '7px 16px', position: 'relative', boxShadow: '0 2px 8px rgba(5,150,105,0.1)' }}>
            <div className="trv-live-dot" style={{ width: 9, height: 9, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live Sheet Data{lastUpdated ? ` · ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </span>
          </div>
        </div>

        {/* ── Alert banner ── */}
        {!isOnTrack && (
          <div className="trv-fade" style={{
            animationDelay: '60ms',
            display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
            background: metrics.healthStatus === 'Critical' ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${metrics.healthStatus === 'Critical' ? '#fecaca' : '#fde68a'}`,
            borderLeft: `4px solid ${healthColor}`,
            borderRadius: 10, padding: '12px 16px',
          }}>
            <AlertTriangle size={17} color={healthColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
              <strong style={{ color: healthColor }}>{metrics.healthStatus} — </strong>{metrics.aiInsight}
            </div>
          </div>
        )}

        {/* ── Stat row ── */}
        <div className="trv-fade" style={{ animationDelay: '110ms', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          <StatCard label="Overall Health" accent={healthColor} iconBg="#faf5ff" icon={<Activity size={16} color={healthColor} />} watch={metrics.healthIndex}>
            <BigNum color={healthColor}>{metrics.healthIndex}%</BigNum>
            <Chip bg={isOnTrack ? '#f0fdf4' : metrics.healthStatus === 'Critical' ? '#fef2f2' : '#fffbeb'} color={healthColor} border={healthColor}>
              {metrics.healthStatus}
            </Chip>
          </StatCard>

          <StatCard label="Progress" accent="#2563eb" iconBg="#eff6ff" icon={<TrendingUp size={16} color="#2563eb" />} watch={progressPct}>
            <BigNum color="#2563eb">{progressPct !== null ? `${progressPct}%` : '—'}</BigNum>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>avg. % complete</span>
          </StatCard>

          <StatCard label="Schedule Variance" accent={scheduleColor} iconBg="#fff7ed" icon={<Clock size={16} color={scheduleColor} />} watch={metrics.scheduleVariance}>
            <BigNum color={scheduleColor}>
              {metrics.scheduleVariance > 0 ? `-${metrics.scheduleVariance}` : '0'} <span style={{ fontSize: 15 }}>days</span>
            </BigNum>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>vs. baseline {metrics.baselineDate}</span>
          </StatCard>

          <StatCard label="Cost Exposure" accent={costColor} iconBg="#fef2f2" icon={<BarChart2 size={16} color={costColor} />} watch={metrics.costExposure}>
            <BigNum color={costColor}>AED {metrics.costExposure}M</BigNum>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>of AED {metrics.budget}M budget</span>
          </StatCard>

          <StatCard label="Productivity" accent="#7e22ce" iconBg="#faf5ff" icon={<Users size={16} color="#7e22ce" />} watch={metrics.productivity}>
            <BigNum color="#7e22ce">{metrics.productivity}%</BigNum>
            <span style={{ fontSize: 12.5, color: '#64748b' }}>{metrics.productivityGap}% gap to target</span>
          </StatCard>
        </div>

        {/* ── Project Performance (planned vs actual + health, merged) ── */}
        <Panel title="Project Performance" accent={healthColor} className="trv-fade" style={{ animationDelay: '160ms', marginBottom: 20 }}>
          <SplitSection isMobile={isMobile} columns="1.4fr 1fr">
            <div>
              <SubHeading dot="#2563eb" title="Planned vs actual progress" subtitle="by project phase" />
              {phaseProgress.length === 0 ? (
                <EmptyRow text="No phase data found in the current sheet." />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={phaseProgress} barSize={16} margin={{ top: 8, right: 8, left: -14, bottom: 0 }} barCategoryGap="24%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="phase" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={isMobile ? -35 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 46 : 24} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      formatter={(v, name) => [`${v}%`, name]}
                      contentStyle={{ fontSize: 12.5, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      animationDuration={200}
                    />
                    <Bar dataKey="planned" fill="#cbd5e1" radius={[3, 3, 0, 0]} name="Planned" animationDuration={700} animationEasing="ease-out" />
                    <Bar dataKey="actual" fill="#10b981" radius={[3, 3, 0, 0]} name="Actual" animationDuration={700} animationEasing="ease-out" animationBegin={100} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: '#cbd5e1' }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Planned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: '#10b981' }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>Actual</span>
                </div>
              </div>
            </div>

            <div>
              <SubHeading dot={healthColor} title="Project health" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: 150, height: 150, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="trvHealthGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={healthColor} stopOpacity={0.75} />
                          <stop offset="100%" stopColor={healthColor} stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[{ value: metrics.healthIndex }, { value: 100 - metrics.healthIndex }]}
                        dataKey="value" innerRadius={52} outerRadius={68}
                        startAngle={90} endAngle={-270} stroke="none"
                        animationDuration={700} animationEasing="ease-out"
                      >
                        <Cell fill="url(#trvHealthGrad)" />
                        <Cell fill="#eef1f6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{metrics.healthIndex}%</span>
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>complete</span>
                  </div>
                </div>
                <div style={{ width: '100%', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <StatusRow label="Schedule" value={metrics.scheduleVariance > 20 ? 'Behind' : metrics.scheduleVariance > 0 ? 'Watch' : 'On track'} />
                  <StatusRow label="Cost" value={metrics.costExposure > 1 ? 'Watch' : 'On track'} />
                  <StatusRow label="Productivity" value={metrics.productivityGap <= -10 ? 'Watch' : 'On track'} />
                </div>
              </div>
            </div>
          </SplitSection>
        </Panel>

        {/* ── Executive summary (expandable) ── */}
        <Panel title="Executive Summary" badge="AI-generated" accent="#059669" noPad className="trv-fade" style={{ animationDelay: '210ms', marginBottom: 20 }}>
          {summaryItems.map((item, i) => {
            const open = openSummaryIdx === i;
            return (
              <div key={item.label} className="trv-summary-row" style={{ borderBottom: i < summaryItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <button
                  onClick={() => setOpenSummaryIdx(open ? -1 : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                    padding: '14px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.label}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{item.meta}</div>
                    </div>
                  </div>
                  <ChevronDown size={16} color="#64748b" style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                </button>
                {open && (
                  <p style={{ margin: 0, padding: '0 22px 16px 40px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                    {item.detail}
                  </p>
                )}
              </div>
            );
          })}
        </Panel>

        {/* ── Cost & Schedule Intelligence (merged) ── */}
        <Panel title="Cost & Schedule Intelligence" accent="#2563eb" className="trv-fade" style={{ animationDelay: '260ms', marginBottom: 20 }}>
          <SplitSection isMobile={isMobile} columns="1fr 1fr">
            <div>
              <SubHeading dot="#2563eb" title="Cost Intelligence" subtitle="cumulative AED, by period" />
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={metrics.costChart} barSize={22} margin={{ top: 18, right: 8, left: -14, bottom: 0 }} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="trvBudgetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#bfdbfe" />
                    </linearGradient>
                    <linearGradient id="trvOverrunGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#fca5a5" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(v, name) => [`AED ${v}M`, name === 'budget' ? 'Budget' : 'Overrun']}
                    contentStyle={{ fontSize: 12.5, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    animationDuration={200}
                  />
                  <Bar dataKey="budget" fill="url(#trvBudgetGrad)" radius={[4, 4, 0, 0]} name="Budget" animationDuration={700} animationEasing="ease-out" />
                  <Bar dataKey="overrun" fill="url(#trvOverrunGrad)" radius={[4, 4, 0, 0]} name="Overrun" animationDuration={700} animationEasing="ease-out" animationBegin={100}>
                    <LabelList dataKey="tag" position="top" style={{ fontSize: 10.5, fontWeight: 700, fill: '#dc2626' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {metrics.costBreakdown.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, background: '#fff8f8', border: '1px solid #fecaca', borderLeft: '3px solid #dc2626', borderRadius: 8, padding: '12px 14px' }}>
                <SummaryLine icon={<AlertTriangle size={14} color="#dc2626" />}>{metrics.costLinkage}</SummaryLine>
              </div>
            </div>

            <div>
              <SubHeading dot="#dc2626" title="Schedule variance trend" subtitle="days behind baseline" badge="Preview data" />
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={DUMMY_SCHEDULE_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={isMobile ? 2 : 0} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ stroke: '#dc2626', strokeWidth: 1, strokeDasharray: '3 3' }}
                    formatter={(v) => [`${v} days`, 'Variance']}
                    contentStyle={{ fontSize: 12.5, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    animationDuration={200}
                  />
                  <Line type="monotone" dataKey="variance" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 3, fill: '#dc2626' }} activeDot={{ r: 5 }} animationDuration={700} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <Chip bg="#fef2f2" color="#dc2626">-23 days now</Chip>
              </div>
            </div>
          </SplitSection>
        </Panel>

        {/* ── Activity Watchlist (delayed activities + upcoming milestones, merged) ── */}
        <Panel title="Activity Watchlist" accent="#dc2626" className="trv-fade" style={{ animationDelay: '310ms', marginBottom: 20 }}>
          <SplitSection isMobile={isMobile} columns="1fr 1fr">
            <div>
              <SubHeading dot="#dc2626" title="Delayed Activities" badge={`${delayedActivities.length} flagged`} badgeColor="#dc2626" badgeBg="#fef2f2" badgeBorder="#fecaca" />
              {delayedActivities.length === 0 ? (
                <EmptyRow text="No delayed activities in the current sheet." />
              ) : delayedActivities.map((a, i) => (
                <ActivityRow key={i} id={a.id} name={a.name} tag={`${a.days}d`} tagColor="#dc2626" tagBg="#fef2f2" dot="#dc2626" last={i === delayedActivities.length - 1} />
              ))}
            </div>

            <div>
              <SubHeading dot="#0f766e" title="Upcoming Milestones" badge="next 60 days" badgeColor="#0f766e" badgeBg="#f0fdfa" badgeBorder="#99f6e4" />
              {upcomingMilestones.length === 0 ? (
                <EmptyRow text="No forecasted activities due in the next 60 days." />
              ) : upcomingMilestones.map((m, i) => (
                <ActivityRow
                  key={i}
                  name={m.name}
                  sub={m.date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                  tag={m.status || ''}
                  tagColor={m.status === 'Delayed' ? '#dc2626' : '#0f766e'}
                  tagBg={m.status === 'Delayed' ? '#fef2f2' : '#f0fdfa'}
                  dot={m.status === 'Delayed' ? '#dc2626' : '#0f766e'}
                  last={i === upcomingMilestones.length - 1}
                />
              ))}
            </div>
          </SplitSection>
        </Panel>

        {/* ── Risk & Critical Path (merged) ── */}
        <Panel title="Risk & Critical Path" accent="#dc2626" className="trv-fade" style={{ animationDelay: '360ms' }}>
          <SplitSection isMobile={isMobile} columns="1fr 1.2fr">
            <div>
              <SubHeading dot="#dc2626" title="Risk score" badge="Preview data" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: DUMMY_RISK_SCORE }, { value: 100 - DUMMY_RISK_SCORE }]}
                        dataKey="value" innerRadius={34} outerRadius={46}
                        startAngle={90} endAngle={-270} stroke="none"
                        animationDuration={700} animationEasing="ease-out"
                      >
                        <Cell fill="#dc2626" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: '#0f172a' }}>{DUMMY_RISK_SCORE}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Chip bg="#fef2f2" color="#dc2626">{DUMMY_RISK_LABEL}</Chip>
                  <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>
                    Composite of schedule, cost, procurement and resource risk.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
                {[['#dc2626', '60–100 High'], ['#f59e0b', '30–59 Medium'], ['#16a34a', '0–29 Low']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SubHeading dot="#dc2626" title="Critical path" />
              <Chip bg="#fef2f2" color="#dc2626">{criticalPath.count} activities off-track</Chip>
              <p style={{ margin: '12px 0 0', fontSize: 13.5, color: '#334155', lineHeight: 1.6 }}>{criticalPath.chainText}</p>
            </div>
          </SplitSection>
        </Panel>
      </div>
    </div>
  );
}

// ── Small presentational helpers ─────────────────────────────────────────────

function StatCard({ label, icon, accent = '#64748b', iconBg = '#f8fafc', children, watch }) {
  const flash = useChangeFlash(watch);
  return (
    <div
      className={`trv-card${flash ? ' trv-card-flash' : ''}`}
      style={{ position: 'relative', overflow: 'hidden', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 18px 16px', boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div className="trv-icon-box" style={{ width: 30, height: 30, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function BigNum({ children, color = '#0f172a' }) {
  return <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{children}</div>;
}

function Chip({ children, bg, color, border }) {
  return (
    <span style={{ alignSelf: 'flex-start', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: bg, color, border: border ? `1px solid ${border}33` : 'none', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
      {children}
    </span>
  );
}

function Panel({ title, subtitle, badge, accent = '#059669', children, style, noPad, className = '' }) {
  return (
    <div className={`trv-card ${className}`} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, boxShadow: '0 2px 10px rgba(15,23,42,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: noPad ? '18px 22px 14px' : '20px 22px 0', marginBottom: noPad ? 0 : 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          <span style={{ width: 4, height: 16, borderRadius: 2, background: accent, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</span>
          {subtitle && <span style={{ fontSize: 12.5, color: '#64748b' }}>{subtitle}</span>}
        </div>
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '3px 10px', flexShrink: 0 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ padding: noPad ? 0 : '0 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

// Two-column layout for merging previously-separate panels into one card,
// with a light divider between halves -- fixes the "too many separate boxes"
// fragmentation while keeping each half's own sub-heading/badge/dot.
function SplitSection({ columns = '1fr 1fr', isMobile, children }) {
  const [left, right] = React.Children.toArray(children);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : columns, gap: isMobile ? 22 : 28 }}>
      <div>{left}</div>
      <div style={{
        borderTop: isMobile ? '1px solid #f1f5f9' : 'none',
        borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
        paddingTop: isMobile ? 20 : 0,
        paddingLeft: isMobile ? 0 : 26,
      }}>
        {right}
      </div>
    </div>
  );
}

function SubHeading({ title, subtitle, dot, badge, badgeColor = '#059669', badgeBg = '#f0fdf4', badgeBorder = '#bbf7d0' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />}
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</span>
        {subtitle && <span style={{ fontSize: 12, color: '#64748b' }}>{subtitle}</span>}
      </div>
      {badge && (
        <span style={{ fontSize: 10.5, fontWeight: 700, color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, borderRadius: 20, padding: '3px 9px', flexShrink: 0 }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function SummaryLine({ icon, children }) {
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

function StatusRow({ label, value }) {
  const good = value === 'On track';
  const color = good ? '#16a34a' : '#b45309';
  const bg = good ? '#f0fdf4' : '#fffbeb';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12.5, color: '#475569' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 5, padding: '2px 8px' }}>{value}</span>
    </div>
  );
}

function ActivityRow({ id, name, sub, tag, tagColor, tagBg, dot, last }) {
  return (
    <div className="trv-activity-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', margin: '0 -8px', borderBottom: last ? 'none' : '1px solid #f8fafc' }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {id && <span style={{ fontSize: 11.5, color: '#64748b', marginRight: 6 }}>{id}</span>}
        <span style={{ fontSize: 13.5, color: '#0f172a', fontWeight: 500 }}>{name}</span>
        {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{sub}</div>}
      </div>
      {tag && (
        <span style={{ fontSize: 10.5, fontWeight: 700, color: tagColor, background: tagBg, borderRadius: 6, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {tag}
        </span>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 13, color: '#64748b' }}>{text}</div>;
}
