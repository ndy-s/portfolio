"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

export function BackgroundAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              setHasError(false)
            })
            .catch((error) => {
              console.error("Audio playback failed:", error)
              setHasError(true)
            })
        }
      }
    }
  }

  // Set a bigger background volume for ambience
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 group">
      <audio
        ref={audioRef}
        loop
        src="/ambient.mp3"
      />

      {/* Tooltip to tell user about the file if it errors */}
      {hasError && (
        <div className="absolute bottom-full right-0 mb-4 w-48 p-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Audio file not found. Please add ambient.mp3 to your public/ folder.
        </div>
      )}

      {/* Indicator when not playing */}
      {!isPlaying && !hasError && (
        <span className="absolute right-[120%] top-1/2 -translate-y-1/2 text-xs font-medium whitespace-nowrap bg-black/60 px-3 py-1.5 rounded-full border border-white/10 text-white/90 animate-pulse pointer-events-none">
          Enable cosmic ambiance
        </span>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        className={`flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-background/80 backdrop-blur-md border shadow-lg transition-colors ${hasError ? "border-red-500/30 text-red-500" : "border-border text-foreground hover:bg-card"
          }`}
        aria-label="Toggle background music"
      >
        {isPlaying ? (
          // Equalizer/Pause animation icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          // Music/Play icon
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
