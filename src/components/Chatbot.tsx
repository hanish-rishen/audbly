import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/nextjs";
import Image from 'next/image';

interface ChatbotProps {
  analysis: string;
}

interface Message {
  text: string;
  isUser: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY!);

const Chatbot: React.FC<ChatbotProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentResponse, isThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Given the following AI analysis of a speech: "${analysis}", please answer the following question or address the following concern: "${input}". Provide a helpful and informative response based on the analysis and your own knowledge.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botMessage: Message = { text: response.text(), isUser: false };
      
      setIsThinking(false);
      
      // Simulate typing effect
      setCurrentResponse('');
      for (let i = 0; i <= botMessage.text.length; i++) {
        setTimeout(() => {
          setCurrentResponse(botMessage.text.slice(0, i));
        }, i * 20);
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setCurrentResponse('');
      }, botMessage.text.length * 20 + 500);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = { text: "I'm sorry, I couldn't generate a response. Please try again.", isUser: false };
      setMessages(prev => [...prev, errorMessage]);
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-xl">
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-10 h-10 rounded-full flex-shrink-0 ${message.isUser ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center shadow-md overflow-hidden ${message.isUser ? 'ml-2' : 'mr-2'}`}
                >
                  {message.isUser ? (
                    user?.imageUrl ? (
                      <Image src={user.imageUrl} alt="User" layout="fill" objectFit="cover" />
                    ) : (
                      '😊'
                    )
                  ) : '🤖'}
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`p-3 rounded-2xl ${message.isUser ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'} max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-lg`}
                >
                  {message.text}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end space-x-2">
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-500 flex items-center justify-center shadow-md mr-2">
                🤖
              </div>
              <div className="p-3 rounded-2xl bg-gray-700 text-gray-200 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-lg">
                <motion.div
                  className="flex space-x-1"
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: {
                      repeat: Infinity,
                      duration: 1,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-end space-x-2">
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-blue-500 flex items-center justify-center shadow-md mr-2">
                🤖
              </div>
              <div className="p-3 rounded-2xl bg-gray-700 text-gray-200 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg shadow-lg">
                {currentResponse}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-4 ml-1 bg-blue-400"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800 shadow-inner">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow p-3 rounded-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-in-out"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 ease-in-out"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.div
                className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;