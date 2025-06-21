import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY environment variable is not set" }, { status: 400 })
    }

    const openai = new OpenAI({
      apiKey,
      // next-lite executes route code in a browser-like sandbox.
      // This flag allows the client to run there while still keeping
      // the key out of the real browser bundle.
      dangerouslyAllowBrowser: true,
    })

    // Simple test call to verify the API key works
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: "Say 'API key is working' if you can read this.",
        },
      ],
      max_tokens: 10,
    })

    const result = response.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      message: "OpenAI API key is working correctly",
      testResponse: result,
    })
  } catch (error: any) {
    console.error("OpenAI API test error:", error)

    return NextResponse.json(
      {
        error: error.message || "Failed to connect to OpenAI API",
        details: error.code || "Unknown error",
      },
      { status: 500 },
    )
  }
}
