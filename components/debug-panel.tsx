"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Settings, RefreshCw } from "lucide-react"
import { useState } from "react"

export function DebugPanel() {
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "valid" | "invalid" | "missing">("checking")
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const checkApiKey = async () => {
    setApiKeyStatus("checking")
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setApiKeyStatus("valid")
        setTestResult(`✅ OpenAI API key is working correctly!\n\nResponse: ${result.testResponse}`)
      } else {
        setApiKeyStatus("invalid")
        setTestResult(`❌ API Key Error: ${result.error}\n\nDetails: ${result.details || "No additional details"}`)
      }
    } catch (error) {
      setApiKeyStatus("invalid")
      setTestResult(
        `❌ Network error: ${error}\n\nMake sure your development server is running and the API route exists.`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  const testClassification = async () => {
    setIsLoading(true)
    try {
      const testFile = new File(
        [
          "RESUME - John Doe\n\nSoftware Engineer\n\nEXPERIENCE:\n- Senior Developer at Tech Company (2020-2023)\n- Full-stack development with React, Node.js, Python\n- Led team of 5 developers\n\nSKILLS:\n- JavaScript, TypeScript, React, Node.js\n- Python, Django, PostgreSQL\n- AWS, Docker, Kubernetes\n\nEDUCATION:\n- Computer Science Degree, University of Technology (2018)\n- GPA: 3.8/4.0\n\nCONTACT:\n- Email: john.doe@email.com\n- Phone: (555) 123-4567",
        ],
        "john_doe_resume.txt",
        { type: "text/plain" },
      )

      console.log("🧪 Testing classification with sample resume file...")

      const formData = new FormData()
      formData.append("file", testFile)

      const response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult(`✅ Test Classification Success!\n\n${JSON.stringify(result, null, 2)}`)
      } else {
        setTestResult(
          `❌ Classification Error: ${result.error}\n\nDetails: ${result.details || "No additional details"}\n\nStack: ${result.stack || "No stack trace"}`,
        )
      }
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}\n\nThis might be a network error or the API route is not working.`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResult("")
    setApiKeyStatus("checking")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          AI Classification Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Button onClick={checkApiKey} disabled={isLoading}>
            {isLoading && apiKeyStatus === "checking" ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              "Test OpenAI API Key"
            )}
          </Button>

          <Button onClick={testClassification} disabled={isLoading} variant="outline">
            {isLoading && apiKeyStatus !== "checking" ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test AI Classification"
            )}
          </Button>

          <Button onClick={clearResults} variant="ghost" size="sm">
            Clear Results
          </Button>

          {apiKeyStatus === "valid" && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              API Key Valid
            </Badge>
          )}

          {apiKeyStatus === "invalid" && (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              API Key Invalid
            </Badge>
          )}
        </div>

        {testResult && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{testResult}</pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Environment Check:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              OPENAI_API_KEY: {typeof window === "undefined" ? "Server-side check needed" : "Client-side (hidden)"}
            </li>
            <li>Next.js Environment: {process.env.NODE_ENV || "development"}</li>
            <li>API Route: /api/classify and /api/test-openai</li>
          </ul>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm">
              <strong>Troubleshooting Steps:</strong>
            </p>
            <ol className="list-decimal list-inside text-xs mt-2 space-y-1">
              <li>First test your OpenAI API key</li>
              <li>If API key works, test AI classification</li>
              <li>Check browser console for detailed error logs</li>
              <li>Ensure your .env.local file has OPENAI_API_KEY=your_key_here</li>
              <li>Restart your development server after adding the API key</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
