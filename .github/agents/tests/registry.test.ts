import { describe, it, expect, beforeAll } from "bun:test"
import { createAgentRegistry } from "../registry"
import path from "path"

describe("AgentRegistry", () => {
  let registry: Awaited<ReturnType<typeof createAgentRegistry>>
  
  beforeAll(async () => {
    const basePath = path.join(import.meta.dir, "..", "..", "..")
    registry = await createAgentRegistry(basePath)
  })
  
  describe("loadAgents", () => {
    it("should load all agents", () => {
      const agents = registry.getAllAgents()
      
      expect(agents.length).toBeGreaterThan(0)
      
      const agentNames = agents.map((a) => a.name)
      expect(agentNames).toContain("security-architect")
      expect(agentNames).toContain("code-reviewer")
      expect(agentNames).toContain("documentation-agent")
    })
  })
  
  describe("getAgent", () => {
    it("should get specific agent", () => {
      const agent = registry.getAgent("security-architect")
      
      expect(agent).toBeTruthy()
      expect(agent?.name).toBe("security-architect")
      expect(agent?.capabilities).toContain("vulnerability-scanning")
    })
    
    it("should return undefined for non-existent agent", () => {
      const agent = registry.getAgent("non-existent-agent")
      
      expect(agent).toBeUndefined()
    })
  })
  
  describe("getAgentsByCapability", () => {
    it("should find agents by capability", () => {
      const securityAgents = registry.getAgentsByCapability("vulnerability-scanning")
      
      expect(securityAgents.length).toBeGreaterThan(0)
      expect(securityAgents[0].name).toBe("security-architect")
    })
    
    it("should return empty array for non-existent capability", () => {
      const agents = registry.getAgentsByCapability("non-existent-capability")
      
      expect(agents).toEqual([])
    })
  })
  
  describe("getAgentPrompt", () => {
    it("should load agent prompt", async () => {
      const prompt = await registry.getAgentPrompt("security-architect")
      
      expect(prompt).toBeTruthy()
      expect(prompt).toContain("Security Architect Agent")
    })
    
    it("should return null for non-existent agent", async () => {
      const prompt = await registry.getAgentPrompt("non-existent-agent")
      
      expect(prompt).toBeNull()
    })
  })
  
  describe("isAgentEnabled", () => {
    it("should return true for existing agent", () => {
      expect(registry.isAgentEnabled("security-architect")).toBe(true)
    })
    
    it("should return false for non-existent agent", () => {
      expect(registry.isAgentEnabled("non-existent-agent")).toBe(false)
    })
  })
})
