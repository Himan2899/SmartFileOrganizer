import type { OrganizedFile, FileStats, OrganizationRules } from "@/types/file-organizer"
import React from "react"
import { ImageIcon, FileText, Video, Music, Archive } from "lucide-react"
import JSZip from "jszip"
import { classifyMultipleFiles, type DocumentAnalysis, type ClassificationResult } from "./ai-classification"

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"]
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"]
  const audioExts = ["mp3", "wav", "flac", "aac", "ogg"]
  const archiveExts = ["zip", "rar", "7z", "tar", "gz"]

  if (imageExts.includes(extension || "")) {
    return React.createElement(ImageIcon, { className: "w-5 h-5 text-green-500" })
  } else if (videoExts.includes(extension || "")) {
    return React.createElement(Video, { className: "w-5 h-5 text-red-500" })
  } else if (audioExts.includes(extension || "")) {
    return React.createElement(Music, { className: "w-5 h-5 text-purple-500" })
  } else if (archiveExts.includes(extension || "")) {
    return React.createElement(Archive, { className: "w-5 h-5 text-orange-500" })
  } else {
    return React.createElement(FileText, { className: "w-5 h-5 text-blue-500" })
  }
}

export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export function categorizeFileSize(size: number): "small" | "medium" | "large" {
  if (size < 1024 * 1024) return "small" // < 1MB
  if (size < 10 * 1024 * 1024) return "medium" // < 10MB
  return "large" // >= 10MB
}

export function getFileType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase()
  if (!extension) return "unknown"

  const typeMap: { [key: string]: string } = {
    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    bmp: "image",
    svg: "image",
    webp: "image",
    // Documents
    pdf: "document",
    doc: "document",
    docx: "document",
    txt: "document",
    rtf: "document",
    // Spreadsheets
    xls: "spreadsheet",
    xlsx: "spreadsheet",
    csv: "spreadsheet",
    // Presentations
    ppt: "presentation",
    pptx: "presentation",
    // Videos
    mp4: "video",
    avi: "video",
    mov: "video",
    wmv: "video",
    flv: "video",
    webm: "video",
    // Audio
    mp3: "audio",
    wav: "audio",
    flac: "audio",
    aac: "audio",
    ogg: "audio",
    // Archives
    zip: "archive",
    rar: "archive",
    "7z": "archive",
    tar: "archive",
    gz: "archive",
    // Code
    js: "code",
    ts: "code",
    jsx: "code",
    tsx: "code",
    html: "code",
    css: "code",
    py: "code",
    java: "code",
  }

  return typeMap[extension] || extension
}

