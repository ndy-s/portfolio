"use client"

import { DATA, CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { motion } from "framer-motion"

export function Technologies() {
  const section = CONTENT.sections.technologies

  return (
    <AnimatedSection delay={0.3} className="mt-20">
      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
      {section.subtitle && (
        <p className="text-muted text-sm mb-6">{section.subtitle}</p>
      )}
      {!section.subtitle && <div className="mb-4" />}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-8 bg-card border rounded-2xl p-8">
        {DATA.technologies.map((tech, index) => {
          const Icon = tech.icon
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * (index % 5) }}
              className="flex flex-col items-center justify-center space-y-2 group"
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
    </AnimatedSection>
  )
}
