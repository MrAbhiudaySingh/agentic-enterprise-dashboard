import { Briefcase, Megaphone, Wallet, Settings2, Headphones, Users } from "lucide-react";
import AgentCard from "./AgentCard";
import { CalculatedAgent } from "@/lib/calculations";

interface AgentGridProps {
  agents: CalculatedAgent[];
}

const AGENT_ICONS: Record<string, { icon: typeof Briefcase; accent: string }> = {
  Sales: { icon: Briefcase, accent: "orange" },
  Marketing: { icon: Megaphone, accent: "red" },
  Finance: { icon: Wallet, accent: "green" },
  Operations: { icon: Settings2, accent: "blue" },
  Support: { icon: Headphones, accent: "purple" },
  HR: { icon: Users, accent: "teal" },
};

const AgentGrid = ({ agents }: AgentGridProps) => {
  const activeAgents = agents.filter(a => a.confidence > 50).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Functional Agent Decisions</h3>
          <p className="text-xs text-muted-foreground">
            Autonomous decisions with explainability and triggers
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>{activeAgents} agents active</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {agents.map((agent, index) => {
          const config = AGENT_ICONS[agent.name] || { icon: Briefcase, accent: "cyan" };
          return (
            <AgentCard
              key={agent.name}
              name={agent.name}
              icon={config.icon}
              accent={config.accent}
              decision={agent.decision}
              budgetImpact={agent.budgetImpact}
              headcountImpact={agent.headcountImpact}
              confidence={agent.confidence}
              risk={agent.risk}
              trigger={agent.trigger}
              animationDelay={index * 100}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AgentGrid;
