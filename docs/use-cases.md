# Use Cases and Testing Prompts

This guide provides practical use cases, example prompts, and testing scenarios for OpenCode.

## Table of Contents

- [Common Use Cases](#common-use-cases)
- [Example Prompts for OpenCode](#example-prompts-for-opencode)
- [Testing Scenarios](#testing-scenarios)
- [Enterprise Use Cases](#enterprise-use-cases)
- [Advanced Workflows](#advanced-workflows)

## Common Use Cases

### 1. Code Review and Refactoring

**Scenario**: You have legacy code that needs modernization.

**Prompt**:
```
Review the authentication module in src/auth/ and suggest improvements for:
- Security vulnerabilities
- Performance optimizations
- Code readability
- TypeScript best practices
```

**Expected Outcome**: OpenCode analyzes the code and provides specific recommendations with code examples.

### 2. Bug Investigation

**Scenario**: Users report intermittent crashes.

**Prompt**:
```
Investigate the memory leak in the WebSocket connection handler.
Check src/server/websocket.ts for potential issues with:
- Event listener cleanup
- Connection pooling
- Resource disposal
```

**Expected Outcome**: OpenCode identifies the issue and suggests fixes with proper cleanup patterns.

### 3. Feature Implementation

**Scenario**: Need to add a new feature following project standards.

**Prompt**:
```
Implement a rate limiting middleware for API endpoints following the existing patterns in src/middleware/. 
Requirements:
- Support per-user and per-IP limits
- Use Redis for distributed rate limiting
- Include comprehensive tests
- Follow the project style guide
```

**Expected Outcome**: Complete implementation with tests and documentation.

### 4. Documentation Generation

**Scenario**: Code lacks proper documentation.

**Prompt**:
```
Generate comprehensive JSDoc comments for all exported functions in src/utils/string-helpers.ts.
Include:
- Function description
- Parameter types and descriptions
- Return type and description
- Usage examples
```

**Expected Outcome**: Well-documented code with clear examples.

### 5. Test Coverage Improvement

**Scenario**: Need to increase test coverage.

**Prompt**:
```
Create comprehensive unit tests for src/services/user-service.ts covering:
- Happy path scenarios
- Edge cases (null, undefined, empty values)
- Error handling
- Async operations
Follow the testing patterns in existing test files.
```

**Expected Outcome**: Complete test suite with good coverage.

## Example Prompts for OpenCode

### Code Generation

#### Basic Function
```
Create a TypeScript function that validates email addresses using regex.
Include proper type annotations and handle edge cases.
```

#### API Endpoint
```
Add a new REST API endpoint GET /api/v1/projects/:id/statistics that:
- Returns project statistics (commits, contributors, issues)
- Includes proper error handling
- Uses our existing database queries
- Follows the pattern in src/api/routes/projects.ts
```

#### Database Schema
```
Create a new Drizzle ORM schema for a "notifications" table with fields:
- id (primary key)
- user_id (foreign key to users)
- message (text)
- read (boolean)
- created_at (timestamp)
Follow our snake_case convention for field names.
```

### Code Analysis

#### Performance Analysis
```
Analyze the performance of the file processing pipeline in src/processors/.
Identify bottlenecks and suggest optimizations for:
- I/O operations
- Memory usage
- Concurrent processing
```

#### Security Audit
```
Perform a security audit of the authentication flow:
- Check for SQL injection vulnerabilities
- Verify input sanitization
- Review session management
- Identify potential XSS risks
```

#### Architecture Review
```
Review the current microservices architecture and suggest improvements for:
- Service boundaries
- Communication patterns
- Data consistency
- Scalability concerns
```

### Debugging

#### Error Investigation
```
Debug the "Maximum call stack size exceeded" error occurring in:
src/components/RecursiveTree.tsx when rendering deeply nested structures.
Suggest fixes to prevent stack overflow.
```

#### Type Error Resolution
```
Fix the TypeScript type errors in src/types/api.ts related to:
- Generic type constraints
- Union type narrowing
- Conditional types
Ensure type safety is maintained.
```

#### Memory Leak Detection
```
Investigate memory leaks in the long-running background job processor.
Check for:
- Unclosed database connections
- Event listener leaks
- Circular references
- Large object retention
```

### Refactoring

#### Code Simplification
```
Refactor src/utils/data-transformer.ts to:
- Remove code duplication
- Improve readability
- Enhance type safety
- Follow functional programming principles
Maintain existing behavior and tests.
```

#### Pattern Application
```
Convert the callback-based API in src/services/file-service.ts to use async/await.
Ensure proper error handling and maintain backward compatibility.
```

#### Component Extraction
```
Extract reusable components from src/pages/Dashboard.tsx:
- UserCard component
- StatisticsPanel component  
- ActionButtons component
Follow our component structure in src/components/.
```

## Testing Scenarios

### Unit Testing

#### Test Scenario 1: String Utilities
```
Test the slug generation function:
- Input: "Hello World!" → Output: "hello-world"
- Input: "TypeScript & JavaScript" → Output: "typescript-javascript"
- Input: "  Extra  Spaces  " → Output: "extra-spaces"
- Input: "" → Output: ""
- Input: null → Should throw or handle gracefully
```

#### Test Scenario 2: Date Formatting
```
Test date formatting across timezones:
- ISO string to local format
- Timezone conversions
- Daylight saving time handling
- Invalid date handling
```

#### Test Scenario 3: Validation Functions
```
Test email validation:
- Valid: "user@example.com"
- Valid: "user+tag@example.co.uk"
- Invalid: "invalid.email"
- Invalid: "@example.com"
- Invalid: "user@"
```

### Integration Testing

#### Test Scenario 4: API Endpoints
```bash
# Test user creation flow
curl -X POST http://localhost:4096/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# Expected: 201 Created with user object
# Test duplicate email
curl -X POST http://localhost:4096/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Another User", "email": "test@example.com"}'

# Expected: 409 Conflict
```

#### Test Scenario 5: Database Operations
```
Test user CRUD operations:
1. Create user with valid data
2. Read user by ID
3. Update user profile
4. Delete user
5. Verify cascading deletes (user's related data)
```

#### Test Scenario 6: WebSocket Communication
```
Test real-time messaging:
1. Client connects to WebSocket
2. Server acknowledges connection
3. Client sends message
4. Server broadcasts to all clients
5. Clients receive message
6. Client disconnects cleanly
```

### End-to-End Testing

#### Test Scenario 7: Complete User Journey
```
1. User opens OpenCode TUI
2. User creates a new file
3. User writes code with syntax highlighting
4. User switches to plan agent (Tab key)
5. User asks for code review
6. Agent provides feedback
7. User applies suggestions
8. User runs tests
9. Tests pass successfully
```

#### Test Scenario 8: Web Interface Workflow
```
1. Open web interface in browser
2. Create new project
3. Upload files
4. Run code analysis
5. View results in dashboard
6. Export report
7. Share project link
```

## Enterprise Use Cases

### 1. Code Migration

**Scenario**: Migrate from JavaScript to TypeScript

**Prompt**:
```
Convert the JavaScript modules in src/legacy/ to TypeScript:
- Add proper type annotations
- Update imports/exports
- Fix type errors
- Maintain existing functionality
- Add tests for type safety
Process files in order of dependencies.
```

### 2. API Documentation

**Scenario**: Generate OpenAPI documentation

**Prompt**:
```
Generate OpenAPI 3.0 specification for all REST endpoints in src/api/.
Include:
- Request/response schemas
- Authentication requirements
- Error responses
- Example requests
Export to openapi.json
```

### 3. Security Hardening

**Scenario**: Prepare for security audit

**Prompt**:
```
Perform security hardening on the application:
1. Audit all user inputs for validation
2. Review authentication/authorization logic
3. Check for exposed secrets or credentials
4. Verify HTTPS enforcement
5. Review dependency vulnerabilities
Generate a security report with findings and fixes.
```

### 4. Performance Optimization

**Scenario**: Application is slow under load

**Prompt**:
```
Optimize the application for high-traffic scenarios:
- Profile database queries and add indexes
- Implement caching strategy (Redis)
- Optimize API response times
- Add request batching
- Implement lazy loading for large datasets
Measure improvements with benchmarks.
```

### 5. CI/CD Pipeline

**Scenario**: Automate deployment process

**Prompt**:
```
Create a complete CI/CD pipeline:
- GitHub Actions workflow for tests
- Automated linting and formatting checks
- Security scanning
- Docker image building
- Deployment to staging/production
- Rollback procedures
Include configuration files and documentation.
```

## Advanced Workflows

### 1. Multi-Agent Collaboration

**Scenario**: Complex refactoring with validation

```
# Using build agent
Switch to build agent
"Refactor the authentication module to use JWT tokens instead of sessions"

# Switch to plan agent (Tab key)
"Review the refactored authentication code for security issues"

# Switch back to build agent
"Apply the security recommendations from the review"
```

### 2. Iterative Development

**Scenario**: Feature development with testing

```
Step 1: "Create a user profile component with basic fields"
Step 2: "Add form validation to the profile component"
Step 3: "Create unit tests for the profile component"
Step 4: "Add integration tests for the profile update flow"
Step 5: "Generate documentation for the profile component"
```

### 3. Debugging Complex Issues

**Scenario**: Multi-layered bug investigation

```
Step 1: "Investigate why the user profile page is loading slowly"
Step 2: "Based on findings, optimize the database queries"
Step 3: "Add performance monitoring to track improvements"
Step 4: "Create a test to prevent performance regressions"
```

### 4. Code Quality Improvement

**Scenario**: Systematic quality enhancement

```
Step 1: "Analyze code quality metrics for src/services/"
Step 2: "Refactor functions with high cyclomatic complexity"
Step 3: "Add missing error handling"
Step 4: "Improve test coverage to 80%"
Step 5: "Update documentation for public APIs"
```

## Best Practices for Prompts

### Be Specific

❌ **Vague**: "Fix the bugs"
✅ **Specific**: "Fix the null pointer exception in getUserProfile() when user.address is undefined"

### Provide Context

❌ **Without context**: "Add logging"
✅ **With context**: "Add structured logging to the payment processing flow using Winston, log at INFO level for successful payments and ERROR level for failures"

### Specify Constraints

❌ **Open-ended**: "Improve performance"
✅ **With constraints**: "Improve database query performance by adding indexes, ensure queries complete in < 100ms for datasets up to 10,000 records"

### Request Validation

❌ **No validation**: "Create the feature"
✅ **With validation**: "Create the feature and verify it works by running the existing test suite, add new tests for the new functionality"

## Measuring Success

### Key Metrics

1. **Code Quality**
   - Test coverage percentage
   - Linting errors count
   - Type safety coverage

2. **Performance**
   - Response times
   - Memory usage
   - Build times

3. **Developer Productivity**
   - Time to implement features
   - Bug fix turnaround time
   - Code review cycle time

4. **User Experience**
   - Task completion rate
   - Error frequency
   - User satisfaction scores

## Resources

- [OpenCode Documentation](https://opencode.ai/docs)
- [GitHub Copilot Guide](./github-copilot-guide.md)
- [Testing Guide](./testing-guide.md)
- [Local Setup Guide](./local-setup.md)

## Contributing Your Use Cases

Found a great use case? Share it with the community:

1. Open an issue with the "use-case" label
2. Include the scenario, prompt, and outcome
3. Add any relevant code examples
4. Tag it with appropriate categories

Your contributions help everyone use OpenCode more effectively!
