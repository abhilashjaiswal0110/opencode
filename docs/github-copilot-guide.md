# GitHub Copilot Integration Guide

This guide explains how to effectively use GitHub Copilot with the OpenCode repository for enhanced development productivity.

## Prerequisites

- GitHub Copilot subscription (Individual, Business, or Enterprise)
- VS Code with GitHub Copilot extension
- OpenCode repository cloned locally

## Initial Setup

### 1. Install GitHub Copilot Extensions

Install the following VS Code extensions:

```bash
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
```

Or install via VS Code:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "GitHub Copilot" and install both extensions

### 2. Sign in to GitHub Copilot

1. Open VS Code
2. Click on the GitHub Copilot icon in the status bar
3. Sign in with your GitHub account
4. Authorize GitHub Copilot

### 3. Configure VS Code Settings

Copy and customize the example settings:

```bash
cp .vscode/settings.example.json .vscode/settings.json
```

Add Copilot-specific settings to `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": false,
    "markdown": true,
    "typescript": true,
    "javascript": true
  },
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.advanced": {
    "listCount": 10,
    "inlineSuggestCount": 3
  }
}
```

## Using GitHub Copilot with OpenCode

### Code Completion

GitHub Copilot provides inline code suggestions as you type:

1. **Accept suggestions**: Press `Tab` to accept
2. **View alternatives**: Press `Alt+]` (next) or `Alt+[` (previous)
3. **Dismiss suggestions**: Press `Esc`

### Copilot Chat

Access Copilot Chat for contextual assistance:

1. **Open Chat**: Press `Ctrl+I` (Cmd+I on Mac) or click the chat icon
2. **Ask questions** about the codebase
3. **Generate code** with natural language prompts
4. **Explain code** by selecting code and asking for explanation

### Common Copilot Prompts for OpenCode Development

#### Understanding the Codebase

```
@workspace Explain the architecture of the OpenCode server
@workspace Where is the TUI code located?
@workspace How does OpenCode handle LSP integration?
```

#### Code Generation

```
Create a new LSP integration for Python following the existing pattern
Generate unit tests for the agent service factory
Write a TypeScript function to handle WebSocket connections
```

#### Debugging

```
Why might this function be throwing a type error?
How can I fix the memory leak in this component?
Suggest optimizations for this database query
```

#### Documentation

```
Generate JSDoc comments for this function
Create a README for this package
Write usage examples for this API endpoint
```

## Best Practices

### 1. Project-Specific Context

Create a `.github/copilot-instructions.md` file (see [Copilot Instructions](#copilot-instructions-file)) to provide project-specific context to Copilot.

### 2. Use Workspace Context

Use `@workspace` to query across the entire codebase:

```
@workspace Show me all API endpoints
@workspace Find authentication logic
@workspace List all available commands
```

### 3. Reference Specific Files

Use `#file` to reference specific files:

```
#file:packages/opencode/src/server.ts Explain this server implementation
```

### 4. Follow Existing Patterns

When generating code, ask Copilot to follow existing patterns:

```
Create a new agent following the pattern in @workspace /agents/
Add a new API endpoint following the style in #file:packages/opencode/src/server.ts
```

### 5. Iterate and Refine

Don't accept the first suggestion blindly:

1. Review generated code
2. Ask for alternatives: "Show me another approach"
3. Request specific improvements: "Make this more type-safe"
4. Verify against project standards

## Copilot Instructions File

Create `.github/copilot-instructions.md` with project-specific guidance:

```markdown
# OpenCode Copilot Instructions

## Project Context
- OpenCode is an AI-powered development tool
- Built with Bun, TypeScript, and SolidJS
- Follows functional programming patterns
- Uses Drizzle ORM for database operations

## Code Style
- Prefer `const` over `let`
- Avoid `else` statements, use early returns
- Use single-word variable names when possible
- Keep functions focused and concise
- Avoid try/catch where possible

## Naming Conventions
- Use snake_case for database field names
- Use camelCase for TypeScript variables
- Use PascalCase for types and interfaces
- Prefer descriptive single-word names

## Testing
- Write tests using Bun's built-in test runner
- Avoid mocks when possible
- Test actual implementation, not abstracted logic

## When suggesting code:
1. Follow the existing style guide in AGENTS.md
2. Use Bun APIs when available (e.g., Bun.file())
3. Prefer functional array methods over loops
4. Avoid unnecessary destructuring
5. Use type inference when possible
```

## Advanced Features

### Copilot Labs (Experimental)

Install GitHub Copilot Labs for additional features:

```bash
code --install-extension GitHub.copilot-labs
```

Features include:
- **Explain**: Get explanations for complex code
- **Translate**: Convert code between languages
- **Brushes**: Apply code transformations
- **Test Generation**: Generate test cases

### Copilot CLI

Install Copilot CLI for terminal assistance:

```bash
gh extension install github/gh-copilot
```

Usage:
```bash
# Get help with commands
gh copilot suggest "install dependencies with bun"

# Explain commands
gh copilot explain "bun run --cwd packages/opencode dev"
```

## Workspace-Specific Tips

### Working with TypeScript

```typescript
// Copilot understands TypeScript types
// Just start typing and let it suggest:

interface User {
  id: string
  name: string
  email: string
}

// Type a function signature, Copilot fills in implementation:
function findUserById(id: string): User | undefined {
  // Copilot will suggest implementation
}
```

### Working with SolidJS

```typescript
// Copilot knows SolidJS patterns
import { createSignal, For, Show } from "solid-js"

function UserList() {
  const [users, setUsers] = createSignal<User[]>([])
  
  // Copilot suggests SolidJS-specific code
}
```

### Working with Drizzle ORM

```typescript
// Copilot understands Drizzle patterns
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  name: text().notNull(),
  // Copilot suggests more fields
})
```

## Troubleshooting

### Copilot Not Suggesting

1. Check Copilot status in status bar
2. Ensure you're signed in
3. Verify file type is enabled in settings
4. Reload VS Code: `Ctrl+Shift+P` → "Reload Window"

### Poor Suggestions

1. Provide more context in comments
2. Use better variable/function names
3. Add type annotations
4. Reference similar existing code

### Context Issues

1. Open relevant files in VS Code
2. Use `@workspace` for broader context
3. Create `.github/copilot-instructions.md`
4. Add inline comments explaining intent

## Security Considerations

### Don't Commit Secrets

GitHub Copilot learns from your code. Never:
- Store API keys in code
- Commit credentials to the repository
- Include sensitive data in comments

Use environment variables instead:

```typescript
// Good
const apiKey = process.env.OPENAI_API_KEY

// Bad - Never do this!
const apiKey = "sk-..." // DON'T COMMIT THIS
```

### Review Generated Code

Always review Copilot suggestions for:
- Security vulnerabilities
- Logic errors
- Performance issues
- License compatibility

## Learning Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Copilot Best Practices](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)
- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode Discord Community](https://opencode.ai/discord)

## Next Steps

- Review [Style Guide](../AGENTS.md)
- Read [Contributing Guidelines](../CONTRIBUTING.md)
- Explore [Testing Guide](./testing-guide.md)
- Check [Use Cases](./use-cases.md)
