# Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
## Major Project Phase I | BE Information Science and Engineering | VTU Belagavi (2025-2026)

---

### 📌 Project Overview
The **Smart Investment Strategy Advisor** is an end-to-end AI-driven personal finance platform designed to bridge the gap between personal budget management, emergency risk guardrails, risk-profiled asset allocation, and stock market trend analysis. 

Unlike conventional tools that analyze expenses or stock charts in isolation, this system unifies personal expense tracking with real-time stock technicals, sentiment analysis, and intelligent portfolio recommendation engines into **ONE seamless pipeline**.

---

### 🏗️ Modular Architecture & Methodology Mapping

The project follows a strict **10-Step Workflow**:

| Step | Workflow Stage | Module File | Description |
|---|---|---|---|
| **Step 1** | User Authentication | `modules/database.py` | Secure SQLite registration, SHA-256 login & session persistence per user. |
| **Step 2** | Data Collection | `modules/database.py` & `app.py` | Captures Income, Age, and Stated Risk Preference (Low, Medium, High). |
| **Step 3** | Expense Analysis | `modules/budget_analysis.py` | Categorizes and calculates total monthly expenditure (Rent, Food, Transport, etc.). |
| **Step 4** | Savings Calculation | `modules/budget_analysis.py` | Computes Net Monthly Savings (`Savings = Income - Expenses`) and Savings Ratio. |
| **Step 5** | Emergency Fund Check | `modules/budget_analysis.py` | **Mandatory Guardrail:** Verifies 3-6 months liquid reserves; redirects savings if deficient. |
| **Step 6** | Risk Analysis Engine | `modules/risk_engine.py` | Combines Age, Stated Preference & Emergency Cover using Scikit-Learn Decision Tree. |
| **Step 7** | Investment Allocation | `modules/risk_engine.py` | Splits investable surplus across Stocks, Mutual Funds, Gold, and Fixed Deposits. |
| **Step 8** | Stock Market Analysis | `modules/stock_analysis.py` | Computes 20-SMA, 50-SMA, RSI, TextBlob news sentiment, and output Buy/Sell/Hold. |
| **Step 9** | Master Visualization | `app.py` | Renders interactive Plotly charts, expense pie charts, and portfolio breakdown. |
| **Step 10**| Final Strategy Report | `app.py` & Gemini API | Generates plain-language personalized recommendation report and PDF export summary. |

---

### 📂 Directory Structure

```text
python_project/
├── app.py                      # Main Streamlit Dashboard Entry Point
├── requirements.txt            # Project Dependencies (Streamlit, Pandas, Plotly, yfinance, etc.)
├── README.md                   # VTU ISE Major Project Documentation
└── modules/
    ├── __init__.py
    ├── database.py             # Step 1: User Auth & SQLite Database Handler
    ├── budget_analysis.py      # Steps 2-5: Income, Expense, Savings & Emergency Fund Check
    ├── risk_engine.py          # Steps 6-7: ML Risk Classifier & Asset Allocation Model
    └── stock_analysis.py       # Step 8: Stock Technicals (SMA, RSI) & Sentiment Analyzer
```

---

### 🚀 Quickstart & Execution Guide

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Streamlit Dashboard:**
   ```bash
   streamlit run app.py
   ```

3. **Access Dashboard:**
   Open your browser at `http://localhost:8501`.

---

### 🎓 Academic Credits & Details
* **Project Title:** Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
* **Branch:** Department of Information Science and Engineering (ISE)
* **University:** Visvesvaraya Technological University (VTU), Belagavi
* **Academic Session:** 2025-2026
