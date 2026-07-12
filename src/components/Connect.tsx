"use client"

import { DATA, CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { SiGithub } from "react-icons/si"
import { FaLinkedin, FaFileAlt } from "react-icons/fa"

export function Connect() {
  const section = CONTENT.sections.connect

  return (
    <AnimatedSection delay={0.5} className="mt-20" id="connect">
      <h3 className="text-lg font-medium mb-4">{section.title}</h3>
      <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-card border flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <p className="text-muted text-sm sm:text-base max-w-md leading-relaxed">
          {section.text}
        </p>
        <a
          href={`mailto:${DATA.email}`}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-90 transition-opacity shadow-sm"
        >
          {DATA.email}
        </a>
      </div>
      
      <div className="flex items-center justify-start space-x-3">
        <a
          href={DATA.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-card border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <SiGithub className="h-4 w-4" />
          GitHub
        </a>
        <a
          href={DATA.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-card border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <FaLinkedin className="h-4 w-4" />
          LinkedIn
        </a>
        <a
          href={DATA.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-card border px-4 py-2 text-sm font-medium text-foreground transition-all duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <FaFileAlt className="h-4 w-4" />
          Resume
        </a>
      </div>
    </AnimatedSection>
  )
}
