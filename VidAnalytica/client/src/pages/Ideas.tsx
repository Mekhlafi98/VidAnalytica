import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getIdeas, updateIdeaRating, toggleIdeaFavorite, exportIdeas, Idea } from "@/api/ideas"
import { getChannels, Channel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import {
  Search,
  Star,
  Heart,
  Download,
  Filter,
  Lightbulb,
  Target,
  FileText,
  Key
} from "lucide-react"

const categoryIcons = {
  'main-concept': Lightbulb,
  'actionable-insight': Target,
  'content-suggestion': FileText,
  'key-takeaway': Key
}

const categoryColors = {
  'main-concept': 'text-yellow-600 bg-yellow-100',
  'actionable-insight': 'text-blue-600 bg-blue-100',
  'content-suggestion': 'text-green-600 bg-green-100',
  'key-takeaway': 'text-purple-600 bg-purple-100'
}

export function Ideas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [showFavorites, setShowFavorites] = useState(false)
  // 🟢 state starts at "all"

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [selectedChannel, categoryFilter, showFavorites])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('Loading ideas and channels...')
      const [ideasResponse, channelsResponse] = await Promise.all([
        getIdeas({
          channelId: selectedChannel !== "all" ? selectedChannel : undefined,
          category: categoryFilter && categoryFilter !== "all" ? categoryFilter : undefined,
          search: searchTerm || undefined
        }),
        getChannels()
      ])
      let filteredIdeas = ideasResponse.ideas as Idea[]
      if (showFavorites) {
        filteredIdeas = filteredIdeas.filter(idea => idea.isFavorite)
      }
      setIdeas(filteredIdeas)
      setChannels(channelsResponse.channels as Channel[])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load ideas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = async (ideaId: string, rating: number) => {
    try {
      console.log('Updating idea rating:', ideaId, rating)
      await updateIdeaRating(ideaId, rating)
      setIdeas(ideas.map(idea =>
        idea._id === ideaId ? { ...idea, rating } : idea
      ))
      toast({
        title: "Success",
        description: "Rating updated successfully",
      })
    } catch (error) {
      console.error('Error updating rating:', error)
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async (ideaId: string, isFavorite: boolean) => {
    try {
      console.log('Toggling favorite:', ideaId, !isFavorite)
      await toggleIdeaFavorite(ideaId, !isFavorite)
      setIdeas(ideas.map(idea =>
        idea._id === ideaId ? { ...idea, isFavorite: !isFavorite } : idea
      ))
      toast({
        title: "Success",
        description: isFavorite ? "Removed from favorites" : "Added to favorites",
      })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      console.log('Exporting ideas:', format)
      const response = await exportIdeas(format, {
        channelId: selectedChannel || undefined,
        category: categoryFilter || undefined,
        search: searchTerm || undefined
      })
      window.open(response.downloadUrl as string, '_blank')
      toast({
        title: "Success",
        description: `Ideas exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error exporting ideas:', error)
      toast({
        title: "Error",
        description: "Failed to export ideas",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number, ideaId: string) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(ideaId, star)}
            className="hover:scale-110 transition-transform"
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Ideas</h1>
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
            Ideas Library
          </h1>
          <p className="text-muted-foreground">
            Explore and organize content ideas extracted from videos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search ideas..."
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
            <SelectItem value="">All Channels</SelectItem>
            {channels.map((channel) => (
              <SelectItem key={channel._id} value={channel._id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-48 bg-background/50">
            {/* placeholder is only shown while value === "all" but you can omit it if you like */}
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>

          <SelectContent className="bg-background/95 backdrop-blur-sm">
            {/* 🟢 non‑empty value */}
            <SelectItem value="all">All Channels</SelectItem>

            {channels.map((channel) => (
              <SelectItem key={channel._id} value={channel._id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showFavorites ? "default" : "outline"}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <Heart className={`h-4 w-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => {
          const CategoryIcon = categoryIcons[idea.category]
          const categoryColor = categoryColors[idea.category]
          
          return (
            <Card key={idea._id} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {idea.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleFavorite(idea._id, idea.isFavorite)}
                    className="h-8 w-8"
                  >
                    <Heart className={`h-4 w-4 ${idea.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
                <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {idea.videoTitle} • {idea.channelName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {idea.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {idea.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {idea.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{idea.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {renderStars(idea.rating, idea._id)}
                  <span className="text-xs text-muted-foreground">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {ideas.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No ideas found</h3>
          <p className="text-muted-foreground">
            {showFavorites
              ? "You haven't favorited any ideas yet"
              : "Try adjusting your filters or generate some ideas first"}
          </p>
        </div>
      )}
    </div>
  )
}