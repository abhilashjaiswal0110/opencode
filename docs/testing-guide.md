# Testing Guide

This guide covers testing strategies, procedures, and examples for the OpenCode repository.

## Overview

OpenCode uses a combination of testing approaches to ensure code quality:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user workflows
- **Manual Testing**: Validate UI and user experience

## Test Framework

OpenCode uses **Bun's built-in test runner** for its speed and simplicity.

## Running Tests

### Run All Tests

```bash
# From root directory
bun test

# Note: Root package.json prevents accidental test runs
# Run tests from specific packages instead
```

### Run Tests for Specific Packages

```bash
# Run tests in opencode package
cd packages/opencode
bun test

# Run tests in SDK
cd packages/sdk/js
bun test

# Run tests in console
cd packages/console
bun test
```

### Run Specific Test Files

```bash
bun test src/server/server.test.ts
```

### Run Tests in Watch Mode

```bash
bun test --watch
```

### Run Tests with Coverage

```bash
bun test --coverage
```

## Writing Tests

### Test File Structure

Place test files alongside source files with `.test.ts` extension:

```
src/
├── server/
│   ├── server.ts
│   └── server.test.ts
├── agents/
│   ├── agent.ts
│   └── agent.test.ts
```

### Basic Test Example

```typescript
import { describe, it, expect } from "bun:test"
import { myFunction } from "./myFunction"

describe("myFunction", () => {
  it("should return expected value", () => {
    const result = myFunction("input")
    expect(result).toBe("expected output")
  })

  it("should handle edge cases", () => {
    expect(myFunction("")).toBe("")
    expect(myFunction(null)).toBeNull()
  })
})
```

### Testing Async Functions

```typescript
import { describe, it, expect } from "bun:test"
import { fetchData } from "./api"

describe("fetchData", () => {
  it("should fetch data successfully", async () => {
    const data = await fetchData("endpoint")
    expect(data).toBeDefined()
    expect(data.status).toBe("success")
  })

  it("should handle errors", async () => {
    await expect(fetchData("invalid")).rejects.toThrow()
  })
})
```

### Testing with Mocks (Use Sparingly)

Follow the project guideline: **avoid mocks when possible**.

```typescript
import { describe, it, expect, mock } from "bun:test"

describe("apiCall", () => {
  it("should call fetch with correct parameters", async () => {
    // Only mock when absolutely necessary
    const mockFetch = mock(() => Promise.resolve({ ok: true }))
    
    // Test actual implementation as much as possible
    const result = await apiCall("endpoint")
    expect(mockFetch).toHaveBeenCalledWith("endpoint")
  })
})
```

### Testing SolidJS Components

```typescript
import { describe, it, expect } from "bun:test"
import { render } from "@solidjs/testing-library"
import { MyComponent } from "./MyComponent"

describe("MyComponent", () => {
  it("should render correctly", () => {
    const { getByText } = render(() => <MyComponent name="Test" />)
    expect(getByText("Test")).toBeInTheDocument()
  })

  it("should handle user interactions", async () => {
    const { getByRole, findByText } = render(() => <MyComponent />)
    const button = getByRole("button")
    
    button.click()
    expect(await findByText("Clicked")).toBeInTheDocument()
  })
})
```

### Testing Database Operations (Drizzle ORM)

```typescript
import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { db } from "./db"
import { users } from "./schema"

describe("User Database Operations", () => {
  beforeEach(async () => {
    // Set up test database
    await db.delete(users)
  })

  afterEach(async () => {
    // Clean up
    await db.delete(users)
  })

  it("should create a user", async () => {
    const user = await db.insert(users).values({
      id: "test-id",
      name: "Test User",
      email: "test@example.com"
    }).returning()

    expect(user).toHaveLength(1)
    expect(user[0].name).toBe("Test User")
  })

  it("should query users", async () => {
    // Insert test data
    await db.insert(users).values([
      { id: "1", name: "User 1", email: "user1@example.com" },
      { id: "2", name: "User 2", email: "user2@example.com" }
    ])

    const allUsers = await db.select().from(users)
    expect(allUsers).toHaveLength(2)
  })
})
```

## Testing Best Practices

### 1. Test Actual Implementation

Don't duplicate logic in tests:

```typescript
// ❌ Bad: Duplicates implementation logic
it("should calculate total", () => {
  const items = [1, 2, 3]
  const total = items.reduce((sum, item) => sum + item, 0)
  expect(calculateTotal(items)).toBe(total)
})

// ✅ Good: Tests expected behavior
it("should calculate total", () => {
  expect(calculateTotal([1, 2, 3])).toBe(6)
  expect(calculateTotal([])).toBe(0)
  expect(calculateTotal([10])).toBe(10)
})
```

### 2. Test Edge Cases

```typescript
describe("parseInput", () => {
  it("should handle valid input", () => {
    expect(parseInput("valid")).toBe("VALID")
  })

  it("should handle empty input", () => {
    expect(parseInput("")).toBe("")
  })

  it("should handle null/undefined", () => {
    expect(parseInput(null)).toBeNull()
    expect(parseInput(undefined)).toBeUndefined()
  })

  it("should handle special characters", () => {
    expect(parseInput("test@#$")).toBe("TEST@#$")
  })
})
```

