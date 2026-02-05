import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";

interface OutcomeChartsProps {
  profitData: { week: string; actual: number | null; projected: number }[];
  ctcData: { week: string; actual: number | null; projected: number }[];
  profitTarget: number;
  ctcTarget: number;
  totalSavings: number;
}

const OutcomeCharts = ({ profitData, ctcData, profitTarget, ctcTarget, totalSavings }: OutcomeChartsProps) => {
  const latestActualProfit = profitData.filter(d => d.actual !== null).pop()?.actual || 0;
  const latestActualCTC = ctcData.filter(d => d.actual !== null).pop()?.actual || 100;
  
  const profitProgress = profitTarget > 0 ? ((latestActualProfit / profitTarget) * 100).toFixed(0) : "0";
  const ctcProgress = ctcTarget > 0 ? (((100 - latestActualCTC) / ctcTarget) * 100).toFixed(0) : "0";

  const metrics = [
    { 
      label: "Profit Progress", 
      value: `${profitProgress}%`, 
      change: `${latestActualProfit.toFixed(1)}% achieved`, 
      trend: "up" 
    },
    { 
      label: "CTC Progress", 
      value: `${ctcProgress}%`, 
      change: `${(100 - latestActualCTC).toFixed(1)}% reduced`, 
      trend: "down" 
    },
    { 
      label: "Net Savings", 
      value: formatCurrency(Math.abs(totalSavings)), 
      change: totalSavings > 0 ? "Positive ROI" : "Investment", 
      trend: totalSavings > 0 ? "up" : "down" 
    },
  ];

  return (
    <div className="w-full px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Projected Outcomes</h3>
          <p className="text-xs text-muted-foreground">
            Real-time tracking vs. projections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-neon-green rounded" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-neon-green/50 rounded border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-muted-foreground">Projected</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Profit Growth Chart */}
        <div className="col-span-5 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-semibold">Profit Growth Trajectory</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-neon-green/10 text-neon-green font-mono-nums">
              Target: +{profitTarget}%
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 80%, 42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 80%, 42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis
                  dataKey="week"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, Math.max(profitTarget + 2, 18)]}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 47%, 11%)",
                    border: "1px solid hsl(222, 30%, 22%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value?.toFixed(1)}%`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="hsl(145, 80%, 42%)"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                  strokeDasharray="5 5"
                  name="Projected"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(145, 80%, 42%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(145, 80%, 42%)", strokeWidth: 0, r: 4 }}
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics */}
        <div className="col-span-2 space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-panel rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="font-mono-nums text-2xl font-bold text-foreground mb-1">{metric.value}</p>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-neon-green' : 'text-neon-orange'}`}>
                {metric.change}
              </p>
            </div>
          ))}
        </div>

        {/* CTC Chart */}
        <div className="col-span-5 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-neon-orange" />
              <span className="text-sm font-semibold">CTC Optimization</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-neon-orange/10 text-neon-orange font-mono-nums">
              Target: −{ctcTarget}%
            </span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ctcData}>
                <defs>
                  <linearGradient id="ctcGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis
                  dataKey="week"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[90, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 47%, 11%)",
                    border: "1px solid hsl(222, 30%, 22%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value?.toFixed(1)}%`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={2}
                  fill="url(#ctcGradient)"
                  strokeDasharray="5 5"
                  name="Projected"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(25, 95%, 53%)", strokeWidth: 0, r: 4 }}
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutcomeCharts;
