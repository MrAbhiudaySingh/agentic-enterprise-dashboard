import { TrendingUp, TrendingDown, DollarSign, Target, LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";

interface KPI {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  trend: string;
  status: string;
  bgClass: string;
  textClass: string;
}

interface KPIStripProps {
  investment: number;
  profitGrowth: number;
  ctcReduction: number;
  overallConfidence: number;
}

const KPIStrip = ({ investment, profitGrowth, ctcReduction, overallConfidence }: KPIStripProps) => {
  const kpis: KPI[] = [
    {
      label: "Profit Growth Target",
      value: `+${profitGrowth}%`,
      icon: TrendingUp,
      color: "neon-green",
      glow: "glow-green",
      trend: "increase",
      status: profitGrowth >= 15 ? "On Track" : profitGrowth >= 10 ? "Adjusting" : "At Risk",
      bgClass: "bg-neon-green/10",
      textClass: "text-neon-green",
    },
    {
      label: "CTC Reduction",
      value: `−${ctcReduction}%`,
      icon: TrendingDown,
      color: "neon-orange",
      glow: "glow-orange",
      trend: "decrease",
      status: ctcReduction >= 2 ? "Optimizing" : ctcReduction >= 1 ? "Progressing" : "Limited",
      bgClass: "bg-neon-orange/10",
      textClass: "text-neon-orange",
    },
    {
      label: "Total Investment",
      value: formatCurrency(investment),
      icon: DollarSign,
      color: "neon-cyan",
      glow: "glow-cyan",
      trend: "neutral",
      status: investment >= 700000 ? "Well-Funded" : investment >= 400000 ? "Adequate" : "Constrained",
      bgClass: "bg-neon-cyan/10",
      textClass: "text-neon-cyan",
    },
    {
      label: "Overall Confidence",
      value: `${overallConfidence}%`,
      icon: Target,
      color: "neon-purple",
      glow: "glow-purple",
      trend: "neutral",
      status: overallConfidence >= 85 ? "High" : overallConfidence >= 70 ? "Moderate" : "Low",
      bgClass: "bg-neon-purple/10",
      textClass: "text-neon-purple",
    },
  ];

  const getStatusColor = (status: string) => {
    if (["On Track", "Optimizing", "Well-Funded", "High"].includes(status)) {
      return "bg-neon-green/10 text-neon-green";
    }
    if (["Adjusting", "Progressing", "Adequate", "Moderate"].includes(status)) {
      return "bg-neon-orange/10 text-neon-orange";
    }
    return "bg-neon-red/10 text-neon-red";
  };

  return (
    <div className="w-full px-6 py-4">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={kpi.label}
            className={`kpi-card rounded-xl p-5 ${kpi.glow} animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${kpi.bgClass} flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 ${kpi.textClass}`} />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(kpi.status)}`}>
                {kpi.trend === "increase" && "↑ "}
                {kpi.trend === "decrease" && "↓ "}
                {kpi.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {kpi.label}
            </p>
            <p className={`font-mono-nums text-3xl font-bold ${kpi.textClass} transition-all duration-300`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIStrip;
