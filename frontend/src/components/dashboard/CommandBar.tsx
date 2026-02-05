import { useState } from "react";
import { Sparkles, DollarSign, Clock, ChevronDown, Send } from "lucide-react";

interface CommandBarProps {
  investment: number;
  timeline: number;
  prompt: string;
  onInvestmentChange: (value: number) => void;
  onTimelineChange: (value: number) => void;
  onPromptChange: (value: string) => void;
  onExecute: () => void;
  isLoading: boolean;
}

const CommandBar = ({ 
  investment, 
  timeline, 
  prompt,
  onInvestmentChange, 
  onTimelineChange,
  onPromptChange,
  onExecute,
  isLoading
}: CommandBarProps) => {
  const [editingInvestment, setEditingInvestment] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          AI-Powered Enterprise Decision Orchestration
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your executive directive and let AI agents optimize your business
        </p>
      </div>

      <div className="flex items-center gap-6 justify-center">
        {/* Command Input */}
        <div className="flex-1 max-w-2xl command-input rounded-xl p-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <Sparkles className="w-5 h-5 text-neon-cyan flex-shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
              placeholder="e.g., Increase profit by 15% and reduce costs by 10%..."
              onKeyDown={(e) => e.key === 'Enter' && onExecute()}
            />
            <button 
              onClick={onExecute}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-neon-cyan text-background font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? "Processing..." : "Execute"}
            </button>
          </div>
        </div>

        {/* Investment */}
        <div className="glass-panel rounded-xl px-4 py-3 min-w-[180px]">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Total Investment</span>
          </div>
          {editingInvestment ? (
            <input
              type="number"
              value={investment}
              onChange={(e) => onInvestmentChange(Number(e.target.value))}
              onBlur={() => setEditingInvestment(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingInvestment(false)}
              className="font-mono-nums text-xl font-bold text-neon-cyan bg-transparent border-none outline-none w-full"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingInvestment(true)}
              className="font-mono-nums text-xl font-bold text-neon-cyan hover:text-neon-cyan/80 transition-colors flex items-center gap-1"
            >
              {formatCurrency(investment)}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="glass-panel rounded-xl px-4 py-3 min-w-[160px]">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Timeline</span>
          </div>
          {editingTimeline ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={timeline}
                onChange={(e) => onTimelineChange(Number(e.target.value))}
                onBlur={() => setEditingTimeline(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTimeline(false)}
                className="font-mono-nums text-xl font-bold text-foreground bg-transparent border-none outline-none w-16"
                autoFocus
              />
              <span className="text-muted-foreground text-sm">weeks</span>
            </div>
          ) : (
            <button
              onClick={() => setEditingTimeline(true)}
              className="font-mono-nums text-xl font-bold text-foreground hover:text-foreground/80 transition-colors flex items-center gap-1"
            >
              {timeline} weeks
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandBar;
