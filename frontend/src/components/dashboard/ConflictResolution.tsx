import { AlertTriangle, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { ConflictData } from "@/lib/calculations";

interface ConflictResolutionProps {
  conflicts?: ConflictData[];
}

const ConflictResolution = ({ conflicts = [] }: ConflictResolutionProps) => {
  const resolvedCount = conflicts.filter(c => c.status === "resolved").length;

  return (
    <div className="w-full px-6 py-4">
      <div className="glass-panel rounded-xl p-6 animated-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-orange/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-orange" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Cross-Agent Conflict Resolution</h3>
              <p className="text-xs text-muted-foreground">
                Autonomous mediation between competing objectives
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{conflicts.length} conflicts</span>
            <span className="text-xs px-2 py-1 rounded-full bg-neon-green/10 text-neon-green">
              {resolvedCount} resolved
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {conflicts.map((item, index) => (
            <div
              key={item.id}
              className="glass-panel rounded-lg p-4 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Conflict */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-neon-orange" />
                    <span className="text-sm font-semibold text-neon-orange">
                      {item.conflict}
                    </span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-sm font-semibold text-neon-red">
                      {item.versus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.agents.map((agent) => (
                      <span
                        key={agent}
                        className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                {/* Resolution */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.status === "resolved" ? (
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
                    )}
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {item.status === "resolved" ? "Resolution Applied" : "Resolving..."}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{item.resolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConflictResolution;