export async function organizeFiles(files: File[], rules: OrganizationRules): Promise<OrganizedFile[]> {
  const organizedFiles: OrganizedFile[] = []
  const hashMap = new Map<string, OrganizedFile>()

  // Get AI classifications if enabled
  let aiClassifications = new Map<string, DocumentAnalysis | ClassificationResult>()
  if (rules.aiClassification) {
    try {
      aiClassifications = await classifyMultipleFiles(files)
    } catch (error) {
      console.error("AI Classification failed:", error)
    }
  }

  for (const file of files) {
    // Skip ignored file types
    const extension = "." + (file.name.split(".").pop()?.toLowerCase() || "")
    if (rules.ignoredTypes.includes(extension)) {
      continue
    }

    // Calculate hash for duplicate detection
    let hash = ""
    let isDuplicate = false

    if (rules.detectDuplicates) {
      hash = await calculateFileHash(file)
      isDuplicate = hashMap.has(hash)
    }

    // Get AI classification
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`
    const aiResult = aiClassifications.get(fileKey)
    const aiClassification = aiResult ? ("classification" in aiResult ? aiResult.classification : aiResult) : undefined

    // Determine organization path
    let organizationPath = ""

    // Apply custom rules first
    let customRuleApplied = false
    for (const rule of rules.customRules) {
      if (!rule.enabled) continue

      let matches = false
      if (rule.condition === "extension") {
        matches = file.name.toLowerCase().endsWith(rule.value.toLowerCase())
      } else if (rule.condition === "name") {
        matches = file.name.toLowerCase().includes(rule.value.toLowerCase())
      } else if (rule.condition === "size") {
        const sizeLimit = Number.parseInt(rule.value) * 1024 * 1024 // MB to bytes
        matches = file.size > sizeLimit
      }

      if (matches) {
        organizationPath = rule.targetFolder + "/" + file.name
        customRuleApplied = true
        break
      }
    }

    // Use AI classification for organization if available and no custom rule applied
    if (!customRuleApplied && aiClassification && rules.aiClassification) {
      organizationPath = aiClassification.suggestedFolder + "/" + file.name
      customRuleApplied = true
    }

    if (!customRuleApplied) {
      const pathParts: string[] = []

      // Organize by date
      if (rules.organizeByDate) {
        const date = new Date(file.lastModified)
        pathParts.push(date.getFullYear().toString())
        pathParts.push((date.getMonth() + 1).toString().padStart(2, "0"))
      }

      // Organize by type
      if (rules.organizeByType) {
        const fileType = getFileType(file.name)
        pathParts.push(fileType)
      }

      // Organize by size
      if (rules.organizeBySize) {
        const sizeCategory = categorizeFileSize(file.size)
        pathParts.push(sizeCategory)
      }

      organizationPath = pathParts.join("/") + "/" + file.name
    }

    const organizedFile: OrganizedFile = {
      originalFile: file,
      organizationPath: organizationPath || file.name,
      hash,
      isDuplicate,
      sizeCategory: categorizeFileSize(file.size),
      aiClassification: aiClassification
        ? {
            category: aiClassification.category,
            confidence: aiClassification.confidence,
            subcategory: aiClassification.subcategory,
            reasoning: aiClassification.reasoning,
            extractedText: "extractedText" in aiResult! ? aiResult.extractedText : undefined,
            metadata: "metadata" in aiResult! ? aiResult.metadata : undefined,
          }
        : undefined,
      metadata: {
        lastModified: file.lastModified,
      },
    }

    organizedFiles.push(organizedFile)

    if (rules.detectDuplicates && !isDuplicate) {
      hashMap.set(hash, organizedFile)
    }
  }

  return organizedFiles
}

export function calculateFileStats(organizedFiles: OrganizedFile[]): FileStats {
  const stats: FileStats = {
    totalFiles: organizedFiles.length,
    totalSize: 0,
    fileTypes: {},
    duplicates: 0,
    categories: {},
    aiClassifications: {},
    averageConfidence: 0,
  }

  let totalConfidence = 0
  let classifiedCount = 0

  organizedFiles.forEach((file) => {
    stats.totalSize += file.originalFile.size

    if (file.isDuplicate) {
      stats.duplicates++
    }

    const fileType = getFileType(file.originalFile.name)
    stats.fileTypes[fileType] = (stats.fileTypes[fileType] || 0) + 1

    const category = file.organizationPath.split("/")[0]
    stats.categories[category] = (stats.categories[category] || 0) + 1

    // AI classification stats
    if (file.aiClassification) {
      stats.aiClassifications[file.aiClassification.category] =
        (stats.aiClassifications[file.aiClassification.category] || 0) + 1
      totalConfidence += file.aiClassification.confidence
      classifiedCount++
    }
  })

  stats.averageConfidence = classifiedCount > 0 ? totalConfidence / classifiedCount : 0

  return stats
}

export async function generateZipDownload(organizedFiles: OrganizedFile[]): Promise<void> {
  const zip = new JSZip()

  for (const file of organizedFiles) {
    const folderPath = file.organizationPath.split("/").slice(0, -1).join("/")
    const fileName = file.organizationPath.split("/").pop() || file.originalFile.name

    if (folderPath) {
      zip.folder(folderPath)?.file(fileName, file.originalFile)
    } else {
      zip.file(fileName, file.originalFile)
    }
  }

  const content = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(content)
  const a = document.createElement("a")
  a.href = url
  a.download = "organized-files.zip"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
