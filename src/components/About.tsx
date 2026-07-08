"use client"

import { CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"

export function About() {
  return (
    <AnimatedSection delay={0.1}>
      <div className="prose prose-neutral dark:prose-invert">
        <p className="text-muted leading-relaxed whitespace-pre-wrap">
          {CONTENT.about}
        </p>
      </div>
    </AnimatedSection>
  )
}
