# Agent Integration Guide

This guide explains how to integrate the new agent system with the existing OpenCode codebase.

## Overview

The agent system has been designed to integrate seamlessly with OpenCode's existing agent architecture without breaking changes.

## Integration Steps

### 1. Update Agent Registry

The agents need to be registered with OpenCode's core agent system.

**File**: `packages/opencode/src/agent/agent.ts`

Add the following to load custom agents from `.github/agents/`:

```typescript
// At the top of the file, add:
import { createAgentRegistry } from "@/../.github/agents/registry"
import path from "path"

// In the state function, after the existing agents, add:
const agentRegistry = await createAgentRegistry(path.join(Instance.worktree))
const customAgents = await agentRegistry.registerWithOpenCode()

// Merge custom agents with existing agents
for (const [name, config] of Object.entries(customAgents)) {
  if (!result[name]) {
    result[name] = config
  }
}
```

### 2. Initialize Memory Store on Startup

**File**: `packages/opencode/src/index.ts`

Add initialization:

```typescript
import { initializeAgentSystem } from "@/../.github/agents/init"

// During startup
await initializeAgentSystem(process.cwd())
```

### 3. Add Agent Commands

**File**: `packages/opencode/src/cli/cmd/agent.ts`

Add commands for agent management:

```typescript
export const agentCommands = {
  init: async () => {
    const { initializeAgentSystem } = await import("@/../.github/agents/init")
    await initializeAgentSystem(process.cwd())
  },
  
  list: async () => {
    const { createAgentRegistry } = await import("@/../.github/agents/registry")
    const registry = await createAgentRegistry(process.cwd())
    const agents = registry.getAllAgents()
    
    console.log("Available Agents:")
    agents.forEach(agent => {
      console.log(`  - ${agent.name}: ${agent.description}`)
    })
  },
  
  info: async (name: string) => {
    const { createAgentRegistry } = await import("@/../.github/agents/registry")
    const registry = await createAgentRegistry(process.cwd())
    const agent = registry.getAgent(name)
    
    if (!agent) {
      console.error(`Agent '${name}' not found`)
      return
    }
    
    console.log(JSON.stringify(agent, null, 2))
  }
}
```

### 4. Add Configuration Support

**File**: `packages/opencode/src/config/config.ts`

Extend the config schema to support agent configuration:

```typescript
export const ConfigSchema = z.object({
  // Existing config...
  
  agents: z.object({
    enabled: z.boolean().default(true),
    memory: z.object({
      enabled: z.boolean().default(true),
      ttl: z.number().default(604800),
    }).optional(),
    custom: z.record(z.any()).optional(),
  }).optional(),
})
```

### 5. Update Environment Variables

**File**: `.env.example`

Add agent-related environment variables:

```bash
# Agent System Configuration
GITHUB_COPILOT_TOKEN=your_token_here
OPENCODE_AGENTS_MEMORY_DIR=.opencode/agents/memory
OPENCODE_AGENTS_LOG_LEVEL=info

# Optional: Agent-specific settings
SECURITY_AGENT_SEVERITY_THRESHOLD=medium
CODE_REVIEW_STRICTNESS=high
```

### 6. Add to Build Process

**File**: `package.json`

Add scripts for agent management:

```json
{
  "scripts": {
    "agents:init": "bun run .github/agents/init.ts",
    "agents:test": "bun test .github/agents/tests/",
    "agents:list": "bun run .github/agents/list-agents.ts"
  }
}
```

### 7. Update Documentation

**File**: `README.md`

Add agent system to main README:

```markdown
## Agents

OpenCode includes multiple specialized agents:

- **build**: Default development agent (full access)
- **plan**: Read-only agent for analysis
- **general**: Multi-step task execution

### Enterprise Agents

- **security-architect**: Security analysis and vulnerability detection
- **code-reviewer**: Automated code reviews
- **documentation-agent**: Documentation generation
- **testing-agent**: Test generation and coverage
- **performance-agent**: Performance optimization
- **devops-agent**: CI/CD automation

See [Agent Documentation](.github/agents/README.md) for details.
```

## Usage After Integration

### CLI Usage

```bash
# Initialize agents
opencode agent init

# List available agents
opencode agent list

# Get agent info
opencode agent info security-architect
```

### In OpenCode Session

```bash
# Open OpenCode
opencode

# Use an agent
@security-architect scan src/

# Switch between agents
Tab # Switch to plan agent
@code-reviewer review changes
```

### Configuration

Users can configure agents in `.opencode/config.json`:

```json
{
  "agent": {
    "security-architect": {
      "model": "github-copilot/gpt-4",
      "temperature": 0.3,
      "options": {
        "severity_threshold": "medium"
      }
    }
  }
}
```

## Testing Integration

