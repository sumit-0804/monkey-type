import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/components/layout/layout"
import Home from "@/pages/Home"
import Profile from "@/pages/Profile"
import Leaderboard from "@/pages/Leaderboard"
import { useAuthStore } from "@/store/useAuthStore"
import { useKeepAlive } from "@/hooks/useKeepAlive"

function App() {
  const fetchSession = useAuthStore((state) => state.fetchSession)
  
  // Keep backend server alive on Render free tier
  useKeepAlive(30000)

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
