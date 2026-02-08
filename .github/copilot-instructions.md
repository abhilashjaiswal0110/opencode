# OpenCode GitHub Copilot Instructions

This file provides context-specific instructions to GitHub Copilot for better code suggestions within the OpenCode repository.

## Project Overview

OpenCode is an open-source AI coding agent built with:
- **Runtime**: Bun 1.3+
- **Language**: TypeScript
- **UI Framework**: SolidJS
- **Database**: Drizzle ORM with SQLite
- **Server**: Hono (web framework)
- **Desktop**: Tauri (native apps)

## Architecture

### Key Directories
- `packages/opencode/`: Core business logic and server
- `packages/app/`: Shared web UI components
- `packages/desktop/`: Native desktop application
- `packages/console/`: Console components
- `packages/plugin/`: Plugin system
- `packages/sdk/`: SDK packages

### Design Philosophy
- **Functional Programming**: Prefer immutability and pure functions
- **Type Safety**: Leverage TypeScript's type system
- **Performance**: Use Bun APIs when available
- **Simplicity**: Keep functions focused and concise

## Code Style Guidelines

### TypeScript

```typescript
// ✅ GOOD: Use const, type inference, early returns
const processData = (input: string) => {
  if (!input) return ""
  if (input.length > 100) return input.slice(0, 100)
  return input.toUpperCase()
}

// ❌ BAD: Avoid let, else, unnecessary destructuring
let result
if (condition) {
  result = value1
} else {
  result = value2
}
```

### Naming Conventions

```typescript
// ✅ Prefer single-word names
const user = fetchUser()
const data = processData()

// ❌ Avoid overly verbose names
const userDataFromDatabase = fetchUserDataFromDatabase()

// Database fields: Use snake_case
const users = sqliteTable("users", {
  user_id: text().primaryKey(),
  created_at: integer().notNull()
})

// TypeScript: Use camelCase
const userId = "123"
const createdAt = Date.now()
```

### Function Structure

```typescript
// ✅ GOOD: Single responsibility, concise
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// ❌ BAD: Multiple responsibilities
const validateAndSaveEmail = (email: string) => {
  // Validation
  // Saving
  // Logging
  // Email sending
}
```

### Error Handling

```typescript
// ✅ GOOD: Prefer .catch()
fetchData()
  .then(processData)
  .catch(error => handleError(error))

// ⚠️ Only use try/catch when necessary
async function complexOperation() {
  try {
    const result = await multiStepProcess()
    return result
  } catch (error) {
    logError(error)
    throw new Error("Operation failed")
  }
}
```

### Array Operations

```typescript
// ✅ GOOD: Functional array methods
const activeUsers = users.filter(u => u.active)
const userIds = users.map(u => u.id)
const total = numbers.reduce((sum, n) => sum + n, 0)

// ❌ BAD: For loops (unless performance critical)
const activeUsers = []
for (let i = 0; i < users.length; i++) {
  if (users[i].active) {
    activeUsers.push(users[i])
  }
}
```

### Destructuring

```typescript
// ✅ GOOD: Minimal destructuring, preserve context
obj.name
obj.email
obj.id

// ❌ BAD: Unnecessary destructuring
const { name, email, id } = obj
```

## Framework-Specific Guidelines

### SolidJS Components

```typescript
// ✅ GOOD: Use Solid's reactive primitives
import { createSignal, For, Show } from "solid-js"

function UserList() {
  const [users, setUsers] = createSignal<User[]>([])
  
  return (
    <div>
      <For each={users()}>
        {user => <UserCard user={user} />}
      </For>
    </div>
  )
}
```

### Drizzle ORM

```typescript
// ✅ GOOD: Use snake_case, infer types
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text().primaryKey(),
  user_name: text().notNull(),
  created_at: integer().notNull()
})

// Query example
const allUsers = await db.select().from(users)
```

### Hono Server

