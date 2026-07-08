"use client"

import Link from "next/link"
import { CONTENT } from "@/data/data"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function Header() {
  const [typedText, setTypedText] = useState("")
  const textToType = CONTENT.subtitle
  
  useEffect(() => {
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
  }, [textToType])

  return (
    <header className="mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Link href="/" className="font-medium text-foreground hover:opacity-80 transition-opacity">
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
      <div className="flex items-center gap-4">
        <a 
          href="#connect"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('connect')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity shadow-sm"
        >
          Hire Me
        </a>
      </div>
    </header>
  )
}
