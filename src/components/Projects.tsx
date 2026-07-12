"use client"

import { CONTENT, PROJECTS, Project } from "@/data/data"
import { AnimatedSection } from "./AnimatedSection"
import { useState } from "react"
import { SiGithub } from "react-icons/si"
import { ProjectModal } from "./ProjectModal"
import { motion, AnimatePresence } from "framer-motion"

export function Projects() {
  const [showAll, setShowAll] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const projects = PROJECTS
  if (!projects || projects.length === 0) return null

  const section = CONTENT.sections.projects
  const INITIAL_COUNT = 3
  const visibleProjects = showAll ? projects : projects.slice(0, INITIAL_COUNT)
  const hasMore = projects.length > INITIAL_COUNT

  return (
    <>
      <AnimatedSection delay={0.4} className="mt-20">
        <h3 className="text-lg font-medium mb-2">{section.title}</h3>
        {section.subtitle && (
          <p className="text-muted text-sm mb-6">{section.subtitle}</p>
        )}
        {!section.subtitle && <div className="mb-4" />}
        <div className="flex flex-col space-y-4">
          <AnimatePresence initial={false}>
            {visibleProjects.map((project) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setSelectedProject(project)}
                  className="group relative block w-full text-left"
                >
                  <div className="relative h-full w-full rounded-2xl bg-card border p-6 transition-all duration-300 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 group-hover:shadow-md group-hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-foreground group-hover:text-blue-500 transition-colors">
                        {project.title}
                      </h4>
                      <div className="flex gap-2 text-muted">
                        {project.github && (
                          <span className="p-1 rounded-full hover:bg-background transition-colors" onClick={(e) => { e.stopPropagation(); window.open(project.github, "_blank"); }} title="View on GitHub">
                            <SiGithub className="w-4 h-4" />
                          </span>
                        )}
                        {project.comingSoon && (
                          <span className="text-xs font-medium px-2 py-1 rounded border flex items-center shrink-0 text-amber-500 border-amber-500/30 bg-amber-500/10">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-muted text-sm mb-4 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-md bg-background px-2 py-1 text-xs font-medium text-muted ring-1 ring-inset ring-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-6 w-full py-3 px-4 rounded-xl border border-dashed border-border text-sm font-medium text-muted hover:text-foreground hover:bg-card transition-colors flex items-center justify-center gap-2"
          >
            {showAll ? "Show Less" : `Show ${projects.length - INITIAL_COUNT} More`}
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
        )}
      </AnimatedSection>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </>
  )
}
