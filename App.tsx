import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeAudio } from './services/geminiService';
import FileUpload from './components/FileUpload';
import TranscriptView from './components/TranscriptView';
import SentimentGraph from './components/SentimentGraph';
import CoachingCard from './components/CoachingCard';
import { Activity, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const result = await analyzeAudio(base64Data, file.type);
          setAnalysisResult(result);
          setAppState(AppState.RESULTS);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to analyze audio.");
            setAppState(AppState.ERROR);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setAppState(AppState.ERROR);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setError("An unexpected error occurred.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">SupportIQ</h1>
          </div>
          {appState === AppState.RESULTS && (
             <button 
                onClick={resetApp}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
             >
                <RefreshCw size={16} />
                Analyze New Call
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {appState === AppState.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
             <span>{error || "An error occurred during analysis."}</span>
             <button onClick={resetApp} className="text-sm underline font-medium">Try Again</button>
          </div>
        )}

        {(appState === AppState.IDLE || appState === AppState.ANALYZING) && (
          <div className="flex flex-col justify-center min-h-[60vh]">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Support Coaching Intelligence</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Upload a support call recording to get instant diarized transcripts, sentiment analysis, and AI-powered coaching insights.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isAnalyzing={appState === AppState.ANALYZING} />
          </div>
        )}

        {appState === AppState.RESULTS && analysisResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
            
            {/* Left Column: Transcript (4 cols) */}
            <div className="lg:col-span-5 h-full min-h-[500px]">
              <TranscriptView transcript={analysisResult.transcript} />
            </div>

            {/* Right Column: Analytics (8 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6 h-full min-h-[500px]">
              
              {/* Top Row: Sentiment Graph */}
              <div className="h-1/3 min-h-[250px]">
                <SentimentGraph transcript={analysisResult.transcript} />
              </div>

              {/* Bottom Row: Coaching Card */}
              <div className="flex-1 min-h-[300px]">
                <CoachingCard 
                    coaching={analysisResult.coaching} 
                    overallScore={analysisResult.overallEngagementScore} 
                />
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
