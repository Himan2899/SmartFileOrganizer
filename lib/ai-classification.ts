function mime(t: string | undefined) {
  return (t ?? "").toLowerCase()
}

// This file is now simplified since we moved the logic to the API route
export interface ClassificationResult {
  category: string
  confidence: number
  subcategory?: string
  suggestedFolder: string
  reasoning: string
}

export interface DocumentAnalysis {
  classification: ClassificationResult
  extractedText?: string
  metadata: {
    pageCount?: number
    wordCount?: number
    language?: string
  }
}

// Client-side function to call the API route
export async function classifyMultipleFiles(
  files: File[],
): Promise<Map<string, DocumentAnalysis | ClassificationResult>> {
  const results = new Map<string, DocumentAnalysis | ClassificationResult>()

  console.log(`🧠 Starting AI classification for ${files.length} files...`)

  // Process files in batches to avoid rate limits
  const batchSize = 3
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize)

    const batchPromises = batch.map(async (file) => {
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`

      try {
        console.log(`🔍 Classifying: ${file.name}`)

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/classify", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API Error: ${errorData.error} - ${errorData.details}`)
        }

        const result = await response.json()
        console.log(`✅ Classified ${file.name}:`, result)

        if (result) {
          results.set(fileKey, result)
        }
      } catch (error) {
        console.error(`❌ Error classifying file ${file.name}:`, error)
      }
    })

    await Promise.all(batchPromises)

    // Add delay between batches to respect rate limits
    if (i + batchSize < files.length) {
      console.log("⏳ Waiting between batches...")
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log(`🎉 AI classification complete: ${results.size}/${files.length} files classified`)
  return results
}

// Get classification statistics
export function getClassificationStats(classifications: Map<string, DocumentAnalysis | ClassificationResult>) {
  const stats = {
    totalClassified: classifications.size,
    categories: {} as Record<string, number>,
    averageConfidence: 0,
    highConfidenceCount: 0,
  }

  let totalConfidence = 0

  classifications.forEach((result) => {
    const classification = "classification" in result ? result.classification : result

    stats.categories[classification.category] = (stats.categories[classification.category] || 0) + 1
    totalConfidence += classification.confidence

    if (classification.confidence > 0.8) {
      stats.highConfidenceCount++
    }
  })

  stats.averageConfidence = classifications.size > 0 ? totalConfidence / classifications.size : 0

  return stats
}
