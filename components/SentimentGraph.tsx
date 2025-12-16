import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TranscriptSegment } from '../types';

interface SentimentGraphProps {
  transcript: TranscriptSegment[];
}

const SentimentGraph: React.FC<SentimentGraphProps> = ({ transcript }) => {
  // Transform transcript data for the chart
  const data = transcript.map((segment, index) => ({
    name: `Turn ${index + 1}`,
    score: segment.sentimentScore,
    speaker: segment.speaker,
    text: segment.text.substring(0, 30) + '...',
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg border border-slate-700">
          <p className="font-semibold">{label}</p>
          <p className="text-slate-300">{dataPoint.speaker}</p>
          <p className="text-emerald-400">Score: {dataPoint.score}</p>
          <p className="italic text-slate-400 mt-1 max-w-[200px] truncate">{dataPoint.text}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800">Engagement & Sentiment Flow</h3>
        <p className="text-xs text-slate-500">Tracking emotional tone throughout the conversation</p>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
            <Tooltip content={<CustomTooltip />} />
            <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentGraph;
