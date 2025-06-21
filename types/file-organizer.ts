export interface AIClassification {
  category: string
  confidence: number
  subcategory?: string
  reasoning: string
  extractedText?: string
  metadata?: {
    pageCount?: number
    wordCount?: number
    language?: string
  }
}

export interface OrganizedFile {
  originalFile: File
  organizationPath: string
  hash: string
  isDuplicate: boolean
  sizeCategory: "small" | "medium" | "large"
  aiClassification?: AIClassification
  metadata?: {
    lastModified: number
    createdDate?: Date
  }
}

export interface FileStats {
  totalFiles: number
  totalSize: number
  fileTypes: { [key: string]: number }
  duplicates: number
  categories: { [key: string]: number }
  aiClassifications: { [key: string]: number }
  averageConfidence: number
}

export interface CustomRule {
  id: string
  name: string
  condition: "extension" | "name" | "size"
  value: string
  targetFolder: string
  enabled: boolean
}

export interface OrganizationRules {
  organizeByType: boolean
  organizeBySize: boolean
  organizeByDate: boolean
  detectDuplicates: boolean
  aiClassification: boolean
  customRules: CustomRule[]
  ignoredTypes: string[]
}
