import { useState, useEffect } from 'react';
import { analyzeSentiment } from '../utils/sentimentAnalysis';

const AnalyticsDashboard = ({ transcription }: { transcription: string }) => {
  const [sentiment, setSentiment] = useState<string>('');

  useEffect(() => {
    if (transcription) {
      const result = analyzeSentiment(transcription);
      setSentiment(result);
    }
  }, [transcription]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
      <div>
        <h3 className="text-xl font-semibold">Sentiment Analysis:</h3>
        <p>{sentiment}</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;