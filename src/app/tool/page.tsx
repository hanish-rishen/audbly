"use client"
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceRecorder from '@/components/VoiceRecoder';
import { analyzeSpeech } from '@/utils/geminiAnalysis';
import { Card, CardContent } from "@/components/ui/card";
import Chatbot from '@/components/Chatbot';
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

const ShootingStars = () => {
  const stars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-0">
      {stars.map((star) => (
        <motion.div
          key={star}
          className="absolute w-1 h-1 bg-gray-400 rounded-full"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0,
          }}
          animate={{
            top: [`${Math.random() * 100}%`, '100%'],
            left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [transcription, setTranscription] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const voiceRecorderRef = useRef<{ startRecording: () => void } | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isRecording && transcription) {
      handleAnalyze(transcription);
    }
  }, [isRecording, transcription]);

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

  const handleRecordingStateChange = (isRecording: boolean) => {
    setIsRecording(isRecording);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      // Navigate to the public home page if not signed in
      router.push('/');
    }
    // If signed in, do nothing (stay on the current page)
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto bg-gray-900">
      <ShootingStars />
      <main className="relative z-10 flex flex-col min-h-screen p-4 sm:p-8">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <a 
            href="#" 
            onClick={handleLogoClick} 
            className="text-3xl sm:text-4xl font-bold text-white hover:text-purple-500 transition-colors"
          >
            audbly<span className="text-purple-500">.</span>
          </a>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-12 w-12"
              }
            }}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-120px)]">
          <div className="flex flex-col space-y-8">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center">
                <VoiceRecorder 
                  voiceRecorderRef={voiceRecorderRef}
                  onRecordingStateChange={handleRecordingStateChange} 
                  onTranscriptionUpdate={setTranscription}
                  onAnalyze={handleAnalyze}
                />
                <AnimatePresence>
                  {isRecording ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 flex items-center justify-center"
                    >
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-gray-200">Recording in progress...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-gray-400 text-center flex items-center"
                    >
                      Ready to capture your speech
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm flex-grow">
              <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-200">Ask your doubts!</h2>
                <div className="flex-grow overflow-hidden">
                  <Chatbot analysis={analysis} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col space-y-8">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-[calc(50%-1rem)]">
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-200">Live Transcription</h2>
                <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  <AnimatePresence mode="wait">
                    {transcription ? (
                      <motion.p
                        key="transcription"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-300"
                      >
                        {transcription}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="placeholder"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-300"
                      >
                        Your speech will appear here...
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm h-[calc(50%-1rem)]">
              <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-200">
                  {isLoading ? "Analyzing..." : "Analysis Results"}
                </h2>
                <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <motion.div 
                        className="w-12 h-12 border-4 border-gray-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    </div>
                  ) : analysis ? (
                    <div className="space-y-2">
                      {analysis.split('\n').map((line, index) => (
                        <p key={index} className={`${line.startsWith('"') ? 'font-semibold text-purple-400' : 'text-neutral-200'}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-200">Analysis will appear here after you finish recording...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}