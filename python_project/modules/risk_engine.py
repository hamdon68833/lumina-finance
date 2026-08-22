"""
PROJECT TITLE: Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
MODULE: risk_engine.py (Steps 6 & 7: Risk Classification & Portfolio Asset Allocation)
ACADEMIC YEAR: 2025-2026 | Major Project Phase I (BE ISE, VTU Belagavi)
"""

import numpy as np
from sklearn.tree import DecisionTreeClassifier

class RiskAndAllocationEngine:
    def __init__(self):
        """
        Initializes rule-based matrix and ML classifier for risk profiling.
        Combines User Age, Stated Risk Preference, and Emergency Reserve Buffer.
        """
        # Train a light Scikit-Learn Decision Tree model on synthetic financial profiling data
        # Features: [Age, StatedPreferenceCode (0:Low, 1:Med, 2:High), EmergencyMonths]
        # Target: RiskCategoryCode (0:Low, 1:Medium, 2:High)
        X_train = np.array([
            [22, 2, 6], [25, 2, 3], [28, 2, 1], [30, 1, 6], [32, 1, 2],
            [40, 1, 6], [42, 2, 6], [45, 0, 6], [52, 1, 6], [55, 0, 4],
            [62, 0, 6], [65, 1, 6], [24, 0, 6], [38, 2, 1], [50, 2, 2]
        ])
        y_train = np.array([
            2, 2, 1, 1, 1,
            1, 2, 0, 1, 0,
            0, 0, 0, 1, 1
        ])
        
        self.clf = DecisionTreeClassifier(max_depth=3, random_state=42)
        self.clf.fit(X_train, y_train)
        self.pref_map = {"low": 0, "medium": 1, "high": 2}
        self.cat_map = {0: "Low", 1: "Medium", 2: "High"}

    def evaluate_risk_profile(self, age: int, stated_preference: str, emergency_coverage_months: float):
        """
        Step 6: Classifies user into Low / Medium / High risk profile.
        Incorporates financial safety guardrails: If emergency reserve < 2 months, caps risk category to Low/Medium.
        """
        pref_clean = stated_preference.lower().strip()
        pref_code = self.pref_map.get(pref_clean, 1)
        
        # ML prediction
        sample = np.array([[age, pref_code, min(emergency_coverage_months, 12)]])
        predicted_code = self.clf.predict(sample)[0]
        ml_risk_cat = self.cat_map[predicted_code]
        
        # Rule-based guardrail adjustment
        final_risk_cat = ml_risk_cat
        risk_explanation = []
        
        if age < 35:
            risk_explanation.append("Younger age horizon allows higher capacity to absorb market volatility for long-term growth.")
        elif age <= 50:
            risk_explanation.append("Mid-career horizon requires a balanced approach between capital growth and capital protection.")
        else:
            risk_explanation.append("Senior investment horizon prioritizes wealth preservation and steady income generation.")

        # Guardrail: Insufficient Emergency Fund forces a lower risk profile
        if emergency_coverage_months < 2.0 and final_risk_cat == "High":
            final_risk_cat = "Medium"
            risk_explanation.append("[Guardrail Applied] High risk category capped to Medium because liquid emergency reserves are critical (< 2 months).")
        
        # Risk Scores (0 to 100 scale)
        if final_risk_cat == "High":
            risk_score = 80 + (25 - min(age, 25)) * 0.5
        elif final_risk_cat == "Medium":
            risk_score = 50 + (pref_code - 1) * 10
        else:
            risk_score = 25 - max(0, age - 50) * 0.2
            
        risk_score = max(10, min(95, round(risk_score, 1)))
        
        return {
            "risk_category": final_risk_cat,
            "risk_score": risk_score,
            "ml_predicted_category": ml_risk_cat,
            "explanations": risk_explanation
        }

    def calculate_investment_allocation(self, risk_category: str, investable_amount: float):
        """
        Step 7: Allocates investable savings across Stocks, Mutual Funds, Gold, and Fixed Deposits.
        
        Rules:
        - High Risk (Aggressive): 60% Stocks, 20% Mutual Funds, 10% Gold, 10% Fixed Deposits
        - Medium Risk (Balanced): 35% Stocks, 35% Mutual Funds, 15% Gold, 15% Fixed Deposits
        - Low Risk (Conservative): 10% Stocks, 30% Mutual Funds, 20% Gold, 40% Fixed Deposits
        """
        if risk_category == "High":
            weights = {"stocks": 0.60, "mutual_funds": 0.20, "gold": 0.10, "fixed_deposits": 0.10}
            strategy_title = "Aggressive Growth Strategy"
            strategy_desc = "Maximizes equity exposure for long-term capital appreciation while maintaining minor liquidity hedges."
        elif risk_category == "Medium":
            weights = {"stocks": 0.35, "mutual_funds": 0.35, "gold": 0.15, "fixed_deposits": 0.15}
            strategy_title = "Balanced Wealth Accumulation Strategy"
            strategy_desc = "Balances equities for growth with mutual funds, gold, and debt for volatility dampening."
        else:  # Low Risk
            weights = {"stocks": 0.10, "mutual_funds": 0.30, "gold": 0.20, "fixed_deposits": 0.40}
            strategy_title = "Capital Preservation Strategy"
            strategy_desc = "Prioritizes capital safety and predictable fixed returns while offsetting inflation through gold & index funds."
            
        allocation_breakdown = [
            {
                "asset_class": "Stocks & Equities",
                "key": "stocks",
                "percentage": weights["stocks"] * 100,
                "amount": investable_amount * weights["stocks"],
                "color": "#3B82F6", # Blue
                "role": "High growth, high return potential with market volatility"
            },
            {
                "asset_class": "Mutual Funds & ETFs",
                "key": "mutual_funds",
                "percentage": weights["mutual_funds"] * 100,
                "amount": investable_amount * weights["mutual_funds"],
                "color": "#10B981", # Green
                "role": "Professionally managed diversified index & sector funds"
            },
            {
                "asset_class": "Gold & Commodities",
                "key": "gold",
                "percentage": weights["gold"] * 100,
                "amount": investable_amount * weights["gold"],
                "color": "#F59E0B", # Gold / Amber
                "role": "Hedge against economic inflation and currency devaluation"
            },
            {
                "asset_class": "Fixed Deposits & Debt",
                "key": "fixed_deposits",
                "percentage": weights["fixed_deposits"] * 100,
                "amount": investable_amount * weights["fixed_deposits"],
                "color": "#8B5CF6", # Purple
                "role": "Guaranteed principal return and predictable yield"
            }
        ]
        
        return {
            "strategy_title": strategy_title,
            "strategy_description": strategy_desc,
            "weights": weights,
            "allocations": allocation_breakdown,
            "total_investable": investable_amount
        }
