import { Link } from "react-router-dom"
import { ModeToggle } from "@/components/mode-toggle"
import { Keyboard, LogOut, User as UserIcon } from "lucide-react"
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

export function Navbar() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthStore()

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold group group-hover:opacity-90 transition-opacity">
            <Keyboard className="h-6 w-6 text-primary" />
            <span className="leading-none tracking-tight text-xl">
              Campus Type
            </span>
          </Link>
          <nav className="flex items-center gap-6 ml-8 text-sm font-medium">
            <Link to="/leaderboard" className="transition-colors hover:text-primary text-foreground/70">Leaderboard</Link>
          </nav>
        </div>
        <div className="flex justify-end gap-3 items-center flex-1">
          <div className="hidden md:flex text-xs text-muted-foreground mr-2 font-mono border px-2 py-1 rounded-md bg-muted/50">
            Ctrl K
          </div>
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
