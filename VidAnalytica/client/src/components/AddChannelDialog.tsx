import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addChannel } from "@/api/channels"
import { useToast } from "@/hooks/useToast"
import { Loader2, Youtube } from "lucide-react"

interface AddChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChannelAdded: () => void
}

interface FormData {
  url: string
}

export function AddChannelDialog({ open, onOpenChange, onChannelAdded }: AddChannelDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      console.log('Adding channel:', data.url)
      
      const response = await addChannel(data) as any
      
      toast({
        title: "Success",
        description: response.message,
      })
      
      reset()
      onOpenChange(false)
      onChannelAdded()
    } catch (error) {
      console.error('Error adding channel:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add channel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Add YouTube Channel
          </DialogTitle>
          <DialogDescription>
            Enter the YouTube channel URL or handle to start analyzing videos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Channel URL or Handle</Label>
              <Input
                id="url"
                placeholder="https://youtube.com/@channelname or @channelname"
                {...register("url", { 
                  required: "Channel URL is required",
                  pattern: {
                    value: /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|c\/|user\/|@)|@)/,
                    message: "Please enter a valid YouTube channel URL or handle"
                  }
                })}
                className="bg-background/50"
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}