### Unit Tests

Add to the existing test suite:

```typescript
// packages/opencode/test/agent/custom-agents.test.ts
import { describe, it, expect } from "bun:test"
import { createAgentRegistry } from "@/../.github/agents/registry"

describe("Custom Agents Integration", () => {
  it("should load custom agents", async () => {
    const registry = await createAgentRegistry(process.cwd())
    const agents = registry.getAllAgents()
    
    expect(agents.length).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```bash
# Run all tests including agent tests
bun test

# Run only agent tests
bun test .github/agents/tests/
```

## Backward Compatibility

The integration maintains full backward compatibility:

- Existing agents (build, plan, general, explore) work unchanged
- New agents are optional and can be disabled
- No breaking changes to existing APIs
- Existing configurations remain valid

## Monitoring and Debugging

### Logs

Agent logs are stored in `.opencode/agents/logs/`:

```bash
# View agent logs
tail -f .opencode/agents/logs/security-architect.log

# View all agent logs
tail -f .opencode/agents/logs/*.log
```

### Memory Inspection

```bash
# View memory database
sqlite3 .opencode/agents/memory/agents.db

# Query memory
sqlite3 .opencode/agents/memory/agents.db "SELECT * FROM agent_memory"
```

### Debug Mode

Enable debug logging:

```bash
export OPENCODE_AGENTS_LOG_LEVEL=debug
opencode
```

## Performance Considerations

### Memory Usage

- Memory database typically < 10MB
- Context cache < 50MB
- Agent processes isolated

### Startup Time

- Agent initialization adds ~100-200ms to startup
- Lazy loading minimizes initial impact
- First agent call may take 1-2s for context loading

### Token Usage

- Typical security scan: 5,000-15,000 tokens
- Code review: 3,000-10,000 tokens
- Documentation generation: 2,000-8,000 tokens

Monitor usage:

```typescript
const copilot = createCopilotFromEnv()
const stats = copilot?.getUsageStats()
console.log(stats)
```

## Security Considerations

### Secrets Management

Never commit secrets:

```bash
# Add to .gitignore
.opencode/agents/memory/
.opencode/agents/logs/
.env
```

### Permission System

Agents use OpenCode's permission system:

```json
{
  "agent": {
    "security-architect": {
      "permission": {
        "read": "allow",
        "write": "deny",
        "bash": "ask"
      }
    }
  }
}
```

### Rate Limiting

GitHub Copilot rate limits are enforced:
- 60 requests/minute
- 150,000 tokens/minute

## Deployment

### Development

```bash
# Clone and setup
git clone <repo>
cd opencode
bun install

# Initialize agents
bun run agents:init

# Start development
bun run dev
```

### Production

```bash
# Build
bun run build

# Initialize agents
NODE_ENV=production bun run agents:init

# Start
bun start
```

### Docker

```dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY . .

RUN bun install
RUN bun run agents:init

CMD ["bun", "start"]
```

## Troubleshooting

### Agents Not Loading

**Issue**: Agents not showing up

**Solution**:
```bash
# Reinitialize
bun run agents:init

# Check registry
bun run agents:list
```

### Memory Errors

**Issue**: Memory database errors

**Solution**:
```bash
# Clear memory
rm -rf .opencode/agents/memory/*

# Reinitialize
bun run agents:init
```

### Copilot Connection Issues

**Issue**: GitHub Copilot not responding

**Solution**:
```bash
# Verify token
echo $GITHUB_COPILOT_TOKEN

# Test connection
bun run .github/agents/test-copilot.ts
```

## Migration Guide

### From Existing Setup

If you have an existing OpenCode setup:

1. **Backup configuration**
   ```bash
   cp .opencode/config.json .opencode/config.json.backup
   ```

2. **Pull latest changes**
   ```bash
   git pull origin dev
   ```

3. **Install dependencies**
   ```bash
   bun install
   ```

4. **Initialize agents**
   ```bash
   bun run agents:init
   ```

5. **Update configuration**
   - Merge your backed-up config with new agent settings
   - Test with a sample project

## Support

For integration issues:

- **Documentation**: See [QUICKSTART.md](./QUICKSTART.md)
- **Issues**: Open a GitHub issue with `integration` label
- **Discord**: [OpenCode Discord](https://opencode.ai/discord)
- **Email**: dev@opencode.ai

## Next Steps

After integration:

1. Read [QUICKSTART.md](./QUICKSTART.md) for basic usage
2. Review [USAGE.md](./USAGE.md) for advanced features
3. Check [CUSTOM_AGENTS.md](./CUSTOM_AGENTS.md) for creating custom agents
4. Join the community on Discord

---

**Note**: This integration guide assumes OpenCode version >= 0.1.0. For older versions, additional migration steps may be required.
