# OpenCode Enterprise Agents

This directory contains specialized AI agents for the OpenCode repository, built with best practices for enterprise environments and integrated with GitHub Copilot.

## Available Agents

### 1. Security Architect Agent
**Purpose**: Security analysis, vulnerability scanning, and compliance checks

**Capabilities**:
- Automated security vulnerability detection
- OWASP Top 10 compliance checking
- Dependency security audits
- Secret scanning and detection
- Security best practices enforcement

**Usage**: `@security-architect <query>`

### 2. Code Review Agent
**Purpose**: Comprehensive code reviews with quality metrics

**Capabilities**:
- Automated PR reviews
- Code quality analysis
- Best practices validation
- Performance issue detection
- Test coverage analysis

**Usage**: `@code-reviewer <file or PR>`

### 3. Documentation Agent
**Purpose**: Generate and maintain comprehensive documentation

**Capabilities**:
- Auto-generate API documentation
- Create user guides and tutorials
- Maintain consistency across docs
- Generate code examples
- Update changelogs

**Usage**: `@documentation <component>`

### 4. Testing Agent
**Purpose**: Intelligent test generation and coverage improvement

**Capabilities**:
- Generate unit tests
- Create integration tests
- E2E test scenarios
- Test coverage analysis
- Test quality improvement

**Usage**: `@testing <file or module>`

### 5. Performance Optimization Agent
**Purpose**: Analyze and optimize application performance

**Capabilities**:
- Performance profiling
- Database query optimization
- Memory leak detection
- Bundle size optimization
- Caching strategy recommendations

**Usage**: `@performance <area>`

### 6. DevOps Agent
**Purpose**: CI/CD automation and infrastructure management

**Capabilities**:
- CI/CD pipeline optimization
- Deployment automation
- Infrastructure as code
- Monitoring and alerting
- Container orchestration

**Usage**: `@devops-agent <task>`

## Architecture

### Context Engineering
Each agent maintains context through:
- Session memory (short-term)
- Persistent memory (long-term)
- Knowledge base (domain-specific)
- Cross-agent communication

### Memory Persistence
Agents use SQLite for persistent memory:
```
.opencode/
  agents/
    memory/
      agents.db
```

### GitHub Copilot Integration
Agents leverage GitHub Copilot credits through:
- Copilot API integration
- Intelligent prompt engineering
- Context-aware suggestions
- Rate limiting and optimization

## Configuration

### Agent Configuration File
`.opencode/agents-config.json`:
```json
{
  "agents": {
    "security-architect": {
      "enabled": true,
      "model": "github-copilot",
      "context_window": 128000,
      "memory_enabled": true
    }
  }
}
```

### Environment Variables
```bash
GITHUB_COPILOT_TOKEN=<token>
```

### Runtime Configuration
Agent configuration is managed in:
- `.github/agents/config.json` - Agent system configuration
- `.opencode/config.json` - Runtime configuration (auto-created)

## Best Practices

1. **Minimal Changes**: Agents make surgical, focused modifications
2. **Security First**: All changes are security-scanned
3. **Test Coverage**: Agents ensure tests accompany code changes
4. **Documentation**: Changes include documentation updates
5. **Review Process**: Agent outputs undergo code review

## Usage Examples

### Security Review
```bash
opencode agent security-architect review src/auth/
```

### Generate Tests
```bash
opencode agent testing generate src/utils/string-helpers.ts
```

### Performance Analysis
```bash
opencode agent performance analyze src/api/
```

## Development

### Creating Custom Agents
See [CUSTOM_AGENTS.md](./CUSTOM_AGENTS.md) for guide on creating custom agents.

### Testing Agents
```bash
bun test .github/agents/tests/
```

## Resources

- [Agent Architecture](../../docs/architecture.md)
- [GitHub Copilot Guide](../../docs/github-copilot-guide.md)
- [Security Guidelines](../../SECURITY.md)
- [Contributing Guide](../../CONTRIBUTING.md)
