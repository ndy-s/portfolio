"use client"

import { ProjectMedia } from "@/data/data"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MediaCarouselProps {
  media: ProjectMedia[]
}

export function MediaCarousel({ media }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (!media || media.length === 0) return null

  const goTo = (index: number) => {
    setCurrent(index)
  }

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? media.length - 1 : prev - 1))
  }

  const goNext = () => {
    setCurrent((prev) => (prev === media.length - 1 ? 0 : prev + 1))
  }

  const item = media[current]

  return (
    <div className="mb-6">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-background border">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {item.type === "video" ? (
              <video
                src={item.src}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt || "Project screenshot"}
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - only show if more than 1 item */}
        {media.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm text-foreground hover:bg-background transition-colors"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm text-foreground hover:bg-background transition-colors"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots + caption */}
      {media.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-6 bg-foreground"
                  : "w-1.5 bg-muted/50 hover:bg-muted"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      {item.alt && (
        <p className="text-xs text-muted text-center mt-2">{item.alt}</p>
      )}
    </div>
  )
}
