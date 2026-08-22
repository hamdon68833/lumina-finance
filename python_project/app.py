"""
================================================================================
PROJECT TITLE: Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
ACADEMIC CONTEXT: Major Project Phase I (BE ISE, VTU Belagavi) 2025-2026
TECH STACK: Python, Streamlit, Pandas, NumPy, Scikit-learn, Plotly, yfinance, TextBlob
================================================================================
SYSTEM WORKFLOW (10 methodology steps):
  Step 1: User Authentication (Login / Register / Session)
  Step 2: Data Collection (Income, Age, Stated Risk Preference)
  Step 3: Expense Analysis (Categorized Expenditure Computation)
  Step 4: Savings Calculation (Savings = Income - Expenses)
  Step 5: Emergency Fund Check (Target: 3 to 6 Months Expenses Guardrail)
  Step 6: Risk Analysis Engine (ML & Rule Classifier)
  Step 7: Investment Allocation (Stocks, Mutual Funds, Gold, Fixed Deposits)
  Step 8: Stock Market Analysis (Technicals, RSI, SMAs, Sentiment & Buy/Sell/Hold)
  Step 9: Visualization Dashboard (Plotly Charts & Expense Breakdown)
  Step 10: Final Recommendation Engine & Strategy Report
================================================================================
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Import Custom Modules
from modules.database import authenticate_user, register_user, save_financial_profile, get_financial_profile
from modules.budget_analysis import analyze_budget
from modules.risk_engine import RiskAndAllocationEngine
from modules.stock_analysis import analyze_stock, DEFAULT_STOCKS

st.set_page_config(
    page_title="Smart Investment Strategy Advisor | VTU Major Project",
    page_icon="📈",
    layout="wide"
)

# Initialize Session State
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "user_info" not in st.session_state:
    st.session_state.user_info = None

# Custom CSS Styling
st.markdown("""
<style>
    .main-header { font-size: 2.2rem; font-weight: 700; color: #1E293B; margin-bottom: 0px; }
    .sub-header { font-size: 1rem; color: #64748B; margin-bottom: 20px; }
    .card { background-color: #FFFFFF; border-radius: 10px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 15px; }
    .metric-val { font-size: 1.8rem; font-weight: bold; color: #0F172A; }
    .alert-box { padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .alert-red { background-color: #FEF2F2; border-left: 5px solid #EF4444; color: #991B1B; }
    .alert-amber { background-color: #FFFBEB; border-left: 5px solid #F59E0B; color: #92400E; }
    .alert-green { background-color: #ECFDF5; border-left: 5px solid #10B981; color: #065F46; }
</style>
""", unsafe_allow_html=True)

# App Header
st.markdown('<p class="main-header">Smart Investment Strategy Advisor using AI</p>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Budget Analysis • Emergency Fund Guardrail • Risk Profiling • Stock Market Insights</p>', unsafe_allow_html=True)

# Sidebar - Step 1: User Authentication & Navigation
st.sidebar.title("🔐 User Authentication (Step 1)")

if not st.session_state.logged_in:
    auth_mode = st.sidebar.radio("Account Mode", ["Login", "Register"])
    
    if auth_mode == "Login":
        username = st.sidebar.text_input("Username or Email", "demo_user")
        password = st.sidebar.text_input("Password", "demo123", type="password")
        if st.sidebar.button("Login", use_container_width=True):
            # For demonstration, allow quick demo login
            if username == "demo_user" and password == "demo123":
                st.session_state.logged_in = True
                st.session_state.user_info = {"id": 1, "username": "demo_user", "full_name": "Demo ISE Student"}
                st.rerun()
            else:
                success, user_data, msg = authenticate_user(username, password)
                if success:
                    st.session_state.logged_in = True
                    st.session_state.user_info = user_data
                    st.rerun()
                else:
                    st.sidebar.error(msg)
    else: # Register
        new_user = st.sidebar.text_input("New Username")
        new_email = st.sidebar.text_input("Email")
        new_pwd = st.sidebar.text_input("New Password", type="password")
        full_name = st.sidebar.text_input("Full Name")
        if st.sidebar.button("Register Account", use_container_width=True):
            success, u_id, msg = register_user(new_user, new_email, new_pwd, full_name)
            if success:
                st.sidebar.success(msg + " You can now login.")
            else:
                st.sidebar.error(msg)

    st.info("👈 Please login or register on the sidebar to access your personalized financial dashboard.")
    st.stop()

# Logged in View
st.sidebar.success(f"Logged in as: **{st.session_state.user_info['username']}**")
if st.sidebar.button("Logout"):
    st.session_state.logged_in = False
    st.session_state.user_info = None
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.title("📌 Methodology Navigation")
selected_tab = st.sidebar.radio(
    "Jump to Workflow Step:",
    [
        "1. Budget Input & Analysis (Steps 2-4)",
        "2. Emergency Fund Check (Step 5)",
        "3. Risk & Asset Allocation (Steps 6-7)",
        "4. Stock Market Insights (Step 8)",
        "5. Interactive Dashboard (Step 9)",
        "6. Final Strategy & AI Report (Step 10)"
    ]
)

# Instantiate Engines
risk_engine = RiskAndAllocationEngine()

# Sidebar Budget Input Form (Steps 2 & 3)
st.sidebar.markdown("---")
st.sidebar.subheader("📝 Financial Inputs")

monthly_income = st.sidebar.number_input("Monthly Income ($ / ₹)", min_value=500.0, value=6500.0, step=500.0)
age = st.sidebar.number_input("User Age (Years)", min_value=18, max_value=85, value=28)
risk_pref = st.sidebar.selectbox("Stated Risk Preference", ["High", "Medium", "Low"], index=0)
current_liquid_savings = st.sidebar.number_input("Existing Emergency Reserve ($ / ₹)", min_value=0.0, value=8000.0, step=500.0)

st.sidebar.markdown("**Monthly Expenses Breakdown:**")
rent_food = st.sidebar.number_input("Housing & Utilities", value=1800.0)
groceries = st.sidebar.number_input("Food & Groceries", value=800.0)
transport = st.sidebar.number_input("Transport & Fuel", value=400.0)
health = st.sidebar.number_input("Healthcare & Insurance", value=300.0)
entertainment = st.sidebar.number_input("Entertainment & Misc", value=500.0)

expenses_dict = {
    "housing_utilities": rent_food,
    "food_groceries": groceries,
    "transportation": transport,
    "healthcare": health,
    "entertainment_misc": entertainment
}

# Run Core Analysis
budget_res = analyze_budget(monthly_income, expenses_dict, current_liquid_savings)
emergency_months_covered = current_liquid_savings / max(budget_res['total_expenses'], 1.0)
risk_res = risk_engine.evaluate_risk_profile(age, risk_pref, emergency_months_covered)
alloc_res = risk_engine.calculate_investment_allocation(risk_res['risk_category'], budget_res['investable_monthly_savings'])

# TAB 1: Budget Analysis (Steps 2 - 4)
if selected_tab.startswith("1."):
    st.header("Step 2 - 4: Personal Budget & Savings Calculation")
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Monthly Income", f"${budget_res['monthly_income']:,.2f}")
    col2.metric("Total Expenses", f"${budget_res['total_expenses']:,.2f}")
    col3.metric("Net Monthly Savings", f"${budget_res['monthly_savings']:,.2f}", f"{budget_res['savings_ratio']:.1f}% Savings Rate")
    col4.metric("Age & Risk Preference", f"{age} Yrs | {risk_pref}")

    st.markdown("### Expense Breakdown")
    fig_exp = px.pie(
        budget_res['expense_breakdown_df'], 
        values="Amount", 
        names="Category", 
        title="Monthly Expense Allocation",
        hole=0.4,
        color_discrete_sequence=px.colors.qualitative.Pastel
    )
    st.plotly_chart(fig_exp, use_container_width=True)

# TAB 2: Emergency Fund Check (Step 5)
elif selected_tab.startswith("2."):
    st.header("Step 5: Emergency Fund Adequacy Check")
    st.write("Financial Rule: An emergency fund must cover **3 to 6 months** of essential living costs before entering volatile equity markets.")

    col1, col2, col3 = st.columns(3)
    col1.metric("Current Emergency Reserve", f"${current_liquid_savings:,.2f}")
    col2.metric("Target (6 Months Expenses)", f"${budget_res['target_emergency_fund']:,.2f}")
    col3.metric("Months Covered", f"{emergency_months_covered:.1f} Months")

    if budget_res['status_color'] == "red":
        st.error(f"🚨 **{budget_res['emergency_fund_status']}**: {budget_res['emergency_advice']}")
    elif budget_res['status_color'] == "amber":
        st.warning(f"⚠️ **{budget_res['emergency_fund_status']}**: {budget_res['emergency_advice']}")
    else:
        st.success(f"✅ **{budget_res['emergency_fund_status']}**: {budget_res['emergency_advice']}")

    st.markdown("### Monthly Cashflow Routing Directive")
    routing_data = pd.DataFrame([
        {"Destination": "Emergency Fund Top-Up", "Amount": budget_res['emergency_fund_monthly_allocation']},
        {"Destination": "Net Investable Surplus", "Amount": budget_res['investable_monthly_savings']}
    ])
    fig_route = px.bar(routing_data, x="Destination", y="Amount", color="Destination", text_auto='.2f', title="Monthly Savings Deployment ($)")
    st.plotly_chart(fig_route, use_container_width=True)

# TAB 3: Risk & Asset Allocation (Steps 6 - 7)
elif selected_tab.startswith("3."):
    st.header("Steps 6 & 7: Risk Classification & Portfolio Asset Allocation")
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Step 6: Risk Classification Engine")
        st.markdown(f"**Evaluated Risk Profile:** `{risk_res['risk_category']}`")
        st.markdown(f"**Risk Score (0-100):** `{risk_res['risk_score']}`")
        st.markdown("**Engine Reasoning & Guardrails:**")
        for exp in risk_res['explanations']:
            st.write(f"• {exp}")

    with col2:
        st.subheader("Step 7: Recommended Asset Split")
        st.markdown(f"**Strategy:** `{alloc_res['strategy_title']}`")
        st.write(alloc_res['strategy_description'])

    st.markdown("### Portfolio Allocation Breakdown")
    alloc_df = pd.DataFrame(alloc_res['allocations'])
    fig_alloc = px.pie(
        alloc_df, 
        values="amount", 
        names="asset_class", 
        title=f"Monthly Investable Surplus (${budget_res['investable_monthly_savings']:,.2f}) Distribution",
        hole=0.45,
        color_discrete_sequence=[a['color'] for a in alloc_res['allocations']]
    )
    st.plotly_chart(fig_alloc, use_container_width=True)
    st.dataframe(alloc_df[['asset_class', 'percentage', 'amount', 'role']], use_container_width=True)

# TAB 4: Stock Market Insights (Step 8)
elif selected_tab.startswith("4."):
    st.header("Step 8: Stock Market Insights & Sentiment Analysis")
    
    selected_ticker = st.selectbox("Select Stock for AI Technical & Sentiment Evaluation:", [s['ticker'] for s in DEFAULT_STOCKS])
    stock_res = analyze_stock(selected_ticker)
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Current Price", f"${stock_res['current_price']:.2f}")
    col2.metric("20-Day SMA", f"${stock_res['sma_20']:.2f}")
    col3.metric("RSI (14-Day)", f"{stock_res['rsi']:.1f}")
    
    rec_badge = f":{stock_res['rec_color']}[**{stock_res['recommendation']}**]"
    col4.markdown(f"### Recommendation: {rec_badge}")

    st.info(f"**AI Rationale:** {stock_res['rationale']}")
    
    st.markdown("### Price Trend Chart")
    fig_stock = px.line(stock_res['history_df'], x="Date", y="Close", title=f"{stock_res['ticker']} Historical Close Price")
    st.plotly_chart(fig_stock, use_container_width=True)

# TAB 5: Interactive Dashboard (Step 9)
elif selected_tab.startswith("5."):
    st.header("Step 9: Master Financial & Portfolio Dashboard")
    
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Total Monthly Income", f"${budget_res['monthly_income']:,.2f}")
    m2.metric("Monthly Savings", f"${budget_res['monthly_savings']:,.2f}")
    m3.metric("Emergency Reserve", f"${current_liquid_savings:,.2f}")
    m4.metric("Risk Profile", risk_res['risk_category'])

    col_a, col_b = st.columns(2)
    with col_a:
        st.plotly_chart(px.pie(budget_res['expense_breakdown_df'], values="Amount", names="Category", title="Expenses Breakdown"), use_container_width=True)
    with col_b:
        st.plotly_chart(px.pie(pd.DataFrame(alloc_res['allocations']), values="amount", names="asset_class", title="Investment Allocation"), use_container_width=True)

# TAB 6: Final Strategy & AI Report (Step 10)
elif selected_tab.startswith("6."):
    st.header("Step 10: Final Recommendation Summary & Project Report")
    
    st.success("### 📋 Executive Financial Strategy Blueprint")
    st.write(f"**Client Profile:** {st.session_state.user_info['username']} | Age: {age} | Risk Category: **{risk_res['risk_category']}**")
    
    st.markdown(f"""
    #### 1. Emergency Fund Directive
    * **Status:** {budget_res['emergency_fund_status']}
    * **Action:** Direct **${budget_res['emergency_fund_monthly_allocation']:,.2f}** per month into high-yield liquid savings until target of **${budget_res['target_emergency_fund']:,.2f}** is achieved.

    #### 2. Net Monthly Investment Deployment (${budget_res['investable_monthly_savings']:,.2f})
    """)
    
    for item in alloc_res['allocations']:
        st.write(f"• **{item['asset_class']} ({item['percentage']:.0f}%):** ${item['amount']:,.2f} — *{item['role']}*")

    st.markdown("""
    #### 3. Core Investment Guidance
    * **Stocks:** Focus on top-tier index ETFs and large-cap leaders identified in Step 8.
    * **Mutual Funds:** Set up automated monthly SIPs (Systematic Investment Plans) in low-cost index funds.
    * **Gold:** Allocate via Sovereign Gold Bonds or Gold ETFs for inflation protection.
    * **Fixed Deposits:** Maintain capital safety in AAA-rated fixed income instruments.
    """)
    
    st.button("📄 Export Project Report Summary", type="primary")
