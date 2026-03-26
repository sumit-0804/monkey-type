import { useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useNavigate } from "react-router-dom"
import { MonitorIcon, Moon, Sun, Trophy, User, Home, Palette } from "lucide-react"
import { useThemeStore, THEMES } from "@/store/useThemeStore"

const THEME_ICONS: Record<string, React.ReactNode> = {
  light:    <Sun className="mr-2 h-4 w-4" />,
  dark:     <Moon className="mr-2 h-4 w-4" />,
  monokai:  <Palette className="mr-2 h-4 w-4" />,
  dracula:  <Palette className="mr-2 h-4 w-4" />,
  terminal: <MonitorIcon className="mr-2 h-4 w-4" />,
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setTheme } = useThemeStore()

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (

    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/leaderboard"))}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Leaderboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          {THEMES.map(({ name, label }) => (
            <CommandItem
              key={name}
              onSelect={() => runCommand(() => setTheme(name))}
            >
              {THEME_ICONS[name]}
              <span>{label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
