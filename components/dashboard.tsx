"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { FileStats } from "@/types/file-organizer"
import { formatFileSize } from "@/lib/file-utils"
import { Files, HardDrive, Copy, FolderTree, Brain, Target } from "lucide-react"

interface DashboardProps {
  fileStats: FileStats
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function Dashboard({ fileStats }: DashboardProps) {
  const fileTypeData = Object.entries(fileStats.fileTypes).map(([type, count]) => ({
    name: type || "Unknown",
    value: count,
  }))

  const categoryData = Object.entries(fileStats.categories).map(([category, count]) => ({
    name: category,
    count,
  }))

  const aiClassificationData = Object.entries(fileStats.aiClassifications || {}).map(([category, count]) => ({
    name: category.replace("-", " "),
    value: count,
  }))

  const confidenceLevel = fileStats.averageConfidence || 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">Files organized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(fileStats.totalSize)}</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duplicates</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileStats.duplicates}</div>
            <p className="text-xs text-muted-foreground">Duplicate files found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(fileStats.categories).length}</div>
            <p className="text-xs text-muted-foreground">Organization folders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Classified</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(fileStats.aiClassifications || {}).reduce((sum, count) => sum + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Files classified by AI</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Classification Confidence */}
      {confidenceLevel > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Classification Confidence
            </CardTitle>
            <CardDescription>
              Average confidence level of AI classifications: {(confidenceLevel * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Classification Accuracy</span>
                <span>{(confidenceLevel * 100).toFixed(1)}%</span>
              </div>
              <Progress value={confidenceLevel * 100} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low (0-60%)</span>
                <span>Medium (60-80%)</span>
                <span>High (80-100%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>File Types Distribution</CardTitle>
            <CardDescription>Breakdown of files by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Files organized by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Classification Chart */}
      {aiClassificationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Classification Results
            </CardTitle>
            <CardDescription>Documents classified by AI into different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiClassificationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* File Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed File Analysis</CardTitle>
          <CardDescription>Complete breakdown of your file collection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(fileStats.fileTypes).map(([type, count]) => {
            const percentage = (count / fileStats.totalFiles) * 100
            return (
              <div key={type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{type || "Unknown"}</Badge>
                    <span className="text-sm text-muted-foreground">{count} files</span>
                  </div>
                  <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