### 3. Keep Tests Focused

One assertion per test when possible:

```typescript
// ❌ Bad: Multiple unrelated assertions
it("should work correctly", () => {
  expect(fn1()).toBe(true)
  expect(fn2()).toBe("result")
  expect(fn3()).toBeGreaterThan(0)
})

// ✅ Good: Separate focused tests
it("should return true", () => {
  expect(fn1()).toBe(true)
})

it("should return result string", () => {
  expect(fn2()).toBe("result")
})

it("should return positive number", () => {
  expect(fn3()).toBeGreaterThan(0)
})
```

### 4. Use Descriptive Test Names

```typescript
// ❌ Bad: Vague test name
it("works", () => { ... })

// ✅ Good: Descriptive test name
it("should return user data when given valid ID", () => { ... })
```

### 5. Arrange-Act-Assert Pattern

```typescript
it("should update user profile", async () => {
  // Arrange: Set up test data
  const userId = "test-123"
  const updates = { name: "New Name" }

  // Act: Perform the operation
  const result = await updateUserProfile(userId, updates)

  // Assert: Verify the outcome
  expect(result.name).toBe("New Name")
})
```

## Integration Testing

### Testing API Endpoints

```typescript
import { describe, it, expect } from "bun:test"
import { app } from "./server"

describe("API Endpoints", () => {
  it("GET /api/status should return 200", async () => {
    const response = await app.request("/api/status")
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe("ok")
  })

  it("POST /api/users should create user", async () => {
    const response = await app.request("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User" })
    })

    expect(response.status).toBe(201)
  })
})
```

### Testing with Real Dependencies

```typescript
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { startServer, stopServer } from "./server"

describe("Server Integration", () => {
  beforeAll(async () => {
    await startServer({ port: 4096 })
  })

  afterAll(async () => {
    await stopServer()
  })

  it("should handle multiple requests", async () => {
    const requests = Array.from({ length: 10 }, (_, i) =>
      fetch(`http://localhost:4096/api/test?id=${i}`)
    )

    const responses = await Promise.all(requests)
    
    responses.forEach(response => {
      expect(response.ok).toBe(true)
    })
  })
})
```

## Manual Testing Scenarios

### 1. TUI Testing

```bash
# Start OpenCode in TUI mode
bun dev .

# Test scenarios:
# - Create a new file
# - Edit existing file
# - Switch between agents (Tab key)
# - Run bash commands
# - Test autocomplete
# - Test error handling
```

### 2. Web Interface Testing

```bash
# Terminal 1: Start server
bun dev serve

# Terminal 2: Start web app
bun run --cwd packages/app dev

# Test scenarios:
# - Navigate through UI
# - Create new session
# - Upload files
# - Test responsive design
# - Test dark/light mode
```

### 3. Desktop App Testing

```bash
# Start desktop app
bun run --cwd packages/desktop tauri dev

# Test scenarios:
# - Window management
# - File system access
# - Native notifications
# - System tray integration
```

## Test Data and Fixtures

Create reusable test data:

```typescript
// test/fixtures/users.ts
export const testUsers = {
  admin: {
    id: "admin-1",
    name: "Admin User",
    role: "admin"
  },
  regular: {
    id: "user-1",
    name: "Regular User",
    role: "user"
  }
}

// In tests
import { testUsers } from "../fixtures/users"

it("should authorize admin", () => {
  expect(authorize(testUsers.admin)).toBe(true)
})
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main/dev branches
- Release builds

See `.github/workflows/test.yml` for CI configuration.

## Performance Testing

### Benchmarking

```typescript
import { bench, describe } from "bun:test"

describe("Performance", () => {
  bench("array map", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    arr.map(x => x * 2)
  })

  bench("for loop", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    const result = []
    for (let i = 0; i < arr.length; i++) {
      result.push(arr[i] * 2)
    }
  })
})
```

## Debugging Tests

### Using console.log

```typescript
it("should debug", () => {
  const data = processData(input)
  console.log("Processed data:", data)
  expect(data).toBeDefined()
})
```

### Using Bun Debugger

```bash
bun --inspect-brk test src/myfile.test.ts
```

Then attach your debugger to `ws://localhost:6499`.

## Common Testing Patterns

### Testing Error Handling

```typescript
it("should throw error for invalid input", () => {
  expect(() => {
    validateInput("invalid")
  }).toThrow("Invalid input")
})

it("should return error for async function", async () => {
  await expect(asyncFunction()).rejects.toThrow()
})
```

### Testing with Timers

```typescript
import { describe, it, expect, jest } from "bun:test"

it("should call callback after delay", async () => {
  jest.useFakeTimers()
  
  const callback = jest.fn()
  delayedFunction(callback, 1000)
  
  jest.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()
  
  jest.useRealTimers()
})
```

## Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Testing Library](https://testing-library.com/)
- [OpenCode Contributing Guide](../CONTRIBUTING.md)

## Next Steps

- Explore [Use Cases and Examples](./use-cases.md)
- Review [Local Setup Guide](./local-setup.md)
- Check [GitHub Copilot Guide](./github-copilot-guide.md)
