# Custom Agent Development Guide

This guide explains how to create custom agents for OpenCode with context engineering and memory persistence.

## Agent Structure

Each agent consists of:

1. **Agent Definition** (`.github/agents/<name>/agent.json`)
2. **System Prompt** (`.github/agents/<name>/prompt.txt`)
3. **Context Manager** (`.github/agents/<name>/context.ts`)
4. **Memory Store** (`.github/agents/<name>/memory.ts`)
5. **Tool Definitions** (`.github/agents/<name>/tools/`)

## Quick Start

### 1. Create Agent Directory

```bash
mkdir -p .github/agents/my-agent/{tools,tests}
```

### 2. Define Agent Configuration

Create `.github/agents/my-agent/agent.json`:

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "Description of what the agent does",
  "author": "Your Name",
  "mode": "subagent",
  "model": {
    "providerID": "github-copilot",
    "modelID": "gpt-4"
  },
  "permissions": {
    "*": "deny",
    "read": "allow",
    "grep": "allow",
    "glob": "allow",
    "bash": "ask"
  },
  "capabilities": [
    "code-analysis",
    "documentation",
    "testing"
  ],
  "context": {
    "window_size": 128000,
    "memory_enabled": true,
    "memory_ttl": 604800
  },
  "options": {
    "temperature": 0.7,
    "topP": 0.9,
    "maxTokens": 4096
  }
}
```

### 3. Write System Prompt

Create `.github/agents/my-agent/prompt.txt`:

```
You are a specialized AI agent for [purpose].

Your responsibilities:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

Guidelines:
- Follow the project style guide in AGENTS.md
- Make minimal, focused changes
- Ensure all changes are tested
- Document your changes
- Consider security implications

Context:
You have access to the codebase context and memory from previous interactions.
Use this context to provide more relevant and consistent assistance.

Tools Available:
- read: Read file contents
- grep: Search code with patterns
- glob: Find files by pattern
- [custom tools]

Always provide clear explanations and follow best practices.
```

### 4. Implement Context Manager

Create `.github/agents/my-agent/context.ts`:

```typescript
import { Agent } from "@/agent/agent"

export class MyAgentContext {
  private memory: Map<string, any> = new Map()
  
  async loadContext(sessionId: string): Promise<string> {
    // Load relevant context from memory
    const history = await this.memory.get(`session:${sessionId}`)
    const recentFiles = await this.getRecentFiles()
    const projectInfo = await this.getProjectInfo()
    
    return `
Project Context:
${projectInfo}

Recent Files:
${recentFiles.join('\n')}

Previous Interactions:
${history || 'None'}
`
  }
  
  async saveContext(sessionId: string, data: any): Promise<void> {
    await this.memory.set(`session:${sessionId}`, data)
  }
  
  private async getRecentFiles(): Promise<string[]> {
    // Implement logic to get recently modified files
    return []
  }
  
  private async getProjectInfo(): Promise<string> {
    // Implement logic to get project metadata
    return ""
  }
}
```

### 5. Implement Memory Persistence

Create `.github/agents/my-agent/memory.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"

// Define schema
export const agentMemory = sqliteTable("agent_memory", {
  id: text().primaryKey(),
  agent_name: text().notNull(),
  session_id: text().notNull(),
  key: text().notNull(),
  value: text().notNull(),
  created_at: integer().notNull(),
  expires_at: integer(),
})

export class AgentMemoryStore {
  private db: ReturnType<typeof drizzle>
  
  constructor(dbPath: string) {
    const sqlite = new Database(dbPath)
    this.db = drizzle(sqlite)
  }
  
  async store(key: string, value: any, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null
    
    await this.db.insert(agentMemory).values({
      id: crypto.randomUUID(),
      agent_name: "my-agent",
      session_id: this.getCurrentSession(),
      key,
      value: JSON.stringify(value),
      created_at: Date.now(),
      expires_at: expiresAt,
    })
  }
  
  async retrieve(key: string): Promise<any | null> {
    const results = await this.db
      .select()
      .from(agentMemory)
      .where((m) => m.key.eq(key))
      .limit(1)
    
    if (!results.length) return null
    
    const record = results[0]
    
    // Check expiration
    if (record.expires_at && record.expires_at < Date.now()) {
      await this.delete(key)
      return null
    }
    
    return JSON.parse(record.value)
  }
  
  async delete(key: string): Promise<void> {
    await this.db.delete(agentMemory).where((m) => m.key.eq(key))
  }
  
  async cleanup(): Promise<void> {
    // Remove expired entries
    await this.db
      .delete(agentMemory)
      .where((m) => m.expires_at.lt(Date.now()))
  }
  
  private getCurrentSession(): string {
    // Implement session ID retrieval
    return "current-session"
  }
}
```

### 6. Create Custom Tools (Optional)

Create `.github/agents/my-agent/tools/custom-tool.ts`:

```typescript
import { Tool } from "@/tool/tool"
import z from "zod"

export const customTool: Tool = {
  name: "custom_tool",
  description: "Description of what this tool does",
  parameters: z.object({
    input: z.string().describe("Input parameter description"),
    option: z.boolean().optional().describe("Optional parameter"),
  }),
  
  execute: async (params) => {
    const { input, option } = params
    
    // Implement tool logic
    const result = await processInput(input, option)
    
    return {
      success: true,
      data: result,
      message: "Tool executed successfully",
    }
  },
}

