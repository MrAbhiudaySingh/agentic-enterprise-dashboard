import { LucideIcon, TrendingUp, TrendingDown, Info } from "lucide-react";
import { formatBudgetImpact } from "@/lib/calculations";

interface AgentCardProps {
  name: string;
  icon: LucideIcon;
  accent: string;
  decision: string;
  budgetImpact: number;
  headcountImpact: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  trigger: string;
  animationDelay: number;
}

const ACCENT_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  orange: { bg: "bg-neon-orange/10", text: "text-neon-orange", border: "agent-sales" },
  red: { bg: "bg-neon-red/10", text: "text-neon-red", border: "agent-marketing" },
  green: { bg: "bg-neon-green/10", text: "text-neon-green", border: "agent-finance" },
  blue: { bg: "bg-neon-blue/10", text: "text-neon-blue", border: "agent-operations" },
  purple: { bg: "bg-neon-purple/10", text: "text-neon-purple", border: "agent-support" },
  teal: { bg: "bg-neon-teal/10", text: "text-neon-teal", border: "agent-hr" },
};

const AgentCard = ({
  name,
  icon: Icon,
  accent,
  decision,
  budgetImpact,
  headcountImpact,
  confidence,
  risk,
  trigger,
  animationDelay,
}: AgentCardProps) => {
  const config = ACCENT_CONFIG[accent] || ACCENT_CONFIG.cyan;

  const riskColors = {
    low: "text-neon-green bg-neon-green/10",
    medium: "text-neon-orange bg-neon-orange/10",
    high: "text-neon-red bg-neon-red/10",
  };

  const formatHeadcount = (value: number) => {
    if (value === 0) return "0 FTE";
    return value > 0 ? `+${value} FTE` : `${value} FTE`;
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 ${config.border} animate-fade-in-up hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.text}`} />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{name} Agent</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-1.5 py-0.5 rounded ${riskColors[risk]}`}>
                {risk} risk
              </span>
              <span className="text-xs text-muted-foreground font-mono-nums">
                {confidence}% conf.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          Decision Taken
        </p>
        <p className="text-sm text-foreground leading-relaxed">{decision}</p>
      </div>

      {/* Impacts */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-panel rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Budget Impact</p>
          <div className="flex items-center gap-1">
            {budgetImpact > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-neon-red" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-neon-green" />
            )}
            <span className={`font-mono-nums text-sm font-semibold ${budgetImpact > 0 ? 'text-neon-red' : 'text-neon-green'}`}>
              {formatBudgetImpact(budgetImpact)}
            </span>
          </div>
        </div>
        <div className="glass-panel rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">Headcount</p>
          <div className="flex items-center gap-1">
            {headcountImpact > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-neon-orange" />
            ) : headcountImpact < 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-neon-green" />
            ) : null}
            <span className={`font-mono-nums text-sm font-semibold ${
              headcountImpact > 0 ? 'text-neon-orange' : headcountImpact < 0 ? 'text-neon-green' : 'text-muted-foreground'
            }`}>
              {formatHeadcount(headcountImpact)}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
        <Info className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">
            What would change my mind
          </p>
          <p className="text-xs text-foreground">{trigger}</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
