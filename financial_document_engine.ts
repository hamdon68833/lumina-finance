export interface ExtractedFieldDetail {
  field: string;
  label: string;
  value: number | string | null;
  confidence: number;
  source: string;
  evidence: string;
  status: "DETECTED" | "NOT_DETECTED" | "REQUIRES_VERIFICATION";
}

export interface ExtractedDocumentData {
  documentType: "LOAN_STATEMENT" | "MUTUAL_FUND_STATEMENT" | "EXPENSE_STATEMENT" | "PAYSLIP" | "BANK_STATEMENT";
  issuerName: string;
  statementDate?: string;
  extractedFields: {
    monthlyIncome?: ExtractedFieldDetail;
    monthlyExpenses?: ExtractedFieldDetail;
    accountBalance?: ExtractedFieldDetail;
    emiAmount?: ExtractedFieldDetail;
    loanBalance?: ExtractedFieldDetail;
  };
  overallConfidence: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING_USER_CONFIRMATION" | "CONFIRMED" | "REJECTED";
  processedAt: string;
}

export class FinancialDocumentEngine {
  public static extractDocument(fileName: string, fileTextContent: string = ""): ExtractedDocumentData {
    const text = (fileTextContent || fileName || "").toString();

    // 1. Determine Document Type
    let documentType: ExtractedDocumentData["documentType"] = "BANK_STATEMENT";
    if (/payslip|salary|pay slip|earnings|form 16/i.test(text)) {
      documentType = "PAYSLIP";
    } else if (/loan|mortgage|emi statement|home loan|car loan/i.test(text)) {
      documentType = "LOAN_STATEMENT";
    } else if (/mutual fund|folio|cas statement|cams|karvy|sip|nav/i.test(text)) {
      documentType = "MUTUAL_FUND_STATEMENT";
    } else if (/expense|spends|credit card|statement|passbook/i.test(text)) {
      documentType = "EXPENSE_STATEMENT";
    }

    // 2. Extract Fields via Exact Text Patterns
    const currPrefix = `(?:[₹\\$]|Rs\\.|Rs|INR)?\\s*`;
    const incomeMatch = text.match(new RegExp(`(?:net pay|net salary|total earnings|salary|take home|gross pay)[:\\s\\w]*${currPrefix}([\\d,]+(?:\\.\\d{2})?)`, 'i'));
    const expenseMatch = text.match(new RegExp(`(?:total debits|total expenses|total spends|monthly spends|withdrawals)[:\\s\\w]*${currPrefix}([\\d,]+(?:\\.\\d{2})?)`, 'i'));
    const balanceMatch = text.match(new RegExp(`(?:account balance|avail bal|available balance|closing balance|net balance|current balance|bal c\\/f)[:\\s\\w]*${currPrefix}([\\d,]+(?:\\.\\d{2})?)`, 'i'));
    const emiMatch = text.match(new RegExp(`(?:emi amount|monthly emi|loan emi|installment amount)[:\\s\\w]*${currPrefix}([\\d,]+(?:\\.\\d{2})?)`, 'i'));
    const loanBalMatch = text.match(new RegExp(`(?:outstanding principal|loan balance|remaining principal|principal amount)[:\\s\\w]*${currPrefix}([\\d,]+(?:\\.\\d{2})?)`, 'i'));

    function parseVal(match: RegExpMatchArray | null): number | null {
      if (!match || !match[1]) return null;
      const num = parseFloat(match[1].replace(/,/g, ""));
      return isNaN(num) ? null : num;
    }

    const monthlyIncomeVal = parseVal(incomeMatch);
    const monthlyExpensesVal = parseVal(expenseMatch);
    const accountBalanceVal = parseVal(balanceMatch);
    const emiAmountVal = parseVal(emiMatch);
    const loanBalanceVal = parseVal(loanBalMatch);

    // 3. Issuer Name Extraction
    let issuerName = "Financial Document";
    if (/hdfc/i.test(text)) issuerName = "HDFC Bank Statement";
    else if (/icici/i.test(text)) issuerName = "ICICI Bank Statement";
    else if (/sbi|state bank/i.test(text)) issuerName = "SBI Statement";
    else if (/axis/i.test(text)) issuerName = "Axis Bank Statement";
    else if (/cams|kfintech/i.test(text)) issuerName = "CAMS Mutual Fund Statement";
    else issuerName = `${fileName} Document`;

    const extractedFields: ExtractedDocumentData["extractedFields"] = {};

    // Income Field Detail
    if (monthlyIncomeVal !== null) {
      extractedFields.monthlyIncome = {
        field: "monthlyIncome",
        label: "Monthly Net Income",
        value: monthlyIncomeVal,
        confidence: 0.95,
        source: "Document Text Search",
        evidence: incomeMatch?.[0] || `Extracted ₹${monthlyIncomeVal}`,
        status: "DETECTED"
      };
    } else {
      extractedFields.monthlyIncome = {
        field: "monthlyIncome",
        label: "Monthly Net Income",
        value: null,
        confidence: 0,
        source: "Document Text Search",
        evidence: "Not present in uploaded document text",
        status: "NOT_DETECTED"
      };
    }

    // Expense Field Detail
    if (monthlyExpensesVal !== null) {
      extractedFields.monthlyExpenses = {
        field: "monthlyExpenses",
        label: "Monthly Expenses",
        value: monthlyExpensesVal,
        confidence: 0.92,
        source: "Document Text Search",
        evidence: expenseMatch?.[0] || `Extracted ₹${monthlyExpensesVal}`,
        status: "DETECTED"
      };
    } else {
      extractedFields.monthlyExpenses = {
        field: "monthlyExpenses",
        label: "Monthly Expenses",
        value: null,
        confidence: 0,
        source: "Document Text Search",
        evidence: "Not present in uploaded document text",
        status: "NOT_DETECTED"
      };
    }

    // Account Balance Field Detail (STRICT ZERO FAKE NUMBERS)
    if (accountBalanceVal !== null) {
      extractedFields.accountBalance = {
        field: "accountBalance",
        label: "Account Balance / Liquid Reserve",
        value: accountBalanceVal,
        confidence: 0.96,
        source: "Document Balance Search",
        evidence: balanceMatch?.[0] || `Extracted ₹${accountBalanceVal}`,
        status: "DETECTED"
      };
    } else {
      extractedFields.accountBalance = {
        field: "accountBalance",
        label: "Account Balance / Liquid Reserve",
        value: null,
        confidence: 0,
        source: "Document Balance Search",
        evidence: "No account balance found in uploaded document",
        status: "NOT_DETECTED"
      };
    }

    // EMI Amount
    if (emiAmountVal !== null) {
      extractedFields.emiAmount = {
        field: "emiAmount",
        label: "Monthly EMI Payment",
        value: emiAmountVal,
        confidence: 0.94,
        source: "Document Loan Search",
        evidence: emiMatch?.[0] || `Extracted ₹${emiAmountVal}`,
        status: "DETECTED"
      };
    } else {
      extractedFields.emiAmount = {
        field: "emiAmount",
        label: "Monthly EMI Payment",
        value: null,
        confidence: 0,
        source: "Document Loan Search",
        evidence: "Not present in uploaded document text",
        status: "NOT_DETECTED"
      };
    }

    // Loan Balance
    if (loanBalanceVal !== null) {
      extractedFields.loanBalance = {
        field: "loanBalance",
        label: "Outstanding Loan Balance",
        value: loanBalanceVal,
        confidence: 0.93,
        source: "Document Loan Search",
        evidence: loanBalMatch?.[0] || `Extracted ₹${loanBalanceVal}`,
        status: "DETECTED"
      };
    } else {
      extractedFields.loanBalance = {
        field: "loanBalance",
        label: "Outstanding Loan Balance",
        value: null,
        confidence: 0,
        source: "Document Loan Search",
        evidence: "Not present in uploaded document text",
        status: "NOT_DETECTED"
      };
    }

    const detectedCount = Object.values(extractedFields).filter(f => f?.status === "DETECTED").length;
    const overallConfidence = detectedCount >= 2 ? "HIGH" : (detectedCount === 1 ? "MEDIUM" : "LOW");

    return {
      documentType,
      issuerName,
      statementDate: new Date().toISOString().split("T")[0],
      extractedFields,
      overallConfidence,
      status: "PENDING_USER_CONFIRMATION",
      processedAt: new Date().toISOString()
    };
  }

  public static applyConfirmedData(extracted: ExtractedDocumentData, currentProfile: any): any {
    if (extracted.status !== "CONFIRMED") {
      throw new Error("Document data cannot be applied until explicitly confirmed by user.");
    }
    const fields = extracted.extractedFields;
    const updated = { ...currentProfile };

    if (fields.monthlyIncome?.status === "DETECTED" && typeof fields.monthlyIncome.value === "number") {
      updated.monthlyIncome = fields.monthlyIncome.value;
    }
    if (fields.monthlyExpenses?.status === "DETECTED" && typeof fields.monthlyExpenses.value === "number") {
      updated.monthlyExpenses = fields.monthlyExpenses.value;
    }
    if (fields.accountBalance?.status === "DETECTED" && typeof fields.accountBalance.value === "number") {
      updated.savings = fields.accountBalance.value;
    }
    if (fields.emiAmount?.status === "DETECTED" && typeof fields.emiAmount.value === "number") {
      updated.monthlyDebtPayments = fields.emiAmount.value;
    }

    return updated;
  }
}