```typescript
// ✅ GOOD: Type-safe routes
import { Hono } from "hono"

const app = new Hono()

app.get("/api/users/:id", async (c) => {
  const id = c.req.param("id")
  const user = await findUser(id)
  if (!user) return c.json({ error: "Not found" }, 404)
  return c.json(user)
})
```

## Testing Guidelines

### Test Structure

```typescript
// ✅ GOOD: Use Bun test, avoid mocks
import { describe, it, expect } from "bun:test"

describe("validateEmail", () => {
  it("should return true for valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true)
  })
  
  it("should return false for invalid email", () => {
    expect(validateEmail("invalid")).toBe(false)
  })
})
```

### Test Real Implementation

```typescript
// ✅ GOOD: Test actual behavior
it("should calculate total correctly", () => {
  expect(calculateTotal([1, 2, 3])).toBe(6)
  expect(calculateTotal([])).toBe(0)
})

// ❌ BAD: Don't duplicate implementation
it("should calculate total correctly", () => {
  const items = [1, 2, 3]
  const expected = items.reduce((a, b) => a + b, 0)
  expect(calculateTotal(items)).toBe(expected)
})
```

## Common Patterns

### API Endpoints

```typescript
// Pattern for API routes
app.post("/api/resource", async (c) => {
  const body = await c.req.json()
  const validated = validateInput(body)
  if (!validated.success) {
    return c.json({ error: validated.error }, 400)
  }
  const result = await createResource(validated.data)
  return c.json(result, 201)
})
```

### Database Operations

```typescript
// Pattern for database queries
const createUser = async (data: UserInput) => {
  const [user] = await db
    .insert(users)
    .values({
      id: generateId(),
      ...data,
      created_at: Date.now()
    })
    .returning()
  
  return user
}
```

### Streaming Responses

```typescript
// Pattern for streaming LLM responses
async function* streamResponse(prompt: string) {
  for await (const chunk of llm.stream(prompt)) {
    yield chunk
  }
}
```

## Anti-Patterns to Avoid

❌ **Don't use `any` type**
```typescript
// Bad
const data: any = await fetch()

// Good
const data = await fetch() as UserData
```

❌ **Don't use `let` unnecessarily**
```typescript
// Bad
let result
if (condition) result = a
else result = b

// Good
const result = condition ? a : b
```

❌ **Don't create overly nested code**
```typescript
// Bad
if (a) {
  if (b) {
    if (c) {
      doSomething()
    }
  }
}

// Good
if (!a) return
if (!b) return
if (!c) return
doSomething()
```

❌ **Don't use class-based components in SolidJS**
```typescript
// Bad
class MyComponent extends Component { }

// Good
function MyComponent() { }
```

## When Suggesting Code

1. **Follow the existing style** - Look at similar files for patterns
2. **Use Bun APIs** - Prefer `Bun.file()`, `Bun.write()`, etc.
3. **Type inference** - Let TypeScript infer types when possible
4. **Single responsibility** - Keep functions focused
5. **Functional style** - Prefer map/filter/reduce over loops
6. **No unnecessary abstraction** - Keep things simple

## File Organization

```
src/
├── server/           # Server-related code
│   ├── routes/      # API routes
│   ├── middleware/  # Request middleware
│   └── websocket/   # WebSocket handlers
├── agents/          # Agent implementations
├── tools/           # Tool implementations
├── db/              # Database schemas and queries
├── utils/           # Utility functions
└── types/           # TypeScript type definitions
```

## Commit Message Format

When suggesting commits, use conventional commits:

```
feat(scope): add new feature
fix(scope): resolve bug
docs(scope): update documentation
refactor(scope): refactor code
test(scope): add tests
chore(scope): update dependencies
```

## Resources

- [Style Guide](../AGENTS.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Architecture Documentation](../docs/architecture.md)
- [Testing Guide](../docs/testing-guide.md)

## Questions?

When uncertain:
1. Check existing code for patterns
2. Refer to style guide in AGENTS.md
3. Follow functional programming principles
4. Keep it simple and concise

---

Remember: Good code is simple, readable, and maintainable. When in doubt, prefer simplicity over cleverness.
