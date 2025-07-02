import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getChannels, deleteChannel, syncChannel, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import {
  Plus,
  Search,
  MoreVertical,
  RefreshCw,
  Trash2,
  ExternalLink,
  Users,
  Video,
  Calendar
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddChannelDialog } from "@/components/AddChannelDialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function Channels() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null)
  const [syncingChannels, setSyncingChannels] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadChannels()
  }, [])

  const loadChannels = async () => {
    try {
      setLoading(true)
      console.log('Loading channels...')
      const response = await getChannels()
      setChannels(response.channels as Channel[])
    } catch (error) {
      console.error('Error loading channels:', error)
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChannel = async (channelId: string) => {
    try {
      console.log('Deleting channel:', channelId)
      await deleteChannel(channelId)
      setChannels(channels.filter(c => c._id !== channelId))
      toast({
        title: "Success",
        description: "Channel deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting channel:', error)
      toast({
        title: "Error",
        description: "Failed to delete channel",
        variant: "destructive",
      })
    }
    setChannelToDelete(null)
  }

  const handleSyncChannel = async (channelId: string) => {
    try {
      setSyncingChannels(prev => new Set(prev).add(channelId))
      console.log('Syncing channel:', channelId)
      await syncChannel(channelId)
      toast({
        title: "Success",
        description: "Channel sync started",
      })
      // Update channel status
      setChannels(channels.map(c =>
        c._id === channelId ? { ...c, status: 'syncing' as const } : c
      ))
    } catch (error) {
      console.error('Error syncing channel:', error)
      toast({
        title: "Error",
        description: "Failed to sync channel",
        variant: "destructive",
      })
    } finally {
      setSyncingChannels(prev => {
        const newSet = new Set(prev)
        newSet.delete(channelId)
        return newSet
      })
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.handle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Channels</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                </div>
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
            Channels
          </h1>
          <p className="text-muted-foreground">
            Manage your YouTube channels and sync video data
          </p>
        </div>
        <Button onClick={() => setShowAddChannel(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChannels.map((channel) => (
          <Card key={channel._id} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={channel.avatar}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">{channel.name}</CardTitle>
                    <CardDescription>{channel.handle}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm">
                    <DropdownMenuItem onClick={() => handleSyncChannel(channel._id)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Videos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(channel.url, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Channel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setChannelToDelete(channel._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={channel.status === 'active' ? 'default' : channel.status === 'syncing' ? 'secondary' : 'destructive'}>
                  {channel.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(channel.lastSync).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{formatNumber(channel.subscriberCount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>{channel.totalVideos} videos</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Videos Analyzed</span>
                  <span>{channel.videosAnalyzed}/{channel.totalVideos}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(channel.videosAnalyzed / channel.totalVideos) * 100}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChannels.length === 0 && !loading && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No channels found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first YouTube channel"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddChannel(true)} className="mt-4">
              Add Channel
            </Button>
          )}
        </div>
      )}

      <AddChannelDialog
        open={showAddChannel}
        onOpenChange={setShowAddChannel}
        onChannelAdded={loadChannels}
      />

      <AlertDialog open={!!channelToDelete} onOpenChange={() => setChannelToDelete(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the channel
              and all associated video data, transcripts, and ideas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => channelToDelete && handleDeleteChannel(channelToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}