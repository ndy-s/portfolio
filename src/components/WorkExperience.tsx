"use client"

import { DATA, CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function WorkExperience() {
  const [showAll, setShowAll] = useState(false)
  
  const section = CONTENT.sections.experience
  const INITIAL_COUNT = 3
  const visibleExperience = showAll ? DATA.experience : DATA.experience.slice(0, INITIAL_COUNT)
  const hasMore = DATA.experience.length > INITIAL_COUNT

  const [showSpeech, setShowSpeech] = useState(false)
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleGroguClick = () => {
    // 1. Play cute sound
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioContextClass) {
        const ctx = new AudioContextClass()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'sine'
        const now = ctx.currentTime
        osc.frequency.setValueAtTime(600, now)
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3)
        
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(now)
        osc.stop(now + 0.3)
      }
    } catch (e) {
      // Ignore if audio fails
    }

    // 2. Show bubble
    setShowSpeech(true)
    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current)
    speechTimeoutRef.current = setTimeout(() => setShowSpeech(false), 3000)
  }

  return (
    <AnimatedSection delay={0.2} className="mt-20 relative">
      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
      {section.subtitle && (
        <p className="text-muted text-sm mb-6 pr-16">{section.subtitle}</p>
      )}
      <div className="absolute -top-12 right-0 sm:right-4 z-10 flex flex-col items-center">
        <AnimatePresence>
          {showSpeech && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="absolute bottom-full mb-2 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-2 rounded-2xl shadow-lg border-2 border-black whitespace-normal text-center min-w-[140px] max-w-[200px] comic-bubble origin-bottom-right sm:origin-bottom"
            >
              Hire this engineer, you must! *coos*
              <div className="absolute top-full right-6 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.img
          src="/images/cute_grogu.png"
          alt="Cute Grogu"
          onClick={handleGroguClick}
          className="w-24 sm:w-32 h-auto opacity-90 cursor-pointer hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_0_15px_rgba(100,255,100,0.3)]"
          animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ rotate: 10 }}
        />
      </div>
      {!section.subtitle && <div className="mb-4" />}
      <div className="flex flex-col space-y-3">
        <AnimatePresence initial={false}>
          {visibleExperience.map((job) => (
            <motion.div
              key={`${job.company}-${job.title}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-neutral-200 to-neutral-200 dark:from-neutral-800 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition duration-300 blur-sm"></div>
              <div className="relative h-full w-full rounded-2xl bg-card border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="font-medium text-foreground">{job.title}</h4>
                  <p className="text-muted text-sm">{job.company}</p>
                </div>
                <p className="text-muted text-sm shrink-0">{job.date}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 px-4 text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          {showAll ? "Show Less" : `Show ${DATA.experience.length - INITIAL_COUNT} More`}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
    </AnimatedSection>
  )
}
