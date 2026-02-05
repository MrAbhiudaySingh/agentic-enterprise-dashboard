import { useState, useCallback } from "react";
import Header from "./components/dashboard/Header";
import CommandBar from "./components/dashboard/CommandBar";
import KPIStrip from "./components/dashboard/KPIStrip";
import ConflictResolution from "./components/dashboard/ConflictResolution";
import AgentGrid from "./components/dashboard/AgentGrid";
import GovernancePanel from "./components/dashboard/GovernancePanel";
import OutcomeCharts from "./components/dashboard/OutcomeCharts";
import DataUpload from "./components/dashboard/DataUpload";
import { Sparkles, Upload, ArrowRight } from "lucide-react";

interface AgentData {
  name: string;
  icon: string;
  accent: string;
  decision: string;
  budgetImpact: number;
  headcountImpact: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  trigger: string;
}

interface CalculatedMetrics {
  profitGrowth: number;
  ctcReduction: number;
  overallConfidence: number;
  totalSavings: number;
  totalHeadcountChange: number;
  agents: AgentData[];
  profitProjection: { week: string; actual: number | null; projected: number }[];
  ctcProjection: { week: string; actual: number | null; projected: number }[];
  conflicts: { id: number; conflict: string; versus: string; resolution: string; status: string; agents: string[]; savingsImpact: number }[];
}

function App() {
  const [investment, setInvestment] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleDataLoaded = useCallback((data: any) => {
    setCompanyData(data);
    setInvestment(data.total_revenue * 0.062); // 6.2% of revenue as default investment
    setTimeline(12);
  }, []);

  const handleExecute = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:8000/api/calculate' : '/api/calculate';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          investment_limit: investment || 620000,
          timeline_weeks: timeline || 12
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
      setHasCalculated(true);
    } catch (err) {
      console.error('Failed to calculate:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Cannot connect to backend. Make sure the server is running on port 8000.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to process prompt');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, investment, timeline]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-8">
        <CommandBar
          investment={investment || 620000}
          timeline={timeline || 12}
          prompt={prompt}
          onInvestmentChange={(v) => setInvestment(v)}
          onTimelineChange={(v) => setTimeline(v)}
          onPromptChange={setPrompt}
          onExecute={handleExecute}
          isLoading={isLoading}
        />

        {error && (
          <div className="px-6 py-2">
            <div className="glass-panel rounded-lg p-4 border border-neon-red/30 bg-neon-red/5">
              <p className="text-neon-red text-sm">Error: {error}</p>
            </div>
          </div>
        )}

        <DataUpload onDataLoaded={handleDataLoaded} />

        {!hasCalculated && !isLoading && (
          <div className="px-6 py-12">
            <div className="glass-panel rounded-xl p-12 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-neon-cyan" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Ready to Optimize Your Enterprise</h2>
              <p className="text-muted-foreground mb-8">
                Enter a CEO directive above (e.g., "Increase profit by 15%") or upload your quarterly data to get AI-powered recommendations.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="glass-panel rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Upload className="w-5 h-5 text-neon-cyan" />
                    <span className="font-semibold">Upload Data</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Import Q1-Q4 CSV/Excel for personalized calculations based on your actual metrics
                  </p>
                </div>
                
                <div className="glass-panel rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowRight className="w-5 h-5 text-neon-green" />
                    <span className="font-semibold">Enter Prompt</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Type a directive like "Increase profit by 20% and reduce costs by 5%"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasCalculated && metrics && (
          <>
            <KPIStrip 
              investment={investment || 620000}
              profitGrowth={metrics.profitGrowth}
              ctcReduction={metrics.ctcReduction}
              overallConfidence={metrics.overallConfidence}
            />
            
            <ConflictResolution conflicts={metrics.conflicts} />
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-9">
                  <AgentGrid agents={metrics.agents} />
                </div>
                <div className="col-span-3">
                  <GovernancePanel 
                    confidence={metrics.overallConfidence}
                    totalSavings={metrics.totalSavings}
                    investment={investment || 620000}
                  />
                </div>
              </div>
            </div>
            
            <OutcomeCharts 
              profitData={metrics.profitProjection}
              ctcData={metrics.ctcProjection}
              profitTarget={metrics.profitGrowth}
              ctcTarget={metrics.ctcReduction}
              totalSavings={metrics.totalSavings}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
