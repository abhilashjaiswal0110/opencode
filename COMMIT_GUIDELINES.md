# Commit Guidelines

This document provides guidelines for writing clear, consistent, and meaningful commit messages in the OpenCode project.

## Why Good Commit Messages Matter

- **Maintainability**: Easy to understand what changed and why
- **Code Review**: Simplifies review process for maintainers
- **Debugging**: Helps track down when and why bugs were introduced
- **Documentation**: Creates an automatic changelog of changes
- **Collaboration**: Makes it easier for teams to work together

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

The type must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes to build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope (Optional)

The scope provides additional contextual information about what part of the codebase was affected:

- **opencode**: Core OpenCode package
- **app**: Web application
- **desktop**: Desktop application
- **console**: Console components
- **plugin**: Plugin system
- **sdk**: SDK packages
- **docs**: Documentation
- **api**: API changes

### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Keep it under 50 characters

### Body (Optional)

The body should include:

- Motivation for the change
- Contrast with previous behavior
- More detailed explanation if needed

Wrap the body at 72 characters.

### Footer (Optional)

The footer should contain:

- References to issues: `Fixes #123`, `Closes #456`, `Refs #789`
- Breaking changes: Start with `BREAKING CHANGE:` followed by description

## Examples

### Simple Feature

```
feat(app): add dark mode toggle

Adds a toggle button in the settings panel to switch between light and dark themes.
The preference is saved to local storage.

Closes #234
```

### Bug Fix

```
fix(opencode): resolve memory leak in WebSocket handler

Properly cleanup event listeners when WebSocket connections are closed.
This prevents memory accumulation during long-running sessions.

Fixes #567
```

### Documentation Update

```
docs: update installation instructions for Windows

Add detailed steps for Windows installation including:
- PowerShell execution policy setup
- Scoop installation method
- Chocolatey installation method
```

### Breaking Change

```
feat(api)!: change authentication endpoint structure

Restructure authentication endpoints to support multiple auth providers.

BREAKING CHANGE: The /auth/login endpoint now requires a 'provider' field.
Old format: POST /auth/login { username, password }
New format: POST /auth/login { provider, credentials }

Migration guide: https://docs.opencode.ai/migration/v2-auth

Refs #890
```

### Refactoring

```
refactor(opencode): simplify file operation logic

Extract common file operations into utility functions.
No functional changes, improves code organization and reduces duplication.
```

### Performance Improvement

```
perf(opencode): optimize file watching mechanism

Reduce CPU usage by implementing debouncing for file system events.
Improves performance when working with large projects.

Benchmark results show 40% reduction in CPU usage during active development.

Closes #456
```

### Multiple Changes

```
feat(opencode): enhance LSP integration

- Add support for Go language server (gopls)
- Improve error handling for LSP initialization
- Add configuration options for LSP timeout

Closes #123, #124, #125
```

## Best Practices

### DO

✅ **Write clear, descriptive messages**
```
feat(app): add user profile page with avatar upload
```

✅ **Use present tense**
```
fix(api): handle null values in user query
```

✅ **Reference issues**
```
Fixes #123
```

✅ **Explain WHY, not just WHAT**
```
refactor(opencode): use Map instead of Object for session storage

Maps provide better performance for frequent insertions/deletions
and avoid prototype pollution issues.
```

✅ **Keep subject line concise**
```
docs: update README installation section
```

### DON'T

❌ **Vague messages**
```
fix: stuff
update: changes
```

❌ **Past tense**
```
fixed the bug
added new feature
```

❌ **Overly long subject**
```
feat: this commit adds a really comprehensive and fully-featured user authentication system with JWT tokens
```

❌ **Mix multiple unrelated changes**
```
feat: add dark mode, fix typos, update dependencies, refactor tests
```

❌ **Generic messages**
```
update
fix bug
changes
wip
```

## Commit Frequency

### When to Commit

- Commit logical units of work
- Commit when tests pass
- Commit before switching tasks
- Commit at natural breakpoints

### How Often

- Commit frequently in feature branches
- Squash or rebase before merging to main/dev
- Each commit should be reviewable
- Keep atomic commits (one logical change per commit)

## Branching Strategy

### Branch Naming

```
<type>/<short-description>

Examples:
feat/dark-mode
fix/websocket-memory-leak
docs/api-documentation
refactor/agent-system
```

### Branch Types

- `feat/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation changes
- `refactor/*`: Code refactoring
- `test/*`: Test additions/modifications
- `chore/*`: Maintenance tasks

## Git Workflow

### Standard Workflow

1. Create a feature branch from `dev`
```bash
git checkout dev
git pull origin dev
git checkout -b feat/my-feature
```

2. Make changes and commit
```bash
git add .
git commit -m "feat(app): add new feature"
```

3. Keep branch up to date
```bash
git fetch origin
git rebase origin/dev
```

4. Push to remote
```bash
git push origin feat/my-feature
```

5. Create Pull Request to `dev` branch

### Commit Amending

Fix the last commit:
```bash
git add .
git commit --amend
```

### Interactive Rebase

Clean up commit history before PR:
```bash
git rebase -i HEAD~3  # Rebase last 3 commits
```

Options:
- `pick`: Keep commit as-is
- `reword`: Change commit message
- `squash`: Combine with previous commit
- `fixup`: Like squash but discard commit message
- `drop`: Remove commit

## Pre-commit Checks

Before committing, ensure:

1. ✅ Code is formatted (`bun run format`)
2. ✅ Linting passes
3. ✅ Tests pass (`bun test`)
4. ✅ No console.log statements (unless intentional)
5. ✅ No sensitive data (API keys, passwords)
6. ✅ Commit message follows guidelines

## Tools and Automation

### Husky Git Hooks

The project uses Husky for git hooks:

- **pre-commit**: Runs formatting and linting
- **commit-msg**: Validates commit message format

### Commitizen (Optional)

Install Commitizen for interactive commit messages:

```bash
npm install -g commitizen
git cz  # Instead of git commit
```

### Conventional Changelog

Automatically generate changelogs from commit messages:

```bash
npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)

## Getting Help

If you're unsure about commit messages:

1. Look at recent commits for examples: `git log --oneline -20`
2. Check the project's commit history
3. Ask in Discord or GitHub discussions
4. Review this guide

## Review Process

Maintainers will check:

- Commit message follows guidelines
- Commits are atomic and logical
- History is clean (no "wip" or "fix typo" commits in PR)
- References to issues are included

If needed, maintainers may request you to:

- Rewrite commit messages
- Squash commits
- Split large commits
- Add missing references

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information about contributing to OpenCode.

---

Remember: Good commit messages make everyone's life easier, including your future self!
