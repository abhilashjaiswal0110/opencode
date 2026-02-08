# OpenCode Architecture

This document provides a comprehensive overview of the OpenCode architecture, design patterns, and system components.

## System Overview

OpenCode is an open-source AI coding agent built with a client/server architecture that enables flexible deployment and multiple client interfaces.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
├─────────────────┬─────────────────┬────────────────────┤
│   TUI Client    │   Web Client    │  Desktop Client    │
│   (Terminal)    │   (Browser)     │   (Tauri)          │
└────────┬────────┴────────┬────────┴────────┬───────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                          │
                ┌─────────▼─────────┐
                │   API Gateway     │
                │   (Hono Server)   │
                └─────────┬─────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐    ┌─────▼─────┐    ┌────▼────┐
    │ Agents  │    │ Services  │    │ Tools   │
    │ System  │    │ Layer     │    │ Layer   │
    └────┬────┘    └─────┬─────┘    └────┬────┘
         │               │               │
         └───────────────┼───────────────┘
                        │
              ┌─────────▼─────────┐
              │   Data Layer      │
              │   (Drizzle ORM)   │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │   SQLite DB       │
              └───────────────────┘
```

## Core Components

### 1. Server Layer (`packages/opencode/src/server/`)

The server is built with **Hono**, a fast and lightweight web framework.

#### Key Responsibilities:
- API endpoint management
- WebSocket connections for real-time communication
- Session management
- Agent orchestration
- Tool execution

#### Server Structure:
```typescript
packages/opencode/src/server/
├── server.ts           # Main server setup
├── routes/            # API route handlers
├── middleware/        # Request/response middleware
└── websocket/        # WebSocket handlers
```

### 2. Agent System (`packages/opencode/src/agents/`)

OpenCode uses multiple specialized agents for different tasks.

#### Built-in Agents:

**Build Agent** (Default)
- Full file system access
- Can create, edit, and delete files
- Execute bash commands
- Ideal for development work

**Plan Agent** (Read-only)
- Read-only file system access
- Asks permission before running commands
- Perfect for code exploration and planning
- Safe for unfamiliar codebases

**General Sub-agent**
- Handles complex searches
- Multi-step task execution
- Invoked with `@general` in messages

#### Agent Architecture:
```typescript
interface Agent {
  name: string
  permissions: {
    fileSystem: "read" | "write" | "full"
    execution: "allowed" | "prompt" | "denied"
  }
  tools: Tool[]
  model: AIModel
}
```

### 3. Tool System (`packages/opencode/src/tools/`)

Tools provide specific capabilities to agents.

#### Available Tools:
- **File Operations**: `view`, `create`, `edit`
- **Code Search**: `grep`, `glob`
- **Shell**: `bash`, `read_bash`, `write_bash`
- **Git Operations**: Via bash commands
- **Web**: `web_fetch`, `web_search`
- **Task Management**: `task` (sub-agent invocation)

#### Tool Interface:
```typescript
interface Tool {
  name: string
  description: string
  parameters: JSONSchema
  execute: (params: any) => Promise<any>
}
```

### 4. LSP Integration (`packages/opencode/src/lsp/`)

Language Server Protocol integration for code intelligence.

#### Supported LSPs:
- TypeScript/JavaScript (tsserver)
- Python (pyright)
- Rust (rust-analyzer)
- Go (gopls)
- And more...

#### Features:
- Code completion
- Go to definition
- Find references
- Diagnostics
- Code actions

### 5. Database Layer

Uses **Drizzle ORM** with **SQLite** for local data persistence.

#### Schema Convention:
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

// Use snake_case for field names
export const sessions = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
  updated_at: integer().notNull(),
})
```

### 6. Client Implementations

#### TUI Client (`packages/opencode/src/cli/cmd/tui/`)
- Built with **SolidJS** and **opentui**
- Terminal-based interface
- Keyboard-driven navigation
- Real-time updates via WebSocket

#### Web Client (`packages/app/`)
- **SolidJS** components
- Responsive design
- Modern browser support
- Accessible UI

#### Desktop Client (`packages/desktop/`)
- Built with **Tauri**
- Native OS integration
- Cross-platform (Windows, macOS, Linux)
- Wraps web client in native shell

## Design Patterns

### 1. Functional Programming

OpenCode follows functional programming principles:

```typescript
// Prefer immutability
const data = [...originalData, newItem]

// Use array methods over loops
const filtered = items.filter(x => x.active)
const mapped = items.map(x => x.id)

// Avoid let, prefer const
const result = condition ? value1 : value2

// Early returns over else
function process(input: string) {
  if (!input) return ""
  if (input.length > 10) return input.slice(0, 10)
  return input.toUpperCase()
}
```

### 2. Type Safety

Leverage TypeScript's type system:

```typescript
// Rely on type inference
const user = { id: "123", name: "John" }  // Type inferred

// Use precise types
type Status = "pending" | "approved" | "rejected"

// Avoid any
// ❌ const data: any = fetchData()
// ✅ const data = fetchData() as UserData
```

### 3. Error Handling

Prefer `.catch()` over `try/catch`:

```typescript
// Preferred
asyncOperation()
  .then(result => processResult(result))
  .catch(error => handleError(error))

// Only use try/catch when necessary
async function complexOperation() {
  try {
    const data = await fetchData()
    return await processData(data)
  } catch (error) {
    // Handle error
    throw new Error(`Failed to process: ${error}`)
  }
}
```

### 4. Single Responsibility

Keep functions focused:

```typescript
// ❌ Bad: Multiple responsibilities
function processUserAndSendEmail(user: User) {
  validateUser(user)
  saveUser(user)
  sendWelcomeEmail(user.email)
  logActivity(user.id)
}

// ✅ Good: Single responsibility
function processUser(user: User) {
  validateUser(user)
  return saveUser(user)
}

function notifyUser(user: User) {
  sendWelcomeEmail(user.email)
}
```

