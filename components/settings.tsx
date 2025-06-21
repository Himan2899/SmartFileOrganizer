"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, SettingsIcon } from "lucide-react"
import { useState } from "react"
import type { OrganizationRules, CustomRule } from "@/types/file-organizer"

interface SettingsProps {
  rules: OrganizationRules
  onRulesChange: (rules: OrganizationRules) => void
}

export function Settings({ rules, onRulesChange }: SettingsProps) {
  const [newIgnoredType, setNewIgnoredType] = useState("")
  const [newCustomRule, setNewCustomRule] = useState<Partial<CustomRule>>({
    name: "",
    condition: "extension",
    value: "",
    targetFolder: "",
  })

  const updateRule = (key: keyof OrganizationRules, value: any) => {
    onRulesChange({ ...rules, [key]: value })
  }

  const addIgnoredType = () => {
    if (newIgnoredType.trim()) {
      updateRule("ignoredTypes", [...rules.ignoredTypes, newIgnoredType.trim()])
      setNewIgnoredType("")
    }
  }

  const removeIgnoredType = (type: string) => {
    updateRule(
      "ignoredTypes",
      rules.ignoredTypes.filter((t) => t !== type),
    )
  }

  const addCustomRule = () => {
    if (newCustomRule.name && newCustomRule.value && newCustomRule.targetFolder) {
      const rule: CustomRule = {
        id: Date.now().toString(),
        name: newCustomRule.name,
        condition: newCustomRule.condition || "extension",
        value: newCustomRule.value,
        targetFolder: newCustomRule.targetFolder,
        enabled: true,
      }
      updateRule("customRules", [...rules.customRules, rule])
      setNewCustomRule({
        name: "",
        condition: "extension",
        value: "",
        targetFolder: "",
      })
    }
  }

  const removeCustomRule = (id: string) => {
    updateRule(
      "customRules",
      rules.customRules.filter((r) => r.id !== id),
    )
  }

  const toggleCustomRule = (id: string) => {
    updateRule(
      "customRules",
      rules.customRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>Configure how your files should be organized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Organization Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Organization</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Organize by File Type</Label>
                <p className="text-sm text-muted-foreground">Group files by their extension (.pdf, .jpg, etc.)</p>
              </div>
              <Switch
                checked={rules.organizeByType}
                onCheckedChange={(checked) => updateRule("organizeByType", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Organize by File Size</Label>
                <p className="text-sm text-muted-foreground">Create folders for small, medium, and large files</p>
              </div>
              <Switch
                checked={rules.organizeBySize}
                onCheckedChange={(checked) => updateRule("organizeBySize", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Organize by Date</Label>
                <p className="text-sm text-muted-foreground">Create folders by creation date (Year/Month)</p>
              </div>
              <Switch
                checked={rules.organizeByDate}
                onCheckedChange={(checked) => updateRule("organizeByDate", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Detect Duplicates</Label>
                <p className="text-sm text-muted-foreground">Identify and mark duplicate files using hash comparison</p>
              </div>
              <Switch
                checked={rules.detectDuplicates}
                onCheckedChange={(checked) => updateRule("detectDuplicates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>AI Classification</Label>
                <p className="text-sm text-muted-foreground">Use AI to classify documents (resumes, invoices, etc.)</p>
              </div>
              <Switch
                checked={rules.aiClassification}
                onCheckedChange={(checked) => updateRule("aiClassification", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Ignored File Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ignored File Types</h3>
            <p className="text-sm text-muted-foreground">File extensions that should be ignored during organization</p>

            <div className="flex gap-2">
              <Input
                placeholder="e.g., .tmp, .log"
                value={newIgnoredType}
                onChange={(e) => setNewIgnoredType(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIgnoredType()}
              />
              <Button onClick={addIgnoredType}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {rules.ignoredTypes.map((type) => (
                <Badge key={type} variant="secondary" className="flex items-center gap-1">
                  {type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeIgnoredType(type)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Organization Rules</h3>
            <p className="text-sm text-muted-foreground">Create custom rules for specific file organization needs</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <Label>Rule Name</Label>
                <Input
                  placeholder="e.g., Work Documents"
                  value={newCustomRule.name}
                  onChange={(e) => setNewCustomRule((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Condition</Label>
                <Select
                  value={newCustomRule.condition}
                  onValueChange={(value) => setNewCustomRule((prev) => ({ ...prev, condition: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extension">File Extension</SelectItem>
                    <SelectItem value="name">File Name Contains</SelectItem>
                    <SelectItem value="size">File Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Value</Label>
                <Input
                  placeholder="e.g., .docx or work"
                  value={newCustomRule.value}
                  onChange={(e) => setNewCustomRule((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>

              <div>
                <Label>Target Folder</Label>
                <Input
                  placeholder="e.g., Work/Documents"
                  value={newCustomRule.targetFolder}
                  onChange={(e) => setNewCustomRule((prev) => ({ ...prev, targetFolder: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Button onClick={addCustomRule} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Rule
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {rules.customRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.enabled} onCheckedChange={() => toggleCustomRule(rule.id)} />
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.condition === "extension" && "Extension: "}
                        {rule.condition === "name" && "Name contains: "}
                        {rule.condition === "size" && "Size: "}
                        {rule.value} → {rule.targetFolder}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCustomRule(rule.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
