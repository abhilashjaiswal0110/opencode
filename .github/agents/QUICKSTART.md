# Quick Start Guide

Get started with OpenCode agents in 5 minutes.

## Installation

### 1. Ensure You Have Bun Installed

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# GitHub Copilot Token (required for AI features)
GITHUB_COPILOT_TOKEN=your_token_here

# Optional: Additional agent configuration
# See the documentation for currently supported environment variables
```

### 3. Initialize the Agent System

```bash
bun run .github/agents/init.ts
```

Expected output:
```
🚀 Initializing OpenCode Agent System...
📁 Setting up directories...
💾 Initializing memory store...
   ✓ Memory store initialized
📋 Loading agent registry...
   ✓ Loaded 6 agents:
     - security-architect: Specialized security agent...
     - code-reviewer: Comprehensive code review agent...
     - documentation-agent: Generate and maintain...
     - testing-agent: Intelligent test generation...
     - performance-agent: Analyze and optimize...
     - devops-agent: CI/CD automation...
🤖 Initializing GitHub Copilot integration...
   ✓ GitHub Copilot integration ready
🧹 Cleaning up expired memory...
   ✓ Cleaned up 0 expired entries

✅ Agent system initialized successfully!
```

## Your First Agent Usage

### Example 1: Security Scan

Open OpenCode and run a security scan:

```bash
opencode
```

Then in the OpenCode interface:

```
@security-architect scan src/ for security vulnerabilities
```

The agent will:
1. Scan your code for common vulnerabilities
2. Check for OWASP Top 10 issues
3. Identify hardcoded secrets
4. Provide detailed remediation steps

### Example 2: Code Review

Request a code review:

```
@code-reviewer review src/api/users.ts
```

The agent will:
1. Analyze code quality
2. Check performance issues
3. Verify security practices
4. Suggest improvements with examples

### Example 3: Generate Documentation

Generate API documentation:

```
@documentation-agent generate API docs for src/api/
```

The agent will:
1. Analyze your API endpoints
2. Generate comprehensive documentation
3. Include code examples
4. Format in Markdown

## Configuration

### Basic Configuration

Edit `.github/agents/config.json`:

```json
{
  "enabled": true,
  "agents": {
    "security-architect": {
      "enabled": true,
      "priority": "high"
    },
    "code-reviewer": {
      "enabled": true,
      "auto_review": true
    }
  }
}
```

### Agent-Specific Settings

Customize individual agents in `.opencode/config.json`:

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

## Available Agents

### 🔒 Security Architect
**Use case**: Security audits, vulnerability scanning

```bash
@security-architect scan src/auth/
@security-architect check for SQL injection
@security-architect find hardcoded secrets
```

### 👀 Code Reviewer
**Use case**: Code quality reviews, best practices

```bash
@code-reviewer review recent changes
@code-reviewer check src/services/user.ts
@code-reviewer review PR #42
```

### 📚 Documentation Agent
**Use case**: Documentation generation

```bash
@documentation-agent generate README
@documentation-agent update API docs
@documentation-agent create user guide
```

### 🧪 Testing Agent
**Use case**: Test generation, coverage improvement

```bash
@testing-agent generate tests for src/utils/
@testing-agent improve coverage
@testing-agent add edge case tests
```

### ⚡ Performance Agent
**Use case**: Performance analysis, optimization

```bash
@performance-agent analyze src/api/
@performance-agent optimize database queries
@performance-agent check bundle size
```

### 🚀 DevOps Agent
**Use case**: CI/CD, deployment automation

```bash
@devops-agent optimize CI pipeline
@devops-agent create deployment script
@devops-agent setup monitoring
```

## Common Workflows

### Pre-Commit Workflow

```bash
# 1. Security scan
@security-architect quick scan

# 2. Code review
@code-reviewer check changed files

# 3. Test coverage
@testing-agent verify coverage > 80%
```

### Feature Development Workflow

```bash
# 1. Implement feature
# (write your code)

# 2. Generate tests
@testing-agent generate tests for new feature

# 3. Review code
@code-reviewer review implementation

# 4. Update docs
@documentation-agent update documentation

# 5. Performance check
@performance-agent analyze performance impact
```

### Security Audit Workflow

```bash
# 1. Full security scan
@security-architect comprehensive security audit

# 2. Fix identified issues
# (apply suggested fixes)

# 3. Verify fixes
@security-architect verify security fixes

# 4. Update security docs
@documentation-agent update security section
```

## Tips for Best Results

### 1. Be Specific

❌ Bad:
```
@security-architect check security
```

✅ Good:
```
@security-architect scan src/auth/ for authentication vulnerabilities and session management issues
```

### 2. Provide Context

Include relevant information:
```
@code-reviewer review payment processing in src/services/payment.ts, 
focusing on error handling and transaction safety
```

### 3. Use Follow-ups

Agents remember context:
```
@performance-agent analyze src/api/products.ts

# Later...
@performance-agent implement the caching strategy you suggested
```

### 4. Chain Agents

Combine multiple agents:
```
@security-architect scan for vulnerabilities
@code-reviewer verify the security fixes
@testing-agent add tests for security fixes
```

## Troubleshooting

### Agent Not Responding

**Issue**: Agent doesn't respond to commands

**Solution**:
```bash
# Check agent status
bun run .github/agents/init.ts

# Verify agent is enabled
cat .github/agents/config.json

# Check logs
cat .opencode/agents/logs/*.log
```

### GitHub Copilot Token Issues

**Issue**: "GitHub Copilot integration disabled"

**Solution**:
```bash
# Set token
export GITHUB_COPILOT_TOKEN=your_token_here

# Or add to .env
echo "GITHUB_COPILOT_TOKEN=your_token_here" >> .env

# Reinitialize
bun run .github/agents/init.ts
```

### Memory Issues

**Issue**: Agent responses are slow or inconsistent

**Solution**:
```bash
# Clear memory
rm -rf .opencode/agents/memory/*

# Reinitialize
bun run .github/agents/init.ts
```

## Next Steps

1. **Read the full usage guide**: [USAGE.md](./USAGE.md)
2. **Create custom agents**: [CUSTOM_AGENTS.md](./CUSTOM_AGENTS.md)
3. **Explore examples**: Try the workflows above
4. **Join the community**: [Discord](https://opencode.ai/discord)

## Getting Help

- **Documentation**: [docs/README.md](../../docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/abhilashjaiswal0110/opencode/issues)
- **Discord**: [OpenCode Discord](https://opencode.ai/discord)
- **Email**: support@opencode.ai

## Resources

- [Agent Architecture](./README.md)
- [Usage Guide](./USAGE.md)
- [Custom Agents](./CUSTOM_AGENTS.md)
- [OpenCode Docs](../../docs/README.md)
- [GitHub Copilot Guide](../../docs/github-copilot-guide.md)

---

**Ready to start?** Run `bun run .github/agents/init.ts` and begin using agents! 🚀
