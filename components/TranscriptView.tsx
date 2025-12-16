import React from 'react';
import { TranscriptSegment } from '../types';
import { User, Headphones } from 'lucide-react';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Diarized Transcript</h3>
        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{transcript.length} turns</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {transcript.map((segment, index) => {
          const isAgent = segment.speaker === 'Agent';
          return (
            <div
              key={index}
              className={`flex gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isAgent ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {isAgent ? <Headphones size={16} /> : <User size={16} />}
              </div>
              <div className={`flex flex-col max-w-[80%] ${isAgent ? 'items-start' : 'items-end'}`}>
                <span className="text-xs text-slate-400 mb-1">{segment.speaker}</span>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  isAgent 
                    ? 'bg-indigo-50 text-slate-700 rounded-tl-none' 
                    : 'bg-emerald-50 text-slate-700 rounded-tr-none'
                }`}>
                  {segment.text}
                </div>
                <div className="flex items-center gap-1 mt-1">
                   {/* Sentiment dot */}
                   <div 
                      className={`w-2 h-2 rounded-full ${
                        segment.sentimentScore >= 7 ? 'bg-green-400' : 
                        segment.sentimentScore <= 4 ? 'bg-red-400' : 'bg-yellow-400'
                      }`} 
                   />
                   <span className="text-[10px] text-slate-400">Sentiment: {segment.sentimentScore}/10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptView;
