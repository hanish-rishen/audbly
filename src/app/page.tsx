"use client"
import { useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecoder';
import { analyzeSpeech } from '@/utils/geminiAnalysis';
// import {GetStartedPage} from '@/components/GetStartedPage';

export default function Home() {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (transcript: string) => {
    setIsLoading(true);
    try {
      const result = await analyzeSpeech(transcript);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing speech:', error);
      setAnalysis('An error occurred while analyzing the speech.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Speech Improvement Tool</h1>
      <VoiceRecorder onAnalyze={handleAnalyze} />
      {isLoading && <p>Analyzing speech...</p>}
      {analysis && (
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Analysis Results:</h2>
          <div className="whitespace-pre-wrap bg-black-100 p-4 rounded-lg">
            {analysis.split('\n').map((line, index) => (
              <p key={index} className="mb-2">
                {line.startsWith('"') ? <strong>{line}</strong> : line}
              </p>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}