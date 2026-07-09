"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait a brief moment to ensure client-side rendering (like Canvas) finishes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center w-16 h-16">
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
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                className="w-2 h-2 bg-neutral-800 dark:bg-neutral-200 rounded-full"
              />
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs font-mono tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase"
            >
              Initializing Space
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
