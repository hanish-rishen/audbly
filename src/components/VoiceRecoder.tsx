import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";

interface VoiceRecorderProps {
  onAnalyze: (transcript: string) => void;
  onRecordingStateChange: (isRecording: boolean) => void;
  onTranscriptionUpdate: (transcript: string) => void;
  voiceRecorderRef?: React.RefObject<{ startRecording: () => void }>;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

const VoiceRecoder: React.FC<VoiceRecorderProps> = React.memo(({
  onAnalyze,
  onRecordingStateChange,
  onTranscriptionUpdate,
  voiceRecorderRef
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [transcription2, setTranscription2] = useState("");
  const [recognition, setRecognition] = useState<any | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      const newAnalyser = newAudioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      setAudioContext(newAudioContext);
      setAnalyser(newAnalyser);

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = newAudioContext.createMediaStreamSource(stream);
          source.connect(newAnalyser);
          recognition.start();
          setIsRecording(true);
          onRecordingStateChange(true);
          setTranscription("");
          setTranscription2("");
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    }
  }, [recognition, isRecording, onRecordingStateChange]);

  useEffect(() => {
    if (voiceRecorderRef && voiceRecorderRef.current) {
      voiceRecorderRef.current.startRecording = () => {
        if (!isRecording) {
          startRecording();
        }
      };
    }
  }, [voiceRecorderRef, isRecording, startRecording]);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = "en-US";

      newRecognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(" ");
        setTranscription(transcript);
        setTranscription2(transcript);
        onTranscriptionUpdate(transcript);
      };

      setRecognition(newRecognition);
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [onTranscriptionUpdate, audioContext]); // Add audioContext to the dependency array

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      onRecordingStateChange(false);
    }
  }, [recognition, onRecordingStateChange]);

  return (
    <div className="flex justify-center items-center h-full">
      <motion.button
        className={`px-8 py-3 rounded-full font-semibold text-white relative overflow-hidden ${
          isRecording
            ? "bg-red-600"
            : "bg-gradient-to-r from-purple-500 to-pink-500"
        }`}
        onClick={isRecording ? stopRecording : startRecording}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
        <motion.div
          className="absolute inset-0 bg-white opacity-25"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          }}
          style={{
            maskImage: "linear-gradient(to right, transparent, white, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, white, transparent)",
          }}
        />
      </motion.button>
    </div>
  );
});

VoiceRecoder.displayName = 'VoiceRecoder';

export default VoiceRecoder;