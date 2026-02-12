#!/usr/bin/env bun

import { generateText, streamText } from "ai"

export interface CopilotConfig {
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
}

export interface CopilotRequest {
  prompt: string
  systemPrompt?: string
  context?: string
  options?: {
    temperature?: number
    topP?: number
    maxTokens?: number
  }
}

export interface CopilotResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

export class GitHubCopilotIntegration {
  private config: CopilotConfig
  private requestCount = 0
  private tokenCount = 0
  private lastReset = Date.now()
  
  constructor(config: CopilotConfig) {
    this.config = config
  }
  
  async generate(request: CopilotRequest): Promise<CopilotResponse> {
    // Check rate limits
    await this.checkRateLimits()
    
    // Build the full prompt with context
    const fullPrompt = this.buildPrompt(request)
    
    const response = await generateText({
      model: this.createModel(),
      prompt: fullPrompt,
      temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
      topP: request.options?.topP ?? this.config.topP ?? 0.9,
      maxTokens: request.options?.maxTokens ?? this.config.maxTokens ?? 4096,
    })
    
    // Track usage
    this.requestCount++
    if (response.usage) {
      this.tokenCount += response.usage.totalTokens
    }
    
    return {
      text: response.text,
      usage: response.usage
        ? {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          }
        : undefined,
      model: this.config.model,
    }
  }
  
  async *stream(request: CopilotRequest): AsyncGenerator<string> {
    await this.checkRateLimits()
    
    const fullPrompt = this.buildPrompt(request)
    
    const result = await streamText({
      model: this.createModel(),
      prompt: fullPrompt,
      temperature: request.options?.temperature ?? this.config.temperature ?? 0.7,
      topP: request.options?.topP ?? this.config.topP ?? 0.9,
      maxTokens: request.options?.maxTokens ?? this.config.maxTokens ?? 4096,
    })
    
    this.requestCount++
    // TODO: Track token usage for streaming requests
    // Consider using result.usage if available from the AI SDK
    
    for await (const chunk of result.textStream) {
      yield chunk
    }
  }
  
  private buildPrompt(request: CopilotRequest): string {
    const parts: string[] = []
    
    if (request.systemPrompt) {
      parts.push(`System: ${request.systemPrompt}`)
      parts.push("")
    }
    
    if (request.context) {
      parts.push("Context:")
      parts.push(request.context)
      parts.push("")
    }
    
    parts.push("User Request:")
    parts.push(request.prompt)
    
    return parts.join("\n")
  }
  
  private createModel() {
    // TODO: Wire to OpenCode's existing Copilot provider implementation
    // This should return a real AI SDK language model instance from @ai-sdk/github-copilot
    // or the Provider layer, with credentials properly applied using this.config.apiKey
    // For now, throwing to prevent runtime errors with placeholder model
    throw new Error(
      "GitHubCopilotIntegration.createModel() requires wiring to real AI SDK model. " +
      "See packages/opencode/src/provider/ for Copilot provider implementation."
    )
  }
  
  private async checkRateLimits(): Promise<void> {
    const now = Date.now()
    const timeSinceReset = now - this.lastReset
    
    // Reset counters every minute
    if (timeSinceReset > 60000) {
      this.requestCount = 0
      this.tokenCount = 0
      this.lastReset = now
      return
    }
    
    // Check if we're approaching limits (60 req/min, 150k tokens/min)
    if (this.requestCount >= 50) {
      const waitTime = 60000 - timeSinceReset
      console.warn(
        `Approaching rate limit. Waiting ${Math.ceil(waitTime / 1000)}s...`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.requestCount = 0
      this.tokenCount = 0
      this.lastReset = Date.now()
    }
    
    if (this.tokenCount >= 140000) {
      const waitTime = 60000 - timeSinceReset
      console.warn(
        `Approaching token limit. Waiting ${Math.ceil(waitTime / 1000)}s...`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      this.requestCount = 0
      this.tokenCount = 0
      this.lastReset = Date.now()
    }
  }
  
  getUsageStats() {
    return {
      requests: this.requestCount,
      tokens: this.tokenCount,
      lastReset: this.lastReset,
    }
  }
  
  resetStats() {
    this.requestCount = 0
    this.tokenCount = 0
    this.lastReset = Date.now()
  }
}

export function createCopilotIntegration(
  apiKey: string,
  model = "gpt-4"
): GitHubCopilotIntegration {
  return new GitHubCopilotIntegration({
    apiKey,
    model,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
  })
}

// Environment variable based initialization
export function createCopilotFromEnv(): GitHubCopilotIntegration | null {
  const apiKey = process.env.GITHUB_COPILOT_TOKEN
  
  if (!apiKey) {
    console.warn(
      "GITHUB_COPILOT_TOKEN not found. GitHub Copilot integration disabled."
    )
    return null
  }
  
  const model = process.env.GITHUB_COPILOT_MODEL || "gpt-4"
  
  return createCopilotIntegration(apiKey, model)
}
