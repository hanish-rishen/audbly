"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSend } from "react-icons/fi";
import { FaUser, FaRobot } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
    <div className="h-full flex flex-col bg-gray-800 rounded-2xl overflow-hidden">
      <div className="flex-grow overflow-y-auto p-4 max-h-[calc(100vh-200px)] min-h-[300px]" ref={chatContainerRef}>
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex mb-4 ${
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex items-start space-x-2 ${
                message.isUser ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`p-3 rounded-full ${
                  message.isUser ? 'bg-red-700' : 'bg-gray-600'
                } flex items-center justify-center`}>
                  {message.isUser ? (
                    user?.imageUrl ? (
                      <Image src={user.imageUrl} alt="User" width={24} height={24} className="rounded-full" />
                    ) : (
                      <FaUser size={24} />
                    )
                  ) : <FaRobot size={24} />}
                </div>
                <div className={`p-3 sm:p-4 rounded-lg ${
                  message.isUser ? 'bg-red-700' : 'bg-gray-600'
                } max-w-[80%] text-white shadow-lg text-sm sm:text-base flex items-center`}>
                  {message.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-600 p-3 rounded-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </motion.div>
        )}
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-2">
              <div className="p-3 rounded-full bg-gray-600 flex items-center justify-center">
                <FaRobot size={24} />
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-gray-600 max-w-[80%] text-white shadow-lg text-sm sm:text-base flex items-center">
                {currentResponse}
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-4 ml-1 bg-white"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 bg-gray-900 p-4">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the speech analysis..."
            className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 rounded-full text-base px-4 py-2"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 text-lg font-semibold text-white bg-red-700 rounded-full transition-all duration-300 cursor-pointer"
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <FiSend className="mr-2" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;