#!/usr/bin/env bun

/**
 * Agent Initialization Script
 * 
 * This script initializes the OpenCode agent system with:
 * - Memory persistence setup
 * - Context engine initialization  
 * - Agent registry loading
 * - GitHub Copilot integration
 */

import { initializeMemoryStore, cleanupExpiredMemory } from "./memory"
import { createContextEngine } from "./context-engine"
import { createAgentRegistry } from "./registry"
import { createCopilotFromEnv } from "./copilot-integration"
import path from "path"
import { mkdir } from "fs/promises"

export async function initializeAgentSystem(basePath: string) {
  console.log("🚀 Initializing OpenCode Agent System...")
  
  // 1. Setup directories
  console.log("📁 Setting up directories...")
  const agentPath = path.join(basePath, ".opencode", "agents")
  await mkdir(path.join(agentPath, "memory"), { recursive: true })
  await mkdir(path.join(agentPath, "logs"), { recursive: true })
  
  // 2. Initialize memory store
  console.log("💾 Initializing memory store...")
  const memoryStore = await initializeMemoryStore(basePath)
  console.log("   ✓ Memory store initialized")
  
  // 3. Load agent registry
  console.log("📋 Loading agent registry...")
  const registry = await createAgentRegistry(basePath)
  const agents = registry.getAllAgents()
  console.log(`   ✓ Loaded ${agents.length} agents:`)
  agents.forEach((agent) => {
    console.log(`     - ${agent.name}: ${agent.description}`)
  })
  
  // 4. Initialize GitHub Copilot
  console.log("🤖 Initializing GitHub Copilot integration...")
  const copilot = createCopilotFromEnv()
  if (copilot) {
    console.log("   ✓ GitHub Copilot integration ready")
  } else {
    console.log("   ⚠ GitHub Copilot integration disabled (no API key)")
  }
  
  // 5. Cleanup expired memory
  console.log("🧹 Cleaning up expired memory...")
  const cleaned = await cleanupExpiredMemory(basePath)
  console.log(`   ✓ Cleaned up ${cleaned} expired entries`)
  
  console.log("\n✅ Agent system initialized successfully!\n")
  
  return {
    memoryStore,
    registry,
    copilot,
    agents,
  }
}

// Run if executed directly
if (import.meta.main) {
  const basePath = process.cwd()
  await initializeAgentSystem(basePath)
}
