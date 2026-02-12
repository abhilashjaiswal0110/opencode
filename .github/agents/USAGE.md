# Agent Usage Guide

This guide shows you how to use the OpenCode agents in various scenarios.

## Prerequisites

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Set Environment Variables**
   ```bash
   export GITHUB_COPILOT_TOKEN=your_token_here
   ```

3. **Initialize Agent System**
   ```bash
   bun run .github/agents/init.ts
   ```

## Basic Usage

### Using Agents in OpenCode

Agents can be invoked using the `@agent-name` syntax in your OpenCode sessions:

```bash
# Open OpenCode
opencode

# Use an agent
@security-architect scan src/ for vulnerabilities

@code-reviewer review src/utils/helper.ts

@documentation-agent generate API docs for src/api/

@testing-agent create tests for src/services/user.ts

@performance-agent analyze database queries in src/db/

@devops-agent optimize CI/CD pipeline
```

### Agent Modes

Agents operate in different modes:

- **Subagent**: Called explicitly with `@agent-name`
- **Primary**: Can be switched to as main agent (like build/plan)
- **All**: Available in all modes

## Common Use Cases

### 1. Security Review

**Scenario**: Review code for security vulnerabilities

```bash
opencode

# Scan specific directory
@security-architect scan src/auth/ for authentication issues

# Check for secrets
@security-architect find hardcoded credentials in src/

# OWASP compliance check
@security-architect check OWASP Top 10 compliance
```

**Expected Output**:
```
VULNERABILITY: Hardcoded API Key
SEVERITY: Critical
LOCATION: src/config/api.ts:15

DESCRIPTION:
API key is hardcoded in the source code, exposing it to anyone 
with access to the repository.

REMEDIATION:
Move API key to environment variable:
- Add to .env.example
- Load via process.env.API_KEY
- Update documentation

CODE EXAMPLE:
// Before
const apiKey = "sk-1234567890"

// After  
const apiKey = process.env.API_KEY
```

### 2. Code Review

**Scenario**: Get comprehensive code review

```bash
# Review changed files
@code-reviewer review recent changes

# Review specific file
@code-reviewer review src/services/payment.ts

# Review PR
@code-reviewer review PR #123
```

**Expected Output**:
```
Code Review Summary for payment.ts
Overall Score: 7/10

✅ Strengths:
- Good error handling
- Clear function names
- Proper type safety

⚠️ Issues Found:

[CRITICAL] [SECURITY]: SQL Injection Risk
FILE: src/services/payment.ts:42

ISSUE: Query uses string concatenation with user input
SUGGESTION: Use parameterized queries
EXAMPLE: db.query('SELECT * FROM payments WHERE id = ?', [id])

[MAJOR] [PERFORMANCE]: N+1 Query Problem
FILE: src/services/payment.ts:67

ISSUE: Loop makes individual database queries
SUGGESTION: Use batch query or JOIN
```

### 3. Documentation Generation

**Scenario**: Generate or update documentation

```bash
# Generate API docs
@documentation-agent generate API documentation for src/api/

# Create README
@documentation-agent create README for packages/plugin/

# Update changelog
@documentation-agent update CHANGELOG.md with recent changes
```

**Expected Output**:
```markdown
# API Documentation

## Authentication

### POST /api/auth/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123",
    "email": "user@example.com"
  }
}
```

**Errors:**
- 400: Invalid credentials
- 429: Too many attempts
```

### 4. Test Generation

**Scenario**: Generate tests for untested code

```bash
# Generate unit tests
@testing-agent generate tests for src/utils/string.ts

# Improve test coverage
@testing-agent improve coverage for src/services/

# Generate edge case tests
@testing-agent add edge case tests for src/validators/email.ts
```

**Expected Output**:
```typescript
import { describe, it, expect } from "bun:test"
import { validateEmail } from "./email"

describe("validateEmail", () => {
  describe("valid emails", () => {
    it("should accept standard email format", () => {
      expect(validateEmail("user@example.com")).toBe(true)
    })
    
    it("should accept email with plus sign", () => {
      expect(validateEmail("user+tag@example.com")).toBe(true)
    })
    
    it("should accept subdomain", () => {
      expect(validateEmail("user@mail.example.com")).toBe(true)
    })
  })
  
  describe("invalid emails", () => {
    it("should reject missing @", () => {
      expect(validateEmail("userexample.com")).toBe(false)
    })
    
    it("should reject missing domain", () => {
      expect(validateEmail("user@")).toBe(false)
    })
    
    it("should reject empty string", () => {
      expect(validateEmail("")).toBe(false)
    })
  })
  
  describe("edge cases", () => {
    it("should handle null", () => {
      expect(() => validateEmail(null)).toThrow()
    })
    
    it("should handle very long emails", () => {
      const longEmail = "a".repeat(300) + "@example.com"
      expect(validateEmail(longEmail)).toBe(false)
    })
  })
})
```

### 5. Performance Analysis

**Scenario**: Identify and fix performance issues

```bash
# Analyze API performance
@performance-agent analyze response times in src/api/

# Check database queries
@performance-agent optimize database queries in src/db/

