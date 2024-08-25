import { useState, useEffect, useCallback } from 'react';

interface VoiceRecorderProps {
  onAnalyze: (transcript: string) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onAnalyze }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [recognition, setRecognition] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';

      newRecognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        setTranscription(transcript);
      };

      setRecognition(newRecognition);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
      setTranscription('');
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  }, [recognition]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Voice Recorder</h2>
      <button
        className={`px-4 py-2 rounded ${
          isRecording ? 'bg-red-500' : 'bg-blue-500'
        } text-white mr-4`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <button
        className="px-4 py-2 rounded bg-green-500 text-white"
        onClick={() => onAnalyze(transcription)}
        disabled={!transcription}
      >
        Analyze Speech
      </button>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Transcription:</h3>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;