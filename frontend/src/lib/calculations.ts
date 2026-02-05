// Core calculation engine for the Agentic Enterprise Dashboard

export interface AgentData {
  name: string;
  baseAllocation: number;
  baseSavings: number;
  baseHeadcount: number;
  baseConfidence: number;
  riskFactor: number;
}

export interface CalculatedAgent {
  name: string;
  budgetImpact: number;
  headcountImpact: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  decision: string;
  trigger: string;
}

export interface CalculatedMetrics {
  profitGrowth: number;
  ctcReduction: number;
  overallConfidence: number;
  totalSavings: number;
  totalHeadcountChange: number;
  agents: CalculatedAgent[];
  profitProjection: { week: string; actual: number | null; projected: number }[];
  ctcProjection: { week: string; actual: number | null; projected: number }[];
  conflicts: ConflictData[];
}

export interface ConflictData {
  id: number;
  conflict: string;
  versus: string;
  resolution: string;
  status: "resolved" | "in-progress";
  agents: string[];
  savingsImpact: number;
}

const BASE_AGENTS: AgentData[] = [
  { name: "Sales", baseAllocation: 0.14, baseSavings: 85000, baseHeadcount: -3, baseConfidence: 89, riskFactor: 0.2 },
  { name: "Marketing", baseAllocation: 0.19, baseSavings: -120000, baseHeadcount: 0, baseConfidence: 82, riskFactor: 0.4 },
  { name: "Finance", baseAllocation: 0.15, baseSavings: 195000, baseHeadcount: 0, baseConfidence: 94, riskFactor: 0.1 },
  { name: "Operations", baseAllocation: 0.22, baseSavings: 220000, baseHeadcount: -5, baseConfidence: 87, riskFactor: 0.35 },
  { name: "Support", baseAllocation: 0.15, baseSavings: 95000, baseHeadcount: -2, baseConfidence: 91, riskFactor: 0.15 },
  { name: "HR", baseAllocation: 0.15, baseSavings: 145000, baseHeadcount: -4, baseConfidence: 85, riskFactor: 0.3 },
];

const AGENT_DECISIONS: Record<string, { decision: string; trigger: string }> = {
  Sales: {
    decision: "Implement AI-powered lead scoring and automate outreach sequences. Freeze new SDR hiring.",
    trigger: "If Q2 pipeline drops below $2.5M, recommend 2 SDR hires",
  },
  Marketing: {
    decision: "Shift 60% budget to performance channels. Deploy AI content generation for 4x output.",
    trigger: "If CAC exceeds $180, revert to brand awareness mix",
  },
  Finance: {
    decision: "Consolidate 3 vendor contracts. Implement dynamic pricing with 2.5% margin optimization.",
    trigger: "If customer churn exceeds 8%, pause pricing changes",
  },
  Operations: {
    decision: "Automate 40% of manual workflows. Consolidate 2 regional offices into hybrid model.",
    trigger: "If SLA breaches exceed 2%, restore on-site capacity",
  },
  Support: {
    decision: "Deploy AI chatbot for L1 queries (60% deflection). Upskill team for complex cases.",
    trigger: "If CSAT drops below 4.2, increase human agent ratio",
  },
  HR: {
    decision: "Freeze non-critical hiring. Implement performance-based variable compensation (+15%).",
    trigger: "If voluntary attrition exceeds 12%, review freeze policy",
  },
};

function getInvestmentAdequacy(investment: number): number {
  const optimalInvestment = 800000;
  const minInvestment = 200000;
  if (investment >= optimalInvestment) return 1.0;
  if (investment <= minInvestment) return 0.5;
  return 0.5 + 0.5 * ((investment - minInvestment) / (optimalInvestment - minInvestment));
}

function getTimelineFactor(timeline: number): number {
  const optimalTimeline = 16;
  const minTimeline = 6;
  if (timeline >= optimalTimeline) return 1.0;
  if (timeline <= minTimeline) return 0.6;
  return 0.6 + 0.4 * ((timeline - minTimeline) / (optimalTimeline - minTimeline));
}

