#!/usr/bin/env bun

import path from "path"

export interface AgentConfig {
  name: string
  version: string
  description: string
  author: string
  mode: "subagent" | "primary" | "all"
  model: {
    providerID: string
    modelID: string
  }
  permissions: Record<string, any>
  capabilities: string[]
  context: {
    window_size: number
    memory_enabled: boolean
    memory_ttl: number
  }
  options: {
    temperature: number
    topP: number
    maxTokens: number
    steps?: number
  }
}

export class AgentRegistry {
  private agents: Map<string, AgentConfig> = new Map()
  private basePath: string
  
  constructor(basePath: string) {
    this.basePath = basePath
  }
  
  async loadAgents(): Promise<void> {
    const agentsDir = path.join(this.basePath, ".github", "agents")
    
    const agentDirs = [
      "security-architect",
      "code-reviewer",
      "documentation-agent",
      "testing-agent",
      "performance-agent",
      "devops-agent",
    ]
    
    for (const agentDir of agentDirs) {
      const configPath = path.join(agentsDir, agentDir, "agent.json")
      const configFile = Bun.file(configPath)
      
      if (await configFile.exists()) {
        const config: AgentConfig = await configFile.json()
        this.agents.set(config.name, config)
      }
    }
  }
  
  getAgent(name: string): AgentConfig | undefined {
    return this.agents.get(name)
  }
  
  getAllAgents(): AgentConfig[] {
    return Array.from(this.agents.values())
  }
  
  async getAgentPrompt(name: string): Promise<string | null> {
    const agentsDir = path.join(this.basePath, ".github", "agents")
    const promptPath = path.join(agentsDir, name, "prompt.txt")
    const promptFile = Bun.file(promptPath)
    
    if (await promptFile.exists()) {
      return promptFile.text()
    }
    
    return null
  }
  
  isAgentEnabled(name: string): boolean {
    return this.agents.has(name)
  }
  
  getAgentsByCapability(capability: string): AgentConfig[] {
    return this.getAllAgents().filter((agent) =>
      agent.capabilities.includes(capability)
    )
  }
  
  async registerWithOpenCode(): Promise<Record<string, any>> {
    const agentConfigs: Record<string, any> = {}
    
    for (const [name, config] of this.agents) {
      const prompt = await this.getAgentPrompt(name)
      
      agentConfigs[name] = {
        name: config.name,
        description: config.description,
        mode: config.mode,
        model: config.model,
        // TODO: Convert permissions to PermissionNext.Ruleset format
        // OpenCode expects permission to be PermissionNext.fromConfig(config.permissions)
        permission: config.permissions,
        prompt: prompt || undefined,
        temperature: config.options.temperature,
        topP: config.options.topP,
        steps: config.options.steps,
        options: {
          capabilities: config.capabilities,
          context: config.context,
        },
        native: false,
      }
    }
    
    return agentConfigs
  }
}

export async function createAgentRegistry(basePath: string): Promise<AgentRegistry> {
  const registry = new AgentRegistry(basePath)
  await registry.loadAgents()
  return registry
}

export async function initializeAgents(basePath: string): Promise<void> {
  const registry = await createAgentRegistry(basePath)
  const agentConfigs = await registry.registerWithOpenCode()
  
  console.log("Initialized agents:")
  for (const [name, config] of Object.entries(agentConfigs)) {
    console.log(`  - ${name}: ${config.description}`)
  }
}