# Analyze bundle size
@performance-agent analyze bundle size and suggest optimizations
```

**Expected Output**:
```
Performance Analysis Report

🔴 Critical Issues:
1. N+1 Query in User Service (src/services/user.ts:45)
   Impact: 100+ DB queries for 100 users
   Fix: Use JOIN or batch query
   Estimated improvement: 95% faster

2. Large Bundle Size (packages/app/dist/main.js)
   Current: 2.5MB
   Issue: Unused dependencies included
   Fix: Tree shaking, code splitting
   Target: < 500KB

⚠️ Performance Warnings:
1. Inefficient Array Operation (src/utils/data.ts:23)
   Current: O(n²) nested loop
   Fix: Use Map for O(n) lookup
   
2. Missing Cache (src/api/products.ts:67)
   Frequent identical queries
   Fix: Add Redis cache with 5min TTL
```

### 6. DevOps Automation

**Scenario**: Optimize CI/CD and deployment

```bash
# Optimize CI pipeline
@devops-agent optimize GitHub Actions workflow

# Setup monitoring
@devops-agent add monitoring and alerting

# Create deployment script
@devops-agent create deployment automation for production
```

**Expected Output**:
```yaml
name: Optimized CI/CD
on:
  push:
    branches: [main, dev]
  pull_request:

jobs:
  cache-dependencies:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v3
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
          
  test:
    needs: cache-dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun test --coverage
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
      - name: Deploy
        run: |
          ./scripts/deploy.sh
          ./scripts/health-check.sh
```

## Advanced Usage

### Agent Chaining

Combine multiple agents for complex workflows:

```bash
# Security review → Code review → Documentation
@security-architect scan src/auth/
@code-reviewer review src/auth/ after security fixes
@documentation-agent update security docs
```

### Context-Aware Queries

Agents remember context from previous interactions:

```bash
# First query
@performance-agent analyze src/api/users.ts

# Follow-up (agent remembers previous analysis)
@performance-agent show optimization for the N+1 query you found

# Another follow-up
@performance-agent implement the caching strategy you suggested
```

### Custom Workflows

Create custom workflows in `.opencode/config.json`:

```json
{
  "workflows": {
    "security-review": [
      "@security-architect scan for vulnerabilities",
      "@code-reviewer check security best practices",
      "@documentation-agent update security section"
    ],
    "pre-commit": [
      "@testing-agent ensure test coverage > 80%",
      "@code-reviewer check code quality",
      "@security-architect quick security scan"
    ]
  }
}
```

## Configuration

### Agent Configuration

Customize agents in `.opencode/config.json`:

```json
{
  "agent": {
    "security-architect": {
      "model": "github-copilot/gpt-4",
      "temperature": 0.3,
      "options": {
        "severity_threshold": "high",
        "auto_fix": false
      }
    },
    "code-reviewer": {
      "model": "github-copilot/gpt-4",
      "options": {
        "strictness": "high",
        "auto_approve_minor": false
      }
    }
  }
}
```

### Memory Configuration

Control memory persistence:

```json
{
  "memory": {
    "enabled": true,
    "ttl": 604800,
    "max_size": "100MB",
    "cleanup_interval": 3600
  }
}
```

## Tips and Best Practices

### 1. Be Specific
```bash
# ❌ Vague
@security-architect check security

# ✅ Specific
@security-architect scan src/auth/ for SQL injection and XSS vulnerabilities
```

### 2. Provide Context
```bash
# ❌ No context
@code-reviewer review this

# ✅ With context
@code-reviewer review authentication flow in src/auth/, focusing on session management and token validation
```

### 3. Iterative Refinement
```bash
# Start broad
@performance-agent analyze src/api/

# Get specific
@performance-agent optimize the database queries you identified

# Implement
@performance-agent show me the optimized version of getUserWithOrders
```

### 4. Combine Agents
```bash
# Security + Performance
@security-architect check src/api/ for vulnerabilities
@performance-agent ensure security fixes don't impact performance
```

## Troubleshooting

### Agent Not Responding

1. Check agent is enabled:
   ```bash
   cat .github/agents/config.json
   ```

2. Verify agent directory:
   ```bash
   ls .github/agents/security-architect/
   ```

3. Check logs:
   ```bash
   cat .opencode/agents/logs/security-architect.log
   ```

### Memory Issues

Clear agent memory:
```bash
rm -rf .opencode/agents/memory/*.db
bun run .github/agents/init.ts
```

### Rate Limiting

If hitting GitHub Copilot rate limits:
```bash
# Check your current Copilot usage and limits in:
#   - GitHub Settings → Copilot
#   - Your organization's billing/usage dashboard
#
# Then either wait for the rate limit to reset
# or adjust rate limits in .github/agents/config.json
```

## Resources

- [Agent Architecture](./README.md)
- [Custom Agent Development](./CUSTOM_AGENTS.md)
- [Agent Configuration](./config.json)
- [GitHub Copilot Integration](./copilot-integration.ts)
- [OpenCode Documentation](../../docs/README.md)

## Support

For issues or questions:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Open an issue with `agent` label
- Join [Discord community](https://opencode.ai/discord)
