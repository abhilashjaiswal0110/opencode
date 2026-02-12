#!/usr/bin/env bun

import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { eq, and, lt } from "drizzle-orm"
import path from "path"
import { mkdir } from "fs/promises"

// Schema definition
export const agentMemory = sqliteTable("agent_memory", {
  id: text().primaryKey(),
  agent_name: text().notNull(),
  session_id: text().notNull(),
  key: text().notNull(),
  value: text().notNull(),
  created_at: integer().notNull(),
  expires_at: integer(),
  metadata: text(),
})

export const agentSessions = sqliteTable("agent_sessions", {
  id: text().primaryKey(),
  agent_name: text().notNull(),
  started_at: integer().notNull(),
  ended_at: integer(),
  context: text(),
  metadata: text(),
})

export class AgentMemoryStore {
  private db: ReturnType<typeof drizzle>
  private sqlite: Database
  
  constructor(dbPath: string) {
    this.sqlite = new Database(dbPath)
    this.db = drizzle(this.sqlite)
    this.initializeSchema()
  }
  
  private initializeSchema() {
    // Create tables if they don't exist
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id TEXT PRIMARY KEY,
        agent_name TEXT NOT NULL,
        session_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        metadata TEXT
      )
    `)
    
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id TEXT PRIMARY KEY,
        agent_name TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        context TEXT,
        metadata TEXT
      )
    `)
    
    // Create indexes for better query performance
    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_key 
      ON agent_memory(agent_name, key)
    `)
    
    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_session 
      ON agent_memory(session_id)
    `)
    
    this.sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_expires 
      ON agent_memory(expires_at)
    `)
  }
  
  async store(
    agentName: string,
    sessionId: string,
    key: string,
    value: any,
    ttl?: number,
    metadata?: any
  ): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null
    
    const existing = await this.db
      .select()
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.agent_name, agentName),
          eq(agentMemory.key, key)
        )
      )
      .limit(1)
    
    if (existing.length > 0) {
      // Update existing
      await this.db
        .update(agentMemory)
        .set({
          value: JSON.stringify(value),
          created_at: Date.now(),
          expires_at: expiresAt,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .where(eq(agentMemory.id, existing[0].id))
    } else {
      // Insert new
      await this.db.insert(agentMemory).values({
        id: crypto.randomUUID(),
        agent_name: agentName,
        session_id: sessionId,
        key,
        value: JSON.stringify(value),
        created_at: Date.now(),
        expires_at: expiresAt,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
    }
  }
  
  async retrieve(agentName: string, key: string): Promise<any | null> {
    const results = await this.db
      .select()
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.agent_name, agentName),
          eq(agentMemory.key, key)
        )
      )
      .limit(1)
    
    if (!results.length) return null
    
    const record = results[0]
    
    // Check expiration
    if (record.expires_at && record.expires_at < Date.now()) {
      await this.delete(agentName, key)
      return null
    }
    
    return JSON.parse(record.value)
  }
  
  async delete(agentName: string, key: string): Promise<void> {
    await this.db
      .delete(agentMemory)
      .where(
        and(
          eq(agentMemory.agent_name, agentName),
          eq(agentMemory.key, key)
        )
      )
  }
  
  async cleanup(): Promise<number> {
    const now = Date.now()
    const result = await this.db
      .delete(agentMemory)
      .where(
        and(
          lt(agentMemory.expires_at, now)
        )
      )
    
    return result.changes || 0
  }
  
  async createSession(agentName: string, context?: any, metadata?: any): Promise<string> {
    const sessionId = crypto.randomUUID()
    
    await this.db.insert(agentSessions).values({
      id: sessionId,
      agent_name: agentName,
      started_at: Date.now(),
      ended_at: null,
      context: context ? JSON.stringify(context) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
    
    return sessionId
  }
  
  async endSession(sessionId: string): Promise<void> {
    await this.db
      .update(agentSessions)
      .set({
        ended_at: Date.now(),
      })
      .where(eq(agentSessions.id, sessionId))
  }
  
  async getSession(sessionId: string): Promise<any | null> {
    const results = await this.db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.id, sessionId))
      .limit(1)
    
    if (!results.length) return null
    
    const session = results[0]
    return {
      ...session,
      context: session.context ? JSON.parse(session.context) : null,
      metadata: session.metadata ? JSON.parse(session.metadata) : null,
    }
  }
  
  close() {
    this.sqlite.close()
  }
}

// Initialize memory store
export async function initializeMemoryStore(basePath: string): Promise<AgentMemoryStore> {
  const memoryPath = path.join(basePath, ".opencode", "agents", "memory")
  await mkdir(memoryPath, { recursive: true })
  
  const dbPath = path.join(memoryPath, "agents.db")
  return new AgentMemoryStore(dbPath)
}

// Export singleton instance
let memoryStore: AgentMemoryStore | null = null

export async function getMemoryStore(basePath?: string): Promise<AgentMemoryStore> {
  if (!memoryStore) {
    memoryStore = await initializeMemoryStore(basePath || process.cwd())
  }
  return memoryStore
}

// Cleanup function for expired entries
export async function cleanupExpiredMemory(basePath?: string): Promise<number> {
  const store = await getMemoryStore(basePath)
  return store.cleanup()
}
