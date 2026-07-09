"use client"

import { ReactNode, useRef, useEffect } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { useLoading } from "@/components/LoadingProvider"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  id,
}: AnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()
  const isLoaded = useLoading()

  useEffect(() => {
    if (isLoaded && isInView) {
      controls.start({ opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.5, delay } })
    }
  }, [isLoaded, isInView, controls, delay])

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, filter: "blur(8px)", y: 20 }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.section>
  )
}
