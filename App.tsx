import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeAudio } from './services/geminiService';
import FileUpload from './components/FileUpload';
import TranscriptView from './components/TranscriptView';
import SentimentGraph from './components/SentimentGraph';
import CoachingCard from './components/CoachingCard';
import { Activity, RefreshCw, FileText, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  const downloadTranscript = () => {
    if (!analysisResult) return;
    
    const content = analysisResult.transcript.map(t => 
      `[${t.speaker}] (${t.sentimentScore}/10): ${t.text}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'support-call-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    if (!analysisResult) return;
    const doc = new jsPDF();
    const { coaching, overallEngagementScore, transcript } = analysisResult;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("SupportIQ Coaching Insights", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Overall Engagement Score: ${overallEngagementScore}/100`, 20, 30);
    
    let y = 45;
    const margin = 20;
    const maxWidth = 170;
    const lineHeight = 6;
    
    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", margin, y);
    y += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    const summaryLines = doc.splitTextToSize(coaching.summary, maxWidth);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * lineHeight) + 10;
    
    // Strengths
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Green 600
    doc.text("What Went Well", margin, y);
    y += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    coaching.strengths.forEach((point, i) => {
       const text = `${i + 1}. ${point}`;
       const lines = doc.splitTextToSize(text, maxWidth);
       doc.text(lines, margin, y);
       y += (lines.length * lineHeight) + 4;
    });
    y += 6;
    
    // Missed Opportunities
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text("Missed Opportunities", margin, y);
    y += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    coaching.missedOpportunities.forEach((point, i) => {
       const text = `${i + 1}. ${point}`;
       const lines = doc.splitTextToSize(text, maxWidth);
       doc.text(lines, margin, y);
       y += (lines.length * lineHeight) + 4;
    });
    y += 10;

    // Capture and embed Sentiment Graph
    const graphElement = document.getElementById('sentiment-graph-export');
    if (graphElement) {
        try {
            const canvas = await html2canvas(graphElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            // Calc dimensions to fit page width (A4 width 210mm, margins 20mm => 170mm)
            const imgWidth = 170; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Check if we need a new page for the graph
            if (y + imgHeight > 280) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.text("Sentiment Analysis", margin, y);
            y += 8;
            
            doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 10;
        } catch (e) {
            console.error("Graph capture failed", e);
        }
    }

    // Transcript Section
    doc.addPage();
    y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Detailed Transcript", margin, y);
    y += 15;

    doc.setFontSize(10);

    transcript.forEach(t => {
       const isAgent = t.speaker === 'Agent';
       // Approximate height calculation for page break check
       // Basic check: 5 (header) + estimated text height + 5 (gap)
       const estimatedTextHeight = (t.text.length / 90) * 5; 
       
       if (y + 10 + estimatedTextHeight > 280) {
           doc.addPage();
           y = 20;
       }
       
       // Speaker Header & Sentiment
       doc.setFont("helvetica", "bold");
       if (isAgent) {
           doc.setTextColor(79, 70, 229); // Indigo
       } else {
           doc.setTextColor(16, 185, 129); // Emerald
       }
       
       doc.text(`${t.speaker} (Sentiment: ${t.sentimentScore}/10)`, margin, y);
       y += 5;
       
       // Text
       doc.setFont("helvetica", "normal");
       doc.setTextColor(60);
       const textLines = doc.splitTextToSize(t.text, maxWidth);
       doc.text(textLines, margin, y);
       
       y += (textLines.length * 5) + 5; // Line height + gap
    });
    
    doc.save('coaching-insights.pdf');
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
             <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <button 
                      onClick={downloadTranscript}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      title="Download Transcript (.txt)"
                  >
                      <FileText size={16} />
                      <span className="hidden md:inline">Transcript</span>
                  </button>
                  <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      title="Download Report (.pdf)"
                  >
                      <FileDown size={16} />
                      <span className="hidden md:inline">Report</span>
                  </button>
                </div>
                
                <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                <button 
                    onClick={resetApp}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2"
                >
                    <RefreshCw size={16} />
                    <span className="hidden sm:inline">New Call</span>
                </button>
             </div>
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