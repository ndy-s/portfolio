"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoadingControls } from "./LoadingProvider";

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const { completeLoading } = useLoadingControls();

  useEffect(() => {
    // Wait a brief moment to simulate loading and ensure Canvas init
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    
    // Play startup sound
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        // A deep swoosh that rises up
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 1.0);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
      }
    } catch (e) {
      // Ignored, browser may block this on hard reload
    }

    setTimeout(() => {
      setIsLoading(false);
      completeLoading();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black"
        >
          <div className="flex flex-col items-center gap-8">
            <div className="relative flex items-center justify-center w-20 h-20">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-r-2 border-neutral-800 dark:border-neutral-200 rounded-full opacity-60"
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-b-2 border-l-2 border-neutral-500 dark:border-neutral-400 rounded-full opacity-60"
              />
              {/* Center dot */}
              <motion.div
                animate={isEntering ? { scale: 20, opacity: 0 } : { scale: [1, 1.2, 1] }}
                transition={isEntering ? { duration: 0.8 } : { duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 h-3 bg-neutral-800 dark:bg-neutral-200 rounded-full"
              />
            </div>
            
            <div className="h-12 flex items-center justify-center">
              {!isReady && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xs font-mono tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase"
                >
                  Initializing Space
                </motion.p>
              )}

              {isReady && !isEntering && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnter}
                  className="px-6 py-2.5 rounded-full border border-neutral-800 dark:border-neutral-200 text-sm font-mono tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors uppercase"
                >
                  Enter Universe
                </motion.button>
              )}

              {isEntering && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs font-mono tracking-[0.2em] text-neutral-800 dark:text-neutral-200 uppercase"
                >
                  Launching...
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
