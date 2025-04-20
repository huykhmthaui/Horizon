"use client"

import * as React from "react"
import { useEffect, useState } from "react"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={"relative inline-flex h-[24px] w-[48px] items-center rounded-full transition-colors bg-zinc-300 dark:bg-zinc-700"
      }
    >
      <span
        className={
          "inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform duration-300 translate-x-[4px] dark:translate-x-[24px]"
        }
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-indigo-500 mx-auto mt-[2px]" />
        ) : (
          <Sun className="h-4 w-4 text-yellow-500 mx-auto mt-[2px]" />
        )}
      </span>
    </button>
  )
}
