import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, Mic, Square, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        onFileSelect(file);
      } else {
        alert('Please upload an audio file.');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], "recording.webm", { type: 'audio/webm' });
        onFileSelect(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="w-full max-w-2xl mx-auto h-80 border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center bg-indigo-50/30 animate-pulse">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">Analyzing Call Intelligence...</h3>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          Gemini 3 Pro is thinking deeply about the conversation structure, sentiment, and coaching opportunities. This may take a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative group h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!isRecording ? (
          <>
            <div className="p-4 bg-indigo-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">Upload Support Call</h3>
            <p className="text-slate-500 mb-8 text-center max-w-xs">
              Drag & drop audio file here, or click to browse
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={handleClick}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Select File
              </button>
              <div className="h-full w-[1px] bg-slate-200 mx-2"></div>
              <button 
                onClick={startRecording}
                className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-200 font-medium rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                <Mic size={18} />
                Record
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="audio/*" 
              className="hidden" 
            />
          </>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                <div className="relative p-6 bg-red-500 rounded-full text-white">
                    <Mic size={32} />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Recording in progress...</h3>
            <p className="text-slate-500 mb-6">Speak clearly into your microphone</p>
            <button 
              onClick={stopRecording}
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
            >
              <Square size={18} fill="currentColor" />
              Stop Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
