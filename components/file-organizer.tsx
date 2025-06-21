"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FilePreview } from "@/components/file-preview"
import { AIClassificationPanel } from "@/components/ai-classification-panel"
import { Folder, FolderOpen, ChevronDown, ChevronRight, Eye, Brain, FolderTree } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { OrganizedFile } from "@/types/file-organizer"
import { formatFileSize, getFileIcon } from "@/lib/file-utils"

interface FileOrganizerProps {
  organizedFiles: OrganizedFile[]
  isProcessing: boolean
}

export function FileOrganizer({ organizedFiles, isProcessing }: FileOrganizerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [previewFile, setPreviewFile] = useState<OrganizedFile | null>(null)

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath)
      } else {
        newSet.add(folderPath)
      }
      return newSet
    })
  }

  const groupFilesByFolder = (files: OrganizedFile[]) => {
    const folders: { [key: string]: OrganizedFile[] } = {}

    files.forEach((file) => {
      const folderPath = file.organizationPath.split("/").slice(0, -1).join("/")
      if (!folders[folderPath]) {
        folders[folderPath] = []
      }
      folders[folderPath].push(file)
    })

    return folders
  }

  const handlePreviewFile = (file: OrganizedFile) => {
    console.log(`👁️ Opening preview for: ${file.originalFile.name}`)
    setPreviewFile(file)
  }

  const handleClosePreview = () => {
    console.log("❌ Closing file preview")
    setPreviewFile(null)
  }

  if (isProcessing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg font-medium">Organizing your files...</p>
            <p className="text-gray-500">AI classification in progress</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (organizedFiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Folder className="w-16 h-16 text-gray-400 mx-auto" />
            <p className="text-lg font-medium">No files organized yet</p>
            <p className="text-gray-500">Upload some files to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const folderGroups = groupFilesByFolder(organizedFiles)
  const aiClassifiedFiles = organizedFiles.filter((file) => file.aiClassification)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="folders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="folders" className="flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Folder View ({organizedFiles.length})
          </TabsTrigger>
          <TabsTrigger value="ai-classification" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Classification ({aiClassifiedFiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="folders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Organized Files ({organizedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(folderGroups).map(([folderPath, files]) => (
                <motion.div
                  key={folderPath}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg"
                >
                  <Collapsible open={expandedFolders.has(folderPath)} onOpenChange={() => toggleFolder(folderPath)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                        {expandedFolders.has(folderPath) ? (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2" />
                        )}
                        <Folder className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-medium">{folderPath || "Root"}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {files.length} files
                        </Badge>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="px-4 pb-4">
                      <div className="space-y-2 ml-6">
                        <AnimatePresence>
                          {files.map((file, index) => (
                            <motion.div
                              key={`${file.originalFile.name}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(file.originalFile.name)}
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{file.originalFile.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                                    <span>{formatFileSize(file.originalFile.size)}</span>
                                    <span>•</span>
                                    <span>{file.originalFile.type || "Unknown type"}</span>
                                    {file.isDuplicate && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="destructive" className="text-xs">
                                          Duplicate
                                        </Badge>
                                      </>
                                    )}
                                    {file.aiClassification && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                          <Brain className="w-3 h-3" />
                                          {file.aiClassification.category}
                                          <span className="text-xs">
                                            ({(file.aiClassification.confidence * 100).toFixed(0)}%)
                                          </span>
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreviewFile(file)}
                                  className="hover:bg-blue-100 dark:hover:bg-blue-900"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="sr-only">Preview {file.originalFile.name}</span>
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-classification" className="space-y-4">
          <AIClassificationPanel organizedFiles={organizedFiles} />
        </TabsContent>
      </Tabs>

      {previewFile && <FilePreview file={previewFile} onClose={handleClosePreview} />}
    </div>
  )
}
