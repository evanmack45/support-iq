import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TranscriptSegment } from '../types';

interface SentimentGraphProps {
  transcript: TranscriptSegment[];
}

const SentimentGraph: React.FC<SentimentGraphProps> = ({ transcript }) => {
  // Transform transcript data for the chart
  // We split the scores into agentScore and customerScore to plot two distinct lines
  const data = transcript.map((segment, index) => ({
    name: `Turn ${index + 1}`,
    agentScore: segment.speaker === 'Agent' ? segment.sentimentScore : null,
    customerScore: segment.speaker === 'Customer' ? segment.sentimentScore : null,
    speaker: segment.speaker,
    score: segment.sentimentScore,
    text: segment.text.length > 60 ? segment.text.substring(0, 60) + '...' : segment.text,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // payload[0].payload gives the full data object for this index
      const dataPoint = payload[0].payload;
      const isAgent = dataPoint.speaker === 'Agent';
      
      return (
        <div className="bg-slate-800 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 max-w-[250px] z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-400">{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isAgent ? 'bg-indigo-900 text-indigo-200' : 'bg-emerald-900 text-emerald-200'
            }`}>
              {dataPoint.speaker}
            </span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-slate-400">Score:</span>
            <span className={`font-bold text-lg ${
               dataPoint.score >= 7 ? 'text-green-400' : 
               dataPoint.score <= 4 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {dataPoint.score}
            </span>
            <span className="text-slate-500 text-[10px]">/10</span>
          </div>
          
          <div className="border-t border-slate-700 pt-2 mt-1">
             <p className="italic text-slate-300 leading-snug">"{dataPoint.text}"</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="sentiment-graph-export" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h3 className="font-semibold text-slate-800">Engagement Flow</h3>
          <p className="text-xs text-slate-500">Sentiment tracking by speaker</p>
        </div>
        
        {/* Custom Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
            <span className="text-slate-600 font-medium">Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600 font-medium">Customer</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="name" 
                hide={true} 
            />
            <YAxis 
                domain={[0, 10]} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Agent Area */}
            <Area 
                type="monotone" 
                dataKey="agentScore" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAgent)" 
                connectNulls={true}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }}
            />

            {/* Customer Area */}
            <Area 
                type="monotone" 
                dataKey="customerScore" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCustomer)" 
                connectNulls={true}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentGraph;