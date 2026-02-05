"""
FastAPI Backend for Agentic Enterprise Web Interface
Uses Gemini API for intelligent CEO prompt parsing and dynamic calculations
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import os
import sys
import re
import json

# Add parent directory to path to import existing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import data upload handler
from data_upload import company_profile

app = FastAPI(title="Agentic Enterprise API", version="2.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API Key - Set via environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

class CEOPrompt(BaseModel):
    prompt: str
    investment_limit: Optional[float] = None
    timeline_weeks: Optional[int] = None

class AgentDecision(BaseModel):
    name: str
    icon: str
    accent: str
    decision: str
    budgetImpact: float
    headcountImpact: int
    confidence: int
    risk: str
    trigger: str

class CalculatedMetrics(BaseModel):
    profitGrowth: float
    ctcReduction: float
    overallConfidence: int
    totalSavings: float
    totalHeadcountChange: int
    agents: List[AgentDecision]
    profitProjection: List[Dict[str, Any]]
    ctcProjection: List[Dict[str, Any]]
    conflicts: List[Dict[str, Any]]

class ConflictData(BaseModel):
    id: int
    conflict: str
    versus: str
    resolution: str
    status: str
    agents: List[str]
    savingsImpact: float

# Agent configurations with dynamic calculation factors
AGENT_CONFIGS = {
    "Sales": {
        "icon": "Briefcase",
        "accent": "orange",
        "base_decision": "Implement AI-powered lead scoring and automate outreach sequences. {action} new SDR hiring.",
        "trigger": "If Q2 pipeline drops below $2.5M, recommend {reverse_action}",
        "base_budget_positive": 85000,  # When cost cutting
        "base_budget_negative": -120000,  # When investing
        "base_headcount": -3,
        "base_confidence": 89,
        "risk_factor": 0.2
    },
    "Marketing": {
        "icon": "Megaphone",
        "accent": "red",
        "base_decision": "Shift {percentage}% budget to performance channels. Deploy AI content generation for 4x output.",
        "trigger": "If CAC exceeds $180, revert to brand awareness mix",
        "base_budget_positive": -120000,
        "base_budget_negative": 180000,
        "base_headcount": 0,
        "base_confidence": 82,
        "risk_factor": 0.4
    },
    "Finance": {
        "icon": "Wallet",
        "accent": "green",
        "base_decision": "Consolidate {number} vendor contracts. Implement dynamic pricing with {margin}% margin optimization.",
        "trigger": "If customer churn exceeds 8%, pause pricing changes",
        "base_budget_positive": 195000,
        "base_budget_negative": 80000,
        "base_headcount": 0,
        "base_confidence": 94,
        "risk_factor": 0.1
    },
    "Operations": {
        "icon": "Settings2",
        "accent": "blue",
        "base_decision": "Automate {percentage}% of manual workflows. Consolidate {number} regional offices into hybrid model.",
        "trigger": "If SLA breaches exceed 2%, restore on-site capacity",
        "base_budget_positive": 220000,
        "base_budget_negative": 150000,
        "base_headcount": -5,
        "base_confidence": 87,
        "risk_factor": 0.35
    },
    "Support": {
        "icon": "Headphones",
        "accent": "purple",
        "base_decision": "Deploy AI chatbot for L1 queries ({percentage}% deflection). Upskill team for complex cases.",
        "trigger": "If CSAT drops below 4.2, increase human agent ratio",
        "base_budget_positive": 95000,
        "base_budget_negative": 60000,
        "base_headcount": -2,
        "base_confidence": 91,
        "risk_factor": 0.15
    },
    "HR": {
        "icon": "Users",
        "accent": "teal",
        "base_decision": "{action} non-critical hiring. Implement performance-based variable compensation (+{percentage}%).",
        "trigger": "If voluntary attrition exceeds 12%, review {reverse_action} policy",
        "base_budget_positive": 145000,
        "base_budget_negative": 50000,
        "base_headcount": -4,
        "base_confidence": 85,
        "risk_factor": 0.3
    }
}

async def parse_with_gemini(prompt: str) -> Dict[str, Any]:
    """Use Gemini to parse CEO intent intelligently"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_prompt = """You are an enterprise AI parser. Extract structured intent from CEO directives.
        
