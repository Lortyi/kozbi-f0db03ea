import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getVoteData, getTotalVotes, type Poll } from '@/lib/votingStore';
import { Printer } from 'lucide-react';

interface PollChartProps {
  poll: Poll;
  showPrint?: boolean;
}

const CHART_COLORS = [
  'hsl(213, 94%, 56%)',
  'hsl(262, 80%, 65%)',
  'hsl(142, 70%, 45%)',
  'hsl(38, 92%, 60%)',
  'hsl(330, 80%, 60%)',
  'hsl(180, 70%, 50%)',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="glass rounded-lg px-4 py-2 text-sm">
        <p className="font-semibold text-foreground">{d.option}</p>
        <p className="text-primary">{d.votes} votes ({d.percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function PollChart({ poll, showPrint = false }: PollChartProps) {
  const data = getVoteData(poll);
  const total = getTotalVotes(poll);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="print-title font-semibold text-foreground text-base leading-snug">{poll.question}</h3>
          <p className="text-muted-foreground text-sm mt-1">{total} total votes</p>
        </div>
        {showPrint && (
          <button
            onClick={handlePrint}
            className="no-print ml-4 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        )}
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 35%, 20%)" />
            <XAxis
              dataKey="option"
              tick={{ fill: 'hsl(215, 25%, 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              width={80}
            />
            <YAxis
              tick={{ fill: 'hsl(215, 25%, 55%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(222, 40%, 16%)' }} />
            <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Option breakdown */}
      <div className="mt-3 space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-sm mb-0.5">
                <span className="text-foreground truncate">{item.option}</span>
                <span className="text-muted-foreground ml-2 flex-shrink-0">
                  {item.votes} ({item.percentage}%)
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    background: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
