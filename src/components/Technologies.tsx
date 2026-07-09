"use client"

import { useState } from "react"
import { DATA, CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { motion, AnimatePresence } from "framer-motion"

export function Technologies() {
  const [showAll, setShowAll] = useState(false)
  const section = CONTENT.sections.technologies
  const INITIAL_MOBILE_COUNT = 9

  const hasMore = DATA.technologies.length > INITIAL_MOBILE_COUNT

  return (
    <AnimatedSection delay={0.3} className="mt-20">
      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
      {section.subtitle && (
        <p className="text-muted text-sm mb-6">{section.subtitle}</p>
      )}
      {!section.subtitle && <div className="mb-4" />}

      {/* Main grid — always visible on sm+, clipped on mobile */}
      <div className="bg-card border rounded-2xl p-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8">
          {DATA.technologies.map((tech, index) => {
            const Icon = tech.icon
            const isExtra = index >= INITIAL_MOBILE_COUNT

            return (
              <motion.div
                key={isExtra ? `${tech.name}-${showAll}` : tech.name}
                initial={{ opacity: 0, y: 10 }}
                {...(isExtra
                  ? { animate: { opacity: 1, y: 0 } }
                  : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
                )}
                transition={{ delay: 0.1 * (index % 5) }}
                className={
                  isExtra && !showAll
                    ? "hidden sm:flex flex-col items-center justify-center space-y-2 group"
                    : "flex flex-col items-center justify-center space-y-2 group"
                }
              >
                <div className="text-4xl text-muted group-hover:text-foreground transition-colors duration-300">
                  <Icon />
                </div>
                <p className="text-xs font-medium text-muted group-hover:text-foreground transition-colors duration-300 text-center">
                  {tech.name}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {hasMore && (
        <AnimatePresence initial={false}>
          <motion.div
            key="show-more-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 sm:hidden"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-border text-sm font-medium text-muted hover:text-foreground hover:bg-card transition-colors flex items-center justify-center gap-2"
            >
              {showAll ? "Show Less" : `Show ${DATA.technologies.length - INITIAL_MOBILE_COUNT} More`}
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
          </motion.div>
        </AnimatePresence>
      )}
    </AnimatedSection>
  )
}
