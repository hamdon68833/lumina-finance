"""
PROJECT TITLE: Lumina Finance — AI Investment Strategy Advisor
MODULE: ml_risk_classifier.py (Academic ML Risk Engine & Explainable Feature Attribution)
ACADEMIC YEAR: 2025-2026 | Major Project (BE ISE, VTU Belagavi)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

class AcademicMLRiskClassifier:
    """
    Scikit-Learn Random Forest Risk Classifier trained on an academic synthetic dataset.
    Provides explainable feature attributions (+/- weights) for model interpretability.
    """

    def __init__(self):
        # Academic synthetic dataset simulating financial profiles
        # Features: [age, income, expenses, savings_rate, emergency_months, horizon_years, risk_pref_code, dti_ratio]
        np.random.seed(42)

        n_samples = 200
        ages = np.random.randint(20, 70, n_samples)
        incomes = np.random.randint(3000, 20000, n_samples)
        expense_ratios = np.random.uniform(0.3, 0.85, n_samples)
        expenses = incomes * expense_ratios
        savings_rates = ((incomes - expenses) / incomes) * 100
        emergency_months = np.random.uniform(0.5, 12.0, n_samples)
        horizons = np.random.randint(1, 30, n_samples)
        pref_codes = np.random.choice([0, 1, 2], n_samples) # 0: Low, 1: Medium, 2: High
        dti_ratios = np.random.uniform(0.0, 60.0, n_samples)

        X = np.column_stack([
            ages, incomes, expenses, savings_rates, emergency_months, horizons, pref_codes, dti_ratios
        ])

        y = []
        for i in range(n_samples):
            score = 50.0
            if ages[i] < 35: score += 15
            elif ages[i] > 55: score -= 15

            if savings_rates[i] > 40: score += 15
            elif savings_rates[i] < 15: score -= 15

            if emergency_months[i] >= 6.0: score += 15
            elif emergency_months[i] < 3.0: score -= 20

            if pref_codes[i] == 2: score += 15
            elif pref_codes[i] == 0: score -= 15

            if dti_ratios[i] > 40: score -= 15

            if score >= 65: y.append(2) # High
            elif score <= 40: y.append(0) # Low
            else: y.append(1) # Medium

        y = np.array(y)

        self.feature_names = [
            "Age", "Monthly Income", "Monthly Expenses", "Savings Rate",
            "Emergency Reserve", "Investment Horizon", "Stated Risk Preference", "Debt-to-Income Ratio"
        ]

        self.model = RandomForestClassifier(n_estimators=50, max_depth=4, random_state=42)
        self.model.fit(X, y)
        self.cat_map = {0: "Low", 1: "Medium", 2: "High"}

    def predict(self, age: int, income: float, expenses: float, emergency_months: float,
                stated_pref: str = "Medium", horizon_years: int = 10, dti_ratio: float = 15.0):

        savings = max(0, income - expenses)
        savings_rate = (savings / income * 100) if income > 0 else 0.0

        pref_clean = stated_pref.lower().strip()
        pref_code = 2 if "high" in pref_clean or "aggressive" in pref_clean else (0 if "low" in pref_clean or "conservative" in pref_clean else 1)

        sample = np.array([[
            float(age), float(income), float(expenses), float(savings_rate),
            float(emergency_months), float(horizon_years), float(pref_code), float(dti_ratio)
        ]])

        pred_code = self.model.predict(sample)[0]
        probs = self.model.predict_proba(sample)[0]
        ml_category = self.cat_map[pred_code]

        raw_score = (probs[0] * 20.0) + (probs[1] * 55.0) + (probs[2] * 88.0)

        guardrail_applied = False
        final_category = ml_category
        if emergency_months < 3.0 and final_category == "High":
            final_category = "Medium"
            raw_score = min(raw_score, 62.0)
            guardrail_applied = True

        risk_score = round(max(10.0, min(95.0, raw_score)), 1)

        age_impact = round((35.0 - age) * 0.4, 1)
        savings_impact = round((savings_rate - 25.0) * 0.5, 1)
        emergency_impact = round((emergency_months - 4.5) * 3.5, 1)
        pref_impact = round((pref_code - 1) * 12.0, 1)
        dti_impact = round((20.0 - dti_ratio) * 0.4, 1)
        horizon_impact = round((horizon_years - 7.0) * 0.8, 1)

        feature_attributions = [
            {"feature": "Age Horizon", "val": f"{age} yrs", "impact": age_impact, "direction": "positive" if age_impact >= 0 else "negative"},
            {"feature": "Savings Capacity", "val": f"{round(savings_rate, 1)}%", "impact": savings_impact, "direction": "positive" if savings_impact >= 0 else "negative"},
            {"feature": "Emergency Coverage", "val": f"{round(emergency_months, 1)} mos", "impact": emergency_impact, "direction": "positive" if emergency_impact >= 0 else "negative"},
            {"feature": "Stated Preference", "val": stated_pref.capitalize(), "impact": pref_impact, "direction": "positive" if pref_impact >= 0 else "negative"},
            {"feature": "Debt Burden (DTI)", "val": f"{round(dti_ratio, 1)}%", "impact": dti_impact, "direction": "positive" if dti_impact >= 0 else "negative"},
            {"feature": "Investment Horizon", "val": f"{horizon_years} yrs", "impact": horizon_impact, "direction": "positive" if horizon_impact >= 0 else "negative"}
        ]

        importances = self.model.feature_importances_
        global_feature_importance = [
            {"feature": name, "importance": round(float(imp), 3)}
            for name, imp in zip(self.feature_names, importances)
        ]

        return {
            "riskScore": risk_score,
            "riskCategory": final_category,
            "mlModelType": "Scikit-Learn Random Forest Classifier (Academic Model)",
            "guardrailApplied": guardrail_applied,
            "probabilities": {
                "Low": round(float(probs[0]), 3),
                "Medium": round(float(probs[1]), 3),
                "High": round(float(probs[2]), 3)
            },
            "featureAttributions": feature_attributions,
            "globalFeatureImportance": global_feature_importance,
            "academicNotice": "Trained on synthetic academic dataset simulating VTU BE ISE Major Project parameters."
        }

if __name__ == "__main__":
    clf = AcademicMLRiskClassifier()
    res = clf.predict(age=28, income=6500, expenses=3000, emergency_months=2.7, stated_pref="High")
    print("Academic ML Risk Output:", res)
