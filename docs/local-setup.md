# Local Development Setup Guide

This guide will help you set up the OpenCode repository for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun 1.3+**: Package manager and runtime ([Installation Guide](https://bun.sh/docs/installation))
- **Node.js 22+**: JavaScript runtime (for compatibility)
- **Git**: Version control system
- **Text Editor/IDE**: VS Code recommended with GitHub Copilot

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/abhilashjaiswal0110/opencode.git
cd opencode
```

### 2. Install Dependencies

```bash
bun install
```

This command will:
- Install all workspace dependencies
- Set up git hooks via Husky
- Configure the development environment

### 3. Start Development Server

```bash
bun dev
```

This starts OpenCode in the `packages/opencode` directory.

### 4. Run Against a Different Directory

```bash
# Run against any directory
bun dev /path/to/your/project

# Run in the root of opencode repo itself
bun dev .
```

## Environment Configuration

### Create Environment Files

Copy the example environment files and configure them:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# API Keys (use placeholders if not available yet)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: OpenCode Zen API
OPENCODE_ZEN_API_KEY=your_zen_api_key_here

# Optional: Azure OpenAI
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Optional: Google AI
GOOGLE_API_KEY=your_google_api_key_here

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
```

## Project Structure

```
opencode/
├── .github/              # GitHub workflows and templates
├── .vscode/              # VS Code configuration
├── docs/                 # Documentation (you are here)
├── packages/
│   ├── opencode/        # Core OpenCode business logic & server
│   ├── app/             # Shared web UI components (SolidJS)
│   ├── desktop/         # Desktop app (Tauri)
│   ├── console/         # Console components
│   ├── plugin/          # @opencode-ai/plugin source
│   ├── sdk/             # SDK packages
│   ├── docs/            # Documentation site
│   └── ...              # Other packages
├── script/              # Build and utility scripts
├── package.json         # Root package configuration
└── turbo.json          # Turborepo configuration
```

## Development Workflows

### Running Specific Packages

```bash
# Run the web app
bun run --cwd packages/app dev

# Run the desktop app
bun run --cwd packages/desktop tauri dev

# Run the API server
bun dev serve

# Run the web interface
bun dev web
```

### Type Checking

```bash
bun run typecheck
```

### Code Formatting

The project uses Prettier for code formatting:

```bash
# Format all files
bun run format

# Check formatting
bun run format:check
```

### Building for Production

```bash
# Build a standalone executable
./packages/opencode/script/build.ts --single

# Run the built executable
./packages/opencode/dist/opencode-<platform>/bin/opencode
```

Replace `<platform>` with your platform (e.g., `darwin-arm64`, `linux-x64`, `windows-x64`).

## Debugging

### VS Code Debugging Setup

1. Copy example configurations:
   ```bash
   cp .vscode/settings.example.json .vscode/settings.json
   cp .vscode/launch.example.json .vscode/launch.json
   ```

2. Set up Bun inspector:
   ```bash
   # Add to your shell profile
   export BUN_OPTIONS=--inspect=ws://localhost:6499/
   ```

3. Start with inspector:
   ```bash
   bun run --inspect=ws://localhost:6499/ dev
   ```

4. Attach debugger from VS Code (F5)

### Debugging Server Separately

```bash
# Terminal 1: Start server with debugger
bun run --inspect=ws://localhost:6499/ --cwd packages/opencode ./src/index.ts serve --port 4096

# Terminal 2: Attach TUI
opencode attach http://localhost:4096
```

## Troubleshooting

### Dependency Issues

If you encounter dependency errors:

```bash
# Clean install
rm -rf node_modules bun.lock
bun install
```

### Build Errors

```bash
# Clean build artifacts
bun run clean
bun install
```

### Port Already in Use

If port 4096 is already in use:

```bash
# Use a different port
bun dev serve --port 8080
```

### Git Hooks Not Working

```bash
# Reinstall Husky hooks
bun run prepare
```

## Getting Help

- **Documentation**: [https://opencode.ai/docs](https://opencode.ai/docs)
- **Discord**: [https://opencode.ai/discord](https://opencode.ai/discord)
- **Issues**: [GitHub Issues](https://github.com/abhilashjaiswal0110/opencode/issues)

## Next Steps

- Read the [GitHub Copilot Integration Guide](./github-copilot-guide.md)
- Review [Testing Guide](./testing-guide.md)
- Explore [Use Cases and Examples](./use-cases.md)
- Check [Contributing Guidelines](../CONTRIBUTING.md)
