import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"
import { Dashboard } from "./pages/Dashboard"
import { Channels } from "./pages/Channels"
import { Videos } from "./pages/Videos"
import { Transcripts } from "./pages/Transcripts"
import { Ideas } from "./pages/Ideas"
import { Analytics } from "./pages/Analytics"
import { Settings } from "./pages/Settings"

function App() {
  return (
  <AuthProvider>
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="channels" element={<Channels />} />
            <Route path="videos" element={<Videos />} />
            <Route path="transcripts" element={<Transcripts />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App