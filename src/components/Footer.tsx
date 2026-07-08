"use client"

import { DATA, CONTENT } from "@/data/data"
import { ThemeSwitcher } from "./ThemeSwitcher"

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} {DATA.name}. {CONTENT.sections.footer}
        </p>
        <ThemeSwitcher />
      </div>
    </footer>
  )
}
