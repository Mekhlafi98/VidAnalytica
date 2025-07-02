import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getTranscripts, getTranscript, updateTranscript, exportTranscript, Transcript } from "@/api/transcripts"
import { getChannels, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import {
  Search,
  FileText,
  Download,
  Edit,
  Save,
  X,
  Clock,
  User
} from "lucide-react"

export function Transcripts() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)
  const [editingTranscript, setEditingTranscript] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [selectedChannel, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading transcripts and channels...')
      const [transcriptsResponse, channelsResponse] = await Promise.all([
        getTranscripts({
          channelId: selectedChannel && selectedChannel !== "all" ? selectedChannel : undefined,
          status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined
        }),
        getChannels()
      ])
      setTranscripts(transcriptsResponse.transcripts as Transcript[])
      setChannels(channelsResponse.channels as Channel[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load transcripts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewTranscript = async (transcriptId: string) => {
    try {
      console.log('Loading transcript details:', transcriptId)
      const response = await getTranscript(transcriptId)
      setSelectedTranscript(response.transcript as Transcript)
    } catch (error) {
      console.error('Error loading transcript:', error)
      toast({
        title: "Error",
        description: "Failed to load transcript details",
        variant: "destructive",
      })
    }
  }

  const handleEditTranscript = (transcript: Transcript) => {
    setEditingTranscript(transcript._id)
    setEditContent(transcript.content)
  }

  const handleSaveTranscript = async () => {
    if (!editingTranscript) return

    try {
      console.log('Updating transcript:', editingTranscript)
      await updateTranscript(editingTranscript, { content: editContent })
      
      // Update local state
      setTranscripts(transcripts.map(t =>
        t._id === editingTranscript ? { ...t, content: editContent } : t
      ))
      
      if (selectedTranscript && selectedTranscript._id === editingTranscript) {
        setSelectedTranscript({ ...selectedTranscript, content: editContent })
      }

      setEditingTranscript(null)
      setEditContent("")
      
      toast({
        title: "Success",
        description: "Transcript updated successfully",
      })
    } catch (error) {
      console.error('Error updating transcript:', error)
      toast({
        title: "Error",
        description: "Failed to update transcript",
        variant: "destructive",
      })
    }
  }

  const handleExportTranscript = async (transcriptId: string, format: 'txt' | 'pdf') => {
    try {
      console.log('Exporting transcript:', transcriptId, format)
      const response = await exportTranscript(transcriptId, format)
      window.open(response.downloadUrl as string, '_blank')
      toast({
        title: "Success",
        description: `Transcript exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error exporting transcript:', error)
      toast({
        title: "Error",
        description: "Failed to export transcript",
        variant: "destructive",
      })
    }
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

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transcripts</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
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
            Transcripts
          </h1>
          <p className="text-muted-foreground">
            View and edit video transcripts
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search transcripts..."
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm">
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {transcripts.map((transcript) => (
          <Card key={transcript._id} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{transcript.videoTitle}</CardTitle>
                  <CardDescription>{transcript.channelName}</CardDescription>
                </div>
                {getStatusBadge(transcript.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground line-clamp-3">
                {transcript.content.substring(0, 150)}...
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(transcript.createdAt).toLocaleDateString()}</span>
                <span>{transcript.timestamps?.length || 0} segments</span>
              </div>

              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTranscript(transcript._id)}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] bg-background/95 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle>{selectedTranscript?.videoTitle}</DialogTitle>
                      <DialogDescription>
                        {selectedTranscript?.channelName} • {selectedTranscript && new Date(selectedTranscript.createdAt).toLocaleDateString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto">
                      {editingTranscript === selectedTranscript?._id ? (
                        <div className="space-y-4">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-96 bg-background/50"
                            placeholder="Edit transcript content..."
                          />
                          <div className="flex gap-2">
                            <Button onClick={handleSaveTranscript} size="sm">
                              <Save className="h-3 w-3 mr-2" />
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingTranscript(null)
                                setEditContent("")
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-3 w-3 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => selectedTranscript && handleEditTranscript(selectedTranscript)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => selectedTranscript && handleExportTranscript(selectedTranscript._id, 'txt')}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-3 w-3 mr-2" />
                              TXT
                            </Button>
                            <Button
                              onClick={() => selectedTranscript && handleExportTranscript(selectedTranscript._id, 'pdf')}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-3 w-3 mr-2" />
                              PDF
                            </Button>
                          </div>
                          
                          {selectedTranscript?.timestamps && selectedTranscript.timestamps.length > 0 ? (
                            <div className="space-y-3">
                              {selectedTranscript.timestamps.map((segment, index) => (
                                <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-20">
                                    <Clock className="h-3 w-3" />
                                    {formatTimestamp(segment.start)}
                                  </div>
                                  {segment.speaker && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-16">
                                      <User className="h-3 w-3" />
                                      {segment.speaker}
                                    </div>
                                  )}
                                  <div className="flex-1 text-sm">{segment.text}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-sm">{selectedTranscript?.content}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExportTranscript(transcript._id, 'txt')}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {transcripts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No transcripts found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or generate some transcripts first
          </p>
        </div>
      )}
    </div>
  )
}