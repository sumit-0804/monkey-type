import { Link } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Keyboard, Trophy, Info, Settings as SettingsIcon, LogOut, User as UserIcon } from "lucide-react"
import { GoogleLogin, googleLogout } from "@react-oauth/google"
import { useAuthStore } from "@/store/useAuthStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useThemeStore } from "@/store/useThemeStore"

import LogoLight from "@/assets/turbotype-light.svg"
import LogoDark from "@/assets/turbotype-dark.svg"
import LogoMonokai from "@/assets/turbotype-monokai.svg"
import LogoDracula from "@/assets/turbotype-dracula.svg"
import LogoTerminal from "@/assets/turbotype-terminal.svg"

import MobileLogoLight from "@/assets/turbotype-mobile-light.svg"
import MobileLogoDark from "@/assets/turbotype-mobile-dark.svg"
import MobileLogoMonokai from "@/assets/turbotype-mobile-monokai.svg"
import MobileLogoDracula from "@/assets/turbotype-mobile-dracula.svg"
import MobileLogoTerminal from "@/assets/turbotype-mobile-terminal.svg"

const LOGO_MAP: Record<string, string> = {
  light: LogoLight,
  dark: LogoDark,
  monokai: LogoMonokai,
  dracula: LogoDracula,
  terminal: LogoTerminal,
}

const MOBILE_LOGO_MAP: Record<string, string> = {
  light: MobileLogoLight,
  dark: MobileLogoDark,
  monokai: MobileLogoMonokai,
  dracula: MobileLogoDracula,
  terminal: MobileLogoTerminal,
}

export function Navbar() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthStore()
  const { theme } = useThemeStore()

  const handleLoginSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      await login(credentialResponse.credential)
    }
  }

  const handleLogout = async () => {
    googleLogout()
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/0 transition-all duration-300">
      <div className="container mx-auto glass rounded-b-2xl px-6 flex h-16 items-center gap-4 transition-all hover:border-primary/20">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="flex items-center group transition-all hover:scale-105 active:scale-95">
            <img 
              src={LOGO_MAP[theme] || LogoDark} 
              alt="Turbo Type" 
              className="h-9 w-auto hidden md:block" 
            />
            <img 
              src={MOBILE_LOGO_MAP[theme] || MobileLogoDark} 
              alt="Turbo Type" 
              className="h-10 w-auto block md:hidden" 
            />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 ml-4 md:ml-8 text-sm font-medium">
            {/* Desktop Navigation */}
            <Link 
              to="/leaderboard" 
              className="hidden md:flex px-4 py-2 rounded-lg transition-all hover:bg-primary/10 hover:text-primary text-foreground/70 hover:scale-105"
            >
              Leaderboard
            </Link>

            {/* Mobile Navigation Icons */}
            <Link to="/" className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all text-foreground/70 hover:text-primary">
              <Keyboard className="h-5 w-5" />
            </Link>
            <Link to="/leaderboard" className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all text-foreground/70 hover:text-primary">
              <Trophy className="h-5 w-5" />
            </Link>
            <button className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all text-foreground/70 hover:text-primary">
              <Info className="h-5 w-5" />
            </button>
            <button className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-all text-foreground/70 hover:text-primary">
              <SettingsIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
        <div className="flex justify-end gap-3 items-center flex-1">
          <ModeToggle />

          {!isLoading ? (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 ring-primary/50 transition-all">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="h-[40px] flex items-center">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => console.error('Login Failed')}
                  theme="filled_blue"
                  shape="pill"
                />
              </div>
            )
          ) : (
            <div className="h-9 w-9 rounded-full bg-secondary animate-pulse" />
          )}
        </div>
      </div>
    </header>
  )
}
