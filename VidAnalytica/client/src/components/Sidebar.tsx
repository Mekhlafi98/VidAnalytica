import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Youtube, 
  Video, 
  FileText, 
  Lightbulb, 
  BarChart3, 
  Settings 
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Channels', href: '/channels', icon: Youtube },
  { name: 'Videos', href: '/videos', icon: Video },
  { name: 'Transcripts', href: '/transcripts', icon: FileText },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card/50 backdrop-blur-sm border-r border-border/50">
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}