async function processInput(input: string, option?: boolean): Promise<any> {
  // Implementation
  return {}
}
```

### 7. Add Tests

Create `.github/agents/my-agent/tests/agent.test.ts`:

```typescript
import { describe, it, expect } from "bun:test"
import { MyAgentContext } from "../context"
import { AgentMemoryStore } from "../memory"

describe("MyAgent", () => {
  describe("Context Management", () => {
    it("should load context for session", async () => {
      const context = new MyAgentContext()
      const result = await context.loadContext("test-session")
      
      expect(result).toBeTruthy()
      expect(result).toContain("Project Context")
    })
    
    it("should save context for session", async () => {
      const context = new MyAgentContext()
      await context.saveContext("test-session", { test: "data" })
      
      // Verify saved
      const loaded = await context.loadContext("test-session")
      expect(loaded).toContain("data")
    })
  })
  
  describe("Memory Persistence", () => {
    it("should store and retrieve values", async () => {
      const memory = new AgentMemoryStore(":memory:")
      
      await memory.store("test-key", { value: "test" })
      const result = await memory.retrieve("test-key")
      
      expect(result).toEqual({ value: "test" })
    })
    
    it("should handle expiration", async () => {
      const memory = new AgentMemoryStore(":memory:")
      
      await memory.store("test-key", { value: "test" }, 1) // 1 second TTL
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100))
      
      const result = await memory.retrieve("test-key")
      expect(result).toBeNull()
    })
  })
})
```

## Integration with OpenCode

### Register Agent

Add to `packages/opencode/src/agent/agent.ts`:

```typescript
// In the state function, add:
"my-agent": {
  name: "my-agent",
  description: "My custom agent description",
  mode: "subagent",
  permission: PermissionNext.merge(
    defaults,
    PermissionNext.fromConfig({
      read: "allow",
      grep: "allow",
      glob: "allow",
    }),
    user,
  ),
  prompt: await Bun.file(".github/agents/my-agent/prompt.txt").text(),
  options: {},
  native: false,
}
```

### Use in Configuration

Add to `.opencode/config.json`:

```json
{
  "agent": {
    "my-agent": {
      "model": "github-copilot/gpt-4",
      "temperature": 0.7,
      "mode": "subagent",
      "permission": {
        "read": "allow",
        "write": "ask"
      }
    }
  }
}
```

## Best Practices

### 1. Context Engineering

- **Keep context focused**: Only include relevant information
- **Use hierarchical context**: Project > Module > File
- **Refresh stale context**: Update context periodically
- **Compress long context**: Summarize when needed

### 2. Memory Management

- **Set appropriate TTLs**: Don't keep stale data forever
- **Clean up regularly**: Remove expired entries
- **Index for performance**: Add indexes for frequent queries
- **Backup critical data**: Implement backup strategy

### 3. Security

- **Validate inputs**: Always validate user inputs
- **Sanitize outputs**: Prevent injection attacks
- **Limit permissions**: Follow principle of least privilege
- **Audit actions**: Log all agent actions

### 4. Performance

- **Batch operations**: Minimize DB calls
- **Cache results**: Cache frequent queries
- **Lazy loading**: Load context on demand
- **Parallel execution**: Use Promise.all for independent tasks

### 5. Error Handling

- **Graceful degradation**: Fall back to basic functionality
- **Clear error messages**: Help users understand issues
- **Retry logic**: Handle transient failures
- **Error logging**: Track errors for debugging

## GitHub Copilot Integration

### Using Copilot Credits

```typescript
import { generateText } from "ai"
import { createGitHubCopilot } from "@ai-sdk/github-copilot"

const copilot = createGitHubCopilot({
  apiKey: process.env.GITHUB_COPILOT_TOKEN,
})

const { text } = await generateText({
  model: copilot("gpt-4"),
  prompt: "Your prompt here",
  temperature: 0.7,
})
```

### Optimizing Token Usage

- **Truncate context**: Keep context within limits
- **Use streaming**: Stream responses for long outputs
- **Cache responses**: Avoid duplicate calls
- **Smart batching**: Batch related queries

## Testing Your Agent

### Unit Tests

```bash
bun test .github/agents/my-agent/tests/
```

### Integration Tests

```bash
bun run test:integration --agent=my-agent
```

### Manual Testing

```bash
opencode agent my-agent "test query"
```

## Documentation

Always document your agent:

1. **README.md**: Overview and usage
2. **ARCHITECTURE.md**: Technical details
3. **API.md**: Tool APIs and interfaces
4. **EXAMPLES.md**: Usage examples

## Resources

- [OpenCode Agent System](../../packages/opencode/src/agent/agent.ts)
- [Tool Registry](../../packages/opencode/src/tool/registry.ts)
- [Permission System](../../packages/opencode/src/permission/)
- [GitHub Copilot API](https://docs.github.com/en/copilot)

## Support

For questions or issues:
- Open an issue with the `agent` label
- Join [Discord community](https://opencode.ai/discord)
- Check [documentation](https://opencode.ai/docs)
