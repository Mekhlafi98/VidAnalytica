import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/useToast"
import {
  Settings as SettingsIcon,
  Key,
  Bell,
  Download,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react"

export function Settings() {
  const [settings, setSettings] = useState({
    // API Settings
    youtubeApiKey: "",
    openaiApiKey: "",
    transcriptionService: "openai",
    
    // Automation Settings
    autoTranscript: true,
    autoIdeas: false,
    syncFrequency: "daily",
    
    // Notification Settings
    emailNotifications: true,
    processCompleteNotifications: true,
    errorNotifications: true,
    
    // Export Settings
    defaultExportFormat: "pdf",
    includeTimestamps: true,
    
    // Custom Prompts
    ideasPrompt: "Extract key insights, actionable takeaways, and content ideas from this transcript. Categorize them as main concepts, actionable insights, content suggestions, or key takeaways."
  })

  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async () => {
    try {
      console.log('Exporting data...')
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Data export started. You'll receive an email when ready.",
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const handleClearData = async () => {
    try {
      console.log('Clearing data...')
      // Simulate data clearing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Data cleared successfully",
      })
    } catch (error) {
      console.error('Error clearing data:', error)
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your YouTube analysis preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure your API keys for YouTube and AI services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-api">YouTube Data API Key</Label>
                <Input
                  id="youtube-api"
                  type="password"
                  placeholder="Enter your YouTube Data API key"
                  value={settings.youtubeApiKey}
                  onChange={(e) => setSettings({...settings, youtubeApiKey: e.target.value})}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Required for fetching channel and video data from YouTube
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-api">OpenAI API Key</Label>
                <Input
                  id="openai-api"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Used for transcription and AI-powered content analysis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcription-service">Transcription Service</Label>
                <Select
                  value={settings.transcriptionService}
                  onValueChange={(value) => setSettings({...settings, transcriptionService: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    <SelectItem value="openai">OpenAI Whisper</SelectItem>
                    <SelectItem value="google">Google Speech-to-Text</SelectItem>
                    <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Automation Settings
              </CardTitle>
              <CardDescription>
                Configure automatic processing and sync settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate Transcripts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically generate transcripts for new videos
                  </p>
                </div>
                <Switch
                  checked={settings.autoTranscript}
                  onCheckedChange={(checked) => setSettings({...settings, autoTranscript: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-generate Ideas</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically extract ideas from completed transcripts
                  </p>
                </div>
                <Switch
                  checked={settings.autoIdeas}
                  onCheckedChange={(checked) => setSettings({...settings, autoIdeas: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label>Channel Sync Frequency</Label>
                <Select
                  value={settings.syncFrequency}
                  onValueChange={(value) => setSettings({...settings, syncFrequency: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often to check for new videos in your channels
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose when and how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about processing status
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Process Complete Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when transcripts and ideas are ready
                  </p>
                </div>
                <Switch
                  checked={settings.processCompleteNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, processCompleteNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Error Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when processing fails
                  </p>
                </div>
                <Switch
                  checked={settings.errorNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, errorNotifications: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Custom AI Prompts</CardTitle>
              <CardDescription>
                Customize the prompts used for AI-powered content analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ideas-prompt">Ideas Extraction Prompt</Label>
                <Textarea
                  id="ideas-prompt"
                  placeholder="Enter your custom prompt for extracting ideas..."
                  value={settings.ideasPrompt}
                  onChange={(e) => setSettings({...settings, ideasPrompt: e.target.value})}
                  className="min-h-32 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be used to extract and categorize ideas from video transcripts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your data or clear stored information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Export Format</Label>
                <Select
                  value={settings.defaultExportFormat}
                  onValueChange={(value) => setSettings({...settings, defaultExportFormat: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Timestamps</Label>
                  <p className="text-sm text-muted-foreground">
                    Include timestamps in transcript exports
                  </p>
                </div>
                <Switch
                  checked={settings.includeTimestamps}
                  onCheckedChange={(checked) => setSettings({...settings, includeTimestamps: checked})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleExportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
                <Button onClick={handleClearData} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}