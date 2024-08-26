const positiveWords = ['good', 'great', 'excellent', 'happy', 'positive', 'wonderful', 'fantastic', 'amazing'];
const negativeWords = ['bad', 'awful', 'terrible', 'sad', 'negative', 'horrible', 'disappointing', 'poor'];

export function analyzeSentiment(text: string): string {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
}