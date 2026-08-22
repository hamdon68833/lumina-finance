"""
PROJECT TITLE: Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
MODULE: budget_analysis.py (Steps 2, 3, 4, 5: Income, Expense, Savings & Emergency Fund Check)
ACADEMIC YEAR: 2025-2026 | Major Project Phase I (BE ISE, VTU Belagavi)
"""

import pandas as pd

def analyze_budget(income: float, expenses_dict: dict, current_liquid_reserve: float, target_months: int = 6):
    """
    Computes total expenses, monthly savings, savings ratio, emergency fund requirements,
    and net investable surplus after emergency fund guardrail.
    
    Steps Mapped:
    - Step 2: Income and user demographics
    - Step 3: Expense Analysis (sum of categories)
    - Step 4: Savings Calculation = Income - Total Expenses
    - Step 5: Emergency Fund Check = Compare current_liquid_reserve against target_months * total_expenses
    """
    # Step 3: Calculate Total Expenditure
    total_expenses = sum(expenses_dict.values())
    
    # Step 4: Savings Calculation
    monthly_savings = income - total_expenses
    savings_ratio = (monthly_savings / income * 100) if income > 0 else 0
    
    # Step 5: Emergency Fund Assessment
    # Financial standard: 3 to 6 months of total monthly expenses
    target_emergency_fund = total_expenses * target_months
    emergency_fund_shortfall = max(0.0, target_emergency_fund - current_liquid_reserve)
    is_emergency_fund_adequate = current_liquid_reserve >= (total_expenses * 3) # Min threshold is 3 months
    
    # Logic for allocating monthly savings to Emergency Fund vs Investments:
    # If emergency reserve is under 3 months, 70% of monthly savings must go to building the reserve first!
    # If reserve is between 3 and 6 months, 30% goes to building reserve to reach 6 months.
    # If reserve >= 6 months, 100% of monthly savings can be invested.
    if current_liquid_reserve < (total_expenses * 3):
        emergency_fund_monthly_allocation = max(0.0, min(monthly_savings * 0.70, emergency_fund_shortfall))
        health_status = "CRITICAL SHORTFALL"
        status_color = "red"
        advice = f"Your emergency reserve is below 3 months of expenses (${target_emergency_fund * 0.5:,.2f}). We strongly recommend redirecting 70% of monthly savings to an liquid emergency deposit before stock investing."
    elif current_liquid_reserve < target_emergency_fund:
        emergency_fund_monthly_allocation = max(0.0, min(monthly_savings * 0.30, emergency_fund_shortfall))
        health_status = "MODERATE COVERAGE"
        status_color = "amber"
        advice = f"You have 3+ months covered, but you are below your target {target_months}-month goal of ${target_emergency_fund:,.2f}. Allocate 30% of savings to top up emergency funds."
    else:
        emergency_fund_monthly_allocation = 0.0
        health_status = "HEALTHY / FULLY FUNDED"
        status_color = "green"
        advice = f"Excellent! Your emergency reserve covers {current_liquid_reserve / max(total_expenses, 1):.1f} months of expenses. 100% of monthly savings can be deployed to investments."

    investable_monthly_savings = max(0.0, monthly_savings - emergency_fund_monthly_allocation)
    
    # Expense Breakdown Dataframe for Visualization
    expense_df = pd.DataFrame([
        {"Category": k.replace("_", " ").title(), "Amount": v, "Percentage": (v / total_expenses * 100) if total_expenses > 0 else 0}
        for k, v in expenses_dict.items()
    ])
    
    return {
        "monthly_income": income,
        "total_expenses": total_expenses,
        "monthly_savings": monthly_savings,
        "savings_ratio": savings_ratio,
        "current_liquid_reserve": current_liquid_reserve,
        "target_emergency_fund": target_emergency_fund,
        "emergency_fund_shortfall": emergency_fund_shortfall,
        "is_adequate": is_emergency_fund_adequate,
        "emergency_fund_status": health_status,
        "status_color": status_color,
        "emergency_fund_monthly_allocation": emergency_fund_monthly_allocation,
        "investable_monthly_savings": investable_monthly_savings,
        "emergency_advice": advice,
        "expense_breakdown_df": expense_df
    }
