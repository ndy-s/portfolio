"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function CosmicHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  // Prevent hydration mismatch for portals/modals
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  if (!hasMounted) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg group"
        title="Cosmic Features Guide"
        aria-label="Cosmic Features Guide"
      >
        <span className="font-bold font-mono text-lg opacity-80 group-hover:opacity-100">?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
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
              className="relative w-full max-w-md bg-card border shadow-xl rounded-2xl overflow-hidden flex flex-col p-6 sm:p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Cosmic Sandbox
                  </h2>
                  <p className="text-sm text-muted">
                    This background isn&apos;t just a video&mdash;it&apos;s a live physics simulation! Here is what you can do:
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 -mt-2 rounded-full hover:bg-muted/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted hover:text-foreground transition-colors">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                    <span>🌍</span> N-Body Gravity
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Every celestial body has mass. Watch as they naturally pull on each other and bend their orbital trajectories!
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                    <span>✋</span> Grab & Throw
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Use your mouse or touch to grab any planet. Fling it across the screen to disrupt the solar system.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                    <span>💥</span> Collisions & Absorption
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    When two planets crash, the larger one absorbs the smaller one and grows in size, scattering debris!
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-white/5">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 mb-1">
                    <span>🔊</span> Reactive Audio
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    Make sure your sound is on! Dragging and crashing planets synthesizes real-time sound effects.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full py-3 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Got it, let&apos;s explore!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