## Data Flow

### 1. User Request Flow

```
User Input (TUI/Web/Desktop)
         ↓
   Client Layer
         ↓
   WebSocket/HTTP
         ↓
   API Gateway
         ↓
   Agent System
         ↓
   Tool Execution
         ↓
   Response Stream
         ↓
   Client Update
```

### 2. Agent Execution Flow

```
1. Receive user message
2. Agent processes message with LLM
3. LLM decides to use tools
4. Execute tool(s)
5. Tool results returned to LLM
6. LLM processes results
7. Generate response
8. Stream response to client
```

### 3. File Operation Flow

```
Client Request (edit file)
         ↓
Server validates permissions
         ↓
Agent checks file exists
         ↓
Execute edit tool
         ↓
Update file system
         ↓
Trigger LSP update
         ↓
Return success/error
         ↓
Client updates UI
```

## Communication Protocols

### 1. WebSocket Protocol

Used for real-time bidirectional communication:

```typescript
// Client → Server
{
  type: "message",
  content: "Create a new file",
  sessionId: "session-123"
}

// Server → Client
{
  type: "response",
  content: "File created successfully",
  done: false
}

// Server → Client (streaming)
{
  type: "chunk",
  content: "Creating...",
  done: false
}

// Server → Client (completion)
{
  type: "response",
  content: "Done",
  done: true
}
```

### 2. REST API

Used for stateless operations:

```
GET    /api/sessions          # List sessions
POST   /api/sessions          # Create session
GET    /api/sessions/:id      # Get session
DELETE /api/sessions/:id      # Delete session

GET    /api/files?path=...    # Get file
PUT    /api/files             # Update file
POST   /api/files             # Create file
DELETE /api/files?path=...    # Delete file
```

## Security Architecture

### 1. Authentication

```typescript
// API key authentication
headers: {
  "Authorization": "Bearer your-api-key"
}

// Session tokens
headers: {
  "X-Session-Token": "session-token"
}
```

### 2. Permission System

```typescript
interface Permissions {
  fileSystem: {
    read: boolean
    write: boolean
    delete: boolean
  }
  execution: {
    bash: boolean
    requiresConfirmation: boolean
  }
  network: {
    allowed: boolean
    allowedDomains: string[]
  }
}
```

### 3. Sandboxing

- File system operations are scoped to project directory
- Network requests can be restricted
- Bash commands run in isolated environment
- Resource limits enforced

## Performance Considerations

### 1. Streaming Responses

LLM responses are streamed to reduce perceived latency:

```typescript
async function* streamResponse(prompt: string) {
  for await (const chunk of llm.stream(prompt)) {
    yield chunk
  }
}
```

### 2. Caching

- LSP responses cached
- File content cached with TTL
- Database query results cached
- LLM completions cached for identical prompts

### 3. Lazy Loading

- Files loaded on demand
- UI components lazy loaded
- Dependencies loaded asynchronously

### 4. Parallel Processing

```typescript
// Parallel tool execution when possible
const results = await Promise.all([
  tool1.execute(),
  tool2.execute(),
  tool3.execute()
])
```

## Deployment Architecture

### Development

```
Local Machine
├── Bun Dev Server (Hot reload)
├── SQLite Database (Local)
└── File System (Project directory)
```

### Production

```
Server/Cloud
├── Built Executable
├── SQLite Database (Persistent volume)
├── File System (Mounted volumes)
└── Reverse Proxy (nginx/caddy)
```

### Enterprise

```
Kubernetes Cluster
├── API Gateway (Ingress)
├── OpenCode Pods (Horizontal scaling)
├── PostgreSQL (Shared database)
├── Redis (Caching layer)
├── S3/Blob Storage (File storage)
└── Monitoring (Prometheus/Grafana)
```

## Extension Points

### 1. Custom Agents

```typescript
// Create custom agent
const customAgent: Agent = {
  name: "my-agent",
  permissions: { ... },
  tools: [customTool1, customTool2],
  model: "gpt-4"
}
```

### 2. Custom Tools

```typescript
// Implement custom tool
const customTool: Tool = {
  name: "my-tool",
  description: "Does something custom",
  parameters: { ... },
  execute: async (params) => {
    // Implementation
    return result
  }
}
```

### 3. Plugin System

```typescript
// Load plugins
import { loadPlugin } from "@opencode-ai/plugin"

const plugin = await loadPlugin("my-plugin")
```

## Monitoring and Observability

### Logging

```typescript
// Structured logging
logger.info("Processing request", {
  sessionId,
  userId,
  action: "create_file"
})

logger.error("Failed to process", {
  error,
  context: { ... }
})
```

### Metrics

- Request latency
- Token usage
- Error rates
- Active sessions
- Tool execution times

### Tracing

- Distributed tracing support
- Request ID propagation
- Performance profiling

## Future Architecture

### Planned Enhancements

1. **Multi-user Support**
   - User authentication
   - Role-based access control
   - Team collaboration features

2. **Distributed Processing**
   - Agent execution on separate workers
   - Queue-based task processing
   - Load balancing

3. **Plugin Marketplace**
   - Community plugins
   - Plugin discovery
   - Version management

4. **Cloud Integration**
   - Native cloud provider support
   - Remote file system access
   - Serverless deployments

## Resources

- [Local Setup Guide](./local-setup.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Style Guide](../AGENTS.md)
- [API Documentation](https://opencode.ai/docs/api)

## Contributing to Architecture

Architecture changes require:
1. Design document
2. Community discussion
3. Maintainer approval
4. Implementation PR

See [Contributing Guidelines](../CONTRIBUTING.md) for details.
