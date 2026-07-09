"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useCodex } from "./CodexProvider"
import { STAR_SUBTYPES, PLANET_SUBTYPES, OTHER_SUBTYPE_META } from "@/lib/celestialData"

const ALL_BODIES = [
  ...Object.entries(STAR_SUBTYPES).map(([id, meta]) => ({ id, ...meta, category: "Stars" })),
  ...Object.entries(PLANET_SUBTYPES).map(([id, meta]) => ({ id, ...meta, category: "Planets" })),
  ...Object.entries(OTHER_SUBTYPE_META).map(([id, meta]) => ({ id, ...meta, category: "Anomalies" }))
]

function CelestialBodyShape({ body }: { body: any }) {
  const colorRgb = body.color || "255,255,255";
  
  if (body.category === "Stars") {
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div 
          className="w-10 h-10 rounded-full" 
          style={{
            background: `rgb(${colorRgb})`,
            boxShadow: `0 0 15px 5px rgba(${colorRgb}, 0.6), inset 0 0 10px rgba(255,255,255,0.8)`
          }} 
        />
      </div>
    )
  }

  if (body.category === "Planets") {
    const isBanded = body.banded;
    const background = isBanded 
      ? `repeating-linear-gradient(0deg, rgba(${colorRgb}, 0.8) 0%, rgba(${colorRgb}, 1) 20%, rgba(0,0,0,0.1) 40%, rgba(${colorRgb}, 0.9) 60%)`
      : `radial-gradient(circle at 30% 30%, rgb(${colorRgb}), rgba(${colorRgb}, 0.4))`;
      
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        {body.ringColor && (
          <div 
            className="absolute w-14 h-4 rounded-[50%] border-[3px]" 
            style={{ borderColor: `rgba(${body.ringColor}, 0.8)`, transform: 'rotate(-20deg)' }} 
          />
        )}
        <div 
          className="w-8 h-8 rounded-full relative z-10" 
          style={{ background, boxShadow: `inset -4px -4px 6px rgba(0,0,0,0.5)` }} 
        />
      </div>
    )
  }

  if (body.category === "Anomalies") {
    if (body.id === "blackhole") {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div 
            className="absolute w-16 h-16 rounded-full" 
            style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(255,150,50,0.6) 55%, rgba(0,0,0,0) 70%)' }} 
          />
          <div className="w-6 h-6 bg-black rounded-full shadow-[0_0_15px_rgba(255,150,50,0.5)] z-10" />
        </div>
      )
    }
    if (body.id === "asteroid") {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div 
            className="w-8 h-8 bg-neutral-500" 
            style={{ 
              borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
              boxShadow: 'inset -3px -3px 5px rgba(0,0,0,0.5)'
            }} 
          />
        </div>
      )
    }
    if (body.id === "comet") {
      return (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Comet Tail */}
          <div 
            className="absolute w-12 h-3 rounded-full blur-[2px]" 
            style={{ 
              background: 'linear-gradient(90deg, rgba(200,255,255,0) 0%, rgba(200,255,255,0.6) 100%)',
              transform: 'translate(-8px, 0) rotate(20deg)',
              transformOrigin: 'right center'
            }} 
          />
          {/* Comet Head */}
          <div 
            className="w-4 h-4 bg-white rounded-full relative z-10" 
            style={{ boxShadow: '0 0 10px rgba(200,255,255,0.8), inset -1px -1px 3px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )
    }
  }

  return <div className="text-3xl">{body.icon}</div>;
}

