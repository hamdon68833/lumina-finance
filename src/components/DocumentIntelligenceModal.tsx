import React, { useState } from 'react';
import { FileText, X, Check, AlertCircle, Upload, ShieldCheck, Edit3, RotateCcw } from 'lucide-react';
import { FinancialDocumentEngine, ExtractedDocumentData, ExtractedFieldDetail } from '../../financial_document_engine';
import { formatINR } from '../utils/formatters';

interface DocumentIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmProfileData: (data: any) => void;
}

export const DocumentIntelligenceModal: React.FC<DocumentIntelligenceModalProps> = ({
  isOpen,
  onClose,
  onConfirmProfileData
}) => {
  const [extracted, setExtracted] = useState<ExtractedDocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [editFields, setEditFields] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProcessingStage('Uploading document...');

    const reader = new FileReader();

    reader.onload = (event) => {
      setProcessingStage('Analyzing document text & OCR patterns...');
      const fileText = event.target?.result as string || '';

      setTimeout(() => {
        setProcessingStage('Extracting financial fields & evidence snippets...');
        setTimeout(() => {
          const result = FinancialDocumentEngine.extractDocument(file.name, fileText);
          setExtracted(result);

          // Populate initial edit fields with detected values
          const initialEdits: Record<string, number> = {};
          Object.entries(result.extractedFields).forEach(([key, detail]) => {
            if (detail?.status === 'DETECTED' && typeof detail.value === 'number') {
              initialEdits[key] = detail.value;
            }
          });
          setEditFields(initialEdits);

          setLoading(false);
          setProcessingStage('');
        }, 500);
      }, 500);
    };

    reader.onerror = () => {
      setLoading(false);
      setProcessingStage('');
      alert('Failed to read file.');
    };

    reader.readAsText(file);
  };

  const handleFieldEditChange = (key: string, val: string) => {
    const num = parseFloat(val) || 0;
    setEditFields(prev => ({ ...prev, [key]: num }));
  };

  const handleConfirmAndApply = () => {
    if (!extracted) return;

    // Package confirmed data
    const confirmedData = {
      documentType: extracted.documentType,
      issuerName: extracted.issuerName,
      monthlyIncome: editFields['monthlyIncome'] ?? extracted.extractedFields.monthlyIncome?.value ?? null,
      accountBalance: editFields['accountBalance'] ?? extracted.extractedFields.accountBalance?.value ?? null,
      monthlyEMI: editFields['monthlyEMI'] ?? extracted.extractedFields.monthlyEMI?.value ?? null,
      portfolioValue: editFields['portfolioValue'] ?? extracted.extractedFields.portfolioValue?.value ?? null
    };

    onConfirmProfileData(confirmedData);
    onClose();
  };

  const handleReject = () => {
    setExtracted(null);
    setEditFields({});
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Intelligence OCR Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic Document Data Extraction & Profile Provenance</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State 1: Upload Prompt */}
        {!extracted && !loading && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950/40">
            <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Upload Financial Document</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Upload your bank statement, payslip, loan schedule, or mutual fund statement text.
              </p>
            </div>

            <div className="pt-2">
              <input type="file" onChange={handleUpload} className="hidden" id="docUploadInput" accept=".txt,.csv,.pdf,.png,.jpg,.jpeg" />
              <label htmlFor="docUploadInput" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-950/40 transition">
                <FileText className="w-4 h-4" />
                Select Financial Statement
              </label>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-center gap-4 pt-2">
              <span>• Zero Hardcoded Defaults</span>
              <span>• Mandatory User Confirmation</span>
              <span>• Source Evidence</span>
            </div>
          </div>
        )}

        {/* State 2: Processing Progress */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">{processingStage}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inspecting document text & validating fields against financial patterns...</p>
            </div>
          </div>
        )}

        {/* State 3: Extracted Document Results & Verification UI */}
        {extracted && !loading && (
          <div className="space-y-5">
            
            {/* Header Document Summary Card */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">{extracted.documentType.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Confidence: {extracted.overallConfidence}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{extracted.issuerName}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800/50 font-bold block">
                  Mandatory User Confirmation
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 block">Extracted: {extracted.statementDate}</span>
              </div>
            </div>

            {/* Field Extraction Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>Extracted Financial Field</span>
                <span>Source Evidence & Verification Status</span>
              </div>

              <div className="space-y-2.5">
                {Object.entries(extracted.extractedFields).map(([key, rawDetail]) => {
                  const detail = rawDetail as ExtractedFieldDetail | undefined;
                  if (!detail) return null;
                  const isDetected = detail.status === 'DETECTED';

                  return (
                    <div
                      key={key}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isDetected
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-200'
                          : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{detail.label}</span>
                          {isDetected ? (
                            isEditing ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={editFields[key] ?? 0}
                                  onChange={(e) => handleFieldEditChange(key, e.target.value)}
                                  className="w-32 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white px-2 py-1 rounded focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                                {formatINR(editFields[key] ?? (Number(detail.value) || 0))}
                              </span>
                            )
                          ) : (
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-500/90 italic mt-0.5 block">
                              Not detected
                            </span>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border inline-block ${
                              isDetected
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {detail.status} {detail.confidence > 0 ? `(${detail.confidence}%)` : ''}
                          </span>
                          {detail.evidence && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic max-w-xs truncate">
                              "{detail.evidence}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Done Editing' : 'Edit Fields'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reject & Re-upload
                </button>

                <button
                  onClick={handleConfirmAndApply}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm & Apply To Profile
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
