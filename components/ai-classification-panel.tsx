"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Brain, ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { useState } from "react"
import type { OrganizedFile } from "@/types/file-organizer"

interface AIClassificationPanelProps {
  organizedFiles: OrganizedFile[]
}

export function AIClassificationPanel({ organizedFiles }: AIClassificationPanelProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const aiClassifiedFiles = organizedFiles.filter((file) => file.aiClassification)

  if (aiClassifiedFiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Classification Results
          </CardTitle>
          <CardDescription>
            No files have been classified with AI yet. Enable AI classification in settings to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const toggleFileExpansion = (fileName: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(fileName)) {
        newSet.delete(fileName)
      } else {
        newSet.add(fileName)
      }
      return newSet
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.6) return "Medium"
    return "Low"
  }

  // Group files by AI category
  const groupedByCategory = aiClassifiedFiles.reduce(
    (acc, file) => {
      const category = file.aiClassification!.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(file)
      return acc
    },
    {} as Record<string, OrganizedFile[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Classification Results
          <Badge variant="secondary" className="ml-auto">
            {aiClassifiedFiles.length} files classified
          </Badge>
        </CardTitle>
        <CardDescription>Documents automatically classified using OpenAI's advanced language models</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, files]) => (
          <div key={category} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="font-semibold capitalize">{category.replace("-", " ")}</h3>
                <Badge variant="outline">{files.length} files</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Avg. Confidence:{" "}
                {((files.reduce((sum, f) => sum + f.aiClassification!.confidence, 0) / files.length) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={`${file.originalFile.name}-${index}`} className="border rounded-lg">
                  <Collapsible
                    open={expandedFiles.has(file.originalFile.name)}
                    onOpenChange={() => toggleFileExpansion(file.originalFile.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                        {expandedFiles.has(file.originalFile.name) ? (
                          <ChevronDown className="w-4 h-4 mr-2" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-left">{file.originalFile.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge
                                  variant="outline"
                                  className={getConfidenceColor(file.aiClassification!.confidence)}
                                >
                                  {getConfidenceLabel(file.aiClassification!.confidence)} Confidence
                                </Badge>
                                {file.aiClassification!.subcategory && (
                                  <Badge variant="secondary" className="text-xs">
                                    {file.aiClassification!.subcategory}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {(file.aiClassification!.confidence * 100).toFixed(0)}%
                              </div>
                              <Progress value={file.aiClassification!.confidence * 100} className="w-16 h-2" />
                            </div>
                          </div>
                        </div>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="px-3 pb-3">
                      <div className="ml-6 space-y-3 pt-2 border-t">
                        <div>
                          <h4 className="text-sm font-medium mb-1">AI Reasoning:</h4>
                          <p className="text-sm text-muted-foreground">{file.aiClassification!.reasoning}</p>
                        </div>

                        {file.aiClassification!.extractedText && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Content Preview:</h4>
                            <div className="bg-muted p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                              {file.aiClassification!.extractedText}
                            </div>
                          </div>
                        )}

                        {file.aiClassification!.metadata && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {file.aiClassification!.metadata.wordCount && (
                              <div>
                                <span className="font-medium">Word Count:</span>{" "}
                                {file.aiClassification!.metadata.wordCount}
                              </div>
                            )}
                            {file.aiClassification!.metadata.pageCount && (
                              <div>
                                <span className="font-medium">Est. Pages:</span>{" "}
                                {file.aiClassification!.metadata.pageCount}
                              </div>
                            )}
                            {file.aiClassification!.metadata.language && (
                              <div>
                                <span className="font-medium">Language:</span>{" "}
                                {file.aiClassification!.metadata.language.toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <strong>Suggested Folder:</strong> {file.organizationPath.split("/").slice(0, -1).join("/")}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
