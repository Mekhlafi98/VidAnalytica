import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats, DashboardStats } from "@/api/analytics"
import { getChannels, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import { 
  Youtube, 
  Video, 
  Lightbulb, 
  FileText, 
  Plus, 
  Users, 
  TrendingUp,
  Clock
} from "lucide-react"
import { AddChannelDialog } from "@/components/AddChannelDialog"

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddChannel, setShowAddChannel] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, channelsResponse] = await Promise.all([
        getDashboardStats(),
        getChannels()
      ])
      setStats(statsResponse.stats as DashboardStats)
      setChannels(channelsResponse.channels as Channel[])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'channel_added': return <Youtube className="h-4 w-4 text-red-500" />
      case 'transcript_completed': return <FileText className="h-4 w-4 text-blue-500" />
      case 'ideas_generated': return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case 'sync_completed': return <TrendingUp className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                <div className="h-3 w-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your YouTube Video Analysis hub
          </p>
        </div>
        <Button onClick={() => setShowAddChannel(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <Youtube className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalChannels}</div>
            <p className="text-xs text-muted-foreground">
              Active YouTube channels
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Videos processed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transcripts</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTranscripts}</div>
            <p className="text-xs text-muted-foreground">
              Generated transcripts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ideas Generated</CardTitle>
            <Lightbulb className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIdeas}</div>
            <p className="text-xs text-muted-foreground">
              Content ideas extracted
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Channels Overview */}
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Your Channels
            </CardTitle>
            <CardDescription>
              Overview of your YouTube channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {channels.slice(0, 3).map((channel) => (
              <div key={channel._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <img 
                    src={channel.avatar} 
                    alt={channel.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{channel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(channel.subscriberCount)} subscribers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                    {channel.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {channel.videosAnalyzed}/{channel.totalVideos} analyzed
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and processing results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AddChannelDialog 
        open={showAddChannel} 
        onOpenChange={setShowAddChannel}
        onChannelAdded={loadDashboardData}
      />
    </div>
  )
}