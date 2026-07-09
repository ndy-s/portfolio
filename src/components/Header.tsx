"use client"

import Link from "next/link"
import { CONTENT } from "@/data/data"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useLoading } from "@/components/LoadingProvider"

export function Header() {
  const [typedText, setTypedText] = useState("")
  const textToType = CONTENT.subtitle
  const isLoaded = useLoading()
  
  useEffect(() => {
    if (!isLoaded) return;
    
    let i = 0
    const typingInterval = setInterval(() => {
      if (i === 0) setTypedText("")
      
      if (i < textToType.length) {
        setTypedText(textToType.substring(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)
    
    return () => clearInterval(typingInterval)
  }, [textToType, isLoaded])

  return (
    <header className="mb-16">
      <div className="flex items-center gap-4">
        <motion.img
          src="/images/profile.jpg"
          alt="Hendy Saputra"
          className="w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-800 object-cover shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        />
        <div>
          <Link href="/" className="font-medium text-lg text-foreground hover:opacity-80 transition-opacity">
            Hendy Saputra
          </Link>
          <p className="text-muted text-sm mt-1 h-5">
            {typedText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-[2px] h-3 bg-muted ml-0.5"
            />
          </p>
        </div>
      </div>
    </header>
  )
}
