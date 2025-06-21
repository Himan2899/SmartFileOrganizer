"use client"

import { useState, useEffect } from "react"
import { FileUploader } from "@/components/file-uploader"
import { FileOrganizer } from "@/components/file-organizer"
import { Dashboard } from "@/components/dashboard"
import { Settings } from "@/components/settings"
import { DebugPanel } from "@/components/debug-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Upload, SettingsIcon, BarChart3, Download, Undo2, Bug } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import type { OrganizedFile, FileStats, OrganizationRules } from "@/types/file-organizer"
import { organizeFiles, generateZipDownload, calculateFileStats } from "@/lib/file-utils"

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([])
  const [organizedFiles, setOrganizedFiles] = useState<OrganizedFile[]>([])
  const [fileStats, setFileStats] = useState<FileStats>({
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    duplicates: 0,
    categories: {},
    aiClassifications: {},
    averageConfidence: 0,
  })
  const [organizationRules, setOrganizationRules] = useState<OrganizationRules>({
    organizeByType: true,
    organizeBySize: true,
    organizeByDate: true,
    detectDuplicates: true,
    aiClassification: false,
    customRules: [],
    ignoredTypes: [],
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<OrganizedFile[][]>([])
  const { toast } = useToast()

  // Load preferences from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem("organizationRules")
    if (savedRules) {
      setOrganizationRules(JSON.parse(savedRules))
    }
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("organizationRules", JSON.stringify(organizationRules))
  }, [organizationRules])

  const handleFilesUploaded = async (uploadedFiles: File[]) => {
    setFiles(uploadedFiles)
    setIsProcessing(true)

    try {
      // Save current state to history
      if (organizedFiles.length > 0) {
        setHistory((prev) => [...prev, organizedFiles])
      }

      console.log("🔄 Starting file organization with rules:", organizationRules)

      const organized = await organizeFiles(uploadedFiles, organizationRules)
      setOrganizedFiles(organized)

      const stats = calculateFileStats(organized)
      setFileStats(stats)

      // Log AI classification results for debugging
      const aiClassified = organized.filter((f) => f.aiClassification)
      console.log(`🧠 AI Classification Results: ${aiClassified.length}/${organized.length} files classified`)

      if (aiClassified.length > 0) {
        console.log(
          "AI Classifications:",
          aiClassified.map((f) => ({
            file: f.originalFile.name,
            category: f.aiClassification?.category,
            confidence: f.aiClassification?.confidence,
          })),
        )
      }

      toast({
        title: "Files Organized Successfully",
        description: `Organized ${uploadedFiles.length} files. ${aiClassified.length} files classified by AI.`,
      })

      // Show desktop notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("File Organization Complete", {
          body: `Successfully organized ${uploadedFiles.length} files`,
          icon: "/favicon.ico",
        })
      }
    } catch (error) {
      console.error("Organization error:", error)
      toast({
        title: "Organization Failed",
        description: "There was an error organizing your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadZip = async () => {
    if (organizedFiles.length === 0) {
      toast({
        title: "No Files to Download",
        description: "Please organize some files first.",
        variant: "destructive",
      })
      return
    }

    try {
      await generateZipDownload(organizedFiles)
      toast({
        title: "Download Started",
        description: "Your organized files are being downloaded as a ZIP archive.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error creating the ZIP file.",
        variant: "destructive",
      })
    }
  }

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1]
      setOrganizedFiles(previousState)
      setHistory((prev) => prev.slice(0, -1))

      const stats = calculateFileStats(previousState)
      setFileStats(stats)

      toast({
        title: "Undo Successful",
        description: "Reverted to previous organization state.",
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart File Organizer
              </h1>
              <p className="text-muted-foreground mt-2">
                Intelligently organize your files with AI-powered classification and advanced sorting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleUndo} disabled={history.length === 0} variant="outline" size="sm">
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button onClick={handleDownloadZip} disabled={organizedFiles.length === 0} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download ZIP
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="organize" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Organize
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Debug
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Files</CardTitle>
                  <CardDescription>
                    Drag and drop your files here or click to browse. Supports all file types.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader onFilesUploaded={handleFilesUploaded} isProcessing={isProcessing} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organize" className="space-y-6">
              <FileOrganizer organizedFiles={organizedFiles} isProcessing={isProcessing} />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard fileStats={fileStats} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Settings rules={organizationRules} onRulesChange={setOrganizationRules} />
            </TabsContent>

            <TabsContent value="debug" className="space-y-6">
              <DebugPanel />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