export function CosmicCodex() {
  const [isOpen, setIsOpen] = useState(false)
  const { caughtSubtypes, isComplete, totalBodies, hasNewCatch, clearNewCatch, resetCodex } = useCodex()
  const [hasMounted, setHasMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Close on Escape & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
      if (hasNewCatch) {
        clearNewCatch()
      }
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, hasNewCatch, clearNewCatch])

  if (!hasMounted) return null

  const progress = Math.round((caughtSubtypes.length / totalBodies) * 100)

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        animate={
          hasNewCatch
            ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, -10, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={
          hasNewCatch
            ? { duration: 0.8, repeat: Infinity }
            : {}
        }
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-16 sm:bottom-20 left-4 sm:left-6 z-50 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-colors backdrop-blur-md shadow-lg group ${
          isComplete 
            ? "bg-yellow-500/30 border-yellow-500/50 hover:bg-yellow-500/50 text-yellow-100" 
            : "bg-black/40 hover:bg-black/60 border-white/10 text-white/70 hover:text-white"
        }`}
        title="Cosmic Codex"
        aria-label="Open Cosmic Codex"
      >
        <span className="text-lg sm:text-xl relative">
          {isComplete ? "🏆" : "📖"}
          {hasNewCatch && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-ping" />
          )}
          {hasNewCatch && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative w-full max-w-2xl bg-card border shadow-xl rounded-2xl overflow-hidden flex flex-col max-h-[85dvh] md:max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start p-4 sm:p-6 md:p-8 pb-4 border-b border-white/5 shrink-0 relative overflow-hidden">
                {isComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 z-0 pointer-events-none"
                  />
                )}
                <div className="min-w-0 flex-1 relative z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                    {isComplete ? "🏆 Universal Mastery" : "📖 Cosmic Codex"}
                  </h2>
                  <p className="text-sm text-muted">
                    {isComplete 
                      ? "Incredible! You've discovered every known celestial body in the universe."
                      : "Drag and drop undiscovered planets or stars in the background to log them here."}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden max-w-xs">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isComplete ? 'bg-yellow-500' : 'bg-primary'}`}
                      />
                    </div>
                    <span className={`text-xs font-mono font-bold ${isComplete ? 'text-yellow-500' : 'text-primary'}`}>
                      {caughtSubtypes.length}/{totalBodies}
                    </span>
                    {isComplete && (
                      <button 
                        onClick={resetCodex}
                        className="ml-auto text-xs px-3 py-1.5 rounded-md bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition-colors border border-yellow-500/30"
                      >
                        Reset Collection
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="shrink-0 p-2 -mr-1 -mt-1 rounded-full hover:bg-muted/50 transition-colors relative z-10"
                  aria-label="Close codex"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto overscroll-contain flex-1 p-4 sm:p-6 md:p-8 space-y-8">
                {["Stars", "Planets", "Anomalies"].map((category) => {
                  const bodiesInCategory = ALL_BODIES.filter(b => b.category === category);
                  
                  return (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-foreground/90 mb-4 border-b border-white/5 pb-2">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {bodiesInCategory.map((body) => {
                          const isCaught = caughtSubtypes.includes(body.id);
                          return (
                            <motion.div 
                              key={body.id}
                              whileHover={isCaught ? { scale: 1.05 } : {}}
                              className={`relative p-3 sm:p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                                isCaught 
                                  ? 'bg-muted/20 border-white/10 hover:bg-muted/40' 
                                  : 'bg-muted/5 border-white/5 opacity-50 grayscale'
                              }`}
                            >
                              <div className="filter drop-shadow-lg mb-2 mt-1 flex items-center justify-center h-12">
                                {isCaught ? <CelestialBodyShape body={body} /> : <span className="text-3xl sm:text-4xl">❓</span>}
                              </div>
                              <div>
                                <div className="font-semibold text-xs sm:text-sm text-foreground">
                                  {isCaught ? body.label : "Unknown"}
                                </div>
                                {isCaught && (
                                  <div className="text-[10px] sm:text-xs text-muted mt-1 leading-tight">
                                    {body.trait}
                                  </div>
                                )}
                              </div>
                              {/* Glowing background for caught items */}
                              {isCaught && (
                                <div 
                                  className="absolute inset-0 z-[-1] opacity-20 blur-xl rounded-xl"
                                  style={{ backgroundColor: `rgb(${body.color})` }}
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
