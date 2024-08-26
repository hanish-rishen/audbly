"use client";
import React, { useState, useEffect, useRef } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs";
import Image from 'next/image';

export default function Home() {
  const [whyChooseUsTypedText, setWhyChooseUsTypedText] = useState(Array(5).fill(""));
  const whyChooseUsRef = useRef(null);
  const isInView = useInView(whyChooseUsRef, { once: true, amount: 0.2 });
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const texts = [
    "Simply start talking, and our platform will instantly convert your speech into text.",
    "Our advanced AI analyzes your speech in real time, providing detailed feedback on tone, clarity, pacing, and word choice.",
    "Our intelligent chatbot provides instant, helpful responses tailored to your needs.",
    "Hear an improved version of your speech with our high-quality voice cloning technology.",
    "Continuously improve your communication skills with our comprehensive feedback and practice tools.",
  ];

  const whyChooseUsItems = [
    {
      title: "Personalized Experience",
      description: "Our platform tailors the feedback and suggestions to your unique voice and speaking style. No generic advice—everything is customized to help you become the best speaker you can be.",
    },
    {
      title: "Real-Time Feedback",
      description: "No more waiting for days or weeks to get feedback on your speech. With our real-time analysis, you can immediately see where you can improve and start working on it right away.",
    },
    {
      title: "Easy to Use",
      description: "We've made sure our platform is user-friendly and intuitive, so you can focus on what really matters—improving your speech. Just speak, analyze, and improve, all in a few simple steps.",
    },
    {
      title: "Cutting-Edge Technology",
      description: "We leverage the latest advancements in AI and voice technology to provide you with accurate, insightful, and actionable feedback. Our voice cloning feature ensures you hear the best version of yourself, pushing you towards continuous improvement.",
    },
    {
      title: "Support Anytime, Anywhere",
      description: "Whether you're at home, in the office, or on the go, our platform is accessible from any device. Plus, with our chatbot ready to answer your questions, you're never alone on your journey to better communication.",
    },
  ];

  useEffect(() => {
    if (isInView) {
      const whyChooseUsTexts = whyChooseUsItems.map(item => item.description);
      whyChooseUsTexts.forEach((text, index) => {
        let i = 0;
        const intervalId = setInterval(() => {
          setWhyChooseUsTypedText((prev) => {
            const newTypedText = [...prev];
            newTypedText[index] = text.slice(0, i);
            return newTypedText;
          });
          i++;
          if (i > text.length) clearInterval(intervalId);
        }, 10); // Faster typing speed
      });
    }
  }, [isInView]);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/tool');
    }
  }, [isSignedIn, router]);

  return (
    <div className="relative min-h-screen">
      <BackgroundBeamsWithCollision className="fixed inset-0 z-0">
        {/* Empty div to satisfy the children prop requirement */}
        <div></div>
      </BackgroundBeamsWithCollision>
      <div className="relative z-10 min-h-screen">
        {/* Updated header with logo, Get Started button, and Sign In button for desktop */}
        <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-8">
          <div className="text-4xl font-bold text-white">
            audbly<span className="text-purple-500">.</span>
          </div>
          <div className="flex space-x-4 items-center">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignUpButton mode="modal">
                  <motion.button
                    className="hidden md:block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold relative overflow-hidden text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started
                    <motion.div
                      className="absolute inset-0 bg-white opacity-25"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: 'linear',
                      }}
                      style={{
                        maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, white, transparent)',
                      }}
                    />
                  </motion.button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <motion.button
                    className="hidden md:block px-8 py-3 bg-white text-purple-500 rounded-full font-semibold relative overflow-hidden text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </SignInButton>
              </>
            )}
          </div>
        </header>

        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl font-semibold text-white">
                Elevate Your Speaking Skills with{" "}
                <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
                  Audbly
                </span>
              </h1>
              {/* Get Started and Sign In buttons for mobile */}
              {!isSignedIn && (
                <div className="md:hidden flex flex-col space-y-4 mt-6">
                  <SignUpButton mode="modal">
                    <motion.button
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold relative overflow-hidden text-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Get Started
                      <motion.div
                        className="absolute inset-0 bg-white opacity-25"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'linear',
                        }}
                        style={{
                          maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent, white, transparent)',
                        }}
                      />
                    </motion.button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <motion.button
                      className="px-8 py-3 bg-white text-purple-500 rounded-full font-semibold relative overflow-hidden text-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Sign In
                    </motion.button>
                  </SignInButton>
                </div>
              )}
            </>
          }
        >
          <div className="relative z-20 flex items-center justify-center h-full w-full">
            <Image src="/images/Audbly.png" alt="Audbly" layout="fill" objectFit="cover" />
          </div>
        </ContainerScroll>

        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-4 px-4 md:px-8 bg-gradient-to-b from-neutral-900 to-neutral-950"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Speak Your Mind",
                  description: texts[0],
                },
                {
                  title: "AI-Powered Analysis",
                  description: texts[1],
                },
                {
                  title: "Get Your Questions Answered",
                  description: texts[2],
                },
                {
                  title: "Enhanced Voice Cloning",
                  description: texts[3],
                },
                {
                  title: "Review and Refine",
                  description: texts[4],
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className="relative overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-neutral-800 border-neutral-700">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                      <p className="text-neutral-300 h-20 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent, white, transparent)',
                    }}
                    animate={{
                      x: ['200%', '-200%'],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: 'loop',
                      duration: 3,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={whyChooseUsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="py-16 px-4 md:px-8 bg-gradient-to-b from-neutral-950 to-neutral-900"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
              Why Choose Us?
            </h2>
            <div className="space-y-12">
              {whyChooseUsItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                  <div className="flex-shrink-0">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-2xl font-bold text-white relative z-10">{index + 1}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                        style={{
                          maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent, white, transparent)',
                        }}
                        animate={{
                          x: ['200%', '-200%'],
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: 'loop',
                          duration: 2,
                          ease: 'linear',
                        }}
                      />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-neutral-300">{whyChooseUsTypedText[index]}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center justify-center py-16 bg-neutral-900"
        >
          <motion.img
            src="/images/gemini.svg"
            alt="Gemini Logo"
            className="w-32 h-32 mb-4"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 pb-1">
            Powered by Gemini
          </h2>
        </motion.div>
      </div>
    </div>
  );
}