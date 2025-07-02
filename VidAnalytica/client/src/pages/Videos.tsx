import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getVideos, generateTranscript, generateIdeas, bulkGenerateTranscripts, bulkGenerateIdeas, Video } from "@/api/videos"
import { getChannels, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import {
  Search,
  FileText,
  Lightbulb,
  ExternalLink,
  Play,
  Eye,
  ThumbsUp,
  Calendar,
  Filter,
  Video as VideoIcon
} from "lucide-react"

export function Videos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [transcriptFilter, setTranscriptFilter] = useState<string>("")
  const [ideasFilter, setIdeasFilter] = useState<string>("")
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [processingVideos, setProcessingVideos] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [selectedChannel, transcriptFilter, ideasFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading videos and channels...')
      const [videosResponse, channelsResponse] = await Promise.all([
        getVideos({
          channelId: selectedChannel && selectedChannel !== "all" ? selectedChannel : undefined,
          transcriptStatus: transcriptFilter && transcriptFilter !== "all" ? transcriptFilter : undefined,
          ideasStatus: ideasFilter && ideasFilter !== "all" ? ideasFilter : undefined,
          search: searchTerm || undefined
        }),
        getChannels()
      ])
      setVideos(videosResponse.videos as Video[])
      setChannels(channelsResponse.channels as Channel[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTranscript = async (videoId: string) => {
    try {
      setProcessingVideos(prev => new Set(prev).add(videoId))
      console.log('Generating transcript for video:', videoId)
      await generateTranscript(videoId)
      toast({
        title: "Success",
        description: "Transcript generation started",
      })
      // Update video status
      setVideos(videos.map(v =>
        v._id === videoId ? { ...v, transcriptStatus: 'processing' } : v
      ))
    } catch (error) {
      console.error('Error generating transcript:', error)
      toast({
        title: "Error",
        description: "Failed to generate transcript",
        variant: "destructive",
      })
    } finally {
      setProcessingVideos(prev => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    }
  }

  const handleGenerateIdeas = async (videoId: string) => {
    try {
      setProcessingVideos(prev => new Set(prev).add(videoId))
      console.log('Generating ideas for video:', videoId)
      await generateIdeas(videoId)
      toast({
        title: "Success",
        description: "Ideas generation started",
      })
      // Update video status
      setVideos(videos.map(v =>
        v._id === videoId ? { ...v, ideasStatus: 'processing' } : v
      ))
    } catch (error) {
      console.error('Error generating ideas:', error)
      toast({
        title: "Error",
        description: "Failed to generate ideas",
        variant: "destructive",
      })
    } finally {
      setProcessingVideos(prev => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    }
  }

  const handleBulkTranscripts = async () => {
    try {
      const videoIds = Array.from(selectedVideos)
      console.log('Bulk generating transcripts for videos:', videoIds)
      await bulkGenerateTranscripts(videoIds)
      toast({
        title: "Success",
        description: `Transcript generation started for ${videoIds.length} videos`,
      })
      setSelectedVideos(new Set())
    } catch (error) {
      console.error('Error bulk generating transcripts:', error)
      toast({
        title: "Error",
        description: "Failed to generate transcripts",
        variant: "destructive",
      })
    }
  }

  const handleBulkIdeas = async () => {
    try {
      const videoIds = Array.from(selectedVideos)
      console.log('Bulk generating ideas for videos:', videoIds)
      await bulkGenerateIdeas(videoIds)
      toast({
        title: "Success",
        description: `Ideas generation started for ${videoIds.length} videos`,
      })
      setSelectedVideos(new Set())
    } catch (error) {
      console.error('Error bulk generating ideas:', error)
      toast({
        title: "Error",
        description: "Failed to generate ideas",
        variant: "destructive",
      })
    }
  }

  const toggleVideoSelection = (videoId: string) => {
    const newSelection = new Set(selectedVideos)
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId)
    } else {
      newSelection.add(videoId)
    }
    setSelectedVideos(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(videos.map(v => v._id)))
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const

    const colors = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Videos</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Videos
          </h1>
          <p className="text-muted-foreground">
            Manage video transcripts and generate content ideas
          </p>
        </div>
        {selectedVideos.size > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleBulkTranscripts} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Transcripts ({selectedVideos.size})
            </Button>
            <Button onClick={handleBulkIdeas} size="sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Ideas ({selectedVideos.size})
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="all">All Channels</SelectItem>
            {channels.map((channel) => (
              <SelectItem key={channel._id} value={channel._id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={transcriptFilter} onValueChange={setTranscriptFilter}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="Transcript Status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="all">All Transcripts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ideasFilter} onValueChange={setIdeasFilter}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="Ideas Status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="all">All Ideas</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Videos ({videos.length})</CardTitle>
          <CardDescription>
            Manage transcripts and ideas for your YouTube videos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedVideos.size === videos.length && videos.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Transcript</TableHead>
                <TableHead>Ideas</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedVideos.has(video._id)}
                      onCheckedChange={() => toggleVideoSelection(video._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-9 rounded object-cover"
                      />
                      <div className="max-w-xs">
                        <p className="font-medium line-clamp-2">{video.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Play className="h-3 w-3" />
                          {video.duration}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{video.channelName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatNumber(video.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {formatNumber(video.likes)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(video.transcriptStatus)}
                      {video.transcriptStatus === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateTranscript(video._id)}
                          disabled={processingVideos.has(video._id)}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(video.ideasStatus)}
                      {video.ideasStatus === 'completed' && (
                        <span className="text-sm text-muted-foreground">
                          ({video.ideasCount})
                        </span>
                      )}
                      {video.ideasStatus === 'pending' && video.transcriptStatus === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateIdeas(video._id)}
                          disabled={processingVideos.has(video._id)}
                        >
                          <Lightbulb className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No videos found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or add some YouTube channels first
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}