Analyze this CEO prompt and return a JSON object with:
{
    "primary_objective": "main goal (profit increase, cost reduction, etc.)",
    "secondary_objective": "secondary goal or null",
    "target_percentage": number (e.g., 15 for 15%),
    "secondary_percentage": number or null,
    "objective_type": "profit" | "cost_reduction" | "growth" | "efficiency" | "revenue",
    "time_horizon": "short" | "medium" | "long",
    "urgency_level": "low" | "medium" | "high",
    "budget_implication": "cut_costs" | "invest" | "reallocate" | "maintain",
    "inherent_tension": "description of conflicting objectives or null",
    "affected_departments": ["list", "of", "departments"]
}

CEO Prompt: """ + prompt
        
        response = model.generate_content(system_prompt)
        
        # Extract JSON from response
        text = response.text
        # Find JSON block
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        # Fallback to regex parsing
        return parse_ceo_intent_fallback(prompt)
        
    except Exception as e:
        print(f"Gemini error: {e}")
        return parse_ceo_intent_fallback(prompt)

def parse_ceo_intent_fallback(prompt: str) -> Dict[str, Any]:
    """Fallback regex-based parsing"""
    prompt_lower = prompt.lower()
    
    result = {
        "primary_objective": "Improve business performance",
        "secondary_objective": None,
        "target_percentage": 15,
        "secondary_percentage": None,
        "objective_type": "efficiency",
        "time_horizon": "medium",
        "urgency_level": "medium",
        "budget_implication": "reallocate",
        "inherent_tension": None,
        "affected_departments": ["Sales", "Marketing", "Finance", "Operations", "Support", "HR"]
    }
    
    # Extract percentages
    percentages = re.findall(r'(\d+(?:\.\d+)?)%', prompt)
    if percentages:
        result["target_percentage"] = float(percentages[0])
        if len(percentages) > 1:
            result["secondary_percentage"] = float(percentages[1])
    
    # Detect objective types
    if "profit" in prompt_lower or "margin" in prompt_lower:
        result["objective_type"] = "profit"
        result["primary_objective"] = f"Increase profit by {result['target_percentage']}%"
        
    if "cost" in prompt_lower or "ctc" in prompt_lower or "expense" in prompt_lower:
        if result["objective_type"] == "profit":
            result["secondary_objective"] = f"Reduce costs by {result.get('secondary_percentage', result['target_percentage'] * 0.15)}%"
            result["inherent_tension"] = "Growth requires investment but costs must decrease"
            result["budget_implication"] = "cut_costs"
        else:
            result["objective_type"] = "cost_reduction"
            result["primary_objective"] = f"Reduce costs by {result['target_percentage']}%"
            result["budget_implication"] = "cut_costs"
    
    if "revenue" in prompt_lower or "sales" in prompt_lower:
        result["objective_type"] = "revenue"
        result["primary_objective"] = f"Increase revenue by {result['target_percentage']}%"
        result["budget_implication"] = "invest"
    
    if "efficiency" in prompt_lower or "productivity" in prompt_lower:
        result["objective_type"] = "efficiency"
        result["primary_objective"] = f"Improve efficiency by {result['target_percentage']}%"
    
    # Detect urgency
    if "urgent" in prompt_lower or "immediately" in prompt_lower or "asap" in prompt_lower:
        result["urgency_level"] = "high"
        result["time_horizon"] = "short"
    elif "gradual" in prompt_lower or "over time" in prompt_lower:
        result["urgency_level"] = "low"
        result["time_horizon"] = "long"
    
    return result

def calculate_agent_decisions(parsed: Dict[str, Any], investment: float, timeline: int) -> List[AgentDecision]:
    """Calculate dynamic agent decisions based on parsed intent and real company data"""
    
    obj_type = parsed.get("objective_type", "efficiency")
    target_pct = parsed.get("target_percentage", 15)
    secondary_pct = parsed.get("secondary_percentage")
    budget_impl = parsed.get("budget_implication", "reallocate")
    urgency = parsed.get("urgency_level", "medium")
    
    # Adjust factors based on objective
    is_cost_cutting = budget_impl == "cut_costs"
    is_investing = budget_impl == "invest"
    
    # Timeline factor (0.6 to 1.0)
    timeline_factor = min(1.0, max(0.6, timeline / 12))
    
    # Use company data for baseline if available
    if company_profile.is_loaded and 'total_revenue' in company_profile.metrics:
        base_revenue = company_profile.metrics['total_revenue']
        # Scale base investment to ~6.2% of annual revenue (typical optimization budget)
        base_investment = base_revenue * 0.062
        print(f"Using company baseline: Revenue=${base_revenue:,.0f}, Investment=${base_investment:,.0f}")
    else:
        base_investment = 620000
        print(f"Using default baseline: Investment=${base_investment:,.0f}")
    
    # Investment factor (scales with budget)
    investment_factor = (investment / base_investment) ** 0.8
    
    # Urgency factor
    urgency_multiplier = 1.2 if urgency == "high" else 1.0 if urgency == "medium" else 0.9
    
    agents = []
    
    for name, config in AGENT_CONFIGS.items():
        # Determine if this agent should show positive or negative budget
        if is_cost_cutting:
            base_budget = config["base_budget_positive"]
            action = "Freeze"
            reverse_action = "2 SDR hires"
            percentage = int(target_pct * 0.8)
            number = max(2, int(target_pct / 5))
            margin = round(target_pct * 0.15, 1)
        elif is_investing:
            base_budget = config["base_budget_negative"]
            action = "Accelerate"
            reverse_action = "freeze"
            percentage = int(target_pct * 1.2)
            number = max(1, int(target_pct / 10))
            margin = round(target_pct * 0.2, 1)
        else:
            # Mixed or reallocate
            base_budget = config["base_budget_positive"] if name in ["Sales", "HR", "Operations"] else config["base_budget_negative"]
            action = "Optimize"
            reverse_action = "current pace"
            percentage = int(target_pct)
            number = max(2, int(target_pct / 7))
            margin = round(target_pct * 0.17, 1)
        
        # Scale budget by investment factor and company size
        budget_impact = round(base_budget * investment_factor * urgency_multiplier)
        
        # If we have company data, scale budget to company size
        if company_profile.is_loaded and 'total_revenue' in company_profile.metrics:
            revenue_scale = company_profile.metrics['total_revenue'] / 10000000  # vs $10M baseline
            budget_impact = round(budget_impact * revenue_scale)
        
        # Scale headcount by timeline and company size
        headcount_impact = round(config["base_headcount"] * timeline_factor)
        
        # If we have company data, scale headcount proportionally
        if company_profile.is_loaded and 'current_headcount' in company_profile.metrics:
            headcount_scale = company_profile.metrics['current_headcount'] / 620  # vs 620 baseline
            headcount_impact = round(headcount_impact * headcount_scale)
        
        # Adjust confidence
        base_conf = config["base_confidence"]
        confidence = int(min(99, max(50, base_conf * timeline_factor * (1 - config["risk_factor"] * 0.3))))
        
        # Determine risk level
        if confidence >= 85:
            risk = "low"
        elif confidence >= 70:
            risk = "medium"
        else:
            risk = "high"
        
        # Format decision text
        decision = config["base_decision"].format(
            action=action,
            reverse_action=reverse_action,
            percentage=percentage,
            number=number,
            margin=margin
        )
        
        # Format trigger
        trigger = config["trigger"].format(
            reverse_action=reverse_action.lower()
        )
        
        agents.append(AgentDecision(
            name=name,
            icon=config["icon"],
            accent=config["accent"],
            decision=decision,
            budgetImpact=budget_impact,
            headcountImpact=headcount_impact,
            confidence=confidence,
            risk=risk,
            trigger=trigger
        ))
    
    return agents

def generate_conflicts(parsed: Dict[str, Any], agents: List[AgentDecision]) -> List[ConflictData]:
    """Generate conflicts based on parsed intent"""
    conflicts = []
    
    obj_type = parsed.get("objective_type", "efficiency")
    tension = parsed.get("inherent_tension")
    
    # Calculate dynamic values based on parsed data
    target_pct = parsed.get('target_percentage', 15)
    secondary_pct = parsed.get('secondary_percentage', target_pct * 0.15)
    investment = parsed.get('investment_limit', 620000)
    
    if obj_type == "profit" and parsed.get("secondary_objective"):
        # Dual objective conflict
        auto_pct = int(target_pct * 0.6)
        conflicts.append(ConflictData(
            id=1,
            conflict="Growth vs Efficiency",
            versus="Cost Reduction Pressure",
            resolution=f"APPROVED: Prioritize automation over headcount reduction. Target {target_pct}% profit growth with {secondary_pct:.1f}% cost reduction.",
            status="resolved",
            agents=["HR", "Operations"],
            savingsImpact=int(investment * 0.12)
        ))
        
        conflicts.append(ConflictData(
            id=2,
            conflict="Marketing Spend",
            versus="CAC Targets",
            resolution=f"APPROVED: Shift {auto_pct}% budget to performance channels to maintain CAC at ${parsed.get('avg_cac', 385):.0f}",
            status="resolved",
            agents=["Marketing", "Finance"],
            savingsImpact=int(investment * 0.17)
        ))
    elif obj_type == "cost_reduction":
        phase_weeks = int(parsed.get('timeline_weeks', 12) / 4)
        conflicts.append(ConflictData(
            id=1,
            conflict="Deep Cost Cutting",
            versus="Service Quality Maintenance",
            resolution=f"APPROVED: Phase {target_pct}% cost cuts over {phase_weeks} weeks with quality checkpoints at weeks {phase_weeks}, {phase_weeks*2}, {phase_weeks*3}",
            status="resolved",
            agents=["Operations", "Support", "Finance"],
            savingsImpact=int(investment * 0.35)
        ))
    elif obj_type == "revenue":
        conflicts.append(ConflictData(
            id=1,
            conflict="Aggressive Growth",
            versus="Resource Constraints",
            resolution=f"APPROVED: Reallocate ${investment * 0.25:,.0f} from reserves to support {target_pct}% revenue growth target",
            status="resolved",
            agents=["Sales", "Marketing", "Finance"],
            savingsImpact=-int(investment * 0.25)
        ))
    else:
        # Default conflict for efficiency or other objectives
        conflicts.append(ConflictData(
            id=1,
            conflict="Efficiency Optimization",
            versus="Business Continuity",
            resolution=f"APPROVED: Implement {target_pct}% efficiency gains with zero disruption protocol over {parsed.get('timeline_weeks', 12)} weeks",
            status="resolved",
            agents=["Operations", "Finance"],
            savingsImpact=int(investment * 0.19)
        ))
    
    return conflicts

def generate_projections(parsed: Dict[str, Any], timeline: int) -> tuple:
    """Generate profit and CTC projection data for charts"""
    target_pct = parsed.get("target_percentage", 15)
    
    # Generate week labels based on timeline
    if timeline <= 8:
        weeks = ["W1", "W2", "W4", "W6", f"W{timeline}"]
    elif timeline <= 12:
        weeks = ["W1", "W3", "W6", "W9", f"W{timeline}"]
    else:
        weeks = ["W1", "W4", "W8", "W12", f"W{timeline}"]
    
    profit_data = []
    ctc_data = []
    
    for i, week in enumerate(weeks):
        progress = (i + 1) / len(weeks)
        
        # Profit projection
        projected = target_pct * progress * 0.9  # 90% achievement curve
        actual = projected * 0.85 if i < len(weeks) / 2 else None  # Only show actuals for first half
        
        profit_data.append({
            "week": week,
            "actual": round(actual, 1) if actual else None,
            "projected": round(projected, 1)
        })
        
        # CTC projection (starts at 100, goes down)
        ctc_projected = 100 - (target_pct * 0.15 * progress)  # Cost reduction
        ctc_actual = ctc_projected + 0.5 if i < len(weeks) / 2 else None
        
        ctc_data.append({
            "week": week,
            "actual": round(ctc_actual, 1) if ctc_actual else None,
            "projected": round(ctc_projected, 1)
        })
    
    return profit_data, ctc_data

@app.post("/api/calculate", response_model=CalculatedMetrics)
async def calculate_endpoint(data: CEOPrompt):
    """Main endpoint: Parse prompt with Gemini and calculate metrics"""
    try:
        # Step 1: Parse the CEO prompt with Gemini
        parsed = await parse_with_gemini(data.prompt)
        
        # Step 2: Calculate agent decisions
        agents = calculate_agent_decisions(
            parsed, 
            data.investment_limit or 620000,
            data.timeline_weeks or 12
        )
        
        # Step 3: Calculate totals
        total_savings = sum(a.budgetImpact for a in agents)
        total_headcount = sum(a.headcountImpact for a in agents)
        avg_confidence = int(sum(a.confidence for a in agents) / len(agents))
        
        # Step 4: Generate conflicts
        conflicts = generate_conflicts(parsed, agents)
        
        # Step 5: Generate chart projections
        profit_proj, ctc_proj = generate_projections(
            parsed, 
            data.timeline_weeks or 12
        )
        
        # Step 6: Determine final metrics
        obj_type = parsed.get("objective_type", "efficiency")
        target_pct = parsed.get("target_percentage", 15)
        
        if obj_type == "profit":
            profit_growth = target_pct
            ctc_reduction = parsed.get("secondary_percentage") or (target_pct * 0.15)
        elif obj_type == "cost_reduction":
            profit_growth = target_pct * 0.3  # Cost reduction helps profit margin
            ctc_reduction = target_pct
        elif obj_type == "revenue":
            profit_growth = target_pct * 0.6  # Revenue doesn't fully convert to profit
            ctc_reduction = 0
        else:
            profit_growth = target_pct * 0.8
            ctc_reduction = target_pct * 0.1
        
        return CalculatedMetrics(
            profitGrowth=round(profit_growth, 1),
            ctcReduction=round(ctc_reduction, 1),
            overallConfidence=avg_confidence,
            totalSavings=total_savings,
            totalHeadcountChange=total_headcount,
            agents=agents,
            profitProjection=profit_proj,
            ctcProjection=ctc_proj,
            conflicts=[c.dict() for c in conflicts]
        )
        
    except Exception as e:
        import traceback
        print(f"Error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_data(file: UploadFile = File(...)):
    """Upload company data (CSV or Excel)"""
    try:
        content = await file.read()
        result = company_profile.process_csv(content)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/company-data")
async def get_company_data():
    """Get current loaded company data"""
    if not company_profile.is_loaded:
        return {
            "status": "no_data",
            "message": "No company data uploaded yet. Using default baselines."
        }
    
    return {
        "status": "loaded",
        "metrics": company_profile.metrics,
        "detected_columns": list(company_profile.raw_data.keys())
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "agentic-enterprise-api",
        "gemini_available": bool(GEMINI_API_KEY),
        "company_data_loaded": company_profile.is_loaded
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
