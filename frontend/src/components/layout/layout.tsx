import type { ReactNode } from "react"
import { Navbar } from "./navbar"
import { CommandPalette } from "./command-palette"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <CommandPalette />
      <main className="flex-1 w-full flex justify-center">
        <div className="container max-w-5xl px-4">
          {children}
        </div>
      </main>
    </div>
  )
}
