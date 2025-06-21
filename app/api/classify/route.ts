/// <reference types="node" />
import { type NextRequest, NextResponse } from "next/server"

/** Safely normalises a mime string (can be undefined). */
function mime(type: string | undefined): string {
  return (type ?? "").toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Classification API called")

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("❌ OPENAI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          details: "OPENAI_API_KEY environment variable is missing",
        },
        { status: 500 },
      )
    }

    console.log("✅ OpenAI API key found")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("❌ No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📄 Processing file: ${file.name} (${file.type}, ${file.size} bytes)`)

    // Import OpenAI here to avoid client-side bundling issues
    const { default: OpenAI } = await import("openai")
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    let result
    if (mime(file.type).startsWith("image/")) {
      console.log("🖼️ Processing as image")
      result = await classifyImageServer(file, openai)
    } else {
      console.log("📝 Processing as document")
      result = await classifyDocumentServer(file, openai)
    }

    if (!result) {
      console.error("❌ Classification returned null result")
      return NextResponse.json(
        {
          error: "Classification failed",
          details: "No classification result generated",
        },
        { status: 500 },
      )
    }

    console.log("✅ Classification successful:", result)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("❌ Classification API error:", error)

    return NextResponse.json(
      {
        error: "Classification failed",
        details: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

async function classifyDocumentServer(file: File, openai: any) {
  try {
    // Extract text content from the file
    const extractedText = await extractTextFromFile(file)

    if (!extractedText || extractedText.length < 50) {
      console.log("⚠️ File content too short for classification")
      return null
    }

    console.log(`📖 Extracted ${extractedText.length} characters from file`)

    // Prepare the classification prompt
    const classificationPrompt = createClassificationPrompt(extractedText, file.name)

    console.log("🤖 Calling OpenAI API...")

    // Call OpenAI API for classification
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert document classifier. Analyze documents and classify them into specific categories with high accuracy. Always respond with valid JSON only.`,
        },
        {
          role: "user",
          content: classificationPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error("No response from OpenAI")
    }

    console.log("🤖 OpenAI response:", result)

    // Parse the AI response
    const classification = parseClassificationResponse(result)

    // Calculate metadata
    const metadata = calculateDocumentMetadata(extractedText)

    return {
      classification,
      extractedText: extractedText.substring(0, 1000), // Store first 1000 chars for preview
      metadata,
    }
  } catch (error) {
    console.error("Document classification error:", error)
    throw error
  }
}

async function classifyImageServer(file: File, openai: any) {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(file)

    console.log("🤖 Calling OpenAI Vision API...")

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert image classifier. Analyze images and classify them into appropriate categories. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: createImageClassificationPrompt(file.name),
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 300,
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error("No response from OpenAI Vision")
    }

    console.log("🤖 OpenAI Vision response:", result)

    return parseClassificationResponse(result)
  } catch (error) {
    console.error("Image classification error:", error)
    throw error
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileType = mime(file.type)

  if (fileType.includes("text/")) {
    return await file.text()
  }

  if (fileType.includes("json")) {
    return await file.text()
  }

  // For PDFs, we'd need a PDF parser library
  // For now, we'll use filename and basic analysis
  if (fileType.includes("pdf")) {
    return `PDF Document: ${file.name}\nSize: ${file.size} bytes\nThis is a PDF file that requires specialized parsing.`
  }

  // For other document types, return basic info
  return `Document: ${file.name}\nType: ${file.type}\nSize: ${file.size} bytes`
}

function createClassificationPrompt(content: string, filename: string): string {
  const categories = [
    "resume",
    "invoice",
    "contract",
    "report",
    "presentation",
    "assignment",
    "receipt",
    "certificate",
    "manual",
    "form",
  ]

  return `
Analyze this document and classify it into one of these categories: ${categories.join(", ")}

Document filename: ${filename}
Document content (first 2000 characters):
${content.substring(0, 2000)}

Respond with ONLY a JSON object in this exact format:
{
  "category": "one of the predefined categories",
  "confidence": 0.95,
  "subcategory": "specific subcategory if applicable",
  "suggestedFolder": "suggested folder path",
  "reasoning": "brief explanation of classification"
}

Requirements:
- confidence should be between 0.0 and 1.0
- category must be one of: ${categories.join(", ")}
- suggestedFolder should follow the pattern: Category/Subcategory
- reasoning should be 1-2 sentences explaining why
`
}

function createImageClassificationPrompt(filename: string): string {
  return `
Analyze this image and classify it into an appropriate category.

Image filename: ${filename}

Common image categories: screenshot, photo, diagram, chart, document-scan, receipt, id-card, certificate, artwork, meme, social-media

Respond with ONLY a JSON object in this exact format:
{
  "category": "most appropriate category",
  "confidence": 0.95,
  "subcategory": "specific subcategory if applicable",
  "suggestedFolder": "Images/CategoryName",
  "reasoning": "brief explanation of what you see"
}
`
}

function parseClassificationResponse(response: string) {
  try {
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (!parsed.category || !parsed.confidence) {
      throw new Error("Missing required fields in classification response")
    }

    // Ensure confidence is within valid range
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence))

    // Set default folder if not provided
    if (!parsed.suggestedFolder) {
      parsed.suggestedFolder = `Documents/${parsed.category}`
    }

    return parsed
  } catch (error) {
    console.error("Error parsing classification response:", error)

    // Return a fallback classification
    return {
      category: "document",
      confidence: 0.5,
      suggestedFolder: "Documents/Unclassified",
      reasoning: "Classification failed, using fallback category",
    }
  }
}

function calculateDocumentMetadata(text: string) {
  const wordCount = text.split(/\s+/).length
  const pageCount = Math.ceil(wordCount / 250) // Rough estimate: 250 words per page

  return {
    wordCount,
    pageCount,
    language: "en", // Simplified for now
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const runtime = "nodejs"
export const maxDuration = 30
