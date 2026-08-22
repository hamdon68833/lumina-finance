"""
PROJECT TITLE: Smart Investment Strategy Advisor using AI with Budget Analysis and Stock Insights
MODULE: database.py (Step 1: User Authentication & Data Persistence)
ACADEMIC YEAR: 2025-2026 | Major Project Phase I (BE ISE, VTU Belagavi)
"""

import sqlite3
import hashlib
import json
import os

DB_NAME = "finance_advisor.db"

def init_db():
    """Initializes the SQLite database schema for users, budget profiles, and stock watchlists."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Step 1: Users table for Authentication
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Steps 2-7: Financial Profile & Budget Data per User
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS financial_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            monthly_income REAL NOT NULL,
            age INTEGER NOT NULL,
            risk_preference TEXT NOT NULL,
            current_liquid_savings REAL DEFAULT 0,
            expenses_json TEXT NOT NULL,
            emergency_fund_months INTEGER DEFAULT 6,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    # Step 8: Saved Stock Analysis Watchlist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stock_watchlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            ticker TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    """Hashes passwords using SHA-256 for basic authentication."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def register_user(username, email, password, full_name=""):
    """Step 1: User Registration"""
    init_db()
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
            (username, email, pwd_hash, full_name)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return True, user_id, "Registration successful!"
    except sqlite3.IntegrityError:
        conn.close()
        return False, None, "Username or Email already exists."

def authenticate_user(username_or_email, password):
    """Step 1: User Login Verification"""
    init_db()
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    pwd_hash = hash_password(password)
    cursor.execute(
        "SELECT id, username, email, full_name FROM users WHERE (username=? OR email=?) AND password_hash=?",
        (username_or_email, username_or_email, pwd_hash)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return True, {"id": row[0], "username": row[1], "email": row[2], "full_name": row[3]}, "Login successful!"
    return False, None, "Invalid username/email or password."

def save_financial_profile(user_id, monthly_income, age, risk_preference, current_liquid_savings, expenses_dict, emergency_fund_months=6):
    """Saves or updates user's financial profile and budget breakdown."""
    init_db()
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    expenses_json = json.dumps(expenses_dict)
    
    cursor.execute('''
        INSERT INTO financial_profiles 
            (user_id, monthly_income, age, risk_preference, current_liquid_savings, expenses_json, emergency_fund_months, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
            monthly_income=excluded.monthly_income,
            age=excluded.age,
            risk_preference=excluded.risk_preference,
            current_liquid_savings=excluded.current_liquid_savings,
            expenses_json=excluded.expenses_json,
            emergency_fund_months=excluded.emergency_fund_months,
            updated_at=CURRENT_TIMESTAMP
    ''', (user_id, monthly_income, age, risk_preference, current_liquid_savings, expenses_json, emergency_fund_months))
    
    conn.commit()
    conn.close()
    return True

def get_financial_profile(user_id):
    """Retrieves user financial profile."""
    init_db()
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT monthly_income, age, risk_preference, current_liquid_savings, expenses_json, emergency_fund_months FROM financial_profiles WHERE user_id=?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "monthly_income": row[0],
            "age": row[1],
            "risk_preference": row[2],
            "current_liquid_savings": row[3],
            "expenses": json.loads(row[4]),
            "emergency_fund_months": row[5]
        }
    return None
