"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
import { TOTAL_CELESTIAL_BODIES } from "@/lib/celestialData"

interface CodexContextType {
  caughtSubtypes: string[]
  catchBody: (subtype: string) => boolean
  isComplete: boolean
  hasNewCatch: boolean
  clearNewCatch: () => void
  resetCodex: () => void
  totalBodies: number
}

const CodexContext = createContext<CodexContextType | undefined>(undefined)

export function CodexProvider({ children }: { children: React.ReactNode }) {
  const [caughtSubtypes, setCaughtSubtypes] = useState<string[]>([])
  const caughtSubtypesRef = useRef<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasNewCatch, setHasNewCatch] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    try {
      const stored = localStorage.getItem("cosmic_codex")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // Filter out duplicates just in case there are any from previous bug
          const uniqueParsed = Array.from(new Set(parsed))
          setCaughtSubtypes(uniqueParsed)
          caughtSubtypesRef.current = uniqueParsed
          if (uniqueParsed.length >= TOTAL_CELESTIAL_BODIES) {
            setIsComplete(true)
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse codex state from localStorage")
    }
  }, [])

  const catchBody = React.useCallback((subtype: string) => {
    if (caughtSubtypesRef.current.includes(subtype)) return false

    const next = Array.from(new Set([...caughtSubtypesRef.current, subtype]))
    caughtSubtypesRef.current = next
    setCaughtSubtypes(next)

    try {
      localStorage.setItem("cosmic_codex", JSON.stringify(next))
    } catch (e) {
      // ignore
    }
    
    if (next.length >= TOTAL_CELESTIAL_BODIES) {
      setIsComplete(true)
    }
    
    setHasNewCatch(true)
    return true
  }, [])

  const resetCodex = React.useCallback(() => {
    caughtSubtypesRef.current = []
    setCaughtSubtypes([])
    setIsComplete(false)
    setHasNewCatch(false)
    try {
      localStorage.removeItem("cosmic_codex")
    } catch (e) {}
  }, [])

  const clearNewCatch = () => setHasNewCatch(false)

  return (
    <CodexContext.Provider
      value={{
        caughtSubtypes: hasMounted ? caughtSubtypes : [],
        catchBody,
        isComplete: hasMounted ? isComplete : false,
        hasNewCatch,
        clearNewCatch,
        resetCodex,
        totalBodies: TOTAL_CELESTIAL_BODIES
      }}
    >
      {children}
    </CodexContext.Provider>
  )
}

export function useCodex() {
  const context = useContext(CodexContext)
  if (context === undefined) {
    throw new Error("useCodex must be used within a CodexProvider")
  }
  return context
}
