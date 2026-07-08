"use client"

import { CONTENT, DATA } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { motion } from "framer-motion"

export function Services() {
  const section = CONTENT.sections.services

  const currentServices = DATA.services

  return (
    <AnimatedSection delay={0.15} className="mt-20">
      <h3 className="text-lg font-medium mb-2">{section.title}</h3>
      {section.subtitle && (
        <p className="text-muted text-sm mb-6">{section.subtitle}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentServices.map((svc) => (
          <motion.div
            key={svc.title}
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl bg-card border flex flex-col items-start shadow-sm transition-all hover:shadow-md"
          >
            <div className="text-2xl mb-3">{svc.icon}</div>
            <h4 className="font-medium text-foreground mb-2">{svc.title}</h4>
            <p className="text-sm text-muted leading-relaxed">
              {svc.description}
            </p>
          </motion.div>
        ))}
      </div>
    </AnimatedSection>
  )
}
