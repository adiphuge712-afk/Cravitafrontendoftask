import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StateMessage from '@/components/common/StateMessage';

/**
 * Monthly training-completion trend, drawn from real Performancelog rows.
 *
 * This replaces the hardcoded six-point array the dashboards used to chart.
 * Two consequences worth keeping:
 *
 *  - Every point is counted from API data. A quiet month plots as 0.
 *  - If there are no logs at all, it says so instead of drawing a flat line
 *    that a reader could mistake for real measured activity.
 */
export default function PerformanceTrendChart({ series, emptyHint, loggedLabel = 'Total logged' }) {
  const hasAnyData = Array.isArray(series) && series.some((point) => point.logged > 0);

  if (!hasAnyData) {
    return (
      <StateMessage title="No performance data logged yet">
        {emptyHint ||
          'Once coaches start recording drill results, the monthly completion trend will appear here.'}
      </StateMessage>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={series} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.55} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="trendLogged" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f9d76" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0f9d76" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e9edf5" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6b7794', fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#6b7794', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #e5e9f2',
            boxShadow: '0 4px 16px rgba(16,24,40,.08)',
            fontSize: 13,
          }}
          formatter={(value, name) => [value, name === 'completed' ? 'Completed' : loggedLabel]}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(name) => (name === 'completed' ? 'Completed' : loggedLabel)}
        />
        <Area
          type="monotone"
          dataKey="logged"
          stroke="#0f9d76"
          strokeWidth={2}
          fill="url(#trendLogged)"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#4f46e5"
          strokeWidth={2}
          fill="url(#trendCompleted)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