function getRiskLevel(confidence: number): "low" | "medium" | "high" {
  if (confidence >= 85) return "low";
  if (confidence >= 70) return "medium";
  return "high";
}

function scaleHeadcount(baseHeadcount: number, timeline: number): number {
  const factor = Math.min(1, timeline / 12);
  return Math.round(baseHeadcount * factor);
}

function scaleBudget(baseSavings: number, investment: number): number {
  const baseInvestment = 620000;
  const ratio = investment / baseInvestment;
  if (baseSavings < 0) return Math.round(baseSavings * ratio);
  return Math.round(baseSavings * Math.pow(ratio, 0.8));
}

export function calculateMetrics(investment: number, timeline: number): CalculatedMetrics {
  const investmentAdequacy = getInvestmentAdequacy(investment);
  const timelineFactor = getTimelineFactor(timeline);
  
  const agents: CalculatedAgent[] = BASE_AGENTS.map((agent) => {
    const budgetImpact = scaleBudget(agent.baseSavings, investment);
    const headcountImpact = scaleHeadcount(agent.baseHeadcount, timeline);
    const adjustedConfidence = Math.round(
      agent.baseConfidence * investmentAdequacy * timelineFactor * (1 - agent.riskFactor * 0.3)
    );
    
    return {
      name: agent.name,
      budgetImpact,
      headcountImpact,
      confidence: Math.min(99, Math.max(50, adjustedConfidence)),
      risk: getRiskLevel(adjustedConfidence),
      decision: AGENT_DECISIONS[agent.name].decision,
      trigger: AGENT_DECISIONS[agent.name].trigger,
    };
  });

  const totalSavings = agents.reduce((sum, a) => sum + a.budgetImpact, 0);
  const totalHeadcountChange = agents.reduce((sum, a) => sum + a.headcountImpact, 0);
  const overallConfidence = Math.round(agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length);

  const profitGrowth = Math.min(18, Math.max(8, 8 + (investment / 100000) * 0.8 + (timeline / 20) * 2));
  const ctcReduction = Math.min(4, Math.max(1, 1.5 + (investment / 200000) * 0.4));

  const weeks = ["W1", "W2", "W4", "W6", "W8", "W10", "W12"];
  const profitProjection = weeks.map((week, i) => ({
    week,
    actual: i < 3 ? profitGrowth * (i + 1) * 0.15 : null,
    projected: profitGrowth * (i + 1) * 0.14,
  }));

  const ctcProjection = weeks.map((week, i) => ({
    week,
    actual: i < 3 ? 100 - ctcReduction * (i + 1) * 0.15 : null,
    projected: 100 - ctcReduction * (i + 1) * 0.14,
  }));

  const conflicts: ConflictData[] = [
    {
      id: 1,
      conflict: "Growth vs Efficiency",
      versus: "Cost Reduction Pressure",
      resolution: "Prioritize automation over headcount reduction",
      status: "resolved",
      agents: ["HR", "Operations"],
      savingsImpact: 85000,
    },
    {
      id: 2,
      conflict: "Marketing Spend",
      versus: "CAC Targets",
      resolution: "Shift 60% to performance channels",
      status: "resolved",
      agents: ["Marketing", "Finance"],
      savingsImpact: 120000,
    },
  ];

  return {
    profitGrowth: Math.round(profitGrowth * 10) / 10,
    ctcReduction: Math.round(ctcReduction * 10) / 10,
    overallConfidence,
    totalSavings,
    totalHeadcountChange,
    agents,
    profitProjection,
    ctcProjection,
    conflicts,
  };
}

export function formatCurrency(value: number, abs = false): string {
  const num = abs ? Math.abs(value) : value;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num}`;
}

export function formatBudgetImpact(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}
