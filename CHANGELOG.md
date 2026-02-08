# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enterprise repository setup with comprehensive documentation
- Local development setup guide in `/docs/local-setup.md`
- GitHub Copilot integration guide in `/docs/github-copilot-guide.md`
- Comprehensive testing guide in `/docs/testing-guide.md`
- Use cases and testing prompts in `/docs/use-cases.md`
- Architecture documentation in `/docs/architecture.md`
- Code of Conduct (CODE_OF_CONDUCT.md)
- Commit guidelines (COMMIT_GUIDELINES.md)
- Environment configuration templates (.env.example, .env.local.example)
- GitHub Copilot instructions file (.github/copilot-instructions.md)

### Changed
- Enhanced repository structure for enterprise usage
- Improved documentation organization

### Fixed
- N/A

## [0.1.x] - Previous Releases

For previous release notes, see the [releases page](https://github.com/abhilashjaiswal0110/opencode/releases).

---

## How to Use This Changelog

### For Contributors

When making changes, add entries under the "Unreleased" section using these categories:

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security vulnerability fixes

### For Maintainers

When releasing a new version:

1. Create a new version section with the release date
2. Move items from "Unreleased" to the new version section
3. Update the version links at the bottom
4. Tag the release in Git

### Example Entry Format

```markdown
### Added
- Brief description of what was added [#PR_NUMBER](link-to-pr)

### Fixed
- Brief description of bug fix [#ISSUE_NUMBER](link-to-issue)
```

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: Backwards-compatible functionality additions
- **PATCH** version: Backwards-compatible bug fixes

### Links

[Unreleased]: https://github.com/abhilashjaiswal0110/opencode/compare/v0.1.x...HEAD
