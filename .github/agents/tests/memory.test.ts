import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { AgentMemoryStore, initializeMemoryStore } from "../memory"
import { tmpdir } from "os"
import path from "path"
import { rm } from "fs/promises"

describe("AgentMemoryStore", () => {
  let store: AgentMemoryStore
  let testDir: string
  
  beforeAll(async () => {
    testDir = path.join(tmpdir(), `agent-test-${Date.now()}`)
    store = await initializeMemoryStore(testDir)
  })
  
  afterAll(async () => {
    store.close()
    await rm(testDir, { recursive: true, force: true })
  })
  
  describe("store and retrieve", () => {
    it("should store and retrieve a value", async () => {
      await store.store(
        "test-agent",
        "session-1",
        "test-key",
        { value: "test data" }
      )
      
      const result = await store.retrieve("test-agent", "test-key")
      
      expect(result).toEqual({ value: "test data" })
    })
    
    it("should update existing value", async () => {
      await store.store(
        "test-agent",
        "session-1",
        "update-key",
        { value: "initial" }
      )
      
      await store.store(
        "test-agent",
        "session-1",
        "update-key",
        { value: "updated" }
      )
      
      const result = await store.retrieve("test-agent", "update-key")
      
      expect(result).toEqual({ value: "updated" })
    })
    
    it("should return null for non-existent key", async () => {
      const result = await store.retrieve("test-agent", "non-existent")
      
      expect(result).toBeNull()
    })
  })
  
  describe("expiration", () => {
    it("should respect TTL", async () => {
      await store.store(
        "test-agent",
        "session-1",
        "expire-key",
        { value: "expire me" },
        1 // 1 second TTL
      )
      
      // Should exist immediately
      let result = await store.retrieve("test-agent", "expire-key")
      expect(result).toEqual({ value: "expire me" })
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))
      
      // Should be null after expiration
      result = await store.retrieve("test-agent", "expire-key")
      expect(result).toBeNull()
    })
    
    it("should cleanup expired entries", async () => {
      await store.store(
        "test-agent",
        "session-1",
        "cleanup-1",
        { value: "data" },
        1
      )
      
      await store.store(
        "test-agent",
        "session-1",
        "cleanup-2",
        { value: "data" },
        1
      )
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))
      
      const cleaned = await store.cleanup()
      
      expect(cleaned).toBeGreaterThanOrEqual(2)
    })
  })
  
  describe("sessions", () => {
    it("should create and retrieve session", async () => {
      const sessionId = await store.createSession(
        "test-agent",
        { test: "context" },
        { meta: "data" }
      )
      
      expect(sessionId).toBeTruthy()
      
      const session = await store.getSession(sessionId)
      
      expect(session).toBeTruthy()
      expect(session.agent_name).toBe("test-agent")
      expect(session.context).toEqual({ test: "context" })
      expect(session.metadata).toEqual({ meta: "data" })
    })
    
    it("should end session", async () => {
      const sessionId = await store.createSession("test-agent")
      
      await store.endSession(sessionId)
      
      const session = await store.getSession(sessionId)
      
      expect(session.ended_at).toBeTruthy()
    })
  })
  
  describe("delete", () => {
    it("should delete a value", async () => {
      await store.store(
        "test-agent",
        "session-1",
        "delete-key",
        { value: "delete me" }
      )
      
      await store.delete("test-agent", "delete-key")
      
      const result = await store.retrieve("test-agent", "delete-key")
      
      expect(result).toBeNull()
    })
  })
})
