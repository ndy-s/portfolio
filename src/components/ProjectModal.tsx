"use client"

import { Project } from "@/data/data"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { SiGithub } from "react-icons/si"
import { MediaCarousel } from "./MediaCarousel"

interface ProjectModalProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full sm:max-w-2xl bg-card border shadow-xl rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[90vh]"
          >
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto overscroll-contain flex-1">
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground pr-2 min-w-0">
                  {project.title}
                </h2>
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 -mr-1 -mt-1 sm:absolute sm:right-6 sm:top-6 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-muted hover:text-foreground"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-muted text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                {project.description}
              </p>

              {project.media && project.media.length > 0 && (
                <MediaCarousel media={project.media} />
              )}

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Key Details & Impact
                </h3>
                <ul className="space-y-3">
                  {project.details.map((detail, index) => (
                    <li key={index} className="flex items-start text-muted text-sm sm:text-base leading-relaxed">
                      <span className="mr-3 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-background px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-inset ring-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border">
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
                  >
                    Live Demo
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-card border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <SiGithub className="w-4 h-4" />
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
