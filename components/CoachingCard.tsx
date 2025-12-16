import React from 'react';
import { CoachingInsights } from '../types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface CoachingCardProps {
  coaching: CoachingInsights;
  overallScore: number;
}

const CoachingCard: React.FC<CoachingCardProps> = ({ coaching, overallScore }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            <h3 className="font-semibold text-slate-800">AI Coaching Insights</h3>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Score</span>
            <span className={`text-lg font-bold ${
                overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
                {overallScore}
            </span>
        </div>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Summary</h4>
            <p className="text-sm text-indigo-900 leading-relaxed">{coaching.summary}</p>
        </div>

        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-3">
            <CheckCircle2 size={18} />
            What Went Well
          </h4>
          <ul className="space-y-3">
            {coaching.strengths.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 bg-green-50/50 p-3 rounded-lg border border-green-100/50">
                <span className="font-bold text-green-600">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
            <AlertCircle size={18} />
            Missed Opportunities
          </h4>
          <ul className="space-y-3">
            {coaching.missedOpportunities.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                <span className="font-bold text-amber-600">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoachingCard;
