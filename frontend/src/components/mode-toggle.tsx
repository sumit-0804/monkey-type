import { MonitorIcon, MoonIcon, SunIcon, Palette } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useThemeStore, THEMES } from "@/store/useThemeStore"

const THEME_ICONS: Record<string, React.ReactNode> = {
  light:    <SunIcon className="mr-2 size-4" />,
  dark:     <MoonIcon className="mr-2 size-4" />,
  monokai:  <Palette className="mr-2 size-4" />,
  dracula:  <Palette className="mr-2 size-4" />,
  terminal: <MonitorIcon className="mr-2 size-4" />,
}

export function ModeToggle() {
  const { theme, setTheme } = useThemeStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
      >
        {theme === 'light'
          ? <SunIcon className="size-4" />
          : theme === 'dark'
          ? <MoonIcon className="size-4" />
          : <Palette className="size-4" />
        }
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map(({ name, label }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className={cn(theme === name && "bg-accent text-accent-foreground")}
          >
            {THEME_ICONS[name]}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
