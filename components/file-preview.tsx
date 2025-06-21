"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Download, FileText, ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import type { OrganizedFile } from "@/types/file-organizer"
import { formatFileSize } from "@/lib/file-utils"

interface FilePreviewProps {
  file: OrganizedFile
  onClose: () => void
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"image" | "text" | "unsupported" | "loading">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setPreviewType("loading")
        setError(null)
        setPreviewContent(null)

        const fileType = (file.originalFile.type || "").toLowerCase()
        const fileName = file.originalFile.name.toLowerCase()

        console.log(`🔍 Loading preview for: ${file.originalFile.name} (${fileType})`)

        // Check if it's an image
        if (fileType.startsWith("image/") || isImageFile(fileName)) {
          setPreviewType("image")
          const url = URL.createObjectURL(file.originalFile)
          setPreviewContent(url)
          console.log("✅ Image preview loaded")
          return
        }

        // Check if it's a text file
        if (isTextFile(fileType, fileName)) {
          setPreviewType("text")
          try {
            const text = await file.originalFile.text()
            setPreviewContent(text)
            console.log(`✅ Text preview loaded (${text.length} characters)`)
            return
          } catch (textError) {
            console.error("❌ Error reading text content:", textError)
            setError("Failed to read file content")
          }
        }

        // Unsupported file type
        setPreviewType("unsupported")
        console.log("⚠️ Unsupported file type for preview")
      } catch (error) {
        console.error("❌ Preview loading error:", error)
        setError("Failed to load file preview")
        setPreviewType("unsupported")
      }
    }

    loadPreview()

    // Cleanup function to revoke object URLs
    return () => {
      if (previewContent && previewType === "image" && previewContent.startsWith("blob:")) {
        URL.revokeObjectURL(previewContent)
      }
    }
  }, [file])

  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".ico", ".tiff"]
    return imageExtensions.some((ext) => fileName.endsWith(ext))
  }

  const isTextFile = (fileType: string, fileName: string): boolean => {
    // Check MIME type
    if (
      fileType.startsWith("text/") ||
      fileType === "application/json" ||
      fileType === "application/javascript" ||
      fileType === "application/xml"
    ) {
      return true
    }

    // Check file extension
    const textExtensions = [
      ".txt",
      ".md",
      ".json",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".html",
      ".htm",
      ".css",
      ".scss",
      ".sass",
      ".xml",
      ".yaml",
      ".yml",
      ".csv",
      ".log",
      ".ini",
      ".conf",
      ".config",
    ]

    return textExtensions.some((ext) => fileName.endsWith(ext))
  }

  const downloadFile = () => {
    try {
      const url = URL.createObjectURL(file.originalFile)
      const a = document.createElement("a")
      a.href = url
      a.download = file.originalFile.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log(`📥 Downloaded: ${file.originalFile.name}`)
    } catch (error) {
      console.error("❌ Download error:", error)
    }
  }

  const getFileTypeIcon = () => {
    if (previewType === "image") return <ImageIcon className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-blue-500" />
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileTypeIcon()}
              <span className="truncate">{file.originalFile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* File metadata */}
        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
          <Badge variant="outline">{formatFileSize(file.originalFile.size)}</Badge>
          <Badge variant="outline">{file.originalFile.type || "Unknown type"}</Badge>
          {file.isDuplicate && <Badge variant="destructive">Duplicate</Badge>}
          {file.aiClassification && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🧠 {file.aiClassification.category} ({(file.aiClassification.confidence * 100).toFixed(0)}%)
            </Badge>
          )}
          <Badge variant="outline">{file.sizeCategory}</Badge>
        </div>

        {/* Preview content */}
        <div className="flex-1 min-h-0">
          {previewType === "loading" && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
                <div>
                  <p className="font-medium text-red-600">Preview Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          )}

          {previewType === "image" && previewContent && !error && (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
              <img
                src={previewContent || "/placeholder.svg"}
                alt={file.originalFile.name}
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  setError("Failed to load image")
                  setPreviewType("unsupported")
                }}
                onLoad={() => console.log("✅ Image rendered successfully")}
              />
            </div>
          )}

          {previewType === "text" && previewContent && !error && (
            <ScrollArea className="h-full border rounded-lg">
              <div className="p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono break-words">{previewContent}</pre>
              </div>
            </ScrollArea>
          )}

          {previewType === "unsupported" && !error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <FileText className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium">Preview not available</p>
                  <p className="text-sm text-muted-foreground">This file type cannot be previewed in the browser</p>
                  <p className="text-sm text-muted-foreground">Click download to view the file</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File details */}
        <div className="flex-shrink-0 mt-4 pt-4 border-t space-y-2 text-sm text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Organization Path:</strong> {file.organizationPath}
              </p>
              <p>
                <strong>File Hash:</strong> {file.hash.substring(0, 16)}...
              </p>
            </div>
            <div>
              {file.metadata && (
                <p>
                  <strong>Last Modified:</strong> {new Date(file.metadata.lastModified).toLocaleString()}
                </p>
              )}
              {file.aiClassification?.reasoning && (
                <p>
                  <strong>AI Reasoning:</strong> {file.aiClassification.reasoning}
                </p>
              )}
            </div>
          </div>

          {file.aiClassification?.extractedText && (
            <div className="mt-4">
              <p className="font-medium mb-2">AI Extracted Content Preview:</p>
              <div className="bg-muted p-3 rounded text-xs font-mono max-h-24 overflow-y-auto">
                {file.aiClassification.extractedText}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
