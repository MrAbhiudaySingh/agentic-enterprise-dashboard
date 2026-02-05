import { Shield, CheckCircle2, FileCheck, History, Lock, AlertTriangle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";

interface GovernancePanelProps {
  confidence: number;
  totalSavings: number;
  investment: number;
}

const GovernancePanel = ({ confidence, totalSavings, investment }: GovernancePanelProps) => {
  const roi = totalSavings > 0 ? ((totalSavings / investment) * 100).toFixed(0) : "0";
  const isPositiveROI = totalSavings > 0;

  const getCheckStatus = (threshold: number) => {
    return confidence >= threshold ? "passed" : "failed";
  };

  const checks = [
    { label: "Compliance Review", status: getCheckStatus(60), icon: FileCheck },
    { label: "Risk Assessment", status: getCheckStatus(70), icon: AlertTriangle },
    { label: "Budget Approval", status: getCheckStatus(65), icon: CheckCircle2 },
    { label: "Legal Review", status: getCheckStatus(55), icon: Lock },
    { label: "Audit Trail", status: "available" as const, icon: History },
  ];

  const passedChecks = checks.filter(c => c.status === "passed" || c.status === "available").length;

  return (
    <div className="glass-panel rounded-xl p-5 glow-purple h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-neon-purple/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-neon-purple" />
        </div>
        <div>
          <h3 className="font-bold">Governance & Safety</h3>
          <p className="text-xs text-muted-foreground">Enterprise controls</p>
        </div>
      </div>

      {/* Confidence Gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Overall Confidence
          </span>
          <span className={`font-mono-nums text-lg font-bold ${
            confidence >= 80 ? 'text-neon-green' : confidence >= 65 ? 'text-neon-purple' : 'text-neon-orange'
          }`}>
            {confidence}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              confidence >= 80 
                ? 'bg-gradient-to-r from-neon-green to-neon-cyan' 
                : confidence >= 65 
                  ? 'bg-gradient-to-r from-neon-purple to-neon-cyan'
                  : 'bg-gradient-to-r from-neon-orange to-neon-red'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* ROI Indicator */}
      <div className="glass-panel rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Projected ROI</span>
          <span className={`font-mono-nums text-sm font-bold ${isPositiveROI ? 'text-neon-green' : 'text-neon-red'}`}>
            {isPositiveROI ? '+' : ''}{roi}%
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">Net Savings</span>
          <span className={`font-mono-nums text-sm font-bold ${totalSavings > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
            {formatCurrency(totalSavings, true)}
          </span>
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-2 mb-4">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-3 p-2.5 rounded-lg glass-panel"
          >
            {check.status === "passed" ? (
              <check.icon className="w-4 h-4 text-neon-green" />
            ) : check.status === "available" ? (
              <check.icon className="w-4 h-4 text-neon-cyan" />
            ) : (
              <XCircle className="w-4 h-4 text-neon-red" />
            )}
            <span className="text-sm flex-1">{check.label}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                check.status === "passed"
                  ? "bg-neon-green/10 text-neon-green"
                  : check.status === "available"
                    ? "bg-neon-cyan/10 text-neon-cyan"
                    : "bg-neon-red/10 text-neon-red"
              }`}
            >
              {check.status === "passed" ? "✓ Passed" : check.status === "available" ? "Available" : "✗ Failed"}
            </span>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className={`p-4 rounded-lg border ${
        passedChecks >= 4 
          ? 'bg-gradient-to-br from-neon-green/10 to-neon-cyan/5 border-neon-green/20'
          : passedChecks >= 3
            ? 'bg-gradient-to-br from-neon-orange/10 to-neon-cyan/5 border-neon-orange/20'
            : 'bg-gradient-to-br from-neon-red/10 to-neon-orange/5 border-neon-red/20'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield className={`w-4 h-4 ${
            passedChecks >= 4 ? 'text-neon-green' : passedChecks >= 3 ? 'text-neon-orange' : 'text-neon-red'
          }`} />
          <span className="text-xs font-semibold">
            {passedChecks >= 4 ? 'Enterprise Ready' : passedChecks >= 3 ? 'Review Required' : 'High Risk'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {passedChecks}/{checks.length} governance checks passed
        </p>
      </div>
    </div>
  );
};

export default GovernancePanel;
