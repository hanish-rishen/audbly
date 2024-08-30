import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { debounce } from 'lodash';

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
  const recognitionRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const debouncedTranscriptionUpdate = useMemo(
    () => debounce(onTranscriptionUpdate, 300),
    [onTranscriptionUpdate]
  );

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      const newAnalyser = newAudioContext.createAnalyser();
      newAnalyser.fftSize = 256;
      audioContextRef.current = newAudioContext;
      analyserRef.current = newAnalyser;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = newAudioContext.createMediaStreamSource(stream);
          source.connect(newAnalyser);
          recognitionRef.current.start();
          setIsRecording(true);
          onRecordingStateChange(true);
          setTranscription("");
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    }
  }, [isRecording, onRecordingStateChange]);

  useEffect(() => {
    if (voiceRecorderRef && voiceRecorderRef.current) {
      voiceRecorderRef.current.startRecording = startRecording;
    }
  }, [voiceRecorderRef, startRecording]);

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
        debouncedTranscriptionUpdate(transcript);
      };

      recognitionRef.current = newRecognition;
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [debouncedTranscriptionUpdate]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      onRecordingStateChange(false);
    }
  }, [onRecordingStateChange]);

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