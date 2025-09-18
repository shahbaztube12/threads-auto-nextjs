"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/app/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReplyTemplate {
  id: string
  name: string
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ReplyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<ReplyTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates")
      const data = await response.json()

      if (response.ok) {
        setTemplates(data.templates)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (formData: FormData) => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          content: formData.get("content"),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template created successfully",
        })
        setShowCreateDialog(false)
        fetchTemplates()
      } else {
        throw new Error("Failed to create template")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTemplate = async (id: string, formData: FormData) => {
    try {
      const response = await fetch("/api/templates", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: formData.get("name"),
          content: formData.get("content"),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template updated successfully",
        })
        setEditingTemplate(null)
        fetchTemplates()
      } else {
        throw new Error("Failed to update template")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch("/api/templates", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        })
        fetchTemplates()
      } else {
        throw new Error("Failed to delete template")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <DashboardHeader
        title="Reply Templates"
        description="Create and manage reusable reply templates for your auto-replies"
        action={
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reply Template</DialogTitle>
                <DialogDescription>Create a new template for automated replies</DialogDescription>
              </DialogHeader>
              <form action={handleCreateTemplate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Welcome Message" required />
                </div>
                <div>
                  <Label htmlFor="content">Reply Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Thanks for your message! I'll get back to you soon."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Template</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : templates.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Templates Created</CardTitle>
              <CardDescription>
                Create your first reply template to get started with automated responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCreateDialog(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {editingTemplate && (
          <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Template</DialogTitle>
                <DialogDescription>Update your reply template</DialogDescription>
              </DialogHeader>
              <form action={(formData) => handleUpdateTemplate(editingTemplate.id, formData)} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input id="edit-name" name="name" defaultValue={editingTemplate.name} required />
                </div>
                <div>
                  <Label htmlFor="edit-content">Reply Content</Label>
                  <Textarea id="edit-content" name="content" defaultValue={editingTemplate.content} rows={4} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Template</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  )
}
