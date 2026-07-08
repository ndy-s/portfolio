"use client"

import { CONTENT } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { motion } from "framer-motion"

export function Services() {
  const section = CONTENT.sections.services

  const currentServices = [
    {
      title: "Full-Stack Web Development",
      description: "End-to-end development of fast, responsive, and beautifully designed web applications using modern stacks like Next.js, React, and Tailwind CSS.",
      icon: "💻"
    },
    {
      title: "Backend Architecture",
      description: "Designing and building robust, scalable APIs and microservices. Expertise in Node.js, Go, Python, and SQL/NoSQL database modeling.",
      icon: "⚙️"
    },
    {
      title: "API Integrations & Automation",
      description: "Connecting disparate systems, building payment gateways, and automating complex business workflows for improved efficiency.",
      icon: "🔗"
    }
  ]

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
