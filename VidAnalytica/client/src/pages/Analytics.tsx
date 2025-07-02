import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getChannelAnalytics, getIdeasAnalytics, ChannelAnalytics } from "@/api/analytics"
import { getChannels, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  TrendingUp,
  Users,
  Video,
  FileText,
  Lightbulb,
  Calendar,
  Target
} from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function Analytics() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [channelAnalytics, setChannelAnalytics] = useState<ChannelAnalytics | null>(null)
  const [ideasAnalytics, setIdeasAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadChannels()
  }, [])

  useEffect(() => {
    if (selectedChannel) {
      loadChannelAnalytics()
    }
    loadIdeasAnalytics()
  }, [selectedChannel])

  const loadChannels = async () => {
    try {
      console.log('Loading channels...')
      const response = await getChannels()
      const channelsList = response.channels as Channel[]
      setChannels(channelsList)
      if (channelsList.length > 0) {
        setSelectedChannel(channelsList[0]._id)
      }
    } catch (error) {
      console.error('Error loading channels:', error)
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      })
    }
  }

  const loadChannelAnalytics = async () => {
    if (!selectedChannel) return

    try {
      setLoading(true)
      console.log('Loading channel analytics:', selectedChannel)
      const response = await getChannelAnalytics(selectedChannel)
      setChannelAnalytics(response.analytics as ChannelAnalytics)
    } catch (error) {
      console.error('Error loading channel analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load channel analytics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadIdeasAnalytics = async () => {
    try {
      console.log('Loading ideas analytics...')
      const response = await getIdeasAnalytics()
      setIdeasAnalytics(response.analytics)
    } catch (error) {
      console.error('Error loading ideas analytics:', error)
      toast({
        title: "Error",
        description: "Failed to load ideas analytics",
        variant: "destructive",
      })
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your content
          </p>
        </div>
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-64 bg-background/50">
            <SelectValue placeholder="Select Channel" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            {channels.map((channel) => (
              <SelectItem key={channel._id} value={channel._id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {channelAnalytics && (
        <>
          {/* Channel Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(channelAnalytics.metrics.averageViews)}</div>
                <p className="text-xs text-muted-foreground">Per video</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.metrics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">Average engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upload Frequency</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.metrics.uploadFrequency}</div>
                <p className="text-xs text-muted-foreground">Videos per week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ideas Generated</CardTitle>
                <Lightbulb className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{channelAnalytics.metrics.ideasGenerated}</div>
                <p className="text-xs text-muted-foreground">Total ideas</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Views and engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={channelAnalytics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Topics */}
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
              <CardDescription>Most discussed topics in your content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={channelAnalytics.topTopics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Ideas Analytics */}
      {ideasAnalytics && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Ideas by Category</CardTitle>
              <CardDescription>Distribution of idea types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ideasAnalytics.categoriesBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ideasAnalytics.categoriesBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Ideas Generation Trends</CardTitle>
              <CardDescription>Ideas generated over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ideasAnalytics.trendsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ideas" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Top Performing Channels</CardTitle>
              <CardDescription>Channels by ideas generated</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ideasAnalytics.topChannels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="channelName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ideasCount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Ideas Summary</CardTitle>
              <CardDescription>Overall statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Ideas</span>
                <span className="text-2xl font-bold">{ideasAnalytics.totalIdeas}</span>
              </div>
              <div className="space-y-2">
                {ideasAnalytics.categoriesBreakdown.map((category: any) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{category.category.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{category.count}</span>
                      <span className="text-xs text-muted-foreground">({category.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}