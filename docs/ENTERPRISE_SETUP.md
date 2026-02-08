# Enterprise Setup and Configuration

This document provides additional setup instructions for enterprise environments and production deployments.

## For Enterprise Teams

### Repository Organization

This repository follows enterprise-grade practices:

1. **Documentation**: Comprehensive docs in `/docs` directory
2. **Code of Conduct**: See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
3. **Contributing Guidelines**: See [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Commit Guidelines**: See [COMMIT_GUIDELINES.md](COMMIT_GUIDELINES.md)
5. **Security Policy**: See [SECURITY.md](SECURITY.md)
6. **Changelog**: See [CHANGELOG.md](CHANGELOG.md)

### Quick Links

- 📚 [Local Development Setup](./docs/local-setup.md)
- 🤖 [GitHub Copilot Integration](./docs/github-copilot-guide.md)
- 🧪 [Testing Guide](./docs/testing-guide.md)
- 📋 [Use Cases & Prompts](./docs/use-cases.md)
- 🏗️ [Architecture Documentation](./docs/architecture.md)

### Setting Up for Local Development

1. **Prerequisites**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Verify installation
   bun --version
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/abhilashjaiswal0110/opencode.git
   cd opencode
   bun install
   ```

3. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit .env.local with your API keys
   # At minimum, add one AI provider key:
   # - OPENAI_API_KEY
   # - ANTHROPIC_API_KEY
   # - or OPENCODE_ZEN_API_KEY
   ```

4. **Start Development**
   ```bash
   # Start the development server
   bun dev
   
   # Or run against a specific directory
   bun dev /path/to/your/project
   ```

### GitHub Copilot Integration

This repository is optimized for GitHub Copilot:

1. **Install Copilot**: Install GitHub Copilot extension in VS Code
2. **Review Instructions**: See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md)
3. **Read the Guide**: Comprehensive guide at [`docs/github-copilot-guide.md`](./docs/github-copilot-guide.md)

### Testing

```bash
# Run tests for specific packages
cd packages/opencode
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

See [Testing Guide](./docs/testing-guide.md) for detailed testing procedures.

### Deployment Options

#### Local Deployment

```bash
# Build standalone executable
./packages/opencode/script/build.ts --single

# Run built version
./packages/opencode/dist/opencode-<platform>/bin/opencode
```

#### Docker Deployment

```dockerfile
# Example Dockerfile
FROM oven/bun:1.3

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

EXPOSE 4096
CMD ["bun", "run", "start"]
```

#### Cloud Deployment

See deployment guides for:
- [AWS](./docs/deployment/aws.md)
- [Azure](./docs/deployment/azure.md)
- [Google Cloud](./docs/deployment/gcp.md)
- [Kubernetes](./docs/deployment/kubernetes.md)

### Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Files**: Use `.env.local` for local development
3. **Secrets Management**: Use proper secrets management in production
4. **Access Control**: Configure appropriate CORS settings
5. **Rate Limiting**: Enable rate limiting for production

See [SECURITY.md](./SECURITY.md) for security policies.

### CI/CD Integration

This repository includes GitHub Actions workflows:

- **Tests**: Automated testing on PRs
- **Linting**: Code style checks
- **Type Checking**: TypeScript validation
- **Publishing**: Automated releases
- **Security Scanning**: Dependency audits

### Enterprise Support

For enterprise support, custom deployments, or training:

- Email: enterprise@opencode.ai
- Website: https://opencode.ai/enterprise
- Discord: https://opencode.ai/discord

### Monitoring and Observability

Configure monitoring for production:

```bash
# Application Insights (Azure)
APPLICATIONINSIGHTS_CONNECTION_STRING=your_connection_string

# Sentry (Error tracking)
SENTRY_DSN=your_sentry_dsn

# PostHog (Analytics)
POSTHOG_API_KEY=your_posthog_key
```

### Best Practices

1. **Code Reviews**: All changes require review before merge
2. **Testing**: Maintain test coverage above 70%
3. **Documentation**: Update docs with code changes
4. **Commits**: Follow conventional commit format
5. **Security**: Regular dependency updates and security audits

### License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

### Contributing

We welcome contributions! Please read:

1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
2. [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
3. [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) - Commit message format

### Resources

- 📖 [Documentation](https://opencode.ai/docs)
- 💬 [Discord Community](https://opencode.ai/discord)
- 🐦 [X.com](https://x.com/opencode)
- 🐙 [GitHub](https://github.com/abhilashjaiswal0110/opencode)
- 🎓 [Tutorials](https://opencode.ai/tutorials)

---

**Built with ❤️ by the OpenCode community**
