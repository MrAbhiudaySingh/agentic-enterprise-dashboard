"""
Data Upload Handler - Process user-uploaded quarterly data for personalized calculations
"""
import pandas as pd
from typing import Dict, Any, Optional
import io
import json
from datetime import datetime

class CompanyDataProfile:
    """Stores and processes uploaded company data"""
    
    def __init__(self):
        self.raw_data = {}
        self.metrics = {}
        self.is_loaded = False
        
    def process_csv(self, file_content: bytes) -> Dict[str, Any]:
        """Process uploaded CSV/Excel file"""
        try:
            # Try Excel first, then CSV
            try:
                df = pd.read_excel(io.BytesIO(file_content))
            except:
                df = pd.read_csv(io.BytesIO(file_content))
            
            # Auto-detect column types and standardize
            self.raw_data = self._standardize_columns(df)
            self.metrics = self._calculate_metrics()
            self.is_loaded = True
            
            return {
                "status": "success",
                "message": f"Processed {len(df)} records",
                "metrics": self.metrics,
                "detected_columns": list(self.raw_data.keys())
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _standardize_columns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Map various column names to standard fields"""
        column_mapping = {
            # Revenue/Sales
            'revenue': ['revenue', 'sales', 'turnover', 'gross_revenue', 'total_revenue'],
            'profit': ['profit', 'net_profit', 'operating_profit', 'ebitda', 'ebit', 'net_income'],
            'costs': ['costs', 'expenses', 'total_costs', 'operating_costs', 'opex'],
            'headcount': ['headcount', 'employees', 'fte', 'staff_count', 'workforce'],
            
            # CAC metrics
            'cac': ['cac', 'customer_acquisition_cost', 'acquisition_cost'],
            'new_customers': ['new_customers', 'new_clients', 'acquisitions', 'customer_acquisitions'],
            'marketing_spend': ['marketing_spend', 'marketing_budget', 'ad_spend', 'advertising'],
            
            # Retention
            'churn_rate': ['churn_rate', 'churn', 'attrition_rate', 'customer_churn'],
            'retention_rate': ['retention_rate', 'retention', 'customer_retention'],
            'nps': ['nps', 'net_promoter_score'],
            'csat': ['csat', 'customer_satisfaction'],
            
            # Sales
            'pipeline': ['pipeline', 'sales_pipeline', 'opportunity_pipeline'],
            'deals_closed': ['deals_closed', 'closed_deals', 'wins', 'sales_wins'],
            'avg_deal_size': ['avg_deal_size', 'deal_size', 'average_deal', 'contract_value'],
            
            # Time period
            'quarter': ['quarter', 'q', 'period', 'quarter_period'],
            'year': ['year', 'yr', 'fiscal_year'],
            'month': ['month', 'mo', 'month_period'],
        }
        
        standardized = {}
        df_lower = {col.lower().replace(' ', '_'): col for col in df.columns}
        
        for standard_name, possible_names in column_mapping.items():
            for possible in possible_names:
                if possible in df_lower:
                    original_col = df_lower[possible]
                    standardized[standard_name] = df[original_col].tolist()
                    break
        
        # If no standard columns found, use all columns as-is
        if not standardized:
            for col in df.columns:
                standardized[col.lower().replace(' ', '_')] = df[col].tolist()
        
        return standardized
    
    def _calculate_metrics(self) -> Dict[str, Any]:
        """Calculate key metrics from raw data"""
        metrics = {}
        
        # Revenue metrics
        if 'revenue' in self.raw_data:
            revenues = [float(x) for x in self.raw_data['revenue'] if pd.notna(x)]
            metrics['total_revenue'] = sum(revenues)
            metrics['avg_quarterly_revenue'] = sum(revenues) / len(revenues) if revenues else 0
            metrics['revenue_trend'] = self._calculate_trend(revenues)
        
        # Profit metrics
        if 'profit' in self.raw_data:
            profits = [float(x) for x in self.raw_data['profit'] if pd.notna(x)]
            metrics['total_profit'] = sum(profits)
            metrics['profit_margin'] = (sum(profits) / metrics['total_revenue'] * 100) if metrics.get('total_revenue') else 0
            metrics['profit_trend'] = self._calculate_trend(profits)
        
        # CAC metrics
        if 'cac' in self.raw_data:
            cacs = [float(x) for x in self.raw_data['cac'] if pd.notna(x)]
            metrics['avg_cac'] = sum(cacs) / len(cacs) if cacs else 385  # Default fallback
            metrics['cac_trend'] = self._calculate_trend(cacs)
        elif 'marketing_spend' in self.raw_data and 'new_customers' in self.raw_data:
            marketing = sum([float(x) for x in self.raw_data['marketing_spend'] if pd.notna(x)])
            customers = sum([float(x) for x in self.raw_data['new_customers'] if pd.notna(x)])
            metrics['avg_cac'] = marketing / customers if customers > 0 else 385
        
        # Headcount
        if 'headcount' in self.raw_data:
            headcounts = [int(x) for x in self.raw_data['headcount'] if pd.notna(x)]
            metrics['current_headcount'] = headcounts[-1] if headcounts else 620
            metrics['headcount_change'] = (headcounts[-1] - headcounts[0]) if len(headcounts) > 1 else 0
        else:
            metrics['current_headcount'] = 620  # Default
        
        # Churn/Retention
        if 'churn_rate' in self.raw_data:
            churns = [float(x) for x in self.raw_data['churn_rate'] if pd.notna(x)]
            metrics['current_churn'] = churns[-1] if churns else 0.08
            metrics['avg_churn'] = sum(churns) / len(churns) if churns else 0.08
        elif 'retention_rate' in self.raw_data:
            retentions = [float(x) for x in self.raw_data['retention_rate'] if pd.notna(x)]
            metrics['current_churn'] = 1 - (retentions[-1] / 100) if retentions else 0.08
        else:
            metrics['current_churn'] = 0.08
        
        # Sales pipeline
        if 'pipeline' in self.raw_data:
            pipelines = [float(x) for x in self.raw_data['pipeline'] if pd.notna(x)]
            metrics['current_pipeline'] = pipelines[-1] if pipelines else 2500000
        
        # Deal metrics
        if 'deals_closed' in self.raw_data:
            deals = [int(x) for x in self.raw_data['deals_closed'] if pd.notna(x)]
            metrics['quarterly_deals'] = deals[-1] if deals else 45
        
        if 'avg_deal_size' in self.raw_data:
            deal_sizes = [float(x) for x in self.raw_data['avg_deal_size'] if pd.notna(x)]
            metrics['avg_deal_size'] = sum(deal_sizes) / len(deal_sizes) if deal_sizes else 85000
        
        # NPS/CSAT
        if 'nps' in self.raw_data:
            nps_scores = [float(x) for x in self.raw_data['nps'] if pd.notna(x)]
            metrics['current_nps'] = nps_scores[-1] if nps_scores else 42
        
        if 'csat' in self.raw_data:
            csat_scores = [float(x) for x in self.raw_data['csat'] if pd.notna(x)]
            metrics['current_csat'] = csat_scores[-1] if csat_scores else 4.2
        
        # Calculated metrics
        if 'total_revenue' in metrics and 'current_headcount' in metrics:
            metrics['revenue_per_employee'] = metrics['total_revenue'] / metrics['current_headcount']
        
        return metrics
    
    def _calculate_trend(self, values: list) -> str:
        """Calculate if trend is up, down, or flat"""
        if len(values) < 2:
            return "stable"
        
        first_half = sum(values[:len(values)//2]) / (len(values)//2) if values else 0
        second_half = sum(values[len(values)//2:]) / (len(values) - len(values)//2) if values else 0
        
        change_pct = ((second_half - first_half) / first_half * 100) if first_half else 0
        
        if change_pct > 5:
            return "increasing"
        elif change_pct < -5:
            return "decreasing"
        return "stable"
    
    def get_baseline_for_agent(self, agent_name: str) -> Dict[str, Any]:
        """Get baseline metrics for a specific agent"""
        baselines = {
            "Sales": {
                "current_pipeline": self.metrics.get('current_pipeline', 2500000),
                "quarterly_deals": self.metrics.get('quarterly_deals', 45),
                "avg_deal_size": self.metrics.get('avg_deal_size', 85000),
                "headcount": int(self.metrics.get('current_headcount', 620) * 0.16),  # ~16% of workforce
            },
            "Marketing": {
                "current_cac": self.metrics.get('avg_cac', 385),
                "marketing_spend": self.metrics.get('total_revenue', 10000000) * 0.12,  # ~12% of revenue
                "lead_volume": self.metrics.get('quarterly_deals', 45) * 5,  # 5:1 ratio
            },
            "Finance": {
                "profit_margin": self.metrics.get('profit_margin', 15),
                "total_revenue": self.metrics.get('total_revenue', 10000000),
                "operating_costs": self.metrics.get('total_revenue', 10000000) - self.metrics.get('total_profit', 1500000),
            },
            "Operations": {
                "headcount": int(self.metrics.get('current_headcount', 620) * 0.25),  # ~25% of workforce
                "csat": self.metrics.get('current_csat', 4.2),
            },
            "Support": {
                "headcount": int(self.metrics.get('current_headcount', 620) * 0.20),  # ~20% of workforce
                "csat": self.metrics.get('current_csat', 4.2),
                "nps": self.metrics.get('current_nps', 42),
            },
            "HR": {
                "total_headcount": self.metrics.get('current_headcount', 620),
                "churn_rate": self.metrics.get('current_churn', 0.08),
                "revenue_per_employee": self.metrics.get('revenue_per_employee', 16000),
            }
        }
        
        return baselines.get(agent_name, {})
    
    def adjust_calculations(self, base_values: Dict[str, Any], agent_name: str) -> Dict[str, Any]:
        """Adjust base calculations using real company data"""
        if not self.is_loaded:
            return base_values
        
        agent_baseline = self.get_baseline_for_agent(agent_name)
        adjusted = base_values.copy()
        
        # Scale budget impacts based on company size
        if 'total_revenue' in self.metrics:
            revenue_scale = self.metrics['total_revenue'] / 10000000  # Scale vs $10M baseline
            adjusted['budgetImpact'] = round(base_values.get('budgetImpact', 0) * revenue_scale)
        
        # Scale headcount based on actual workforce
        if 'current_headcount' in self.metrics:
            headcount_scale = self.metrics['current_headcount'] / 620  # Scale vs 620 baseline
            adjusted['headcountImpact'] = round(base_values.get('headcountImpact', 0) * headcount_scale)
        
        # Adjust confidence based on data quality/trend
        if 'profit_trend' in self.metrics:
            if self.metrics['profit_trend'] == 'decreasing':
                adjusted['confidence'] = max(50, adjusted.get('confidence', 85) - 10)
            elif self.metrics['profit_trend'] == 'increasing':
                adjusted['confidence'] = min(99, adjusted.get('confidence', 85) + 5)
        
        return adjusted

# Global instance to store uploaded data
company_profile = CompanyDataProfile()
