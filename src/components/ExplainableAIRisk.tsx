import React, { useState, useEffect } from 'react';
import { Brain, ShieldAlert, Cpu, Sparkles, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FeatureAttribution {
  feature: string;
  val: string;
  impact: number;
  direction: 'positive' | 'negative';
}

interface MLRiskResponse {
  riskScore: number;
  riskCategory: string;
  mlModelType: string;
  guardrailApplied: boolean;
  probabilities: { Low: number; Medium: number; High: number };
  featureAttributions: FeatureAttribution[];
  globalFeatureImportance: { feature: string; importance: number }[];
  academicNotice: string;
}

interface ExplainableAIRiskProps {
  userProfile: { age: number; income: number; expenses: number; currentLiquidReserve: number; statedPreference: string };
}

export const ExplainableAIRisk: React.FC<ExplainableAIRiskProps> = ({ userProfile }) => {
  const [data, setData] = useState<MLRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/risk/ml-evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile)
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ML risk evaluation:', err);
        setLoading(false);
      });
  }, [userProfile]);

  if (loading || !data) {
    return (
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 text-center text-slate-400">
        <Cpu className="w-8 h-8 mx-auto animate-spin text-blue-400 mb-2" />
        Loading Explainable ML Risk Classifier Model...
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-rose-400';
    if (score >= 45) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Explainable AI (XAI) Risk Model</h2>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Random Forest ML
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{data.mlModelType}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-right">
          <div className="text-xs text-slate-400">Predicted ML Risk Score</div>
          <div className={`text-2xl font-black ${getScoreColor(data.riskScore)}`}>
            {data.riskScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
          </div>
        </div>
      </div>

      {/* Safety Guardrail Notice */}
      {data.guardrailApplied && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Financial Guardrail Override Applied:</strong> High ML risk profile capped to <strong>Medium</strong> due to liquid emergency reserves covering &lt; 3.0 months of expenses.
          </div>
        </div>
      )}

      {/* SHAP-style Feature Impact Attributions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Why did Lumina calculate this risk score? (Feature Attributions)
          </h3>
          <span className="text-xs text-slate-400">SHAP-style Feature Impact</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.featureAttributions.map((attr, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 font-medium">{attr.feature}</div>
                <div className="text-xs text-slate-500">Value: <span className="text-white font-semibold">{attr.val}</span></div>
              </div>
              <div className={`text-sm font-bold px-2.5 py-1 rounded-lg ${attr.direction === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {attr.impact >= 0 ? `+${attr.impact}` : attr.impact} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Global Model Feature Importance Weights</h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.globalFeatureImportance} layout="vertical" margin={{ left: 40, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 0.3]} />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {data.globalFeatureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#8B5CF6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Academic Disclosure Banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>{data.academicNotice} Model accurately separates machine learning risk prediction from rule-based safety guardrails.</span>
      </div>
    </div>
  );
};
